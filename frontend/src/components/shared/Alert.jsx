import React, { useState, useEffect } from 'react';
import styled, { css, keyframes } from 'styled-components';
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

const AlertVariants = {
  success: css`
    background-color: #e8f5e9;
    border-left: 4px solid ${({ theme }) => theme.colors.success};
    color: #2e7d32;
    
    svg {
      color: ${({ theme }) => theme.colors.success};
    }
  `,
  info: css`
    background-color: #e3f2fd;
    border-left: 4px solid ${({ theme }) => theme.colors.info};
    color: #0d47a1;
    
    svg {
      color: ${({ theme }) => theme.colors.info};
    }
  `,
  warning: css`
    background-color: #fff8e1;
    border-left: 4px solid ${({ theme }) => theme.colors.warning};
    color: #ff8f00;
    
    svg {
      color: ${({ theme }) => theme.colors.warning};
    }
  `,
  error: css`
    background-color: #ffebee;
    border-left: 4px solid ${({ theme }) => theme.colors.danger};
    color: #c62828;
    
    svg {
      color: ${({ theme }) => theme.colors.danger};
    }
  `,
};

const AlertContainer = styled.div`
  padding: 12px 16px;
  border-radius: 4px;
  margin-bottom: ${({ marginBottom }) => marginBottom || '16px'};
  display: flex;
  align-items: center;
  
  ${({ variant }) => AlertVariants[variant]};
  
  ${({ isClosing }) => isClosing
    ? css`animation: ${slideOut} 0.3s forwards;`
    : css`animation: ${slideIn} 0.3s;`
  }
`;

const IconContainer = styled.div`
  margin-right: 12px;
  display: flex;
  align-items: center;
  font-size: 20px;
`;

const AlertContent = styled.div`
  flex: 1;
`;

const AlertTitle = styled.div`
  font-weight: 600;
  margin-bottom: 4px;
`;

const AlertMessage = styled.div`
  font-size: 14px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: inherit;
  opacity: 0.6;
  transition: opacity 0.2s;
  
  &:hover {
    opacity: 1;
  }
  
  svg {
    color: inherit;
  }
`;

const getAlertIcon = (variant) => {
  switch (variant) {
    case 'success':
      return <FaCheckCircle />;
    case 'info':
      return <FaInfoCircle />;
    case 'warning':
      return <FaExclamationTriangle />;
    case 'error':
      return <FaTimesCircle />;
    default:
      return <FaInfoCircle />;
  }
};

const Alert = ({
  variant = 'info',
  title,
  message,
  onClose,
  autoClose = false,
  autoCloseTime = 5000,
  marginBottom,
  ...props
}) => {
  const [isClosing, setIsClosing] = useState(false);
  
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      if (onClose) onClose();
    }, 300);
  };
  
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        handleClose();
      }, autoCloseTime);
      
      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseTime]);
  
  return (
    <AlertContainer 
      variant={variant} 
      isClosing={isClosing}
      marginBottom={marginBottom}
      {...props}
    >
      <IconContainer>
        {getAlertIcon(variant)}
      </IconContainer>
      <AlertContent>
        {title && <AlertTitle>{title}</AlertTitle>}
        {message && <AlertMessage>{message}</AlertMessage>}
      </AlertContent>
      {onClose && (
        <CloseButton onClick={handleClose}>
          <FaTimes />
        </CloseButton>
      )}
    </AlertContainer>
  );
};

export default Alert;