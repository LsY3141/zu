const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// JWT 토큰 생성
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// 회원가입
exports.register = async (req, res) => {
  try {
    const { username, email, password, language } = req.body;

    // 이메일 중복 확인
    const existingUserByEmail = await User.findByEmail(email);
    if (existingUserByEmail) {
      return res.status(400).json({
        success: false,
        message: '이미 등록된 이메일입니다.'
      });
    }

    // 사용자명 중복 확인
    const existingUserByUsername = await User.findByUsername(username);
    if (existingUserByUsername) {
      return res.status(400).json({
        success: false,
        message: '이미 사용 중인 사용자명입니다.'
      });
    }

    // 사용자 생성
    const userId = await User.create({
      username,
      email,
      password,
      language
    });

    // 생성된 사용자 정보 가져오기
    const user = await User.findById(userId);

    // JWT 토큰 생성
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      message: '회원가입이 완료되었습니다.',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        language: user.language
      }
    });
  } catch (error) {
    console.error('회원가입 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
};

// 로그인
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 이메일 검증
    if (!email) {
      return res.status(400).json({
        success: false,
        message: '이메일을 입력해주세요.'
      });
    }

    // 비밀번호 검증
    if (!password) {
      return res.status(400).json({
        success: false,
        message: '비밀번호를 입력해주세요.'
      });
    }

    // 사용자 검색
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '이메일 또는 비밀번호가 일치하지 않습니다.'
      });
    }

    // 비밀번호 확인
    const isMatch = await User.comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: '이메일 또는 비밀번호가 일치하지 않습니다.'
      });
    }

    // JWT 토큰 생성
    const token = generateToken(user.id);

    res.status(200).json({
      success: true,
      message: '로그인이 성공적으로 완료되었습니다.',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        language: user.language
      }
    });
  } catch (error) {
    console.error('로그인 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
};

// 현재 사용자 정보 가져오기
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    // 사용자 비밀번호 제외하고 반환
    const { password, ...userData } = user;

    res.status(200).json({
      success: true,
      user: userData
    });
  } catch (error) {
    console.error('사용자 정보 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
};

// 비밀번호 변경
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    // 현재 사용자 찾기
    const user = await User.findById(req.user.id);

    // 현재 비밀번호 확인
    const isMatch = await User.comparePassword(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: '현재 비밀번호가 일치하지 않습니다.'
      });
    }

    // 새 비밀번호로 업데이트
    await User.updatePassword(user.id, newPassword);

    res.status(200).json({
      success: true,
      message: '비밀번호가 성공적으로 변경되었습니다.'
    });
  } catch (error) {
    console.error('비밀번호 변경 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
};

// 비밀번호 찾기 (이메일 발송)
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '해당 이메일을 가진 사용자가 존재하지 않습니다.'
      });
    }

    // 토큰 생성
    const resetToken = crypto.randomBytes(20).toString('hex');
    
    // 토큰 만료 시간 설정 (1시간)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    // 토큰 저장
    await User.createPasswordResetToken(user.id, resetToken, expiresAt);

    // 이메일 발송 로직 (실제 구현 필요)
    // const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;
    // sendPasswordResetEmail(user, resetUrl);

    res.status(200).json({
      success: true,
      message: '비밀번호 재설정 링크가 이메일로 전송되었습니다.'
    });
  } catch (error) {
    console.error('비밀번호 찾기 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
};

// 비밀번호 재설정
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    // 토큰 유효성 검사
    const resetToken = await User.verifyPasswordResetToken(token);
    if (!resetToken) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않거나 만료된 토큰입니다.'
      });
    }

    // 비밀번호 변경
    await User.updatePassword(resetToken.user_id, password);
    
    // 사용한 토큰 삭제
    await User.deletePasswordResetToken(token);

    res.status(200).json({
      success: true,
      message: '비밀번호가 성공적으로 재설정되었습니다.'
    });
  } catch (error) {
    console.error('비밀번호 재설정 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
};