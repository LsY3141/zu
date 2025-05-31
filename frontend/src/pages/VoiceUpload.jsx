import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { 
  FaMicrophone, 
  FaUpload, 
  FaStop, 
  FaTrash, 
  FaSave,
  FaLanguage,
  FaFileAlt,
  FaCopy,
  FaSyncAlt,
  FaFileAudio,
  FaListAlt,
  FaGlobe
} from 'react-icons/fa';
import { 
  uploadSpeechFile, 
  checkTranscriptionStatus, 
  analyzeTranscription,
  translateTranscription,
  saveTranscriptionAsNote,
  resetSpeechState,
  setFileUploadProgress,
} from '../redux/slices/speechSlice';
import { showNotification } from '../redux/slices/uiSlice';
import Card from '../components/shared/Card';
import Button from '../components/shared/Button';
import Input from '../components/shared/Input';
import TextArea from '../components/shared/TextArea';
import Select from '../components/shared/Select';
import Spinner from '../components/shared/Spinner';
import Alert from '../components/shared/Alert';
import useVoiceRecorder from '../hooks/useVoiceRecorder';
import { secondsToTimeFormat, fileSize } from '../utils/formatters';

const VoiceUploadContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #333333;
`;

const StepsContainer = styled.div`
  display: flex;
  margin-bottom: 20px;
  border-radius: 8px;
  overflow: hidden;
  background-color: #FFFFFF;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
`;

const Step = styled.div`
  flex: 1;
  padding: 15px;
  background-color: ${({ active, completed }) => 
    active 
      ? '#1976D2' 
      : completed 
        ? '#E3F2FD' 
        : '#FFFFFF'};
  color: ${({ active }) => 
    active ? 'white' : '#616161'};
  text-align: center;
  position: relative;
  border-right: 1px solid #E0E0E0;
  
  &:last-child {
    border-right: none;
  }
  
  ${({ active, completed }) => 
    (active || completed) && 
    `
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 3px;
      background-color: ${active ? '#1976D2' : '#BBDEFB'};
    }
  `}
`;

const StepNumber = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: ${({ active, completed }) => 
    active 
      ? 'white' 
      : completed 
        ? '#1976D2' 
        : '#E0E0E0'};
  color: ${({ active, completed }) => 
    active 
      ? '#1976D2'
      : completed 
        ? 'white' 
        : '#9E9E9E'};
  font-size: 14px;
  font-weight: 600;
  margin-right: 8px;
`;

const StepTitle = styled.div`
  display: inline-block;
  font-weight: 500;
`;

const RecordingCard = styled(Card)`
  margin-bottom: 20px;
`;

const RecordingControls = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
`;

const RecordingTime = styled.div`
  font-size: 20px;
  font-weight: 600;
  margin: 0 15px;
  min-width: 70px;
  text-align: center;
`;

const RecordingStatus = styled.div`
  display: flex;
  align-items: center;
  margin-left: auto;
`;

const StatusIndicator = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${({ recording }) => 
    recording ? '#F44336' : '#4CAF50'};
  margin-right: 8px;
  
  ${({ recording }) => recording && `
    animation: pulse 1.5s infinite;
    
    @keyframes pulse {
      0% {
        transform: scale(0.95);
        box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.7);
      }
      
      70% {
        transform: scale(1);
        box-shadow: 0 0 0 10px rgba(244, 67, 54, 0);
      }
      
      100% {
        transform: scale(0.95);
        box-shadow: 0 0 0 0 rgba(244, 67, 54, 0);
      }
    }
  `}
`;

const StatusText = styled.div`
  font-size: 14px;
  color: #757575;
`;

const AudioPreviewContainer = styled.div`
  margin-top: 20px;
`;

const StyledAudio = styled.audio`
  width: 100%;
`;

