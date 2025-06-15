import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next'; // 번역 훅 추가
import styled from 'styled-components';
import { 
  FaArrowLeft, 
  FaSave, 
  FaTimes, 
  FaTag, 
  FaTags,
  FaEdit,
  FaPlus,
  FaFileAlt,
  FaKeyboard,
  FaLightbulb
} from 'react-icons/fa';
import { 
  fetchNoteById, 
  createNote, 
  updateNote, 
  clearCurrentNote,
  clearNoteError,
  clearNoteMessage
} from '../redux/slices/noteSlice';
import { showNotification } from '../redux/slices/uiSlice';
import Button from '../components/shared/Button';
import Input from '../components/shared/Input';
import TextArea from '../components/shared/TextArea';
import Select from '../components/shared/Select';
import Spinner from '../components/shared/Spinner';
import Alert from '../components/shared/Alert';

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

const EditorContainer = styled.div`
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
  gap: 12px;
  align-items: center;
  
  @media (max-width: 768px) {
    justify-content: center;
    flex-wrap: wrap;
  }
`;

const ActionButton = styled(Button)`
  clip-path: ${ClipPath.button};
  font-weight: 600 !important;
  transition: all 0.3s ease !important;
  
  &.back-button {
    background: linear-gradient(135deg, ${colors.lightGray} 0%, ${colors.white} 100%) !important;
    border: 2px solid ${colors.lightGray} !important;
    color: ${colors.darkGray} !important;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
    
    &:hover:not(:disabled) {
      background: linear-gradient(135deg, ${colors.cyan}20, ${colors.lime}20) !important;
      border-color: ${colors.cyan} !important;
      color: ${colors.cyan} !important;
      transform: translateY(-2px) !important;
    }
  }
  
  &.cancel-button {
    background: transparent !important;
    border: 2px solid ${colors.lightGray} !important;
    color: ${colors.darkGray} !important;
    
    &:hover:not(:disabled) {
      background: ${colors.magenta}10 !important;
      border-color: ${colors.magenta} !important;
      color: ${colors.magenta} !important;
      transform: translateY(-2px) !important;
    }
  }
  
  &.save-button {
    background: linear-gradient(135deg, ${colors.magenta} 0%, ${colors.cyan} 100%) !important;
    border: none !important;
    color: white !important;
    box-shadow: 0 4px 15px rgba(233, 30, 99, 0.3) !important;
    
    &:hover:not(:disabled) {
      background: linear-gradient(135deg, ${colors.cyan} 0%, ${colors.lime} 100%) !important;
      transform: translateY(-2px) !important;
      box-shadow: 0 8px 25px rgba(0, 188, 212, 0.4) !important;
    }
    
    &:disabled {
      background: ${colors.lightGray} !important;
      color: ${colors.darkGray} !important;
      transform: none !important;
      box-shadow: none !important;
    }
  }
`;

const ContentArea = styled.div`
  flex: 1;
  padding: 40px;
  
  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const EditorGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 25px;
  }
`;

const MainEditor = styled.div`
  background: ${colors.white};
  padding: 30px;
  clip-path: ${ClipPath.rectangle};
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  position: relative;
  animation: scaleIn 0.6s ease-out;
  
  @keyframes scaleIn {
    ${animations.scaleIn}
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, ${colors.magenta}, ${colors.cyan}, ${colors.lime});
  }
`;

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const SidebarCard = styled.div`
  background: ${colors.white};
  padding: 25px;
  clip-path: ${ClipPath.rectangle};
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  position: relative;
  animation: scaleIn 0.8s ease-out;
  
  @keyframes scaleIn {
    ${animations.scaleIn}
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${({ $color }) => {
      switch($color) {
        case 'cyan': return `linear-gradient(90deg, ${colors.cyan}, ${colors.lime})`;
        case 'magenta': return `linear-gradient(90deg, ${colors.magenta}, ${colors.cyan})`;
        default: return `linear-gradient(90deg, ${colors.lime}, ${colors.cyan})`;
      }
    }};
  }
  
  h3 {
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 15px;
    color: ${colors.darkGray};
    display: flex;
    align-items: center;
    gap: 8px;
    
    svg {
      color: ${({ $color }) => {
        switch($color) {
          case 'cyan': return colors.cyan;
          case 'magenta': return colors.magenta;
          default: return colors.lime;
        }
      }};
    }
  }
`;

const EditorForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
  padding: 12px;
  background: #F8F9FA;
  border-radius: 0;
  clip-path: ${ClipPath.card};
  min-height: 45px;
  border: 2px dashed ${colors.lightGray};
  transition: all 0.3s ease;
  
  &:hover {
    border-color: ${colors.cyan};
    background: ${colors.cyan}10;
  }
`;

const TagItem = styled.div`
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, ${colors.cyan}20, ${colors.lime}20);
  color: ${colors.darkGray};
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 600;
  clip-path: ${ClipPath.card};
  border: 1px solid ${colors.cyan}30;
  animation: scaleIn 0.3s ease-out;
  
  @keyframes scaleIn {
    0% { transform: scale(0.8); opacity: 0; }
    100% { transform: scale(1); opacity: 1; }
  }
  
  button {
    background: none;
    border: none;
    color: ${colors.magenta};
    margin-left: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2px;
    font-size: 12px;
    font-weight: bold;
    transition: all 0.2s ease;
    
    &:hover {
      color: ${colors.magenta};
      transform: scale(1.2);
    }
  }
`;

const TagInput = styled.div`
  display: flex;
  align-items: center;
  margin-top: 10px;
  gap: 10px;
`;

const AddTagButton = styled(Button)`
  background: linear-gradient(135deg, ${colors.lime} 0%, ${colors.cyan} 100%) !important;
  border: none !important;
  clip-path: ${ClipPath.button};
  font-weight: 600 !important;
  box-shadow: 0 2px 8px rgba(139, 195, 74, 0.3) !important;
  transition: all 0.3s ease !important;
  padding: 8px 16px !important;
  
  &:hover:not(:disabled) {
    background: linear-gradient(135deg, ${colors.cyan} 0%, ${colors.magenta} 100%) !important;
    transform: translateY(-2px) !important;
    box-shadow: 0 6px 15px rgba(0, 188, 212, 0.4) !important;
  }
  
  &:disabled {
    background: ${colors.lightGray} !important;
    color: ${colors.darkGray} !important;
    transform: none !important;
    box-shadow: none !important;
  }
`;

const HelpSection = styled.div`
  .tip {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 12px;
    background: ${colors.lime}10;
    border-left: 3px solid ${colors.lime};
    margin-bottom: 12px;
    font-size: 13px;
    line-height: 1.4;
    color: ${colors.darkGray};
    
    svg {
      color: ${colors.lime};
      margin-top: 2px;
      flex-shrink: 0;
    }
  }
`;

const StyledTextArea = styled(TextArea)`
  textarea {
    background: #F8F9FA !important;
    border: 2px solid transparent !important;
    transition: all 0.3s ease !important;
    font-family: 'Noto Sans KR', sans-serif !important;
    line-height: 1.6 !important;
    
    &:focus {
      background: ${colors.white} !important;
      border-color: ${colors.cyan} !important;
      transform: translateY(-1px);
      box-shadow: 0 4px 15px rgba(0, 188, 212, 0.2) !important;
    }
  }
`;

const StyledInput = styled(Input)`
  input {
    background: #F8F9FA !important;
    border: 2px solid transparent !important;
    transition: all 0.3s ease !important;
    font-weight: 500 !important;
    
    &:focus {
      background: ${colors.white} !important;
      border-color: ${colors.cyan} !important;
      transform: translateY(-1px);
      box-shadow: 0 4px 15px rgba(0, 188, 212, 0.2) !important;
    }
  }
