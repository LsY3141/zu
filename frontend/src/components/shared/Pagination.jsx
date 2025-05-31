import React from 'react';
import styled from 'styled-components';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 20px 0;
`;

const PageButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  margin: 0 4px;
  border-radius: 18px;
  border: 1px solid ${({ theme, active }) => 
    active ? theme.colors.primary : theme.colors.border};
  background-color: ${({ theme, active }) => 
    active ? theme.colors.primary : 'transparent'};
  color: ${({ theme, active }) => 
    active ? 'white' : theme.colors.text};
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${({ theme, active }) => 
      active ? theme.colors.primary : theme.colors.primaryLight};
    color: ${({ theme, active }) => 
      active ? 'white' : theme.colors.primary};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    
    &:hover {
      background-color: transparent;
      color: ${({ theme }) => theme.colors.text};
    }
  }
`;

const PageEllipsis = styled.span`
  margin: 0 4px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange 
}) => {
  // 표시할 페이지 버튼 계산
  const renderPageButtons = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      // 전체 페이지가 최대 표시 개수보다 적으면 모든 페이지 버튼 표시
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 전체 페이지가 많은 경우 일부만 표시
      if (currentPage <= 3) {
        // 현재 페이지가 앞쪽에 있는 경우
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // 현재 페이지가 뒤쪽에 있는 경우
        pages.push(1);
        pages.push('ellipsis');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // 현재 페이지가 중간에 있는 경우
        pages.push(1);
        pages.push('ellipsis');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }
    
    return pages.map((page, index) => {
      if (page === 'ellipsis') {
        return <PageEllipsis key={`ellipsis-${index}`}>...</PageEllipsis>;
      }
      return (
        <PageButton
          key={page}
          active={page === currentPage}
          onClick={() => onPageChange(page)}
        >
          {page}
        </PageButton>
      );
    });
  };
  
  return (
    <PaginationContainer>
      <PageButton
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <FaChevronLeft size={14} />
      </PageButton>
      
      {renderPageButtons()}
      
      <PageButton
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <FaChevronRight size={14} />
      </PageButton>
    </PaginationContainer>
  );
};

export default Pagination;