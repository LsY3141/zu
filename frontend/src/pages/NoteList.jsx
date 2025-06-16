import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next'; // 번역 훅 추가
import styled from 'styled-components';
import { 
  FaList, 
  FaTh, 
  FaFilter, 
  FaSortAmountDown, 
  FaSortAmountUp, 
  FaStickyNote,
  FaMicrophone, 
  FaShareAlt, 
  FaTrash, 
  FaEdit,
  FaSearch,
  FaPlus,
  FaClock,
  FaTag
} from 'react-icons/fa';
import { formatRelativeTime } from '../utils/formatters';
import { setFilters, setPagination } from '../redux/slices/noteSlice';
import { setViewMode } from '../redux/slices/uiSlice';
import Button from '../components/shared/Button';
import Input from '../components/shared/Input';
import Select from '../components/shared/Select';
import Spinner from '../components/shared/Spinner';
import Pagination from '../components/shared/Pagination';
import useNotes from '../hooks/useNotes';

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

const NoteListContainer = styled.div`
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

const HeaderTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
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
    
    @media (max-width: 768px) {
      font-size: 1.8rem;
    }
  }
  
  .count {
    font-size: 15px;
    color: ${colors.darkGray};
    opacity: 0.8;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 8px;
    
    &::before {
      content: '';
      width: 4px;
      height: 4px;
      background: ${colors.cyan};
      border-radius: 50%;
    }
  }
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 15px;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
`;

const CreateButton = styled(Button)`
  background: linear-gradient(135deg, ${colors.magenta} 0%, ${colors.cyan} 100%) !important;
  border: none !important;
  clip-path: ${ClipPath.button};
  font-weight: 600 !important;
  box-shadow: 0 4px 15px rgba(233, 30, 99, 0.3) !important;
  transition: all 0.3s ease !important;
  
  &:hover:not(:disabled) {
    background: linear-gradient(135deg, ${colors.cyan} 0%, ${colors.lime} 100%) !important;
    transform: translateY(-2px) !important;
    box-shadow: 0 8px 25px rgba(0, 188, 212, 0.4) !important;
  }
`;

const ViewButtons = styled.div`
  display: flex;
  gap: 5px;
  background: ${colors.white};
  padding: 4px;
  border-radius: 0;
  clip-path: ${ClipPath.rectangle};
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
`;

const ViewButton = styled.button`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: ${({ $active }) => 
    $active ? `linear-gradient(135deg, ${colors.magenta}, ${colors.cyan})` : 'transparent'};
  color: ${({ $active }) => $active ? colors.white : colors.darkGray};
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 16px;
  
  &:hover {
    background: ${({ $active }) => 
      $active ? `linear-gradient(135deg, ${colors.magenta}, ${colors.cyan})` : colors.lightGray};
    transform: ${({ $active }) => $active ? 'none' : 'scale(1.05)'};
  }
`;

const FilterSection = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1.5fr;
  gap: 20px;
  background: ${colors.white};
  padding: 25px;
  border-radius: 0;
  clip-path: ${ClipPath.rectangle};
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  position: relative;
  animation: scaleIn 0.5s ease-out;
  
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
    background: linear-gradient(90deg, ${colors.magenta}, ${colors.cyan}, ${colors.lime});
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 15px;
    padding: 20px;
  }
`;

const SearchInputContainer = styled.div`
  position: relative;
  
  input {
    padding-right: 50px !important;
    background: #F8F9FA !important;
    border: 2px solid transparent !important;
    transition: all 0.3s ease !important;
    
    &:focus {
      background: ${colors.white} !important;
      border-color: ${colors.cyan} !important;
      transform: translateY(-1px);
      box-shadow: 0 4px 15px rgba(0, 188, 212, 0.2) !important;
    }
  }
`;

const SearchButton = styled.button`
  position: absolute;
  right: 8px;
  bottom: 20px;
  background: linear-gradient(135deg, ${colors.cyan}, ${colors.lime});
  border: none;
  color: white;
  cursor: pointer;
  padding: 8px;
  border-radius: 0;
  clip-path: ${ClipPath.card};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  height: 36px;
  width: 36px;
  
  &:hover {
    background: linear-gradient(135deg, ${colors.magenta}, ${colors.cyan});
    transform: scale(1.05);
  }
`;

const SortSection = styled.div`
  display: flex;
  align-items: end;
  gap: 10px;
  height: 100%;
