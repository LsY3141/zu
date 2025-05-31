import React, { useState } from 'react';
import styled from 'styled-components';
import { FaEnvelope, FaPaperPlane } from 'react-icons/fa';
import authApi from '../../api/authApi';
import Input from '../shared/Input';
import Button from '../shared/Button';
import Alert from '../shared/Alert';

const FormContainer = styled.form`
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
`;

const InfoText = styled.p`
  margin-bottom: 20px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
  line-height: 1.5;
`;

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [sent, setSent] = useState(false);
  
  const validateEmail = () => {
    if (!email) {
      setEmailError('이메일을 입력해주세요.');
      return false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('유효한 이메일 형식이 아닙니다.');
      return false;
    }
    return true;
  };
  
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setEmailError('');
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateEmail()) {
      setLoading(true);
      setError(null);
      setMessage(null);
      
      try {
        const response = await authApi.forgotPassword(email);
        setMessage(response.data.message || '비밀번호 재설정 링크가 이메일로 전송되었습니다.');
        setSent(true);
      } catch (err) {
        setError(err.response?.data?.message || '서버 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    }
  };
  
  return (
    <FormContainer onSubmit={handleSubmit}>
      {error && (
        <Alert
          variant="error"
          message={error}
          marginBottom="20px"
        />
      )}
      
      {message && (
        <Alert
          variant="success"
          message={message}
          marginBottom="20px"
        />
      )}
      
      {!sent ? (
        <>
          <InfoText>
            가입 시 등록한 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.
          </InfoText>
          
          <Input
            type="email"
            name="email"
            label="이메일"
            placeholder="이메일 주소를 입력하세요"
            value={email}
            onChange={handleEmailChange}
            icon={<FaEnvelope />}
            error={emailError}
            required
          />
          
          <Button
            type="submit"
            fullWidth
            disabled={loading}
            icon={<FaPaperPlane />}
            style={{ marginTop: '20px' }}
          >
            {loading ? '처리 중...' : '비밀번호 재설정 링크 받기'}
          </Button>
        </>
      ) : (
        <InfoText>
          입력하신 이메일로 비밀번호 재설정 링크를 발송했습니다. 메일을 확인해주세요.
        </InfoText>
      )}
    </FormContainer>
  );
};

export default ForgotPasswordForm;