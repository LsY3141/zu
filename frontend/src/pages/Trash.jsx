import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { 
  FaTrashRestore, 
  FaTrashAlt, 
  FaExclamationTriangle, 
  FaStickyNote, 
  FaMicrophone 
} from 'react-icons/fa';
import { fetchNotes } from '../redux/slices/noteSlice';
import Card from '../components/shared/Card';
import Button from '../components/shared/Button';
import Spinner from '../components/shared/Spinner';
import Alert from '../components/shared/Alert';
import { formatRelativeTime } from '../utils/formatters';
import useNotes from '../hooks/useNotes';

const TrashContainer = styled.div`
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

const TrashInfo = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 5px;
    color: ${({ theme }) => theme.colors.warning};
  }
`;

const NotesList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
`;

const NoteCard = styled(Card)`
  position: relative;
  cursor: pointer;
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const DeletedBadge = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: ${({ theme }) => theme.colors.danger};
  color: white;
  padding: 3px 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
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

const NoteDateInfo = styled.div`
  text-align: right;
  font-size: 11px;
`;

const DeletedDate = styled.div`
  color: ${({ theme }) => theme.colors.danger};
  font-weight: 500;
`;

const OriginalDate = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: 2px;
`;

const NoteActions = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 10px;
`;

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
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 20px;
`;

const EmptyStateText = styled.p`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
`;

const Trash = () => {
  const navigate = useNavigate();
  const { notes, loading, error, handleRestoreNote, handleDeletePermanently } = useNotes(true);
  
  if (loading) {
    return <Spinner fullHeight />;
  }
  
  const truncateText = (text, maxLength = 150) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };
  
  // 날짜 포맷팅 함수
  const formatDate = (date) => {
    if (!date) return '';
    try {
      return formatRelativeTime(date);
    } catch (error) {
      console.error('날짜 포맷팅 오류:', error);
      return '날짜 오류';
    }
  };
  
  return (
    <TrashContainer>
      <PageHeader>
        <PageTitle>휴지통</PageTitle>
        <TrashInfo>
          <FaExclamationTriangle />
          삭제된 노트는 30일 후 자동으로 영구 삭제됩니다.
        </TrashInfo>
      </PageHeader>
      
      {error && (
        <Alert
          variant="error"
          message={error}
          marginBottom="20px"
        />
      )}
      
      {notes.length > 0 ? (
        <NotesList>
          {notes.map(note => {
            console.log('휴지통 노트 렌더링:', {
              id: note._id,
              title: note.title,
              createdAt: note.createdAt,
              updatedAt: note.updatedAt,
              deletedAt: note.deletedAt
            });
            
            return (
              <NoteCard 
                key={note._id} 
                title={note.title}
              >
                <DeletedBadge>삭제됨</DeletedBadge>
                <NoteContent>{truncateText(note.content)}</NoteContent>
                <NoteFooter>
                  <NoteType>
                    {note.isVoice ? <FaMicrophone /> : <FaStickyNote />}
                    {note.isVoice ? '음성 노트' : '텍스트 노트'}
                  </NoteType>
                  <NoteDateInfo>
                    <DeletedDate>
                      {note.deletedAt ? formatDate(note.deletedAt) : '알 수 없음'} 삭제됨
                    </DeletedDate>
                    <OriginalDate>
                      원본: {note.updatedAt ? formatDate(note.updatedAt) : '알 수 없음'} 수정됨
                    </OriginalDate>
                  </NoteDateInfo>
                </NoteFooter>
                <NoteActions>
                  <Button
                    variant="outline"
                    size="small"
                    fullWidth
                    onClick={() => {
                      console.log('복원 버튼 클릭:', {
                        noteId: note._id,
                        title: note.title,
                        originalCreatedAt: note.createdAt,
                        originalUpdatedAt: note.updatedAt
                      });
                      handleRestoreNote(note._id);
                    }}
                    icon={<FaTrashRestore />}
                  >
                    복원하기
                  </Button>
                  <Button
                    variant="outline"
                    color="danger"
                    size="small"
                    fullWidth
                    onClick={() => handleDeletePermanently(note._id)}
                    icon={<FaTrashAlt />}
                  >
                    영구 삭제
                  </Button>
                </NoteActions>
              </NoteCard>
            );
          })}
        </NotesList>
      ) : (
        <EmptyState>
          <EmptyStateIcon>
            <FaTrashAlt />
          </EmptyStateIcon>
          <EmptyStateText>
            휴지통이 비어 있습니다.
          </EmptyStateText>
        </EmptyState>
      )}
    </TrashContainer>
  );
};

export default Trash;