import React from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { 
  FaHome, 
  FaStickyNote, 
  FaMicrophone, 
  FaShareAlt, 
  FaTrash,
  FaPen,
  FaFolderOpen,
  FaPlus
} from 'react-icons/fa';

// 로고 컬러 팔레트
const logoColors = {
  magenta: '#E91E63',
  cyan: '#00BCD4', 
  darkGray: '#424242',
  lime: '#8BC34A',
  lightGray: '#E0E0E0',
  white: '#FFFFFF'
};

const SidebarContainer = styled.aside`
  width: 220px;
  height: 100%;
  background: linear-gradient(180deg, ${logoColors.darkGray} 0%, #2C2C2C 100%);
  color: ${logoColors.white};
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  box-shadow: 4px 0 20px rgba(0,0,0,0.1);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 4px;
    height: 100%;
    background: linear-gradient(180deg, ${logoColors.magenta} 0%, ${logoColors.cyan} 50%, ${logoColors.lime} 100%);
  }
`;

const LogoContainer = styled.div`
  padding: 24px 20px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  margin-bottom: 8px;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 20px;
    right: 20px;
    height: 2px;
    background: linear-gradient(90deg, ${logoColors.magenta}, ${logoColors.cyan});
  }
`;

const Logo = styled.div`
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, ${logoColors.magenta} 0%, ${logoColors.cyan} 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 18px;
  margin-right: 12px;
  clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 100%, 8px 100%);
  box-shadow: 0 4px 12px rgba(233, 30, 99, 0.3);
`;

const LogoText = styled.div`
  display: flex;
  flex-direction: column;
`;

const LogoTitle = styled.div`
  font-size: 16px;
  font-weight: bold;
  color: ${logoColors.white};
  line-height: 1;
`;

const LogoSubtitle = styled.div`
  font-size: 10px;
  color: ${logoColors.cyan};
  opacity: 0.8;
  margin-top: 2px;
`;

const CreateSection = styled.div`
  padding: 16px 20px;
  margin-bottom: 8px;
`;

const CreateButtonsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const CreateButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  border: none;
  background: ${({ primary }) => 
    primary 
      ? `linear-gradient(135deg, ${logoColors.magenta} 0%, ${logoColors.cyan} 100%)`
      : `linear-gradient(135deg, ${logoColors.lime} 0%, ${logoColors.cyan} 100%)`
  };
  color: white;
  border-radius: 0;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  font-size: 14px;
  clip-path: polygon(0 0, calc(100% - 6px) 0, 100% 100%, 6px 100%);
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.3);
  }
  
  svg {
    font-size: 16px;
  }
`;

const NavigationContainer = styled.nav`
  flex: 1;
  overflow-y: auto;
  padding: 0 12px;
`;

const NavSection = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.div`
  padding: 8px 16px 8px 8px;
  font-size: 11px;
  font-weight: 600;
  color: ${logoColors.cyan};
  text-transform: uppercase;
  letter-spacing: 1px;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 12px;
    background: ${logoColors.lime};
    clip-path: polygon(0 0, 100% 30%, 100% 70%, 0 100%);
  }
`;

const NavItemLink = styled(NavLink)`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  color: rgba(255,255,255,0.8);
  text-decoration: none;
  transition: all 0.3s ease;
  margin: 2px 0;
  border-radius: 0;
  position: relative;
  font-weight: 400;
  
  &:hover {
    background: rgba(255,255,255,0.1);
    color: ${logoColors.white};
    transform: translateX(4px);
    
    &::before {
      opacity: 1;
      width: 4px;
    }
  }
  
  &.active {
    color: ${logoColors.white};
    background: linear-gradient(90deg, 
      rgba(233, 30, 99, 0.2) 0%, 
      rgba(0, 188, 212, 0.2) 100%
    );
    font-weight: 500;
    
    &::before {
      opacity: 1;
      width: 4px;
      background: linear-gradient(180deg, ${logoColors.magenta}, ${logoColors.cyan});
    }
    
    &::after {
      content: '';
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      width: 6px;
      height: 6px;
      background: ${logoColors.lime};
      clip-path: polygon(0 0, 100% 50%, 0 100%);
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
    width: 18px;
    height: 18px;
    flex-shrink: 0;
  }
`;

const FooterSection = styled.div`
  padding: 20px;
  border-top: 1px solid rgba(255,255,255,0.1);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 20px;
    right: 20px;
    height: 2px;
    background: linear-gradient(90deg, 
      transparent 0%, 
      ${logoColors.cyan} 50%, 
      transparent 100%
    );
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: rgba(255,255,255,0.7);
  
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

const Sidebar = () => {
  const navigate = useNavigate();
  
  const handleCreateTextNote = () => {
    navigate('/notes/create');
  };
  
  const handleCreateVoiceNote = () => {
    navigate('/voice');
  };
  
  return (
    <SidebarContainer>
      <LogoContainer>
        <Logo>AI</Logo>
        <LogoText>
          <LogoTitle>AI 학습 지원</LogoTitle>
          <LogoSubtitle>Smart Note System</LogoSubtitle>
        </LogoText>
      </LogoContainer>
      
      <CreateSection>
        <CreateButtonsContainer>
          <CreateButton primary onClick={handleCreateTextNote}>
            <FaPen />
            새 노트 작성
          </CreateButton>
          <CreateButton onClick={handleCreateVoiceNote}>
            <FaMicrophone />
            음성 노트 녹음
          </CreateButton>
        </CreateButtonsContainer>
      </CreateSection>
      
      <NavigationContainer>
        <NavSection>
          <NavItemLink to="/" end>
            <FaHome /> 홈
          </NavItemLink>
          <NavItemLink to="/notes">
            <FaStickyNote /> 전체 노트
          </NavItemLink>
          <NavItemLink to="/voice">
            <FaMicrophone /> 음성 노트
          </NavItemLink>
        </NavSection>
        
        <NavSection>
          <SectionTitle>보관함</SectionTitle>
          <NavItemLink to="/shared">
            <FaShareAlt /> 공유한 노트
          </NavItemLink>
          <NavItemLink to="/shared-with-me">
            <FaFolderOpen /> 공유받은 노트
          </NavItemLink>
          <NavItemLink to="/trash">
            <FaTrash /> 휴지통
          </NavItemLink>
        </NavSection>
      </NavigationContainer>
      
      <FooterSection>
        <UserInfo>
          정상 작동
        </UserInfo>
      </FooterSection>
    </SidebarContainer>
  );
};

export default Sidebar;