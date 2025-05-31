import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
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
  FaSearch
} from 'react-icons/fa';
import { formatRelativeTime, formatDateWithTimezone } from '../utils/formatters';
import { setFilters, setPagination } from '../redux/slices/noteSlice';
import { setViewMode } from '../redux/slices/uiSlice';
import Card from '../components/shared/Card';
import Button from '../components/shared/Button';
import Input from '../components/shared/Input';
import Select from '../components/shared/Select';
import Spinner from '../components/shared/Spinner';
import Pagination from '../components/shared/Pagination';
import useNotes from '../hooks/useNotes';


// ========================= STYLED COMPONENTS =========================
const NoteListContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 10px;
`;

const TitleSection = styled.div`
  h1 {
    font-size: 24px;
    font-weight: 600;
    margin: 0 0 5px;
    color: ${({ theme }) => theme.colors.text};
  }
  
  .count {
    font-size: 14px;
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const Controls = styled.div`
  display: flex;
  gap: 10px;
`;

const ViewButtons = styled.div`
  display: flex;
  gap: 5px;
`;

const ViewButton = styled.button`
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  background-color: ${({ $active, theme }) => 
    $active ? theme.colors.primary : 'transparent'};
  color: ${({ $active, theme }) => 
    $active ? 'white' : theme.colors.text};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${({ $active, theme }) => 
      $active ? theme.colors.primary : theme.colors.sidebarHover};
  }
`;

const FilterSection = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1.5fr;
  gap: 15px;
  margin-bottom: 20px;
  background-color: ${({ theme }) => theme.colors.cardBackground};
  padding: 15px;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.boxShadow.card};
`;

const FilterItem = styled.div`
  &:last-child {
    display: flex;
    align-items: end;
    gap: 8px;
  }
`;

// ========================= NOTE ITEMS =========================
const NoteGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
`;

const NoteList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const BaseNoteCard = styled(Card)`
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  
  &:hover {
    box-shadow: ${({ theme }) => theme.boxShadow.hover};
    
    .actions {
      opacity: 1;
    }
  }
`;

const ListCard = styled(BaseNoteCard)`
  padding: 0;
  
  &:hover {
    transform: translateX(5px);
  }
`;

const GridCard = styled(BaseNoteCard)`
  height: 240px;
  display: flex;
  flex-direction: column;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

// ========================= SHARED COMPONENTS =========================
const SearchInputContainer = styled.div`
  position: relative;
  width: 100%;
  
  input {
    padding-right: 40px !important;
  }
`;

const SearchButton = styled.button`
  position: absolute;
  right: 8px;
  bottom: 20px;
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  z-index: 10;
  height: 32px;
  width: 32px;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryLight};
  }
`;

const SortSection = styled.div`
  display: flex;
  align-items: end;
  gap: 8px;
  height: 100%;
`;

const SortSelectWrapper = styled.div`
  flex: 1;
`;

const SortButton = styled.button`
  height: 42px;
  width: 42px;
  background-color: ${({ theme }) => theme.colors.cardBackground};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  color: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  margin-bottom: 16px;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryLight};
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const NoteActions = styled.div`
  position: absolute;
  top: 15px;
  right: 15px;
  display: flex;
  gap: 5px;
  opacity: 0;
  transition: opacity 0.2s;
  background-color: ${({ theme }) => theme.colors.cardBackground};
  border-radius: 6px;
  padding: 4px;
  box-shadow: ${({ theme }) => theme.boxShadow.card};
`;

const ActionButton = styled.button`
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 4px;
  background-color: transparent;
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${({ theme, $color }) => 
      $color ? `${theme.colors[$color]}20` : theme.colors.sidebarHover};
    color: ${({ theme, $color }) => 
      $color ? theme.colors[$color] : theme.colors.text};
  }
`;

const NoteTypeTag = styled.div`
  display: flex;
  align-items: center;
  background-color: ${({ theme, $isVoice }) => 
    $isVoice ? theme.colors.warning + '20' : theme.colors.info + '20'};
  color: ${({ theme, $isVoice }) => 
    $isVoice ? theme.colors.warning : theme.colors.info};
  padding: 4px 8px;
  border-radius: 12px;
  font-size: ${({ $small }) => $small ? '11px' : '12px'};
  font-weight: 500;
  white-space: nowrap;
  
  svg {
    margin-right: 4px;
    font-size: ${({ $small }) => $small ? '10px' : '12px'};
  }
`;

