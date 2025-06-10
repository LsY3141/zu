import React, { useState, useEffect, useRef } from 'react';
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
  createNoteFromTranscription
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
  margin: 0 15px;
  
  @media (max-width: 768px) {
    width: 20px;
    margin: 0 10px;
  }
`;

const SectionCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
  
  @media (max-width: 768px) {
    padding: 20px;
    margin-bottom: 20px;
  }
`;

const FileUploadZone = styled.div`
  border: 3px dashed ${props => props.isDragging ? colors.primary : colors.lightGray};
  border-radius: 20px;
  padding: 60px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.isDragging ? `${colors.primary}10` : 'transparent'};
  
  &:hover {
    border-color: ${colors.primary};
    background: ${colors.primary}05;
  }
  
  @media (max-width: 768px) {
    padding: 40px 20px;
  }
`;

const SelectedFileInfo = styled.div`
  background: ${colors.primary}10;
  border: 1px solid ${colors.primary};
  border-radius: 12px;
  padding: 20px;
  margin-top: 20px;
  text-align: center;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: ${colors.lightGray};
  border-radius: 4px;
  margin: 15px 0;
  overflow: hidden;
  
  .progress {
    height: 100%;
    background: linear-gradient(45deg, ${colors.primary}, ${colors.secondary});
    transition: width 0.3s ease;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 20px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;

const ActionButton = styled.button`
  background: ${props => props.disabled ? colors.lightGray : `linear-gradient(45deg, ${colors.primary}, ${colors.secondary})`};
  color: ${props => props.disabled ? colors.darkGray : 'white'};
  border: none;
  border-radius: 12px;
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: 600;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 123, 255, 0.3);
  }
  
  svg {
    font-size: 1.1rem;
  }
`;

const OptionCard = styled.div`
  background: white;
  border: 2px solid ${props => props.selected ? colors.primary : colors.lightGray};
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: ${colors.primary};
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }
`;

const LanguageSelect = styled.select`
  width: 100%;
  padding: 12px;
  border: 1px solid ${colors.lightGray};
  border-radius: 8px;
  font-size: 1rem;
  margin-top: 12px;
  
  &:focus {
    outline: none;
    border-color: ${colors.primary};
  }
`;

const ProcessingStatus = styled.div`
  .status-item {
    background: white;
    padding: 16px;
    border-radius: 8px;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 12px;
    border-left: 4px solid ${colors.lightGray};
    
    &.completed {
      border-left-color: ${colors.success};
    }
    
    &.in-progress {
      border-left-color: ${colors.primary};
    }
  }
`;

const FormGroup = styled.div`
  margin-bottom: 24px;
  
  label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: ${colors.darkGray};
  }
  
  input, select, textarea {
    width: 100%;
    padding: 12px;
    border: 1px solid ${colors.lightGray};
    border-radius: 8px;
    font-size: 1rem;
    
    &:focus {
      outline: none;
      border-color: ${colors.primary};
    }
  }
  
  textarea {
    height: 200px;
    resize: vertical;
    font-family: 'Courier New', monospace;
  }
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-height: 40px;
  padding: 8px;
  border: 1px solid ${colors.lightGray};
  border-radius: 8px;
  align-items: center;
`;

const Tag = styled.span`
  background: ${colors.primary};
  color: white;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 6px;
  
  .remove {
    cursor: pointer;
    font-weight: bold;
    
    &:hover {
      color: ${colors.lightGray};
    }
  }
