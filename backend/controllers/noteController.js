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
      createdAt: note.created_at, // DB에 이미 한국 시간으로 저장되어 있음
      updatedAt: note.updated_at   // DB에 이미 한국 시간으로 저장되어 있음
    };
    
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

// noteController.js - 노트 수정 함수 권한 체크 추가
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

// 노트 삭제 함수도 마찬가지로 수정
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

// 노트 영구 삭제
exports.deleteNotePermanently = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 노트 존재 여부 및 소유권 확인
    const existingNote = await NoteModel.getNoteById(id, req.user.id);
    
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
      id: existingNote.id.toString() // MongoDB 스타일로 변환하여 제공
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

// 노트 복원 - 완전한 날짜 보존
exports.restoreNote = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 복원 전 노트 정보 확인
    const existingNote = await NoteModel.getNoteById(id, req.user.id);
    
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
    
    // 복원된 노트 조회 - 원본 날짜가 그대로 유지되어야 함
    const restoredNote = await NoteModel.getNoteById(id, req.user.id);
    
    // MySQL 결과를 프론트엔드 형식에 맞게 변환
    const formattedNote = {
      _id: restoredNote.id.toString(),
      title: restoredNote.title,
      content: restoredNote.content,
      category: restoredNote.category,
      isVoice: restoredNote.is_voice === 1,
      audioUrl: restoredNote.audio_url,
      tags: restoredNote.tags || [],
      createdAt: restoredNote.created_at, // 원본 생성일 완전 보존 (DB에 이미 한국 시간)
      updatedAt: restoredNote.updated_at  // 원본 수정일 완전 보존 (DB에 이미 한국 시간)
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