// src/pages/NoteDetail.jsx - 개선된 스타일 버전
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import styled, { keyframes } from 'styled-components';
import ReactMarkdown from 'react-markdown';
import { 
  FaArrowLeft, 
  FaEdit, 
  FaTrash, 
  FaMicrophone, 
  FaStickyNote, 
  FaShareAlt,
  FaEllipsisH,
  FaTag,
  FaRobot,
  FaComments,
  FaHeart,
  FaStar,
  FaFileAlt
} from 'react-icons/fa';
import { fetchNoteById, clearCurrentNote, moveNoteToTrash } from '../redux/slices/noteSlice';
import Button from '../components/shared/Button';
import Spinner from '../components/shared/Spinner';
import ChatBot from '../components/shared/ChatBot';
import ShareModal from '../components/shared/ShareModal';
import { formatRelativeTime } from '../utils/formatters';
import { openConfirmDialog } from '../redux/slices/uiSlice';

// 화려한 컬러 팔레트
const colors = {
  primary: '#E91E63',      // 매젠타
  secondary: '#00BCD4',    // 시안
  accent: '#8BC34A',       // 라임
  purple: '#9C27B0',       // 퍼플
  orange: '#FF9800',       // 오렌지
  indigo: '#3F51B5',       // 인디고
  teal: '#009688',         // 틸
  darkGray: '#424242',
  lightGray: '#F5F5F5',
  white: '#FFFFFF',
  black: '#212121'
};

// 애니메이션 정의
const fadeInUp = keyframes`
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideInRight = keyframes`
  0% {
    opacity: 0;
    transform: translateX(20px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
`;

const glow = keyframes`
  0%, 100% {
    box-shadow: 0 0 10px rgba(233, 30, 99, 0.3);
  }
  50% {
    box-shadow: 0 0 20px rgba(233, 30, 99, 0.6);
  }
`;

const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-5px);
  }
`;

const NoteDetailContainer = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  background: linear-gradient(135deg, 
    ${colors.lightGray} 0%, 
    ${colors.white} 50%, 
    #E8F5E8 100%
  );
  min-height: 100vh;
  padding: 20px;
  animation: ${fadeInUp} 0.6s ease-out;
`;

const ControlsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px;
  background: linear-gradient(135deg, ${colors.white} 0%, #F8F9FA 100%);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: ${slideInRight} 0.4s ease-out;
`;

const BackButton = styled(Button)`
  background: linear-gradient(135deg, ${colors.indigo} 0%, ${colors.purple} 100%);
  border: none;
  color: white;
  padding: 12px 24px;
  border-radius: 15px;
  transition: all 0.3s ease;
  clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 100%, 10px 100%);
  
  &:hover {
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 10px 25px rgba(63, 81, 181, 0.3);
    animation: ${glow} 2s infinite;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
`;

const ActionButton = styled(Button)`
  background: linear-gradient(135deg, 
    ${props => props.variant === 'edit' ? `${colors.teal} 0%, ${colors.secondary} 100%` :
              props.variant === 'share' ? `${colors.orange} 0%, #FF7043 100%` :
              props.variant === 'chat' ? `${colors.purple} 0%, ${colors.primary} 100%` :
              props.variant === 'delete' ? '#F44336 0%, #E91E63 100%' :
              `${colors.accent} 0%, ${colors.teal} 100%`
    }
  );
  border: none;
  color: white;
  padding: 10px 20px;
  border-radius: 12px;
  transition: all 0.3s ease;
  font-weight: 600;
  clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 100%, 8px 100%);
  
  &:hover {
    transform: translateY(-3px) rotate(1deg);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
    animation: ${float} 2s ease-in-out infinite;
  }
  
  svg {
    margin-right: 8px;
  }
`;

const NoteCard = styled.div`
  background: linear-gradient(135deg, 
    ${colors.white} 0%, 
    rgba(255, 255, 255, 0.95) 50%,
    rgba(248, 249, 250, 0.9) 100%
  );
  border-radius: 25px;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.1),
    0 8px 25px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  overflow: hidden;
  margin-bottom: 30px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(15px);
  animation: ${fadeInUp} 0.8s ease-out 0.2s both;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, 
      ${colors.primary} 0%, 
      ${colors.secondary} 25%, 
      ${colors.accent} 50%, 
      ${colors.purple} 75%, 
      ${colors.orange} 100%
    );
  }
