// src/components/shared/ShareModal.jsx
import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { useDispatch } from 'react-redux';
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
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (emailError) {
      setEmailError('');
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 이메일 유효성 검사
    if (!email.trim()) {
      setEmailError('이메일을 입력해주세요.');
      return;
    }
    
    if (!validateEmail(email.trim())) {
      setEmailError('유효한 이메일 주소를 입력해주세요.');
      return;
    }
    
    setLoading(true);
    
    try {
      await dispatch(shareNote({
        id: note._id,
        shareData: { email: email.trim() }
      })).unwrap();
      
      dispatch(showNotification({
        message: `${email}님과 노트가 공유되었습니다.`,
        type: 'success'
      }));
      
      // 모달 닫기 및 상태 초기화
      setEmail('');
      setEmailError('');
      onClose();
      
    } catch (error) {
      dispatch(showNotification({
        message: error.message || '공유 중 오류가 발생했습니다.',
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
            노트 공유하기
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
            <SectionTitle>공유받을 사용자</SectionTitle>
            <SectionDescription>
              공유받을 사용자의 이메일 주소를 입력하세요. 해당 사용자가 서비스에 가입되어 있어야 합니다.
            </SectionDescription>
            
            <form onSubmit={handleSubmit}>
              <Input
                type="email"
                label="이메일 주소"
                placeholder="example@email.com"
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
            취소
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !email.trim()}
            icon={<FaShare />}
          >
            {loading ? '공유 중...' : '공유하기'}
          </Button>
        </ModalFooter>
      </ModalContainer>
    </Overlay>
  );
};

export default ShareModal;