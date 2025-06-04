import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { 
  FaShareAlt, 
  FaUser, 
  FaStickyNote, 
  FaMicrophone,
  FaExternalLinkAlt,
  FaClock,
  FaUsers,
  FaLink,
  FaCopy,
  FaEye
} from 'react-icons/fa';
import { fetchSharedNotes } from '../redux/slices/noteSlice';
import Button from '../components/shared/Button';
import Spinner from '../components/shared/Spinner';
import Alert from '../components/shared/Alert';
import { formatRelativeTime } from '../utils/formatters';

// Colors - 메인 페이지와 동일한 컬러 팔레트
const colors = {
  magenta: '#E91E63',
  cyan: '#00BCD4', 
  darkGray: '#424242',
  lime: '#8BC34A',
  lightGray: '#E0E0E0',
  white: '#FFFFFF'
};

// Animation keyframes
const animations = {
  fadeIn: `
    0% { opacity: 0; transform: translateY(20px); }
    100% { opacity: 1; transform: translateY(0); }
  `,
  slideIn: `
    0% { transform: translateX(-20px); opacity: 0; }
    100% { transform: translateX(0); opacity: 1; }
  `,
  scaleIn: `
    0% { transform: scale(0.95); opacity: 0; }
    100% { transform: scale(1); opacity: 1; }
  `
};

// Common styled component patterns
const ClipPath = {
  rectangle: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 12px 100%)',
  button: 'polygon(0 0, calc(100% - 8px) 0, 100% 100%, 8px 100%)',
  card: 'polygon(0 0, calc(100% - 6px) 0, 100% 100%, 6px 100%)'
};

const SharedNotesContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(135deg, ${colors.lightGray} 0%, ${colors.white} 100%);
  padding: 0;
  margin: -20px;
  animation: fadeIn 0.6s ease-out;
  
  @keyframes fadeIn {
    ${animations.fadeIn}
  }
`;

const Header = styled.div`
  background: linear-gradient(135deg, ${colors.white} 0%, #F8F9FA 100%);
  padding: 30px 40px;
  border-bottom: 3px solid transparent;
  border-image: linear-gradient(90deg, ${colors.magenta}, ${colors.cyan}, ${colors.lime}) 1;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 100px;
    height: 100px;
    background: ${colors.lime};
    opacity: 0.1;
    transform: rotate(45deg);
  }
  
  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
