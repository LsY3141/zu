import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next'; // 번역 훅 추가
import styled from 'styled-components';
import { Container } from 'react-bootstrap';
import { 
  FaStickyNote, 
  FaMicrophone, 
  FaPen, 
  FaChartLine, 
  FaLock, 
  FaClock,
  FaPlay,
  FaArrowRight
} from 'react-icons/fa';
import { fetchNotes } from '../redux/slices/noteSlice';
import Button from '../components/shared/Button';

// Colors
const colors = {
  magenta: '#E91E63',
  cyan: '#00BCD4', 
  darkGray: '#424242',
  lime: '#8BC34A',
  lightGray: '#E0E0E0',
  white: '#FFFFFF'
};

// Styled Components (기존과 동일)
const HomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, ${colors.lightGray} 0%, ${colors.white} 100%);
  min-height: 100vh;
`;

const HeroSection = styled.div`
  background: linear-gradient(135deg, ${colors.magenta} 0%, ${colors.cyan} 100%);
  color: white;
  padding: 60px 0;
  margin: -20px -20px 40px -20px;
  position: relative;
  overflow: hidden;
  text-align: center;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 200px;
    height: 200px;
    background: ${colors.lime};
    transform: rotate(45deg) translate(50%, -50%);
    opacity: 0.3;
  }
`;

const Section = styled.div`
  margin-bottom: 50px;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30px;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    left: -20px;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 40px;
    background: linear-gradient(to bottom, ${colors.magenta}, ${colors.cyan});
  }
  
  h2 {
    font-size: 1.8rem;
    font-weight: 600;
    margin: 0 0 0 20px;
    color: ${colors.darkGray};
  }
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
`;

const FeatureCard = styled.div`
  background: white;
  padding: 30px;
  position: relative;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 40px rgba(0,0,0,0.15);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => props.color};
  }
`;

const FeatureIcon = styled.div`
  width: 60px;
  height: 60px;
  background: ${props => props.color};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-bottom: 20px;
  clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 100%, 10px 100%);
`;

const NotesGrid = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: flex-start;
`;

const NoteCard = styled.div`
  flex: 1 1 calc(20% - 16px);
  min-width: 240px;
  height: 140px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
  
  &:hover {
    transform: translateY(-4px) rotate(1deg);
    box-shadow: 0 8px 30px rgba(0,0,0,0.12);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: linear-gradient(90deg, ${colors.magenta} 0%, ${colors.cyan} 50%, ${colors.lime} 100%);
  }
`;

const NoteContent = styled.div`
  padding: 20px;
  
  h4 {
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 8px;
    color: ${colors.darkGray};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  p {
    font-size: 0.9rem;
    color: #666;
    line-height: 1.4;
    margin-bottom: 12px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;

const NoteFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 10px;
  border-top: 1px solid ${colors.lightGray};
  font-size: 12px;
  color: #999;
`;

const NoteTags = styled.div`
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  
  span {
    background: ${colors.lightGray};
    color: ${colors.darkGray};
    padding: 2px 6px;
    font-size: 10px;
    clip-path: polygon(0 0, calc(100% - 3px) 0, 100% 100%, 3px 100%);
  }
`;

const NoteMetaRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const NoteType = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  background: ${props => props.isVoice ? colors.cyan : colors.magenta};
  color: white;
  padding: 4px 8px;
  clip-path: polygon(0 0, calc(100% - 6px) 0, 100% 100%, 6px 100%);
  
  svg {
    font-size: 10px;
  }
`;

const EmptyState = styled.div`
  background: white;
  padding: 60px 40px;
  text-align: center;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -50px;
    right: -50px;
    width: 100px;
    height: 100px;
    background: ${colors.magenta};
    opacity: 0.1;
    transform: rotate(45deg);
  }
`;

const CTASection = styled.div`
  background: linear-gradient(135deg, ${colors.darkGray} 0%, ${colors.magenta} 100%);
  color: white;
  padding: 40px;
  margin: 40px -20px -20px -20px;
  text-align: center;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M20 0l20 20-20 20L0 20z'/%3E%3C/g%3E%3C/svg%3E");
    opacity: 0.1;
  }
`;

const GeometricButton = styled(Button)`
  background: linear-gradient(135deg, ${colors.lime} 0%, ${colors.cyan} 100%);
  border: none;
  padding: 12px 24px;
  clip-path: polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.2);
  }
