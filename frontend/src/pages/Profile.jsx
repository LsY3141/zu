import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { 
  FaUser, 
  FaEnvelope, 
  FaLock, 
  FaSave, 
  FaGlobe, 
  FaChartBar, 
  FaFileAlt, 
  FaMicrophone,
  FaCrown,
  FaCalendarDay,
  FaEdit,
  FaCamera,
  FaShieldAlt,
  FaTrophy,
  FaFire,
  FaClock
} from 'react-icons/fa';
import { updateProfile, changePassword } from '../redux/slices/authSlice';
import { showNotification } from '../redux/slices/uiSlice';
import Input from '../components/shared/Input';
import Button from '../components/shared/Button';
import Select from '../components/shared/Select';
import Alert from '../components/shared/Alert';

// Colors - 메인페이지와 동일한 컬러 팔레트
const colors = {
  magenta: '#E91E63',
  cyan: '#00BCD4', 
  darkGray: '#424242',
  lime: '#8BC34A',
  lightGray: '#E0E0E0',
  white: '#FFFFFF',
  purple: '#9C27B0',
  gold: '#FFD700'
};

// Animation keyframes
const animations = {
  fadeIn: `
    0% { opacity: 0; transform: translateY(20px); }
    100% { opacity: 1; transform: translateY(0); }
  `,
  slideIn: `
    0% { transform: translateX(-20px); opacity: 0; }
    100% { transform: translateX(0); opacity: 1; }
  `,
  scaleIn: `
    0% { transform: scale(0.95); opacity: 0; }
    100% { transform: scale(1); opacity: 1; }
  `,
  float: `
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-15px) rotate(5deg); }
  `,
  pulse: `
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  `,
  shimmer: `
    0% { background-position: -200px 0; }
    100% { background-position: calc(200px + 100%) 0; }
  `
};

// Common styled component patterns
const ClipPath = {
  rectangle: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 12px 100%)',
  button: 'polygon(0 0, calc(100% - 8px) 0, 100% 100%, 8px 100%)',
  card: 'polygon(0 0, calc(100% - 6px) 0, 100% 100%, 6px 100%)'
};

const ProfileContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(135deg, ${colors.lightGray} 0%, ${colors.white} 100%);
  padding: 0;
  margin: -20px;
  animation: fadeIn 0.6s ease-out;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -100px;
    right: -100px;
    width: 200px;
    height: 200px;
    background: ${colors.purple};
    opacity: 0.1;
    border-radius: 50%;
    animation: float 8s ease-in-out infinite;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -50px;
    left: -50px;
    width: 150px;
    height: 150px;
    background: ${colors.gold};
    opacity: 0.15;
    transform: rotate(45deg);
    animation: float 6s ease-in-out infinite reverse;
  }
  
  @keyframes fadeIn {
    ${animations.fadeIn}
  }
  
  @keyframes float {
    ${animations.float}
  }
`;

const Header = styled.div`
  background: linear-gradient(135deg, ${colors.purple} 0%, ${colors.magenta} 100%);
  color: white;
  padding: 60px 40px;
  position: relative;
  overflow: hidden;
  z-index: 2;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M30 0l30 30-30 30L0 30z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    opacity: 0.3;
  }
  
  @media (max-width: 768px) {
    padding: 40px 20px;
  }
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  gap: 30px;
  position: relative;
  z-index: 2;
  
  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    gap: 20px;
  }
`;

const ProfileAvatar = styled.div`
  position: relative;
  animation: scaleIn 0.8s ease-out;
  
  @keyframes scaleIn {
    ${animations.scaleIn}
  }
`;

const AvatarContainer = styled.div`
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, ${colors.cyan}, ${colors.lime});
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  font-weight: bold;
  clip-path: ${ClipPath.rectangle};
  box-shadow: 0 8px 30px rgba(0,0,0,0.3);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(
      45deg,
      transparent,
      rgba(255,255,255,0.1),
      transparent
    );
    animation: shimmer 3s ease-in-out infinite;
  }
  
  @keyframes shimmer {
    ${animations.shimmer}
  }
`;

const AvatarEditButton = styled.button`
  position: absolute;
  bottom: -10px;
  right: -10px;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, ${colors.magenta}, ${colors.purple});
  border: none;
  border-radius: 50%;
  color: white;
  font-size: 16px;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(233, 30, 99, 0.4);
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 20px rgba(233, 30, 99, 0.6);
  }
