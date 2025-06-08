import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styled, { keyframes } from 'styled-components';
import {
  FaMicrophone,
  FaStop,
  FaUpload,
  FaPlay,
  FaTrash,
  FaCheck,
  FaLanguage,
  FaFileAlt, // FaFileText 또는 FaFileTextAlt 대신 FaFileAlt 사용
  FaArrowRight,
  FaArrowLeft
} from 'react-icons/fa';
import {
  uploadSpeechFile,
  resetSpeechState,
  checkTranscriptionStatus,
  analyzeTranscription,
  translateTranscription,
  createNoteFromTranscription // speechSlice.js에 이 이름으로 존재함을 확인
} from '../redux/slices/speechSlice';
import { showNotification } from '../redux/slices/uiSlice';
import theme from '../styles/theme'; // theme 객체 전체를 임포트

// theme 객체에서 colors를 구조 분해 할당
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

const SectionCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -50px;
    right: -50px;
    width: 100px;
    height: 100px;
    background: ${colors.primary};
    opacity: 0.05;
    border-radius: 50%;
    animation: ${float} 4s ease-in-out infinite;
  }
  
  @media (max-width: 768px) {
    padding: 20px;
  }
`;

// 옵션 선택 카드 스타일
const OptionsCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
  
  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const OptionsTitle = styled.h2`
  color: ${colors.darkGray};
  margin-bottom: 30px;
  text-align: center;
  font-size: 1.8rem;
  font-weight: bold;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
    margin-bottom: 20px;
  }
`;

const OptionItem = styled.div`
  display: flex;
  align-items: center;
  padding: 20px;
  border: 2px solid ${props => props.selected ? colors.primary : colors.lightGray};
  border-radius: 12px;
  margin-bottom: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.selected ? colors.primary + '10' : 'white'};
  
  &:hover {
    border-color: ${colors.primary};
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
  
  @media (max-width: 768px) {
    padding: 15px;
    flex-direction: column;
    align-items: flex-start;
  }
`;

const OptionCheckbox = styled.div`
  width: 24px;
  height: 24px;
  border: 2px solid ${props => props.checked ? colors.primary : colors.lightGray};
  border-radius: 6px;
  margin-right: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.checked ? colors.primary : 'white'};
  color: white;
  font-size: 14px;
  flex-shrink: 0;
  
  @media (max-width: 768px) {
    margin-right: 0;
    margin-bottom: 10px;
  }
`;

const OptionContent = styled.div`
  flex: 1;
`;

const OptionTitle = styled.h3`
  color: ${colors.darkGray};
  margin: 0 0 5px 0;
  font-size: 1.2rem;
  font-weight: bold;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const OptionDescription = styled.p`
  color: ${colors.darkGray};
  margin: 0;
  opacity: 0.7;
  font-size: 0.9rem;
  line-height: 1.4;
  
  @media (max-width: 768px) {
    font-size: 0.85rem;
  }
`;

const LanguageSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid ${colors.lightGray};
  border-radius: 6px;
  margin-left: 15px;
  background: white;
  color: ${colors.darkGray};
  font-size: 0.9rem;
  min-width: 120px;
  
  @media (max-width: 768px) {
    margin-left: 0;
    margin-top: 10px;
    width: 100%;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 15px;
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 10px;
  background: ${props => props.primary ? colors.primary : colors.lightGray};
  color: ${props => props.primary ? 'white' : colors.darkGray};
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
  min-width: 140px;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    background: ${props => props.primary ? colors.primaryDark || '#0056b3' : colors.mediumGray || '#ddd'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
  
  @media (max-width: 768px) {
    width: 100%;
    padding: 15px 20px;
  }
`;

const FileUploadZone = styled.div`
  border: 2px dashed ${props => props.isDragging ? colors.primary : colors.lightGray};
  border-radius: 15px;
  padding: 60px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.isDragging ? colors.primary + '10' : 'transparent'};
  
  &:hover {
    border-color: ${colors.primary};
    background: ${colors.primary + '05'};
  }
  
  @media (max-width: 768px) {
    padding: 40px 15px;
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: ${colors.lightGray};
  border-radius: 4px;
  overflow: hidden;
  margin: 20px 0;
  
  &::after {
    content: '';
    display: block;
    height: 100%;
    width: ${props => props.progress}%;
    background: linear-gradient(90deg, ${colors.primary}, ${colors.primaryLight || '#4dabf7'});
    transition: width 0.3s ease;
    border-radius: 4px;
  }
`;

const ProcessingStatus = styled.div`
  text-align: center;
  padding: 20px;
  
  .status-item {
    margin: 15px 0;
    font-size: 1.1rem;
    color: ${colors.darkGray};
    
    &.completed {
      color: ${colors.success || '#28a745'};
    }
    
    &.in-progress {
      color: ${colors.primary};
      animation: ${pulse} 2s infinite;
    }
  }
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
  
  label {
    display: block;
    margin-bottom: 8px;
    font-weight: bold;
    color: ${colors.darkGray};
  }
  
  input, select, textarea {
    width: 100%;
    padding: 12px;
    border: 1px solid ${colors.lightGray};
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.3s ease;
    
    &:focus {
      outline: none;
      border-color: ${colors.primary};
      box-shadow: 0 0 0 3px ${colors.primary + '20'};
    }
  }
  
  textarea {
    min-height: 120px;
    resize: vertical;
  }
`;

const ContentPreview = styled.div`
  padding: 15px;
  border: 1px solid ${colors.lightGray};
  border-radius: 8px;
  background: ${colors.lightGray + '20'};
  max-height: 300px;
  overflow: auto;
  white-space: pre-wrap;
  font-family: inherit;
  line-height: 1.6;
  
  @media (max-width: 768px) {
    max-height: 200px;
    font-size: 0.9rem;
  }
`;

const VoiceUpload = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    loading,
    error,
    message,
    transcriptionJob,
    transcriptionResults,
    analysisResults,
    translationResults
  } = useSelector(state => state.speech);

  // 상태 관리
  const [activeStep, setActiveStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null); // 현재 사용되지 않음
  const [isDragging, setIsDragging] = useState(false);
  const [statusCheckInterval, setStatusCheckInterval] = useState(null);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [fileUploadProgress, setFileUploadProgress] = useState(0);

  // 옵션 선택 상태
  const [processingOptions, setProcessingOptions] = useState({
    summary: false,
    translation: false,
    targetLanguage: 'en'
  });

  // 노트 데이터
  const [noteData, setNoteData] = useState({
    title: '',
    content: '',
    category: '기본', // ko.json에 맞게 "기본"으로 초기화
    tags: []
  });

  // 컴포넌트 마운트/언마운트 시 상태 초기화
  useEffect(() => {
    return () => {
      dispatch(resetSpeechState());
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
      }
    };
  }, [dispatch, statusCheckInterval]);

  // 옵션 토글 핸들러
  const handleOptionToggle = (option) => {
    setProcessingOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  // 언어 선택 핸들러
  const handleLanguageChange = (e) => {
    setProcessingOptions(prev => ({
      ...prev,
      targetLanguage: e.target.value
    }));
  };

  // 파일 관련 핸들러들
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

  // 파일 크기 포맷팅
  const fileSize = (bytes) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)}MB`;
  };

  // 파일 업로드 핸들러
  const handleFileUpload = () => {
    if (selectedFile) {
      const formData = new FormData();
      formData.append('file', selectedFile);

      setFileUploadProgress(0);

      dispatch(uploadSpeechFile({
        formData,
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setFileUploadProgress(percentCompleted);
        }
      }))
        .then((result) => {
          if (result.meta.requestStatus === 'fulfilled') {
            setFileUploadProgress(100);
            setTimeout(() => {
              setActiveStep(2); // 옵션 선택 단계로 이동
            }, 500);
          }
        })
        .catch(() => {
          setFileUploadProgress(0);
        });
    }
  };

  // 옵션 확인 후 처리 시작
  const handleStartProcessing = () => {
    setActiveStep(3); // 처리 단계로 이동
    // Transcribe는 업로드 시 이미 시작되었으므로 상태만 확인
  };

  // 트랜스크립션 결과 처리 및 노트 데이터 업데이트
  useEffect(() => {
    if (transcriptionResults && transcriptionResults.text && activeStep >= 3) {
      const titleText = transcriptionResults.text.substring(0, 20) || t('voice.recording.title');

      setNoteData(prev => ({
        ...prev,
        title: `${titleText}${titleText.length >= 20 ? '...' : ''}`,
        content: transcriptionResults.text || '', // transcriptionResults.text를 noteData.content로 설정
      }));

      // 선택된 옵션에 따라 추가 처리 실행 (activeStep이 3일 때만)
      if (activeStep === 3 && transcriptionJob?.id) { // transcriptionJob.id가 존재할 때만 실행
        if (processingOptions.summary) {
          dispatch(analyzeTranscription({
            transcriptionId: transcriptionJob.id,
            options: { summary: true, keywords: true }
          }));
        }

        if (processingOptions.translation) {
          dispatch(translateTranscription({
            transcriptionId: transcriptionJob.id,
            targetLanguage: processingOptions.targetLanguage
          }));
        }

        // 옵션이 없으면 바로 노트 저장 단계로
        if (!processingOptions.summary && !processingOptions.translation) {
          setActiveStep(4);
        }
      }
    }
  }, [transcriptionResults, activeStep, processingOptions, transcriptionJob, dispatch, t]);


  // 분석 및 번역 완료 확인 -> 노트 저장 단계로 이동
  useEffect(() => {
    if (activeStep === 3 && transcriptionResults) {
      const needsSummary = processingOptions.summary;
      const needsTranslation = processingOptions.translation;

      // analysisResults나 translationResults가 존재하고, 각각 summary/text 속성이 있는지를 확인
      const hasSummary = !needsSummary || (analysisResults && analysisResults.summary);
      const hasTranslation = !needsTranslation || (translationResults && translationResults[processingOptions.targetLanguage]);

      if (hasSummary && hasTranslation) {
        setActiveStep(4); // 노트 저장 단계로 이동
      }
    }
  }, [analysisResults, translationResults, activeStep, processingOptions, transcriptionResults]);

  // 트랜스크립션 상태 체크
  useEffect(() => {
    // transcriptionJob과 그 id가 유효하고, 진행 중인 상태일 때만 인터벌 시작
    if (transcriptionJob?.id && transcriptionJob.status === 'IN_PROGRESS' && activeStep === 3) {
      if (!checkingStatus) {
        setCheckingStatus(true);
        const interval = setInterval(() => {
          dispatch(checkTranscriptionStatus(transcriptionJob.id));
        }, 3000);
        setStatusCheckInterval(interval);
      }
    } else if (transcriptionJob?.id &&
               (transcriptionJob.status === 'COMPLETED' ||
                transcriptionJob.status === 'FAILED')) {
      // 작업이 완료되거나 실패하면 인터벌 클리어
      setCheckingStatus(false);
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
        setStatusCheckInterval(null);
      }
    }
    // 클린업 함수는 컴포넌트 언마운트나 의존성 변경 시 인터벌을 정리
    return () => {
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
      }
    };
  }, [transcriptionJob?.status, checkingStatus, dispatch, activeStep, transcriptionJob?.id]);


  // 메시지 알림 처리 (성공 메시지는 노트 저장 시 별도로 처리)
  useEffect(() => {
    if (message && !message.includes('노트가 성공적으로')) { // 노트 저장 성공 메시지는 제외
      dispatch(showNotification({
        message,
        type: 'success',
      }));
    }
  }, [message, dispatch]);

  // 노트 저장
  const handleSaveNote = () => {
    // transcriptionJob이 null이거나 id가 없는 경우를 대비하여 방어 코드 추가
    if (!transcriptionJob || !transcriptionJob.id) {
        dispatch(showNotification({
            message: t('voice.error.transcriptionJobMissing'),
            type: 'error',
        }));
        return; // 함수 실행 중단
    }

    const finalContent = buildFinalContent();

    dispatch(createNoteFromTranscription({
      transcriptionId: transcriptionJob.id,
      title: noteData.title,
      content: finalContent,
      category: noteData.category,
      tags: noteData.tags
    })).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        dispatch(showNotification({ // 노트 저장 성공 알림
          message: t('voice.save.actions.savedSuccessfully'),
          type: 'success'
        }));
        navigate('/notes');
      }
    });
  };

  // 최종 노트 내용 구성
  const buildFinalContent = () => {
    // transcriptionResults가 null이거나 text 속성이 없는 경우를 대비하여 기본값 설정
    let content = transcriptionResults?.text || ''; // 옵셔널 체이닝과 기본값 설정

    if (processingOptions.summary && analysisResults) {
        content += '\n\n## ' + t('voice.analysis.summary') + '\n' + (analysisResults.summary || ''); // summary가 null일 경우 대비

        if (analysisResults.keywords && analysisResults.keywords.length > 0) { // keywords 배열이 있고 비어있지 않은지 확인
            content += '\n\n\n## ' + t('voice.analysis.keywords') + '\n' + analysisResults.keywords.join(', ');
        }
    }

    if (processingOptions.translation && translationResults) {
        const languageNames = {
            'en': t('voice.options.translation.languages.en'),
            'ja': t('voice.options.translation.languages.ja'),
            'zh': t('voice.options.translation.languages.zh'),
            'es': t('voice.options.translation.languages.es'),
            'fr': t('voice.options.translation.languages.fr'),
            'de': t('voice.options.translation.languages.de')
        };

        // translationResults에 해당 targetLanguage의 텍스트가 있는지 확인
        const translatedText = translationResults[processingOptions.targetLanguage];
        if (translatedText) {
            content += `\n\n\n## ${languageNames[processingOptions.targetLanguage]} ${t('voice.translation.title')}\n` + translatedText;
        }
    }

    // 만약 content가 비어있다면, 사용자에게 내용이 없음을 알리거나 기본 텍스트 제공
    if (!content.trim()) {
        content = t('voice.save.noContentAvailable');
    }

    return content;
  };

  // 에러 처리
  useEffect(() => {
    if (error) {
      dispatch(showNotification({
        message: error,
        type: 'error',
      }));
    }
  }, [error, dispatch]);

  return (
    <Container>
      {/* 단계 표시기 */}
      <StepIndicator>
        <Step active={activeStep === 1}>
          <FaUpload className="icon" />
          {t('voice.steps.upload')}
        </Step>
        <StepConnector completed={activeStep > 1} />
        <Step active={activeStep === 2}>
          <FaCheck className="icon" />
          {t('voice.steps.options')}
        </Step>
        <StepConnector completed={activeStep > 2} />
        <Step active={activeStep === 3}>
          <FaFileAlt className="icon" /> {/* FaFileText 대신 FaFileAlt 사용 */}
          {t('voice.steps.process')}
        </Step>
        <StepConnector completed={activeStep > 3} />
        <Step active={activeStep === 4}>
          <FaCheck className="icon" />
          {t('voice.steps.save')}
        </Step>
      </StepIndicator>

      {/* 단계별 컨텐츠 */}
      {activeStep === 1 && (
        <SectionCard>
          <h2 style={{ textAlign: 'center', marginBottom: '30px', color: colors.darkGray }}>
            {t('voice.upload.title')}
          </h2>

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
              {t('voice.upload.description')}
            </div>
            <div style={{ fontSize: '0.9rem', color: colors.darkGray, opacity: 0.7 }}>
              {t('voice.upload.formats')}
            </div>

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
                  {t('voice.upload.selectedFile', { filename: selectedFile.name })}
                </div>
                <div style={{ color: colors.darkGray, opacity: 0.8 }}>
                  {t('voice.upload.size', { size: fileSize(selectedFile.size) })}
                </div>
              </div>

              {loading && fileUploadProgress > 0 && (
                <ProgressBar progress={fileUploadProgress} />
              )}

              <ActionButton
                onClick={handleFileUpload}
                disabled={loading}
                primary
              >
                <FaUpload />
                {loading ? t('voice.upload.uploading') : t('voice.upload.start')}
              </ActionButton>
            </div>
          )}
        </SectionCard>
      )}

      {activeStep === 2 && (
        <OptionsCard>
          <OptionsTitle>{t('voice.options.title')}</OptionsTitle>

          <OptionItem
            selected={processingOptions.summary}
            onClick={() => handleOptionToggle('summary')}
          >
            <OptionCheckbox checked={processingOptions.summary}>
              {processingOptions.summary && <FaCheck />}
            </OptionCheckbox>
            <OptionContent>
              <OptionTitle>{t('voice.options.summary.title')}</OptionTitle>
              <OptionDescription>
                {t('voice.options.summary.description')}
              </OptionDescription>
            </OptionContent>
          </OptionItem>

          <OptionItem
            selected={processingOptions.translation}
            onClick={() => handleOptionToggle('translation')}
          >
            <OptionCheckbox checked={processingOptions.translation}>
              {processingOptions.translation && <FaCheck />}
            </OptionCheckbox>
            <OptionContent>
              <OptionTitle>{t('voice.options.translation.title')}</OptionTitle>
              <OptionDescription>
                {t('voice.options.translation.description')}
              </OptionDescription>
            </OptionContent>
            {processingOptions.translation && (
              <LanguageSelect
                value={processingOptions.targetLanguage}
                onChange={handleLanguageChange}
              >
                <option value="en">{t('voice.options.translation.languages.en')}</option>
                <option value="ja">{t('voice.options.translation.languages.ja')}</option>
                <option value="zh">{t('voice.options.translation.languages.zh')}</option>
                <option value="es">{t('voice.options.translation.languages.es')}</option>
                <option value="fr">{t('voice.options.translation.languages.fr')}</option>
                <option value="de">{t('voice.options.translation.languages.de')}</option>
              </LanguageSelect>
            )}
          </OptionItem>

          <ButtonGroup>
            <ActionButton onClick={() => setActiveStep(1)}>
              <FaArrowLeft />
              {t('voice.options.actions.previous')}
            </ActionButton>
            <ActionButton onClick={handleStartProcessing} primary>
              {t('voice.options.actions.startProcessing')}
              <FaArrowRight />
            </ActionButton>
          </ButtonGroup>
        </OptionsCard>
      )}

      {activeStep === 3 && (
        <SectionCard>
          <h2 style={{ textAlign: 'center', marginBottom: '30px', color: colors.darkGray }}>
            {t('voice.processing.title')}
          </h2>

          <ProcessingStatus>
            <div className={`status-item ${transcriptionResults ? 'completed' : 'in-progress'}`}>
              {t('voice.processing.transcribing', {
                status: transcriptionResults ? t('voice.processing.status.completed') : t('voice.processing.status.inProgress')
              })}
            </div>

            {processingOptions.summary && (
              <div className={`status-item ${analysisResults ? 'completed' : 'in-progress'}`}>
                {t('voice.processing.analyzing', {
                  status: analysisResults ? t('voice.processing.status.completed') : t('voice.processing.status.inProgress')
                })}
              </div>
            )}

            {processingOptions.translation && (
              <div className={`status-item ${translationResults && translationResults[processingOptions.targetLanguage] ? 'completed' : 'in-progress'}`}>
                {t('voice.processing.translating', {
                  status: translationResults && translationResults[processingOptions.targetLanguage] ? t('voice.processing.status.completed') : t('voice.processing.status.inProgress')
                })}
              </div>
            )}
          </ProcessingStatus>
        </SectionCard>
      )}

      {activeStep === 4 && (
        <SectionCard>
          <h2 style={{ textAlign: 'center', marginBottom: '30px', color: colors.darkGray }}>
            {t('voice.save.title')}
          </h2>

          <FormGroup>
            <label>{t('voice.save.titleLabel')}</label>
            <input
              type="text"
              value={noteData.title}
              onChange={(e) => setNoteData(prev => ({ ...prev, title: e.target.value }))}
              placeholder={t('editor.fields.title.placeholder')}
            />
          </FormGroup>

          <FormGroup>
            <label>{t('voice.save.categoryLabel')}</label>
            <select
              value={noteData.category}
              onChange={(e) => setNoteData(prev => ({ ...prev, category: e.target.value }))}
            >
              <option value="기본">{t('notes.categories.basic')}</option>
              <option value="학습">{t('notes.categories.study')}</option>
              <option value="회의">{t('notes.categories.meeting')}</option>
              <option value="개인">{t('notes.categories.personal')}</option>
            </select>
          </FormGroup>

          <FormGroup>
            <label>{t('voice.save.contentPreview')}</label>
            <ContentPreview>
              {buildFinalContent()}
            </ContentPreview>
          </FormGroup>

          <ButtonGroup>
            <ActionButton onClick={() => setActiveStep(2)}>
              <FaArrowLeft />
              {t('voice.save.actions.editOptions')}
            </ActionButton>
            <ActionButton
              onClick={handleSaveNote}
              primary
              disabled={loading || !noteData.title.trim() || !transcriptionJob?.id} // !transcriptionJob?.id 추가
            >
              {loading ? t('voice.save.actions.saving') : t('voice.save.actions.saveNote')}
            </ActionButton>
          </ButtonGroup>
        </SectionCard>
      )}

      {/* 에러 표시 */}
      {error && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#ff4757',
          color: 'white',
          padding: '15px 20px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          zIndex: 1000,
          maxWidth: '400px'
        }}>
          {error}
        </div>
      )}
    </Container>
  );
};

export default VoiceUpload;