`;

const SortButton = styled.button`
  height: 46px;
  width: 46px;
  background: linear-gradient(135deg, ${colors.lightGray}, ${colors.white});
  border: 2px solid ${colors.lightGray};
  border-radius: 0;
  clip-path: ${ClipPath.card};
  color: ${colors.darkGray};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  margin-bottom: 16px;
  
  &:hover {
    background: linear-gradient(135deg, ${colors.cyan}20, ${colors.lime}20);
    border-color: ${colors.cyan};
    color: ${colors.cyan};
    transform: scale(1.05);
  }
`;

const ContentArea = styled.div`
  flex: 1;
  padding: 40px;
  
  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const NoteGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 25px;
  animation: fadeIn 0.8s ease-out;
  
  @keyframes fadeIn {
    ${animations.fadeIn}
  }
`;

const NoteList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  animation: fadeIn 0.8s ease-out;
  
  @keyframes fadeIn {
    ${animations.fadeIn}
  }
`;

const BaseNoteCard = styled.div`
  background: ${colors.white};
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0,0,0,0.08);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, ${colors.magenta}, ${colors.cyan}, ${colors.lime});
    transform: scaleX(0);
    transition: transform 0.3s ease;
  }
  
  &:hover {
    box-shadow: 0 8px 30px rgba(0,0,0,0.15);
    
    &::before {
      transform: scaleX(1);
    }
    
    .actions {
      opacity: 1;
    }
  }
`;

const ListCard = styled(BaseNoteCard)`
  padding: 0;
  clip-path: ${ClipPath.rectangle};
  
  &:hover {
    transform: translateX(8px);
  }
`;

const GridCard = styled(BaseNoteCard)`
  height: 280px;
  display: flex;
  flex-direction: column;
  clip-path: ${ClipPath.rectangle};
  
  &:hover {
    transform: translateY(-8px);
  }
`;

const NoteActions = styled.div`
  position: absolute;
  top: 50%;
  right: 20px;
  transform: translateY(-50%);
  display: flex;
  gap: 6px;
  opacity: 0;
  transition: all 0.3s ease;
  background: ${colors.white}F0;
  backdrop-filter: blur(10px);
  border-radius: 0;
  clip-path: ${ClipPath.card};
  padding: 6px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  z-index: 10;
`;

const ActionButton = styled.button`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 0;
  clip-path: ${ClipPath.card};
  background: transparent;
  color: ${colors.darkGray};
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  
  &:hover {
    background: ${({ $color }) => {
      switch($color) {
        case 'danger': return `${colors.magenta}20`;
        case 'info': return `${colors.cyan}20`;
        default: return `${colors.lime}20`;
      }
    }};
    color: ${({ $color }) => {
      switch($color) {
        case 'danger': return colors.magenta;
        case 'info': return colors.cyan;
        default: return colors.lime;
      }
    }};
    transform: scale(1.1);
  }
`;

const NoteTypeTag = styled.div`
  display: flex;
  align-items: center;
  background: ${({ $isVoice }) => 
    $isVoice ? `${colors.cyan}20` : `${colors.magenta}20`};
  color: ${({ $isVoice }) => 
    $isVoice ? colors.cyan : colors.magenta};
  padding: 6px 12px;
  font-size: ${({ $small }) => $small ? '11px' : '12px'};
  font-weight: 600;
  white-space: nowrap;
  clip-path: ${ClipPath.card};
  
  svg {
    margin-right: 6px;
    font-size: ${({ $small }) => $small ? '10px' : '12px'};
  }
`;

const ListContent = styled.div`
  padding: 25px;
  padding-right: 25px;
  position: relative;
`;

const ListHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 12px;
  
  h2 {
    font-size: 18px;
    font-weight: 600;
    margin: 0;
    color: ${colors.darkGray};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
  }
`;

const Excerpt = styled.div`
  font-size: 14px;
  color: ${colors.darkGray};
  opacity: 0.8;
  margin-bottom: 15px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.5;
`;

const Meta = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: ${colors.darkGray};
  opacity: 0.7;
`;

const Tags = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
`;

const Tag = styled.span`
  background: ${colors.cyan}15;
  color: #000000;
  padding: 3px 8px;
  font-size: 10px;
  clip-path: ${ClipPath.card};
  font-weight: 600;
  white-space: nowrap;
  border: 1px solid ${colors.cyan}30;
`;

const DateDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: ${colors.darkGray};
  opacity: 0.6;
  
  svg {
    font-size: 10px;
  }
  
  .main-date {
    font-weight: 500;
  }
`;

const GridContent = styled.div`
  flex: 1;
  padding: 25px;
  overflow: hidden;
`;

const GridHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
  
  h2 {
    font-size: 16px;
    font-weight: 600;
    margin: 0;
    color: ${colors.darkGray};
    flex: 1;
    margin-right: 15px;
    line-height: 1.3;
  }
