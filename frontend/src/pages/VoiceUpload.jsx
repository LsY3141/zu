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
  FaGlobe,
  FaPlay,
  FaPause,
  FaCheck,
  FaArrowRight
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
import Button from '../components/shared/Button';
import Input from '../components/shared/Input';
import TextArea from '../components/shared/TextArea';
import Select from '../components/shared/Select';
import Spinner from '../components/shared/Spinner';
import Alert from '../components/shared/Alert';
import useVoiceRecorder from '../hooks/useVoiceRecorder';
import { secondsToTimeFormat, fileSize } from '../utils/formatters';

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
  pulse: `
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.05); opacity: 0.8; }
  `,
  wave: `
    0%, 100% { transform: scaleY(1); }
    50% { transform: scaleY(1.5); }
  `
};

// Common styled component patterns
const ClipPath = {
  rectangle: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 12px 100%)',
  button: 'polygon(0 0, calc(100% - 8px) 0, 100% 100%, 8px 100%)',
  card: 'polygon(0 0, calc(100% - 6px) 0, 100% 100%, 6px 100%)'
};

const VoiceUploadContainer = styled.div`
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
    background: ${colors.lime};
    opacity: 0.1;
    border-radius: 50%;
    animation: pulse 4s ease-in-out infinite;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -50px;
    left: -50px;
    width: 150px;
    height: 150px;
    background: ${colors.cyan};
    opacity: 0.15;
    transform: rotate(45deg);
    animation: pulse 3s ease-in-out infinite reverse;
  }
  
  @keyframes fadeIn {
    ${animations.fadeIn}
  }
  
  @keyframes pulse {
    ${animations.pulse}
  }
`;

const Header = styled.div`
  background: linear-gradient(135deg, ${colors.darkGray} 0%, ${colors.magenta} 100%);
  color: white;
  padding: 60px 40px;
  position: relative;
  overflow: hidden;
  text-align: center;
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
  
  h1 {
    font-size: 2.5rem;
    font-weight: 700;
    margin: 0 0 1rem;
    position: relative;
    z-index: 2;
    
    @media (max-width: 768px) {
      font-size: 2rem;
    }
  }
  
  .subtitle {
    font-size: 1.2rem;
    opacity: 0.9;
    position: relative;
    z-index: 2;
    
    @media (max-width: 768px) {
      font-size: 1rem;
    }
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

const StepsContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 60px;
  
  @media (max-width: 768px) {
    margin-bottom: 40px;
  }
`;

const StepIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const Step = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  
  &:not(:last-child)::after {
    content: '';
    position: absolute;
    top: 25px;
    left: 100%;
    width: 40px;
    height: 3px;
    background: ${({ completed }) => 
      completed ? `linear-gradient(90deg, ${colors.magenta}, ${colors.cyan})` : colors.lightGray};
    z-index: 1;
    
    @media (max-width: 768px) {
      width: 20px;
    }
  }
`;

const StepNumber = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: ${({ active, completed }) => {
    if (completed) return `linear-gradient(135deg, ${colors.lime}, ${colors.cyan})`;
    if (active) return `linear-gradient(135deg, ${colors.magenta}, ${colors.cyan})`;
    return colors.lightGray;
  }};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 18px;
  margin-bottom: 10px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
  transition: all 0.3s ease;
  position: relative;
  z-index: 2;
  
  ${({ active }) => active && `
    animation: pulse 2s ease-in-out infinite;
  `}
  
  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
    font-size: 14px;
  }
`;

const StepTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${colors.darkGray};
  text-align: center;
  max-width: 100px;
  
  @media (max-width: 768px) {
    font-size: 12px;
    max-width: 80px;
  }
`;

const SectionCard = styled.div`
  background: ${colors.white};
  padding: 40px;
  margin-bottom: 30px;
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
    background: linear-gradient(90deg, ${colors.magenta}, ${colors.cyan}, ${colors.lime});
  }
  
  @keyframes scaleIn {
    ${animations.scaleIn}
  }
  
  @media (max-width: 768px) {
    padding: 30px 20px;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 20px;
  background: linear-gradient(135deg, ${colors.darkGray}, ${colors.magenta});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: flex;
  align-items: center;
  gap: 12px;
  
  svg {
    color: ${colors.cyan};
    font-size: 1.6rem;
  }
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
    
    svg {
      font-size: 1.3rem;
    }
  }
`;

const RecordingSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
`;

