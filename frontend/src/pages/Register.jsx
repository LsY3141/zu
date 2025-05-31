import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import RegisterForm from '../components/auth/RegisterForm';

const RegisterPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  background-color: ${({ theme }) => theme.colors.background};
`;

const RegisterCard = styled.div`
  width: 100%;
  max-width: 450px;
  background-color: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.boxShadow.card};
  overflow: hidden;
`;

const RegisterHeader = styled.div`
  padding: 30px 20px;
  text-align: center;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const Logo = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 24px;
  margin: 0 auto 15px;
`;

const Title = styled.h1`
  font-size: 24px;
  margin: 0 0 10px;
  color: ${({ theme }) => theme.colors.text};
`;

const Subtitle = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const RegisterBody = styled.div`
  padding: 30px;
`;

const LoginText = styled.div`
  text-align: center;
  margin-top: 20px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const LoginLink = styled(Link)`
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
  font-weight: 500;
  
  &:hover {
    text-decoration: underline;
  }
`;

const Register = () => {
  return (
    <RegisterPageContainer>
      <RegisterCard>
        <RegisterHeader>
          <Logo>AI</Logo>
          <Title>AI 학습 지원 서비스</Title>
          <Subtitle>새 계정 만들기</Subtitle>
        </RegisterHeader>
        
        <RegisterBody>
          <RegisterForm />
          
          <LoginText>
            이미 계정이 있으신가요? <LoginLink to="/login">로그인</LoginLink>
          </LoginText>
        </RegisterBody>
      </RegisterCard>
    </RegisterPageContainer>
  );
};

export default Register;