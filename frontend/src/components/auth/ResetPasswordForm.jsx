import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { FaLock, FaCheck } from 'react-icons/fa';
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

const ResetPasswordForm = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  
  const [formErrors, setFormErrors] = useState({
    password: '',
    confirmPassword: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const validateForm = () => {
    const errors = {};
    
    if (!formData.password) {
      errors.password = '새 비밀번호를 입력해주세요.';
    } else if (formData.password.length < 6) {
      errors.password = '비밀번호는 6자 이상이어야 합니다.';
    }
    
    if (!formData.confirmPassword) {
      errors.confirmPassword = '비밀번호 확인을 입력해주세요.';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = '비밀번호가 일치하지 않습니다.';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // 입력 시 해당 필드의 에러 메시지 초기화
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setLoading(true);
      setError(null);
      setMessage(null);
      
      try {
        const response = await authApi.resetPassword({
          token,
          password: formData.password,
        });
        
        setMessage(response.data.message || '비밀번호가 성공적으로 재설정되었습니다.');
        setSuccess(true);
        
        // 3초 후 로그인 페이지로 리다이렉트
        setTimeout(() => {
          navigate('/login');
        }, 3000);
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
      
      {!success ? (
        <>
          <InfoText>
            새로운 비밀번호를 입력해주세요.
          </InfoText>
          
          <Input
            type="password"
            name="password"
            label="새 비밀번호"
            placeholder="새 비밀번호를 입력하세요"
            value={formData.password}
            onChange={handleChange}
            icon={<FaLock />}
            error={formErrors.password}
            required
          />
          
          <Input
            type="password"
            name="confirmPassword"
            label="새 비밀번호 확인"
            placeholder="새 비밀번호를 다시 입력하세요"
            value={formData.confirmPassword}
            onChange={handleChange}
            icon={<FaLock />}
            error={formErrors.confirmPassword}
            required
          />
          
          <Button
            type="submit"
            fullWidth
            disabled={loading}
            icon={<FaCheck />}
            style={{ marginTop: '20px' }}
          >
            {loading ? '처리 중...' : '비밀번호 재설정'}
          </Button>
        </>
      ) : (
        <InfoText>
          비밀번호가 성공적으로 재설정되었습니다. 잠시 후 로그인 페이지로 이동합니다.
        </InfoText>
      )}
    </FormContainer>
  );
};

export default ResetPasswordForm;