`;

const TitleSection = styled.div`
  animation: slideIn 0.6s ease-out;
  
  @keyframes slideIn {
    ${animations.slideIn}
  }
  
  h1 {
    font-size: 2.2rem;
    font-weight: 700;
    margin: 0 0 8px;
    background: linear-gradient(135deg, ${colors.darkGray} 0%, ${colors.magenta} 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    display: flex;
    align-items: center;
    gap: 12px;
    
    svg {
      color: ${colors.cyan};
      font-size: 2rem;
    }
    
    @media (max-width: 768px) {
      font-size: 1.8rem;
      
      svg {
        font-size: 1.6rem;
      }
    }
  }
  
  .subtitle {
    font-size: 15px;
    color: ${colors.darkGray};
    opacity: 0.8;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 8px;
    margin-left: 44px;
    
    &::before {
      content: '';
      width: 4px;
      height: 4px;
      background: ${colors.cyan};
      border-radius: 50%;
    }
    
    @media (max-width: 768px) {
      margin-left: 36px;
    }
  }
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 15px;
  align-items: center;
  
  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const BackButton = styled(Button)`
  background: linear-gradient(135deg, ${colors.cyan} 0%, ${colors.lime} 100%) !important;
  border: none !important;
  clip-path: ${ClipPath.button};
  font-weight: 600 !important;
  box-shadow: 0 4px 15px rgba(0, 188, 212, 0.3) !important;
  transition: all 0.3s ease !important;
  
  &:hover:not(:disabled) {
    background: linear-gradient(135deg, ${colors.magenta} 0%, ${colors.cyan} 100%) !important;
    transform: translateY(-2px) !important;
    box-shadow: 0 8px 25px rgba(233, 30, 99, 0.4) !important;
  }
`;

const ContentArea = styled.div`
  flex: 1;
  padding: 40px;
  
  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const NotesList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 25px;
  animation: scaleIn 0.8s ease-out;
  
  @keyframes scaleIn {
    ${animations.scaleIn}
  }
`;

const NoteCard = styled.div`
  background: ${colors.white};
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0,0,0,0.08);
  clip-path: ${ClipPath.rectangle};
  padding: 25px;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, ${colors.cyan}, ${colors.lime});
    transform: scaleX(0);
    transition: transform 0.3s ease;
  }
  
  &:hover {
    box-shadow: 0 8px 30px rgba(0,0,0,0.15);
    transform: translateY(-8px);
    
    &::before {
      transform: scaleX(1);
    }
    
    .share-actions {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const SharedBadge = styled.div`
  background: linear-gradient(135deg, ${colors.cyan}, ${colors.lime});
  color: white;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 15px;
  clip-path: ${ClipPath.card};
  box-shadow: 0 2px 8px rgba(0, 188, 212, 0.3);
  
  svg {
    font-size: 11px;
  }
`;

const NoteTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 12px;
  color: ${colors.darkGray};
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const SharedWith = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 15px;
`;

const UserChip = styled.div`
  display: flex;
  align-items: center;
  background: ${colors.magenta}15;
  color: ${colors.darkGray};
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
  clip-path: ${ClipPath.card};
  border: 1px solid ${colors.magenta}20;
  
  svg {
    margin-right: 6px;
    color: ${colors.magenta};
    font-size: 11px;
  }
`;

const NoteContent = styled.div`
  font-size: 14px;
  color: ${colors.darkGray};
  opacity: 0.8;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 20px;
`;

const NoteFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 15px;
  border-top: 2px solid ${colors.lightGray};
  font-size: 12px;
  color: ${colors.darkGray};
  opacity: 0.7;
`;

const NoteType = styled.div`
  display: flex;
  align-items: center;
  background: ${({ $isVoice }) => 
    $isVoice ? `${colors.cyan}20` : `${colors.magenta}20`};
  color: ${({ $isVoice }) => 
    $isVoice ? colors.cyan : colors.magenta};
  padding: 6px 12px;
  font-size: 11px;
  font-weight: 600;
  clip-path: ${ClipPath.card};
  
  svg {
    margin-right: 6px;
    font-size: 10px;
  }
`;

const DateDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  
  svg {
    font-size: 10px;
  }
`;

const ShareActions = styled.div`
  position: absolute;
  top: 15px;
  right: 15px;
  display: flex;
  gap: 6px;
  opacity: 0;
  transform: translateY(-10px);
  transition: all 0.3s ease;
  background: ${colors.white}F0;
  backdrop-filter: blur(10px);
  clip-path: ${ClipPath.card};
  padding: 6px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
`;

const ActionButton = styled.button`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 0;
  clip-path: ${ClipPath.card};
  background: transparent;
  color: ${colors.darkGray};
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  
  &:hover {
    background: ${({ $color }) => {
      switch($color) {
        case 'primary': return `${colors.cyan}20`;
        case 'success': return `${colors.lime}20`;
        default: return `${colors.magenta}20`;
      }
    }};
    color: ${({ $color }) => {
      switch($color) {
        case 'primary': return colors.cyan;
        case 'success': return colors.lime;
        default: return colors.magenta;
      }
    }};
    transform: scale(1.1);
  }
`;

const ShareLinkButton = styled(Button)`
  background: linear-gradient(135deg, ${colors.lime} 0%, ${colors.cyan} 100%) !important;
  border: none !important;
  clip-path: ${ClipPath.button};
  font-weight: 600 !important;
  box-shadow: 0 4px 15px rgba(139, 195, 74, 0.3) !important;
  transition: all 0.3s ease !important;
  font-size: 12px !important;
  padding: 8px 12px !important;
  margin-top: 10px !important;
  
  &:hover:not(:disabled) {
    background: linear-gradient(135deg, ${colors.cyan} 0%, ${colors.magenta} 100%) !important;
    transform: translateY(-2px) !important;
    box-shadow: 0 8px 25px rgba(0, 188, 212, 0.4) !important;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 40px;
  text-align: center;
  background: ${colors.white};
  border-radius: 0;
  clip-path: ${ClipPath.rectangle};
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, ${colors.cyan}, ${colors.lime});
  }
  
  .icon {
    font-size: 4rem;
    background: linear-gradient(135deg, ${colors.cyan}, ${colors.lime});
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 25px;
  }
  
  .text {
    font-size: 18px;
    color: ${colors.darkGray};
    margin: 0 0 25px;
    font-weight: 500;
  }
`;

const StatsSection = styled.div`
  background: ${colors.white};
  padding: 20px 25px;
  margin-bottom: 30px;
  clip-path: ${ClipPath.rectangle};
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, ${colors.cyan}, ${colors.lime});
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
`;

const StatItem = styled.div`
  text-align: center;
  
  .number {
    font-size: 2rem;
    font-weight: 700;
    background: linear-gradient(135deg, ${colors.cyan}, ${colors.lime});
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 5px;
  }
  
  .label {
    font-size: 14px;
    color: ${colors.darkGray};
    opacity: 0.8;
    font-weight: 500;
  }
`;

const SharedByMeNotes = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { sharedNotes, loading, error } = useSelector(state => state.notes);
  
  useEffect(() => {
    dispatch(fetchSharedNotes());
  }, [dispatch]);
  
  const sharedByMe = sharedNotes.filter(note => !note.shared?.sharedWithMe);
  
  const handleNoteClick = (noteId) => {
    navigate(`/notes/${noteId}`);
  };
  
  const handleCopyLink = (e, shareLink) => {
    e.stopPropagation();
    navigator.clipboard.writeText(shareLink);
    // TODO: 성공 알림 추가
    alert('공유 링크가 클립보드에 복사되었습니다.');
  };
  
  const handleViewNote = (e, noteId) => {
    e.stopPropagation();
    navigate(`/notes/${noteId}`);
  };
  
  const truncateText = (text, maxLength = 150) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  const formatRelativeTimeCustom = (date) => {
    const now = new Date();
    const noteDate = new Date(date);
    const diffMs = now - noteDate;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffDays > 7) {
      return noteDate.toLocaleDateString('ko-KR', { 
        month: 'short', 
        day: 'numeric' 
      });
    } else if (diffDays > 0) {
      return `${diffDays}일 전`;
    } else if (diffHours > 0) {
      return `${diffHours}시간 전`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes}분 전`;
    } else {
      return '방금 전';
    }
  };
  
  // 통계 계산
  const totalSharedUsers = sharedByMe.reduce((total, note) => {
    return total + (note.shared?.sharedWith?.length || 0);
  }, 0);
  
  const totalSharedLinks = sharedByMe.filter(note => note.shared?.shareLink).length;
  
  if (loading) {
    return <Spinner fullHeight />;
  }
  
  return (
    <SharedNotesContainer>
      <Header>
        <HeaderContent>
          <TitleSection>
            <h1>
              <FaShareAlt />
              공유한 노트
            </h1>
            <div className="subtitle">
              다른 사용자와 공유한 노트 목록입니다
            </div>
          </TitleSection>
          
          <HeaderActions>
            <BackButton onClick={() => navigate('/notes')} icon={<FaStickyNote />}>
              전체 노트로 이동
            </BackButton>
          </HeaderActions>
        </HeaderContent>
      </Header>
      
      {error && (
        <div style={{ padding: '0 40px' }}>
          <Alert
            variant="error"
            message={error}
            marginBottom="20px"
          />
        </div>
      )}
      
      <ContentArea>
        {sharedByMe.length > 0 && (
          <StatsSection>
            <StatsGrid>
              <StatItem>
                <div className="number">{sharedByMe.length}</div>
                <div className="label">공유한 노트</div>
              </StatItem>
              <StatItem>
                <div className="number">{totalSharedUsers}</div>
                <div className="label">공유받은 사용자</div>
              </StatItem>
              <StatItem>
                <div className="number">{totalSharedLinks}</div>
                <div className="label">공유 링크</div>
              </StatItem>
            </StatsGrid>
          </StatsSection>
        )}
        
        {sharedByMe.length > 0 ? (
          <NotesList>
            {sharedByMe.map(note => (
              <NoteCard 
                key={note._id} 
                onClick={() => handleNoteClick(note._id)}
              >
                <ShareActions className="share-actions">
                  <ActionButton 
                    onClick={(e) => handleViewNote(e, note._id)} 
                    title="노트 보기"
                    $color="primary"
                  >
                    <FaEye />
                  </ActionButton>
                  {note.shared?.shareLink && (
                    <ActionButton 
                      onClick={(e) => handleCopyLink(e, note.shared.shareLink)} 
                      title="링크 복사"
                      $color="success"
                    >
                      <FaCopy />
                    </ActionButton>
                  )}
                </ShareActions>
                
                <SharedBadge>
                  <FaShareAlt />
                  공유됨
                </SharedBadge>
                
                <NoteTitle>{note.title}</NoteTitle>
                
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
                  <ShareLinkButton
                    fullWidth
                    size="small"
                    onClick={(e) => handleCopyLink(e, note.shared.shareLink)}
                    icon={<FaLink />}
                  >
                    공유 링크 복사
                  </ShareLinkButton>
                )}
                
                <NoteFooter>
                  <NoteType $isVoice={note.isVoice}>
                    {note.isVoice ? <FaMicrophone /> : <FaStickyNote />}
                    {note.isVoice ? '음성' : '텍스트'}
                  </NoteType>
                  <DateDisplay>
                    <FaClock />
                    {formatRelativeTimeCustom(note.updatedAt)}
                  </DateDisplay>
                </NoteFooter>
              </NoteCard>
            ))}
          </NotesList>
        ) : (
          <EmptyState>
            <div className="icon">
              <FaShareAlt />
            </div>
            <div className="text">
              아직 공유한 노트가 없습니다.
            </div>
            <BackButton onClick={() => navigate('/notes')} icon={<FaStickyNote />}>
              노트 목록으로 이동
            </BackButton>
          </EmptyState>
        )}
      </ContentArea>
    </SharedNotesContainer>
  );
};

export default SharedByMeNotes;