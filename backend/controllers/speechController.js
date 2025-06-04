const { v4: uuidv4 } = require('uuid');
const s3Service = require('../services/s3Service');
const transcribeService = require('../services/transcribeService');
const comprehendService = require('../services/comprehendService');
const translateService = require('../services/translateService');
const db = require('../config/db');

// 음성 파일 업로드
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
    
    // DB에 변환 작업 정보 저장
    console.log('DB에 변환 작업 정보 저장 시도...');
    try {
      // 이 부분은 실제 DB 연동이 되어 있으면 사용, 아니면 주석 처리
      /*
      const transcriptionId = await TranscriptionModel.createTranscriptionJob({
        userId: req.user.id,
        filename: req.file.originalname,
        fileUrl,
        jobId: transcribeResult.jobId,
        status: transcribeResult.status
      });
      console.log('DB에 변환 작업 정보 저장 성공, ID:', transcriptionId);
      */
    } catch (dbError) {
      console.error('DB 저장 오류:', dbError);
      // DB 오류는 무시하고 진행 (테스트 목적)
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

// 변환 작업 상태 확인

exports.checkTranscriptionStatus = async (req, res) => {
  console.log('변환 작업 상태 확인 컨트롤러 시작');
  try {
    const { jobId } = req.params;
    console.log('확인할 작업 ID:', jobId);
    
    // AWS Transcribe 작업 상태 확인
    const jobStatus = await transcribeService.getTranscriptionJob(jobId);
    console.log('조회된 작업 상태:', jobStatus);
    
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
      results: null
    };
    
    // 작업이 완료되었으면 결과 가져오기
    if (jobStatus.status === 'COMPLETED' && jobStatus.url) {
      console.log('작업 완료됨, 결과 가져오기 시도:', jobStatus.url);
      try {
        const results = await transcribeService.getTranscriptionResults(jobStatus.url);
        response.results = results;
        console.log('변환 결과 가져오기 성공:', {
          textLength: results.text ? results.text.length : 0,
          speakersCount: results.speakers ? results.speakers.length : 0
        });
      } catch (resultError) {
        console.error('결과 가져오기 오류:', resultError);
        // 결과 가져오기 실패해도 완료 상태는 전달
        response.job.status = 'COMPLETED';
        response.job.progress = 100;
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
    
    // 테스트를 위한 임시 텍스트 (실제로는 DB에서 가져와야 함)
    const text = "이것은 음성 텍스트 변환 결과입니다. AWS Transcribe 서비스로 변환된 텍스트를 AWS Comprehend 서비스로 분석하고, AWS Translate 서비스로 번역할 수 있습니다. 이 기능을 통해 음성 노트를 텍스트로 변환하고, 중요한 개념을 추출하며, 필요한 경우 다른 언어로 번역할 수 있습니다.";
    
    // 변환 작업 정보 가져오기 (실제 DB 연동 시 사용)
    /*
    const transcription = await TranscriptionModel.getTranscriptionByJobId(transcriptionId);
    
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
    */
    
    const analysis = {};
    
    // 텍스트 요약
    if (summary) {
      console.log('텍스트 요약 시작');
      const summaryText = await comprehendService.summarizeText(text);
      analysis.summary = summaryText;
      console.log('요약 생성 완료:', summaryText);
      
      // DB에 요약 결과 업데이트 (실제 DB 연동 시 사용)
      /*
      await db.query(
        'UPDATE transcription_results SET summary = ? WHERE id = ?',
        [summaryText, transcriptionResults[0].id]
      );
      console.log('DB에 요약 저장됨');
      */
    }
    
    // 핵심 문구 추출
    if (keyPhrases) {
      console.log('핵심 문구 추출 시작');
      const phrases = await comprehendService.extractKeyPhrases(text);
      analysis.keyPhrases = phrases;
      console.log('핵심 문구 추출 완료:', phrases);
      
      // DB에 핵심 문구 저장 (실제 DB 연동 시 사용)
      /*
      // 기존 핵심 문구 삭제
      await db.query(
        'DELETE FROM key_phrases WHERE transcription_id = ?',
        [transcription.id]
      );
      
      // 새 핵심 문구 저장
      if (phrases.length > 0) {
        await TranscriptionModel.saveKeyPhrases(transcription.id, phrases);
      }
      console.log('DB에 핵심 문구 저장됨');
      */
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

// 변환된 텍스트 번역
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
    
    // 테스트를 위한 임시 텍스트 (실제로는 DB에서 가져와야 함)
    const text = "이것은 음성 텍스트 변환 결과입니다. AWS Transcribe 서비스로 변환된 텍스트를 AWS Comprehend 서비스로 분석하고, AWS Translate 서비스로 번역할 수 있습니다. 이 기능을 통해 음성 노트를 텍스트로 변환하고, 중요한 개념을 추출하며, 필요한 경우 다른 언어로 번역할 수 있습니다.";
    
    // 변환 작업 정보 가져오기 (실제 DB 연동 시 사용)
    /*
    const transcription = await TranscriptionModel.getTranscriptionByJobId(transcriptionId);
    
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
    
    // 이미 번역된 결과가 있는지 확인
    const existingTranslation = await db.query(
      'SELECT * FROM translations WHERE transcription_id = ? AND language = ?',
      [transcription.id, targetLanguage]
    );
    */
    
    let translatedText;
    
    // 테스트: 이미 번역된 결과가 없다고 가정
    const existingTranslation = [];
    
    if (existingTranslation.length > 0) {
      console.log('기존 번역 결과 사용');
      translatedText = existingTranslation[0].text;
    } else {
      console.log('새 번역 시작');
      const translationResult = await translateService.translateText(text, targetLanguage);
      translatedText = translationResult.translatedText;
      console.log('번역 완료:', {
        sourceLanguage: translationResult.sourceLanguage,
        targetLanguage: translationResult.targetLanguage,
        translatedTextLength: translatedText.length
      });
      
      // 번역 결과 저장 (실제 DB 연동 시 사용)
      /*
      await TranscriptionModel.saveTranslation(
        transcription.id,
        targetLanguage,
        translatedText
      );
      console.log('DB에 번역 결과 저장됨');
      */
    }
    
    console.log('텍스트 번역 완료, 응답 전송');
    res.status(200).json({
      success: true,
      message: '텍스트 번역이 완료되었습니다.',
      targetLanguage,
      translation: translatedText
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

// 변환 결과를 노트로 저장
exports.saveTranscriptionAsNote = async (req, res) => {
  console.log('노트 저장 컨트롤러 시작');
  try {
    const { transcriptionId } = req.params;
    const { title, content, category, tags = [] } = req.body;
    
    console.log('저장할 변환 ID:', transcriptionId);
    console.log('노트 데이터:', { title, content, category, tags });
    
    // 필수 필드 검증
    if (!title || !content) {
      console.error('필수 필드 누락');
      return res.status(400).json({
        success: false,
        message: '제목과 내용은 필수 항목입니다.'
      });
    }
    
    // 테스트를 위한 임시 응답 (실제로는 DB 연동 필요)
    console.log('노트 저장 완료 (테스트 모드)');
    res.status(201).json({
      success: true,
      message: '음성 노트가 성공적으로 저장되었습니다.',
      noteId: uuidv4() // 테스트용 임시 ID
    });
    
    // 실제 DB 연동 시 사용할 코드
    /*
    // 변환 작업 정보 가져오기
    const transcription = await TranscriptionModel.getTranscriptionByJobId(transcriptionId);
    
    if (!transcription) {
      console.error('변환 작업을 찾을 수 없음');
      return res.status(404).json({
        success: false,
        message: '변환 작업을 찾을 수 없습니다.'
      });
    }
    
    // S3에서 서명된 URL로 오디오 파일에 접근할 수 있는 경로 생성
    const audioUrl = await s3Service.getSignedUrl(transcription.file_url, 24 * 60 * 60);
    
    // 노트 데이터 구성
    const noteData = {
      userId: req.user.id,
      title,
      content,
      category: category || '기본',
      isVoice: true,
      audioUrl,
      transcription: {
        id: transcription.id,
        jobId: transcription.job_id
      }
    };
    
    // 노트 생성
    const noteId = await NoteModel.createNote(noteData);
    
    // 태그 처리
    if (tags.length > 0) {
      await NoteModel.addTagsToNote(noteId, tags);
    }
    
    // 노트와 변환 작업 연결
    await db.query(
      'UPDATE transcriptions SET note_id = ? WHERE id = ?',
      [noteId, transcription.id]
    );
    
    // 사용자의 통계 업데이트 (노트 수 증가)
    await db.query(
      'UPDATE users SET total_notes = total_notes + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [req.user.id]
    );
    
    // 음성 처리 시간 계산 및 사용자 통계 업데이트
    const audioDuration = calculateAudioDuration(transcription);
    if (audioDuration > 0) {
      await db.query(
        'UPDATE users SET speech_processing_minutes = speech_processing_minutes + ? WHERE id = ?',
        [audioDuration / 60, req.user.id] // 초를 분으로 변환
      );
      
      // 월간 통계 업데이트
      const yearMonth = new Date().toISOString().slice(0, 7); // YYYY-MM 형식
      await db.query(
        `INSERT INTO monthly_usage (user_id, year_month, notes_count, speech_minutes)
         VALUES (?, ?, 1, ?)
         ON DUPLICATE KEY UPDATE 
           notes_count = notes_count + 1,
           speech_minutes = speech_minutes + ?,
           updated_at = CURRENT_TIMESTAMP`,
        [req.user.id, yearMonth, audioDuration / 60, audioDuration / 60]
      );
    }
    
    console.log('노트 저장 완료, DB 업데이트됨');
    res.status(201).json({
      success: true,
      message: '음성 노트가 성공적으로 저장되었습니다.',
      noteId
    });
    */
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
    
    // 테스트를 위한 임시 데이터
    const history = [
      {
        id: 1,
        job_id: 'job-123456789',
        status: 'COMPLETED',
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7일 전
        text: '이것은 테스트 음성 변환 결과입니다.',
        summary: '테스트 요약입니다.'
      },
      {
        id: 2,
        job_id: 'job-987654321',
        status: 'COMPLETED',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2일 전
        text: '두 번째 테스트 음성 변환 결과입니다.',
        summary: '두 번째 테스트 요약입니다.'
      }
    ];
    
    console.log('테스트 히스토리 생성됨:', history.length, '개 항목');
    
    // 실제 DB 연동 시 사용할 코드
    /*
    const sql = `
      SELECT t.*, tr.text, tr.summary
      FROM transcriptions t
      LEFT JOIN transcription_results tr ON t.id = tr.transcription_id
      WHERE t.user_id = ?
      ORDER BY t.created_at DESC
    `;
    
    const history = await db.query(sql, [userId]);
    console.log('DB에서 히스토리 조회됨:', history.length, '개 항목');
    */
    
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
