const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { testConnection } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const speechRoutes = require('./routes/speechRoutes');
const noteRoutes = require('./routes/noteRoutes');
const chatRoutes = require('./routes/chatRoutes'); // 새로 추가

// 환경 변수 로드
dotenv.config();

// 환경 변수 로깅
console.log('------- 애플리케이션 설정 -------');
console.log('현재 환경:', process.env.NODE_ENV || 'development');
console.log('포트:', process.env.PORT || 5000);
console.log('AWS 리전:', process.env.AWS_REGION || 'ap-northeast-2');
console.log('AWS S3 버킷:', process.env.AWS_S3_BUCKET_NAME);
console.log('--------------------------------');

// Express 앱 생성
const app = express();

// 데이터베이스 연결 테스트
testConnection();

// 미들웨어
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 로깅 미들웨어
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// 라우트
app.use('/api/auth', authRoutes);
app.use('/api/speech', speechRoutes);
app.use('/api/notes', noteRoutes);

// 기본 라우트
app.get('/', (req, res) => {
  res.send('Voice Note API 서버');
});

// 상태 확인 라우트
app.get('/api/status', (req, res) => {
  res.status(200).json({
    success: true,
    message: '서버가 정상적으로 실행 중입니다.',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
    features: {
      notes: true,
      speech: true,
      chatbot: true // ChatBot 기능 활성화 표시
    }
  });
});

// ChatBot 전용 상태 확인 라우트
app.get('/api/chat/status', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'ChatBot 서비스가 정상적으로 작동 중입니다.',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    capabilities: [
      'note_analysis',
      'text_summarization', 
      'keyword_extraction',
      'related_notes_search',
      'conversational_ai'
    ]
  });
});

// 404 처리
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: '요청하신 리소스를 찾을 수 없습니다.'
  });
});

// 오류 처리 미들웨어
app.use((err, req, res, next) => {
  console.error('서버 오류:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || '서버 내부 오류가 발생했습니다.',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// 서버 시작
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`);
  console.log('ChatBot API 엔드포인트: /api/chat');
});

// 처리되지 않은 예외 처리
process.on('uncaughtException', (error) => {
  console.error('처리되지 않은 예외 발생:', error);
  console.error('스택 트레이스:', error.stack);
});

// 거부된 Promise 처리
process.on('unhandledRejection', (reason, promise) => {
  console.error('처리되지 않은 Promise 거부:', reason);
  console.error('Promise:', promise);
});

// 종료 처리
process.on('SIGTERM', () => {
  console.log('SIGTERM 신호 수신, 서버를 종료합니다.');
  server.close(() => {
    console.log('서버가 종료되었습니다.');
    process.exit(0);
  });
});

module.exports = app;