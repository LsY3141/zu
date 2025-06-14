import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styled, { keyframes, css } from 'styled-components';
import {
  FaMicrophone,
  FaStop,
  FaUpload,
  FaPlay,
  FaTrash,
  FaCheck,
  FaLanguage,
  FaFileAlt,
  FaArrowRight,
  FaArrowLeft,
  FaEdit,
  FaSave,
  FaTag,
  FaPlus
} from 'react-icons/fa';
import {
  uploadSpeechFile,
  resetSpeechState,
  checkTranscriptionStatus,
  analyzeTranscription,
  translateTranscription,
  createNoteFromTranscription,
  setFileUploadProgress
} from '../redux/slices/speechSlice';
import { showNotification } from '../redux/slices/uiSlice';
import theme from '../styles/theme';

const { colors } = theme;

// 애니메이션
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const wave = keyframes`
  0%, 100% { height: 20px; }
  50% { height: 40px; }
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const recordingPulse = keyframes`
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(255, 82, 82, 0.7);
  }
  70% {
    transform: scale(1.1);
    box-shadow: 0 0 0 10px rgba(255, 82, 82, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(255, 82, 82, 0);
  }
`;

// 스타일드 컴포넌트들
const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 20px;
  min-height: calc(100vh - 140px);
`;

const StepIndicator = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 50px;
  padding: 0 20px;

  @media (max-width: 768px) {
    flex-wrap: wrap;
    gap: 10px;
  }
`;

const Step = styled.div`
  display: flex;
  align-items: center;
  color: ${props => props.active ? colors.primary : colors.darkGray};
  font-weight: ${props => props.active ? 'bold' : 'normal'};
  opacity: ${props => props.active ? 1 : 0.5};
  font-size: 0.9rem;

  .icon {
    margin-right: 8px;
    font-size: 1.2rem;
  }

  @media (max-width: 768px) {
    font-size: 0.8rem;
    .icon {
      font-size: 1rem;
    }
  }
`;

const StepConnector = styled.div`
  width: 40px;
  height: 2px;
  background: ${props => props.completed ? colors.primary : colors.lightGray};
  margin: 0 20px;

  @media (max-width: 768px) {
    width: 20px;
    margin: 0 10px;
  }
`;

const StepContent = styled.div`
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid ${colors.lightGray};

  @media (max-width: 768px) {
    padding: 30px 20px;
  }
`;

const StepTitle = styled.h2`
  text-align: center;
  color: ${colors.darkGray};
  margin-bottom: 30px;
  font-size: 1.8rem;
  font-weight: 700;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const RecordingZone = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
  text-align: center;
`;

const RecordButton = styled.button`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: none;
  background: ${props => props.isRecording ? '#ff5252' : colors.primary};
  color: white;
  font-size: 2.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);

  ${props => props.isRecording && css`
    animation: ${recordingPulse} 2s infinite;
  `}

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 12px 35px rgba(0, 0, 0, 0.2);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    width: 100px;
    height: 100px;
    font-size: 2rem;
  }
`;

const AudioWaveform = styled.div`
  display: flex;
  align-items: end;
  gap: 4px;
  margin: 30px 0;
  height: 50px;
`;

const WaveBar = styled.div`
  width: 6px;
  height: 20px;
  background: ${colors.primary};
  border-radius: 3px;
  animation: ${wave} 1.5s ease-in-out infinite;
  animation-delay: ${props => props.delay}s;
`;

const RecordingInfo = styled.div`
  margin-top: 30px;
  
  .timer {
    font-size: 2rem;
    font-weight: bold;
    color: ${colors.primary};
    margin-bottom: 10px;
  }
  
  .status {
    font-size: 1rem;
    color: ${colors.darkGray};
  }
`;

const RecordingControls = styled.div`
  display: flex;
  gap: 15px;
  margin-top: 30px;
`;

const ControlButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: 2px solid ${colors.primary};
  background: white;
  color: ${colors.primary};
  border-radius: 25px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;

  &:hover {
    background: ${colors.primary};
    color: white;
    transform: translateY(-2px);
  }
`;

const FileUploadZone = styled.div`
  border: 3px dashed ${props => props.isDragging ? colors.primary : colors.lightGray};
  border-radius: 16px;
  padding: 60px 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.isDragging ? `${colors.primary}10` : 'white'};

  &:hover {
    border-color: ${colors.primary};
    background: ${colors.primary}05;
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    padding: 40px 20px;
  }
`;

const SelectedFileInfo = styled.div`
  background: ${colors.primary}10;
  border: 2px solid ${colors.primary}30;
  border-radius: 12px;
  padding: 20px;
  margin-top: 20px;
  text-align: center;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 15px;
  margin-top: 30px;
  justify-content: center;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 15px 30px;
  background: ${colors.primary};
  color: white;
  border: none;
  border-radius: 30px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 160px;

  &:hover {
    background: ${colors.primaryDark};
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(74, 144, 226, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  .icon {
    font-size: 1.1rem;
  }
`;

const MethodSelector = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 40px;
  justify-content: center;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 15px;
  }