`;

const NoteHeader = styled.div`
  padding: 30px;
  background: linear-gradient(135deg, 
    rgba(233, 30, 99, 0.05) 0%, 
    rgba(0, 188, 212, 0.05) 100%
  );
  border-bottom: 2px solid transparent;
  border-image: linear-gradient(90deg, 
    ${colors.primary}30, 
    ${colors.secondary}30
  ) 1;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 30px;
    right: 30px;
    height: 2px;
    background: linear-gradient(90deg, 
      transparent 0%, 
      ${colors.primary}50 50%, 
      transparent 100%
    );
  }
`;

const NoteTitle = styled.h1`
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 15px;
  background: linear-gradient(135deg, 
    ${colors.darkGray} 0%, 
    ${colors.primary} 50%, 
    ${colors.secondary} 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  position: relative;
  
  &::after {
    content: '✨';
    position: absolute;
    right: -40px;
    top: -5px;
    font-size: 24px;
    animation: ${float} 3s ease-in-out infinite;
  }
`;

const NoteMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
`;

const NoteType = styled.div`
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, 
    ${colors.accent}20 0%, 
    ${colors.teal}20 100%
  );
  padding: 8px 16px;
  border-radius: 20px;
  color: ${colors.teal};
  font-weight: 600;
  border: 2px solid ${colors.accent}30;
  
  svg {
    margin-right: 8px;
    animation: ${float} 2s ease-in-out infinite;
  }
`;

const NoteTimestamp = styled.div`
  background: linear-gradient(135deg, 
    ${colors.purple}20 0%, 
    ${colors.indigo}20 100%
  );
  padding: 8px 16px;
  border-radius: 20px;
  color: ${colors.purple};
  font-weight: 600;
  border: 2px solid ${colors.purple}30;
`;

const NoteContent = styled.div`
  padding: 30px;
  color: ${colors.darkGray};
  font-size: 18px;
  line-height: 1.8;
  background: linear-gradient(135deg, 
    ${colors.white} 0%, 
    rgba(248, 249, 250, 0.5) 100%
  );
  
  /* 마크다운 스타일링 */
  h1, h2, h3, h4, h5, h6 {
    background: linear-gradient(135deg, 
      ${colors.primary} 0%, 
      ${colors.secondary} 100%
    );
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 20px 0 10px;
  }
  
  p {
    margin-bottom: 15px;
    text-align: justify;
  }
  
  code {
    background: linear-gradient(135deg, 
      ${colors.lightGray} 0%, 
      #E0E0E0 100%
    );
    padding: 4px 8px;
    border-radius: 6px;
    font-family: 'JetBrains Mono', monospace;
    border: 1px solid ${colors.accent}30;
  }
  
  blockquote {
    border-left: 4px solid ${colors.primary};
    padding-left: 20px;
    margin: 20px 0;
    background: linear-gradient(135deg, 
      ${colors.primary}05 0%, 
      ${colors.secondary}05 100%
    );
    padding: 15px 20px;
    border-radius: 10px;
    font-style: italic;
  }
`;

const NoteFooter = styled.div`
  padding: 25px 30px;
  background: linear-gradient(135deg, 
    rgba(139, 195, 74, 0.05) 0%, 
    rgba(0, 150, 136, 0.05) 100%
  );
  border-top: 2px solid transparent;
  border-image: linear-gradient(90deg, 
    ${colors.accent}30, 
    ${colors.teal}30
  ) 1;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`;

const NoteTag = styled.div`
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, 
    ${colors.primary}15 0%, 
    ${colors.secondary}15 100%
  );
  color: ${colors.primary};
  padding: 8px 16px;
  border-radius: 25px;
  font-size: 14px;
  font-weight: 600;
  border: 2px solid ${colors.primary}30;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-2px) scale(1.05);
    background: linear-gradient(135deg, 
      ${colors.primary}25 0%, 
      ${colors.secondary}25 100%
    );
    box-shadow: 0 8px 20px rgba(233, 30, 99, 0.2);
  }
  
  svg {
    margin-right: 6px;
    animation: ${float} 2.5s ease-in-out infinite;
  }
`;

const AudioPlayer = styled.div`
  margin-bottom: 30px;
  background: linear-gradient(135deg, 
    ${colors.white} 0%, 
    rgba(248, 249, 250, 0.9) 100%
  );
  border-radius: 20px;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.1);
  padding: 25px;
  border: 2px solid ${colors.orange}30;
  position: relative;
  
  &::before {
    content: '🎵';
    position: absolute;
    top: -10px;
    right: -10px;
    font-size: 24px;
    background: linear-gradient(135deg, ${colors.orange} 0%, #FF7043 100%);
    padding: 8px;
    border-radius: 50%;
    animation: ${float} 2s ease-in-out infinite;
  }
`;

const StyledAudio = styled.audio`
  width: 100%;
  height: 60px;
  border-radius: 15px;
  
  &::-webkit-media-controls-panel {
    background: linear-gradient(135deg, 
      ${colors.white} 0%, 
      ${colors.lightGray} 100%
    );
    border-radius: 15px;
  }
`;

const TranscriptionCard = styled.div`
  background: linear-gradient(135deg, 
    ${colors.white} 0%, 
    rgba(248, 249, 250, 0.95) 100%
  );
  border-radius: 20px;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  margin-bottom: 25px;
  border: 2px solid ${colors.secondary}30;
  animation: ${fadeInUp} 0.6s ease-out;
`;

const TranscriptionHeader = styled.div`
  padding: 20px 25px;
  background: linear-gradient(135deg, 
    ${colors.secondary}15 0%, 
    ${colors.teal}15 100%
  );
  color: ${colors.secondary};
  font-weight: 700;
  font-size: 18px;
  border-bottom: 2px solid ${colors.secondary}20;
`;

const TranscriptionContent = styled.div`
  padding: 25px;
  background: linear-gradient(135deg, 
    ${colors.white} 0%, 
    rgba(248, 249, 250, 0.5) 100%
  );
`;

const SpeakerText = styled.div`
  margin-bottom: 20px;
  padding: 15px;
  background: linear-gradient(135deg, 
    rgba(156, 39, 176, 0.05) 0%, 
    rgba(63, 81, 181, 0.05) 100%
  );
  border-radius: 15px;
  border-left: 4px solid ${colors.purple};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SpeakerLabel = styled.div`
  display: flex;
  align-items: center;
  font-weight: 700;
  color: ${colors.purple};
  margin-bottom: 8px;
  
  svg {
    margin-right: 8px;
    animation: ${glow} 3s ease-in-out infinite;
  }
`;

const NoDataMessage = styled.div`
  text-align: center;
  color: ${colors.darkGray};
  padding: 60px;
  font-size: 18px;
  background: linear-gradient(135deg, 
    ${colors.white} 0%, 
    ${colors.lightGray} 100%
  );
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  margin: 40px 0;
`;

// AI 도우미 섹션
const AIAssistantSection = styled.div`
  background: linear-gradient(135deg, 
    ${colors.white} 0%, 
    rgba(233, 30, 99, 0.05) 50%,
    rgba(0, 188, 212, 0.05) 100%
  );
  border-radius: 25px;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  padding: 30px;
  margin-bottom: 30px;
  border: 2px solid transparent;
  border-image: linear-gradient(135deg, 
    ${colors.primary}30, 
    ${colors.secondary}30
  ) 1;
  animation: ${fadeInUp} 0.8s ease-out 0.4s both;
`;

// 탭 섹션
const TabSection = styled.div`
  background: linear-gradient(135deg, 
    ${colors.white} 0%, 
    rgba(139, 195, 74, 0.05) 50%,
    rgba(0, 150, 136, 0.05) 100%
  );
  border-radius: 25px;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  padding: 30px;
  margin-bottom: 30px;
  border: 2px solid transparent;
  border-image: linear-gradient(135deg, 
    ${colors.accent}30, 
    ${colors.teal}30
  ) 1;
  animation: ${fadeInUp} 0.8s ease-out 0.3s both;
`;

const TabSectionHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
`;

const TabSectionTitle = styled.h3`
  display: flex;
  align-items: center;
  margin: 0;
  background: linear-gradient(135deg, 
    ${colors.accent} 0%, 
    ${colors.teal} 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 22px;
  font-weight: 700;
`;

const AIAssistantHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
`;

const AIAssistantTitle = styled.h3`
  display: flex;
  align-items: center;
  margin: 0;
  background: linear-gradient(135deg, 
    ${colors.primary} 0%, 
    ${colors.secondary} 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 22px;
  font-weight: 700;
  
  svg {
    margin-right: 12px;
    color: ${colors.primary};
    animation: ${glow} 2s ease-in-out infinite;
  }
`;

// 탭 관련 스타일드 컴포넌트
const TabContainer = styled.div`
  display: flex;
  border-bottom: 3px solid ${colors.lightGray};
  margin-bottom: 20px;
  gap: 5px;
`;

const TabButton = styled.button`
  background: ${props => props.active 
    ? `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`
    : `linear-gradient(135deg, ${colors.white} 0%, ${colors.lightGray} 100%)`
  };
  color: ${props => props.active ? colors.white : colors.darkGray};
  border: none;
  padding: 15px 25px;
  border-radius: 15px 15px 0 0;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s ease;
  clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 100%, 8px 100%);
  border-bottom: 3px solid ${props => props.active ? colors.primary : 'transparent'};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  }
  
  svg {
    margin-right: 8px;
  }
