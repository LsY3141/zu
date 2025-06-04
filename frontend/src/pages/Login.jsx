import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import LoginForm from '../components/auth/LoginForm';

// Colors - 메인 페이지와 동일한 컬러 팔레트
const colors = {
  magenta: '#E91E63',
  cyan: '#00BCD4', 
  darkGray: '#424242',
  lime: '#8BC34A',
  lightGray: '#E0E0E0',
  white: '#FFFFFF'
};

// Animation keyframes
const animations = {
  float: `
    0%, 100% { transform: translate(0, 0) rotate(0deg); }
    25% { transform: translate(-20px, -20px) rotate(1deg); }
    50% { transform: translate(20px, -10px) rotate(-1deg); }
    75% { transform: translate(-10px, 20px) rotate(0.5deg); }
  `,
  bounce: `
    0%, 100% { transform: translateY(0) rotate(45deg); }
    50% { transform: translateY(-20px) rotate(45deg); }
  `
};

const LoginPageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, ${colors.magenta} 0%, ${colors.cyan} 50%, ${colors.lime} 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M30 0l30 30-30 30L0 30z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    animation: float 20s ease-in-out infinite;
  }
  
  @keyframes float {
    ${animations.float}
  }
`;

// Responsive breakpoints
const breakpoints = {
  mobile: '768px'
};

// Common styled component patterns
const ClipPath = {
  rectangle: 'polygon(0 0, calc(100% - 20px) 0, 100% 100%, 20px 100%)',
  button: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 12px 100%)'
};

const LoginWrapper = styled.div`
  display: flex;
  width: 100%;
  max-width: 1000px;
  background: ${colors.white};
  border-radius: 0;
  box-shadow: 0 20px 60px rgba(0,0,0,0.15);
  overflow: hidden;
  position: relative;
  z-index: 2;
  clip-path: ${ClipPath.rectangle};
  
  @media (max-width: ${breakpoints.mobile}) {
    flex-direction: column;
    max-width: 400px;
  }
`;

const LeftPanel = styled.div`
  flex: 1;
  background: linear-gradient(135deg, ${colors.darkGray} 0%, ${colors.magenta} 100%);
  color: white;
  padding: 60px 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 20px;
    right: 20px;
    width: 100px;
    height: 100px;
    background: ${colors.lime};
    opacity: 0.3;
    transform: rotate(45deg);
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -30px;
    left: -30px;
    width: 120px;
    height: 120px;
    background: ${colors.cyan};
    opacity: 0.2;
    border-radius: 50%;
  }
  
  @media (max-width: ${breakpoints.mobile}) {
    padding: 40px 30px;
    text-align: center;
  }
`;

const WelcomeContent = styled.div`
  position: relative;
  z-index: 2;
`;

const LogoSection = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 30px;
  
  @media (max-width: ${breakpoints.mobile}) {
    justify-content: center;
  }
`;

const Logo = styled.div`
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, ${colors.cyan} 0%, ${colors.lime} 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 24px;
  margin-right: 15px;
  clip-path: ${ClipPath.button};
  box-shadow: 0 4px 15px rgba(0, 188, 212, 0.3);
`;

const LogoText = styled.div`
  display: flex;
  flex-direction: column;
`;

const LogoTitle = styled.div`
  font-size: 20px;
  font-weight: bold;
  line-height: 1;
`;

const LogoSubtitle = styled.div`
  font-size: 12px;
  color: ${colors.cyan};
  opacity: 0.8;
  margin-top: 4px;
`;

const WelcomeTitle = styled.h1`
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 20px;
  background: linear-gradient(90deg, ${colors.white} 0%, ${colors.cyan} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  
  @media (max-width: ${breakpoints.mobile}) {
    font-size: 1.8rem;
  }
`;

const WelcomeSubtitle = styled.p`
  font-size: 1.1rem;
  opacity: 0.9;
  line-height: 1.6;
  margin-bottom: 30px;
  
  @media (max-width: ${breakpoints.mobile}) {
    font-size: 1rem;
  }
`;

const FeatureList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const FeatureItem = styled.div`
  display: flex;
  align-items: center;
  
  &::before {
    content: '✨';
    margin-right: 12px;
    font-size: 18px;
  }
  
  span {
    font-size: 14px;
    opacity: 0.9;
  }
`;

const RightPanel = styled.div`
  flex: 1;
  padding: 60px 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: ${colors.white};
  
  @media (max-width: 768px) {
    padding: 40px 30px;
  }
`;

const LoginHeader = styled.div`
  text-align: center;
  margin-bottom: 40px;
`;

const LoginTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: ${colors.darkGray};
`;

const LoginSubtitle = styled.p`
  color: ${colors.darkGray};
  opacity: 0.7;
  font-size: 14px;
`;

const FormContainer = styled.div`
  width: 100%;
`;

const RegisterSection = styled.div`
  text-align: center;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid ${colors.lightGray};
  color: ${colors.darkGray};
  font-size: 14px;
`;

const RegisterLink = styled(Link)`
  color: ${colors.magenta};
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  
  &:hover {
    color: ${colors.cyan};
    text-decoration: underline;
  }
`;

const FloatingElements = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
  
  &::before {
    content: '';
    position: absolute;
    top: 10%;
    right: 15%;
    width: 40px;
    height: 40px;
    background: ${colors.lime};
    opacity: 0.6;
    transform: rotate(45deg);
    animation: bounce 3s ease-in-out infinite;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: 20%;
    left: 10%;
    width: 30px;
    height: 30px;
    background: ${colors.cyan};
    opacity: 0.4;
    border-radius: 50%;
    animation: bounce 4s ease-in-out infinite reverse;
  }
  
  @keyframes bounce {
    0%, 100% { transform: translateY(0) rotate(45deg); }
    50% { transform: translateY(-20px) rotate(45deg); }
  }
`;

const Login = () => {
  return (
    <LoginPageContainer>
      <FloatingElements />
      <LoginWrapper>
        <LeftPanel>
          <WelcomeContent>
            <LogoSection>
              <Logo>AI</Logo>
              <LogoText>
                <LogoTitle>AI 학습 지원</LogoTitle>
                <LogoSubtitle>Smart Note System</LogoSubtitle>
              </LogoText>
            </LogoSection>
            
            <WelcomeTitle>다시 오신 것을 환영합니다!</WelcomeTitle>
            <WelcomeSubtitle>
              AI와 함께하는 스마트한 학습 여정을 계속하세요. 
              더 효율적이고 체계적인 노트 관리가 기다리고 있습니다.
            </WelcomeSubtitle>
            
            <FeatureList>
              <FeatureItem>
                <span>AI 기반 자동 노트 정리 및 태그 생성</span>
              </FeatureItem>
              <FeatureItem>
                <span>음성을 텍스트로 실시간 변환</span>
              </FeatureItem>
              <FeatureItem>
                <span>개인화된 학습 분석 및 추천</span>
              </FeatureItem>
              <FeatureItem>
                <span>다국어 번역 및 요약 기능</span>
              </FeatureItem>
            </FeatureList>
          </WelcomeContent>
        </LeftPanel>
        
        <RightPanel>
          <LoginHeader>
            <LoginTitle>로그인</LoginTitle>
            <LoginSubtitle>계정에 로그인하여 시작하세요</LoginSubtitle>
          </LoginHeader>
          
          <FormContainer>
            <LoginForm />
          </FormContainer>
          
          <RegisterSection>
            아직 계정이 없으신가요? <RegisterLink to="/register">회원가입</RegisterLink>
          </RegisterSection>
        </RightPanel>
      </LoginWrapper>
    </LoginPageContainer>
  );
};

export default Login;