`;

const StyledSelect = styled(Select)`
  select {
    background: #F8F9FA !important;
    border: 2px solid transparent !important;
    transition: all 0.3s ease !important;
    font-weight: 500 !important;
    
    &:focus {
      background: ${colors.white} !important;
      border-color: ${colors.cyan} !important;
      transform: translateY(-1px);
      box-shadow: 0 4px 15px rgba(0, 188, 212, 0.2) !important;
    }
  }
`;

const NoteEditor = ({ isEdit }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation(); // 번역 함수
  const { currentNote, loading, error, message } = useSelector(state => state.notes);
  
  const [formData, setFormData] = useState({
  title: '',
  content: '',
  category: 'basic',  // '기본' → 'basic'
  tags: [],
});
  
  const [tagInput, setTagInput] = useState('');
  const [formErrors, setFormErrors] = useState({});
  
  // 카테고리 옵션 번역
  const categories = [
  { value: 'basic', label: 'Lecture (Study)' },
  { value: 'meeting', label: 'Ideas' },
  { value: 'study', label: 'Schedule' },
  { value: 'personal', label: 'Memo' }
];
  
  useEffect(() => {
    if (isEdit && id) {
      dispatch(fetchNoteById(id));
    }
    
    return () => {
      dispatch(clearCurrentNote());
      dispatch(clearNoteError());
      dispatch(clearNoteMessage());
    };
  }, [dispatch, isEdit, id]);
  
  useEffect(() => {
  if (isEdit && currentNote) {
    setFormData({
      title: currentNote.title || '',
      content: currentNote.content || '',
      category: currentNote.category || 'basic',  // '기본' → 'basic'
      tags: currentNote.tags || [],
    });
  }
}, [isEdit, currentNote]);
  
  useEffect(() => {
    if (message) {
      dispatch(showNotification({
        message,
        type: 'success',
      }));
      
      if (!isEdit) {
        navigate(`/notes/${currentNote._id}`);
      }
    }
  }, [message, dispatch, navigate, currentNote, isEdit]);
  
  const validateForm = () => {
    const errors = {};
    
    if (!formData.title.trim()) {
      errors.title = t('editor.fields.title.label') + '을 입력해주세요.';
    }
    
    if (!formData.content.trim()) {
      errors.content = t('editor.fields.content.label') + '을 입력해주세요.';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };
  
  const handleTagInputChange = (e) => {
    setTagInput(e.target.value);
  };
  
  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };
  
  const handleTagKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };
  
  const handleRemoveTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag),
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      if (isEdit) {
        dispatch(updateNote({ id, noteData: formData }));
      } else {
        dispatch(createNote(formData));
      }
    }
  };
  
  const handleCancel = () => {
    navigate(-1);
  };
  
  if (isEdit && loading && !currentNote) {
    return <Spinner fullHeight />;
  }
  
  return (
    <EditorContainer>
      <Header>
        <HeaderContent>
          <TitleSection>
            <h1>
              {isEdit ? <FaEdit /> : <FaPlus />}
              {isEdit ? t('editor.title.edit') : t('editor.title.create')}
            </h1>
            <div className="subtitle">
              {isEdit ? t('editor.subtitle.edit') : t('editor.subtitle.create')}
            </div>
          </TitleSection>
          
          <HeaderActions> 
            <ActionButton 
              className="cancel-button"
              variant="outline" 
              size="small" 
              onClick={handleCancel}
              icon={<FaTimes />}
            >
              {t('editor.actions.cancel')}
            </ActionButton>
            
            <ActionButton 
              className="save-button"
              size="small" 
              onClick={handleSubmit}
              icon={<FaSave />}
              disabled={loading}
            >
              {loading ? 
                (isEdit ? t('editor.actions.updating') : t('editor.actions.saving')) : 
                (isEdit ? t('editor.actions.update') : t('editor.actions.save'))
              }
            </ActionButton>
          </HeaderActions>
        </HeaderContent>
      </Header>
      
      {error && (
        <div style={{ padding: '0 40px' }}>
          <Alert
            variant="error"
            message={error}
            marginBottom="20px"
            onClose={() => dispatch(clearNoteError())}
          />
        </div>
      )}
      
      <ContentArea>
        <EditorGrid>
          <MainEditor>
            <EditorForm onSubmit={handleSubmit}>
              <FormSection>
                <StyledInput
                  name="title"
                  label={t('editor.fields.title.label')}
                  placeholder={t('editor.fields.title.placeholder')}
                  value={formData.title}
                  onChange={handleChange}
                  error={formErrors.title}
                  disabled={loading}
                  icon={<FaFileAlt />}
                  required
                />
                
                <StyledTextArea
                  name="content"
                  label={t('editor.fields.content.label')}
                  placeholder={t('editor.fields.content.placeholder')}
                  value={formData.content}
                  onChange={handleChange}
                  error={formErrors.content}
                  disabled={loading}
                  minHeight="400px"
                  required
                />
              </FormSection>
            </EditorForm>
          </MainEditor>
          
          <Sidebar>
            <SidebarCard $color="cyan">
              <h3>
                <FaTags />
                {t('editor.fields.category.label')} & {t('editor.fields.tags.label')}
              </h3>
              
              <StyledSelect
                name="category"
                label={t('editor.fields.category.label')}
                value={formData.category}
                onChange={handleChange}
                options={categories}
                disabled={loading}
              />
              
              <div style={{ marginTop: '20px' }}>
                <label 
                  style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontSize: '14px', 
                    fontWeight: 600,
                    color: colors.darkGray
                  }}
                >
                  {t('editor.fields.tags.label')}
                </label>
                
                <TagsContainer>
                  {formData.tags.length === 0 ? (
                    <div style={{ 
                      color: colors.darkGray, 
                      opacity: 0.6, 
                      fontSize: '13px',
                      fontStyle: 'italic'
                    }}>
                      {t('editor.fields.tags.empty')}
                    </div>
                  ) : (
                    formData.tags.map((tag, index) => (
                      <TagItem key={index}>
                        <FaTag style={{ marginRight: '5px', fontSize: '10px' }} />
                        {tag}
                        <button 
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          title="태그 삭제"
                        >
                          ×
                        </button>
                      </TagItem>
                    ))
                  )}
                </TagsContainer>
                
                <TagInput>
                  <StyledInput
                    name="tagInput"
                    placeholder={t('editor.fields.tags.placeholder')}
                    value={tagInput}
                    onChange={handleTagInputChange}
                    onKeyPress={handleTagKeyPress}
                    disabled={loading}
                    icon={<FaTag />}
                  />
                  <AddTagButton
                    type="button"
                    size="small"
                    onClick={handleAddTag}
                    disabled={!tagInput.trim() || loading}
                    icon={<FaPlus />}
                  >
                    {t('editor.fields.tags.add')}
                  </AddTagButton>
                </TagInput>
              </div>
            </SidebarCard>
            
            <SidebarCard $color="lime">
              <h3>
                <FaLightbulb />
                {t('editor.help.title')}
              </h3>
              
              <HelpSection>
                <div className="tip">
                  <FaKeyboard />
                  <div>
                    <strong>{t('editor.help.category.title')}</strong><br />
                    {t('editor.help.category.description')}
                  </div>
                </div>
                
                <div className="tip">
                  <FaTag />
                  <div>
                    <strong>{t('editor.help.tags.title')}</strong><br />
                    {t('editor.help.tags.description')}
                  </div>
                </div>
                
                <div className="tip">
                  <FaFileAlt />
                  <div>
                    <strong>{t('editor.help.general.title')}</strong><br />
                    {t('editor.help.general.description')}
                  </div>
                </div>
              </HelpSection>
            </SidebarCard>
          </Sidebar>
        </EditorGrid>
      </ContentArea>
    </EditorContainer>
  );
};

export default NoteEditor;