`;

const ProfileInfo = styled.div`
  flex: 1;
  animation: slideIn 0.8s ease-out;
  
  @keyframes slideIn {
    ${animations.slideIn}
  }
  
  h1 {
    font-size: 2.5rem;
    font-weight: 700;
    margin: 0 0 10px;
    display: flex;
    align-items: center;
    gap: 15px;
    
    @media (max-width: 768px) {
      font-size: 2rem;
      justify-content: center;
    }
  }
  
  .title {
    font-size: 1.2rem;
    opacity: 0.9;
    margin-bottom: 15px;
    display: flex;
    align-items: center;
    gap: 8px;
    
    @media (max-width: 768px) {
      justify-content: center;
    }
    
    svg {
      color: ${colors.gold};
      animation: pulse 2s ease-in-out infinite;
    }
  }
  
  .member-since {
    font-size: 14px;
    opacity: 0.8;
    display: flex;
    align-items: center;
    gap: 6px;
    
    @media (max-width: 768px) {
      justify-content: center;
    }
    
    svg {
      color: ${colors.cyan};
    }
  }
  
  @keyframes pulse {
    ${animations.pulse}
  }
`;

const ContentArea = styled.div`
  flex: 1;
  padding: 60px 40px;
  position: relative;
  z-index: 2;
  
  @media (max-width: 768px) {
    padding: 40px 20px;
  }
`;

const SectionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 30px;
  margin-bottom: 40px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

const SectionCard = styled.div`
  background: ${colors.white};
  padding: 30px;
  clip-path: ${ClipPath.rectangle};
  box-shadow: 0 8px 30px rgba(0,0,0,0.12);
  position: relative;
  animation: scaleIn 0.6s ease-out;
  transition: all 0.3s ease;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${({ $color }) => {
      switch($color) {
        case 'purple': return `linear-gradient(90deg, ${colors.purple}, ${colors.magenta})`;
        case 'cyan': return `linear-gradient(90deg, ${colors.cyan}, ${colors.lime})`;
        default: return `linear-gradient(90deg, ${colors.magenta}, ${colors.cyan})`;
      }
    }};
  }
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 40px rgba(0,0,0,0.18);
  }
  
  @keyframes scaleIn {
    ${animations.scaleIn}
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 25px;
  background: linear-gradient(135deg, ${colors.darkGray}, ${colors.magenta});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: flex;
  align-items: center;
  gap: 12px;
  
  svg {
    color: ${({ $iconColor }) => $iconColor || colors.cyan};
    font-size: 1.3rem;
  }
`;

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const StyledInput = styled(Input)`
  input {
    background: #F8F9FA !important;
    border: 2px solid transparent !important;
    transition: all 0.3s ease !important;
    font-weight: 500 !important;
    
    &:focus {
      background: ${colors.white} !important;
      border-color: ${colors.cyan} !important;
      transform: translateY(-1px);
      box-shadow: 0 4px 15px rgba(0, 188, 212, 0.2) !important;
    }
  }
`;

const StyledSelect = styled(Select)`
  select {
    background: #F8F9FA !important;
    border: 2px solid transparent !important;
    transition: all 0.3s ease !important;
    font-weight: 500 !important;
    
    &:focus {
      background: ${colors.white} !important;
      border-color: ${colors.cyan} !important;
      transform: translateY(-1px);
      box-shadow: 0 4px 15px rgba(0, 188, 212, 0.2) !important;
    }
  }
`;

const ActionButton = styled(Button)`
  background: linear-gradient(135deg, ${({ $variant }) => {
    switch($variant) {
      case 'save': return `${colors.lime}, ${colors.cyan}`;
      case 'security': return `${colors.purple}, ${colors.magenta}`;
      default: return `${colors.cyan}, ${colors.lime}`;
    }
  }}) !important;
  border: none !important;
  clip-path: ${ClipPath.button};
  font-weight: 600 !important;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2) !important;
  transition: all 0.3s ease !important;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px) !important;
    box-shadow: 0 8px 25px rgba(0,0,0,0.3) !important;
  }
  
  &:disabled {
    background: ${colors.lightGray} !important;
    transform: none !important;
    box-shadow: none !important;
  }
`;

const UsageStatsCard = styled.div`
  background: ${colors.white};
  padding: 30px;
  margin-top: 30px;
  clip-path: ${ClipPath.rectangle};
  box-shadow: 0 8px 30px rgba(0,0,0,0.12);
  position: relative;
  animation: scaleIn 1s ease-out;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, ${colors.gold}, ${colors.orange}, ${colors.magenta});
  }
  
  @keyframes scaleIn {
    ${animations.scaleIn}
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 25px;
  margin-top: 20px;
`;

const StatItem = styled.div`
  text-align: center;
  padding: 20px;
  background: linear-gradient(135deg, ${colors.lightGray}20, ${colors.white});
  border-radius: 0;
  clip-path: ${ClipPath.card};
  border: 2px solid ${colors.lightGray}50;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(
      45deg,
      transparent,
      ${({ $color }) => colors[$color] || colors.cyan}10,
      transparent
    );
    transform: rotate(45deg);
    transition: all 0.3s ease;
    opacity: 0;
  }
  
  &:hover {
    transform: translateY(-5px) scale(1.02);
    border-color: ${({ $color }) => colors[$color] || colors.cyan};
    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
    
    &::before {
      opacity: 1;
      animation: shimmer 1.5s ease-in-out;
    }
  }
  
  @keyframes shimmer {
    ${animations.shimmer}
  }