const RecordingVisualization = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  height: 60px;
  margin: 20px 0;
`;

const WaveBar = styled.div`
  width: 4px;
  height: ${({ height }) => height || 20}px;
  background: linear-gradient(180deg, ${colors.magenta}, ${colors.cyan});
  border-radius: 2px;
  animation: ${({ animate }) => animate ? 'wave 0.8s ease-in-out infinite' : 'none'};
  animation-delay: ${({ delay }) => delay || '0s'};
  
  @keyframes wave {
    ${animations.wave}
  }
`;

const RecordingControls = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
  justify-content: center;
`;

const RecordButton = styled.button`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: none;
  background: ${({ recording }) => 
    recording 
      ? `linear-gradient(135deg, ${colors.magenta}, #FF6B6B)` 
      : `linear-gradient(135deg, ${colors.cyan}, ${colors.lime})`};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 25px rgba(0,0,0,0.2);
  position: relative;
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 12px 35px rgba(0,0,0,0.3);
  }
  
  ${({ recording }) => recording && `
    animation: pulse 1.5s ease-in-out infinite;
    
    &::after {
      content: '';
      position: absolute;
      top: -10px;
      left: -10px;
      right: -10px;
      bottom: -10px;
      border: 3px solid ${colors.magenta};
      border-radius: 50%;
      opacity: 0.6;
      animation: pulse 1.5s ease-in-out infinite;
    }
  `}
`;

const RecordingTime = styled.div`
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(135deg, ${colors.darkGray}, ${colors.magenta});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  min-width: 120px;
  text-align: center;
`;

const ActionButton = styled(Button)`
  background: linear-gradient(135deg, ${({ variant }) => {
    switch(variant) {
      case 'danger': return `${colors.magenta}, #FF6B6B`;
      case 'success': return `${colors.lime}, ${colors.cyan}`;
      default: return `${colors.cyan}, ${colors.lime}`;
    }
  }}) !important;
  border: none !important;
  clip-path: ${ClipPath.button};
  font-weight: 600 !important;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2) !important;
  transition: all 0.3s ease !important;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px) !important;
    box-shadow: 0 8px 25px rgba(0,0,0,0.3) !important;
  }
`;

const AudioPlayer = styled.div`
  width: 100%;
  max-width: 500px;
  margin: 30px auto;
  padding: 25px;
  background: linear-gradient(135deg, ${colors.lightGray}30, ${colors.white});
  border-radius: 0;
  clip-path: ${ClipPath.card};
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  
  audio {
    width: 100%;
    height: 50px;
    
    &::-webkit-media-controls-panel {
      background: linear-gradient(135deg, ${colors.cyan}20, ${colors.lime}20);
    }
  }
`;

const DividerOr = styled.div`
  position: relative;
  text-align: center;
  margin: 50px 0;
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, ${colors.lightGray}, transparent);
    z-index: 1;
  }
  
  span {
    position: relative;
    z-index: 2;
    background: ${colors.white};
    padding: 0 25px;
    color: ${colors.darkGray};
    font-weight: 600;
    font-size: 18px;
  }
`;

const FileUploadZone = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 40px;
  border: 3px dashed ${({ isDragging }) => isDragging ? colors.cyan : colors.lightGray};
  background: ${({ isDragging }) => 
    isDragging ? `${colors.cyan}10` : `linear-gradient(135deg, ${colors.lightGray}20, ${colors.white})`};
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: ${({ isDragging }) => 
      isDragging ? `radial-gradient(circle, ${colors.cyan}05, transparent)` : 'none'};
    animation: ${({ isDragging }) => isDragging ? 'rotate 10s linear infinite' : 'none'};
  }
  
  &:hover {
    border-color: ${colors.cyan};
    background: ${colors.cyan}05;
    transform: translateY(-2px);
  }
  
  @keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const UploadIcon = styled.div`
  font-size: 4rem;
  background: linear-gradient(135deg, ${colors.cyan}, ${colors.lime});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 20px;
  position: relative;
  z-index: 2;
`;

const UploadText = styled.div`
  font-size: 1.3rem;
  font-weight: 600;
  color: ${colors.darkGray};
  margin-bottom: 10px;
  text-align: center;
  position: relative;
  z-index: 2;
