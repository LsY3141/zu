import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next'; // 번역 훅 추가
import styled from 'styled-components';
import { 
  FaTrashRestore, 
  FaTrashAlt, 
  FaExclamationTriangle, 
  FaStickyNote, 
  FaMicrophone,
  FaClock,
  FaCalendarDay,
  FaUndo,
  FaTimes,
  FaRecycle,
  FaArrowLeft,
  FaHistory,
  FaShieldAlt
} from 'react-icons/fa';
import { fetchNotes, restoreNote, deleteNote } from '../redux/slices/noteSlice';
import Button from '../components/shared/Button';
import Spinner from '../components/shared/Spinner';
import Alert from '../components/shared/Alert';
import { formatRelativeTime } from '../utils/formatters';
import { openConfirmDialog } from '../redux/slices/uiSlice';

// Colors - 메인페이지와 동일한 컬러 팔레트
const colors = {
  magenta: '#E91E63',
  cyan: '#00BCD4', 
  darkGray: '#424242',
  lime: '#8BC34A',
  lightGray: '#E0E0E0',
  white: '#FFFFFF',
  orange: '#FF9800',
  red: '#F44336'
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
  wiggle: `
    0%, 100% { transform: rotate(0deg); }
    25% { transform: rotate(-2deg); }
    75% { transform: rotate(2deg); }
  `,
  bounce: `
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  `,
  glow: `
    0%, 100% { box-shadow: 0 0 20px rgba(255, 152, 0, 0.3); }
    50% { box-shadow: 0 0 30px rgba(255, 152, 0, 0.6); }
  `
};

// Common styled component patterns
const ClipPath = {
  rectangle: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 12px 100%)',
  button: 'polygon(0 0, calc(100% - 8px) 0, 100% 100%, 8px 100%)',
  card: 'polygon(0 0, calc(100% - 6px) 0, 100% 100%, 6px 100%)'
};

const TrashContainer = styled.div`
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
    background: ${colors.orange};
    opacity: 0.1;
    border-radius: 50%;
    animation: bounce 8s ease-in-out infinite;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -50px;
    left: -50px;
    width: 150px;
    height: 150px;
    background: ${colors.red};
    opacity: 0.15;
    transform: rotate(45deg);
    animation: wiggle 6s ease-in-out infinite;
  }
  
  @keyframes fadeIn {
    ${animations.fadeIn}
  }
  
  @keyframes bounce {
    ${animations.bounce}
  }
  
  @keyframes wiggle {
    ${animations.wiggle}
  }
`;

const Header = styled.div`
  background: linear-gradient(135deg, ${colors.red} 0%, ${colors.orange} 100%);
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
      color: ${colors.white};
      font-size: 2.2rem;
      filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
      animation: wiggle 3s ease-in-out infinite;
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
    margin-bottom: 15px;
    
    @media (max-width: 768px) {
      font-size: 1rem;
    }
  }
  
  .warning {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    background: rgba(255,255,255,0.15);
    padding: 12px 20px;
    border-radius: 25px;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255,255,255,0.2);
    animation: glow 3s ease-in-out infinite;
    
    svg {
      color: ${colors.white};
      font-size: 16px;
      animation: none;
    }
    
    @media (max-width: 768px) {
      font-size: 12px;
      padding: 10px 16px;
    }
  }
  
  @keyframes glow {
    ${animations.glow}
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
  background: linear-gradient(135deg, ${colors.white} 0%, ${colors.lightGray} 100%) !important;
  border: 2px solid rgba(255,255,255,0.3) !important;
  color: ${colors.darkGray} !important;
  clip-path: ${ClipPath.button};
  font-weight: 600 !important;
  box-shadow: 0 6px 20px rgba(0,0,0,0.2) !important;
  transition: all 0.3s ease !important;
  backdrop-filter: blur(10px);
  
  &:hover:not(:disabled) {
    background: linear-gradient(135deg, ${colors.lime} 0%, ${colors.cyan} 100%) !important;
    color: white !important;
    transform: translateY(-3px) !important;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3) !important;
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
    background: linear-gradient(90deg, ${colors.red}, ${colors.orange});
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
    border-color: ${colors.orange};
    box-shadow: 0 10px 25px rgba(255, 152, 0, 0.2);
  }
  
  .icon {
    font-size: 2.5rem;
    background: linear-gradient(135deg, ${colors.red}, ${colors.orange});
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 10px;
  }
  
  .number {
    font-size: 2.2rem;
    font-weight: 700;
    background: linear-gradient(135deg, ${colors.red}, ${colors.orange});
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
  border: 2px solid ${colors.lightGray}30;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 5px;
    background: linear-gradient(90deg, ${colors.red}, ${colors.orange});
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
    background: radial-gradient(circle, ${colors.red}05, transparent);
    transition: all 0.6s ease;
    z-index: 1;
  }
  
  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 40px rgba(244, 67, 54, 0.15);
    border-color: ${colors.red}50;
    
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
    
    .deleted-badge {
      animation: wiggle 1s ease-in-out;
    }
    
    .actions {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes wiggle {
    ${animations.wiggle}
  }
`;

