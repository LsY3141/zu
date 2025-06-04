import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import RegisterForm from '../components/auth/RegisterForm';
import { FaCheckCircle, FaShieldAlt, FaUsers, FaRocket } from 'react-icons/fa';

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
    25% { transform: translate(-15px, -15px) rotate(0.5deg); }
    50% { transform: translate(15px, -8px) rotate(-0.5deg); }
    75% { transform: translate(-8px, 15px) rotate(0.3deg); }
  `,
  slideIn: `
    0% { transform: translateX(-30px); opacity: 0; }
    100% { transform: translateX(0); opacity: 1; }
  `,
  fadeIn: `
    0% { opacity: 0; transform: translateY(20px); }
    100% { opacity: 1; transform: translateY(0); }
  `
};

// Responsive breakpoints
const breakpoints = {
  mobile: '768px'
};

// Common styled component patterns
const ClipPath = {
  rectangle: 'polygon(0 0, calc(100% - 20px) 0, 100% 100%, 20px 100%)',
  button: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 12px 100%)',
  card: 'polygon(0 0, calc(100% - 8px) 0, 100% 100%, 8px 100%)'
};

const RegisterPageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, ${colors.darkGray} 0%, ${colors.magenta} 50%, ${colors.cyan} 100%);
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
    background: url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M40 0l40 40-40 40L0 40z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    animation: float 25s ease-in-out infinite;
  }
  
  @keyframes float {
    ${animations.float}
  }
`;

const RegisterWrapper = styled.div`
  display: flex;
  width: 100%;
  max-width: 1200px;
  background: ${colors.white};
  border-radius: 0;
  box-shadow: 0 25px 80px rgba(0,0,0,0.2);
  overflow: hidden;
  position: relative;
  z-index: 2;
  clip-path: ${ClipPath.rectangle};
  
  @media (max-width: ${breakpoints.mobile}) {
    flex-direction: column;
    max-width: 420px;
  }
`;

const LeftPanel = styled.div`
  flex: 1.2;
  background: linear-gradient(135deg, ${colors.darkGray} 0%, ${colors.magenta} 70%, ${colors.cyan} 100%);
  color: white;
  padding: 60px 50px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -20px;
    right: -20px;
    width: 150px;
    height: 150px;
    background: ${colors.lime};
    opacity: 0.1;
    border-radius: 50%;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -40px;
    left: -40px;
    width: 180px;
    height: 180px;
    background: ${colors.cyan};
    opacity: 0.15;
    clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
  }
  
  @media (max-width: ${breakpoints.mobile}) {
    padding: 50px 30px;
    text-align: center;
  }
`;

const WelcomeContent = styled.div`
  position: relative;
  z-index: 2;
  animation: slideIn 0.8s ease-out;
  
  @keyframes slideIn {
    ${animations.slideIn}
  }
`;

const LogoSection = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 40px;
  
  @media (max-width: ${breakpoints.mobile}) {
    justify-content: center;
  }
`;

const Logo = styled.div`
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, ${colors.cyan} 0%, ${colors.lime} 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 28px;
  margin-right: 20px;
  clip-path: ${ClipPath.button};
  box-shadow: 0 6px 20px rgba(0, 188, 212, 0.4);
`;

const LogoText = styled.div`
  display: flex;
  flex-direction: column;
`;

const LogoTitle = styled.div`
  font-size: 22px;
  font-weight: bold;
  line-height: 1;
`;

const LogoSubtitle = styled.div`
  font-size: 13px;
  color: ${colors.cyan};
  opacity: 0.9;
  margin-top: 4px;
  font-weight: 500;
`;

const WelcomeTitle = styled.h1`
  font-size: 2.4rem;
  font-weight: 700;
  margin-bottom: 24px;
  background: linear-gradient(90deg, ${colors.white} 0%, ${colors.cyan} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.2;
  
  @media (max-width: ${breakpoints.mobile}) {
    font-size: 2rem;
  }
`;

const WelcomeSubtitle = styled.p`
  font-size: 1.2rem;
  opacity: 0.95;
  line-height: 1.7;
  margin-bottom: 40px;
  font-weight: 300;
  
  @media (max-width: ${breakpoints.mobile}) {
    font-size: 1.1rem;
  }
`;

const BenefitsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const BenefitItem = styled.div`
  display: flex;
  align-items: flex-start;
  animation: fadeIn 0.6s ease-out;
  animation-delay: ${props => props.delay || '0s'};
  animation-fill-mode: both;
  
  @keyframes fadeIn {
    ${animations.fadeIn}
  }
`;

const BenefitIcon = styled.div`
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, ${colors.cyan}20, ${colors.lime}20);
  border: 2px solid ${colors.cyan}50;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  clip-path: ${ClipPath.card};
  color: ${colors.cyan};
  font-size: 16px;
  flex-shrink: 0;
`;

const BenefitContent = styled.div`
  flex: 1;
`;

const BenefitTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 6px;
  color: ${colors.white};
`;

const BenefitDescription = styled.p`
  font-size: 14px;
  opacity: 0.85;
  line-height: 1.5;
  margin: 0;
`;

const RightPanel = styled.div`
  flex: 1;
  padding: 60px 50px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: ${colors.white};
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 30px;
    right: 30px;
    width: 60px;
    height: 60px;
    background: ${colors.magenta}10;
    transform: rotate(45deg);
  }
  
  @media (max-width: ${breakpoints.mobile}) {
    padding: 50px 30px;
  }
`;

const RegisterHeader = styled.div`
  text-align: center;
  margin-bottom: 40px;
`;

const RegisterTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 12px;
  color: ${colors.darkGray};
  background: linear-gradient(135deg, ${colors.darkGray} 0%, ${colors.magenta} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const RegisterSubtitle = styled.p`
  color: ${colors.darkGray};
  opacity: 0.8;
  font-size: 15px;
  font-weight: 400;
  line-height: 1.5;
`;

const StyledFormContainer = styled.div`
  width: 100%;
  
  /* Override the default button styling for register form */
  button[type="submit"] {
    background: linear-gradient(135deg, ${colors.magenta} 0%, ${colors.cyan} 100%) !important;
    border: none !important;
    color: white !important;
    clip-path: ${ClipPath.button};
    transition: all 0.3s ease !important;
    box-shadow: 0 4px 15px rgba(233, 30, 99, 0.3) !important;
    font-weight: 600 !important;
    
    &:hover:not(:disabled) {
      background: linear-gradient(135deg, ${colors.cyan} 0%, ${colors.lime} 100%) !important;
      transform: translateY(-2px) !important;
      box-shadow: 0 8px 25px rgba(0, 188, 212, 0.4) !important;
    }
    
    &:disabled {
      background: ${colors.lightGray} !important;
      transform: none !important;
      box-shadow: none !important;
    }
  }
`;

const LoginSection = styled.div`
  text-align: center;
  margin-top: 30px;
  padding-top: 25px;
  border-top: 1px solid ${colors.lightGray};
  color: ${colors.darkGray};
  font-size: 14px;
`;

const LoginLink = styled(Link)`
  color: ${colors.magenta};
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  
  &:hover {
    color: ${colors.cyan};
    text-decoration: underline;
  }
`;

const SecurityBadge = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 20px;
  padding: 12px 20px;
  background: linear-gradient(135deg, ${colors.lime}10, ${colors.cyan}10);
  border: 1px solid ${colors.lime}30;
  clip-path: ${ClipPath.card};
  font-size: 12px;
  color: ${colors.darkGray};
  font-weight: 500;
  
  svg {
    color: ${colors.lime};
    font-size: 14px;
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
    top: 15%;
    right: 10%;
    width: 50px;
    height: 50px;
    background: ${colors.lime};
    opacity: 0.4;
    transform: rotate(45deg);
    animation: float1 4s ease-in-out infinite;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: 25%;
    left: 8%;
    width: 35px;
    height: 35px;
    background: ${colors.cyan};
    opacity: 0.3;
    border-radius: 50%;
    animation: float2 5s ease-in-out infinite reverse;
  }
  
  @keyframes float1 {
    0%, 100% { transform: translateY(0) rotate(45deg); }
    50% { transform: translateY(-25px) rotate(45deg); }
  }
  
  @keyframes float2 {
    0%, 100% { transform: translateY(0) scale(1); }
    50% { transform: translateY(-20px) scale(1.1); }
  }
`;

// Benefits data
const benefits = [
  {
    icon: FaRocket,
    title: '빠른 시작',
    description: '3분 만에 계정을 만들고 즉시 AI 노트 작성을 시작하세요',
    delay: '0.2s'
  },
  {
    icon: FaShieldAlt,
    title: '안전한 보안',
    description: '업계 표준 암호화로 귀하의 학습 데이터를 안전하게 보호합니다',
    delay: '0.4s'
  },
  {
    icon: FaUsers,
    title: '협업 기능',
    description: '팀원들과 노트를 공유하고 함께 학습 목표를 달성하세요',
    delay: '0.6s'
  },
  {
    icon: FaCheckCircle,
    title: '무료 체험',
    description: '모든 기능을 30일간 무료로 체험하고 효과를 직접 확인하세요',
    delay: '0.8s'
  }
];

const Register = () => {
  return (
    <RegisterPageContainer>
      <FloatingElements />
      <RegisterWrapper>
        <LeftPanel>
          <WelcomeContent>
            <LogoSection>
              <Logo>AI</Logo>
              <LogoText>
                <LogoTitle>AI 학습 지원</LogoTitle>
                <LogoSubtitle>Smart Note System</LogoSubtitle>
              </LogoText>
            </LogoSection>
            
            <WelcomeTitle>
              스마트한 학습의<br />
              새로운 시작
            </WelcomeTitle>
            <WelcomeSubtitle>
              AI 기술과 함께 더 효율적이고 체계적인 학습 환경을 구축하세요. 
              수많은 전문가들이 선택한 혁신적인 노트 관리 솔루션입니다.
            </WelcomeSubtitle>
            
            <BenefitsList>
              {benefits.map((benefit, index) => {
                const IconComponent = benefit.icon;
                return (
                  <BenefitItem key={index} delay={benefit.delay}>
                    <BenefitIcon>
                      <IconComponent />
                    </BenefitIcon>
                    <BenefitContent>
                      <BenefitTitle>{benefit.title}</BenefitTitle>
                      <BenefitDescription>{benefit.description}</BenefitDescription>
                    </BenefitContent>
                  </BenefitItem>
                );
              })}
            </BenefitsList>
          </WelcomeContent>
        </LeftPanel>
        
        <RightPanel>
          <RegisterHeader>
            <RegisterTitle>계정 만들기</RegisterTitle>
            <RegisterSubtitle>
              몇 가지 정보만 입력하시면 바로 시작할 수 있습니다.<br />
              이미 수천 명의 학습자가 함께하고 있어요.
            </RegisterSubtitle>
          </RegisterHeader>
          
          <StyledFormContainer>
            <RegisterForm />
          </StyledFormContainer>
          
          <SecurityBadge>
            <FaShieldAlt />
            SSL 암호화로 안전하게 보호됩니다
          </SecurityBadge>
          
          <LoginSection>
            이미 계정이 있으신가요? <LoginLink to="/login">로그인</LoginLink>
          </LoginSection>
        </RightPanel>
      </RegisterWrapper>
    </RegisterPageContainer>
  );
};

export default Register;