`;

const UploadSubtext = styled.div`
  font-size: 1rem;
  color: ${colors.darkGray};
  opacity: 0.7;
  margin-bottom: 30px;
  text-align: center;
  position: relative;
  z-index: 2;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: ${colors.lightGray};
  border-radius: 4px;
  overflow: hidden;
  margin: 20px 0;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${({ progress }) => `${progress}%`};
    background: linear-gradient(90deg, ${colors.magenta}, ${colors.cyan}, ${colors.lime});
    transition: width 0.3s ease;
    border-radius: 4px;
  }
`;

const TabsContainer = styled.div`
  display: flex;
  background: ${colors.white};
  border-radius: 0;
  clip-path: ${ClipPath.rectangle};
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  margin-bottom: 30px;
  overflow: hidden;
`;

const Tab = styled.button`
  flex: 1;
  padding: 20px;
  border: none;
  background: ${({ active }) => 
    active ? `linear-gradient(135deg, ${colors.magenta}, ${colors.cyan})` : colors.white};
  color: ${({ active }) => active ? colors.white : colors.darkGray};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  position: relative;
  
  &:not(:last-child)::after {
    content: '';
    position: absolute;
    right: 0;
    top: 20%;
    bottom: 20%;
    width: 1px;
    background: ${colors.lightGray};
  }
  
  &:hover:not(:disabled) {
    background: ${({ active }) => 
      active ? `linear-gradient(135deg, ${colors.magenta}, ${colors.cyan})` : colors.lightGray};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ProcessingStatus = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  padding: 30px;
  margin-bottom: 30px;
  background: linear-gradient(135deg, ${colors.lightGray}30, ${colors.white});
  border-radius: 0;
  clip-path: ${ClipPath.card};
  font-size: 1.2rem;
  font-weight: 600;
  color: ${colors.darkGray};
  
  svg {
    font-size: 1.5rem;
    color: ${colors.cyan};
    
    ${({ loading }) => loading && `
      animation: spin 1.5s linear infinite;
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}
  }
`;

const ResultCard = styled.div`
  background: ${colors.white};
  padding: 30px;
  margin-bottom: 20px;
  border-radius: 0;
  clip-path: ${ClipPath.card};
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  
  h3 {
    color: ${colors.darkGray};
    margin-bottom: 15px;
    display: flex;
    align-items: center;
    gap: 10px;
    
    svg {
      color: ${colors.cyan};
    }
  }
  
  .content {
    background: #F8F9FA;
    padding: 20px;
    border-radius: 0;
    clip-path: ${ClipPath.card};
    line-height: 1.6;
    color: ${colors.darkGray};
  }
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 15px;
`;

const Tag = styled.div`
  background: linear-gradient(135deg, ${colors.cyan}20, ${colors.lime}20);
  color: ${colors.darkGray};
  padding: 8px 16px;
  border-radius: 0;
  clip-path: ${ClipPath.card};
  font-size: 14px;
  font-weight: 600;
  border: 1px solid ${colors.cyan}30;
  display: flex;
  align-items: center;
  gap: 6px;
  
  svg {
    font-size: 12px;
    color: ${colors.cyan};
  }
`;

const LanguageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin: 20px 0;
`;

const LanguageButton = styled.button`
  padding: 15px 20px;
  border: 2px solid ${({ selected }) => selected ? colors.cyan : colors.lightGray};
  background: ${({ selected }) => 
    selected ? `${colors.cyan}15` : colors.white};
  color: ${colors.darkGray};
  border-radius: 0;
  clip-path: ${ClipPath.card};
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 600;
  
  &:hover {
    border-color: ${colors.cyan};
    background: ${colors.cyan}10;
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const SaveNoteForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 25px;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 25px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const HiddenFileInput = styled.input`
  display: none;
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
    { value: 'en', label: '영어' },
    { value: 'ja', label: '일본어' },
    { value: 'zh', label: '중국어' },
    { value: 'es', label: '스페인어' },
    { value: 'fr', label: '프랑스어' },
    { value: 'de', label: '독일어' },
  ];

  // Wave bars for recording visualization
  const waveBars = Array.from({ length: 20 }, (_, i) => (
    <WaveBar
      key={i}
      height={isRecording ? Math.random() * 40 + 10 : 20}
      animate={isRecording}
      delay={`${i * 0.1}s`}
    />
  ));
  
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
    if (transcriptionResults && transcriptionResults.text) {
      const titleText = transcriptionResults.text.substring(0, 20) || '음성 녹음';
      
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
      
      if (message.includes('저장되었습니다') && currentFile) {
        navigate(`/notes`);
      }
    }
  }, [message, dispatch, navigate, currentFile]);
  
  // 트랜스크립션 작업 상태를 주기적으로 확인
  useEffect(() => {
    if (transcriptionJob && transcriptionJob.status === 'IN_PROGRESS') {
      if (!checkingStatus) {
        setCheckingStatus(true);
        
        const interval = setInterval(() => {
          dispatch(checkTranscriptionStatus(transcriptionJob.id));
        }, 3000);
        
        setStatusCheckInterval(interval);
      }
    } else if (transcriptionJob && 
               (transcriptionJob.status === 'COMPLETED' || 
                transcriptionJob.status === 'FAILED')) {
      setCheckingStatus(false);
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
        setStatusCheckInterval(null);
      }
    }
    
    return () => {
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
      }
    };
  }, [transcriptionJob?.status, checkingStatus, dispatch]);
  
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
          <div>
            <ProcessingStatus loading={transcriptionJob?.status === 'IN_PROGRESS'}>
              <FaSyncAlt />
              {transcriptionJob?.status === 'IN_PROGRESS' && '텍스트 변환 진행 중...'}
              {transcriptionJob?.status === 'COMPLETED' && '텍스트 변환이 완료되었습니다.'}
              {transcriptionJob?.status === 'FAILED' && '텍스트 변환이 실패했습니다.'}
            </ProcessingStatus>
            
            {transcriptionJob?.status === 'IN_PROGRESS' && (
              <ProgressBar progress={transcriptionJob.progress || 0} />
            )}
            
            {transcriptionResults && (
              <ResultCard>
                <h3><FaFileAlt /> 변환 결과</h3>
                <div className="content">
                  {transcriptionResults.speakers && transcriptionResults.speakers.length > 0 ? (
                    transcriptionResults.speakers.map((speaker, index) => (
                      <div key={index} style={{ marginBottom: '15px' }}>
                        <strong>화자 {speaker.id}:</strong> {speaker.text}
                      </div>
                    ))
                  ) : (
                    transcriptionResults.text
                  )}
                </div>
              </ResultCard>
            )}
            
            {transcriptionJob?.status === 'FAILED' && (
              <Alert
                variant="error"
                message="음성 변환 중 오류가 발생했습니다. 다른 파일을 시도해보세요."
              />
            )}
          </div>
        );
      
      case 'analyze':
        return (
          <div>
            <ProcessingStatus>
              <FaListAlt />
              요약 및 핵심 개념 추출
            </ProcessingStatus>
            
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <ActionButton
                onClick={handleAnalyzeText}
                disabled={loading || !transcriptionResults}
                icon={<FaListAlt />}
              >
                {loading ? '분석 중...' : '텍스트 분석하기'}
              </ActionButton>
            </div>
            
            {analysisResults.summary && (
              <ResultCard>
                <h3><FaFileAlt /> 요약</h3>
                <div className="content">
                  {analysisResults.summary}
                </div>
              </ResultCard>
            )}
            
            {analysisResults.keyPhrases && analysisResults.keyPhrases.length > 0 && (
              <ResultCard>
                <h3><FaFileAlt /> 핵심 개념</h3>
                <TagsContainer>
                  {analysisResults.keyPhrases.map((phrase, index) => (
                    <Tag key={index}>
                      <FaFileAlt />
                      {phrase}
                    </Tag>
                  ))}
                </TagsContainer>
              </ResultCard>
            )}
            
            {loading && (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <Spinner size="40px" />
                <div style={{ marginTop: '20px', color: colors.darkGray }}>텍스트 분석 중...</div>
              </div>
            )}
          </div>
        );
      
      case 'translate':
        return (
          <div>
            <ProcessingStatus>
              <FaLanguage />
              다른 언어로 번역하기
            </ProcessingStatus>
            
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ marginBottom: '20px', color: colors.darkGray }}>번역할 언어 선택</h3>
              <LanguageGrid>
                {languageOptions.map(option => (
                  <LanguageButton
                    key={option.value}
                    onClick={() => handleTranslateText(option.value)}
                    selected={selectedLanguage === option.value}
                    disabled={loading}
                  >
                    <FaGlobe /> {option.label}
                  </LanguageButton>
                ))}
              </LanguageGrid>
            </div>
            
            {Object.keys(translationResults).map(lang => (
              <ResultCard key={lang}>
                <h3>
                  <FaGlobe />
                  {languageOptions.find(opt => opt.value === lang)?.label || lang} 번역 결과
                </h3>
                <div className="content" style={{ position: 'relative' }}>
                  {translationResults[lang]}
                  <ActionButton
                    style={{ 
                      position: 'absolute', 
                      top: '10px', 
                      right: '10px',
                      padding: '8px 12px',
                      fontSize: '12px'
                    }}
                    onClick={() => {
                      navigator.clipboard.writeText(translationResults[lang]);
                      dispatch(showNotification({
                        message: '번역 결과가 클립보드에 복사되었습니다.',
                        type: 'success',
                      }));
                    }}
                    icon={<FaCopy />}
                  >
                    복사
                  </ActionButton>
                </div>
              </ResultCard>
            ))}
            
            {loading && (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <Spinner size="40px" />
                <div style={{ marginTop: '20px', color: colors.darkGray }}>번역 중...</div>
              </div>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <VoiceUploadContainer>
      <Header>
        <h1>🎤 AI 음성 노트</h1>
        <div className="subtitle">
          음성을 텍스트로 변환하고 AI가 분석해드립니다
        </div>
      </Header>
      
      <ContentArea>
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
          <StepIndicator>
            <Step completed={activeStep > 1}>
              <StepNumber active={activeStep === 1} completed={activeStep > 1}>
                {activeStep > 1 ? <FaCheck /> : '1'}
              </StepNumber>
              <StepTitle>녹음 또는 업로드</StepTitle>
            </Step>
            <Step completed={activeStep > 2}>
              <StepNumber active={activeStep === 2} completed={activeStep > 2}>
                {activeStep > 2 ? <FaCheck /> : '2'}
              </StepNumber>
              <StepTitle>AI 처리</StepTitle>
            </Step>
            <Step>
              <StepNumber active={activeStep === 3}>
                {activeStep === 3 ? <FaCheck /> : '3'}
              </StepNumber>
              <StepTitle>노트 저장</StepTitle>
            </Step>
          </StepIndicator>
        </StepsContainer>
        
        {activeStep === 1 && (
          <>
            <SectionCard>
              <SectionTitle>
                <FaMicrophone />
                음성 녹음
              </SectionTitle>
              
              <RecordingSection>
                <RecordingVisualization>
                  {waveBars}
                </RecordingVisualization>
                
                <RecordingControls>
                  {!isRecording && !audioUrl && (
                    <ActionButton
                      onClick={startRecording}
                      icon={<FaMicrophone />}
                      disabled={loading}
                    >
                      녹음 시작
                    </ActionButton>
                  )}
                  
                  {isRecording && (
                    <>
                      <RecordButton
                        recording={isRecording}
                        onClick={stopRecording}
                      >
                        <FaStop />
                      </RecordButton>
                      <ActionButton
                        variant="danger"
                        onClick={cancelRecording}
                        icon={<FaTrash />}
                      >
                        취소
                      </ActionButton>
                    </>
                  )}
                  
                  <RecordingTime>
                    {secondsToTimeFormat(recordingTime)}
                  </RecordingTime>
                  
                  {audioUrl && (
                    <>
                      <ActionButton
                        onClick={handleRecordingUpload}
                        icon={<FaUpload />}
                        disabled={loading}
                      >
                        {loading ? '업로드 중...' : '녹음 업로드'}
                      </ActionButton>
                      <ActionButton
                        variant="danger"
                        onClick={resetRecording}
                        icon={<FaTrash />}
                        disabled={loading}
                      >
                        삭제
                      </ActionButton>
                    </>
                  )}
                </RecordingControls>
                
                {audioUrl && (
                  <AudioPlayer>
                    <audio controls>
                      <source src={audioUrl} type="audio/wav" />
                      브라우저가 오디오 재생을 지원하지 않습니다.
                    </audio>
                  </AudioPlayer>
                )}
              </RecordingSection>
            </SectionCard>
            
            <DividerOr>
              <span>또는</span>
            </DividerOr>
            
            <SectionCard>
              <SectionTitle>
                <FaUpload />
                파일 업로드
              </SectionTitle>
              
              <FileUploadZone
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-upload').click()}
                isDragging={isDragging}
              >
                <UploadIcon>
                  <FaUpload />
                </UploadIcon>
                <UploadText>
                  음성 파일을 클릭하거나 드래그해서 업로드하세요
                </UploadText>
                <UploadSubtext>
                  지원 형식: .mp3, .wav, .m4a (최대 100MB)
                </UploadSubtext>
                <ActionButton
                  as="label"
                  htmlFor="file-upload"
                  icon={<FaUpload />}
                  disabled={loading}
                  style={{ pointerEvents: 'none' }}
                >
                  파일 선택
                </ActionButton>
                <HiddenFileInput
                  id="file-upload"
                  type="file"
                  accept=".mp3,.wav,.m4a"
                  onChange={handleFileChange}
                  disabled={loading}
                />
              </FileUploadZone>
              
              {selectedFile && (
                <div style={{ marginTop: '30px', textAlign: 'center' }}>
                  <div style={{ 
                    marginBottom: '20px', 
                    padding: '20px',
                    background: colors.lightGray + '30',
                    borderRadius: '8px'
                  }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                      선택된 파일: {selectedFile.name}
                    </div>
                    <div style={{ color: colors.darkGray, opacity: 0.8 }}>
                      크기: {fileSize(selectedFile.size)}
                    </div>
                  </div>
                  
                  {loading && (
                    <ProgressBar progress={fileUploadProgress} />
                  )}
                  
                  <ActionButton
                    onClick={handleFileUpload}
                    icon={<FaUpload />}
                    disabled={loading}
                    style={{ width: '200px' }}
                  >
                    {loading ? `업로드 중... ${fileUploadProgress}%` : '파일 업로드'}
                  </ActionButton>
                </div>
              )}
            </SectionCard>
          </>
        )}
        
        {activeStep === 2 && transcriptionJob && (
          <SectionCard>
            <TabsContainer>
              <Tab 
                active={activeTab === 'transcribe'} 
                onClick={() => setActiveTab('transcribe')}
              >
                <FaFileAudio /> 텍스트 변환
              </Tab>
              <Tab 
                active={activeTab === 'analyze'}
                onClick={() => setActiveTab('analyze')}
                disabled={!transcriptionResults}
              >
                <FaListAlt /> 분석
              </Tab>
              <Tab 
                active={activeTab === 'translate'}
                onClick={() => setActiveTab('translate')}
                disabled={!transcriptionResults}
              >
                <FaLanguage /> 번역
              </Tab>
            </TabsContainer>
            
            {renderTabContent()}
            
            {transcriptionJob.status === 'COMPLETED' && transcriptionResults && (
              <div style={{ textAlign: 'center', marginTop: '40px' }}>
                <ActionButton
                  onClick={() => setActiveStep(3)}
                  icon={<FaArrowRight />}
                  style={{ padding: '15px 30px', fontSize: '16px' }}
                >
                  노트 작성으로 진행
                </ActionButton>
              </div>
            )}
          </SectionCard>
        )}
        
        {activeStep === 3 && transcriptionResults && (
          <SectionCard>
            <SectionTitle>
              <FaSave />
              노트 저장
            </SectionTitle>
            
            <SaveNoteForm onSubmit={handleSaveNote}>
              <FormGrid>
                <div>
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
                    minHeight="300px"
                    required
                  />
                </div>
                
                <div>
                  <Select
                    name="category"
                    label="카테고리"
                    value={noteData.category}
                    onChange={handleNoteChange}
                    options={categories}
                    disabled={loading}
                  />
                  
                  {analysisResults.keyPhrases && analysisResults.keyPhrases.length > 0 && (
                    <div style={{ marginTop: '20px' }}>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: '10px', 
                        fontSize: '14px', 
                        fontWeight: 500,
                        color: colors.darkGray
                      }}>
                        자동 생성된 태그
                      </label>
                      <TagsContainer>
                        {analysisResults.keyPhrases.map((phrase, index) => (
                          <Tag key={index}>
                            <FaFileAlt />
                            {phrase}
                          </Tag>
                        ))}
                      </TagsContainer>
                    </div>
                  )}
                </div>
              </FormGrid>
              
              <div style={{ textAlign: 'center', marginTop: '30px' }}>
                <ActionButton
                  type="submit"
                  icon={<FaSave />}
                  disabled={loading}
                  style={{ padding: '15px 40px', fontSize: '16px' }}
                >
                  {loading ? '저장 중...' : '노트 저장하기'}
                </ActionButton>
              </div>
            </SaveNoteForm>
          </SectionCard>
        )}
      </ContentArea>
    </VoiceUploadContainer>
  );
};

export default VoiceUpload;