// ========================= LIST VIEW COMPONENTS =========================
const ListContent = styled.div`
  padding: 20px;
  padding-right: 100px; /* 액션 버튼 공간 확보 */
`;

const ListHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
  
  h2 {
    font-size: 16px;
    font-weight: 500;
    margin: 0;
    color: ${({ theme }) => theme.colors.text};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
  }
`;

const Excerpt = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
`;

const Meta = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Tags = styled.div`
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
`;

const Tag = styled.span`
  background-color: ${({ theme }) => theme.colors.primaryLight};
  color: ${({ theme }) => theme.colors.primary};
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 11px;
  white-space: nowrap;
`;

const DateDisplay = styled.div`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-left: auto;
  text-align: right;
  
  .main-date {
    font-weight: 500;
  }
  
  .debug-info {
    opacity: 0.7;
    font-size: 10px;
    margin-top: 2px;
  }
`;

// ========================= GRID VIEW COMPONENTS =========================
const GridContent = styled.div`
  flex: 1;
  padding: 20px;
  overflow: hidden;
`;

const GridHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  
  h2 {
    font-size: 16px;
    font-weight: 500;
    margin: 0;
    color: ${({ theme }) => theme.colors.text};
    flex: 1;
    margin-right: 10px;
  }
`;

const GridFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding: 15px 20px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

// ========================= EMPTY STATE =========================
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
  
  .icon {
    font-size: 48px;
    color: ${({ theme }) => theme.colors.primary};
    margin-bottom: 20px;
  }
  
  .text {
    font-size: 16px;
    color: ${({ theme }) => theme.colors.textSecondary};
    margin: 0 0 20px;
  }
`;

// ========================= CONSTANTS =========================
const CATEGORIES = [
  { value: '전체', label: '전체' },
  { value: '기본', label: '기본' },
  { value: '학습', label: '학습' },
  { value: '회의', label: '회의' },
  { value: '개인', label: '개인' },
];

const SORT_OPTIONS = [
  { value: 'createdAt', label: '생성일' },      // 첫 번째로 이동
  { value: 'updatedAt', label: '최근 수정일' },
  { value: 'title', label: '제목' },
];

