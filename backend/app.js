const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { testConnection } = require('./config/db');
const { testEmailConnection } = require('./utils/emailService');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const speechRoutes = require('./routes/speechRoutes');
const noteRoutes = require('./routes/noteRoutes');
const chatRoutes = require('./routes/chatRoutes');

// 환경 변수 로드
dotenv.config();

// 환경 변수 로깅
console.log('------- 애플리케이션 설정 -------');
console.log('현재 환경:', process.env.NODE_ENV || 'development');
console.log('포트:', process.env.PORT || 5000);
console.log('프론트엔드 URL:', process.env.FRONTEND_URL || 'http://localhost:3000');
console.log('AWS 리전:', process.env.AWS_REGION || 'ap-northeast-2');
console.log('AWS S3 버킷:', process.env.AWS_S3_BUCKET_NAME);
console.log('이메일 서비스:', process.env.EMAIL_SERVICE || 'gmail');
console.log('이메일 발신자:', process.env.EMAIL_FROM || process.env.EMAIL_USERNAME);
console.log('--------------------------------');

// Express 앱 생성
const app = express();

// 서비스 연결 테스트
const initializeServices = async () => {
  console.log('🔄 서비스 초기화 중...');
  
  // 데이터베이스 연결 테스트
  await testConnection();
  
  // 이메일 서비스 연결 테스트
  await testEmailConnection();
  
  console.log('✅ 모든 서비스 초기화 완료');
};

// 서비스 초기화 실행
initializeServices();

// 미들웨어
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// 로깅 미들웨어
app.use((req, res, next) => {
  const start = Date.now();
  const timestamp = new Date().toISOString();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusColor = res.statusCode >= 400 ? '\x1b[31m' : '\x1b[32m'; // 빨강 or 초록
    const resetColor = '\x1b[0m';
    
    console.log(
      `[${timestamp}] ${req.method} ${req.originalUrl} - ` +
      `${statusColor}${res.statusCode}${resetColor} - ${duration}ms`
    );
  });
  
  next();
});

// 라우트
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/speech', speechRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/chat', chatRoutes);

// 기본 라우트
app.get('/', (req, res) => {
  res.json({
    message: '🎤 음성노트 API 서버가 정상적으로 실행 중입니다!',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    services: {
      database: '✅ 연결됨',
      email: '✅ 설정됨',
      aws: '✅ 설정됨'
    }
  });
});

// 상태 확인 라우트
app.get('/api/status', (req, res) => {
  res.status(200).json({
    success: true,
    message: '서버가 정상적으로 실행 중입니다.',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
    services: {
      auth: '✅ 활성화',
      users: '✅ 활성화',
      notes: '✅ 활성화',
      speech: '✅ 활성화',
      chatbot: '✅ 활성화',
      email: '✅ 활성화'
    },
    features: {
      userRegistration: true,
      passwordReset: true,
      voiceTranscription: true,
      noteSharing: true,
      aiChat: true
    }
  });
});

// 이메일 서비스 상태 확인 라우트
app.get('/api/email/status', async (req, res) => {
  try {
    const isConnected = await testEmailConnection();
    
    res.status(200).json({
      success: true,
      message: '이메일 서비스 상태 확인',
      emailService: {
        provider: process.env.EMAIL_SERVICE || 'gmail',
        status: isConnected ? '✅ 연결됨' : '❌ 연결 실패',
        from: process.env.EMAIL_FROM || process.env.EMAIL_USERNAME
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '이메일 서비스 상태 확인 실패',
      error: error.message
    });
  }
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
    message: `요청하신 리소스 ${req.originalUrl}를 찾을 수 없습니다.`,
    availableEndpoints: [
      'GET /api/status',
      'POST /api/auth/login',
      'POST /api/auth/register',
      'POST /api/auth/forgot-password',
      'POST /api/auth/reset-password',
      'GET /api/notes',
      'GET /api/chat/status'
    ]
  });
});

// 오류 처리 미들웨어
app.use((err, req, res, next) => {
  console.error('서버 오류:', err);
  
  // JWT 오류 처리
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: '유효하지 않은 토큰입니다.'
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: '토큰이 만료되었습니다.'
    });
  }
  
  // 데이터베이스 오류 처리
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(400).json({
      success: false,
      message: '중복된 데이터입니다.'
    });
  }
  
  // 파일 크기 오류 처리
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      message: '파일 크기가 너무 큽니다.'
    });
  }
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || '서버 내부 오류가 발생했습니다.',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 서버 시작
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
🚀 서버가 포트 ${PORT}에서 실행 중입니다!
🌐 서버 URL: http://localhost:${PORT}
📧 이메일 서비스: ${process.env.EMAIL_SERVICE || 'gmail'}
🎯 프론트엔드 URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}
  `);
});

module.exports = app;