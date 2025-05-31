import React from 'react';
import styled, { css } from 'styled-components';

const ButtonSizes = {
  small: css`
    padding: 6px 12px;
    font-size: 12px;
  `,
  medium: css`
    padding: 8px 16px;
    font-size: 14px;
  `,
  large: css`
    padding: 10px 20px;
    font-size: 16px;
  `,
};

const ButtonVariants = {
  primary: css`
    background-color: ${({ theme }) => theme.colors.primary};
    color: white;
    &:hover {
      background-color: ${({ theme }) => theme.colors.primaryDark};
    }
  `,
  secondary: css`
    background-color: ${({ theme }) => theme.colors.secondary};
    color: white;
    &:hover {
      opacity: 0.9;
    }
  `,
  danger: css`
    background-color: ${({ theme }) => theme.colors.danger};
    color: white;
    &:hover {
      opacity: 0.9;
    }
  `,
  outline: css`
    background-color: transparent;
    color: ${({ theme }) => theme.colors.primary};
    border: 1px solid ${({ theme }) => theme.colors.primary};
    &:hover {
      background-color: ${({ theme }) => theme.colors.primaryLight};
    }
  `,
  text: css`
    background-color: transparent;
    color: ${({ theme }) => theme.colors.primary};
    &:hover {
      background-color: ${({ theme }) => theme.colors.primaryLight};
    }
  `,
};

const StyledButton = styled.button`
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease-in-out;
  box-shadow: ${({ theme, variant }) => 
    variant !== 'text' ? theme.boxShadow.button : 'none'};
  
  ${({ size }) => ButtonSizes[size]};
  ${({ variant }) => ButtonVariants[variant]};
  
  ${({ fullWidth }) => fullWidth && css`
    width: 100%;
  `};
  
  ${({ disabled }) => disabled && css`
    opacity: 0.6;
    cursor: not-allowed;
  `};
  
  svg {
    margin-right: ${({ hasText }) => hasText ? '8px' : '0'};
    font-size: 1.2em;
  }
`;

const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  icon,
  onClick,
  ...props
}) => {
  const hasText = Boolean(children);
  
  return (
    <StyledButton
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      hasText={hasText}
      onClick={onClick}
      {...props}
    >
      {icon}
      {children}
    </StyledButton>
  );
};

export default Button;