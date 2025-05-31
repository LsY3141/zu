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
  FaFolderOpen
} from 'react-icons/fa';

const SidebarContainer = styled.aside`
  width: 200px;
  height: 100%;
  background-color: #FFFFFF;
  border-right: 1px solid #E0E0E0;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  color: #616161;
`;

const LogoContainer = styled.div`
  padding: 20px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #E0E0E0;
  margin-bottom: 10px;
`;

const Logo = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background-color: #1E88E5;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 18px;
  margin-right: 10px;
`;

const LogoText = styled.div`
  font-size: 18px;
  font-weight: bold;
  color: #333333;
`;

const NavSection = styled.div`
  margin-bottom: 10px;
`;

const CreateButtonsContainer = styled.div`
  padding: 0 10px;
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
`;

const CreateButton = styled.button`
  flex: 1;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 20px;
  background-color: ${({ primary }) => primary ? '#E3F2FD' : '#f0f0f0'};
  color: ${({ primary }) => primary ? '#1976D2' : '#424242'};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${({ primary }) => primary ? '#BBDEFB' : '#e0e0e0'};
  }
  
  svg {
    font-size: 16px;
  }
`;

const NavigationContainer = styled.nav`
  flex: 1;
  overflow-y: auto;
`;

const NavItemLink = styled(NavLink)`
  display: flex;
  align-items: center;
  padding: 12px 20px;
  color: #616161;
  text-decoration: none;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #F5F5F5;
  }
  
  &.active {
    color: #1976D2;
    background-color: #E3F2FD;
    font-weight: 500;
  }
  
  svg {
    margin-right: 10px;
    width: 20px;
    height: 20px;
    flex-shrink: 0;
  }
`;

const SectionTitle = styled.div`
  padding: 12px 20px 5px;
  font-size: 12px;
  font-weight: 500;
  color: #9E9E9E;
  text-transform: uppercase;
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
        <LogoText>AI 학습 지원</LogoText>
      </LogoContainer>
      
      <NavSection>
        <CreateButtonsContainer>
          <CreateButton primary onClick={handleCreateTextNote}>
            <FaPen />
          </CreateButton>
          <CreateButton onClick={handleCreateVoiceNote}>
            <FaMicrophone />
          </CreateButton>
        </CreateButtonsContainer>
      </NavSection>
      
      <NavigationContainer>
        <NavItemLink to="/" end>
          <FaHome /> 홈
        </NavItemLink>
        <NavItemLink to="/notes">
          <FaStickyNote /> 전체 노트
        </NavItemLink>
        <NavItemLink to="/voice">
          <FaMicrophone /> 음성 노트
        </NavItemLink>
        
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
      </NavigationContainer>
    </SidebarContainer>
  );
};

export default Sidebar;