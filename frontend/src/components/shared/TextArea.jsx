import React, { forwardRef } from 'react';
import styled, { css } from 'styled-components';

const TextAreaWrapper = styled.div`
  margin-bottom: 16px;
`;

const TextAreaLabel = styled.label`
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
`;

const StyledTextArea = styled.textarea`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid ${({ theme, error }) => error ? theme.colors.danger : theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
  background-color: ${({ theme }) => theme.colors.cardBackground};
  transition: border-color 0.2s ease-in-out;
  min-height: ${({ minHeight }) => minHeight || '120px'};
  resize: ${({ resize }) => resize || 'vertical'};
  font-family: inherit;
  
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
  
  ${({ disabled }) => disabled && css`
    background-color: ${({ theme }) => theme.colors.background};
    cursor: not-allowed;
    opacity: 0.7;
  `}
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

const TextArea = forwardRef(({
  label,
  error,
  helperText,
  minHeight,
  resize,
  ...props
}, ref) => {
  return (
    <TextAreaWrapper>
      {label && <TextAreaLabel>{label}</TextAreaLabel>}
      <StyledTextArea
        ref={ref}
        error={!!error}
        minHeight={minHeight}
        resize={resize}
        {...props}
      />
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {helperText && !error && <HelperText>{helperText}</HelperText>}
    </TextAreaWrapper>
  );
});

export default TextArea;