`;

const MethodButton = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px 25px;
  border: 2px solid ${props => props.active ? colors.primary : colors.lightGray};
  background: ${props => props.active ? colors.primary : 'white'};
  color: ${props => props.active ? 'white' : colors.darkGray};
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  font-size: 1rem;

  &:hover {
    border-color: ${colors.primary};
    ${props => !props.active && css`
      background: ${colors.primary}10;
    `}
  }

  .icon {
    font-size: 1.3rem;
  }
`;

const OptionCard = styled.div`
  background: white;
  border: 2px solid ${colors.lightGray};
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: ${colors.primary};
    box-shadow: 0 4px 15px rgba(74, 144, 226, 0.1);
  }

  ${props => props.selected && css`
    border-color: ${colors.primary};
    background: ${colors.primary}05;
  `}
`;

const CheckboxWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  
  input[type="checkbox"] {
    width: 20px;
    height: 20px;
    accent-color: ${colors.primary};
  }
`;

const ProcessingContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
`;

const ProcessingStep = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  margin-bottom: 15px;
  background: ${props => props.completed ? `${colors.primary}10` : 'white'};
  border: 2px solid ${props => props.completed ? colors.primary : props.active ? colors.primary : colors.lightGray};
  border-radius: 12px;
  transition: all 0.3s ease;

  .icon {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${props => props.completed ? colors.primary : props.active ? colors.primary : colors.lightGray};
    color: white;
    font-size: 1.5rem;
    
    ${props => props.active && !props.completed && css`
      animation: ${pulse} 2s infinite;
    `}
  }

  .content {
    flex: 1;
    
    .title {
      font-size: 1.1rem;
      font-weight: 600;
      color: ${colors.darkGray};
      margin-bottom: 5px;
    }
    
    .description {
      color: ${colors.darkGray};
      font-size: 0.9rem;
      margin-bottom: 8px;
    }
    
    .progress-text {
      color: ${colors.primary};
      font-size: 0.8rem;
      font-weight: 500;
    }
  }
`;

const NoteEditSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 30px;
  margin-top: 30px;
  border: 1px solid ${colors.lightGray};
`;

const InputGroup = styled.div`
  margin-bottom: 25px;
  
  label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: ${colors.darkGray};
  }
  
  input, textarea, select {
    width: 100%;
    padding: 12px 15px;
    border: 2px solid ${colors.lightGray};
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.3s ease;
    
    &:focus {
      outline: none;
      border-color: ${colors.primary};
    }
  }
  
  textarea {
    min-height: 120px;
    resize: vertical;
  }
`;

const TagContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
`;

const Tag = styled.span`
  background: ${colors.primary}20;
  color: ${colors.primary};
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 5px;
  
  .remove {
    cursor: pointer;
    font-weight: bold;
    
    &:hover {
      color: #ff5252;
    }
  }
`;

const TagInput = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 10px;
  
  input {
    flex: 1;
  }
  
  button {
    padding: 8px 15px;
    background: ${colors.primary};
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
    
    &:hover {
      background: ${colors.primaryDark};
    }
  }
`;

const AdvancedProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: ${colors.lightGray};
  border-radius: 4px;
  overflow: hidden;
  margin: 15px 0;
  position: relative;

  .progress {
    height: 100%;
    background: linear-gradient(90deg, ${colors.primary}, ${colors.primaryDark});
    border-radius: 4px;
    transition: width 0.3s ease;
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
      animation: ${float} 2s ease-in-out infinite;
    }
  }
`;

const PreviewTabs = styled.div`
  display: flex;
  border-bottom: 2px solid ${colors.lightGray};
  margin-bottom: 20px;
  background: white;
  border-radius: 8px 8px 0 0;
  overflow: hidden;
`;

const PreviewTab = styled.button`
  flex: 1;
  padding: 15px 20px;
  border: none;
  background: ${props => props.active ? colors.primary : props.available ? 'white' : colors.lightGray + '50'};
  color: ${props => props.active ? 'white' : props.available ? colors.darkGray : colors.lightGray};
  font-weight: 600;
  cursor: ${props => props.available ? 'pointer' : 'not-allowed'};
  transition: all 0.3s ease;
  font-size: 0.9rem;
  border-bottom: 3px solid ${props => props.active ? colors.primary : 'transparent'};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;

  &:hover {
    background: ${props => {
      if (!props.available) return colors.lightGray + '50';
      return props.active ? colors.primaryDark : colors.lightGray + '30';
    }};
  }

  .badge {
    background: ${props => props.active ? 'rgba(255,255,255,0.3)' : colors.primary + '20'};
    color: ${props => props.active ? 'white' : colors.primary};
    padding: 2px 6px;
    border-radius: 10px;
    font-size: 0.7rem;
    margin-left: 5px;
  }

  @media (max-width: 768px) {
    padding: 12px 10px;
    font-size: 0.8rem;
    flex-direction: column;
    gap: 2px;
    
    .badge {
      margin-left: 0;
    }
  }