`;

// Main Component
const Home = () => {
  const { t } = useTranslation(); // 번역 함수
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { notes, loading } = useSelector(state => state.notes);
  
  useEffect(() => {
    if (notes.length === 0 && !loading) {
      dispatch(fetchNotes({ 
        page: 1, 
        limit: 5,
        sortBy: 'updatedAt',
        sortOrder: 'desc'
      }));
    }
  }, [dispatch, notes.length, loading]);
  
  const recentNotes = notes.slice(0, 5);
  
  return (
    <HomeContainer>
      <Container fluid>
        {/* Hero Section */}
        <HeroSection>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem' }}>
              {t('home.welcome', { username: user?.username || '사용자' })}
            </h1>
            <p style={{ fontSize: '1.2rem', marginBottom: '2rem', opacity: 0.9 }}>
              {t('home.subtitle')}
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <GeometricButton onClick={() => navigate('/notes/create')} icon={<FaPen />}>
                {t('home.createTextNote')}
              </GeometricButton>
              <GeometricButton 
                onClick={() => navigate('/voice')} 
                icon={<FaMicrophone />}
                style={{ background: `linear-gradient(135deg, ${colors.cyan} 0%, ${colors.lime} 100%)` }}
              >
                {t('home.createVoiceNote')}
              </GeometricButton>
            </div>
          </div>
        </HeroSection>
        
        {/* Features Section */}
        <Section>
          <SectionHeader>
            <h2>{t('home.features.title')}</h2>
          </SectionHeader>
          <FeatureGrid>
            <FeatureCard color={colors.magenta}>
              <FeatureIcon color={colors.magenta}>
                <FaPen />
              </FeatureIcon>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: '12px', color: colors.darkGray }}>
                {t('home.features.smartText.title')}
              </h3>
              <p style={{ color: '#666', lineHeight: 1.6, marginBottom: '20px' }}>
                {t('home.features.smartText.description')}
              </p>
              <Button 
                variant="outline" 
                size="small" 
                onClick={() => navigate('/notes/create')}
                icon={<FaArrowRight />}
              >
                {t('home.buttons.start')}
              </Button>
            </FeatureCard>
            
            <FeatureCard color={colors.cyan}>
              <FeatureIcon color={colors.cyan}>
                <FaMicrophone />
              </FeatureIcon>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: '12px', color: colors.darkGray }}>
                {t('home.features.voiceNote.title')}
              </h3>
              <p style={{ color: '#666', lineHeight: 1.6, marginBottom: '20px' }}>
                {t('home.features.voiceNote.description')}
              </p>
              <Button 
                variant="outline" 
                size="small" 
                onClick={() => navigate('/voice')}
                icon={<FaArrowRight />}
              >
                {t('home.buttons.start')}
              </Button>
            </FeatureCard>
            
            <FeatureCard color={colors.lime}>
              <FeatureIcon color={colors.lime}>
                <FaChartLine />
              </FeatureIcon>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: '12px', color: colors.darkGray }}>
                {t('home.features.analysis.title')}
              </h3>
              <p style={{ color: '#666', lineHeight: 1.6, marginBottom: '20px' }}>
                {t('home.features.analysis.description')}
              </p>
              <Button 
                variant="outline" 
                size="small" 
                onClick={() => navigate('/profile')}
                icon={<FaArrowRight />}
              >
                {t('home.buttons.start')}
              </Button>
            </FeatureCard>
          </FeatureGrid>
        </Section>
        
        {/* Recent Notes Section */}
        <Section>
          <SectionHeader>
            <h2>{t('home.recentNotes.title')}</h2>
            <Button 
              onClick={() => navigate('/notes')}
              size="small"
              style={{ 
                background: `linear-gradient(135deg, ${colors.cyan} 0%, ${colors.lime} 100%)`,
                border: 'none',
                padding: '8px 16px',
                marginLeft: '16px'
              }}
              icon={<FaArrowRight />}
            >
              {t('home.recentNotes.viewAll')}
            </Button>
          </SectionHeader>
          
          {recentNotes.length > 0 ? (
            <NotesGrid>
              {recentNotes.map(note => (
                <NoteCard key={note._id} onClick={() => navigate(`/notes/${note._id}`)}>
                  <NoteContent>
                    <h4>{note.title}</h4>
                    <p>{note.content}</p>
                    <NoteFooter>
                      {note.tags && note.tags.length > 0 && (
                        <NoteTags>
                          {note.tags.slice(0, 3).map((tag, index) => (
                            <span key={index}>{tag}</span>
                          ))}
                          {note.tags.length > 3 && <span>+{note.tags.length - 3}</span>}
                        </NoteTags>
                      )}
                      <NoteMetaRow>
                        <NoteType isVoice={note.isVoice}>
                          {note.isVoice ? <FaMicrophone /> : <FaStickyNote />}
                          {t(`home.noteTypes.${note.isVoice ? 'voice' : 'text'}`)}
                        </NoteType>
                        <span>
                          {new Date(note.updatedAt).toLocaleDateString('ko-KR', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </span>
                      </NoteMetaRow>
                    </NoteFooter>
                  </NoteContent>
                </NoteCard>
              ))}
            </NotesGrid>
          ) : (
            <EmptyState>
              <div style={{ fontSize: '3rem', color: colors.lime, marginBottom: '20px' }}>
                <FaStickyNote />
              </div>
              <h3 style={{ color: colors.darkGray, marginBottom: '16px' }}>
                {t('home.recentNotes.empty.title')}
              </h3>
              <p style={{ color: '#666', marginBottom: '24px' }}>
                {t('home.recentNotes.empty.description')}
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button onClick={() => navigate('/notes/create')} icon={<FaPen />}>
                  {t('home.recentNotes.empty.createText')}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/voice')}
                  icon={<FaMicrophone />}
                >
                  {t('home.recentNotes.empty.createVoice')}
                </Button>
              </div>
            </EmptyState>
          )}
        </Section>
        
        {/* CTA Section */}
        <CTASection>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <h3 style={{ marginBottom: '16px', fontSize: '1.5rem' }}>
              {t('home.cta.title')}
            </h3>
            <p style={{ marginBottom: '24px', opacity: 0.9 }}>
              {t('home.cta.description')}
            </p>
            <Button 
              onClick={() => navigate('/profile')}
              style={{ 
                background: colors.lime,
                border: 'none',
                padding: '12px 32px'
              }}
              icon={<FaArrowRight />}
            >
              X_X
            </Button>
          </div>
        </CTASection>
      </Container>
    </HomeContainer>
  );
};

export default Home;