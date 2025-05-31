const express = require('express');
const router = express.Router();
const speechController = require('../controllers/speechController');
const { protect } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');

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

// 음성 파일 업로드
router.post('/upload', logRequest, protect, upload.single('file'), handleUploadError, speechController.uploadSpeechFile);

// 변환 작업 상태 확인
router.get('/status/:jobId', logRequest, protect, speechController.checkTranscriptionStatus);

// 변환된 텍스트 분석
router.post('/analyze/:transcriptionId', logRequest, protect, speechController.analyzeTranscription);

// 변환된 텍스트 번역
router.post('/translate/:transcriptionId', logRequest, protect, speechController.translateTranscription);

// 변환 결과를 노트로 저장
router.post('/save-as-note/:transcriptionId', logRequest, protect, speechController.saveTranscriptionAsNote);

// 음성 변환 작업 히스토리 조회
router.get('/history', logRequest, protect, speechController.getSpeechHistory);

module.exports = router;