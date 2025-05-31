const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// JWT 토큰으로 인증 확인
exports.protect = async (req, res, next) => {
  let token;

  // Authorization 헤더에서 토큰 확인
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Bearer 토큰에서 실제 토큰 값 추출
    token = req.headers.authorization.split(' ')[1];
  }

  // 토큰이 없는 경우
  if (!token) {
    return res.status(401).json({
      success: false,
      message: '인증이 필요합니다. 로그인해주세요.'
    });
  }

  try {
    // 토큰 검증
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 토큰에서 추출한 사용자 ID로 사용자 정보 가져오기
    const user = await User.findById(decoded.id);

    // 사용자가 존재하지 않는 경우
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '해당 사용자가 존재하지 않습니다.'
      });
    }

    // 요청 객체에 사용자 정보 추가
    req.user = {
      id: user.id,
      username: user.username,
      email: user.email
    };

    next();
  } catch (error) {
    console.error('인증 오류:', error);
    
    // JWT 오류 타입에 따른 응답
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: '유효하지 않은 토큰입니다.'
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: '토큰이 만료되었습니다. 다시 로그인해주세요.'
      });
    }

    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
};