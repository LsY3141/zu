import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { FaArrowLeft, FaSave, FaTimes, FaTag, FaTags } from 'react-icons/fa';
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

const EditorContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const EditorHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const BackButton = styled(Button)`
  margin-right: 10px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
`;

const EditorForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const EditorCard = styled.div`
  background-color: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.boxShadow.card};
  padding: 20px;
  margin-bottom: 20px;
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
`;

const TagItem = styled.div`
  display: flex;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.primaryLight};
  color: ${({ theme }) => theme.colors.primary};
  padding: 5px 10px;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-size: 14px;
  
  button {
    background: none;
    border: none;
    color: ${({ theme }) => theme.colors.primary};
    margin-left: 5px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    font-size: 14px;
  }
`;

const TagInput = styled.div`
  display: flex;
  align-items: center;
  margin-top: 10px;
`;

const TagButton = styled(Button)`
  margin-left: 10px;
`;

const NoteEditor = ({ isEdit }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentNote, loading, error, message } = useSelector(state => state.notes);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '기본',
    tags: [],
  });
  
  const [tagInput, setTagInput] = useState('');
  const [formErrors, setFormErrors] = useState({});
  
  const categories = [
    { value: '기본', label: '기본' },
    { value: '학습', label: '학습' },
    { value: '회의', label: '회의' },
    { value: '개인', label: '개인' },
  ];
  
  useEffect(() => {
    // 수정 모드에서 노트 데이터 불러오기
    if (isEdit && id) {
      dispatch(fetchNoteById(id));
    }
    
    return () => {
      dispatch(clearCurrentNote());
      dispatch(clearNoteError());
      dispatch(clearNoteMessage());
    };
  }, [dispatch, isEdit, id]);
  
  // 노트 데이터가 로드되면 폼에 반영
  useEffect(() => {
    if (isEdit && currentNote) {
      setFormData({
        title: currentNote.title || '',
        content: currentNote.content || '',
        category: currentNote.category || '기본',
        tags: currentNote.tags || [],
      });
    }
  }, [isEdit, currentNote]);
  
  // 성공 메시지 표시
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
      errors.title = '제목을 입력해주세요.';
    }
    
    if (!formData.content.trim()) {
      errors.content = '내용을 입력해주세요.';
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
    
    // 입력 시 해당 필드의 에러 메시지 초기화
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
      <EditorHeader>
        <BackButton 
          variant="outline" 
          size="small" 
          onClick={handleCancel}
          icon={<FaArrowLeft />}
        >
          뒤로 가기
        </BackButton>
        
        <ActionButtons>
          <Button 
            variant="outline" 
            size="small" 
            onClick={handleCancel}
            icon={<FaTimes />}
          >
            취소
          </Button>
          <Button 
            size="small" 
            onClick={handleSubmit}
            icon={<FaSave />}
            disabled={loading}
          >
            {loading ? '저장 중...' : (isEdit ? '수정하기' : '저장하기')}
          </Button>
        </ActionButtons>
      </EditorHeader>
      
      {error && (
        <Alert
          variant="error"
          message={error}
          marginBottom="20px"
          onClose={() => dispatch(clearNoteError())}
        />
      )}
      
      <EditorForm onSubmit={handleSubmit}>
        <EditorCard>
          <Input
            name="title"
            label="제목"
            placeholder="노트 제목을 입력하세요"
            value={formData.title}
            onChange={handleChange}
            error={formErrors.title}
            disabled={loading}
            required
          />
          
          <TextArea
            name="content"
            label="내용"
            placeholder="노트 내용을 입력하세요"
            value={formData.content}
            onChange={handleChange}
            error={formErrors.content}
            disabled={loading}
            minHeight="300px"
            required
          />
          
          <Select
            name="category"
            label="카테고리"
            value={formData.category}
            onChange={handleChange}
            options={categories}
            disabled={loading}
          />
          
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
            
            <TagsContainer>
              {formData.tags.map((tag, index) => (
                <TagItem key={index}>
                  <FaTag style={{ marginRight: '5px' }} />
                  {tag}
                  <button 
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    title="태그 삭제"
                  >
                    &times;
                  </button>
                </TagItem>
              ))}
            </TagsContainer>
            
            <TagInput>
              <Input
                name="tagInput"
                placeholder="태그를 입력하고 엔터를 누르세요"
                value={tagInput}
                onChange={handleTagInputChange}
                onKeyPress={handleTagKeyPress}
                disabled={loading}
                icon={<FaTags />}
              />
              <TagButton
                type="button"
                variant="outline"
                size="small"
                onClick={handleAddTag}
                disabled={!tagInput.trim() || loading}
              >
                추가
              </TagButton>
            </TagInput>
          </div>
        </EditorCard>
      </EditorForm>
    </EditorContainer>
  );
};

export default NoteEditor;