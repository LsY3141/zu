import React, { useEffect, useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { clearNotification } from '../../redux/slices/uiSlice';
import { FaCheckCircle, FaInfoCircle, FaExclamationTriangle, FaTimesCircle, FaTimes } from 'react-icons/fa';

const slideIn = keyframes`
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(-100%);
    opacity: 0;
  }
`;

const NotificationContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1010;
  max-width: 350px;
  background-color: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  box-shadow: ${({ theme }) => theme.boxShadow.card};
  overflow: hidden;
  
  ${({ isClosing }) => isClosing
    ? css`animation: ${slideOut} 0.3s forwards;`
    : css`animation: ${slideIn} 0.3s;`
  }
  
  ${({ type, theme }) => {
    switch (type) {
      case 'success':
        return css`border-left: 4px solid ${theme.colors.success};`;
      case 'error':
        return css`border-left: 4px solid ${theme.colors.danger};`;
      case 'warning':
        return css`border-left: 4px solid ${theme.colors.warning};`;
      default:
        return css`border-left: 4px solid ${theme.colors.info};`;
    }
  }}
`;

const NotificationContent = styled.div`
  display: flex;
  align-items: center;
  padding: 16px;
`;

const IconContainer = styled.div`
  margin-right: 12px;
  font-size: 20px;
  
  ${({ type, theme }) => {
    switch (type) {
      case 'success':
        return css`color: ${theme.colors.success};`;
      case 'error':
        return css`color: ${theme.colors.danger};`;
      case 'warning':
        return css`color: ${theme.colors.warning};`;
      default:
        return css`color: ${theme.colors.info};`;
    }
  }}
`;

const MessageContainer = styled.div`
  flex: 1;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: ${({ theme }) => theme.colors.textSecondary};
  opacity: 0.6;
  transition: opacity 0.2s;
  
  &:hover {
    opacity: 1;
  }
`;

const getNotificationIcon = (type) => {
  switch (type) {
    case 'success':
      return <FaCheckCircle />;
    case 'error':
      return <FaTimesCircle />;
    case 'warning':
      return <FaExclamationTriangle />;
    default:
      return <FaInfoCircle />;
  }
};

const Notification = () => {
  const dispatch = useDispatch();
  const notification = useSelector(state => state.ui.notification);
  const [isClosing, setIsClosing] = useState(false);
  
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      dispatch(clearNotification());
      setIsClosing(false);
    }, 300);
  };
  
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        handleClose();
      }, notification.duration || 3000);
      
      return () => clearTimeout(timer);
    }
  }, [notification]);
  
  if (!notification) return null;
  
  return (
    <NotificationContainer type={notification.type} isClosing={isClosing}>
      <NotificationContent>
        <IconContainer type={notification.type}>
          {getNotificationIcon(notification.type)}
        </IconContainer>
        <MessageContainer>
          {notification.message}
        </MessageContainer>
        <CloseButton onClick={handleClose}>
          <FaTimes />
        </CloseButton>
      </NotificationContent>
    </NotificationContainer>
  );
};

export default Notification;