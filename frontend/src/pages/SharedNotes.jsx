import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { 
  FaShareAlt, 
  FaUser, 
  FaStickyNote, 
  FaMicrophone,
  FaExternalLinkAlt
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

const TabsContainer = styled.div`
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const Tab = styled.button`
  background: none;
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  font-weight: ${({ active, theme }) => 
    active ? theme.fontWeights.bold : theme.fontWeights.normal};
  color: ${({ active, theme }) => 
    active ? theme.colors.primary : theme.colors.text};
  border-bottom: 2px solid ${({ active, theme }) => 
    active ? theme.colors.primary : 'transparent'};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
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

const SharedWith = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 10px;
`;

const UserChip = styled.div`
  display: flex;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.background};
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 12px;
  
  svg {
    margin-right: 5px;
  }
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

const SharedNotes = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { sharedNotes, loading, error } = useSelector(state => state.notes);
  const [activeTab, setActiveTab] = React.useState('shared-with-me');
  
  useEffect(() => {
    dispatch(fetchSharedNotes());
  }, [dispatch]);
  
  // 공유받은 노트와 내가 공유한 노트 필터링
  const sharedWithMe = sharedNotes.filter(note => note.shared?.sharedWithMe);
  const sharedByMe = sharedNotes.filter(note => !note.shared?.sharedWithMe);
  
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
        <PageTitle>공유된 노트</PageTitle>
      </PageHeader>
      
      {error && (
        <Alert
          variant="error"
          message={error}
          marginBottom="20px"
        />
      )}
      
      <TabsContainer>
        <Tab 
          active={activeTab === 'shared-with-me'} 
          onClick={() => setActiveTab('shared-with-me')}
        >
          나와 공유된 노트
        </Tab>
        <Tab 
          active={activeTab === 'shared-by-me'} 
          onClick={() => setActiveTab('shared-by-me')}
        >
          내가 공유한 노트
        </Tab>
      </TabsContainer>
      
      {activeTab === 'shared-with-me' && (
        <>
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
            </EmptyState>
          )}
        </>
      )}
      
      {activeTab === 'shared-by-me' && (
        <>
          {sharedByMe.length > 0 ? (
            <NotesList>
              {sharedByMe.map(note => (
                <NoteCard 
                  key={note._id} 
                  title={note.title}
                  onClick={() => handleNoteClick(note._id)}
                >
                  <SharedBadge>
                    <FaShareAlt style={{ marginRight: '5px' }} />
                    공유됨
                  </SharedBadge>
                  
                  {note.shared?.sharedWith && note.shared.sharedWith.length > 0 && (
                    <SharedWith>
                      {note.shared.sharedWith.map((user, index) => (
                        <UserChip key={index}>
                          <FaUser />
                          {user.username || '사용자'}
                        </UserChip>
                      ))}
                    </SharedWith>
                  )}
                  
                  <NoteContent>{truncateText(note.content)}</NoteContent>
                  
                  {note.shared?.shareLink && (
                    <Button
                      variant="outline"
                      size="small"
                      fullWidth
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(note.shared.shareLink);
                        alert('공유 링크가 클립보드에 복사되었습니다.');
                      }}
                      icon={<FaExternalLinkAlt />}
                      style={{ marginTop: '10px', marginBottom: '10px' }}
                    >
                      공유 링크 복사
                    </Button>
                  )}
                  
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
                아직 공유한 노트가 없습니다.
              </EmptyStateText>
              <Button 
                onClick={() => navigate('/notes')}
                icon={<FaStickyNote />}
              >
                노트 목록으로 이동
              </Button>
            </EmptyState>
          )}
        </>
      )}
    </SharedNotesContainer>
  );
};

export default SharedNotes;