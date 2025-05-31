import React from 'react';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const SpinnerContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: ${({ fullHeight }) => fullHeight ? '100%' : 'auto'};
  width: 100%;
  padding: ${({ padding }) => padding || '20px'};
`;

const SpinnerElement = styled.div`
  width: ${({ size }) => size || '30px'};
  height: ${({ size }) => size || '30px'};
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: ${({ theme, color }) => color ? theme.colors[color] : theme.colors.primary};
  animation: ${spin} 0.8s linear infinite;
`;

const Spinner = ({ 
  size, 
  color, 
  fullHeight = false, 
  padding,
  ...props 
}) => {
  return (
    <SpinnerContainer fullHeight={fullHeight} padding={padding} {...props}>
      <SpinnerElement size={size} color={color} />
    </SpinnerContainer>
  );
};

export default Spinner;