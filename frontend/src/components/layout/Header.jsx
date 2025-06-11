import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
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
    color: ${logoColors.darkGray};
    opacity: 0.6;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 18px;
  top: 50%;
  transform: translateY(-50%);
  color: ${logoColors.cyan};
  font-size: 16px;
  pointer-events: none;
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: linear-gradient(135deg, ${logoColors.darkGray} 0%, #2C2C2C 100%);
  color: ${logoColors.white};
  cursor: pointer;
  transition: all 0.3s ease;
  clip-path: polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%);
  
  &:hover {
    background: linear-gradient(135deg, ${logoColors.magenta} 0%, ${logoColors.cyan} 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.2);
  }
  
  svg {
    font-size: 16px;
  }
`;

const UserSection = styled.div`
  position: relative;
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, ${logoColors.lime} 0%, ${logoColors.cyan} 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  clip-path: polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%);
  
  &:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 15px rgba(139, 195, 74, 0.4);
  }
`;

const UserDropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: ${logoColors.white};
  box-shadow: 0 8px 32px rgba(0,0,0,0.15);
  min-width: 220px;
  opacity: ${props => props.isOpen ? 1 : 0};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transform: ${props => props.isOpen ? 'translateY(0)' : 'translateY(-10px)'};
  transition: all 0.3s ease;
  z-index: 1000;
  clip-path: polygon(0 8px, 8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%);
  
  &::before {
    content: '';
    position: absolute;
    top: -6px;
    right: 20px;
    width: 12px;
    height: 12px;
    background: ${logoColors.white};
    transform: rotate(45deg);
    border-top: 1px solid ${logoColors.lightGray};
    border-left: 1px solid ${logoColors.lightGray};
  }
`;

const DropdownHeader = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid ${logoColors.lightGray};
  background: linear-gradient(135deg, ${logoColors.darkGray}10, ${logoColors.cyan}10);
`;

const DropdownUserName = styled.div`
  font-weight: 600;
  color: ${logoColors.darkGray};
  font-size: 14px;
`;

const DropdownUserEmail = styled.div`
  color: ${logoColors.darkGray};
  opacity: 0.7;
  font-size: 12px;
  margin-top: 4px;
`;

const DropdownItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  color: ${logoColors.darkGray};
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  
  &:hover {
    background: linear-gradient(90deg, ${logoColors.cyan}20, ${logoColors.lime}20);
    transform: translateX(4px);
  }
  
  svg {
    font-size: 14px;
    color: ${logoColors.cyan};
  }
`;

const StatusIndicator = styled.div`
  padding: 12px 20px;
  border-top: 1px solid ${logoColors.lightGray};
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
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
  const { t } = useTranslation();
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
        <ActionButton onClick={handleToggleSidebar} title={t('header.search.toggleMenu')}>
          <FaBars />
        </ActionButton>
        <HeaderTitle>{t('header.title')}</HeaderTitle>
      </LeftSection>
      
      <SearchContainer>
        <form onSubmit={handleSearchSubmit}>
          <SearchInput
            type="text"
            placeholder={t('header.search.placeholder')}
            value={searchText}
            onChange={handleSearchChange}
          />
          <SearchIcon>
            <FaSearch />
          </SearchIcon>
        </form>
      </SearchContainer>
      
      <RightSection>
        <ActionButton onClick={handleToggleCalendar} title={t('header.search.toggleCalendar')}>
          <FaCalendarAlt />
        </ActionButton>
        
        <UserSection ref={dropdownRef}>
          <UserAvatar onClick={handleUserAvatarClick}>
            {getInitials(user?.username)}
          </UserAvatar>
            
          <UserDropdown isOpen={dropdownOpen}>
            <DropdownHeader>
              <DropdownUserName>{user?.username || t('header.user.defaultUsername')}</DropdownUserName>
              <DropdownUserEmail>{user?.email || t('header.user.defaultEmail')}</DropdownUserEmail>
            </DropdownHeader>
            
            <DropdownItem onClick={handleProfileClick}>
              <FaCog /> {t('header.user.profile')}
            </DropdownItem>
            
            <DropdownItem onClick={handleLogoutClick}>
              <FaSignOutAlt /> {t('header.user.logout')}
            </DropdownItem>
            
            <StatusIndicator>
              {t('header.user.onlineStatus')}
            </StatusIndicator>
          </UserDropdown>
        </UserSection>
      </RightSection>
    </HeaderContainer>
  );
};

export default Header;