import React from 'react';
import styled, { css } from 'styled-components';

const CardContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.boxShadow.card};
  overflow: hidden;
  transition: box-shadow 0.3s ease;
  
  ${({ hover }) => hover && css`
    &:hover {
      box-shadow: ${({ theme }) => theme.boxShadow.hover};
    }
  `};
  
  ${({ fullHeight }) => fullHeight && css`
    height: 100%;
    display: flex;
    flex-direction: column;
  `};
`;

const CardHeader = styled.div`
  padding: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  
  ${({ center }) => center && css`
    text-align: center;
  `};
`;

const CardTitle = styled.h3`
  margin: 0;
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.heading3};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
`;

const CardSubtitle = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.small};
  margin-top: 4px;
`;

const CardBody = styled.div`
  padding: 16px;
  
  ${({ fullHeight }) => fullHeight && css`
    flex: 1;
    overflow-y: auto;
  `};
`;

const CardFooter = styled.div`
  padding: 12px 16px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

const Card = ({
  children,
  title,
  subtitle,
  footer,
  hover = false,
  fullHeight = false,
  headerCenter = false,
  ...props
}) => {
  const hasHeader = title || subtitle;
  const hasFooter = footer;
  
  return (
    <CardContainer hover={hover} fullHeight={fullHeight} {...props}>
      {hasHeader && (
        <CardHeader center={headerCenter}>
          {title && <CardTitle>{title}</CardTitle>}
          {subtitle && <CardSubtitle>{subtitle}</CardSubtitle>}
        </CardHeader>
      )}
      <CardBody fullHeight={fullHeight}>{children}</CardBody>
      {hasFooter && <CardFooter>{footer}</CardFooter>}
    </CardContainer>
  );
};

export default Card;