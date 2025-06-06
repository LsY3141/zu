const db = require('../config/db');

// 변환 작업 생성 (수정됨 - userId, filename, fileUrl 추가)
const createTranscriptionJob = async (data) => {
  const { userId, filename, fileUrl, jobId, status = 'PENDING' } = data;
  
  const sql = `
    INSERT INTO transcriptions 
    (user_id, filename, file_url, job_id, status) 
    VALUES (?, ?, ?, ?, ?)
  `;
  
  try {
    const result = await db.query(sql, [userId, filename, fileUrl, jobId, status]);
    console.log('transcriptionModel.createTranscriptionJob 성공:', result.insertId);
    return result.insertId;
  } catch (error) {
    console.error('transcriptionModel.createTranscriptionJob 오류:', error);
    throw error;
  }
};

// 작업 상태 업데이트
const updateTranscriptionStatus = async (jobId, status, progress = 0) => {
  const sql = `
    UPDATE transcriptions 
    SET status = ?, progress = ?, updated_at = CURRENT_TIMESTAMP
    WHERE job_id = ?
  `;
  
  try {
    const result = await db.query(sql, [status, progress, jobId]);
    console.log('transcriptionModel.updateTranscriptionStatus 성공:', jobId, status, progress);
    return result.affectedRows > 0;
  } catch (error) {
    console.error('transcriptionModel.updateTranscriptionStatus 오류:', error);
    throw error;
  }
};

// 작업 ID로 조회
const getTranscriptionByJobId = async (jobId) => {
  const sql = 'SELECT * FROM transcriptions WHERE job_id = ?';
  
  try {
    const transcriptions = await db.query(sql, [jobId]);
    console.log('transcriptionModel.getTranscriptionByJobId 조회:', jobId, transcriptions.length > 0 ? '발견' : '없음');
    return transcriptions[0]; // 첫 번째 결과 반환
  } catch (error) {
    console.error('transcriptionModel.getTranscriptionByJobId 오류:', error);
    throw error;
  }
};

// 변환 결과 저장
const saveTranscriptionResults = async (transcriptionId, data) => {
  const { text, summary = null } = data;
  
  const sql = `
    INSERT INTO transcription_results
    (transcription_id, text, summary, created_at)
    VALUES (?, ?, ?, NOW())
  `;
  
  try {
    const result = await db.query(sql, [transcriptionId, text, summary]);
    console.log('transcriptionModel.saveTranscriptionResults 성공:', transcriptionId, '텍스트 길이:', text?.length || 0);
    return result.insertId;
  } catch (error) {
    console.error('transcriptionModel.saveTranscriptionResults 오류:', error);
    throw error;
  }
};

// 화자 구분 저장 (수정됨 - SQL 구문 오류 해결)
const saveSpeakerSegments = async (transcriptionId, speakers) => {
  if (!speakers || speakers.length === 0) {
    console.log('transcriptionModel.saveSpeakerSegments: 저장할 화자 구분 데이터가 없습니다.');
    return true;
  }

  // 개별 INSERT로 변경 (MySQL 호환성)
  const sql = `
    INSERT INTO speaker_segments
    (transcription_id, speaker_id, text, created_at)
    VALUES (?, ?, ?, NOW())
  `;
  
  try {
    for (const speaker of speakers) {
      await db.query(sql, [transcriptionId, speaker.id, speaker.text]);
    }
    console.log('transcriptionModel.saveSpeakerSegments 성공:', speakers.length, '개 화자 데이터 저장');
    return true;
  } catch (error) {
    console.error('transcriptionModel.saveSpeakerSegments 오류:', error);
    throw error;
  }
};

// 핵심 문구 저장 (수정됨 - SQL 구문 오류 해결)
const saveKeyPhrases = async (transcriptionId, phrases) => {
  if (!phrases || phrases.length === 0) {
    console.log('transcriptionModel.saveKeyPhrases: 저장할 핵심 문구가 없습니다.');
    return true;
  }

  // 개별 INSERT로 변경 (MySQL 호환성)
  const sql = `
    INSERT INTO key_phrases
    (transcription_id, phrase, created_at)
    VALUES (?, ?, NOW())
  `;
  
  try {
    for (const phrase of phrases) {
      await db.query(sql, [transcriptionId, phrase]);
    }
    console.log('transcriptionModel.saveKeyPhrases 성공:', phrases.length, '개 핵심 문구 저장');
    return true;
  } catch (error) {
    console.error('transcriptionModel.saveKeyPhrases 오류:', error);
    throw error;
  }
};