const DividerOr = styled.div`
  position: relative;
  text-align: center;
  margin: 20px 0;
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    background-color: #E0E0E0;
    z-index: 1;
  }
  
  span {
    position: relative;
    z-index: 2;
    background-color: #F5F7F9;
    padding: 0 15px;
    color: #9E9E9E;
  }
`;

const FileUploadContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px;
  border: 2px dashed #E0E0E0;
  border-radius: 8px;
  background-color: ${({ isDragging }) => 
    isDragging ? '#E3F2FD' : 'transparent'};
  transition: all 0.2s;
  
  &:hover {
    border-color: #1976D2;
  }
`;

const FileUploadIcon = styled.div`
  font-size: 40px;
  color: #1976D2;
  margin-bottom: 15px;
`;

const FileUploadText = styled.div`
  font-size: 16px;
  color: #424242;
  margin-bottom: 10px;
  text-align: center;
`;

const FileUploadSubtext = styled.div`
  font-size: 14px;
  color: #757575;
  margin-bottom: 20px;
  text-align: center;
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const ProgressContainer = styled.div`
  width: 100%;
  margin-top: 20px;
`;

const ProgressBarContainer = styled.div`
  width: 100%;
  height: 10px;
  background-color: #E0E0E0;
  border-radius: 5px;
  overflow: hidden;
  margin-bottom: 10px;
`;

const ProgressBar = styled.div`
  height: 100%;
  background-color: #1976D2;
  width: ${({ progress }) => `${progress}%`};
  transition: width 0.3s;
`;

const ProgressStatus = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #757575;
`;

// 처리 탭 컨테이너
const ProcessingTabsContainer = styled.div`
  margin-bottom: 20px;
`;

const TabsHeader = styled.div`
  display: flex;
  border-bottom: 1px solid #E0E0E0;
  margin-bottom: 20px;
`;

const TabButton = styled.button`
  padding: 10px 20px;
  background: none;
  border: none;
  border-bottom: 3px solid ${({ active }) => active ? '#1976D2' : 'transparent'};
  color: ${({ active }) => active ? '#1976D2' : '#757575'};
  font-weight: ${({ active }) => active ? '600' : '400'};
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
  
  &:hover {
    color: #1976D2;
    background-color: #F5F5F5;
  }
  
  svg {
    margin-right: 8px;
  }
`;

const TabContent = styled.div`
  padding: 20px;
  background-color: #FFFFFF;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
`;

const ProcessingCard = styled(Card)`
  margin-bottom: 20px;
`;

const ProcessingStatus = styled.div`
  display: flex;
  align-items: center;
  font-size: 16px;
  color: #424242;
  margin-bottom: 15px;
  
  svg {
    margin-right: 10px;
    color: #1976D2;
    
    ${({ loading }) => loading && `
      animation: spin 1.5s linear infinite;
      
      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }
    `}
  }
`;

const ProcessingProgress = styled.div`
  margin-top: 10px;
`;

const AnalysisControls = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 15px;
`;

const TranscriptionCard = styled(Card)`
  margin-bottom: 20px;
`;

const TranscriptionContainer = styled.div`
  margin-top: 15px;
`;

const SpeakerText = styled.div`
  margin-bottom: 15px;
  padding-left: 10px;
  border-left: 3px solid ${({ theme, speakerId }) => {
    const colors = ['#1976D2', '#26A69A', '#4CAF50', '#FFC107', '#2196F3'];
    return colors[parseInt(speakerId) % colors.length];
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

const TranslationOptions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 15px;
`;

const LanguageButton = styled.button`
  display: flex;
  align-items: center;
  padding: 8px 16px;
  background-color: ${({ selected }) => selected ? '#E3F2FD' : '#FFFFFF'};
  border: 1px solid ${({ selected }) => selected ? '#1976D2' : '#E0E0E0'};
  border-radius: 20px;
  color: ${({ selected }) => selected ? '#1976D2' : '#616161'};
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: #F5F5F5;
  }
  
  svg {
    margin-right: 8px;
  }
`;

const SaveNoteForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const VoiceUpload = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { 
    currentFile, 
    fileUploadProgress, 
    transcriptionJob,
    transcriptionResults,
    analysisResults,
    translationResults,
    loading, 
    error,
    message
  } = useSelector(state => state.speech);
  
  const {
    isRecording,
    recordingTime,
    audioBlob,
    audioUrl,
    error: recorderError,
    startRecording,
    stopRecording,
    cancelRecording,
    resetRecording,
  } = useVoiceRecorder();
  
  const [activeStep, setActiveStep] = useState(1);
  const [activeTab, setActiveTab] = useState('transcribe');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [noteData, setNoteData] = useState({
    title: '',
    content: '',
    category: '기본',
  });
  const [noteErrors, setNoteErrors] = useState({});
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [statusCheckInterval, setStatusCheckInterval] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  
  const categories = [
    { value: '기본', label: '기본' },
    { value: '학습', label: '학습' },
    { value: '회의', label: '회의' },
    { value: '개인', label: '개인' },
  ];
  
  const languageOptions = [
    { value: 'en', label: '영어', icon: <FaGlobe /> },
    { value: 'ja', label: '일본어', icon: <FaGlobe /> },
    { value: 'zh', label: '중국어', icon: <FaGlobe /> },
    { value: 'es', label: '스페인어', icon: <FaGlobe /> },
    { value: 'fr', label: '프랑스어', icon: <FaGlobe /> },
    { value: 'de', label: '독일어', icon: <FaGlobe /> },
  ];
  
  // 컴포넌트 마운트/언마운트 시 상태 초기화
  useEffect(() => {
    return () => {
      dispatch(resetSpeechState());
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
      }
    };
  }, [dispatch]);
  
  // 트랜스크립션 결과가 있으면 노트 제목과 내용 설정
  useEffect(() => {
    if (transcriptionResults) {
      // 트랜스크립션 텍스트 중 첫 20자를 제목으로 설정
      const titleText = transcriptionResults.text?.substring(0, 20) || '음성 녹음';
      
      setNoteData(prev => ({
        ...prev,
        title: `${titleText}${titleText.length >= 20 ? '...' : ''}`,
        content: transcriptionResults.text || '',
      }));
      
      setActiveStep(3);
    }
  }, [transcriptionResults]);
  
  // 메시지 알림 표시
  useEffect(() => {
    if (message) {
      dispatch(showNotification({
        message,
        type: 'success',
      }));
      
      // 노트 저장 성공 시 노트 상세 페이지로 이동
      if (message.includes('저장되었습니다') && currentFile) {
        navigate(`/notes`);
      }
    }
  }, [message, dispatch, navigate, currentFile]);
  
  // 트랜스크립션 작업 상태를 주기적으로 확인
  useEffect(() => {
    if (transcriptionJob && transcriptionJob.status === 'IN_PROGRESS' && !checkingStatus) {
      setCheckingStatus(true);
      
      const interval = setInterval(() => {
        dispatch(checkTranscriptionStatus(transcriptionJob.id));
      }, 5000); // 5초마다 확인
      
      setStatusCheckInterval(interval);
      
      return () => clearInterval(interval);
    }
    
    if (transcriptionJob && 
        (transcriptionJob.status === 'COMPLETED' || 
         transcriptionJob.status === 'FAILED')) {
      setCheckingStatus(false);
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
        setStatusCheckInterval(null);
      }
    }
  }, [transcriptionJob, checkingStatus, dispatch]);
  
  const validateNoteForm = () => {
    const errors = {};
    
    if (!noteData.title.trim()) {
      errors.title = '제목을 입력해주세요.';
    }
    
    if (!noteData.content.trim()) {
      errors.content = '내용을 입력해주세요.';
    }
    
    setNoteErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleNoteChange = (e) => {
    const { name, value } = e.target;
    setNoteData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // 입력 시 해당 필드의 에러 메시지 초기화
    if (noteErrors[name]) {
      setNoteErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };
  
  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files.length > 0) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };
  
  const handleFileUpload = () => {
    if (selectedFile) {
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      dispatch(uploadSpeechFile(formData))
        .then(() => {
          setActiveStep(2);
        })
        .catch(() => {
          // 오류는 Redux에서 처리
        });
    }
  };
  
  const handleRecordingUpload = () => {
    if (audioBlob) {
      const file = new File([audioBlob], 'recording.wav', { type: 'audio/wav' });
      const formData = new FormData();
      formData.append('file', file);
      
      dispatch(uploadSpeechFile(formData))
        .then(() => {
          setActiveStep(2);
        })
        .catch(() => {
          // 오류는 Redux에서 처리
        });
    }
  };
  
  const handleAnalyzeText = () => {
    if (transcriptionResults) {
      dispatch(analyzeTranscription({
        transcriptionId: transcriptionJob.id,
        options: {
          summary: true,
          keyPhrases: true,
        }
      }));
    }
  };
  
  const handleTranslateText = (targetLanguage) => {
    setSelectedLanguage(targetLanguage);
    if (transcriptionResults) {
      dispatch(translateTranscription({
        transcriptionId: transcriptionJob.id,
        targetLanguage,
      }));
    }
  };
  
  const handleSaveNote = (e) => {
    e.preventDefault();
    
    if (validateNoteForm() && transcriptionJob) {
      dispatch(saveTranscriptionAsNote({
        transcriptionId: transcriptionJob.id,
        noteData: {
          ...noteData,
          tags: analysisResults.keyPhrases || [],
        },
      }));
    }
  };
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'transcribe':
        return (
          <TabContent>
            <ProcessingStatus loading={transcriptionJob?.status === 'IN_PROGRESS'}>
              <FaSyncAlt />
              {transcriptionJob?.status === 'IN_PROGRESS' && '텍스트 변환 진행 중...'}
              {transcriptionJob?.status === 'COMPLETED' && '텍스트 변환이 완료되었습니다.'}
              {transcriptionJob?.status === 'FAILED' && '텍스트 변환이 실패했습니다.'}
            </ProcessingStatus>
            
            {transcriptionJob?.status === 'IN_PROGRESS' && (
              <ProcessingProgress>
                <ProgressBarContainer>
                  <ProgressBar progress={transcriptionJob.progress || 0} />
                </ProgressBarContainer>
                <ProgressStatus>
                  <div>처리 중...</div>
                  <div>{transcriptionJob.progress || 0}%</div>
                </ProgressStatus>
              </ProcessingProgress>
            )}
            
            {transcriptionResults && (
              <TranscriptionContainer>
                {transcriptionResults.speakers && transcriptionResults.speakers.length > 0 ? (
                  transcriptionResults.speakers.map((speaker, index) => (
                    <SpeakerText key={index} speakerId={speaker.id}>
                      <SpeakerLabel>
                        <FaMicrophone /> 화자 {speaker.id}
                      </SpeakerLabel>
                      {speaker.text}
                    </SpeakerText>
                  ))
                ) : (
                  <div>{transcriptionResults.text}</div>
                )}
              </TranscriptionContainer>
            )}
            
            {transcriptionJob?.status === 'FAILED' && (
              <Alert
                variant="error"
                message="음성 변환 중 오류가 발생했습니다. 다른 파일을 시도해보세요."
                marginTop="15px"
              />
            )}
            
            {transcriptionJob?.status === 'COMPLETED' && !transcriptionResults && (
              <Alert
                variant="info"
                message="변환 결과를 불러오는 중입니다..."
                marginTop="15px"
              />
            )}
          </TabContent>
        );
      
      case 'analyze':
        return (
          <TabContent>
            <ProcessingStatus>
              <FaListAlt />
              요약 및 핵심 개념 추출
            </ProcessingStatus>
            
            <Button
              variant="outline"
              onClick={handleAnalyzeText}
              disabled={loading || !transcriptionResults}
              icon={<FaListAlt />}
            >
              {loading ? '분석 중...' : '텍스트 분석하기'}
            </Button>
            
            {analysisResults.summary && (
              <div style={{ marginTop: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '500', marginBottom: '10px' }}>요약</h3>
                <div style={{ 
                  padding: '15px', 
                  backgroundColor: '#F5F7F9', 
                  borderRadius: '8px',
                  marginBottom: '20px'
                }}>
                  {analysisResults.summary}
                </div>
              </div>
            )}
            
            {analysisResults.keyPhrases && analysisResults.keyPhrases.length > 0 && (
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '500', marginBottom: '10px' }}>핵심 개념</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {analysisResults.keyPhrases.map((phrase, index) => (
                    <div 
                      key={index}
                      style={{
                        backgroundColor: '#E3F2FD',
                        color: '#1976D2',
                        padding: '5px 10px',
                        borderRadius: '20px',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <FaFileAlt style={{ marginRight: '5px', fontSize: '12px' }} />
                      {phrase}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {!analysisResults.summary && !analysisResults.keyPhrases?.length && !loading && (
              <div style={{ marginTop: '20px', textAlign: 'center', color: '#757575' }}>
                텍스트 분석을 시작하려면 '텍스트 분석하기' 버튼을 클릭하세요.
              </div>
            )}
            
            {loading && (
              <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <Spinner size="40px" />
                <div style={{ marginTop: '10px', color: '#757575' }}>텍스트 분석 중...</div>
              </div>
            )}
          </TabContent>
        );
      
      case 'translate':
        return (
          <TabContent>
            <ProcessingStatus>
              <FaLanguage />
              다른 언어로 번역하기
            </ProcessingStatus>
            
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '500', marginBottom: '10px' }}>번역할 언어 선택</h3>
              <TranslationOptions>
                {languageOptions.map(option => (
                  <LanguageButton
                    key={option.value}
                    onClick={() => handleTranslateText(option.value)}
                    selected={selectedLanguage === option.value}
                    disabled={loading}
                  >
                    {option.icon} {option.label}
                  </LanguageButton>
                ))}
              </TranslationOptions>
            </div>
            
            {Object.keys(translationResults).map(lang => (
              <div key={lang} style={{ marginTop: '20px' }}>
                <h3 style={{ 
                  fontSize: '16px', 
                  fontWeight: '500', 
                  marginBottom: '10px',
                  display: 'flex',
                  alignItems: 'center' 
                }}>
                  <FaGlobe style={{ marginRight: '8px' }} />
                  {languageOptions.find(opt => opt.value === lang)?.label || lang} 번역 결과
                </h3>
                <div style={{ 
                  padding: '15px', 
                  backgroundColor: '#F5F7F9', 
                  borderRadius: '8px',
                  position: 'relative'
                }}>
                  {translationResults[lang]}
                  <Button
                    variant="text"
                    size="small"
                    style={{ 
                      position: 'absolute', 
                      top: '5px', 
                      right: '5px',
                      padding: '5px',
                      minWidth: 'unset'
                    }}
                    onClick={() => {
                      navigator.clipboard.writeText(translationResults[lang]);
                      dispatch(showNotification({
                        message: '번역 결과가 클립보드에 복사되었습니다.',
                        type: 'success',
                      }));
                    }}
                    icon={<FaCopy />}
                    title="클립보드에 복사"
                  />
                </div>
              </div>
            ))}
            
            {!Object.keys(translationResults).length && !loading && (
              <div style={{ marginTop: '20px', textAlign: 'center', color: '#757575' }}>
                번역할 언어를 선택하세요.
              </div>
            )}
            
            {loading && (
              <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <Spinner size="40px" />
                <div style={{ marginTop: '10px', color: '#757575' }}>번역 중...</div>
              </div>
            )}
          </TabContent>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <VoiceUploadContainer>
      <PageTitle>음성 업로드</PageTitle>
      
      {error && (
        <Alert
          variant="error"
          message={error}
          marginBottom="20px"
        />
      )}
      
      {recorderError && (
        <Alert
          variant="warning"
          message={recorderError}
          marginBottom="20px"
        />
      )}
      
      <StepsContainer>
        <Step active={activeStep === 1} completed={activeStep > 1}>
          <StepNumber active={activeStep === 1} completed={activeStep > 1}>1</StepNumber>
          <StepTitle>녹음 또는 업로드</StepTitle>
        </Step>
        <Step active={activeStep === 2} completed={activeStep > 2}>
          <StepNumber active={activeStep === 2} completed={activeStep > 2}>2</StepNumber>
          <StepTitle>텍스트 처리</StepTitle>
        </Step>
        <Step active={activeStep === 3}>
          <StepNumber active={activeStep === 3}>3</StepNumber>
          <StepTitle>노트 저장</StepTitle>
        </Step>
      </StepsContainer>
      
      {activeStep === 1 && (
        <>
          <RecordingCard title="음성 녹음">
            <RecordingControls>
              {!isRecording && !audioUrl && (
                <Button
                  onClick={startRecording}
                  icon={<FaMicrophone />}
                  disabled={loading}
                >
                  녹음 시작
                </Button>
              )}
              
              {isRecording && (
                <>
                  <Button
                    onClick={stopRecording}
                    variant="outline"
                    icon={<FaStop />}
                  >
                    녹음 중지
                  </Button>
                  <Button
                    onClick={cancelRecording}
                    variant="outline"
                    color="danger"
                    icon={<FaTrash />}
                  >
                    취소
                  </Button>
                </>
              )}
              
              {audioUrl && (
                <>
                  <Button
                    onClick={handleRecordingUpload}
                    icon={<FaUpload />}
                    disabled={loading}
                  >
                    {loading ? '업로드 중...' : '녹음 업로드'}
                  </Button>
                  <Button
                    onClick={resetRecording}
                    variant="outline"
                    color="danger"
                    icon={<FaTrash />}
                    disabled={loading}
                  >
                    녹음 삭제
                  </Button>
                </>
              )}
              
              <RecordingTime>
                {secondsToTimeFormat(recordingTime)}
              </RecordingTime>
              
              <RecordingStatus>
                <StatusIndicator recording={isRecording} />
                <StatusText>
                  {isRecording ? '녹음 중...' : '녹음 대기 중'}
                </StatusText>
              </RecordingStatus>
            </RecordingControls>
            
            {audioUrl && (
              <AudioPreviewContainer>
                <StyledAudio controls>
                  <source src={audioUrl} type="audio/wav" />
                  브라우저가 오디오 재생을 지원하지 않습니다.
                </StyledAudio>
              </AudioPreviewContainer>
            )}
          </RecordingCard>
          
          <DividerOr>
            <span>또는</span>
          </DividerOr>
          
          <RecordingCard title="파일 업로드">
            <FileUploadContainer
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              isDragging={isDragging}
            >
              <FileUploadIcon>
                <FaUpload />
              </FileUploadIcon>
              <FileUploadText>
                음성 파일을 클릭하거나 이곳에 끌어다 놓으세요
              </FileUploadText>
              <FileUploadSubtext>
                지원 형식: .mp3, .wav, .m4a (최대 100MB)
              </FileUploadSubtext>
              <Button
                as="label"
                htmlFor="file-upload"
                variant="outline"
                icon={<FaUpload />}
                disabled={loading}
              >
                파일 선택
              </Button>
              <HiddenFileInput
                id="file-upload"
                type="file"
                accept=".mp3,.wav,.m4a"
                onChange={handleFileChange}
                disabled={loading}
              />
            </FileUploadContainer>
            
            {selectedFile && (
              <div style={{ marginTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div>
                    <strong>선택된 파일:</strong> {selectedFile.name}
                  </div>
                  <div>
                    <strong>크기:</strong> {fileSize(selectedFile.size)}
                  </div>
                </div>
                <Button
                  onClick={handleFileUpload}
                  fullWidth
                  icon={<FaUpload />}
                  disabled={loading}
                >
                  {loading ? '업로드 중...' : '파일 업로드'}
                </Button>
                
                {loading && (
                  <ProgressContainer>
                    <ProgressBarContainer>
                      <ProgressBar progress={fileUploadProgress} />
                    </ProgressBarContainer>
                    <ProgressStatus>
                      <div>업로드 중...</div>
                      <div>{fileUploadProgress}%</div>
                    </ProgressStatus>
                  </ProgressContainer>
                )}
              </div>
            )}
          </RecordingCard>
        </>
      )}
      
      {activeStep === 2 && transcriptionJob && (
        <ProcessingTabsContainer>
          <TabsHeader>
            <TabButton 
              active={activeTab === 'transcribe'} 
              onClick={() => setActiveTab('transcribe')}
            >
              <FaFileAudio /> 텍스트 변환
            </TabButton>
            <TabButton 
              active={activeTab === 'analyze'}
              onClick={() => setActiveTab('analyze')}
              disabled={!transcriptionResults}
            >
              <FaListAlt /> 요약 및 핵심 개념
            </TabButton>
            <TabButton 
              active={activeTab === 'translate'}
              onClick={() => setActiveTab('translate')}
              disabled={!transcriptionResults}
            >
              <FaLanguage /> 번역
            </TabButton>
          </TabsHeader>
          
          {renderTabContent()}
          
          {transcriptionJob.status === 'COMPLETED' && transcriptionResults && (
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <Button
                onClick={() => setActiveStep(3)}
                icon={<FaFileAlt />}
              >
                노트 작성으로 진행
              </Button>
            </div>
          )}
        </ProcessingTabsContainer>
      )}
      
      {activeStep === 3 && transcriptionResults && (
        <Card title="노트 저장">
          <SaveNoteForm onSubmit={handleSaveNote}>
            <Input
              name="title"
              label="제목"
              placeholder="노트 제목을 입력하세요"
              value={noteData.title}
              onChange={handleNoteChange}
              error={noteErrors.title}
              disabled={loading}
              required
            />
            
            <TextArea
              name="content"
              label="내용"
              placeholder="노트 내용을 입력하세요"
              value={noteData.content}
              onChange={handleNoteChange}
              error={noteErrors.content}
              disabled={loading}
              minHeight="200px"
              required
            />
            
            <Select
              name="category"
              label="카테고리"
              value={noteData.category}
              onChange={handleNoteChange}
              options={categories}
              disabled={loading}
            />
            
            {analysisResults.keyPhrases && analysisResults.keyPhrases.length > 0 && (
              <div>
                <label 
                  style={{ 
                    display: 'block', 
                    marginBottom: '6px', 
                    fontSize: '14px', 
                    fontWeight: 500 
                  }}
                >
                  태그
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {analysisResults.keyPhrases.map((phrase, index) => (
                    <div 
                      key={index}
                      style={{
                        backgroundColor: '#E3F2FD',
                        color: '#1976D2',
                        padding: '5px 10px',
                        borderRadius: '20px',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <FaFileAlt style={{ marginRight: '5px', fontSize: '12px' }} />
                      {phrase}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <Button
              type="submit"
              icon={<FaSave />}
              disabled={loading}
            >
              {loading ? '저장 중...' : '노트 저장'}
            </Button>
          </SaveNoteForm>
        </Card>
      )}
    </VoiceUploadContainer>
  );
};

export default VoiceUpload;