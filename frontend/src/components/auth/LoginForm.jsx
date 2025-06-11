import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { FaEnvelope, FaLock, FaSignInAlt } from 'react-icons/fa';
import { login, clearError } from '../../redux/slices/authSlice';
import Input from '../shared/Input';
import Button from '../shared/Button';
import Alert from '../shared/Alert';

const FormContainer = styled.form`
  width: 100%;
`;

const ForgotPasswordLink = styled(Link)`
  display: block;
  text-align: right;
  margin: 10px 0 20px;
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
  font-size: 14px;
  
  &:hover {
    text-decoration: underline;
  }
`;

const LoginForm = () => {
  const { t } = useTranslation();
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
      errors.email = t('login.form.email.required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = t('login.form.email.invalid');
    }
    
    if (!formData.password) {
      errors.password = t('login.form.password.required');
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
        label={t('login.form.email.label')}
        placeholder={t('login.form.email.placeholder')}
        value={formData.email}
        onChange={handleChange}
        icon={<FaEnvelope />}
        error={formErrors.email}
        required
      />
      
      <Input
        type="password"
        name="password"
        label={t('login.form.password.label')}
        placeholder={t('login.form.password.placeholder')}
        value={formData.password}
        onChange={handleChange}
        icon={<FaLock />}
        error={formErrors.password}
        required
      />
      
      <ForgotPasswordLink to="/forgot-password">
        {t('login.form.forgotPassword')}
      </ForgotPasswordLink>
      
      <Button
        type="submit"
        fullWidth
        disabled={loading}
        icon={<FaSignInAlt />}
        style={{
          background: 'linear-gradient(135deg, #E91E63 0%, #00BCD4 100%)',
          border: 'none',
          clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 12px 100%)',
          boxShadow: '0 4px 15px rgba(233, 30, 99, 0.3)',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.background = 'linear-gradient(135deg, #00BCD4 0%, #8BC34A 100%)';
          e.target.style.transform = 'translateY(-2px)';
          e.target.style.boxShadow = '0 8px 25px rgba(0, 188, 212, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'linear-gradient(135deg, #E91E63 0%, #00BCD4 100%)';
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = '0 4px 15px rgba(233, 30, 99, 0.3)';
        }}
      >
        {loading ? t('login.form.loggingIn') : t('login.form.loginButton')}
      </Button>
    </FormContainer>
  );
};

export default LoginForm;