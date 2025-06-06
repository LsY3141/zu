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
    await db.query(sql, [status, progress, jobId]);
    return true;
  } catch (error) {
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
    throw error;
  }
};

// 화자 구분 저장
const saveSpeakerSegments = async (transcriptionId, speakers) => {
  // 여러 화자 정보를 한 번에 삽입하기 위한 벌크 쿼리
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
    
    await db.query(sql, [values]);
    return true;
  } catch (error) {
    throw error;
  }
};

// 핵심 문구 저장
const saveKeyPhrases = async (transcriptionId, phrases) => {
  // 여러 문구를 한 번에 삽입하기 위한 벌크 쿼리
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
    
    await db.query(sql, [values]);
    return true;
  } catch (error) {
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
    return result.insertId;
  } catch (error) {
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
  saveTranslation
};