`;

const GridFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding: 20px 25px;
  border-top: 2px solid ${colors.lightGray};
  font-size: 12px;
  color: ${colors.darkGray};
  opacity: 0.7;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 40px;
  text-align: center;
  background: ${colors.white};
  border-radius: 0;
  clip-path: ${ClipPath.rectangle};
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, ${colors.magenta}, ${colors.cyan}, ${colors.lime});
  }
  
  .icon {
    font-size: 4rem;
    background: linear-gradient(135deg, ${colors.magenta}, ${colors.cyan});
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 25px;
  }
  
  .text {
    font-size: 18px;
    color: ${colors.darkGray};
    margin: 0 0 25px;
    font-weight: 500;
  }
`;

const getCategoryLabel = (categoryValue) => {
  switch(categoryValue) {
    case 'basic': return 'Lecture (Study)';
    case 'meeting': return 'Ideas';
    case 'study': return 'Schedule';
    case 'personal': return 'Memo';
    default: return categoryValue;
  }
};

const NoteListComponent = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation(); // 번역 함수
  const { viewMode } = useSelector(state => state.ui);
  const { notes, loading, filters, pagination, handleTrashNote } = useNotes();
  
  const [localSearchText, setLocalSearchText] = useState(filters.searchText || '');

  // 카테고리 옵션 번역
  const CATEGORIES = [
  { value: '전체', label: 'All' },
  { value: 'basic', label: '강의 (학습)' },
  { value: 'meeting', label: '아이디어' },
  { value: 'study', label: '일정' },
  { value: 'personal', label: '메모' }
];