// 번역 결과 저장
const saveTranslation = async (transcriptionId, language, text) => {
  const sql = `
    INSERT INTO translations
    (transcription_id, language, text, created_at)
    VALUES (?, ?, ?, NOW())
  `;
  
  try {
    const result = await db.query(sql, [transcriptionId, language, text]);
    console.log('transcriptionModel.saveTranslation 성공:', language, '번역 저장');
    return result.insertId;
  } catch (error) {
    console.error('transcriptionModel.saveTranslation 오류:', error);
    throw error;
  }
};

// 변환 결과 조회 (텍스트와 요약)
const getTranscriptionResults = async (transcriptionId) => {
  const sql = `
    SELECT * FROM transcription_results 
    WHERE transcription_id = ?
    ORDER BY created_at DESC
    LIMIT 1
  `;
  
  try {
    const results = await db.query(sql, [transcriptionId]);
    console.log('transcriptionModel.getTranscriptionResults 조회:', transcriptionId, results.length > 0 ? '발견' : '없음');
    return results[0];
  } catch (error) {
    console.error('transcriptionModel.getTranscriptionResults 오류:', error);
    throw error;
  }
};

// 화자 구분 결과 조회
const getSpeakerSegments = async (transcriptionId) => {
  const sql = `
    SELECT * FROM speaker_segments 
    WHERE transcription_id = ?
    ORDER BY id ASC
  `;
  
  try {
    const segments = await db.query(sql, [transcriptionId]);
    console.log('transcriptionModel.getSpeakerSegments 조회:', transcriptionId, segments.length, '개 화자 세그먼트');
    return segments;
  } catch (error) {
    console.error('transcriptionModel.getSpeakerSegments 오류:', error);
    throw error;
  }
};

// 핵심 문구 조회
const getKeyPhrases = async (transcriptionId) => {
  const sql = `
    SELECT phrase FROM key_phrases 
    WHERE transcription_id = ?
    ORDER BY created_at ASC
  `;
  
  try {
    const phrases = await db.query(sql, [transcriptionId]);
    console.log('transcriptionModel.getKeyPhrases 조회:', transcriptionId, phrases.length, '개 핵심 문구');
    return phrases.map(p => p.phrase);
  } catch (error) {
    console.error('transcriptionModel.getKeyPhrases 오류:', error);
    throw error;
  }
};

// 번역 결과 조회
const getTranslation = async (transcriptionId, language) => {
  const sql = `
    SELECT * FROM translations 
    WHERE transcription_id = ? AND language = ?
    ORDER BY created_at DESC
    LIMIT 1
  `;
  
  try {
    const translations = await db.query(sql, [transcriptionId, language]);
    console.log('transcriptionModel.getTranslation 조회:', transcriptionId, language, translations.length > 0 ? '발견' : '없음');
    return translations[0];
  } catch (error) {
    console.error('transcriptionModel.getTranslation 오류:', error);
    throw error;
  }
};

// 사용자별 변환 히스토리 조회
const getTranscriptionHistory = async (userId, limit = 50) => {
  const sql = `
    SELECT t.*, tr.text, tr.summary, n.title as note_title
    FROM transcriptions t
    LEFT JOIN transcription_results tr ON t.id = tr.transcription_id
    LEFT JOIN notes n ON t.note_id = n.id
    WHERE EXISTS (
      SELECT 1 FROM notes n2 WHERE n2.id = t.note_id AND n2.user_id = ?
    ) OR t.note_id IS NULL
    ORDER BY t.created_at DESC
    LIMIT ?
  `;
  
  try {
    const history = await db.query(sql, [userId, limit]);
    console.log('transcriptionModel.getTranscriptionHistory 조회:', userId, history.length, '개 히스토리');
    return history;
  } catch (error) {
    console.error('transcriptionModel.getTranscriptionHistory 오류:', error);
    throw error;
  }
};

module.exports = {
  createTranscriptionJob,
  updateTranscriptionStatus,
  getTranscriptionByJobId,
  saveTranscriptionResults,
  saveSpeakerSegments,
  saveKeyPhrases,
  saveTranslation,
  getTranscriptionResults,
  getSpeakerSegments,
  getKeyPhrases,
  getTranslation,
  getTranscriptionHistory
};
