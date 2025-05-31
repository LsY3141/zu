import React, { useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { closeConfirmDialog } from '../../redux/slices/uiSlice';
import Button from './Button';

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

const DialogContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.boxShadow.card};
  width: 100%;
  max-width: 400px;
  animation: ${scaleIn} 0.2s ease-out;
`;

const DialogHeader = styled.div`
  padding: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const DialogTitle = styled.h3`
  margin: 0;
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.heading3};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
`;

const DialogBody = styled.div`
  padding: 16px;
  color: ${({ theme }) => theme.colors.text};
`;

const DialogFooter = styled.div`
  padding: 12px 16px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

const ConfirmDialog = () => {
  const dispatch = useDispatch();
  const { isConfirmDialogOpen, confirmDialogProps } = useSelector(state => state.ui);
  
  const handleConfirm = () => {
    // 직접 함수 참조를 통해 실행
    if (confirmDialogProps.onConfirm) {
      try {
        confirmDialogProps.onConfirm();
      } catch (error) {
        console.error('확인 콜백 실행 오류:', error);
      }
    }
    dispatch(closeConfirmDialog());
  };
  
  const handleCancel = () => {
    // 직접 함수 참조를 통해 실행
    if (confirmDialogProps.onCancel) {
      try {
        confirmDialogProps.onCancel();
      } catch (error) {
        console.error('취소 콜백 실행 오류:', error);
      }
    }
    dispatch(closeConfirmDialog());
  };
  
  useEffect(() => {
    if (isConfirmDialogOpen) {
      // 다이얼로그가 열릴 때 스크롤 방지
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isConfirmDialogOpen]);
  
  if (!isConfirmDialogOpen) return null;
  
  return (
    <Overlay onClick={handleCancel}>
      <DialogContainer onClick={e => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>{confirmDialogProps.title}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          {confirmDialogProps.message}
        </DialogBody>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
          >
            {confirmDialogProps.cancelText || '취소'}
          </Button>
          <Button
            variant={confirmDialogProps.danger ? 'danger' : 'primary'}
            onClick={handleConfirm}
          >
            {confirmDialogProps.confirmText || '확인'}
          </Button>
        </DialogFooter>
      </DialogContainer>
    </Overlay>
  );
};

export default ConfirmDialog;