const CardContent = styled.div`
  padding: 30px;
  position: relative;
  z-index: 2;
  transition: transform 0.3s ease;
`;

const DeletedBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, ${colors.red}, ${colors.orange});
  color: white;
  padding: 8px 16px;
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 20px;
  clip-path: ${ClipPath.card};
  box-shadow: 0 4px 12px rgba(244, 67, 54, 0.4);
  transition: transform 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  svg {
    font-size: 11px;
    animation: wiggle 2s ease-in-out infinite;
  }
  
  @keyframes wiggle {
    ${animations.wiggle}
  }
`;

const TimeInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
  padding: 15px;
  background: linear-gradient(135deg, ${colors.lightGray}30, ${colors.white});
  border-radius: 0;
  clip-path: ${ClipPath.card};
  border-left: 4px solid ${colors.orange};
`;

const TimeItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  
  &.deleted-time {
    color: ${colors.red};
    font-weight: 600;
    
    svg {
      color: ${colors.red};
    }
  }
  
  &.original-time {
    color: ${colors.darkGray};
    opacity: 0.7;
    
    svg {
      color: ${colors.darkGray};
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
  background: linear-gradient(135deg, ${colors.darkGray}, ${colors.red});
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
  border-left: 3px solid ${colors.orange}30;
`;

const NoteFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-top: 15px;
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

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 20px;
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.3s ease;
`;

const ActionButton = styled(Button)`
  flex: 1;
  clip-path: ${ClipPath.button};
  font-weight: 600 !important;
  transition: all 0.3s ease !important;
  
  &.restore-btn {
    background: linear-gradient(135deg, ${colors.lime} 0%, ${colors.cyan} 100%) !important;
    border: none !important;
    color: white !important;
    box-shadow: 0 4px 15px rgba(139, 195, 74, 0.3) !important;
    
    &:hover:not(:disabled) {
      background: linear-gradient(135deg, ${colors.cyan} 0%, ${colors.lime} 100%) !important;
      transform: translateY(-2px) !important;
      box-shadow: 0 8px 25px rgba(0, 188, 212, 0.4) !important;
    }
  }
  
  &.delete-btn {
    background: linear-gradient(135deg, ${colors.red} 0%, ${colors.orange} 100%) !important;
    border: none !important;
    color: white !important;
    box-shadow: 0 4px 15px rgba(244, 67, 54, 0.3) !important;
    
    &:hover:not(:disabled) {
      background: linear-gradient(135deg, ${colors.orange} 0%, ${colors.red} 100%) !important;
      transform: translateY(-2px) !important;
      box-shadow: 0 8px 25px rgba(255, 152, 0, 0.4) !important;
    }
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
    background: linear-gradient(90deg, ${colors.lime}, ${colors.cyan});
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
    animation: bounce 4s ease-in-out infinite;
  }
  
  .icon {
    font-size: 5rem;
    background: linear-gradient(135deg, ${colors.lime}, ${colors.cyan});
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 30px;
    position: relative;
    z-index: 2;
    animation: bounce 3s ease-in-out infinite;
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
  
  @keyframes bounce {
    ${animations.bounce}
  }
`;

const Trash = () => {
  const { t } = useTranslation(); // 번역 함수
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Redux 상태 직접 사용
  const { trash, loading, error } = useSelector(state => state.notes);
  
  // 컴포넌트 마운트 시 휴지통 노트들 가져오기
  useEffect(() => {
    console.log('Trash 컴포넌트 마운트됨 - 삭제된 노트 조회 시작');
    dispatch(fetchNotes({ 
      isDeleted: true,  // 삭제된 노트만 가져오기
      page: 1,
      limit: 100
    }));
  }, [dispatch]);

  // 휴지통에서 사용할 노트 데이터
  const notes = trash || [];
  
  console.log('휴지통 렌더링:', {
    notesLength: notes.length,
    loading,
    error
  });
  
  const handleNoteRestore = (noteId, title) => {
    console.log('복원 버튼 클릭:', { noteId, title });
    
    const confirmAction = () => {
      console.log('노트 복원 확인됨:', noteId);
      dispatch(restoreNote(noteId))
        .unwrap()
        .then(() => {
          console.log('노트 복원 성공:', noteId);
          // 복원 후 휴지통 목록 새로고침
          dispatch(fetchNotes({ 
            isDeleted: true,
            page: 1,
            limit: 100
          }));
        })
        .catch((error) => {
          console.error('노트 복원 실패:', error);
        });
    };
    
    dispatch(openConfirmDialog({
      title: t('trash.confirmRestore.title'),
      message: t('trash.confirmRestore.message'),
      confirmText: t('trash.confirmRestore.confirm'),
      cancelText: t('trash.confirmRestore.cancel'),
      onConfirm: confirmAction,
    }));
  };
  
  const handleNoteDelete = (noteId, title) => {
    console.log('영구 삭제 버튼 클릭:', { noteId, title });
    
    const confirmAction = () => {
      console.log('노트 영구 삭제 확인됨:', noteId);
      dispatch(deleteNote(noteId))
        .unwrap()
        .then(() => {
          console.log('노트 영구 삭제 성공:', noteId);
          // 삭제 후 휴지통 목록 새로고침
          dispatch(fetchNotes({ 
            isDeleted: true,
            page: 1,
            limit: 100
          }));
        })
        .catch((error) => {
          console.error('노트 영구 삭제 실패:', error);
        });
    };
    
    dispatch(openConfirmDialog({
      title: t('trash.confirmDelete.title'),
      message: t('trash.confirmDelete.message'),
      confirmText: t('trash.confirmDelete.confirm'),
      cancelText: t('trash.confirmDelete.cancel'),
      onConfirm: confirmAction,
      danger: true
    }));
  };
  
  if (loading) {
    return <Spinner fullHeight />;
  }
  
  const truncateText = (text, maxLength = 200) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };
  
  const formatDate = (date) => {
    if (!date) return t('common.time.unknown', { defaultValue: '알 수 없음' });
    try {
      return formatRelativeTime(date);
    } catch (error) {
      console.error('날짜 포맷팅 오류:', error);
      return t('common.error', { defaultValue: '날짜 오류' });
    }
  };
  
  // 통계 계산
  const totalVoiceNotes = notes.filter(note => note.isVoice).length;
  const totalTextNotes = notes.filter(note => !note.isVoice).length;
  const recentlyDeleted = notes.filter(note => {
    if (!note.deletedAt) return false;
    const deletedDate = new Date(note.deletedAt);
    const now = new Date();
    const diffHours = (now - deletedDate) / (1000 * 60 * 60);
    return diffHours <= 24;
  }).length;
  
  return (
    <TrashContainer>
      <Header>
        <HeaderContent>
          <TitleSection>
            <h1>
              <FaTrashAlt />
              {t('trash.title')}
            </h1>
            <div className="subtitle">
              {t('trash.subtitle')}
            </div>
            <div className="warning">
              <FaShieldAlt />
              {t('trash.warning')}
            </div>
          </TitleSection>
          
          <HeaderActions>
            <BackButton onClick={() => navigate('/notes')} icon={<FaArrowLeft />}>
              {t('trash.actions.back')}
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
        {notes.length > 0 && (
          <StatsSection>
            <StatsGrid>
              <StatCard>
                <div className="icon">
                  <FaTrashAlt />
                </div>
                <div className="number">{notes.length}</div>
                <div className="label">{t('trash.stats.deletedNotes')}</div>
              </StatCard>
              <StatCard>
                <div className="icon">
                  <FaHistory />
                </div>
                <div className="number">{recentlyDeleted}</div>
                <div className="label">{t('trash.stats.recent24h')}</div>
              </StatCard>
              <StatCard>
                <div className="icon">
                  <FaMicrophone />
                </div>
                <div className="number">{totalVoiceNotes}</div>
                <div className="label">{t('trash.stats.voiceNotes')}</div>
              </StatCard>
              <StatCard>
                <div className="icon">
                  <FaStickyNote />
                </div>
                <div className="number">{totalTextNotes}</div>
                <div className="label">{t('trash.stats.textNotes')}</div>
              </StatCard>
            </StatsGrid>
          </StatsSection>
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
                <NoteCard key={note._id} className="note-card">
                  <CardContent className="card-content">
                    <DeletedBadge className="deleted-badge">
                      <FaTrashAlt />
                      {t('trash.deleted')}
                    </DeletedBadge>
                    
                    <TimeInfo>
                      <TimeItem className="deleted-time">
                        <FaTrashAlt />
                        <span>{t('trash.deletedAt', { 
                          time: note.deletedAt ? formatDate(note.deletedAt) : t('common.time.unknown', { defaultValue: '알 수 없음' })
                        })}</span>
                      </TimeItem>
                      <TimeItem className="original-time">
                        <FaCalendarDay />
                        <span>{t('trash.originalTime', { 
                          time: note.updatedAt ? formatDate(note.updatedAt) : t('common.time.unknown', { defaultValue: '알 수 없음' })
                        })}</span>
                      </TimeItem>
                    </TimeInfo>
                    
                    <NoteTitle>{note.title}</NoteTitle>
                    <NoteContent>{truncateText(note.content)}</NoteContent>
                    
                    <NoteFooter>
                      <NoteType $isVoice={note.isVoice}>
                        {note.isVoice ? <FaMicrophone /> : <FaStickyNote />}
                        {t(`notes.types.${note.isVoice ? 'voice' : 'text'}`)}
                      </NoteType>
                    </NoteFooter>
                    
                    <ActionButtons className="actions">
                      <ActionButton
                        className="restore-btn"
                        onClick={() => handleNoteRestore(note._id, note.title)}
                        icon={<FaUndo />}
                      >
                        {t('trash.actions.restore')}
                      </ActionButton>
                      <ActionButton
                        className="delete-btn"
                        onClick={() => handleNoteDelete(note._id, note.title)}
                        icon={<FaTimes />}
                      >
                        {t('trash.actions.permanentDelete')}
                      </ActionButton>
                    </ActionButtons>
                  </CardContent>
                </NoteCard>
              );
            })}
          </NotesList>
        ) : (
          <EmptyState>
            <div className="icon">
              <FaRecycle />
            </div>
            <div className="text">
              {t('trash.empty.title')}
            </div>
            <div className="subtext">
              {t('trash.empty.description')}
            </div>
            <BackButton onClick={() => navigate('/notes')} icon={<FaStickyNote />}>
              {t('trash.actions.back')}
            </BackButton>
          </EmptyState>
        )}
      </ContentArea>
    </TrashContainer>
  );
};

export default Trash;