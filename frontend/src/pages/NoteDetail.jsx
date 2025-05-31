// src/pages/NoteDetail.jsx - ChatBot 통합 버전
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
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
  padding: 15px;
`;

const AudioTitle = styled.div`
  font-weight: 500;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.colors.text};
  
  svg {
    margin-right: 8px;
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const StyledAudio = styled.audio`
  width: 100%;
`;

const TranscriptionCard = styled.div`
  background-color: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.boxShadow.card};
  margin: 20px 0;
`;

const TranscriptionHeader = styled.div`
  padding: 15px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-weight: 500;
`;

const TranscriptionContent = styled.div`
  padding: 15px 20px;
`;

const SpeakerText = styled.div`
  margin-bottom: 15px;
  padding-left: 10px;
  border-left: 3px solid ${({ theme, speakerId }) => {
    const colors = ['primary', 'secondary', 'success', 'warning', 'info'];
    return theme.colors[colors[parseInt(speakerId) % colors.length]];
  }};
`;

const SpeakerLabel = styled.div`
  font-weight: 500;
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 5px;
  }
`;

const NoDataMessage = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
  padding: 20px;
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
      title: '노트 삭제',
      message: '이 노트를 휴지통으로 이동하시겠습니까?',
      confirmText: '삭제',
      cancelText: '취소',
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
            뒤로 가기
          </BackButton>
        </ControlsHeader>
        <NoDataMessage>
          노트를 불러오는 중 오류가 발생했습니다: {error}
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
            뒤로 가기
          </BackButton>
        </ControlsHeader>
        <NoDataMessage>
          노트를 찾을 수 없습니다.
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
          뒤로 가기
        </BackButton>
        
        <ActionButtons>
          <Button 
            variant="outline" 
            size="small" 
            onClick={handleChatBotToggle}
            icon={<FaComments />}
          >
            AI 도우미
          </Button>
          <Button 
            variant="outline" 
            size="small" 
            onClick={handleShare}
            icon={<FaShareAlt />}
          >
            공유
          </Button>
          <Button 
            variant="outline" 
            size="small" 
            onClick={handleEdit}
            icon={<FaEdit />}
          >
            수정
          </Button>
          <Button 
            variant="outline" 
            size="small" 
            onClick={handleDelete}
            icon={<FaTrash />}
          >
            삭제
          </Button>
        </ActionButtons>
      </ControlsHeader>


      
      <NoteCard>
        <NoteHeader>
          <NoteTitle>{currentNote.title}</NoteTitle>
          <NoteMeta>
            <NoteType>
              {currentNote.isVoice ? <FaMicrophone /> : <FaStickyNote />}
              {currentNote.isVoice ? '음성 노트' : '텍스트 노트'}
              {currentNote.category && ` • ${currentNote.category}`}
            </NoteType>
            <NoteTimestamp>
              {formatRelativeTime(currentNote.updatedAt)} 수정됨
            </NoteTimestamp>
          </NoteMeta>
        </NoteHeader>
        
        <NoteContent>
          <ReactMarkdown>
            {currentNote.content}
          </ReactMarkdown>
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
      
      {currentNote.isVoice && currentNote.audioUrl && (
        <AudioPlayer>
          <AudioTitle>
            <FaMicrophone /> 음성 녹음
          </AudioTitle>
          <StyledAudio controls>
            <source src={currentNote.audioUrl} type="audio/wav" />
            브라우저가 오디오 재생을 지원하지 않습니다.
          </StyledAudio>
        </AudioPlayer>
      )}
      
      {currentNote.isVoice && currentNote.transcription && currentNote.transcription.speakers && currentNote.transcription.speakers.length > 0 && (
        <TranscriptionCard>
          <TranscriptionHeader>
            음성 텍스트 변환 결과
          </TranscriptionHeader>
          <TranscriptionContent>
            {currentNote.transcription.speakers.map((speaker, index) => (
              <SpeakerText key={index} speakerId={speaker.id}>
                <SpeakerLabel>
                  <FaMicrophone /> 화자 {speaker.id}
                </SpeakerLabel>
                {speaker.text}
              </SpeakerText>
            ))}
          </TranscriptionContent>
        </TranscriptionCard>
      )}
      
      {currentNote.isVoice && currentNote.transcription && currentNote.transcription.summary && (
        <TranscriptionCard>
          <TranscriptionHeader>
            요약
          </TranscriptionHeader>
          <TranscriptionContent>
            {currentNote.transcription.summary}
          </TranscriptionContent>
        </TranscriptionCard>
      )}
      
      {currentNote.isVoice && currentNote.transcription && currentNote.transcription.keyPhrases && currentNote.transcription.keyPhrases.length > 0 && (
        <TranscriptionCard>
          <TranscriptionHeader>
            핵심 개념
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