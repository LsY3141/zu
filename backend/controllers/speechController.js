const { v4: uuidv4 } = require('uuid');
const s3Service = require('../services/s3Service');
const transcribeService = require('../services/transcribeService');
const comprehendService = require('../services/comprehendService');
const translateService = require('../services/translateService');
const transcriptionModel = require('../models/transcriptionModel');
const NoteModel = require('../models/noteModel');
const db = require('../config/db');

// 음성 파일 업로드 (수정됨 - DB 저장 정보 추가)
exports.uploadSpeechFile = async (req, res) => {
  console.log('음성 파일 업로드 컨트롤러 시작');
  try {
    if (!req.file) {
      console.error('업로드된 파일 없음');
      return res.status(400).json({
        success: false,
        message: '파일이 제공되지 않았습니다.'
      });
    }
    
    console.log('업로드된 파일 정보:', {
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      location: req.file.location,
      key: req.file.key
    });
    
    // S3에 업로드된 파일의 위치와 키 가져오기
    const fileUrl = req.file.location;
    const fileKey = req.file.key;
    
    // 사용자 정보 로깅
    console.log('요청 사용자 정보:', req.user);
    
    // AWS Transcribe 작업 시작
    console.log('Transcribe 작업 시작 시도...');
    const mediaFormat = req.file.originalname.split('.').pop().toLowerCase();
    console.log('미디어 형식:', mediaFormat);
    
    const transcribeResult = await transcribeService.startTranscriptionJob(fileUrl, {
      mediaFormat: mediaFormat,
      showSpeakerLabels: true
    });
    
    console.log('Transcribe 작업 생성 결과:', transcribeResult);
    
    // DB에 변환 작업 정보 저장 (수정됨 - 파일 정보 포함)
    console.log('DB에 변환 작업 정보 저장 시도...');
    try {
      const transcriptionId = await transcriptionModel.createTranscriptionJob({
        userId: req.user.id,                    // 추가
        filename: req.file.originalname,        // 추가
        fileUrl: fileUrl,                       // 추가 (S3 URL)
        jobId: transcribeResult.jobId,
        status: transcribeResult.status
      });
      console.log('DB에 변환 작업 정보 저장 성공, ID:', transcriptionId);
    } catch (dbError) {
      console.error('DB 저장 오류:', dbError);
      // DB 오류 시 에러 응답 반환
      return res.status(500).json({
        success: false,
        message: 'DB 저장 중 오류가 발생했습니다.',
        error: dbError.message
      });
    }
    
    console.log('파일 업로드 및 Transcribe 작업 생성 완료');
    res.status(200).json({
      success: true,
      message: '파일이 성공적으로 업로드되었습니다.',
      file: {
        name: req.file.originalname,
        url: fileUrl,
        key: fileKey
      },
      job: {
        id: transcribeResult.jobId,
        status: transcribeResult.status
      }
    });
  } catch (error) {
    console.error('음성 파일 업로드 오류:', error);
    console.error('오류 스택:', error.stack);
    res.status(500).json({
      success: false,
      message: '파일 업로드 중 오류가 발생했습니다.',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// 변환 작업 상태 확인 (단순화된 버전)
exports.checkTranscriptionStatus = async (req, res) => {
  console.log('변환 작업 상태 확인 컨트롤러 시작');
  try {
    const { jobId } = req.params;
    console.log('확인할 작업 ID:', jobId);
    
    // AWS Transcribe 작업 상태 확인
    const jobStatus = await transcribeService.getTranscriptionJob(jobId);
    console.log('조회된 작업 상태:', jobStatus);
    
    // DB에서 변환 작업 정보 가져오기
    const transcription = await transcriptionModel.getTranscriptionByJobId(jobId);
    if (transcription) {
      // DB의 상태 업데이트
      await transcriptionModel.updateTranscriptionStatus(jobId, jobStatus.status, jobStatus.progress);
    }
    
    // 응답 객체 구성
    const response = {
      success: true,
      job: {
        id: jobId,
        status: jobStatus.status,
        progress: jobStatus.progress || 0,
        createdAt: jobStatus.createdAt,
        completedAt: jobStatus.completedAt
      },
      results: null // 초기에는 null
    };
    

// 작업이 완료되었으면 결과 가져오기
if (jobStatus.status === 'COMPLETED' && jobStatus.url) {
  console.log('작업 완료됨, 결과 가져오기 시도:', jobStatus.url);
  try {
    const results = await transcribeService.getTranscriptionResults(jobStatus.url);
    response.results = results;
    response.job.status = 'COMPLETED';
    response.job.progress = 100;
    
    // DB에 변환 결과 저장
    if (transcription && results?.text) {
      await transcriptionModel.saveTranscriptionResults(transcription.id, {
        text: results.text,
        summary: null
      });
      
      // 화자 구분 결과 저장
      if (results.speakers && results.speakers.length > 0) {
        await transcriptionModel.saveSpeakerSegments(transcription.id, results.speakers);
      }

      // ✅ 추가: 변환 완료 후 자동으로 분석 실행
      console.log('🔥 변환 완료 - 자동 분석 시작');
      try {
        const comprehendService = require('../services/comprehendService');
        
        // 요약 생성
        const summaryText = await comprehendService.summarizeText(results.text);
        console.log('✅ 요약 생성 완료:', summaryText?.substring(0, 100));
        
        // 키워드 추출
        const phrases = await comprehendService.extractKeyPhrases(results.text);
        console.log('✅ 키워드 추출 완료:', phrases?.slice(0, 5));
        
        // DB에 분석 결과 저장
        if (summaryText) {
          await db.query(
            'UPDATE transcription_results SET summary = ? WHERE transcription_id = ?',
            [summaryText, transcription.id]
          );
        }
        
        if (phrases && phrases.length > 0) {
          // 기존 키워드 삭제 후 새로 저장
          await db.query('DELETE FROM key_phrases WHERE transcription_id = ?', [transcription.id]);
          await transcriptionModel.saveKeyPhrases(transcription.id, phrases);
        }
        
        console.log('🎉 자동 분석 완료');
      } catch (analysisError) {
        console.error('자동 분석 실패:', analysisError);
        // 분석 실패해도 변환 결과는 반환
      }
    }
    
    console.log('변환 결과 가져오기 및 DB 저장 성공:', {
      textLength: results.text ? results.text.length : 0,
      speakersCount: results.speakers ? results.speakers.length : 0
    });
  } catch (resultError) {
    console.error('결과 가져오기 오류:', resultError);
    response.job.status = 'COMPLETED';
    response.job.progress = 100;
    response.results = null;
  }
}
    
    console.log('최종 응답:', response);
    res.status(200).json(response);
    
  } catch (error) {
    console.error('변환 작업 상태 확인 오류:', error);
    res.status(500).json({
      success: false,
      message: '변환 작업 상태 확인 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};

// 변환된 텍스트 분석 (요약 및 핵심 개념 추출)
exports.analyzeTranscription = async (req, res) => {
  console.log('텍스트 분석 컨트롤러 시작');
  try {
    const { transcriptionId } = req.params;
    const { summary = true, keyPhrases = true } = req.body;
    
    console.log('분석할 변환 ID:', transcriptionId);
    console.log('분석 옵션:', { summary, keyPhrases });
    
    // 변환 작업 정보 가져오기
    const transcription = await transcriptionModel.getTranscriptionByJobId(transcriptionId);
    
    if (!transcription) {
      console.error('변환 작업을 찾을 수 없음');
      return res.status(404).json({
        success: false,
        message: '변환 작업을 찾을 수 없습니다.'
      });
    }
    
    // 변환 결과 가져오기
    const transcriptionResults = await db.query(
      'SELECT * FROM transcription_results WHERE transcription_id = ?',
      [transcription.id]
    );
    
    if (!transcriptionResults.length) {
      console.error('변환 결과를 찾을 수 없음');
      return res.status(404).json({
        success: false,
        message: '변환 결과를 찾을 수 없습니다.'
      });
    }
    
    const text = transcriptionResults[0].text;
    const analysis = {};
    
    // 텍스트 요약
    if (summary) {
      console.log('텍스트 요약 시작');
      const summaryText = await comprehendService.summarizeText(text);
      analysis.summary = summaryText;
      console.log('요약 생성 완료:', summaryText);
      
      // DB에 요약 결과 업데이트
      await db.query(
        'UPDATE transcription_results SET summary = ? WHERE id = ?',
        [summaryText, transcriptionResults[0].id]
      );
      console.log('DB에 요약 저장됨');
    }
    
    // 핵심 문구 추출
    if (keyPhrases) {
      console.log('핵심 문구 추출 시작');
      const phrases = await comprehendService.extractKeyPhrases(text);
      analysis.keyPhrases = phrases;
      console.log('핵심 문구 추출 완료:', phrases);
      
      // 기존 핵심 문구 삭제
      await db.query(
        'DELETE FROM key_phrases WHERE transcription_id = ?',
        [transcription.id]
      );
      
      // 새 핵심 문구 저장
      if (phrases.length > 0) {
        await transcriptionModel.saveKeyPhrases(transcription.id, phrases);
      }
      console.log('DB에 핵심 문구 저장됨');
    }
    
    console.log('텍스트 분석 완료, 응답 전송');
    res.status(200).json({
      success: true,
      message: '텍스트 분석이 완료되었습니다.',
      analysis
    });
  } catch (error) {
    console.error('텍스트 분석 오류:', error);
    console.error('오류 스택:', error.stack);
    res.status(500).json({
      success: false,
      message: '텍스트 분석 중 오류가 발생했습니다.',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// speechController.js - translateTranscription 함수 (기존 DB 구조 유지)

// 변환된 텍스트 번역 (기존 DB 구조에 맞게 수정)
exports.translateTranscription = async (req, res) => {
  console.log('텍스트 번역 컨트롤러 시작');
  try {
    const { transcriptionId } = req.params;
    const { targetLanguage } = req.body;
    
    console.log('번역할 변환 ID:', transcriptionId);
    console.log('타겟 언어:', targetLanguage);
    
    if (!targetLanguage) {
      console.error('타겟 언어가 지정되지 않음');
      return res.status(400).json({
        success: false,
        message: '번역할 언어를 지정해주세요.'
      });
    }
    
    // 변환 작업 정보 가져오기
    const transcription = await transcriptionModel.getTranscriptionByJobId(transcriptionId);
    
    if (!transcription) {
      console.error('변환 작업을 찾을 수 없음');
      return res.status(404).json({
        success: false,
        message: '변환 작업을 찾을 수 없습니다.'
      });
    }
    
    // 변환 결과 가져오기
    const transcriptionResults = await db.query(
      'SELECT * FROM transcription_results WHERE transcription_id = ?',
      [transcription.id]
    );
    
    if (!transcriptionResults.length) {
      console.error('변환 결과를 찾을 수 없음');
      return res.status(404).json({
        success: false,
        message: '변환 결과를 찾을 수 없습니다.'
      });
    }
    
    const text = transcriptionResults[0].text;
    
    // 텍스트가 너무 짧은 경우 체크
    if (!text || text.trim().length < 10) {
      console.error('번역할 텍스트가 너무 짧음');
      return res.status(400).json({
        success: false,
        message: '번역할 텍스트가 너무 짧습니다.'
      });
    }
    
    // 이미 번역된 결과가 있는지 확인 (기존 DB 구조 사용)
    const existingTranslation = await db.query(
      'SELECT * FROM translations WHERE transcription_id = ? AND language = ?',
      [transcription.id, targetLanguage]
    );
    
    let translationResult;
    
    if (existingTranslation.length > 0) {
      console.log('기존 번역 결과 사용');
      translationResult = {
        translatedText: existingTranslation[0].text,
        sourceLanguage: 'auto', // 기존 DB에 source_language가 없으면 기본값
        targetLanguage: targetLanguage
      };
    } else {
      console.log('새 번역 시작');
      try {
        translationResult = await translateService.translateText(text, targetLanguage);
        console.log('번역 완료:', {
          sourceLanguage: translationResult.sourceLanguage,
          targetLanguage: translationResult.targetLanguage,
          translatedTextLength: translationResult.translatedText.length
        });
        
        // 번역 결과 저장 (기존 DB 구조 사용)
        await transcriptionModel.saveTranslation(
          transcription.id,
          targetLanguage,
          translationResult.translatedText
        );
        console.log('DB에 번역 결과 저장됨');
      } catch (translationError) {
        console.error('번역 서비스 오류:', translationError);
        return res.status(500).json({
          success: false,
          message: '번역 중 오류가 발생했습니다. 다시 시도해주세요.',
          error: translationError.message
        });
      }
    }
    
    console.log('텍스트 번역 완료, 응답 전송');
    res.status(200).json({
      success: true,
      message: '텍스트 번역이 완료되었습니다.',
      translatedText: translationResult.translatedText,
      sourceLanguage: translationResult.sourceLanguage,
      targetLanguage: translationResult.targetLanguage,
      originalTextLength: text.length,
      translatedTextLength: translationResult.translatedText.length
    });
  } catch (error) {
    console.error('텍스트 번역 오류:', error);
    console.error('오류 스택:', error.stack);
    res.status(500).json({
      success: false,
      message: '텍스트 번역 중 오류가 발생했습니다.',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};



// 변환 결과를 노트로 저장 (수정됨 - 번역 컬럼명 수정)
exports.saveTranscriptionAsNote = async (req, res) => {
  console.log('노트 저장 컨트롤러 시작');
  try {
    // URL 파라미터가 아닌 body에서 transcriptionId 가져오기
    const { 
      transcriptionId, 
      title, 
      content, 
      summary, 
      keywords, 
      translation, 
      targetLanguage,
      category, 
      tags = [] 
    } = req.body;
    
    console.log('🔍 받은 요청 데이터:', { 
      transcriptionId,
      title, 
      contentLength: content?.length || 0,
      summaryLength: summary?.length || 0,
      keywordsLength: keywords?.length || 0,
      translationLength: translation?.length || 0,
      targetLanguage,
      category, 
      tags 
    });
    
    // transcriptionId 필수 검증 추가
    if (!transcriptionId) {
      console.error('transcriptionId 누락');
      return res.status(400).json({
        success: false,
        message: 'transcriptionId는 필수 항목입니다.'
      });
    }
    
    // 변환 작업 정보 가져오기
    const transcription = await transcriptionModel.getTranscriptionByJobId(transcriptionId);
    
    if (!transcription) {
      console.error('변환 작업을 찾을 수 없음');
      return res.status(404).json({
        success: false,
        message: '변환 작업을 찾을 수 없습니다.'
      });
    }
    
    // 생성할 노트 데이터 구성
    const noteData = {
      userId: req.user.id,
      title: title || '음성 노트',
      content: content || '',
      category: category || '음성',
      isVoice: true,
      audioUrl: transcription.audio_url
    };
    
    console.log('노트 생성 데이터:', noteData);
    
    // 노트 생성
    const noteId = await NoteModel.createNote(noteData);
    console.log('노트 생성 완료, 노트 ID:', noteId);
    
    // 태그 추가
    if (tags && tags.length > 0) {
      await NoteModel.addTagsToNote(noteId, tags);
      console.log('태그 추가 완료');
    }
    
    // ✅ 분석 결과 저장
    try {
      console.log('🔍 분석 결과 저장 시작');
      
      // 1. 요약 저장
      if (summary && summary.trim()) {
        console.log('✅ 요약 저장 중...', summary.substring(0, 100));
        await db.query(
          'UPDATE transcription_results SET summary = ? WHERE transcription_id = ?',
          [summary.trim(), transcription.id]
        );
        console.log('✅ 요약 저장 완료');
      } else {
        console.log('❌ 요약 데이터 없음');
      }
      
      // 2. 키워드 저장
      if (keywords && keywords.trim()) {
        console.log('✅ 키워드 저장 중...', keywords);
        // 기존 키워드 삭제
        await db.query(
          'DELETE FROM key_phrases WHERE transcription_id = ?',
          [transcription.id]
        );
        
        // 새 키워드 저장
        const keywordList = keywords.split(',').map(k => k.trim()).filter(k => k);
        if (keywordList.length > 0) {
          await transcriptionModel.saveKeyPhrases(transcription.id, keywordList);
          console.log('✅ 키워드 저장 완료:', keywordList.length, '개');
        }
      } else {
        console.log('❌ 키워드 데이터 없음');
      }
      
      // 3. 번역 결과 저장 (컬럼명 수정)
      if (translation && translation.trim()) {
        console.log('🌍 번역 저장 중...', translation.substring(0, 100));
        console.log('🌍 타겟 언어:', targetLanguage);
        
        // 기존 번역 삭제
        await db.query(
          'DELETE FROM translations WHERE transcription_id = ?',
          [transcription.id]
        );
        
        // 새 번역 저장 (target_language 컬럼 제거)
        if (targetLanguage) {
          await db.query(
            'INSERT INTO translations (transcription_id, language, text, created_at) VALUES (?, ?, ?, NOW())',
            [transcription.id, targetLanguage, translation.trim()]
          );
          console.log('🌍 번역 저장 완료');
        }
      } else {
        console.log('🌍 번역 데이터 없음');
      }
      
      // ✅ 저장 후 확인 로그 추가
      console.log('🔍 저장 후 DB 확인 시작');
      
      // 요약 확인
      const summaryCheck = await db.query(
        'SELECT summary FROM transcription_results WHERE transcription_id = ?',
        [transcription.id]
      );
      console.log('📊 요약 확인:', summaryCheck[0]?.summary ? '저장됨' : '없음');
      
      // 키워드 확인
      const keywordCheck = await db.query(
        'SELECT phrase FROM key_phrases WHERE transcription_id = ?',
        [transcription.id]
      );
      console.log('🔍 키워드 확인:', keywordCheck.length, '개');
      
      // 번역 확인
      const translationCheck = await db.query(
        'SELECT text FROM translations WHERE transcription_id = ?',
        [transcription.id]
      );
      console.log('🌍 번역 확인:', translationCheck[0]?.text ? '저장됨' : '없음');
      
    } catch (analysisError) {
      console.error('❌ 분석 결과 저장 오류:', analysisError);
      // 분석 결과 저장 실패해도 노트 생성은 계속 진행
    }
    
    // 변환 작업과 노트 연결
    await db.query(
      'UPDATE transcriptions SET note_id = ? WHERE id = ?',
      [noteId, transcription.id]
    );
    console.log('변환 작업과 노트 연결 완료');
    
    // 사용자의 통계 업데이트 (노트 수 증가)
    await db.query(
      'UPDATE users SET total_notes = total_notes + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [req.user.id]
    );
    console.log('사용자 통계 업데이트 완료');
    
    console.log('노트 저장 컨트롤러 완료');
    res.status(201).json({
      success: true,
      message: '노트가 성공적으로 저장되었습니다.',
      noteId: noteId,
      note: {
        id: noteId,
        title: noteData.title,
        category: noteData.category,
        isVoice: noteData.isVoice,
        audioUrl: noteData.audioUrl,
        hasSummary: !!summary,
        hasKeywords: !!keywords,
        hasTranslation: !!translation
      }
    });
  } catch (error) {
    console.error('노트 저장 오류:', error);
    console.error('오류 스택:', error.stack);
    res.status(500).json({
      success: false,
      message: '노트 저장 중 오류가 발생했습니다.',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};


// 오디오 파일 길이 계산 (초 단위)
const calculateAudioDuration = (transcription) => {
  try {
    console.log('오디오 파일 길이 계산 시도');
    // 음성 길이 정보가 있으면 사용
    if (transcription.audio_duration) {
      console.log('저장된 오디오 길이 사용:', transcription.audio_duration);
      return transcription.audio_duration;
    }
    
    // 변환에 걸린 시간을 기준으로 추정
    if (transcription.created_at && transcription.updated_at) {
      const start = new Date(transcription.created_at);
      const end = new Date(transcription.updated_at);
      const processingTime = (end - start) / 1000; // 초 단위
      
      // 일반적으로 AWS Transcribe는 실시간 처리보다 빠르므로
      // 처리 시간의 약 3배를 오디오 길이로 추정 (경험적 수치)
      const estimatedDuration = Math.round(processingTime * 3);
      console.log('추정된 오디오 길이:', estimatedDuration, '초');
      return estimatedDuration;
    }
    
    console.log('오디오 길이를 계산할 수 없음, 0 반환');
    return 0;
  } catch (error) {
    console.error('오디오 길이 계산 오류:', error);
    return 0;
  }
};

// 음성 변환 작업 히스토리 조회
exports.getSpeechHistory = async (req, res) => {
  console.log('음성 변환 히스토리 조회 컨트롤러 시작');
  try {
    const userId = req.user.id;
    console.log('사용자 ID:', userId);
    
    const sql = `
      SELECT t.*, tr.text, tr.summary, n.title as note_title
      FROM transcriptions t
      LEFT JOIN transcription_results tr ON t.id = tr.transcription_id
      LEFT JOIN notes n ON t.note_id = n.id
      WHERE EXISTS (
        SELECT 1 FROM notes n2 WHERE n2.id = t.note_id AND n2.user_id = ?
      ) OR t.note_id IS NULL
      ORDER BY t.created_at DESC
    `;
    
    const history = await db.query(sql, [userId]);
    console.log('DB에서 히스토리 조회됨:', history.length, '개 항목');
    
    console.log('음성 변환 히스토리 조회 완료, 응답 전송');
    res.status(200).json({
      success: true,
      history
    });
  } catch (error) {
    console.error('음성 변환 히스토리 조회 오류:', error);
    console.error('오류 스택:', error.stack);
    res.status(500).json({
      success: false,
      message: '음성 변환 히스토리 조회 중 오류가 발생했습니다.',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
