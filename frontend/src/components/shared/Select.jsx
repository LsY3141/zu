import React, { forwardRef } from 'react';
import styled, { css } from 'styled-components';
import { FaChevronDown } from 'react-icons/fa';

const SelectWrapper = styled.div`
  margin-bottom: 16px;
`;

const SelectLabel = styled.label`
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
`;

const SelectContainer = styled.div`
  position: relative;
`;

const StyledSelect = styled.select`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid ${({ theme, error }) => error ? theme.colors.danger : theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
  background-color: ${({ theme }) => theme.colors.cardBackground};
  transition: border-color 0.2s ease-in-out;
  appearance: none;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => `${theme.colors.primary}33`};
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

const ChevronIcon = styled.div`
  position: absolute;
  top: 50%;
  right: 12px;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.textSecondary};
  pointer-events: none;
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

const Select = forwardRef(({
  label,
  options,
  placeholder,
  error,
  helperText,
  ...props
}, ref) => {
  return (
    <SelectWrapper>
      {label && <SelectLabel>{label}</SelectLabel>}
      <SelectContainer>
        <StyledSelect
          ref={ref}
          error={!!error}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option, index) => (
            <option key={index} value={option.value}>
              {option.label}
            </option>
          ))}
        </StyledSelect>
        <ChevronIcon>
          <FaChevronDown size={14} />
        </ChevronIcon>
      </SelectContainer>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {helperText && !error && <HelperText>{helperText}</HelperText>}
    </SelectWrapper>
  );
});

export default Select;