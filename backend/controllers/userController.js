const User = require('../models/userModel');

// 프로필 업데이트
exports.updateProfile = async (req, res) => {
  try {
    const { username, email, language } = req.body;
    const userId = req.user.id;

    // 입력값 검증
    if (!username || !email) {
      return res.status(400).json({
        success: false,
        message: '사용자명과 이메일은 필수입니다.'
      });
    }

    // 이메일 중복 확인 (자신 제외)
    const existingUser = await User.findByEmail(email);
    if (existingUser && existingUser.id !== userId) {
      return res.status(400).json({
        success: false,
        message: '이미 사용 중인 이메일입니다.'
      });
    }

    // 사용자명 중복 확인 (자신 제외)
    const existingUsername = await User.findByUsername(username);
    if (existingUsername && existingUsername.id !== userId) {
      return res.status(400).json({
        success: false,
        message: '이미 사용 중인 사용자명입니다.'
      });
    }

    // 프로필 업데이트
    await User.updateProfile(userId, { username, email, language });

    // 업데이트된 사용자 정보 가져오기
    const updatedUser = await User.findById(userId);
    const { password, ...userData } = updatedUser;

    res.status(200).json({
      success: true,
      message: '프로필이 성공적으로 업데이트되었습니다.',
      user: userData
    });
  } catch (error) {
    console.error('프로필 업데이트 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
};

// 사용자 통계 조회
exports.getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const stats = await User.getUserStats(userId);

    res.status(200).json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('사용자 통계 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
};