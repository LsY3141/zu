import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import LoginForm from '../components/auth/LoginForm';

const LoginPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  background-color: ${({ theme }) => theme.colors.background};
`;

const LoginCard = styled.div`
  width: 100%;
  max-width: 450px;
  background-color: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.boxShadow.card};
  overflow: hidden;
`;

const LoginHeader = styled.div`
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

const LoginBody = styled.div`
  padding: 30px;
`;

const RegisterText = styled.div`
  text-align: center;
  margin-top: 20px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const RegisterLink = styled(Link)`
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
  font-weight: 500;
  
  &:hover {
    text-decoration: underline;
  }
`;

const Login = () => {
  return (
    <LoginPageContainer>
      <LoginCard>
        <LoginHeader>
          <Logo>AI</Logo>
          <Title>AI 학습 지원 서비스</Title>
          <Subtitle>계정에 로그인하세요</Subtitle>
        </LoginHeader>
        
        <LoginBody>
          <LoginForm />
          
          <RegisterText>
            계정이 없으신가요? <RegisterLink to="/register">회원가입</RegisterLink>
          </RegisterText>
        </LoginBody>
      </LoginCard>
    </LoginPageContainer>
  );
};

export default Login;