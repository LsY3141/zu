import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { 
  FaShareAlt, 
  FaUser, 
  FaStickyNote, 
  FaMicrophone
} from 'react-icons/fa';
import { fetchSharedNotes } from '../redux/slices/noteSlice';
import Card from '../components/shared/Card';
import Button from '../components/shared/Button';
import Spinner from '../components/shared/Spinner';
import Alert from '../components/shared/Alert';
import { formatRelativeTime } from '../utils/formatters';

const SharedNotesContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  color: ${({ theme }) => theme.colors.text};
`;

const NotesList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
`;

const NoteCard = styled(Card)`
  cursor: pointer;
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const SharedBadge = styled.div`
  background-color: ${({ theme }) => theme.colors.info};
  color: white;
  padding: 3px 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
  display: inline-block;
  margin-bottom: 10px;
`;

const NoteContent = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 15px;
`;

const NoteFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 10px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const NoteType = styled.div`
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 5px;
  }
`;

const NoteDate = styled.div``;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  text-align: center;
  background-color: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.boxShadow.card};
`;

const EmptyStateIcon = styled.div`
  font-size: 48px;
  color: ${({ theme }) => theme.colors.info};
  margin-bottom: 20px;
`;

const EmptyStateText = styled.p`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0 0 20px;
`;

const SharedWithMeNotes = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { sharedNotes, loading, error } = useSelector(state => state.notes);
  
  useEffect(() => {
    dispatch(fetchSharedNotes());
  }, [dispatch]);
  
  // 공유받은 노트만 필터링
  const sharedWithMe = sharedNotes.filter(note => note.shared?.sharedWithMe);
  
  const handleNoteClick = (noteId) => {
    navigate(`/notes/${noteId}`);
  };
  
  const truncateText = (text, maxLength = 150) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };
  
  if (loading) {
    return <Spinner fullHeight />;
  }
  
  return (
    <SharedNotesContainer>
      <PageHeader>
        <PageTitle>공유받은 노트</PageTitle>
      </PageHeader>
      
      {error && (
        <Alert
          variant="error"
          message={error}
          marginBottom="20px"
        />
      )}
      
      {sharedWithMe.length > 0 ? (
        <NotesList>
          {sharedWithMe.map(note => (
            <NoteCard 
              key={note._id} 
              title={note.title}
              onClick={() => handleNoteClick(note._id)}
            >
              <SharedBadge>
                <FaUser style={{ marginRight: '5px' }} />
                {note.user?.username || '사용자'}님이 공유함
              </SharedBadge>
              <NoteContent>{truncateText(note.content)}</NoteContent>
              <NoteFooter>
                <NoteType>
                  {note.isVoice ? <FaMicrophone /> : <FaStickyNote />}
                  {note.isVoice ? '음성 노트' : '텍스트 노트'}
                </NoteType>
                <NoteDate>
                  {formatRelativeTime(note.updatedAt)}
                </NoteDate>
              </NoteFooter>
            </NoteCard>
          ))}
        </NotesList>
      ) : (
        <EmptyState>
          <EmptyStateIcon>
            <FaShareAlt />
          </EmptyStateIcon>
          <EmptyStateText>
            아직 공유받은 노트가 없습니다.
          </EmptyStateText>
          <Button 
            onClick={() => navigate('/notes')}
            icon={<FaStickyNote />}
          >
            노트 목록으로 이동
          </Button>
        </EmptyState>
      )}
    </SharedNotesContainer>
  );
};

export default SharedWithMeNotes;