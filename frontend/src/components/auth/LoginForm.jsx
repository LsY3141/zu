import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { FaEnvelope, FaLock, FaSignInAlt } from 'react-icons/fa';
import { login, clearError } from '../../redux/slices/authSlice';
import Input from '../shared/Input';
import Button from '../shared/Button';
import Alert from '../shared/Alert';

const FormContainer = styled.form`
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
`;

const ForgotPasswordLink = styled(Link)`
  display: block;
  text-align: right;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.primary};
  margin-top: -10px;
  margin-bottom: 20px;
  
  &:hover {
    text-decoration: underline;
  }
`;

const LoginForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector(state => state.auth);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const [formErrors, setFormErrors] = useState({
    email: '',
    password: '',
  });
  
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
    
    return () => {
      dispatch(clearError());
    };
  }, [isAuthenticated, navigate, dispatch]);
  
  const validateForm = () => {
    const errors = {};
    
    if (!formData.email) {
      errors.email = '이메일을 입력해주세요.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = '유효한 이메일 형식이 아닙니다.';
    }
    
    if (!formData.password) {
      errors.password = '비밀번호를 입력해주세요.';
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
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      dispatch(login(formData));
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
      
      <Input
        type="email"
        name="email"
        label="이메일"
        placeholder="이메일 주소를 입력하세요"
        value={formData.email}
        onChange={handleChange}
        icon={<FaEnvelope />}
        error={formErrors.email}
        required
      />
      
      <Input
        type="password"
        name="password"
        label="비밀번호"
        placeholder="비밀번호를 입력하세요"
        value={formData.password}
        onChange={handleChange}
        icon={<FaLock />}
        error={formErrors.password}
        required
      />
      
      <ForgotPasswordLink to="/forgot-password">
        비밀번호를 잊으셨나요?
      </ForgotPasswordLink>
      
      <Button
        type="submit"
        fullWidth
        disabled={loading}
        icon={<FaSignInAlt />}
      >
        {loading ? '로그인 중...' : '로그인'}
      </Button>
    </FormContainer>
  );
};

export default LoginForm;