`;

const StatIcon = styled.div`
  font-size: 2.5rem;
  background: linear-gradient(135deg, ${({ $color }) => colors[$color] || colors.cyan}, ${colors.lime});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 15px;
  position: relative;
  z-index: 2;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(135deg, ${colors.darkGray}, ${colors.magenta});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
  position: relative;
  z-index: 2;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: ${colors.darkGray};
  opacity: 0.8;
  font-weight: 500;
  position: relative;
  z-index: 2;
`;

const AchievementBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, ${colors.gold}, ${colors.orange});
  color: white;
  padding: 8px 16px;
  font-size: 12px;
  font-weight: 700;
  margin-top: 10px;
  clip-path: ${ClipPath.card};
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.4);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  animation: pulse 3s ease-in-out infinite;
  
  svg {
    font-size: 14px;
    animation: none;
  }
  
  @keyframes pulse {
    ${animations.pulse}
  }
`;

const Profile = () => {
  const dispatch = useDispatch();
  const { user, loading, error, message } = useSelector(state => state.auth);
  
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    language: 'ko',
  });
  
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [profileErrors, setProfileErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});
  
  const languageOptions = [
    { value: 'ko', label: '한국어' },
    { value: 'en', label: '영어' },
    { value: 'ja', label: '일본어' },
    { value: 'zh', label: '중국어' },
  ];
  
  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username || '',
        email: user.email || '',
        language: user.language || 'ko',
      });
    }
  }, [user]);
  
  useEffect(() => {
    if (message) {
      dispatch(showNotification({
        message,
        type: 'success',
      }));
    }
  }, [message, dispatch]);
  
  const validateProfileForm = () => {
    const errors = {};
    
    if (!profileData.username.trim()) {
      errors.username = '사용자명을 입력해주세요.';
    }
    
    if (!profileData.email.trim()) {
      errors.email = '이메일을 입력해주세요.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      errors.email = '유효한 이메일 형식이 아닙니다.';
    }
    
    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const validatePasswordForm = () => {
    const errors = {};
    
    if (!passwordData.oldPassword) {
      errors.oldPassword = '현재 비밀번호를 입력해주세요.';
    }
    
    if (!passwordData.newPassword) {
      errors.newPassword = '새 비밀번호를 입력해주세요.';
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = '비밀번호는 6자 이상이어야 합니다.';
    }
    
    if (!passwordData.confirmPassword) {
      errors.confirmPassword = '비밀번호 확인을 입력해주세요.';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = '비밀번호가 일치하지 않습니다.';
    }
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    if (profileErrors[name]) {
      setProfileErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };
  
  const handleProfileSubmit = (e) => {
    e.preventDefault();
    
    if (validateProfileForm()) {
      dispatch(updateProfile(profileData));
    }
  };
  
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    
    if (validatePasswordForm()) {
      dispatch(changePassword(passwordData));
      setPasswordData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }
  };
  
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };
  
  const getMemberSince = (date) => {
    if (!date) return '최근';
    const createdDate = new Date(date);
    const now = new Date();
    const diffDays = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) return `${diffDays}일 전 가입`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}개월 전 가입`;
    return `${Math.floor(diffDays / 365)}년 전 가입`;
  };
  
  // 통계 계산
  const totalNotes = user?.usage?.totalNotes || 0;
  const speechMinutes = user?.usage?.speechProcessingMinutes || 0;
  const memberDays = user?.createdAt 
    ? Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24))
    : 0;
  const monthlyNotes = user?.usage?.monthlyStats?.[new Date().toISOString().slice(0, 7)]?.notes || 0;
  
  return (
    <ProfileContainer>
      <Header>
        <HeaderContent>
          <ProfileAvatar>
            <AvatarContainer>
              {getInitials(user?.username)}
            </AvatarContainer>
            <AvatarEditButton title="프로필 사진 변경">
              <FaCamera />
            </AvatarEditButton>
          </ProfileAvatar>
          
          <ProfileInfo>
            <h1>
              {user?.username || '사용자'}
              <FaCrown style={{ color: colors.gold }} />
            </h1>
            <div className="title">
              <FaTrophy />
              열렬한 이용자
            </div>
            <div className="member-since">
              <FaCalendarDay />
              {getMemberSince(user?.createdAt)}
            </div>
          </ProfileInfo>
        </HeaderContent>
      </Header>
      
      {error && (
        <div style={{ padding: '0 40px' }}>
          <Alert
            variant="error"
            message={error}
            marginBottom="20px"
          />
        </div>
      )}
      
      <ContentArea>
        <SectionGrid>
          <SectionCard $color="purple">
            <SectionTitle $iconColor={colors.purple}>
              <FaUser /> 기본 정보
            </SectionTitle>
            <form onSubmit={handleProfileSubmit}>
              <FormContainer>
                <StyledInput
                  name="username"
                  label="사용자명"
                  value={profileData.username}
                  onChange={handleProfileChange}
                  icon={<FaUser />}
                  error={profileErrors.username}
                  disabled={loading}
                />
                
                <StyledInput
                  name="email"
                  label="이메일"
                  type="email"
                  value={profileData.email}
                  onChange={handleProfileChange}
                  icon={<FaEnvelope />}
                  error={profileErrors.email}
                  disabled={loading}
                />
                
                <StyledSelect
                  name="language"
                  label="기본 언어"
                  value={profileData.language}
                  onChange={handleProfileChange}
                  options={languageOptions}
                  icon={<FaGlobe />}
                  disabled={loading}
                />
                
                <ActionButton
                  type="submit"
                  disabled={loading}
                  icon={<FaSave />}
                  $variant="save"
                >
                  {loading ? '저장 중...' : '변경사항 저장'}
                </ActionButton>
              </FormContainer>
            </form>
          </SectionCard>
          
          <SectionCard $color="cyan">
            <SectionTitle $iconColor={colors.magenta}>
              <FaShieldAlt /> 보안 설정
            </SectionTitle>
            <form onSubmit={handlePasswordSubmit}>
              <FormContainer>
                <StyledInput
                  name="oldPassword"
                  label="현재 비밀번호"
                  type="password"
                  value={passwordData.oldPassword}
                  onChange={handlePasswordChange}
                  icon={<FaLock />}
                  error={passwordErrors.oldPassword}
                  disabled={loading}
                />
                
                <StyledInput
                  name="newPassword"
                  label="새 비밀번호"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  icon={<FaLock />}
                  error={passwordErrors.newPassword}
                  disabled={loading}
                />
                
                <StyledInput
                  name="confirmPassword"
                  label="새 비밀번호 확인"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  icon={<FaLock />}
                  error={passwordErrors.confirmPassword}
                  disabled={loading}
                />
                
                <ActionButton
                  type="submit"
                  disabled={loading}
                  icon={<FaShieldAlt />}
                  $variant="security"
                >
                  {loading ? '변경 중...' : '비밀번호 변경'}
                </ActionButton>
              </FormContainer>
            </form>
          </SectionCard>
        </SectionGrid>
        
        <UsageStatsCard>
          <SectionTitle $iconColor={colors.gold}>
            <FaTrophy /> 활동 통계 & 성과
          </SectionTitle>
          
          <StatsGrid>
            <StatItem $color="magenta">
              <StatIcon $color="magenta">
                <FaFileAlt />
              </StatIcon>
              <StatValue>{totalNotes}</StatValue>
              <StatLabel>총 노트 수</StatLabel>
              {totalNotes >= 10 && (
                <AchievementBadge>
                  <FaTrophy />
                  노트 마스터
                </AchievementBadge>
              )}
            </StatItem>
            
            <StatItem $color="cyan">
              <StatIcon $color="cyan">
                <FaMicrophone />
              </StatIcon>
              <StatValue>{speechMinutes}</StatValue>
              <StatLabel>음성 처리 시간 (분)</StatLabel>
              {speechMinutes >= 60 && (
                <AchievementBadge>
                  <FaFire />
                  음성 전문가
                </AchievementBadge>
              )}
            </StatItem>
            
            <StatItem $color="lime">
              <StatIcon $color="lime">
                <FaChartBar />
              </StatIcon>
              <StatValue>{monthlyNotes}</StatValue>
              <StatLabel>이번 달 작성</StatLabel>
              {monthlyNotes >= 5 && (
                <AchievementBadge>
                  <FaFire />
                  활발한 활동
                </AchievementBadge>
              )}
            </StatItem>
            
            <StatItem $color="purple">
              <StatIcon $color="purple">
                <FaClock />
              </StatIcon>
              <StatValue>{memberDays}</StatValue>
              <StatLabel>함께한 일수</StatLabel>
              {memberDays >= 30 && (
                <AchievementBadge>
                  <FaCrown />
                  충성 회원
                </AchievementBadge>
              )}
            </StatItem>
          </StatsGrid>
        </UsageStatsCard>
      </ContentArea>
    </ProfileContainer>
  );
};

export default Profile;