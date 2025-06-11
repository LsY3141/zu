// src/pages/NoteDetail.jsx - ChatBot 통합 버전
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
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
  FaComments
} from 'react-icons/fa';
import { fetchNoteById, clearCurrentNote, moveNoteToTrash } from '../redux/slices/noteSlice';
import Button from '../components/shared/Button';
import Spinner from '../components/shared/Spinner';
import ChatBot from '../components/shared/ChatBot';
import ShareModal from '../components/shared/ShareModal';
import { formatRelativeTime } from '../utils/formatters';
import { openConfirmDialog } from '../redux/slices/uiSlice';

const NoteDetailContainer = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
`;

const ControlsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const BackButton = styled(Button)`
  margin-right: 10px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
`;

const NoteCard = styled.div`
  background-color: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.boxShadow.card};
  overflow: hidden;
  margin-bottom: 20px;
`;

const NoteHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const NoteTitle = styled.h1`
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 10px;
  color: ${({ theme }) => theme.colors.text};
`;

const NoteMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
`;

const NoteType = styled.div`
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 5px;
  }
`;

const NoteTimestamp = styled.div``;

const NoteContent = styled.div`
  padding: 20px;
  color: ${({ theme }) => theme.colors.text};
  font-size: 16px;
  line-height: 1.6;
`;

const NoteFooter = styled.div`
  padding: 15px 20px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const NoteTag = styled.div`
  display: flex;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.primaryLight};
  color: ${({ theme }) => theme.colors.primary};
  padding: 5px 10px;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-size: 12px;
  
  svg {
    margin-right: 5px;
  }
`;

const AudioPlayer = styled.div`
  margin-bottom: 20px;
  background-color: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.boxShadow.card};
  padding: 20px;
`;

const StyledAudio = styled.audio`
  width: 100%;
`;

const TranscriptionCard = styled.div`
  background-color: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.boxShadow.card};
  overflow: hidden;
  margin-bottom: 20px;
`;

const TranscriptionHeader = styled.div`
  padding: 15px 20px;
  background-color: ${({ theme }) => theme.colors.primaryLight};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 600;
  font-size: 16px;
`;

const TranscriptionContent = styled.div`
  padding: 20px;
`;

const SpeakerText = styled.div`
  margin-bottom: 15px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SpeakerLabel = styled.div`
  display: flex;
  align-items: center;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 5px;
  
  svg {
    margin-right: 5px;
  }
`;

const NoDataMessage = styled.div`
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  padding: 40px;
  font-size: 16px;
`;

// AI 도우미 섹션
const AIAssistantSection = styled.div`
  background-color: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.boxShadow.card};
  padding: 20px;
  margin-bottom: 20px;
`;

const AIAssistantHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 15px;
`;

const AIAssistantTitle = styled.h3`
  display: flex;
  align-items: center;
  margin: 0;
  color: ${({ theme }) => theme.colors.text};
  font-size: 18px;
  
  svg {
    margin-right: 8px;
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const NoteDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentNote, loading, error } = useSelector(state => state.notes);
  const [showChatBot, setShowChatBot] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  
  useEffect(() => {
    dispatch(fetchNoteById(id));
    
    // 컴포넌트 언마운트 시 현재 노트 상태 초기화
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
          <BackButton 
            variant="outline" 
            size="small" 
            onClick={handleBack}
            icon={<FaArrowLeft />}
          >
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
          <BackButton 
            variant="outline" 
            size="small" 
            onClick={handleBack}
            icon={<FaArrowLeft />}
          >
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
        <BackButton 
          variant="outline" 
          size="small" 
          onClick={handleBack}
          icon={<FaArrowLeft />}
        >
          {t('noteDetail.actions.back')}
        </BackButton>
        
        <ActionButtons>
          <Button 
            variant="outline" 
            size="small" 
            onClick={handleEdit}
            icon={<FaEdit />}
          >
            {t('noteDetail.actions.edit')}
          </Button>
          
          <Button 
            variant="outline" 
            size="small" 
            onClick={handleShare}
            icon={<FaShareAlt />}
          >
            {t('noteDetail.actions.share')}
          </Button>
          
          <Button 
            variant="outline" 
            size="small" 
            onClick={handleChatBotToggle}
            icon={<FaRobot />}
          >
            {t('noteDetail.actions.chatBot')}
          </Button>
          
          <Button 
            variant="outline" 
            size="small" 
            onClick={handleDelete}
            icon={<FaTrash />}
            color="danger"
          >
            {t('noteDetail.actions.delete')}
          </Button>
        </ActionButtons>
      </ControlsHeader>
      
      <NoteCard>
        <NoteHeader>
          <NoteTitle>{currentNote.title}</NoteTitle>
          <NoteMeta>
            <NoteType>
              {currentNote.isVoice ? (
                <>
                  <FaMicrophone />
                  {t('noteDetail.types.voice')}
                </>
              ) : (
                <>
                  <FaStickyNote />
                  {t('noteDetail.types.text')}
                </>
              )}
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
      
      {/* 음성 파일이 있는 경우 오디오 플레이어 */}
      {currentNote.isVoice && currentNote.audioUrl && (
        <AudioPlayer>
          <StyledAudio controls>
            <source src={currentNote.audioUrl} type="audio/mpeg" />
            Your browser does not support the audio element.
          </StyledAudio>
        </AudioPlayer>
      )}
      
      {/* 음성 텍스트 변환 결과 */}
      {currentNote.isVoice && currentNote.transcription && currentNote.transcription.speakers && currentNote.transcription.speakers.length > 0 && (
        <TranscriptionCard>
          <TranscriptionHeader>
            {t('noteDetail.transcription.title')}
          </TranscriptionHeader>
          <TranscriptionContent>
            {currentNote.transcription.speakers.map((speaker, index) => (
              <SpeakerText key={index} speakerId={speaker.id}>
                <SpeakerLabel>
                  <FaMicrophone /> {t('noteDetail.transcription.speaker')} {speaker.id}
                </SpeakerLabel>
                {speaker.text}
              </SpeakerText>
            ))}
          </TranscriptionContent>
        </TranscriptionCard>
      )}
      
      {/* 요약 */}
      {currentNote.isVoice && currentNote.transcription && currentNote.transcription.summary && (
        <TranscriptionCard>
          <TranscriptionHeader>
            {t('noteDetail.transcription.summary')}
          </TranscriptionHeader>
          <TranscriptionContent>
            {currentNote.transcription.summary}
          </TranscriptionContent>
        </TranscriptionCard>
      )}
      
      {/* 핵심 개념 */}
      {currentNote.isVoice && currentNote.transcription && currentNote.transcription.keyPhrases && currentNote.transcription.keyPhrases.length > 0 && (
        <TranscriptionCard>
          <TranscriptionHeader>
            {t('noteDetail.transcription.keyPhrases')}
          </TranscriptionHeader>
          <TranscriptionContent>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {currentNote.transcription.keyPhrases.map((phrase, index) => (
                <NoteTag key={index}>
                  <FaTag />
                  {phrase}
                </NoteTag>
              ))}
            </div>
          </TranscriptionContent>
        </TranscriptionCard>
      )}

      {/* ChatBot 컴포넌트 */}
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