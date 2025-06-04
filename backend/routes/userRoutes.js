const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth');

// 모든 라우트에 인증 미들웨어 적용
router.use(protect);

// 프로필 업데이트
router.put('/profile', userController.updateProfile);

// 사용자 통계 조회
router.get('/stats', userController.getUserStats);

module.exports = router;