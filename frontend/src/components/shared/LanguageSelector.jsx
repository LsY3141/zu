import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { FaGlobeAmericas } from 'react-icons/fa';

const LanguageSelectorContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
`;

const LanguageButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.95);
  border: 2px solid #E91E63;
  border-radius: 6px;
  color: #424242;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  
  &:hover {
    background: #E91E63;
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(233, 30, 99, 0.3);
  }
  
  svg {
    font-size: 16px;
  }
`;

const LanguageDropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: white;
  border: 2px solid #E91E63;
  border-radius: 6px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  min-width: 120px;
  opacity: ${props => props.isOpen ? 1 : 0};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transform: ${props => props.isOpen ? 'translateY(0)' : 'translateY(-10px)'};
  transition: all 0.3s ease;
`;

const LanguageOption = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 12px 16px;
  background: ${props => props.active ? '#E91E63' : 'white'};
  color: ${props => props.active ? 'white' : '#424242'};
  border: none;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.active ? '#E91E63' : '#f5f5f5'};
  }
  
  .flag {
    font-size: 16px;
  }
`;

const LanguageSelector = ({ showDropdown = false }) => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = React.useState(false);
  
  const languages = [
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' }
  ];
  
  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[1];
  
  const handleLanguageChange = (languageCode) => {
    i18n.changeLanguage(languageCode);
    setIsOpen(false);
    
    // 선택한 언어를 localStorage에 저장
    localStorage.setItem('i18nextLng', languageCode);
  };
  
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  
  // 외부 클릭시 드롭다운 닫기
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('[data-language-selector]')) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);
  
  if (!showDropdown) {
    // 단순 버튼 모드 - 한국어 ↔ 영어 토글
    return (
      <LanguageSelectorContainer>
        <LanguageButton 
          onClick={() => handleLanguageChange(i18n.language === 'ko' ? 'en' : 'ko')}
          title="언어 변경 / Change Language"
        >
          <FaGlobeAmericas />
          <span>{currentLanguage.flag}</span>
          <span>{currentLanguage.name}</span>
        </LanguageButton>
      </LanguageSelectorContainer>
    );
  }
  
  // 드롭다운 모드
  return (
    <LanguageSelectorContainer data-language-selector>
      <LanguageButton onClick={toggleDropdown}>
        <FaGlobeAmericas />
        <span>{currentLanguage.flag}</span>
        <span>{currentLanguage.name}</span>
      </LanguageButton>
      
      <LanguageDropdown isOpen={isOpen}>
        {languages.map((language) => (
          <LanguageOption
            key={language.code}
            active={i18n.language === language.code}
            onClick={() => handleLanguageChange(language.code)}
          >
            <span className="flag">{language.flag}</span>
            <span>{language.name}</span>
          </LanguageOption>
        ))}
      </LanguageDropdown>
    </LanguageSelectorContainer>
  );
};

export default LanguageSelector;