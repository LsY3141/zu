import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import ForgotPasswordForm from '../components/auth/ForgotPasswordForm';

const ForgotPasswordPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  background-color: ${({ theme }) => theme.colors.background};
`;

const ForgotPasswordCard = styled.div`
  width: 100%;
  max-width: 450px;
  background-color: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.boxShadow.card};
  overflow: hidden;
`;

const ForgotPasswordHeader = styled.div`
  padding: 30px 20px;
  text-align: center;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
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

const ForgotPasswordBody = styled.div`
  padding: 30px;
`;

const BackToLoginLink = styled(Link)`
  display: block;
  text-align: center;
  margin-top: 20px;
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
  font-weight: 500;
  
  &:hover {
    text-decoration: underline;
  }
`;

const ForgotPassword = () => {
  return (
    <ForgotPasswordPageContainer>
      <ForgotPasswordCard>
        <ForgotPasswordHeader>
          <Title>비밀번호 찾기</Title>
          <Subtitle>비밀번호 재설정 링크를 이메일로 보내드립니다.</Subtitle>
        </ForgotPasswordHeader>
        
        <ForgotPasswordBody>
          <ForgotPasswordForm />
          
          <BackToLoginLink to="/login">
            로그인 페이지로 돌아가기
          </BackToLoginLink>
        </ForgotPasswordBody>
      </ForgotPasswordCard>
    </ForgotPasswordPageContainer>
  );
};

export default ForgotPassword;