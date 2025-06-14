const db = require('../config/db');
const bcrypt = require('bcrypt');

// 사용자 모델 함수
const findByEmail = async (email) => {
  const sql = 'SELECT * FROM users WHERE email = ?';
  
  try {
    const users = await db.query(sql, [email]);
    return users[0]; // 첫 번째 사용자 반환 또는 undefined
  } catch (error) {
    throw error;
  }
};

const findByUsername = async (username) => {
  const sql = 'SELECT * FROM users WHERE username = ?';
  
  try {
    const users = await db.query(sql, [username]);
    return users[0]; // 첫 번째 사용자 반환 또는 undefined
  } catch (error) {
    throw error;
  }
};

const findById = async (id) => {
  const sql = 'SELECT * FROM users WHERE id = ?';
  
  try {
    const users = await db.query(sql, [id]);
    return users[0]; // 첫 번째 사용자 반환 또는 undefined
  } catch (error) {
    throw error;
  }
};

const create = async (userData) => {
  const { username, email, password, language = 'ko' } = userData;
  
  // 비밀번호 해싱
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  
  const sql = `
    INSERT INTO users (username, email, password, language) 
    VALUES (?, ?, ?, ?)
  `;
  
  try {
    const result = await db.query(sql, [username, email, hashedPassword, language]);
    return result.insertId;
  } catch (error) {
    throw error;
  }
};

const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

const updateProfile = async (id, userData) => {
  const { username, email, language } = userData;
  
  const sql = `
    UPDATE users 
    SET username = ?, email = ?, language = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;
  
  try {
    const result = await db.query(sql, [username, email, language, id]);
    return result.affectedRows > 0;
  } catch (error) {
    throw error;
  }
};

const updatePassword = async (id, password) => {
  // 비밀번호 해싱
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  
  const sql = `
    UPDATE users 
    SET password = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;
  
  try {
    const result = await db.query(sql, [hashedPassword, id]);
    return result.affectedRows > 0;
  } catch (error) {
    throw error;
  }
};

const updateUsageStats = async (id, statsData) => {
  const { notesIncrement = 0, speechMinutesIncrement = 0 } = statsData;
  
  // 현재 사용량 업데이트
  const updateSql = `
    UPDATE users 
    SET total_notes = total_notes + ?, 
        speech_processing_minutes = speech_processing_minutes + ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;
  
  // 월간 통계 업데이트 (없으면 생성)
  const yearMonth = new Date().toISOString().slice(0, 7); // YYYY-MM 형식
  
  const monthlySql = `
    INSERT INTO monthly_usage (user_id, \`year_month\`, notes_count, speech_minutes)
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE 
      notes_count = notes_count + ?,
      speech_minutes = speech_minutes + ?,
      updated_at = CURRENT_TIMESTAMP
  `;
  
  try {
    await db.query(updateSql, [notesIncrement, speechMinutesIncrement, id]);
    await db.query(monthlySql, [
      id, yearMonth, notesIncrement, speechMinutesIncrement,
      notesIncrement, speechMinutesIncrement
    ]);
    return true;
  } catch (error) {
    throw error;
  }
};

const getUserStats = async (userId) => {
  const sql = `
    SELECT 
      u.total_notes,
      u.speech_processing_minutes,
      u.created_at,
      COUNT(n.id) as current_notes_count,
      COUNT(CASE WHEN n.is_voice = 1 THEN 1 END) as voice_notes_count,
      COUNT(CASE WHEN n.is_voice = 0 THEN 1 END) as text_notes_count
    FROM users u
    LEFT JOIN notes n ON u.id = n.user_id AND n.is_deleted = 0
    WHERE u.id = ?
    GROUP BY u.id
  `;
  
  try {
    const result = await db.query(sql, [userId]);
    return result[0] || {};
  } catch (error) {
    throw error;
  }
};

// 비밀번호 재설정 토큰 생성
const createPasswordResetToken = async (userId, token, expiresAt) => {
  const sql = `
    INSERT INTO password_reset_tokens (user_id, token, expires_at)
    VALUES (?, ?, ?)
  `;
  
  try {
    await db.query(sql, [userId, token, expiresAt]);
    return true;
  } catch (error) {
    console.error('토큰 생성 오류:', error);
    throw error;
  }
};

// 비밀번호 재설정 토큰 검증
const verifyPasswordResetToken = async (token) => {
  const sql = `
    SELECT user_id, token, expires_at, created_at
    FROM password_reset_tokens 
    WHERE token = ? AND expires_at > NOW()
    ORDER BY created_at DESC 
    LIMIT 1
  `;
  
  try {
    const tokens = await db.query(sql, [token]);
    return tokens[0]; // 첫 번째 토큰 반환 또는 undefined
  } catch (error) {
    console.error('토큰 검증 오류:', error);
    throw error;
  }
};

// 특정 토큰 삭제
const deletePasswordResetToken = async (token) => {
  const sql = 'DELETE FROM password_reset_tokens WHERE token = ?';
  
  try {
    const result = await db.query(sql, [token]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error('토큰 삭제 오류:', error);
    throw error;
  }
};

// 특정 사용자의 모든 비밀번호 재설정 토큰 삭제
const deletePasswordResetTokensByUserId = async (userId) => {
  const sql = 'DELETE FROM password_reset_tokens WHERE user_id = ?';
  
  try {
    const result = await db.query(sql, [userId]);
    return result.affectedRows;
  } catch (error) {
    console.error('사용자 토큰 일괄 삭제 오류:', error);
    throw error;
  }
};

// 만료된 토큰 정리 (선택적 - 정기적으로 실행)
const cleanupExpiredTokens = async () => {
  const sql = 'DELETE FROM password_reset_tokens WHERE expires_at <= NOW()';
  
  try {
    const result = await db.query(sql);
    if (result.affectedRows > 0) {
      console.log(`${result.affectedRows}개의 만료된 토큰을 정리했습니다.`);
    }
    return result.affectedRows;
  } catch (error) {
    console.error('만료된 토큰 정리 오류:', error);
    throw error;
  }
};

// 사용자의 활성 토큰 개수 확인
const getActiveTokenCount = async (userId) => {
  const sql = `
    SELECT COUNT(*) as count 
    FROM password_reset_tokens 
    WHERE user_id = ? AND expires_at > NOW()
  `;
  
  try {
    const result = await db.query(sql, [userId]);
    return result[0].count;
  } catch (error) {
    console.error('활성 토큰 개수 확인 오류:', error);
    throw error;
  }
};

// 모듈 내보내기
module.exports = {
  findByEmail,
  findByUsername,
  findById,
  create,
  comparePassword,
  updateProfile,
  updatePassword,
  updateUsageStats,
  getUserStats,
  createPasswordResetToken,
  verifyPasswordResetToken,
  deletePasswordResetToken,
  deletePasswordResetTokensByUserId,
  cleanupExpiredTokens,
  getActiveTokenCount
};