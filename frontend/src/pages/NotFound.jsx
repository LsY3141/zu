import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaExclamationTriangle, FaHome } from 'react-icons/fa';
import Button from '../components/shared/Button';

const NotFoundContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  padding: 20px;
  text-align: center;
  background-color: ${({ theme }) => theme.colors.background};
`;

const ErrorIcon = styled.div`
  font-size: 64px;
  color: ${({ theme }) => theme.colors.warning};
  margin-bottom: 20px;
`;

const ErrorCode = styled.h1`
  font-size: 48px;
  font-weight: 700;
  margin: 0 0 10px;
  color: ${({ theme }) => theme.colors.text};
`;

const ErrorTitle = styled.h2`
  font-size: 24px;
  font-weight: 500;
  margin: 0 0 20px;
  color: ${({ theme }) => theme.colors.text};
`;

const ErrorMessage = styled.p`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.textSecondary};
  max-width: 500px;
  margin: 0 auto 30px;
`;

const NotFound = () => {
  return (
    <NotFoundContainer>
      <ErrorIcon>
        <FaExclamationTriangle />
      </ErrorIcon>
      <ErrorCode>404</ErrorCode>
      <ErrorTitle>페이지를 찾을 수 없습니다</ErrorTitle>
      <ErrorMessage>
        찾으시는 페이지가 존재하지 않거나, 사용할 수 없거나, 이동되었을 수 있습니다.
        URL을 확인하거나 아래 버튼을 클릭하여 홈으로 이동하세요.
      </ErrorMessage>
      <Button 
        as={Link} 
        to="/"
        icon={<FaHome />}
      >
        홈으로 이동
      </Button>
    </NotFoundContainer>
  );
};

export default NotFound;