// 카테고리 옵션 번역
  const categories = [
  { value: 'basic', label: '강의 (학습)' },
  { value: 'meeting', label: '아이디어' },
  { value: 'study', label: '일정' },
  { value: 'personal', label: '메모' }
];


  // 정렬 옵션 번역
  const SORT_OPTIONS = [
    { value: 'createdAt', label: t('notes.sort.createdAt') },
    { value: 'updatedAt', label: t('notes.sort.updatedAt') },
    { value: 'title', label: t('notes.sort.title') },
  ];

  useEffect(() => {
    setLocalSearchText(filters.searchText || '');
  }, [filters.searchText]);

  const handleViewModeChange = (mode) => dispatch(setViewMode(mode));
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if (name === 'searchText') {
      setLocalSearchText(value);
    } else {
      dispatch(setFilters({ [name]: value }));
    }
  };
  
  const handleSearch = () => {
    dispatch(setFilters({ searchText: localSearchText }));
    dispatch(setPagination({ page: 1 }));
  };
  
  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  const handleSortToggle = () => {
    dispatch(setFilters({ 
      sortOrder: filters.sortOrder === 'desc' ? 'asc' : 'desc' 
    }));
  };
  
  const handlePageChange = (page) => dispatch(setPagination({ page }));
  
  const handleNoteClick = (noteId) => navigate(`/notes/${noteId}`);
  const handleCreateNote = () => navigate('/notes/create');
  
  const handleEdit = (e, noteId) => {
    e.stopPropagation();
    navigate(`/notes/edit/${noteId}`);
  };
  
  const handleShare = (e, noteId) => {
    e.stopPropagation();
    // TODO: 공유 모달 구현
  };
  
  const handleDelete = (e, noteId) => {
    e.stopPropagation();
    handleTrashNote(noteId);
  };

  const truncateText = (text, maxLength = 150) => {
    if (!text) return '';
    return text.length <= maxLength ? text : text.slice(0, maxLength) + '...';
  };

  const renderActions = (note) => (
    <NoteActions className="actions">
      <ActionButton onClick={(e) => handleEdit(e, note._id)} title={t('notes.actions.edit')}>
        <FaEdit />
      </ActionButton>
      <ActionButton onClick={(e) => handleShare(e, note._id)} title={t('notes.actions.share')} $color="info">
        <FaShareAlt />
      </ActionButton>
      <ActionButton onClick={(e) => handleDelete(e, note._id)} title={t('notes.actions.delete')} $color="danger">
        <FaTrash />
      </ActionButton>
    </NoteActions>
  );

  const renderListItem = (note) => (
    <ListCard key={note._id} onClick={() => handleNoteClick(note._id)}>
      {renderActions(note)}
      <ListContent>
        <ListHeader>
          <h2>{note.title}</h2>
          <NoteTypeTag $isVoice={note.isVoice}>
            {note.isVoice ? <FaMicrophone /> : <FaStickyNote />}
            {note.isVoice ? t('notes.types.voice') : t('notes.types.text')}
          </NoteTypeTag>
        </ListHeader>
        <Excerpt>{truncateText(note.content)}</Excerpt>
        <Meta>
          <Tags>
            {note.tags?.slice(0, 3).map((tag, index) => (
              <Tag key={index}>{tag}</Tag>
            ))}
            {note.category && <Tag>{getCategoryLabel(note.category)}</Tag>}
          </Tags>
          <DateDisplay>
            <FaClock />
            <span className="main-date">{formatRelativeTime(note.updatedAt)}</span>
          </DateDisplay>
        </Meta>
      </ListContent>
    </ListCard>
  );

  const renderGridItem = (note) => (
    <GridCard key={note._id} onClick={() => handleNoteClick(note._id)}>
      {renderActions(note)}
      <GridContent>
        <GridHeader>
          <h2>{note.title}</h2>
        </GridHeader>
        <Excerpt>{truncateText(note.content, 120)}</Excerpt>
      </GridContent>
      <GridFooter>
        <NoteTypeTag $isVoice={note.isVoice} $small>
          {note.isVoice ? <FaMicrophone /> : <FaStickyNote />}
          {note.isVoice ? t('notes.types.voice') : t('notes.types.text')}
        </NoteTypeTag>
        <DateDisplay>
          <FaClock />
          {formatRelativeTime(note.updatedAt)}
        </DateDisplay>
      </GridFooter>
    </GridCard>
  );

  if (loading) return <Spinner fullHeight />;

  return (
    <NoteListContainer>
      <Header>
        <HeaderTop>
          <TitleSection>
            <h1>{t('notes.title')}</h1>
            <div className="count">{t('notes.totalCount', { count: pagination.total })}</div>
          </TitleSection>
          
          <HeaderActions>
            <CreateButton onClick={handleCreateNote} icon={<FaPlus />}>
              {t('notes.actions.create')}
            </CreateButton>
            
            <ViewButtons>
              <ViewButton
                $active={viewMode === 'list'}
                onClick={() => handleViewModeChange('list')}
                title="리스트 보기"
              >
                <FaList />
              </ViewButton>
              <ViewButton
                $active={viewMode === 'grid'}
                onClick={() => handleViewModeChange('grid')}
                title="그리드 보기"
              >
                <FaTh />
              </ViewButton>
            </ViewButtons>
          </HeaderActions>
        </HeaderTop>

        <FilterSection>
          <SearchInputContainer>
            <Input
              name="searchText"
              placeholder={t('notes.search.placeholder')}
              value={localSearchText}
              onChange={handleFilterChange}
              onKeyPress={handleSearchKeyPress}
              icon={<FaFilter />}
            />
            <SearchButton onClick={handleSearch} title={t('notes.search.button')}>
              <FaSearch size={14} />
            </SearchButton>
          </SearchInputContainer>
          
          <div>
            <Select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              options={CATEGORIES}
            />
          </div>
          
          <SortSection>
            <div style={{ flex: 1 }}>
              <Select
                name="sortBy"
                value={filters.sortBy}
                onChange={handleFilterChange}
                options={SORT_OPTIONS}
              />
            </div>
            <SortButton
              onClick={handleSortToggle}
              title={filters.sortOrder === 'desc' ? t('notes.sort.descending') : t('notes.sort.ascending')}
            >
              {filters.sortOrder === 'desc' ? <FaSortAmountDown /> : <FaSortAmountUp />}
            </SortButton>
          </SortSection>
        </FilterSection>
      </Header>

      <ContentArea>
        {notes.length > 0 ? (
          <>
            {viewMode === 'list' ? (
              <NoteList>
                {notes.map(renderListItem)}
              </NoteList>
            ) : (
              <NoteGrid>
                {notes.map(renderGridItem)}
              </NoteGrid>
            )}
            
            <Pagination 
              currentPage={pagination.page}
              totalPages={Math.ceil(pagination.total / pagination.limit)}
              onPageChange={handlePageChange}
            />
          </>
        ) : (
          <EmptyState>
            <div className="icon">
              <FaStickyNote />
            </div>
            <div className="text">
              {localSearchText
                ? t('notes.search.noResults', { query: localSearchText })
                : t('notes.empty.title')}
            </div>
            <CreateButton onClick={handleCreateNote} icon={<FaPlus />}>
              {t('notes.empty.createButton')}
            </CreateButton>
          </EmptyState>
        )}
      </ContentArea>
    </NoteListContainer>
  );
};

export default NoteListComponent;