`;

const VoiceUpload = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const { 
    loading, 
    error, 
    message, 
    transcriptionJob, 
    transcriptionResults, 
    analysisResults, 
    translationResults 
  } = useSelector(state => state.speech);

  // 로컬 상태
  const [activeStep, setActiveStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileUploadProgress, setFileUploadProgress] = useState(0);
  const [tagInput, setTagInput] = useState('');
  
  const statusCheckIntervalRef = useRef(null);

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
    category: '기본',
    tags: []
  });

  // 컴포넌트 마운트/언마운트 시 상태 초기화 및 인터벌 정리
  useEffect(() => {
    return () => {
      dispatch(resetSpeechState());
      if (statusCheckIntervalRef.current) {
        clearInterval(statusCheckIntervalRef.current);
        statusCheckIntervalRef.current = null;
      }
    };
  }, [dispatch]);

  // 자동 생성된 내용을 noteData.content에 설정
  useEffect(() => {
    if (transcriptionResults?.text) {
      const autoContent = buildFinalContent();
      setNoteData(prev => ({ ...prev, content: autoContent }));
    }
  }, [transcriptionResults, analysisResults, translationResults, processingOptions]);

  // 파일 업로드 완료 시 다음 단계로
  useEffect(() => {
    if (transcriptionJob && activeStep === 1) {
      setActiveStep(2);
    }
  }, [transcriptionJob, activeStep]);

  // 변환 완료 시 선택된 옵션들 자동 처리 (수정된 버전)
  useEffect(() => {
    if (transcriptionResults && activeStep === 3) {
      console.log('🎯 옵션 처리 시작!', processingOptions);

      const processOptions = async () => {
        try {
          if (processingOptions.summary) {
            console.log('📝 요약 처리 시작');
            await dispatch(analyzeTranscription({
              transcriptionId: transcriptionJob.id,
              options: { summary: true, keyPhrases: true }
            })).unwrap();
            console.log('✅ 요약 처리 완료');
          }

          if (processingOptions.translation) {
            console.log('🌐 번역 처리 시작:', processingOptions.targetLanguage);
            await dispatch(translateTranscription({
              transcriptionId: transcriptionJob.id,
              targetLanguage: processingOptions.targetLanguage
            })).unwrap();
            console.log('✅ 번역 처리 완료');
          }

          // 처리 완료 후 다음 단계로
          setTimeout(() => {
            setActiveStep(4);
          }, 1000);
        } catch (error) {
          console.error('❌ 옵션 처리 오류:', error);
          dispatch(showNotification({
            message: `옵션 처리 중 오류: ${error.message || '알 수 없는 오류'}`,
            type: 'error',
          }));
        }
      };

      processOptions();
    }
  }, [transcriptionResults, activeStep, processingOptions, transcriptionJob?.id, dispatch]);

  // 상태 체크 인터벌 관리
  useEffect(() => {
    if (activeStep === 3 && transcriptionJob?.status === 'IN_PROGRESS') {
      if (!statusCheckIntervalRef.current) {
        statusCheckIntervalRef.current = setInterval(() => {
          dispatch(checkTranscriptionStatus(transcriptionJob.id));
        }, 3000);
      }
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

  // Redux 상태 변화 감지용 로그
  useEffect(() => {
    console.log('🔄 Redux 상태:', {
      loading, error, message,
      translationResults: translationResults
    });
  }, [loading, error, message, translationResults]);

  // 메시지 알림 처리
  useEffect(() => {
    if (message && !message.includes('노트가 성공적으로')) {
      dispatch(showNotification({
        message,
        type: 'success',
      }));
    }
  }, [message, dispatch]);

  // 에러 처리
  useEffect(() => {
    if (error) {
      dispatch(showNotification({
        message: error,
        type: 'error',
      }));
    }
  }, [error, dispatch]);

  // 파일 변경 핸들러
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
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
          setFileUploadProgress(percentCompleted);
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

  // 최종 컨텐츠 생성 (수정된 버전)
  const buildFinalContent = () => {
    let content = '';
    
    // 기본 텍스트 변환 결과
    if (transcriptionResults?.text) {
      content += `## 📝 텍스트 변환 결과\n\n${transcriptionResults.text}\n\n`;
    }
    
    // 요약 결과
    if (analysisResults?.summary) {
      content += `## 📊 요약\n\n${analysisResults.summary}\n\n`;
    }
    
    // 핵심 키워드
    if (analysisResults?.keyPhrases && analysisResults.keyPhrases.length > 0) {
      content += `## 🔑 핵심 키워드\n\n${analysisResults.keyPhrases.join(', ')}\n\n`;
    }
    
    // 번역 결과 (수정된 부분)
    if (processingOptions.translation && translationResults) {
      const targetLang = processingOptions.targetLanguage;
      const translationData = translationResults[targetLang];
      
      if (translationData) {
        const languageNames = {
          'en': '영어', 'ja': '일본어', 'zh': '중국어',
          'es': '스페인어', 'fr': '프랑스어', 'de': '독일어'
        };
        const languageName = languageNames[targetLang] || targetLang;
        
        // 다양한 구조에 대응
        const translatedText = translationData.translation || translationData.translatedText || translationData;
        
        if (translatedText) {
          content += `## 🌐 번역 결과 (${languageName})\n\n${translatedText}\n\n`;
        }
      }
    }
    
    return content;
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
    if (!transcriptionJob || !noteData.title.trim()) {
      dispatch(showNotification({
        message: '제목을 입력해주세요.',
        type: 'error'
      }));
      return;
    }

    try {
      await dispatch(createNoteFromTranscription({
        transcriptionId: transcriptionJob.id,
        noteData: {
          ...noteData,
          content: noteData.content || buildFinalContent()
        }
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
    }
  };

  // 파일 크기 포맷팅
  const fileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

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
          <FaFileAlt className="icon" />
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
            <div style={{ fontSize: '0.9rem', color: colors.lightGray }}>
              {t('voice.upload.formats')}
            </div>
          </FileUploadZone>

          <input
            id="file-upload"
            type="file"
            accept=".mp3,.wav,.m4a"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />

          {selectedFile && (
            <SelectedFileInfo>
              <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '10px' }}>
                {t('voice.upload.selectedFile', { filename: selectedFile.name })}
              </div>
              <div style={{ color: colors.darkGray }}>
                {t('voice.upload.size', { size: fileSize(selectedFile.size) })}
              </div>
              
              {fileUploadProgress > 0 && (
                <ProgressBar>
                  <div className="progress" style={{ width: `${fileUploadProgress}%` }} />
                </ProgressBar>
              )}
              
              <ButtonGroup>
                <ActionButton onClick={handleFileUpload} disabled={loading}>
                  <FaUpload />
                  {loading ? t('voice.upload.uploading') : t('voice.upload.start')}
                </ActionButton>
              </ButtonGroup>
            </SelectedFileInfo>
          )}
        </SectionCard>
      )}

      {activeStep === 2 && (
        <SectionCard>
          <h2 style={{ textAlign: 'center', marginBottom: '30px', color: colors.darkGray }}>
            {t('voice.options.title')}
          </h2>
          <p style={{ textAlign: 'center', marginBottom: '40px', color: colors.darkGray }}>
            {t('voice.options.subtitle')}
          </p>

          {/* 요약 옵션 */}
          <OptionCard 
            selected={processingOptions.summary}
            onClick={() => handleOptionToggle('summary')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <input 
                type="checkbox" 
                checked={processingOptions.summary}
                onChange={() => handleOptionToggle('summary')}
                style={{ transform: 'scale(1.2)' }}
              />
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600' }}>
                  {t('voice.options.summary.title')}
                </h3>
                <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem', color: colors.darkGray }}>
                  {t('voice.options.summary.description')}
                </p>
              </div>
            </div>
          </OptionCard>

          {/* 번역 옵션 */}
          <OptionCard 
            selected={processingOptions.translation}
            onClick={() => handleOptionToggle('translation')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <input 
                type="checkbox" 
                checked={processingOptions.translation}
                onChange={() => handleOptionToggle('translation')}
                style={{ transform: 'scale(1.2)' }}
              />
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600' }}>
                  {t('voice.options.translation.title')}
                </h3>
                <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem', color: colors.darkGray }}>
                  {t('voice.options.translation.description')}
                </p>
              </div>
            </div>
            
            {processingOptions.translation && (
              <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #e9ecef' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  {t('voice.options.translation.selectLanguage')}
                </label>
                <LanguageSelect 
                  value={processingOptions.targetLanguage}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value="en">{t('voice.options.translation.languages.en')}</option>
                  <option value="ja">{t('voice.options.translation.languages.ja')}</option>
                  <option value="zh">{t('voice.options.translation.languages.zh')}</option>
                  <option value="es">{t('voice.options.translation.languages.es')}</option>
                  <option value="fr">{t('voice.options.translation.languages.fr')}</option>
                  <option value="de">{t('voice.options.translation.languages.de')}</option>
                </LanguageSelect>
              </div>
            )}
          </OptionCard>

          <ButtonGroup>
            <ActionButton onClick={() => setActiveStep(1)}>
              <FaArrowLeft />
              {t('voice.options.actions.previous')}
            </ActionButton>
            <ActionButton onClick={handleStartProcessing}>
              <FaArrowRight />
              {t('voice.options.actions.startProcessing')}
            </ActionButton>
          </ButtonGroup>
        </SectionCard>
      )}

      {activeStep === 3 && (
        <SectionCard>
          <h2 style={{ textAlign: 'center', marginBottom: '30px', color: colors.darkGray }}>
            {t('voice.processing.title')}
          </h2>

          {/* 처리 상태 표시 */}
          <ProcessingStatus>
            {/* 텍스트 변환 상태 */}
            <div className={`status-item ${transcriptionResults ? 'completed' : 'in-progress'}`}>
              {t('voice.processing.transcribing', {
                status: transcriptionResults ? t('voice.processing.status.completed') : t('voice.processing.status.inProgress')
              })}
              {!transcriptionResults && (
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid #e9ecef',
                  borderTop: '2px solid #007bff',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
              )}
            </div>

            {/* 요약 생성 상태 */}
            {processingOptions.summary && (
              <div className={`status-item ${analysisResults ? 'completed' : 'in-progress'}`}>
                {t('voice.processing.analyzing', {
                  status: analysisResults ? t('voice.processing.status.completed') : t('voice.processing.status.inProgress')
                })}
                {!analysisResults && transcriptionResults && (
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid #e9ecef',
                    borderTop: '2px solid #007bff',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                )}
              </div>
            )}

            {/* 번역 상태 */}
            {processingOptions.translation && (
              <div className={`status-item ${(translationResults && translationResults[processingOptions.targetLanguage]) ? 'completed' : 'in-progress'}`}>
                {t('voice.processing.translating', {
                  status: (translationResults && translationResults[processingOptions.targetLanguage]) 
                    ? t('voice.processing.status.completed') 
                    : t('voice.processing.status.inProgress')
                })}
                {(!translationResults || !translationResults[processingOptions.targetLanguage]) && transcriptionResults && (
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid #e9ecef',
                    borderTop: '2px solid #007bff',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                )}
              </div>
            )}
          </ProcessingStatus>

          {/* 처리 완료된 결과들 미리보기 */}
          
          {/* 텍스트 변환 결과 */}
          {transcriptionResults && (
            <div style={{ marginTop: '30px' }}>
              <h3 style={{ margin: '0 0 15px 0', color: colors.darkGray }}>📝 텍스트 변환 결과</h3>
              <div style={{
                background: 'white',
                padding: '15px',
                borderRadius: '8px',
                maxHeight: '200px',
                overflow: 'auto',
                fontSize: '14px',
                lineHeight: '1.5',
                border: '1px solid #e9ecef'
              }}>
                {transcriptionResults.text}
              </div>
            </div>
          )}

          {/* 요약 결과 */}
          {processingOptions.summary && analysisResults && (
            <div style={{ marginTop: '20px' }}>
              <h3 style={{ margin: '0 0 15px 0', color: colors.darkGray }}>📊 요약 결과</h3>
              <div style={{
                background: 'white',
                padding: '15px',
                borderRadius: '8px',
                fontSize: '14px',
                lineHeight: '1.5',
                border: '1px solid #e9ecef'
              }}>
                {analysisResults.summary}
              </div>
              
              {analysisResults.keyPhrases && analysisResults.keyPhrases.length > 0 && (
                <div style={{ marginTop: '15px' }}>
                  <h4 style={{ margin: '0 0 10px 0', color: colors.darkGray }}>🔑 핵심 키워드</h4>
                  <div style={{
                    background: '#f8f9fa',
                    padding: '10px',
                    borderRadius: '6px',
                    fontSize: '13px'
                  }}>
                    {analysisResults.keyPhrases.join(', ')}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 번역 결과 표시 - 수정된 부분 */}
          {processingOptions.translation && translationResults && (
            (() => {
              const targetLang = processingOptions.targetLanguage;
              const translationData = translationResults[targetLang];
              const translatedText = translationData?.translation || 
                                     translationData?.translatedText || 
                                     translationData;
              
              if (translatedText) {
                return (
                  <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '20px',
                    margin: '20px 0',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                    borderLeft: '4px solid #28a745'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '15px',
                      paddingBottom: '10px',
                      borderBottom: '1px solid #e9ecef'
                    }}>
                      <h3 style={{ margin: 0, color: colors.darkGray }}>🌐 번역 결과</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{
                          background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                          color: 'white',
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {t(`voice.options.translation.languages.${targetLang}`)}
                        </span>
                        <button 
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(translatedText);
                              dispatch(showNotification({
                                message: '번역 결과가 복사되었습니다.',
                                type: 'success'
                              }));
                            } catch (error) {
                              console.error('복사 실패:', error);
                            }
                          }}
                          style={{
                            background: '#007bff',
                            color: 'white',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            transition: 'background 0.2s'
                          }}
                          onMouseOver={(e) => e.target.style.background = '#0056b3'}
                          onMouseOut={(e) => e.target.style.background = '#007bff'}
                        >
                          복사
                        </button>
                      </div>
                    </div>
                    <div style={{
                      fontSize: '14px',
                      lineHeight: '1.6',
                      color: '#333',
                      whiteSpace: 'pre-wrap',
                      background: '#f8f9fa',
                      padding: '15px',
                      borderRadius: '8px'
                    }}>
                      {translatedText}
                    </div>
                  </div>
                );
              }
              return null;
            })()
          )}

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
              placeholder="노트 제목을 입력하세요"
            />
          </FormGroup>

          <FormGroup>
            <label>{t('voice.save.categoryLabel')}</label>
            <select
              value={noteData.category}
              onChange={(e) => setNoteData(prev => ({ ...prev, category: e.target.value }))}
            >
              <option value="기본">기본</option>
              <option value="회의">회의</option>
              <option value="강의">강의</option>
              <option value="개인">개인</option>
              <option value="기타">기타</option>
            </select>
          </FormGroup>

          {/* 태그 입력 섹션 */}
          <FormGroup>
            <label>{t('editor.fields.tags.label')}</label>
            
            {/* 기존 태그 표시 */}
            <TagsContainer>
              {noteData.tags.length === 0 ? (
                <span style={{ color: colors.lightGray }}>
                  {t('editor.fields.tags.empty')}
                </span>
              ) : (
                noteData.tags.map(tag => (
                  <Tag key={tag}>
                    {tag}
                    <span className="remove" onClick={() => handleRemoveTag(tag)}>×</span>
                  </Tag>
                ))
              )}
            </TagsContainer>
            
            {/* 새 태그 입력 */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder={t('editor.fields.tags.placeholder')}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                style={{ flex: 1 }}
              />
              <ActionButton onClick={handleAddTag} disabled={!tagInput.trim()}>
                <FaPlus />
                {t('editor.fields.tags.add')}
              </ActionButton>
            </div>
          </FormGroup>

          <FormGroup>
            <label>{t('voice.save.contentPreview')}</label>
            <textarea
              value={noteData.content}
              onChange={(e) => setNoteData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="자동 생성된 내용을 확인하고 수정하세요..."
            />
          </FormGroup>

          <ButtonGroup>
            <ActionButton onClick={() => setActiveStep(2)}>
              <FaArrowLeft />
              {t('voice.save.actions.editOptions')}
            </ActionButton>
            <ActionButton 
              onClick={handleSaveNote}
              disabled={loading || !noteData.title.trim()}
            >
              <FaSave />
              {loading ? t('voice.save.actions.saving') : t('voice.save.actions.saveNote')}
            </ActionButton>
          </ButtonGroup>
        </SectionCard>
      )}
    </Container>
  );
};

export default VoiceUpload;