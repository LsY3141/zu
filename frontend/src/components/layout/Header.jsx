import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { FaSearch, FaBars, FaCalendarAlt, FaSignOutAlt, FaCog } from 'react-icons/fa';
import { toggleSidebar, toggleCalendar } from '../../redux/slices/uiSlice';
import { setFilters } from '../../redux/slices/noteSlice';
import { logout } from '../../redux/slices/authSlice';

const HeaderContainer = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  background-color: #FFFFFF;
  border-bottom: 1px solid #E0E0E0;
`;

const HeaderTitle = styled.h1`
  font-size: 18px;
  font-weight: 600;
  color: #333333;
  margin: 0;
`;

const SearchContainer = styled.div`
  flex: 1;
  max-width: 500px;
  margin: 0 20px;
  position: relative;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 8px 16px 8px 36px;
  border: 1px solid #E0E0E0;
  border-radius: 20px;
  background-color: #F5F7F9;
  color: #333333;
  font-size: 14px;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: #1976D2;
    box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.2);
  }
  
  &::placeholder {
    color: #9E9E9E;
  }
`;

const SearchIcon = styled.span`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9E9E9E;
  pointer-events: none;
`;

const ActionButtons = styled.div`
  display: flex;
  align-items: center;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  margin-left: 5px;
  color: #757575;
  font-size: 20px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  
  &:hover {
    background-color: #F5F5F5;
    color: #424242;
  }
  
  &:active {
    background-color: #E0E0E0;
  }
`;

const UserAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #1E88E5;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  cursor: pointer;
  position: relative;
`;

// 드롭다운 메뉴 스타일 컴포넌트
const UserDropdown = styled.div`
  position: absolute;
  top: 45px;
  right: 0;
  min-width: 180px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 100;
  overflow: hidden;
  opacity: ${({ isOpen }) => (isOpen ? '1' : '0')};
  visibility: ${({ isOpen }) => (isOpen ? 'visible' : 'hidden')};
  transform: ${({ isOpen }) => (isOpen ? 'translateY(0)' : 'translateY(-10px)')};
  transition: all 0.2s ease-in-out;
`;

const DropdownHeader = styled.div`
  padding: 15px;
  border-bottom: 1px solid #E0E0E0;
  text-align: center;
`;

const DropdownUserName = styled.div`
  font-weight: 600;
  font-size: 16px;
  color: #333333;
  margin-bottom: 4px;
`;

const DropdownUserEmail = styled.div`
  font-size: 13px;
  color: #757575;
`;

const DropdownItem = styled.div`
  padding: 12px 15px;
  display: flex;
  align-items: center;
  color: #616161;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: #F5F5F5;
    color: #1976D2;
  }
  
  svg {
    margin-right: 10px;
    font-size: 16px;
  }
`;

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  
  const [searchText, setSearchText] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // 드롭다운 외부 클릭 시 닫기 처리
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };
  
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    dispatch(setFilters({ searchText }));
    navigate('/notes');
  };
  
  const handleToggleSidebar = () => {
    dispatch(toggleSidebar());
  };
  
  const handleToggleCalendar = () => {
    dispatch(toggleCalendar());
  };
  
  const handleUserAvatarClick = () => {
    setDropdownOpen(!dropdownOpen);
  };
  
  const handleProfileClick = () => {
    setDropdownOpen(false);
    navigate('/profile');
  };
  
  const handleLogoutClick = () => {
    dispatch(logout());
    navigate('/login');
  };
  
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };
  
  return (
    <HeaderContainer>
      <HeaderTitle>AI 학습 지원 시스템</HeaderTitle>
      
      <SearchContainer>
        <form onSubmit={handleSearchSubmit}>
          <SearchInput
            type="text"
            placeholder="노트 검색..."
            value={searchText}
            onChange={handleSearchChange}
          />
          <SearchIcon>
            <FaSearch />
          </SearchIcon>
        </form>
      </SearchContainer>
      
      <ActionButtons>
        <ActionButton onClick={handleToggleCalendar}>
          <FaCalendarAlt />
        </ActionButton>
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <UserAvatar onClick={handleUserAvatarClick}>
            {getInitials(user?.username)}
          </UserAvatar>
            
          {/* 드롭다운 메뉴 */}
          <UserDropdown isOpen={dropdownOpen}>
            <DropdownHeader>
              <DropdownUserName>{user?.username || '사용자'}</DropdownUserName>
              <DropdownUserEmail>{user?.email || 'user@example.com'}</DropdownUserEmail>
            </DropdownHeader>
            <DropdownItem onClick={handleProfileClick}>
              <FaCog /> 프로필 설정
            </DropdownItem>
            <DropdownItem onClick={handleLogoutClick}>
              <FaSignOutAlt /> 로그아웃
            </DropdownItem>
          </UserDropdown>
        </div>
      </ActionButtons>
    </HeaderContainer>
  );
};

export default Header;