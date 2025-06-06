import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { FaSearch, FaBars, FaCalendarAlt, FaSignOutAlt, FaCog, FaBell, FaUser } from 'react-icons/fa';
import { toggleSidebar, toggleCalendar } from '../../redux/slices/uiSlice';
import { setFilters } from '../../redux/slices/noteSlice';
import { logout } from '../../redux/slices/authSlice';

// 로고 컬러 팔레트
const logoColors = {
  magenta: '#E91E63',
  cyan: '#00BCD4', 
  darkGray: '#424242',
  lime: '#8BC34A',
  lightGray: '#E0E0E0',
  white: '#FFFFFF'
};

const HeaderContainer = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  background: linear-gradient(135deg, ${logoColors.white} 0%, #F8F9FA 100%);
  border-bottom: 3px solid transparent;
  border-image: linear-gradient(90deg, ${logoColors.magenta}, ${logoColors.cyan}, ${logoColors.lime}) 1;
  box-shadow: 0 2px 20px rgba(0,0,0,0.08);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, ${logoColors.magenta} 0%, ${logoColors.cyan} 50%, ${logoColors.lime} 100%);
  }
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const HeaderTitle = styled.h1`
  font-size: 20px;
  font-weight: 700;
  color: ${logoColors.darkGray};
  margin: 0;
  background: linear-gradient(135deg, ${logoColors.magenta} 0%, ${logoColors.cyan} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const SearchContainer = styled.div`
  flex: 1;
  max-width: 500px;
  margin: 0 32px;
  position: relative;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 20px 12px 48px;
  border: 2px solid transparent;
  border-radius: 0;
  background: ${logoColors.white};
  color: ${logoColors.darkGray};
  font-size: 14px;
  transition: all 0.3s ease;
  clip-path: polygon(12px 0, 100% 0, calc(100% - 12px) 100%, 0 100%);
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  
  &:focus {
    outline: none;
    border-color: ${logoColors.cyan};
    box-shadow: 0 4px 20px rgba(0, 188, 212, 0.2);
    transform: translateY(-1px);
  }
  
  &::placeholder {
    color: #9E9E9E;
  }
`;

const SearchIcon = styled.span`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: ${logoColors.cyan};
  pointer-events: none;
  font-size: 16px;
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${logoColors.darkGray};
  font-size: 18px;
  width: 44px;
  height: 44px;
  border-radius: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  position: relative;
  
  &:hover {
    background: linear-gradient(135deg, ${logoColors.magenta}15, ${logoColors.cyan}15);
    color: ${logoColors.magenta};
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const NotificationButton = styled(ActionButton)`
  &::after {
    content: '';
    position: absolute;
    top: 8px;
    right: 8px;
    width: 8px;
    height: 8px;
    background: ${logoColors.magenta};
    border-radius: 50%;
    opacity: ${({ hasNotification }) => hasNotification ? 1 : 0};
    transition: opacity 0.3s ease;
  }
`;

const UserSection = styled.div`
  position: relative;
  margin-left: 8px;
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, ${logoColors.cyan} 0%, ${logoColors.lime} 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  cursor: pointer;
  clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 100%, 8px 100%);
  transition: all 0.3s ease;
  box-shadow: 0 2px 12px rgba(0, 188, 212, 0.3);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 188, 212, 0.4);
  }
`;

const UserDropdown = styled.div`
  position: absolute;
  top: 50px;
  right: 0;
  min-width: 220px;
  background: ${logoColors.white};
  border-radius: 0;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  z-index: 100;
  overflow: hidden;
  opacity: ${({ isOpen }) => (isOpen ? '1' : '0')};
  visibility: ${({ isOpen }) => (isOpen ? 'visible' : 'hidden')};
  transform: ${({ isOpen }) => (isOpen ? 'translateY(0)' : 'translateY(-10px)')};
  transition: all 0.3s ease;
  border-top: 3px solid transparent;
  border-image: linear-gradient(90deg, ${logoColors.magenta}, ${logoColors.cyan}) 1;
`;

const DropdownHeader = styled.div`
  padding: 20px;
  background: linear-gradient(135deg, ${logoColors.darkGray} 0%, #2C2C2C 100%);
  color: white;
  text-align: center;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, ${logoColors.magenta}, ${logoColors.cyan});
  }
`;

const DropdownUserName = styled.div`
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 4px;
`;

const DropdownUserEmail = styled.div`
  font-size: 13px;
  opacity: 0.8;
  color: ${logoColors.cyan};
`;

const DropdownItem = styled.div`
  padding: 14px 20px;
  display: flex;
  align-items: center;
  color: ${logoColors.darkGray};
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  
  &:hover {
    background: linear-gradient(90deg, ${logoColors.magenta}10, ${logoColors.cyan}10);
    color: ${logoColors.magenta};
    
    &::before {
      opacity: 1;
      width: 4px;
    }
  }
  
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 0;
    background: ${logoColors.magenta};
    transition: all 0.3s ease;
    opacity: 0;
  }
  
  svg {
    margin-right: 12px;
    font-size: 16px;
  }
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 20px;
  background: #F8F9FA;
  border-top: 1px solid #E9ECEF;
  font-size: 12px;
  color: ${logoColors.darkGray};
  
  &::before {
    content: '';
    width: 8px;
    height: 8px;
    background: ${logoColors.lime};
    border-radius: 50%;
    animation: pulse 2s infinite;
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
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
      <LeftSection>
        <ActionButton onClick={handleToggleSidebar} title="메뉴 토글">
          <FaBars />
        </ActionButton>
        <HeaderTitle>AI 학습 지원 시스템</HeaderTitle>
      </LeftSection>
      
      <SearchContainer>
        <form onSubmit={handleSearchSubmit}>
          <SearchInput
            type="text"
            placeholder="노트를 검색하세요..."
            value={searchText}
            onChange={handleSearchChange}
          />
          <SearchIcon>
            <FaSearch />
          </SearchIcon>
        </form>
      </SearchContainer>
      
      <RightSection>
        <ActionButton onClick={handleToggleCalendar} title="캘린더 토글">
          <FaCalendarAlt />
        </ActionButton>
        
        <UserSection ref={dropdownRef}>
          <UserAvatar onClick={handleUserAvatarClick}>
            {getInitials(user?.username)}
          </UserAvatar>
            
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
            
            <StatusIndicator>
              온라인 상태
            </StatusIndicator>
          </UserDropdown>
        </UserSection>
      </RightSection>
    </HeaderContainer>
  );
};

export default Header;