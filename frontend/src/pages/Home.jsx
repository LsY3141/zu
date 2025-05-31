import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { Container, Row, Col } from 'react-bootstrap';
import { 
  FaStickyNote, 
  FaMicrophone, 
  FaPen, 
  FaChartLine, 
  FaLock, 
  FaClock 
} from 'react-icons/fa';
import { fetchNotes } from '../redux/slices/noteSlice';
import Card from '../components/shared/Card';
import Button from '../components/shared/Button';

// 기존 styled-components 유지
const HomeContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const WelcomeSection = styled.div`
  margin-bottom: 30px;
`;

const WelcomeTitle = styled.h1`
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 10px;
  color: ${({ theme }) => theme.colors.text};
`;

const WelcomeSubtitle = styled.p`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
`;

// Bootstrap Grid만 활용하고 기존 디자인 유지
const FeaturesGrid = styled(Row)`
  margin-bottom: 30px;
`;

const FeatureCard = styled(Card)`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px 20px;
  text-align: center;
  background-color: ${({ bgColor }) => bgColor || '#f8f9fa'};
  height: 100%;
`;

const FeatureIconContainer = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
  font-size: 24px;
  color: white;
  background-color: ${({ color, theme }) => theme.colors[color] || color};
`;

const FeatureTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
  color: ${({ theme }) => theme.colors.text};
`;

const FeatureDescription = styled.p`
  font-size: 14px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 20px;
`;

const FeatureImage = styled.img`
  max-width: 180px;
  height: auto;
  margin-bottom: 20px;
`;

const RecentSection = styled.div`
  margin-bottom: 30px;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 500;
  margin: 0;
  color: ${({ theme }) => theme.colors.text};
`;

const NotesList = styled(Row)`
  // Bootstrap Row 사용
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
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 20px;
`;

const EmptyStateText = styled.p`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0 0 20px;
`;

const NoteCard = styled(Card)`
  cursor: pointer;
  transition: all 0.2s ease;
  height: 140px;
  border-radius: 12px;
  border: 1px solid #e9ecef;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
    border-color: #dee2e6;
  }
`;

const NoteContent = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
  margin-bottom: 12px;
  height: 33px;
`;

const NoteFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  font-size: 10px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const NoteType = styled.div`
  display: flex;
  align-items: center;
  background-color: #f8f9fa;
  padding: 4px 8px;
  border-radius: 12px;
  
  svg {
    margin-right: 4px;
    font-size: 10px;
  }
