import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { 
  FaShareAlt, 
  FaUser, 
  FaStickyNote, 
  FaMicrophone,
  FaClock,
  FaEye,
  FaHeart,
  FaComment,
  FaArrowLeft,
  FaUsers,
  FaGift,
  FaFileAlt
} from 'react-icons/fa';
import { fetchSharedNotes } from '../redux/slices/noteSlice';
import Button from '../components/shared/Button';
import Spinner from '../components/shared/Spinner';
import Alert from '../components/shared/Alert';
import { formatRelativeTime } from '../utils/formatters';

// Colors - 메인페이지와 동일한 컬러 팔레트
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
  `,
  float: `
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(5deg); }
  `,
  pulse: `
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.05); opacity: 0.8; }
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
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -100px;
    right: -100px;
    width: 200px;
    height: 200px;
    background: ${colors.cyan};
    opacity: 0.1;
    border-radius: 50%;
    animation: float 6s ease-in-out infinite;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -50px;
    left: -50px;
    width: 150px;
    height: 150px;
    background: ${colors.lime};
    opacity: 0.15;
    transform: rotate(45deg);
    animation: float 4s ease-in-out infinite reverse;
  }
  
  @keyframes fadeIn {
    ${animations.fadeIn}
  }
  
  @keyframes float {
    ${animations.float}
  }
`;

const Header = styled.div`
  background: linear-gradient(135deg, ${colors.darkGray} 0%, ${colors.cyan} 100%);
  color: white;
  padding: 60px 40px;
  position: relative;
  overflow: hidden;
  z-index: 2;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M30 0l30 30-30 30L0 30z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    opacity: 0.3;
  }
  
  @media (max-width: 768px) {
    padding: 40px 20px;
  }
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  position: relative;
  z-index: 2;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 15px;
    align-items: center;
    text-align: center;
  }