// ========================= MAIN COMPONENT =========================
const NoteListComponent = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { viewMode } = useSelector(state => state.ui);
  const { notes, loading, filters, pagination, handleTrashNote } = useNotes();
  
  // 로컬 검색 상태 (Redux 상태와 동기화)
  const [localSearchText, setLocalSearchText] = useState(filters.searchText || '');

  // Redux 필터 상태가 변경되면 로컬 상태도 업데이트 (헤더에서 검색했을 때)
  useEffect(() => {
    setLocalSearchText(filters.searchText || '');
  }, [filters.searchText]);

  // ========================= HANDLERS =========================
  const handleViewModeChange = (mode) => dispatch(setViewMode(mode));
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if (name === 'searchText') {
      // 검색어는 로컬 상태만 업데이트
      setLocalSearchText(value);
    } else {
      // 다른 필터는 바로 적용
      dispatch(setFilters({ [name]: value }));
    }
  };
  
  // 검색 실행 함수
  const handleSearch = () => {
    dispatch(setFilters({ searchText: localSearchText }));
    dispatch(setPagination({ page: 1 })); // 검색 시 첫 페이지로
  };
  
  // Enter 키로 검색
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

  // ========================= UTILITIES =========================
  const truncateText = (text, maxLength = 150) => {
    if (!text) return '';
    return text.length <= maxLength ? text : text.slice(0, maxLength) + '...';
  };

  // 날짜 포맷팅 및 디버깅 함수
  const formatDate = (date, noteId, noteTitle) => {
    const noteDate = new Date(date);
    const formatted = noteDate.toLocaleDateString('ko-KR', { 
      month: 'short', 
      day: 'numeric',
      year: noteDate.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
    
    // 디버깅용 로그
    console.log('날짜 포맷팅 디버그:', {
      noteId,
      noteTitle,
      originalDate: date,
      parsedDate: noteDate,
      formattedDate: formatted,
      isToday: noteDate.toDateString() === new Date().toDateString(),
      daysDifference: Math.floor((new Date() - noteDate) / (1000 * 60 * 60 * 24))
    });
    
    return formatted;
  };

  // 상대 시간 포맷팅
  const formatRelativeTime = (date) => {
    const now = new Date();
    const noteDate = new Date(date);
    const diffMs = now - noteDate;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffDays > 7) {
      return formatDate(date);
    } else if (diffDays > 0) {
      return `${diffDays}일 전`;
    } else if (diffHours > 0) {
      return `${diffHours}시간 전`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes}분 전`;
    } else {
      return '방금 전';
    }
  };

  // ========================= RENDER COMPONENTS =========================
  const renderActions = (note) => (
    <NoteActions className="actions">
      <ActionButton onClick={(e) => handleEdit(e, note._id)} title="수정">
        <FaEdit />
      </ActionButton>
      <ActionButton onClick={(e) => handleShare(e, note._id)} title="공유" $color="info">
        <FaShareAlt />
      </ActionButton>
      <ActionButton onClick={(e) => handleDelete(e, note._id)} title="삭제" $color="danger">
        <FaTrash />
      </ActionButton>
    </NoteActions>
  );

  const renderDateInfo = (note) => {
    // 노트 렌더링 시 날짜 정보 디버깅
    console.log('노트 렌더링 날짜 디버그:', {
      id: note._id,
      title: note.title,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
      createdAtType: typeof note.createdAt,
      updatedAtType: typeof note.updatedAt,
      createdAtFormatted: formatDate(note.createdAt, note._id, note.title),
      updatedAtFormatted: formatDate(note.updatedAt, note._id, note.title)
    });

    return (
      <DateDisplay>
        <div className="main-date">
          {formatRelativeTime(note.updatedAt)}
        </div>
        {process.env.NODE_ENV === 'development' && (
          <div className="debug-info" title={`생성: ${note.createdAt} | 수정: ${note.updatedAt}`}>
            수정: {formatDate(note.updatedAt, note._id, note.title)}
          </div>
        )}
      </DateDisplay>
    );
  };

  const renderListItem = (note) => (
    <ListCard key={note._id} onClick={() => handleNoteClick(note._id)}>
      {renderActions(note)}
      <ListContent>
        <ListHeader>
          <h2>{note.title}</h2>
          <NoteTypeTag $isVoice={note.isVoice}>
            {note.isVoice ? <FaMicrophone /> : <FaStickyNote />}
            {note.isVoice ? '음성 노트' : '텍스트 노트'}
          </NoteTypeTag>
        </ListHeader>
        <Excerpt>{truncateText(note.content)}</Excerpt>
        <Meta>
          <Tags>
            {note.tags?.map((tag, index) => (
              <Tag key={index}>{tag}</Tag>
            ))}
            {note.category && <Tag>{note.category}</Tag>}
          </Tags>
          {renderDateInfo(note)}
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
          {note.isVoice ? '음성 노트' : '텍스트 노트'}
        </NoteTypeTag>
        {renderDateInfo(note)}
      </GridFooter>
    </GridCard>
  );

  // ========================= MAIN RENDER =========================
  if (loading) return <Spinner fullHeight />;

  return (
    <NoteListContainer>
      {/* Header */}
      <Header>
        <TitleSection>
          <h1>전체 노트</h1>
          <div className="count">총 {pagination.total}개의 노트</div>
        </TitleSection>
        
        <Controls>
          <Button onClick={handleCreateNote} icon={<FaStickyNote />}>
            새 노트 작성
          </Button>
          
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
        </Controls>
      </Header>

      {/* Filters */}
      <FilterSection style={{ 
        display: 'grid', 
        gridTemplateColumns: '2fr 1fr 1.5fr',
        gap: '15px'
      }}>
        <SearchInputContainer>
          <Input
            name="searchText"
            placeholder="노트 검색..."
            value={localSearchText}
            onChange={handleFilterChange}
            onKeyPress={handleSearchKeyPress}
            icon={<FaFilter />}
          />
          <SearchButton onClick={handleSearch} title="검색">
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
          <SortSelectWrapper>
            <Select
              name="sortBy"
              value={filters.sortBy}
              onChange={handleFilterChange}
              options={SORT_OPTIONS}
            />
          </SortSelectWrapper>
          <SortButton
            onClick={handleSortToggle}
            title={filters.sortOrder === 'desc' ? '내림차순' : '오름차순'}
          >
            {filters.sortOrder === 'desc' ? <FaSortAmountDown /> : <FaSortAmountUp />}
          </SortButton>
        </SortSection>
      </FilterSection>

      {/* Content */}
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
              ? `"${localSearchText}" 검색 결과가 없습니다.`
              : '노트가 없습니다. 새 노트를 작성해보세요!'}
          </div>
          <Button onClick={handleCreateNote} icon={<FaStickyNote />}>
            새 노트 작성하기
          </Button>
        </EmptyState>
      )}
    </NoteListContainer>
  );
};

export default NoteListComponent;