`;

const TabContent = styled.div`
  min-height: 300px;
`;

const TabPane = styled.div`
  animation: ${fadeInUp} 0.4s ease-out;
`;

const TabTitle = styled.h4`
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 15px;
  color: ${colors.darkGray};
`;

const TabContentArea = styled.div`
  background: linear-gradient(135deg, 
    ${colors.white} 0%, 
    rgba(248, 249, 250, 0.5) 100%
  );
  border-radius: 15px;
  padding: 20px;
  border: 2px solid ${colors.lightGray};
  min-height: 200px;
`;

const NoteDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentNote, loading, error } = useSelector(state => state.notes);
  const [showChatBot, setShowChatBot] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [activeTab, setActiveTab] = useState('transcription');
  
  useEffect(() => {
    dispatch(fetchNoteById(id));
    
    return () => {
      dispatch(clearCurrentNote());
    };
  }, [dispatch, id]);
  
  const handleBack = () => {
    navigate(-1);
  };
  
  const handleEdit = () => {
    navigate(`/notes/edit/${id}`);
  };
  
  const handleShare = () => {
    setShowShareModal(true);
  };
  
  const handleDelete = () => {
    dispatch(openConfirmDialog({
      title: t('noteDetail.confirmDelete.title'),
      message: t('noteDetail.confirmDelete.message'),
      confirmText: t('noteDetail.confirmDelete.confirm'),
      cancelText: t('noteDetail.confirmDelete.cancel'),
      onConfirm: () => {
        dispatch(moveNoteToTrash(id));
        navigate('/notes');
      }
    }));
  };

  const handleChatBotToggle = () => {
    setShowChatBot(!showChatBot);
  };
  
  if (loading) {
    return <Spinner fullHeight />;
  }
  
  if (error) {
    return (
      <NoteDetailContainer>
        <ControlsHeader>
          <BackButton onClick={handleBack}>
            <FaArrowLeft />
            {t('noteDetail.actions.back')}
          </BackButton>
        </ControlsHeader>
        <NoDataMessage>
          {t('noteDetail.errors.loadingError')}: {error}
        </NoDataMessage>
      </NoteDetailContainer>
    );
  }
  
  if (!currentNote) {
    return (
      <NoteDetailContainer>
        <ControlsHeader>
          <BackButton onClick={handleBack}>
            <FaArrowLeft />
            {t('noteDetail.actions.back')}
          </BackButton>
        </ControlsHeader>
        <NoDataMessage>
          {t('noteDetail.errors.notFound')}
        </NoDataMessage>
      </NoteDetailContainer>
    );
  }
  
  return (
    <NoteDetailContainer>
      <ControlsHeader>
        <BackButton onClick={handleBack}>
          <FaArrowLeft />
          {t('noteDetail.actions.back')}
        </BackButton>
        
        <ActionButtons>
          <ActionButton 
            variant="edit"
            onClick={handleEdit}
          >
            <FaEdit />
            {t('noteDetail.actions.edit')}
          </ActionButton>
          
          <ActionButton 
            variant="share"
            onClick={handleShare}
          >
            <FaShareAlt />
            {t('noteDetail.actions.share')}
          </ActionButton>
          
          <ActionButton 
            variant="chat"
            onClick={handleChatBotToggle}
          >
            <FaRobot />
            {t('noteDetail.actions.chatBot')}
          </ActionButton>
          
          <ActionButton 
            variant="delete"
            onClick={handleDelete}
          >
            <FaTrash />
            {t('noteDetail.actions.delete')}
          </ActionButton>
        </ActionButtons>
      </ControlsHeader>
      
      {/* 일반 노트일 때만 기본 노트 카드 표시 */}
      {!currentNote.isVoice && (
        <NoteCard>
          <NoteHeader>
            <NoteTitle>{currentNote.title}</NoteTitle>
            <NoteMeta>
              <NoteType>
                <FaStickyNote />
                {t('noteDetail.type.text')}
              </NoteType>
              <NoteTimestamp>
                {formatRelativeTime(currentNote.updatedAt)}
              </NoteTimestamp>
            </NoteMeta>
          </NoteHeader>
          
          <NoteContent>
            <ReactMarkdown>{currentNote.content}</ReactMarkdown>
          </NoteContent>
          
          {currentNote.tags && currentNote.tags.length > 0 && (
            <NoteFooter>
              {currentNote.tags.map((tag, index) => (
                <NoteTag key={index}>
                  <FaTag />
                  {tag}
                </NoteTag>
              ))}
            </NoteFooter>
          )}
        </NoteCard>
      )}

      {/* 음성 노트일 때도 제목 표시 */}
      {currentNote.isVoice && (
        <NoteCard>
          <NoteHeader>
            <NoteTitle>{currentNote.title}</NoteTitle>
            <NoteMeta>
              <NoteType>
                <FaMicrophone />
                {t('noteDetail.type.voice')}
              </NoteType>
              <NoteTimestamp>
                {formatRelativeTime(currentNote.updatedAt)}
              </NoteTimestamp>
            </NoteMeta>
          </NoteHeader>
        </NoteCard>
      )}

      {/* 음성 노트일 때만 오디오 플레이어 표시 */}
      {currentNote.isVoice && currentNote.audioUrl && (
        <AudioPlayer>
          <StyledAudio controls>
            <source src={currentNote.audioUrl} type="audio/mpeg" />
            {t('noteDetail.audio.notSupported')}
          </StyledAudio>
        </AudioPlayer>
      )}

      {/* 탭 섹션 - 음성노트일 때만 표시 */}
      {currentNote.isVoice && (
        <TabSection>
          <TabSectionHeader>
            <TabSectionTitle>
              🎵 음성 분석 결과
            </TabSectionTitle>
          </TabSectionHeader>
          
          {/* 탭 네비게이션 */}
          <TabContainer>
            <TabButton 
              active={activeTab === 'transcription'}
              onClick={() => setActiveTab('transcription')}
            >
              <FaMicrophone />
              텍스트변환
            </TabButton>
            <TabButton 
              active={activeTab === 'summary'}
              onClick={() => setActiveTab('summary')}
              style={{ opacity: currentNote.summary ? 1 : 0.7 }}
            >
              <FaFileAlt />
              요약
            </TabButton>
            <TabButton 
              active={activeTab === 'keywords'}
              onClick={() => setActiveTab('keywords')}
              style={{ opacity: currentNote.keywords ? 1 : 0.7 }}
            >
              <FaTag />
              키워드
            </TabButton>
            <TabButton 
              active={activeTab === 'translation'}
              onClick={() => setActiveTab('translation')}
              style={{ opacity: currentNote.translation ? 1 : 0.7 }}
            >
              🌍
              번역
            </TabButton>
          </TabContainer>
          
          {/* 탭 컨텐츠 */}
          <TabContent>
            {activeTab === 'transcription' && (
              <TabPane>
                <TabTitle>📝 텍스트변환</TabTitle>
                <TabContentArea>
                  {currentNote.content ? (
                    <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                      {currentNote.content}
                    </div>
                  ) : (
                    <div style={{ 
                      color: colors.darkGray, 
                      fontStyle: 'italic', 
                      textAlign: 'center', 
                      padding: '40px' 
                    }}>
                      🎵 텍스트 변환 결과가 없습니다.
                    </div>
                  )}
                </TabContentArea>
              </TabPane>
            )}
            
            {activeTab === 'summary' && (
  <TabPane>
    <TabTitle>📊 요약</TabTitle>
    <TabContentArea>
      {(() => {
        // 1순위: currentNote.summary 필드
        if (currentNote.summary) {
          return (
            <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
              {currentNote.summary}
            </div>
          );
        }
        
        // 2순위: content에서 파싱
        const summaryMatch = currentNote.content?.match(/## 📊 요약\n\n(.*?)(?=\n\n##|$)/s);
        const summaryText = summaryMatch && summaryMatch[1].trim();
        
        if (summaryText) {
          return (
            <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
              {summaryText}
            </div>
          );
        }
        
        // 3순위: 없음 메시지
        return (
          <div style={{ color: colors.darkGray, fontStyle: 'italic', textAlign: 'center', padding: '40px' }}>
            요약 내용이 없습니다.
          </div>
        );
      })()}
    </TabContentArea>
  </TabPane>
)}
            
            {activeTab === 'keywords' && (
  <TabPane>
    <TabTitle>🏷️ 키워드</TabTitle>
    <TabContentArea>
      {(() => {
        // 1순위: currentNote.keywords 필드
        if (currentNote.keywords) {
          return (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              {currentNote.keywords.split(',').map((keyword, index) => (
                <NoteTag key={index}>
                  <FaTag />
                  {keyword.trim()}
                </NoteTag>
              ))}
            </div>
          );
        }
        
        // 2순위: content에서 파싱
        const keywordsMatch = currentNote.content?.match(/## 🔍 핵심 키워드\n\n(.*?)(?=\n\n##|$)/s);
        const keywordsText = keywordsMatch && keywordsMatch[1].trim();
        
        if (keywordsText) {
          return (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              {keywordsText.split(',').map((keyword, index) => (
                <NoteTag key={index}>
                  <FaTag />
                  {keyword.trim()}
                </NoteTag>
              ))}
            </div>
          );
        }
        
        // 3순위: 없음 메시지
        return (
          <div style={{ color: colors.darkGray, fontStyle: 'italic', textAlign: 'center', padding: '40px' }}>
            키워드 정보가 없습니다.
          </div>
        );
      })()}
    </TabContentArea>
  </TabPane>
)}
            
            {activeTab === 'translation' && (
  <TabPane>
    <TabTitle>🌍 번역</TabTitle>
    <TabContentArea>
      {(() => {
        // 1순위: currentNote.translation 필드
        if (currentNote.translation) {
          return (
            <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
              {currentNote.translation}
            </div>
          );
        }
        
        // 2순위: content에서 파싱
        const translationMatch = currentNote.content?.match(/## 🌍 번역 결과 \(.*?\)\n\n(.*?)(?=\n\n##|$)/s);
        const translationText = translationMatch && translationMatch[1].trim();
        
        if (translationText) {
          return (
            <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
              {translationText}
            </div>
          );
        }
        
        // 3순위: 없음 메시지
        return (
          <div style={{ color: colors.darkGray, fontStyle: 'italic', textAlign: 'center', padding: '40px' }}>
            번역 내용이 없습니다.
          </div>
        );
      })()}
    </TabContentArea>
  </TabPane>
)}
          </TabContent>
        </TabSection>
      )}

      {/* ChatBot 컴포넌트 - 토글 방식으로 복원 */}
      {showChatBot && (
        <ChatBot
          noteId={currentNote._id}
          noteTitle={currentNote.title}
          noteContent={currentNote.content}
        />
      )}

      {/* ShareModal 컴포넌트 */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        note={currentNote}
      />
      
    </NoteDetailContainer>
  );
};

export default NoteDetail;