`;

const PreviewContent = styled.div`
  background: ${colors.lightGray}30;
  padding: 25px;
  border-radius: 0 0 8px 8px;
  min-height: 200px;
  white-space: pre-wrap;
  line-height: 1.6;
  font-size: 0.95rem;
  border: 1px solid ${colors.lightGray};
  border-top: none;

  h3 {
    color: ${colors.primary};
    margin-bottom: 15px;
    font-size: 1.1rem;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .empty-state {
    text-align: center;
    color: ${colors.darkGray};
    font-style: italic;
    margin-top: 60px;
    padding: 40px 20px;
    background: white;
    border-radius: 8px;
    border: 2px dashed ${colors.lightGray};
    
    &.loading {
      color: ${colors.primary};
      font-style: normal;
      
      &::after {
        content: '';
        display: inline-block;
        width: 20px;
        height: 20px;
        margin-left: 10px;
        border: 2px solid ${colors.lightGray};
        border-radius: 50%;
        border-top-color: ${colors.primary};
        animation: ${spin} 1s ease-in-out infinite;
      }
    }
  }
`;

const VoiceUpload = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const {
    transcriptionJob,
    transcriptionResults,
    analysisResults,
    translationResults,
    loading,
    error,
    message,
    fileUploadProgress
  } = useSelector((state) => state.speech);

  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [activeStep, setActiveStep] = useState(1);
  const [uploadMethod, setUploadMethod] = useState('file');
  const [isDragging, setIsDragging] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState('');
  const [processingOptions, setProcessingOptions] = useState({
    summary: true,
    translation: false,
    targetLanguage: 'en'
  });
  const [noteData, setNoteData] = useState({
    title: '',
    content: '',
    summary: '',
    keywords: '',
    translation: '',
    category: 'basic',
    tags: []
  });
  const [tagInput, setTagInput] = useState('');
  const [activePreviewTab, setActivePreviewTab] = useState('transcribe');

  const statusCheckIntervalRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);

  // 🔥 수정된 부분 1: 분석 결과 처리 (keyPhrases로 접근)
  useEffect(() => {
    if (analysisResults) {
      if (analysisResults.summary) {
        setNoteData(prev => ({ ...prev, summary: analysisResults.summary }));
      }
      
      // 수정: keyPhrases 필드로 접근
      if (analysisResults.keyPhrases && analysisResults.keyPhrases.length > 0) {
        setNoteData(prev => ({
          ...prev,
          keywords: Array.isArray(analysisResults.keyPhrases)
            ? analysisResults.keyPhrases.join(', ')
            : analysisResults.keyPhrases
        }));
      }
    }
  }, [analysisResults]);

  // 🔥 수정된 부분 2: 번역 결과 처리 (targetLanguage 키로 접근)
  useEffect(() => {
    if (translationResults && processingOptions.targetLanguage) {
      const translatedText = translationResults[processingOptions.targetLanguage];
      if (translatedText) {
        setNoteData(prev => ({ ...prev, translation: translatedText }));
      }
    }
  }, [translationResults, processingOptions.targetLanguage]);

  // 기본 텍스트 설정
  useEffect(() => {
    if (transcriptionResults?.text) {
      setNoteData(prev => ({ 
        ...prev, 
        content: transcriptionResults.text,
        title: `음성 노트 - ${new Date().toLocaleDateString()}`
      }));
    }
  }, [transcriptionResults]);

  // 새로운 데이터가 추가될 때 해당 탭으로 자동 이동
  useEffect(() => {
    const availableTabs = getAvailableTabs();
    const currentTabAvailable = availableTabs.find(tab => tab.id === activePreviewTab)?.available;
    
    if (!currentTabAvailable && availableTabs.length > 0) {
      const firstAvailableTab = availableTabs.find(tab => tab.available);
      if (firstAvailableTab) {
        setActivePreviewTab(firstAvailableTab.id);
      }
    }
  }, [noteData.summary, noteData.keywords, noteData.translation, noteData.content, activePreviewTab]);

  // Step 4로 이동할 때 첫 번째 탭으로 설정
  useEffect(() => {
    if (activeStep === 4) {
      setActivePreviewTab('transcribe');
    }
  }, [activeStep]);

  // 파일 업로드 완료 시 다음 단계로
  useEffect(() => {
    if (transcriptionJob && activeStep === 1) {
      setActiveStep(2);
    }
  }, [transcriptionJob, activeStep]);

  // 변환 완료 시 선택된 옵션들 자동 처리
  useEffect(() => {
    if (transcriptionResults && activeStep === 3) {
      console.log('🎯 옵션 처리 시작!');

      if (processingOptions.summary) {
        console.log('📊 요약 분석 시작');
        dispatch(analyzeTranscription({ transcriptionId: transcriptionJob.id }));
      }

      if (processingOptions.translation) {
        console.log('🌍 번역 시작 - 타겟 언어:', processingOptions.targetLanguage);
        dispatch(translateTranscription({
          transcriptionId: transcriptionJob.id,
          targetLanguage: processingOptions.targetLanguage
        }));
      }

      if (!processingOptions.summary && !processingOptions.translation) {
        console.log('옵션 없음 - 바로 4단계로 이동');
        setTimeout(() => setActiveStep(4), 1000);
      }
    }
  }, [transcriptionResults, activeStep, processingOptions, dispatch, transcriptionJob]);

  // 🔥 수정된 부분 3: 분석 및 번역 완료 확인
  useEffect(() => {
    if (activeStep === 3 && transcriptionResults) {
      const summaryDone = !processingOptions.summary || (analysisResults && analysisResults.summary);
      const translationDone = !processingOptions.translation || 
        (translationResults && translationResults[processingOptions.targetLanguage]);

      console.log('완료 상태 확인:', {
        summaryDone,
        translationDone,
        hasAnalysisResults: !!analysisResults,
        hasSummary: !!analysisResults?.summary,
        hasTranslation: !!translationResults?.[processingOptions.targetLanguage],
        targetLanguage: processingOptions.targetLanguage
      });

      if (summaryDone && translationDone) {
        console.log('🎉 모든 처리 완료! 4단계로 이동');
        setTimeout(() => setActiveStep(4), 2000);
      }
    }
  }, [analysisResults, translationResults, activeStep, processingOptions, transcriptionResults]);

// ✅ 추가: 분석 결과를 noteData에 반영하는 useEffect
useEffect(() => {
  console.log('분석 결과 변경 감지:', {
    analysisResults,
    translationResults,
    targetLanguage: processingOptions.targetLanguage
  });
  
  // 요약과 키워드 결과가 있으면 noteData에 반영
  if (analysisResults?.summary) {
    console.log('요약 결과를 noteData에 반영:', analysisResults.summary);
    setNoteData(prev => ({
      ...prev,
      summary: analysisResults.summary
    }));
  }
  
  if (analysisResults?.keyPhrases && Array.isArray(analysisResults.keyPhrases)) {
    const keywordsString = analysisResults.keyPhrases.join(', ');
    console.log('키워드 결과를 noteData에 반영:', keywordsString);
    setNoteData(prev => ({
      ...prev,
      keywords: keywordsString
    }));
  }
  
  // 번역 결과가 있으면 noteData에 반영
  const targetLanguage = processingOptions.targetLanguage;
  if (targetLanguage && translationResults?.[targetLanguage]) {
    console.log('번역 결과를 noteData에 반영:', translationResults[targetLanguage]);
    setNoteData(prev => ({
      ...prev,
      translation: translationResults[targetLanguage],
      targetLanguage: targetLanguage
    }));
  }
}, [analysisResults, translationResults, processingOptions.targetLanguage]);

  // 변환 작업 상태 확인
  useEffect(() => {
    if (transcriptionJob?.id && transcriptionJob?.status !== 'COMPLETED') {
      console.log('🔄 변환 상태 확인 시작:', transcriptionJob.id);

      statusCheckIntervalRef.current = setInterval(() => {
        console.log('📡 상태 확인 요청');
        dispatch(checkTranscriptionStatus(transcriptionJob.id));
      }, 3000);
    } else {
      if (statusCheckIntervalRef.current) {
        clearInterval(statusCheckIntervalRef.current);
        statusCheckIntervalRef.current = null;
      }
    }

    return () => {
      if (statusCheckIntervalRef.current) {
        clearInterval(statusCheckIntervalRef.current);
        statusCheckIntervalRef.current = null;
      }
    };
  }, [transcriptionJob?.status, transcriptionJob?.id, activeStep, dispatch]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      dispatch(resetSpeechState());
      if (statusCheckIntervalRef.current) {
        clearInterval(statusCheckIntervalRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [dispatch]);

  // 녹음 시간 업데이트
  useEffect(() => {
    if (isRecording) {
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRecording]);

  // 녹음된 블롭이 있을 때 오디오 URL 생성
  useEffect(() => {
    if (recordedBlob) {
      const url = URL.createObjectURL(recordedBlob);
      setAudioUrl(url);
      setSelectedFile(new File([recordedBlob], `recording-${Date.now()}.wav`, { type: 'audio/wav' }));

      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [recordedBlob]);

  // 파일 크기 포맷팅
  const fileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 녹음 시작
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        setRecordedBlob(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      dispatch(showNotification({
        message: '녹음이 시작되었습니다.',
        type: 'success'
      }));

    } catch (error) {
      console.error('녹음 시작 오류:', error);
      dispatch(showNotification({
        message: '마이크 접근 권한을 확인해주세요.',
        type: 'error'
      }));
    }
  };

  // 녹음 중지
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      dispatch(showNotification({
        message: '녹음이 완료되었습니다.',
        type: 'success'
      }));
    }
  };

  // 녹음 재생
  const playRecording = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
    }
  };

  // 녹음 삭제
  const deleteRecording = () => {
    setRecordedBlob(null);
    setSelectedFile(null);
    setRecordingTime(0);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl('');
    }
  };

  // 시간 포맷팅
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // 파일 변경 핸들러
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setUploadMethod('file');
    }
  };

  // 드래그 앤 드롭 핸들러
  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);

    const files = event.dataTransfer.files;
    if (files.length > 0) {
      setSelectedFile(files[0]);
      setUploadMethod('file');
    }
  };

  // 파일 업로드
  const handleFileUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      await dispatch(uploadSpeechFile({
        formData,
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          dispatch(setFileUploadProgress(percentCompleted));
        }
      })).unwrap();
    } catch (error) {
      console.error('파일 업로드 오류:', error);
    }
  };

  // 옵션 토글
  const handleOptionToggle = (option) => {
    setProcessingOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  // 언어 변경
  const handleLanguageChange = (language) => {
    setProcessingOptions(prev => ({
      ...prev,
      targetLanguage: language
    }));
  };

  // 처리 시작
  const handleStartProcessing = () => {
    console.log('처리 시작 - 선택된 옵션:', processingOptions);
    setActiveStep(3);
  };

  // 최종 컨텐츠 생성
  const buildFinalContent = () => {
    let content = '';

    if (transcriptionResults?.speakers && transcriptionResults.speakers.length > 0) {
      content += `## 📝 텍스트 변환 결과 (화자 구분)\n\n`;
      transcriptionResults.speakers.forEach((speaker, index) => {
        content += `**화자 ${index + 1}:** ${speaker.text}\n\n`;
      });
    } else if (noteData.content) {
      content += `## 📝 텍스트 변환 결과\n\n${noteData.content}\n\n`;
    }

    if (noteData.summary) {
      content += `## 📊 요약\n\n${noteData.summary}\n\n`;
    }

    if (noteData.keywords) {
      content += `## 🔍 핵심 키워드\n\n${noteData.keywords}\n\n`;
    }

    if (noteData.translation) {
      const langNames = {
        'ko': '한국어',
        'en': '영어',
        'ja': '일본어',
        'zh': '중국어',
        'es': '스페인어',
        'fr': '프랑스어'
      };

      const targetLangName = langNames[processingOptions.targetLanguage] || processingOptions.targetLanguage;
      content += `## 🌍 번역 결과 (${targetLangName})\n\n${noteData.translation}\n\n`;
    }

    return content;
  };

  // 탭별 콘텐츠 렌더링
  const renderPreviewContent = () => {
    switch (activePreviewTab) {
      case 'transcribe':
        if (transcriptionResults?.speakers && transcriptionResults.speakers.length > 0) {
          return (
            <div>
              <h3>📝 텍스트 변환 결과 (화자 구분)</h3>
              {transcriptionResults.speakers.map((speaker, index) => (
                <div key={index} style={{ marginBottom: '15px' }}>
                  <strong>화자 {index + 1}:</strong> {speaker.text}
                </div>
              ))}
            </div>
          );
        } else if (noteData.content) {
          return (
            <div>
              <h3>📝 텍스트 변환 결과</h3>
              {noteData.content}
            </div>
          );
        } else {
          return (
            <div className="empty-state">
              음성 변환이 완료되면 여기에 텍스트가 표시됩니다.
            </div>
          );
        }

      case 'summary':
        if (noteData.summary) {
          return (
            <div>
              <h3>📊 요약</h3>
              {noteData.summary}
            </div>
          );
        } else {
          return (
            <div className={`empty-state ${processingOptions.summary ? 'loading' : ''}`}>
              {processingOptions.summary 
                ? 'AI가 요약을 생성 중입니다' 
                : '요약 기능이 선택되지 않았습니다.'
              }
            </div>
          );
        }

      case 'keywords':
        if (noteData.keywords) {
          const keywordList = noteData.keywords.split(',').map(k => k.trim());
          return (
            <div>
              <h3>🔍 핵심 키워드</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                {keywordList.map((keyword, index) => (
                  <span 
                    key={index}
                    style={{
                      background: colors.primary + '20',
                      color: colors.primary,
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: '500'
                    }}
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          );
        } else {
          return (
            <div className={`empty-state ${processingOptions.summary ? 'loading' : ''}`}>
              {processingOptions.summary 
                ? 'AI가 키워드를 추출 중입니다' 
                : '요약 기능이 선택되지 않았습니다.'
              }
            </div>
          );
        }

      case 'translation':
        if (noteData.translation) {
          const langNames = {
            'ko': '한국어',
            'en': '영어',
            'ja': '일본어',
            'zh': '중국어',
            'es': '스페인어',
            'fr': '프랑스어'
          };
          const targetLangName = langNames[processingOptions.targetLanguage] || processingOptions.targetLanguage;
          return (
            <div>
              <h3>🌍 번역 결과 ({targetLangName})</h3>
              {noteData.translation}
            </div>
          );
        } else {
          return (
            <div className={`empty-state ${processingOptions.translation ? 'loading' : ''}`}>
              {processingOptions.translation 
                ? 'AI가 번역 중입니다' 
                : '번역 기능이 선택되지 않았습니다.'
              }
            </div>
          );
        }

      default:
        return <div className="empty-state">콘텐츠를 선택해주세요.</div>;
    }
  };

  // 활성화된 탭 관리
  const getAvailableTabs = () => {
    const tabs = [];

    // 텍스트 변환 탭은 항상 표시
    tabs.push({ 
      id: 'transcribe', 
      label: '📝 텍스트', 
      available: !!(transcriptionResults?.text || noteData.content),
      count: transcriptionResults?.speakers?.length || 0
    });

    // 요약 기능이 선택된 경우에만 표시
    if (processingOptions.summary) {
      tabs.push({ 
        id: 'summary', 
        label: '📊 요약', 
        available: !!noteData.summary,
        count: 0
      });

      tabs.push({ 
        id: 'keywords', 
        label: '🔍 키워드', 
        available: !!noteData.keywords,
        count: noteData.keywords ? noteData.keywords.split(',').length : 0
      });
    }

    // 번역 기능이 선택된 경우에만 표시
    if (processingOptions.translation) {
      tabs.push({ 
        id: 'translation', 
        label: '🌍 번역', 
        available: !!noteData.translation,
        count: 0
      });
    }

    return tabs;
  };

  // 태그 추가
  const handleAddTag = () => {
    if (tagInput.trim() && !noteData.tags.includes(tagInput.trim())) {
      setNoteData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  // 태그 제거
  const handleRemoveTag = (tagToRemove) => {
    setNoteData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

// 노트 저장
const handleSaveNote = async () => {
  if (!noteData.title.trim()) {
    dispatch(showNotification({
      message: '노트 제목을 입력해주세요.',
      type: 'error'
    }));
    return;
  }

  try {
    // ✅ Redux store에서 직접 번역 결과 가져오기
    const finalTranslation = translationResults?.[processingOptions.targetLanguage] || '';
    
    console.log('🌍 번역 저장 확인:', {
      translationResults,
      targetLanguage: processingOptions.targetLanguage,
      finalTranslation: finalTranslation
    });

    await dispatch(createNoteFromTranscription({
      transcriptionId: transcriptionJob.id,
      title: noteData.title,
      content: noteData.content || '',
      summary: analysisResults?.summary || '',
      keywords: analysisResults?.keyPhrases 
        ? (Array.isArray(analysisResults.keyPhrases) 
            ? analysisResults.keyPhrases.join(', ') 
            : String(analysisResults.keyPhrases))
        : '',
      translation: finalTranslation, // ✅ Redux에서 직접 가져온 번역
      targetLanguage: processingOptions.targetLanguage, // ✅ 타겟 언어도 전달
      category: noteData.category,
      tags: noteData.tags
    })).unwrap();

    dispatch(showNotification({
      message: '노트가 성공적으로 저장되었습니다.',
      type: 'success'
    }));

    setTimeout(() => {
      navigate('/notes');
    }, 1500);
  } catch (error) {
    console.error('노트 저장 오류:', error);
    dispatch(showNotification({
      message: '노트 저장 중 오류가 발생했습니다.',
      type: 'error'
    }));
  }
};

  return (
    <Container>
      {/* 단계 표시기 */}
      <StepIndicator>
        <Step active={activeStep === 1}>
          <div className="icon"><FaUpload /></div>
          파일 업로드
        </Step>
        <StepConnector completed={activeStep > 1} />
        <Step active={activeStep === 2}>
          <div className="icon"><FaEdit /></div>
          옵션 선택
        </Step>
        <StepConnector completed={activeStep > 2} />
        <Step active={activeStep === 3}>
          <div className="icon"><FaFileAlt /></div>
          AI 처리
        </Step>
        <StepConnector completed={activeStep > 3} />
        <Step active={activeStep === 4}>
          <div className="icon"><FaSave /></div>
          노트 저장
        </Step>
      </StepIndicator>

      {/* Step 1: 파일 업로드 */}
      {activeStep === 1 && (
        <StepContent>
          <StepTitle>음성 파일 업로드 또는 녹음</StepTitle>
          
          <MethodSelector>
            <MethodButton 
              active={uploadMethod === 'file'} 
              onClick={() => setUploadMethod('file')}
            >
              <div className="icon"><FaUpload /></div>
              파일 업로드
            </MethodButton>
            <MethodButton 
              active={uploadMethod === 'record'} 
              onClick={() => setUploadMethod('record')}
            >
              <div className="icon"><FaMicrophone /></div>
              직접 녹음
            </MethodButton>
          </MethodSelector>

          {/* 파일 업로드 영역 */}
          {uploadMethod === 'file' && (
            <>
              <FileUploadZone
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-upload').click()}
                isDragging={isDragging}
              >
                <div style={{ fontSize: '3rem', color: colors.primary, marginBottom: '20px' }}>
                  <FaUpload />
                </div>
                <div style={{ fontSize: '1.2rem', color: colors.darkGray, marginBottom: '10px' }}>
                  음성 파일을 클릭하거나 드래그해서 업로드하세요
                </div>
                <div style={{ fontSize: '0.9rem', color: colors.lightGray }}>
                  지원 형식: .mp3, .wav, .m4a (최대 100MB)
                </div>
              </FileUploadZone>

              <input
                id="file-upload"
                type="file"
                accept=".mp3,.wav,.m4a"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </>
          )}

          {/* 녹음 영역 */}
          {uploadMethod === 'record' && (
            <RecordingZone>
              <div style={{ fontSize: '1.2rem', color: colors.darkGray, marginBottom: '30px' }}>
                마이크 버튼을 눌러 녹음을 시작하세요
              </div>

              <RecordButton
                onClick={isRecording ? stopRecording : startRecording}
                isRecording={isRecording}
                disabled={loading}
              >
                {isRecording ? <FaStop /> : <FaMicrophone />}
              </RecordButton>

              {isRecording && (
                <AudioWaveform>
                  {[...Array(8)].map((_, i) => (
                    <WaveBar key={i} delay={i * 0.1} />
                  ))}
                </AudioWaveform>
              )}

              {(isRecording || recordingTime > 0) && (
                <RecordingInfo>
                  <div className="timer">{formatTime(recordingTime)}</div>
                  <div className="status">
                    {isRecording ? '🔴 녹음 중...' : '⏹️ 녹음 완료'}
                  </div>
                </RecordingInfo>
              )}

              {recordedBlob && !isRecording && (
                <RecordingControls>
                  <ControlButton onClick={playRecording}>
                    <FaPlay />
                    재생
                  </ControlButton>
                  <ControlButton onClick={deleteRecording}>
                    <FaTrash />
                    삭제
                  </ControlButton>
                </RecordingControls>
              )}
            </RecordingZone>
          )}

          {/* 선택된 파일 정보 */}
          {selectedFile && (
            <SelectedFileInfo>
              <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '10px' }}>
                선택된 파일: {selectedFile.name}
              </div>
              <div style={{ color: colors.darkGray }}>
                크기: {fileSize(selectedFile.size)}
              </div>

              {fileUploadProgress > 0 && (
                <AdvancedProgressBar progress={fileUploadProgress}>
                  <div className="progress-glow"></div>
                  <div className="progress" style={{ width: `${fileUploadProgress}%` }} />
                </AdvancedProgressBar>
              )}

              <ButtonGroup>
                <ActionButton onClick={handleFileUpload} disabled={loading}>
                  <FaUpload />
                  {loading ? '업로드 중...' : '업로드 시작'}
                </ActionButton>
              </ButtonGroup>
            </SelectedFileInfo>
          )}
        </StepContent>
      )}

      {/* Step 2: 옵션 선택 */}
      {activeStep === 2 && (
        <StepContent>
          <StepTitle>추가 처리 옵션 선택</StepTitle>
          <div style={{ textAlign: 'center', marginBottom: '40px', color: colors.darkGray }}>
            필요한 기능을 선택하세요 (텍스트 변환은 기본으로 실행됩니다)
          </div>

          <OptionCard 
            selected={processingOptions.summary}
            onClick={() => handleOptionToggle('summary')}
          >
            <CheckboxWrapper>
              <input 
                type="checkbox" 
                checked={processingOptions.summary}
                onChange={() => handleOptionToggle('summary')}
              />
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '5px' }}>
                  요약 생성
                </div>
                <p style={{ margin: '5px 0 10px 0', fontSize: '0.9rem', color: colors.darkGray }}>
                  음성 내용을 요약하고 핵심 키워드를 추출합니다
                </p>
              </div>
            </CheckboxWrapper>
          </OptionCard>

          <OptionCard 
            selected={processingOptions.translation}
            onClick={() => handleOptionToggle('translation')}
          >
            <CheckboxWrapper>
              <input 
                type="checkbox" 
                checked={processingOptions.translation}
                onChange={() => handleOptionToggle('translation')}
              />
              <div style={{ width: '100%' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '5px' }}>
                  다른 언어로 번역
                </div>
                <p style={{ margin: '5px 0 10px 0', fontSize: '0.9rem', color: colors.darkGray }}>
                  텍스트를 선택한 언어로 번역합니다
                </p>

                {processingOptions.translation && (
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {[
                      { code: 'en', name: '영어' },
                      { code: 'ko', name: '한국어' },
                      { code: 'ja', name: '일본어' },
                      { code: 'zh', name: '중국어' },
                      { code: 'es', name: '스페인어' },
                      { code: 'fr', name: '프랑스어' }
                    ].map(lang => (
                      <button
                        key={lang.code}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLanguageChange(lang.code);
                        }}
                        style={{
                          padding: '5px 12px',
                          border: `2px solid ${processingOptions.targetLanguage === lang.code ? colors.primary : colors.lightGray}`,
                          borderRadius: '20px',
                          background: processingOptions.targetLanguage === lang.code ? colors.primary : 'white',
                          color: processingOptions.targetLanguage === lang.code ? 'white' : colors.darkGray,
                          cursor: 'pointer',
                          fontSize: '0.8rem'
                        }}
                      >
                        {lang.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </CheckboxWrapper>
          </OptionCard>

          <ButtonGroup>
            <ActionButton onClick={() => setActiveStep(1)}>
              <FaArrowLeft />
              이전
            </ActionButton>
            <ActionButton onClick={handleStartProcessing}>
              <FaArrowRight />
              처리 시작
            </ActionButton>
          </ButtonGroup>
        </StepContent>
      )}

      {/* Step 3: 처리 중 */}
      {activeStep === 3 && (
        <StepContent>
          <StepTitle>AI 처리 중</StepTitle>
          
          <ProcessingContainer>
            {/* 텍스트 변환 단계 */}
            <ProcessingStep
              completed={transcriptionResults?.text}
              active={!transcriptionResults?.text}
              index={0}
            >
              <div className="icon">
                {transcriptionResults?.text ? <FaCheck /> : <FaFileAlt />}
              </div>
              <div className="content">
                <div className="title">📝 텍스트 변환</div>
                <div className="description">
                  {transcriptionResults?.text
                    ? '✅ 완료'
                    : '⏳ 진행중...'
                  }
                </div>
                <div className="progress-text">
                  {!transcriptionResults?.text && '음성을 분석하고 있습니다...'}
                </div>
              </div>
            </ProcessingStep>

            {/* 요약 단계 */}
            {processingOptions.summary && (
              <ProcessingStep
                completed={analysisResults?.summary}
                active={transcriptionResults?.text && !analysisResults?.summary}
                index={1}
              >
                <div className="icon">
                  {analysisResults?.summary ? <FaCheck /> : <FaFileAlt />}
                </div>
                <div className="content">
                  <div className="title">📊 요약 생성</div>
                  <div className="description">
                    {analysisResults?.summary
                      ? '✅ 완료'
                      : '⏳ 진행중...'
                    }
                  </div>
                  <div className="progress-text">
                    {transcriptionResults?.text && !analysisResults?.summary && 'AI가 내용을 분석중입니다...'}
                  </div>
                </div>
              </ProcessingStep>
            )}

            {/* 🔥 수정된 부분 4: 번역 단계 */}
            {processingOptions.translation && (
              <ProcessingStep
                completed={translationResults && translationResults[processingOptions.targetLanguage]}
                active={transcriptionResults?.text && !(translationResults && translationResults[processingOptions.targetLanguage])}
                index={2}
              >
                <div className="icon">
                  {(translationResults && translationResults[processingOptions.targetLanguage]) ? <FaCheck /> : <FaLanguage />}
                </div>
                <div className="content">
                  <div className="title">🌐 번역</div>
                  <div className="description">
                    {(translationResults && translationResults[processingOptions.targetLanguage])
                      ? '✅ 완료'
                      : '⏳ 진행중...'
                    }
                  </div>
                  <div className="progress-text">
                    {transcriptionResults?.text && !(translationResults && translationResults[processingOptions.targetLanguage]) && 'AI가 번역 중입니다...'}
                  </div>
                </div>
              </ProcessingStep>
            )}
          </ProcessingContainer>
        </StepContent>
      )}

      {/* Step 4: 노트 저장 */}
      {activeStep === 4 && (
        <StepContent>
          <StepTitle>노트 저장</StepTitle>
          
          <NoteEditSection>
            <InputGroup>
              <label>제목</label>
              <input
                type="text"
                value={noteData.title}
                onChange={(e) => setNoteData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="노트 제목을 입력하세요"
              />
            </InputGroup>

            <InputGroup>
              <label>카테고리</label>
              <select
                value={noteData.category}
                onChange={(e) => setNoteData(prev => ({ ...prev, category: e.target.value }))}
              >
                <option value="basic">강의(학습)</option>
                <option value="study">아이디어</option>
                <option value="meeting">일정</option>
                <option value="personal">메모</option>
              </select>
            </InputGroup>

            <InputGroup>
              <label>태그</label>
              <TagInput>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="태그를 입력하세요"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                />
                <button onClick={handleAddTag}>
                  <FaPlus />
                </button>
              </TagInput>
              <TagContainer>
                {noteData.tags.map((tag, index) => (
                  <Tag key={index}>
                    <FaTag />
                    {tag}
                    <span className="remove" onClick={() => handleRemoveTag(tag)}>×</span>
                  </Tag>
                ))}
              </TagContainer>
            </InputGroup>

            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ marginBottom: '15px', color: colors.darkGray }}>미리보기</h4>
              
              <PreviewTabs>
                {getAvailableTabs().map(tab => (
                  <PreviewTab
                    key={tab.id}
                    active={activePreviewTab === tab.id}
                    available={tab.available}
                    onClick={() => tab.available && setActivePreviewTab(tab.id)}
                  >
                    <span>{tab.label}</span>
                    {tab.count > 0 && (
                      <span className="badge">{tab.count}</span>
                    )}
                  </PreviewTab>
                ))}
              </PreviewTabs>

              <PreviewContent>
                {renderPreviewContent()}
              </PreviewContent>
            </div>

            <ButtonGroup>
              <ActionButton onClick={() => setActiveStep(3)}>
                <FaArrowLeft />
                이전
              </ActionButton>
              <ActionButton onClick={handleSaveNote} disabled={loading}>
                <FaSave />
                {loading ? '저장 중...' : '노트 저장'}
              </ActionButton>
            </ButtonGroup>
          </NoteEditSection>
        </StepContent>
      )}

      {/* 오류 메시지 */}
      {error && (
        <div style={{
          background: '#ffebee',
          border: '1px solid #ffcdd2',
          borderRadius: '8px',
          padding: '15px',
          margin: '20px 0',
          color: '#c62828',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}

      {/* 성공 메시지 */}
      {message && !error && (
        <div style={{
          background: '#e8f5e8',
          border: '1px solid #c8e6c9',
          borderRadius: '8px',
          padding: '15px',
          margin: '20px 0',
          color: '#2e7d32',
          textAlign: 'center'
        }}>
          {message}
        </div>
      )}
    </Container>
  );
};

export default VoiceUpload;