// backend/routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

// 로깅 미들웨어
const logRequest = (req, res, next) => {
  console.log('-----------------------------------');
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.log('요청 헤더:', JSON.stringify(req.headers, null, 2));
  if (req.user) {
    console.log('인증된 사용자:', req.user.id);
  }
  next();
};

// 모든 라우트에 인증 미들웨어 적용
router.use(protect);

// 챗봇 메시지 전송
router.post('/message', logRequest, chatController.sendMessage);

// 노트 기반 질문 답변 (sendMessage와 동일한 기능)
router.post('/note/:noteId', logRequest, chatController.sendMessage);

// 노트 요약
router.post('/summarize/:noteId', logRequest, chatController.summarizeNote);

// 키워드 추출
router.post('/keywords/:noteId', logRequest, chatController.extractKeywords);

// 관련 노트 찾기
router.get('/related/:noteId', logRequest, chatController.getRelatedNotes);

// 채팅 히스토리 조회
router.get('/history/:noteId', logRequest, chatController.getChatHistory);

// 채팅 히스토리 삭제
router.delete('/history/:noteId', logRequest, chatController.clearChatHistory);

module.exports = router;