`;

const NoteDate = styled.div``;

const Home = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { notes, loading } = useSelector(state => state.notes);
  
  // 홈페이지 로드 시 최근 노트 불러오기
  useEffect(() => {
    console.log('홈페이지 마운트됨, 노트 데이터 확인:', {
      noteCount: notes.length,
      loading
    });
    
    // 노트가 없고 로딩 중이 아닐 때만 데이터 요청
    if (notes.length === 0 && !loading) {
      console.log('노트 데이터가 없어서 최근 노트 불러오기 시작');
      dispatch(fetchNotes({ 
        page: 1, 
        limit: 6,  // 홈페이지용으로 6개만
        sortBy: 'updatedAt',
        sortOrder: 'desc'
      }));
    }
  }, [dispatch, notes.length, loading]);
  
  // 디버깅 로그 추가
  useEffect(() => {
    console.log('홈 페이지 노트 데이터 변경:', {
      noteCount: notes.length,
      sampleNote: notes.length > 0 ? notes[0] : null,
      loading
    });
  }, [notes, loading]);
  
  const handleCreateNote = () => {
    navigate('/notes/create');
  };
  
  const handleCreateVoiceNote = () => {
    navigate('/voice');
  };
  
  const handleNoteClick = (noteId) => {
    console.log('노트 클릭 - ID:', noteId);
    navigate(`/notes/${noteId}`);
  };
  
  const recentNotes = notes.slice(0, 6);
  
  return (
    <HomeContainer>
      {/* Bootstrap Container만 사용, 기존 스타일 유지 */}
      <Container fluid>
        <WelcomeSection>
          <WelcomeTitle>안녕하세요, {user?.username || '사용자'}님!</WelcomeTitle>
          <WelcomeSubtitle>AI 학습 지원 서비스에 오신 것을 환영합니다.</WelcomeSubtitle>
        </WelcomeSection>
        
        {/* Bootstrap Grid + 기존 디자인 - 모든 화면에서 강제 가로 배치 */}
        <FeaturesGrid className="g-4" style={{ display: 'flex', flexWrap: 'nowrap', overflowX: 'auto', gap: '20px' }}>
          <Col style={{ minWidth: '300px', flex: '1' }}>
            <FeatureCard bgColor="#e9f1fd">
              <FeatureImage src="/api/placeholder/120/80" alt="비즈니스 클라우드 노트" />
              <FeatureTitle>비즈니스용 클라우드노트를 사용해 보세요</FeatureTitle>
              <FeatureDescription>
                어디서나 접근 가능한 클라우드 기반 노트로 중요한 정보를 안전하게 저장하고 관리하세요.
              </FeatureDescription>
              <Button 
                onClick={() => navigate('/notes/create')}
                icon={<FaPen />}
                size="small"
              >
                노트 작성하기
              </Button>
            </FeatureCard>
          </Col>
          
          <Col style={{ minWidth: '300px', flex: '1' }}>
            <FeatureCard bgColor="#edf1f5">
              <FeatureImage src="/api/placeholder/120/80" alt="비즈니스 가입" />
              <FeatureTitle>비즈니스용 가입하고 3개월 무료 체험하세요</FeatureTitle>
              <FeatureDescription>
                프리미엄 기능을 3개월 동안 무료로 체험할 수 있는 특별 혜택을 놓치지 마세요.
              </FeatureDescription>
              <Button 
                onClick={() => navigate('/profile')}
                icon={<FaClock />}
                size="small"
              >
                무료 체험 시작하기
              </Button>
            </FeatureCard>
          </Col>
          
          <Col style={{ minWidth: '300px', flex: '1' }}>
            <FeatureCard bgColor="#f9f3dd">
              <FeatureImage src="/api/placeholder/120/80" alt="보안 기능" />
              <FeatureTitle>기업을 위한 보안 및 관리 기능을 확인하세요</FeatureTitle>
              <FeatureDescription>
                민감한 비즈니스 정보를 안전하게 보호하는 고급 보안 기능과 효율적인 관리 도구를 제공합니다.
              </FeatureDescription>
              <Button 
                onClick={() => navigate('/profile')}
                icon={<FaLock />}
                size="small"
              >
                보안 기능 알아보기
              </Button>
            </FeatureCard>
          </Col>
        </FeaturesGrid>
        
        <RecentSection>
          <SectionHeader>
            <SectionTitle>최근 노트</SectionTitle>
            <Button 
              variant="outline" 
              size="small" 
              onClick={() => navigate('/notes')}
            >
              모두 보기
            </Button>
          </SectionHeader>
          
          {recentNotes.length > 0 ? (
            <div style={{ 
              display: 'flex', 
              overflowX: 'auto', 
              gap: '16px', 
              paddingBottom: '10px',
              scrollbarWidth: 'thin'
            }}>
              {recentNotes.map(note => (
                <div
                  key={note._id}
                  style={{
                    minWidth: '280px',
                    maxWidth: '280px',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleNoteClick(note._id)}
                >
                  <NoteCard hover>
                    <div style={{ padding: '16px' }}>
                      <div style={{ 
                        fontSize: '14px', 
                        fontWeight: '600', 
                        marginBottom: '8px',
                        color: '#333',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {note.title}
                      </div>
                      <NoteContent>{note.content}</NoteContent>
                      <NoteFooter>
                        <NoteType>
                          {note.isVoice ? <FaMicrophone /> : <FaStickyNote />}
                          {note.isVoice ? '음성' : '텍스트'}
                        </NoteType>
                        <NoteDate>
                          {new Date(note.updatedAt).toLocaleDateString('ko-KR', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </NoteDate>
                      </NoteFooter>
                    </div>
                  </NoteCard>
                </div>
              ))}
            </div>
          ) : (
            <Row>
              <Col>
                <EmptyState>
                  <EmptyStateIcon>
                    <FaStickyNote />
                  </EmptyStateIcon>
                  <EmptyStateText>
                    아직 작성된 노트가 없습니다. 새 노트를 만들어보세요!
                  </EmptyStateText>
                  <Button 
                    onClick={handleCreateNote}
                    icon={<FaStickyNote />}
                  >
                    새 노트 작성하기
                  </Button>
                  <Button 
                    variant="outline" 
                    style={{ marginTop: '10px' }}
                    onClick={handleCreateVoiceNote}
                    icon={<FaMicrophone />}
                  >
                    음성 노트 녹음하기
                  </Button>
                </EmptyState>
              </Col>
            </Row>
          )}
        </RecentSection>
      </Container>
    </HomeContainer>
  );
};

export default Home;