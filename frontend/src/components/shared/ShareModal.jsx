// src/components/shared/ShareModal.jsx
import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { FaShare, FaTimes, FaEnvelope, FaUser } from 'react-icons/fa';
import { shareNote } from '../../redux/slices/noteSlice';
import { showNotification } from '../../redux/slices/uiSlice';
import Button from './Button';
import Input from './Input';
import Alert from './Alert';

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const scaleIn = keyframes`
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: ${fadeIn} 0.2s ease-out;
`;

const ModalContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.boxShadow.card};
  width: 100%;
  max-width: 500px;
  animation: ${scaleIn} 0.2s ease-out;
  margin: 20px;
`;

const ModalHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.h3`
  margin: 0;
  color: ${({ theme }) => theme.colors.text};
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 10px;
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  color: ${({ theme }) => theme.colors.textSecondary};
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ModalBody = styled.div`
  padding: 20px;
`;

const NoteInfo = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  padding: 15px;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  margin-bottom: 20px;
`;

const NoteTitle = styled.div`
  font-weight: 600;
  margin-bottom: 5px;
  color: ${({ theme }) => theme.colors.text};
`;

const NotePreview = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const FormSection = styled.div`
  margin-bottom: 20px;
`;

const SectionTitle = styled.h4`
  margin: 0 0 10px 0;
  font-size: 16px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
`;

const SectionDescription = styled.p`
  margin: 0 0 15px 0;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.4;
`;

const ModalFooter = styled.div`
  padding: 20px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const ShareModal = ({ isOpen, onClose, note }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    
    if (emailError && value.trim()) {
      setEmailError('');
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setEmailError(t('login.form.email.required'));
      return;
    }
    
    if (!validateEmail(email.trim())) {
      setEmailError(t('login.form.email.invalid'));
      return;
    }
    
    setLoading(true);
    
    try {
      await dispatch(shareNote({
        id: note._id,
        shareData: { email: email.trim() }
      })).unwrap();
      
      dispatch(showNotification({
        message: t('shareModal.messages.success', { email }),
        type: 'success'
      }));
      
      // 모달 닫기 및 상태 초기화
      setEmail('');
      setEmailError('');
      onClose();
      
    } catch (error) {
      dispatch(showNotification({
        message: error.message || t('shareModal.messages.error'),
        type: 'error'
      }));
    } finally {
      setLoading(false);
    }
  };
  
  const handleClose = () => {
    if (!loading) {
      setEmail('');
      setEmailError('');
      onClose();
    }
  };
  
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };
  
  if (!isOpen || !note) return null;
  
  return (
    <Overlay onClick={handleOverlayClick}>
      <ModalContainer onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>
            <FaShare />
            {t('shareModal.title')}
          </ModalTitle>
          <CloseButton onClick={handleClose} disabled={loading}>
            <FaTimes />
          </CloseButton>
        </ModalHeader>
        
        <ModalBody>
          <NoteInfo>
            <NoteTitle>{note.title}</NoteTitle>
            <NotePreview>{note.content}</NotePreview>
          </NoteInfo>
          
          <FormSection>
            <SectionTitle>{t('shareModal.form.recipient')}</SectionTitle>
            <SectionDescription>
              {t('shareModal.form.recipientDescription')}
            </SectionDescription>
            
            <form onSubmit={handleSubmit}>
              <Input
                type="email"
                label={t('shareModal.form.emailLabel')}
                placeholder={t('shareModal.form.emailPlaceholder')}
                value={email}
                onChange={handleEmailChange}
                error={emailError}
                icon={<FaEnvelope />}
                disabled={loading}
                required
              />
            </form>
          </FormSection>
          
          {emailError && (
            <Alert
              variant="error"
              message={emailError}
              marginBottom="0"
            />
          )}
        </ModalBody>
        
        <ModalFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            {t('shareModal.actions.cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !email.trim()}
            icon={<FaShare />}
          >
            {loading ? t('shareModal.actions.sharing') : t('shareModal.actions.share')}
          </Button>
        </ModalFooter>
      </ModalContainer>
    </Overlay>
  );
};

export default ShareModal;