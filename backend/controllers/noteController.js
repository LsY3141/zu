const NoteModel = require('../models/noteModel');
const UserModel = require('../models/userModel');
const db = require('../config/db');

// 노트 생성
exports.createNote = async (req, res) => {
  try {
    const { title, content, category, tags = [] } = req.body;
    
    // 기본 검증
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: '제목과 내용은 필수 항목입니다.'
      });
    }
    
    // 노트 생성
    const noteData = {
      userId: req.user.id,
      title,
      content,
      category: category || '기본',
      isVoice: false,
      audioUrl: null
    };
    
    const noteId = await NoteModel.createNote(noteData);
    
    // 태그 처리
    if (tags.length > 0) {
      await NoteModel.addTagsToNote(noteId, tags);
    }
    
    // 사용자 노트 수 통계 업데이트
    try {
      await UserModel.updateUsageStats(req.user.id, { notesIncrement: 1 });
    } catch (statsError) {
      console.error('사용자 통계 업데이트 오류:', statsError);
      // 통계 업데이트 실패해도 노트 생성은 계속 진행
    }
    
    // 생성된 노트 조회
    const note = await NoteModel.getNoteById(noteId, req.user.id);
    
    if (!note) {
      return res.status(404).json({
        success: false,
        message: '생성된 노트를 찾을 수 없습니다.'
      });
    }
    
    // MySQL 결과를 프론트엔드 형식에 맞게 변환 (DB에 이미 한국 시간으로 저장됨)
    const formattedNote = {
      _id: note.id.toString(),
      title: note.title,
      content: note.content,
      category: note.category,
      isVoice: note.is_voice === 1,
      audioUrl: note.audio_url,
      tags: note.tags || [],
      createdAt: note.created_at, // DB에 이미 한국 시간으로 저장되어 있음
      updatedAt: note.updated_at   // DB에 이미 한국 시간으로 저장되어 있음
    };
    
    res.status(201).json({
      success: true,
      message: '노트가 성공적으로 생성되었습니다.',
      note: formattedNote
    });
  } catch (error) {
    console.error('노트 생성 오류:', error);
    res.status(500).json({
      success: false,
      message: '노트 생성 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};

// 노트 목록 조회 (개선된 검색 로직 - searchText 파라미터 대응)
exports.getNotes = async (req, res) => {
  try {
    // searchText와 search 둘 다 확인 (호환성)
    const { searchText, search, category, sortBy, sortOrder, page, limit, isDeleted } = req.query;
    
    // searchText 또는 search 중 하나라도 있으면 사용
    const searchQuery = searchText || search || '';
    
    // 검색어 전처리 (공백 제거 및 빈 문자열 처리)
    const processedSearch = searchQuery ? searchQuery.trim() : '';
    
    // SQL 인젝션 방지 및 유효성 검사
    const validSortBy = ['title', 'content', 'created_at', 'updated_at', 'category'].includes(sortBy) 
      ? sortBy 
      : 'created_at';
    
    const validSortOrder = ['ASC', 'DESC', 'asc', 'desc'].includes(sortOrder) 
      ? sortOrder.toUpperCase() 
      : 'DESC';
    
    // 데이터 타입 확실히 변환
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const isDeletedBool = isDeleted === 'true';
    
    const options = {
      search: processedSearch, // 내부적으로는 search로 통일
      category: category || '',
      sortBy: validSortBy,
      sortOrder: validSortOrder,
      page: pageNum,
      limit: limitNum,
      isDeleted: isDeletedBool
    };
    
    const notes = await NoteModel.getNotes(req.user.id, options);
    
    // MySQL 결과를 프론트엔드 형식에 맞게 변환
    const formattedNotes = notes.map(note => {
      return {
        _id: note.id.toString(),
        title: note.title,
        content: note.content,
        category: note.category,
        isVoice: note.is_voice === 1,
        audioUrl: note.audio_url,
        tags: note.tags || [],
        createdAt: note.created_at, // DB에 이미 한국 시간으로 저장되어 있음
        updatedAt: note.updated_at,  // DB에 이미 한국 시간으로 저장되어 있음
        deletedAt: note.deleted_at   // 삭제된 노트인 경우
      };
    });
    
    // 총 노트 수 카운트 (페이지네이션을 위함) - 개선된 카운트 쿼리
    let countSql = `
      SELECT COUNT(*) as total FROM notes 
      WHERE user_id = ? AND is_deleted = ?
    `;
    const countParams = [req.user.id, isDeletedBool ? 1 : 0];
    
    // 검색 조건이 있을 때 카운트 쿼리에도 동일한 조건 적용
    if (processedSearch) {
      countSql += ` AND (
        title COLLATE utf8mb4_unicode_ci LIKE ? OR 
        content COLLATE utf8mb4_unicode_ci LIKE ? OR
        EXISTS (
          SELECT 1 FROM note_tags nt 
          JOIN tags t ON nt.tag_id = t.id 
          WHERE nt.note_id = notes.id AND t.name COLLATE utf8mb4_unicode_ci LIKE ?
        )
      )`;
      const searchPattern = `%${processedSearch}%`;
      countParams.push(searchPattern, searchPattern, searchPattern);
    }
    
    if (options.category && options.category !== '전체' && options.category.trim()) {
      countSql += ' AND category = ?';
      countParams.push(options.category);
    }
    
    const countResult = await db.query(countSql, countParams);
    const total = countResult[0]?.total || 0;
    
    res.status(200).json({
      success: true,
      notes: formattedNotes,
      total,
      page: options.page,
      limit: options.limit
    });
  } catch (error) {
    console.error('노트 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '노트 목록 조회 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};


// 노트 상세 조회
exports.getNoteById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const note = await NoteModel.getNoteById(id, req.user.id);
    
    if (!note) {
      return res.status(404).json({
        success: false,
        message: '노트를 찾을 수 없습니다.'
      });
    }
    
    // MySQL 결과를 프론트엔드 형식에 맞게 변환
    const formattedNote = {
      _id: note.id.toString(),
      title: note.title,
      content: note.content,
      category: note.category,
      isVoice: note.is_voice === 1,
      audioUrl: note.audio_url,
      tags: note.tags || [],
      createdAt: note.created_at,
      updatedAt: note.updated_at
    };

    // ✅ 로그 추가
    console.log('🔍 노트 기본 정보:', {
      id: formattedNote._id,
      title: formattedNote.title,
      isVoice: formattedNote.isVoice,
      is_voice_raw: note.is_voice
    });
    
    // ✅ 음성 노트인 경우 분석 결과 조회
    if (formattedNote.isVoice) {
      console.log('🔍 음성 노트 감지 - 분석 결과 조회 시작, noteId:', id);
      
      try {
        // 단계별로 쿼리 실행하여 디버깅
        
        // 1. transcriptions 테이블에서 연결된 transcription 찾기
        const transcriptionQuery = `
          SELECT id FROM transcriptions WHERE note_id = ?
        `;
        const transcriptions = await db.query(transcriptionQuery, [id]);
        console.log('📋 연결된 transcription:', transcriptions.length, '개');
        
        if (transcriptions.length > 0) {
          const transcriptionId = transcriptions[0].id;
          console.log('🎯 transcription ID:', transcriptionId);
          
          // 2. 요약 조회
          const summaryQuery = `
            SELECT summary FROM transcription_results WHERE transcription_id = ?
          `;
          const summaryResult = await db.query(summaryQuery, [transcriptionId]);
          console.log('📊 요약 조회 결과:', summaryResult.length, '개');
          if (summaryResult.length > 0 && summaryResult[0].summary) {
            formattedNote.summary = summaryResult[0].summary;
            console.log('✅ 요약 데이터 설정됨:', formattedNote.summary.substring(0, 50));
          }
          
          // 3. 키워드 조회
          const keywordsQuery = `
            SELECT phrase FROM key_phrases WHERE transcription_id = ?
          `;
          const keywordResults = await db.query(keywordsQuery, [transcriptionId]);
          console.log('🔍 키워드 조회 결과:', keywordResults.length, '개');
          if (keywordResults.length > 0) {
            const keywords = keywordResults.map(k => k.phrase).join(', ');
            formattedNote.keywords = keywords;
            console.log('✅ 키워드 데이터 설정됨:', keywords);
          }
          
          // 4. 번역 조회 (컬럼명 수정)
          const translationQuery = `
            SELECT * FROM translations WHERE transcription_id = ?
          `;
          const translationResults = await db.query(translationQuery, [transcriptionId]);
          console.log('🌍 번역 조회 결과:', translationResults.length, '개');
          console.log('🌍 번역 컬럼 확인:', translationResults[0]); // 실제 컬럼명 확인

          if (translationResults.length > 0 && translationResults[0].text) {
            formattedNote.translation = translationResults[0].text;
            // target_language 대신 language 컬럼 사용
            formattedNote.translationLanguage = translationResults[0].language;
            console.log('🌍 번역 데이터 설정됨:', translationResults[0].text.substring(0, 50));
          }
        }
        
        console.log('🎉 최종 음성 노트 데이터:', {
          hasSummary: !!formattedNote.summary,
          hasKeywords: !!formattedNote.keywords,
          hasTranslation: !!formattedNote.translation
        });
        
      } catch (analysisError) {
        console.error('❌ 음성 분석 결과 조회 오류:', analysisError);
        // 분석 결과 조회 실패해도 기본 노트 정보는 반환
      }
    } else {
      console.log('❌ 음성 노트가 아님 - 분석 결과 조회 스킵');
    }
    
    res.status(200).json({
      success: true,
      note: formattedNote
    });
  } catch (error) {
    console.error('노트 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '노트 조회 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};


// 노트 수정 함수 권한 체크 추가
exports.updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category, tags = [] } = req.body;
    
    // 노트 존재 여부 및 권한 확인
    const existingNote = await NoteModel.getNoteById(id, req.user.id);
    
    if (!existingNote) {
      return res.status(404).json({
        success: false,
        message: '노트를 찾을 수 없거나 수정 권한이 없습니다.'
      });
    }
    
    // 공유받은 노트는 수정 불가
    if (existingNote.isShared && !existingNote.isOwner) {
      return res.status(403).json({
        success: false,
        message: '공유받은 노트는 수정할 수 없습니다.'
      });
    }
    
    // 노트 업데이트 (updated_at만 변경됨)
    await NoteModel.updateNote(id, { title, content, category });
    
    // 태그 업데이트
    await NoteModel.updateNoteTags(id, tags);
    
    // 업데이트된 노트 조회
    const updatedNote = await NoteModel.getNoteById(id, req.user.id);
    
    // MySQL 결과를 프론트엔드 형식에 맞게 변환
    const formattedNote = {
      _id: updatedNote.id.toString(),
      title: updatedNote.title,
      content: updatedNote.content,
      category: updatedNote.category,
      isVoice: updatedNote.is_voice === 1,
      audioUrl: updatedNote.audio_url,
      tags: updatedNote.tags || [],
      createdAt: updatedNote.created_at,
      updatedAt: updatedNote.updated_at
    };
    
    res.status(200).json({
      success: true,
      message: '노트가 성공적으로 수정되었습니다.',
      note: formattedNote
    });
  } catch (error) {
    console.error('노트 수정 오류:', error);
    res.status(500).json({
      success: false,
      message: '노트 수정 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};

// 노트 삭제 (휴지통으로 이동)
exports.moveNoteToTrash = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 노트 존재 여부 및 권한 확인
    const existingNote = await NoteModel.getNoteById(id, req.user.id);
    
    if (!existingNote) {
      return res.status(404).json({
        success: false,
        message: '노트를 찾을 수 없거나 삭제 권한이 없습니다.'
      });
    }

    // 공유받은 노트는 삭제 불가
    if (existingNote.isShared && !existingNote.isOwner) {
      return res.status(403).json({
        success: false,
        message: '공유받은 노트는 삭제할 수 없습니다.'
      });
    }
    
    // 이미 삭제된 노트인지 확인
    if (existingNote.is_deleted) {
      return res.status(400).json({
        success: false,
        message: '이미 삭제된 노트입니다.'
      });
    }
    
    // 노트를 휴지통으로 이동
    await NoteModel.moveNoteToTrash(id);
    
    res.status(200).json({
      success: true,
      message: '노트가 휴지통으로 이동되었습니다.',
      id: id
    });
  } catch (error) {
    console.error('노트 삭제 오류:', error);
    res.status(500).json({
      success: false,
      message: '노트 삭제 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};

// 노트 영구 삭제 - includeDeleted 옵션 추가
exports.deleteNotePermanently = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 삭제된 노트도 포함해서 조회 (includeDeleted = true)
    const existingNote = await NoteModel.getNoteById(id, req.user.id, true);
    
    if (!existingNote) {
      return res.status(404).json({
        success: false,
        message: '노트를 찾을 수 없거나 삭제 권한이 없습니다.'
      });
    }
    
    // 노트가 휴지통에 있는지 확인
    if (!existingNote.is_deleted) {
      return res.status(400).json({
        success: false,
        message: '휴지통에 있는 노트만 영구 삭제할 수 있습니다.'
      });
    }
    
    await NoteModel.deleteNotePermanently(id);
    
    res.status(200).json({
      success: true,
      message: '노트가 영구적으로 삭제되었습니다.',
      id: existingNote.id.toString()
    });
  } catch (error) {
    console.error('노트 영구 삭제 오류:', error);
    res.status(500).json({
      success: false,
      message: '노트 영구 삭제 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};

// 노트 복원 - includeDeleted 옵션 추가
exports.restoreNote = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 삭제된 노트도 포함해서 조회 (includeDeleted = true)
    const existingNote = await NoteModel.getNoteById(id, req.user.id, true);
    
    if (!existingNote) {
      return res.status(404).json({
        success: false,
        message: '노트를 찾을 수 없거나 복원 권한이 없습니다.'
      });
    }
    
    // 노트가 휴지통에 있는지 확인
    if (!existingNote.is_deleted) {
      return res.status(400).json({
        success: false,
        message: '이미 복원된 노트입니다.'
      });
    }
    
    // 노트 복원 (원본 created_at, updated_at 완전 보존)
    await NoteModel.restoreNote(id);
    
    // 복원된 노트 조회 - 이제는 일반 조회 (includeDeleted = false)
    const restoredNote = await NoteModel.getNoteById(id, req.user.id, false);
    
    // MySQL 결과를 프론트엔드 형식에 맞게 변환
    const formattedNote = {
      _id: restoredNote.id.toString(),
      title: restoredNote.title,
      content: restoredNote.content,
      category: restoredNote.category,
      isVoice: restoredNote.is_voice === 1,
      audioUrl: restoredNote.audio_url,
      tags: restoredNote.tags || [],
      createdAt: restoredNote.created_at,
      updatedAt: restoredNote.updated_at
    };
    
    console.log('노트 복원 완료 - 원본 날짜 완전 보존됨');
    
    res.status(200).json({
      success: true,
      message: '노트가 성공적으로 복원되었습니다.',
      note: formattedNote,
      id: formattedNote._id
    });
  } catch (error) {
    console.error('노트 복원 오류:', error);
    res.status(500).json({
      success: false,
      message: '노트 복원 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};

// 공유된 노트 조회
exports.getSharedNotes = async (req, res) => {
  try {
    const notes = await NoteModel.getSharedNotes(req.user.id);
    
    // MySQL 결과를 프론트엔드 형식에 맞게 변환
    const formattedNotes = notes.map(note => {
      return {
        _id: note.id.toString(),
        title: note.title,
        content: note.content,
        category: note.category,
        isVoice: note.is_voice === 1,
        audioUrl: note.audio_url,
        tags: note.tags || [],
        createdAt: note.created_at, // DB에 이미 한국 시간으로 저장되어 있음
        updatedAt: note.updated_at,  // DB에 이미 한국 시간으로 저장되어 있음
        shared: note.shared // 이미 프론트엔드 형식으로 처리됨
      };
    });
    
    res.status(200).json({
      success: true,
      notes: formattedNotes
    });
  } catch (error) {
    console.error('공유된 노트 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '공유된 노트 조회 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};

// 노트 공유
exports.shareNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;
    
    // 노트 존재 여부 및 소유권 확인
    const existingNote = await NoteModel.getNoteById(id, req.user.id);
    
    if (!existingNote) {
      return res.status(404).json({
        success: false,
        message: '노트를 찾을 수 없거나 공유 권한이 없습니다.'
      });
    }
    
    // 사용자 찾기 (email로)
    const targetUser = await UserModel.findByEmail(email);
    
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: '공유하려는 사용자를 찾을 수 없습니다.'
      });
    }
    
    // 공유 링크 생성 (실제로는 난수 생성 등의 로직이 필요)
    const shareLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/shared/${id}`;
    
    // 공유 정보 저장
    await NoteModel.shareNote(id, req.user.id, targetUser.id, shareLink);
    
    // 노트 정보에 공유 정보 추가
    const updatedNote = {
      ...existingNote,
      shared: {
        sharedWith: [{ id: targetUser.id, username: targetUser.username }],
        shareLink
      }
    };
    
    // MySQL 결과를 프론트엔드 형식에 맞게 변환
    const formattedNote = {
      _id: updatedNote.id.toString(),
      title: updatedNote.title,
      content: updatedNote.content,
      category: updatedNote.category,
      isVoice: updatedNote.is_voice === 1,
      audioUrl: updatedNote.audio_url,
      tags: updatedNote.tags || [],
      createdAt: updatedNote.created_at, // DB에 이미 한국 시간으로 저장되어 있음
      updatedAt: updatedNote.updated_at,  // DB에 이미 한국 시간으로 저장되어 있음
      shared: updatedNote.shared
    };
    
    res.status(200).json({
      success: true,
      message: '노트가 성공적으로 공유되었습니다.',
      note: formattedNote
    });
  } catch (error) {
    console.error('노트 공유 오류:', error);
    res.status(500).json({
      success: false,
      message: '노트 공유 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};