`;

const TitleSection = styled.div`
  animation: slideIn 0.8s ease-out;
  
  @keyframes slideIn {
    ${animations.slideIn}
  }
  
  h1 {
    font-size: 2.5rem;
    font-weight: 700;
    margin: 0 0 12px;
    display: flex;
    align-items: center;
    gap: 15px;
    
    svg {
      color: ${colors.lime};
      font-size: 2.2rem;
      filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
    }
    
    @media (max-width: 768px) {
      font-size: 2rem;
      justify-content: center;
      
      svg {
        font-size: 1.8rem;
      }
    }
  }
  
  .subtitle {
    font-size: 1.2rem;
    opacity: 0.9;
    font-weight: 300;
    
    @media (max-width: 768px) {
      font-size: 1rem;
    }
  }
  
  .stats {
    margin-top: 15px;
    display: flex;
    gap: 20px;
    font-size: 14px;
    opacity: 0.8;
    
    @media (max-width: 768px) {
      justify-content: center;
      gap: 15px;
    }
    
    .stat-item {
      display: flex;
      align-items: center;
      gap: 6px;
      background: rgba(255,255,255,0.1);
      padding: 6px 12px;
      border-radius: 15px;
      backdrop-filter: blur(10px);
      
      svg {
        font-size: 12px;
      }
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
  background: linear-gradient(135deg, ${colors.lime} 0%, ${colors.cyan} 100%) !important;
  border: none !important;
  clip-path: ${ClipPath.button};
  font-weight: 600 !important;
  box-shadow: 0 6px 20px rgba(139, 195, 74, 0.4) !important;
  transition: all 0.3s ease !important;
  backdrop-filter: blur(10px);
  
  &:hover:not(:disabled) {
    background: linear-gradient(135deg, ${colors.cyan} 0%, ${colors.magenta} 100%) !important;
    transform: translateY(-3px) !important;
    box-shadow: 0 10px 30px rgba(0, 188, 212, 0.5) !important;
  }
`;

const ContentArea = styled.div`
  flex: 1;
  padding: 60px 40px;
  position: relative;
  z-index: 2;
  
  @media (max-width: 768px) {
    padding: 40px 20px;
  }
`;

const StatsSection = styled.div`
  background: ${colors.white};
  padding: 30px;
  margin-bottom: 40px;
  clip-path: ${ClipPath.rectangle};
  box-shadow: 0 8px 30px rgba(0,0,0,0.12);
  position: relative;
  animation: scaleIn 0.6s ease-out;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, ${colors.cyan}, ${colors.lime});
  }
  
  @keyframes scaleIn {
    ${animations.scaleIn}
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 30px;
`;

const StatCard = styled.div`
  text-align: center;
  padding: 20px;
  background: linear-gradient(135deg, ${colors.lightGray}20, ${colors.white});
  border-radius: 0;
  clip-path: ${ClipPath.card};
  border: 2px solid ${colors.lightGray}50;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    border-color: ${colors.cyan};
    box-shadow: 0 10px 25px rgba(0, 188, 212, 0.2);
  }
  
  .icon {
    font-size: 2.5rem;
    background: linear-gradient(135deg, ${colors.cyan}, ${colors.lime});
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 10px;
  }
  
  .number {
    font-size: 2.2rem;
    font-weight: 700;
    background: linear-gradient(135deg, ${colors.magenta}, ${colors.cyan});
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

const NotesList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 30px;
  animation: scaleIn 0.8s ease-out;
  
  @keyframes scaleIn {
    ${animations.scaleIn}
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

const NoteCard = styled.div`
  background: ${colors.white};
  cursor: pointer;
  transition: all 0.4s ease;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
  clip-path: ${ClipPath.rectangle};
  padding: 0;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 5px;
    background: linear-gradient(90deg, ${colors.cyan}, ${colors.lime});
    transform: scaleX(0);
    transition: transform 0.4s ease;
    z-index: 3;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: -100%;
    left: -100%;
    width: 300%;
    height: 300%;
    background: radial-gradient(circle, ${colors.cyan}05, transparent);
    transition: all 0.6s ease;
    z-index: 1;
  }
  
  &:hover {
    transform: translateY(-10px) rotate(1deg);
    box-shadow: 0 20px 40px rgba(0,0,0,0.15);
    
    &::before {
      transform: scaleX(1);
    }
    
    &::after {
      top: -50%;
      left: -50%;
    }
    
    .card-content {
      transform: translateY(-2px);
    }
    
    .shared-badge {
      transform: scale(1.05);
    }
    
    .actions {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const CardContent = styled.div`
  padding: 30px;
  position: relative;
  z-index: 2;
  transition: transform 0.3s ease;
`;

const SharedBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, ${colors.cyan}, ${colors.lime});
  color: white;
  padding: 8px 16px;
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 20px;
  clip-path: ${ClipPath.card};
  box-shadow: 0 4px 12px rgba(0, 188, 212, 0.3);
  transition: transform 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  svg {
    font-size: 11px;
    animation: pulse 2s ease-in-out infinite;
  }
  
  @keyframes pulse {
    ${animations.pulse}
  }
`;

const SharerInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding: 15px;
  background: linear-gradient(135deg, ${colors.lightGray}30, ${colors.white});
  border-radius: 0;
  clip-path: ${ClipPath.card};
  border-left: 4px solid ${colors.magenta};
`;

const SharerAvatar = styled.div`
  width: 45px;
  height: 45px;
  background: linear-gradient(135deg, ${colors.magenta}, ${colors.cyan});
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 18px;
  clip-path: ${ClipPath.card};
  box-shadow: 0 4px 12px rgba(233, 30, 99, 0.3);
`;

const SharerDetails = styled.div`
  flex: 1;
  
  .name {
    font-weight: 600;
    color: ${colors.darkGray};
    margin-bottom: 2px;
    font-size: 15px;
  }
  
  .role {
    font-size: 12px;
    color: ${colors.darkGray};
    opacity: 0.7;
    display: flex;
    align-items: center;
    gap: 4px;
    
    svg {
      font-size: 10px;
      color: ${colors.magenta};
    }
  }
`;

const NoteTitle = styled.h3`
  font-size: 1.4rem;
  font-weight: 700;
  margin: 0 0 15px;
  color: ${colors.darkGray};
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  background: linear-gradient(135deg, ${colors.darkGray}, ${colors.magenta});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const NoteContent = styled.div`
  font-size: 14px;
  color: ${colors.darkGray};
  opacity: 0.8;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 25px;
  background: #F8F9FA;
  padding: 15px;
  border-radius: 0;
  clip-path: ${ClipPath.card};
  border-left: 3px solid ${colors.cyan}30;
`;

const NoteFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 20px;
  border-top: 2px solid ${colors.lightGray};
  font-size: 12px;
  color: ${colors.darkGray};
  opacity: 0.8;
`;

const NoteType = styled.div`
  display: flex;
  align-items: center;
  background: ${({ $isVoice }) => 
    $isVoice ? `${colors.cyan}20` : `${colors.magenta}20`};
  color: ${({ $isVoice }) => 
    $isVoice ? colors.cyan : colors.magenta};
  padding: 8px 14px;
  font-size: 11px;
  font-weight: 700;
  clip-path: ${ClipPath.card};
  border: 1px solid ${({ $isVoice }) => 
    $isVoice ? `${colors.cyan}30` : `${colors.magenta}30`};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  svg {
    margin-right: 6px;
    font-size: 12px;
  }
`;

const DateDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
  
  svg {
    font-size: 11px;
    color: ${colors.lime};
  }
`;

const ActionButtons = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  gap: 8px;
  opacity: 0;
  transform: translateY(-10px);
  transition: all 0.3s ease;
  z-index: 4;
`;

const ActionButton = styled.button`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 0;
  clip-path: ${ClipPath.card};
  background: ${({ variant }) => {
    switch(variant) {
      case 'view': return `linear-gradient(135deg, ${colors.lime}, ${colors.cyan})`;
      case 'like': return `linear-gradient(135deg, ${colors.magenta}, #FF6B6B)`;
      default: return `linear-gradient(135deg, ${colors.cyan}, ${colors.lime})`;
    }
  }};
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  
  &:hover {
    transform: scale(1.1) rotate(5deg);
    box-shadow: 0 8px 20px rgba(0,0,0,0.3);
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 40px;
  text-align: center;
  background: ${colors.white};
  border-radius: 0;
  clip-path: ${ClipPath.rectangle};
  box-shadow: 0 8px 30px rgba(0,0,0,0.12);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, ${colors.cyan}, ${colors.lime});
  }
  
  &::after {
    content: '';
    position: absolute;
    top: -50px;
    right: -50px;
    width: 100px;
    height: 100px;
    background: ${colors.lime};
    opacity: 0.1;
    border-radius: 50%;
    animation: float 4s ease-in-out infinite;
  }
  
  .icon {
    font-size: 5rem;
    background: linear-gradient(135deg, ${colors.cyan}, ${colors.lime});
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 30px;
    position: relative;
    z-index: 2;
  }
  
  .text {
    font-size: 1.5rem;
    color: ${colors.darkGray};
    margin: 0 0 15px;
    font-weight: 600;
    position: relative;
    z-index: 2;
  }
  
  .subtext {
    font-size: 1rem;
    color: ${colors.darkGray};
    opacity: 0.7;
    margin-bottom: 30px;
    line-height: 1.5;
    position: relative;
    z-index: 2;
  }
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
  
  const handleViewNote = (e, noteId) => {
    e.stopPropagation();
    navigate(`/notes/${noteId}`);
  };
  
  const handleLikeNote = (e, noteId) => {
    e.stopPropagation();
    // TODO: 좋아요 기능 구현
    console.log('좋아요:', noteId);
  };
  
  const truncateText = (text, maxLength = 200) => {
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

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };
  
  // 통계 계산
  const totalVoiceNotes = sharedWithMe.filter(note => note.isVoice).length;
  const totalTextNotes = sharedWithMe.filter(note => !note.isVoice).length;
  const uniqueSharers = [...new Set(sharedWithMe.map(note => note.user?.username))].length;
  
  if (loading) {
    return <Spinner fullHeight />;
  }
  
  return (
    <SharedNotesContainer>
      <Header>
        <HeaderContent>
          <TitleSection>
            <h1>
              <FaGift />
              공유받은 노트
            </h1>
            <div className="subtitle">
              동료들이 공유해준 소중한 지식들을 확인해보세요
            </div>
            {sharedWithMe.length > 0 && (
              <div className="stats">
                <div className="stat-item">
                  <FaStickyNote />
                  {sharedWithMe.length}개 노트
                </div>
                <div className="stat-item">
                  <FaUsers />
                  {uniqueSharers}명이 공유
                </div>
                <div className="stat-item">
                  <FaMicrophone />
                  {totalVoiceNotes}개 음성
                </div>
              </div>
            )}
          </TitleSection>
          
          <HeaderActions>
            <BackButton onClick={() => navigate('/notes')} icon={<FaArrowLeft />}>
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
        {sharedWithMe.length > 0 && (
          <StatsSection>
            <StatsGrid>
              <StatCard>
                <div className="icon">
                  <FaStickyNote />
                </div>
                <div className="number">{sharedWithMe.length}</div>
                <div className="label">총 공유받은 노트</div>
              </StatCard>
              <StatCard>
                <div className="icon">
                  <FaUsers />
                </div>
                <div className="number">{uniqueSharers}</div>
                <div className="label">공유한 사람</div>
              </StatCard>
              <StatCard>
                <div className="icon">
                  <FaMicrophone />
                </div>
                <div className="number">{totalVoiceNotes}</div>
                <div className="label">음성 노트</div>
              </StatCard>
              <StatCard>
                <div className="icon">
                  <FaFileAlt />
                </div>
                <div className="number">{totalTextNotes}</div>
                <div className="label">텍스트 노트</div>
              </StatCard>
            </StatsGrid>
          </StatsSection>
        )}
        
        {sharedWithMe.length > 0 ? (
          <NotesList>
            {sharedWithMe.map(note => (
              <NoteCard 
                key={note._id} 
                onClick={() => handleNoteClick(note._id)}
                className="note-card"
              >
                <ActionButtons className="actions">
                  <ActionButton 
                    variant="view"
                    onClick={(e) => handleViewNote(e, note._id)} 
                    title="노트 보기"
                  >
                    <FaEye />
                  </ActionButton>
                  <ActionButton 
                    variant="like"
                    onClick={(e) => handleLikeNote(e, note._id)} 
                    title="좋아요"
                  >
                    <FaHeart />
                  </ActionButton>
                </ActionButtons>
                
                <CardContent className="card-content">
                  <SharedBadge className="shared-badge">
                    <FaGift />
                    공유받음
                  </SharedBadge>
                  
                  <SharerInfo>
                    <SharerAvatar>
                      {getInitials(note.user?.username)}
                    </SharerAvatar>
                    <SharerDetails>
                      <div className="name">{note.user?.username || '사용자'}</div>
                      <div className="role">
                        <FaUser />
                        공유자
                      </div>
                    </SharerDetails>
                  </SharerInfo>
                  
                  <NoteTitle>{note.title}</NoteTitle>
                  <NoteContent>{truncateText(note.content)}</NoteContent>
                  
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
                </CardContent>
              </NoteCard>
            ))}
          </NotesList>
        ) : (
          <EmptyState>
            <div className="icon">
              <FaGift />
            </div>
            <div className="text">
              아직 공유받은 노트가 없습니다
            </div>
            <div className="subtext">
              동료들이 노트를 공유해주면 여기에 표시됩니다.<br />
              팀원들과 지식을 나누며 함께 성장해보세요!
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

export default SharedWithMeNotes;