const mysql = require('mysql2/promise');
require('dotenv').config();

// 데이터베이스 연결 풀 생성
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 연결 테스트
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('MySQL 데이터베이스 연결 성공');
    connection.release();
  } catch (error) {
    console.error('MySQL 데이터베이스 연결 실패:', error);
  }
};

// 쿼리를 실행하기 위한 유틸리티 함수
const query = async (sql, params) => {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('쿼리 실행 오류:', error);
    throw error;
  }
};

module.exports = {
  pool,
  query,
  testConnection
};
