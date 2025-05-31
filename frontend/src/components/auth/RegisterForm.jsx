import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { FaUser, FaEnvelope, FaLock, FaUserPlus } from 'react-icons/fa';
import { register, clearError } from '../../redux/slices/authSlice';
import Input from '../shared/Input';
import Button from '../shared/Button';
import Alert from '../shared/Alert';
import Select from '../shared/Select';

const FormContainer = styled.form`
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
`;

const RegisterForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector(state => state.auth);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    language: 'ko',
  });
  
  const [formErrors, setFormErrors] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  const languageOptions = [
    { value: 'ko', label: '한국어' },
    { value: 'en', label: '영어' },
    { value: 'ja', label: '일본어' },
    { value: 'zh', label: '중국어' },
  ];
  
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
    
    if (!formData.username) {
      errors.username = '사용자명을 입력해주세요.';
    } else if (formData.username.length < 3) {
      errors.username = '사용자명은 3자 이상이어야 합니다.';
    }
    
    if (!formData.email) {
      errors.email = '이메일을 입력해주세요.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = '유효한 이메일 형식이 아닙니다.';
    }
    
    if (!formData.password) {
      errors.password = '비밀번호를 입력해주세요.';
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
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const { confirmPassword, ...registerData } = formData;
      dispatch(register(registerData));
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
        type="text"
        name="username"
        label="사용자명"
        placeholder="사용자명을 입력하세요"
        value={formData.username}
        onChange={handleChange}
        icon={<FaUser />}
        error={formErrors.username}
        required
      />
      
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
      
      <Input
        type="password"
        name="confirmPassword"
        label="비밀번호 확인"
        placeholder="비밀번호를 다시 입력하세요"
        value={formData.confirmPassword}
        onChange={handleChange}
        icon={<FaLock />}
        error={formErrors.confirmPassword}
        required
      />
      
      <Select
        name="language"
        label="기본 언어"
        value={formData.language}
        onChange={handleChange}
        options={languageOptions}
      />
      
      <Button
        type="submit"
        fullWidth
        disabled={loading}
        icon={<FaUserPlus />}
        style={{ marginTop: '20px' }}
      >
        {loading ? '가입 중...' : '회원가입'}
      </Button>
    </FormContainer>
  );
};

export default RegisterForm;