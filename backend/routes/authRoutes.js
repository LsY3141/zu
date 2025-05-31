const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// 회원가입
router.post('/register', authController.register);

// 로그인
router.post('/login', authController.login);

// 현재 로그인한 사용자 정보
router.get('/me', protect, authController.getMe);

// 비밀번호 변경
router.post('/change-password', protect, authController.changePassword);

// 비밀번호 찾기 (이메일 발송)
router.post('/forgot-password', authController.forgotPassword);

// 비밀번호 재설정
router.post('/reset-password', authController.resetPassword);

module.exports = router;
