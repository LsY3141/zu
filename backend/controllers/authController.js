const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendPasswordResetEmail } = require('../utils/emailService');

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

    // 입력 데이터 검증
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: '모든 필수 정보를 입력해주세요.'
      });
    }

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
      language: language || 'ko'
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

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.'
      });
    }

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

    // 입력 데이터 검증
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: '현재 비밀번호와 새 비밀번호를 모두 입력해주세요.'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: '새 비밀번호는 6자 이상이어야 합니다.'
      });
    }

    // 현재 사용자 찾기
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.'
      });
    }

    // 현재 비밀번호 확인
    const isMatch = await User.comparePassword(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: '현재 비밀번호가 일치하지 않습니다.'
      });
    }

    // 새 비밀번호가 현재 비밀번호와 같은지 확인
    const isSamePassword = await User.comparePassword(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: '새 비밀번호는 현재 비밀번호와 다르게 설정해주세요.'
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

    // 이메일 검증
    if (!email) {
      return res.status(400).json({
        success: false,
        message: '이메일을 입력해주세요.'
      });
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: '유효한 이메일 주소를 입력해주세요.'
      });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '해당 이메일을 가진 사용자가 존재하지 않습니다.'
      });
    }

    // 기존 토큰이 있다면 삭제 (사용자가 여러 번 요청할 수 있음)
    try {
      await User.deletePasswordResetTokensByUserId(user.id);
    } catch (deleteError) {
      console.log('기존 토큰 삭제 중 오류 (무시 가능):', deleteError.message);
    }

    // 토큰 생성 (32바이트 = 64자리 hex 문자열)
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // 토큰 만료 시간 설정 (1시간)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    // 토큰 저장
    await User.createPasswordResetToken(user.id, resetToken, expiresAt);

    // 프론트엔드 URL 구성
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    console.log(`비밀번호 재설정 요청 - 사용자: ${user.email}, 토큰: ${resetToken}`);
    console.log(`재설정 URL: ${resetUrl}`);

    // 이메일 발송
    try {
      await sendPasswordResetEmail(user, resetUrl);
      
      res.status(200).json({
        success: true,
        message: '비밀번호 재설정 링크가 이메일로 전송되었습니다. 메일함을 확인해주세요.'
      });
    } catch (emailError) {
      console.error('이메일 발송 실패:', emailError);
      
      // 이메일 발송 실패 시 생성된 토큰 삭제
      await User.deletePasswordResetToken(resetToken);
      
      res.status(500).json({
        success: false,
        message: '이메일 발송에 실패했습니다. 잠시 후 다시 시도해주세요.'
      });
    }
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

    // 입력 데이터 검증
    if (!token) {
      return res.status(400).json({
        success: false,
        message: '재설정 토큰이 필요합니다.'
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: '새 비밀번호를 입력해주세요.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: '비밀번호는 6자 이상이어야 합니다.'
      });
    }

    console.log(`비밀번호 재설정 시도 - 토큰: ${token}`);

    // 토큰 유효성 검사
    const resetToken = await User.verifyPasswordResetToken(token);
    if (!resetToken) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않거나 만료된 토큰입니다. 비밀번호 찾기를 다시 시도해주세요.'
      });
    }

    console.log(`유효한 토큰 확인 - 사용자 ID: ${resetToken.user_id}`);

    // 해당 사용자 정보 가져오기
    const user = await User.findById(resetToken.user_id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.'
      });
    }

    // 새 비밀번호가 현재 비밀번호와 같은지 확인
    const isSamePassword = await User.comparePassword(password, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: '새 비밀번호는 기존 비밀번호와 다르게 설정해주세요.'
      });
    }

    // 비밀번호 변경
    await User.updatePassword(resetToken.user_id, password);
    
    // 사용한 토큰 삭제 (보안상 중요)
    await User.deletePasswordResetToken(token);
    
    // 해당 사용자의 모든 재설정 토큰 삭제 (추가 보안)
    await User.deletePasswordResetTokensByUserId(resetToken.user_id);

    console.log(`비밀번호 재설정 완료 - 사용자: ${user.email}`);

    res.status(200).json({
      success: true,
      message: '비밀번호가 성공적으로 재설정되었습니다. 새 비밀번호로 로그인해주세요.'
    });
  } catch (error) {
    console.error('비밀번호 재설정 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
};