const db = require('../config/db');

// 변환 작업 생성 (실제 테이블 구조에 맞게)
const createTranscriptionJob = async (data) => {
  const { jobId, status = 'IN_PROGRESS' } = data;
  
  const sql = `
    INSERT INTO transcriptions 
    (job_id, status, progress, created_at, updated_at) 
    VALUES (?, ?, 0, NOW(), NOW())
  `;
  
  try {
    const result = await db.query(sql, [jobId, status]);
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
    SET status = ?, progress = ?, updated_at = NOW()
    WHERE job_id = ?
  `;
  
  try {
    const result = await db.query(sql, [status, progress, jobId]);
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
    return result.insertId;
  } catch (error) {
    console.error('transcriptionModel.saveTranscriptionResults 오류:', error);
    throw error;
  }
};

// 화자 구분 저장
const saveSpeakerSegments = async (transcriptionId, speakers) => {
  if (!speakers || speakers.length === 0) {
    console.log('저장할 화자 구분 데이터가 없습니다.');
    return true;
  }

  const sql = `
    INSERT INTO speaker_segments
    (transcription_id, speaker_id, text, created_at)
    VALUES ?
  `;
  
  try {
    // speakers 배열을 SQL 벌크 삽입 형식으로 변환
    const values = speakers.map(speaker => [
      transcriptionId,
      speaker.id,
      speaker.text,
      new Date()
    ]);
    
    const result = await db.query(sql, [values]);
    console.log('화자 구분 데이터 저장 완료:', speakers.length, '개');
    return true;
  } catch (error) {
    console.error('transcriptionModel.saveSpeakerSegments 오류:', error);
    throw error;
  }
};

// 핵심 문구 저장
const saveKeyPhrases = async (transcriptionId, phrases) => {
  if (!phrases || phrases.length === 0) {
    console.log('저장할 핵심 문구가 없습니다.');
    return true;
  }

  const sql = `
    INSERT INTO key_phrases
    (transcription_id, phrase, created_at)
    VALUES ?
  `;
  
  try {
    // phrases 배열을 SQL 벌크 삽입 형식으로 변환
    const values = phrases.map(phrase => [
      transcriptionId,
      phrase,
      new Date()
    ]);
    
    const result = await db.query(sql, [values]);
    console.log('핵심 문구 저장 완료:', phrases.length, '개');
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
    console.log('번역 결과 저장 완료:', language);
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
    return translations[0];
  } catch (error) {
    console.error('transcriptionModel.getTranslation 오류:', error);
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
  getTranslation
};
