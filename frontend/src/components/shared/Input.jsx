import React, { forwardRef } from 'react';
import styled, { css } from 'styled-components';

const InputWrapper = styled.div`
  margin-bottom: 16px;
`;

const InputLabel = styled.label`
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid ${({ theme, error }) => error ? theme.colors.danger : theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
  background-color: ${({ theme }) => theme.colors.cardBackground};
  transition: border-color 0.2s ease-in-out;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => `${theme.colors.primary}33`};
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
    opacity: 0.6;
  }
  
  ${({ error }) => error && css`
    &:focus {
      box-shadow: 0 0 0 3px ${({ theme }) => `${theme.colors.danger}33`};
    }
  `}
  
  ${({ icon }) => icon && css`
    padding-left: 36px;
  `}
  
  ${({ disabled }) => disabled && css`
    background-color: ${({ theme }) => theme.colors.background};
    cursor: not-allowed;
    opacity: 0.7;
  `}
`;

const IconWrapper = styled.div`
  position: absolute;
  top: 50%;
  left: 12px;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.textSecondary};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const InputContainer = styled.div`
  position: relative;
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.colors.danger};
  font-size: 12px;
  margin-top: 4px;
`;

const HelperText = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 12px;
  margin-top: 4px;
`;

const Input = forwardRef(({
  label,
  error,
  icon,
  helperText,
  ...props
}, ref) => {
  return (
    <InputWrapper>
      {label && <InputLabel>{label}</InputLabel>}
      <InputContainer>
        {icon && <IconWrapper>{icon}</IconWrapper>}
        <StyledInput
          ref={ref}
          error={!!error}
          icon={!!icon}
          {...props}
        />
      </InputContainer>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {helperText && !error && <HelperText>{helperText}</HelperText>}
    </InputWrapper>
  );
});

export default Input;