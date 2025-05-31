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
  FaMicrophone 
} from 'react-icons/fa';
import { updateProfile, changePassword } from '../redux/slices/authSlice';
import { showNotification } from '../redux/slices/uiSlice';
import Card from '../components/shared/Card';
import Input from '../components/shared/Input';
import Button from '../components/shared/Button';
import Select from '../components/shared/Select';
import Alert from '../components/shared/Alert';

const ProfileContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const ProfileTitle = styled.h1`
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 20px;
  color: ${({ theme }) => theme.colors.text};
`;

const ProfileGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
  gap: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const UsageStatsCard = styled(Card)`
  margin-top: 20px;
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
  margin-top: 10px;
`;

const StatItem = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  padding: 15px;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  border-left: 3px solid ${({ theme, color }) => theme.colors[color]};
`;

const StatTitle = styled.div`
  display: flex;
  align-items: center;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 8px;
  
  svg {
    margin-right: 8px;
    color: ${({ theme, color }) => theme.colors[color]};
  }
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
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
    
    // 입력 시 해당 필드의 에러 메시지 초기화
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
    
    // 입력 시 해당 필드의 에러 메시지 초기화
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
  
  return (
    <ProfileContainer>
      <ProfileTitle>프로필 설정</ProfileTitle>
      
      {error && (
        <Alert
          variant="error"
          message={error}
          marginBottom="20px"
        />
      )}
      
      <ProfileGrid>
        <Card title="기본 정보">
          <form onSubmit={handleProfileSubmit}>
            <FormContainer>
              <Input
                name="username"
                label="사용자명"
                value={profileData.username}
                onChange={handleProfileChange}
                icon={<FaUser />}
                error={profileErrors.username}
                disabled={loading}
              />
              
              <Input
                name="email"
                label="이메일"
                type="email"
                value={profileData.email}
                onChange={handleProfileChange}
                icon={<FaEnvelope />}
                error={profileErrors.email}
                disabled={loading}
              />
              
              <Select
                name="language"
                label="기본 언어"
                value={profileData.language}
                onChange={handleProfileChange}
                options={languageOptions}
                icon={<FaGlobe />}
                disabled={loading}
              />
              
              <Button
                type="submit"
                disabled={loading}
                icon={<FaSave />}
              >
                {loading ? '저장 중...' : '변경사항 저장'}
              </Button>
            </FormContainer>
          </form>
        </Card>
        
        <Card title="비밀번호 변경">
          <form onSubmit={handlePasswordSubmit}>
            <FormContainer>
              <Input
                name="oldPassword"
                label="현재 비밀번호"
                type="password"
                value={passwordData.oldPassword}
                onChange={handlePasswordChange}
                icon={<FaLock />}
                error={passwordErrors.oldPassword}
                disabled={loading}
              />
              
              <Input
                name="newPassword"
                label="새 비밀번호"
                type="password"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                icon={<FaLock />}
                error={passwordErrors.newPassword}
                disabled={loading}
              />
              
              <Input
                name="confirmPassword"
                label="새 비밀번호 확인"
                type="password"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                icon={<FaLock />}
                error={passwordErrors.confirmPassword}
                disabled={loading}
              />
              
              <Button
                type="submit"
                disabled={loading}
                icon={<FaLock />}
              >
                {loading ? '변경 중...' : '비밀번호 변경'}
              </Button>
            </FormContainer>
          </form>
        </Card>
      </ProfileGrid>
      
      <UsageStatsCard title="사용량 통계">
        <StatsContainer>
          <StatItem color="primary">
            <StatTitle color="primary">
              <FaFileAlt /> 총 노트 수
            </StatTitle>
            <StatValue>{user?.usage?.totalNotes || 0}</StatValue>
          </StatItem>
          
          <StatItem color="secondary">
            <StatTitle color="secondary">
              <FaMicrophone /> 음성 처리 시간
            </StatTitle>
            <StatValue>{user?.usage?.speechProcessingMinutes || 0}분</StatValue>
          </StatItem>
          
          <StatItem color="info">
            <StatTitle color="info">
              <FaChartBar /> 이번 달 활동
            </StatTitle>
            <StatValue>
              {user?.usage?.monthlyStats?.[new Date().toISOString().slice(0, 7)]?.notes || 0}개
            </StatValue>
          </StatItem>
          
          <StatItem color="success">
            <StatTitle color="success">
              <FaUser /> 가입 기간
            </StatTitle>
            <StatValue>
              {user?.createdAt
                ? `${Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24))}일`
                : '0일'}
            </StatValue>
          </StatItem>
        </StatsContainer>
      </UsageStatsCard>
    </ProfileContainer>
  );
};

export default Profile;