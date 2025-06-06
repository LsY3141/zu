import { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  fetchNotes, 
  setFilters, 
  setPagination, 
  fetchSharedNotes,
  moveNoteToTrash,
  restoreNote,
  deleteNote
} from '../redux/slices/noteSlice';
import { openConfirmDialog } from '../redux/slices/uiSlice';

const useNotes = (isTrash = false, isShared = false) => {
  const dispatch = useDispatch();
  const { 
    notes, 
    sharedNotes,
    trash, 
    loading, 
    error,
    filters,
    pagination
  } = useSelector(state => state.notes);
  
  const [displayedNotes, setDisplayedNotes] = useState([]);
  
  // 노트 목록 불러오기 - isDeleted 파라미터 명시적 전달
  useEffect(() => {
    if (isShared) {
      console.log('공유 노트 가져오기 요청');
      dispatch(fetchSharedNotes());
    } else {
      console.log('노트 목록 가져오기 요청', { 
        filters, 
        page: pagination.page, 
        limit: pagination.limit,
        isDeleted: isTrash  // isTrash를 isDeleted로 명시적 전달
      });
      dispatch(fetchNotes({ 
        ...filters, 
        page: pagination.page, 
        limit: pagination.limit,
        isDeleted: isTrash  // 중요: 휴지통 여부를 명시적으로 전달
      }));
    }
  }, [dispatch, filters, pagination.page, pagination.limit, isTrash, isShared]);
  
  // 표시할 노트 설정 - 로깅 추가
  useEffect(() => {
    console.log('노트 데이터 변경됨:', { 
      notes: notes.length, 
      sharedNotes: sharedNotes.length, 
      trash: trash.length,
      isTrash,
      isShared
    });
    
    if (isShared) {
      setDisplayedNotes(sharedNotes);
    } else if (isTrash) {
      console.log('휴지통 모드 - trash 데이터 사용:', trash.length);
      setDisplayedNotes(trash);
    } else {
      console.log('일반 모드 - notes 데이터 사용:', notes.length);
      setDisplayedNotes(notes);
    }
  }, [notes, sharedNotes, trash, isTrash, isShared]);
  
  // 필터 변경 핸들러
  const handleFilterChange = useCallback((newFilters) => {
    dispatch(setFilters(newFilters));
    dispatch(setPagination({ page: 1 })); // 필터 변경 시 첫 페이지로
  }, [dispatch]);
  
  // 페이지 변경 핸들러
  const handlePageChange = useCallback((page) => {
    dispatch(setPagination({ page }));
  }, [dispatch]);
  
  // 노트 삭제 핸들러 (휴지통으로 이동)
  const handleTrashNote = useCallback((noteId) => {
    console.log('노트 삭제 요청:', noteId);
    
    const confirmAction = () => {
      console.log('노트 삭제 확인됨:', noteId);
      dispatch(moveNoteToTrash(noteId))
        .unwrap()
        .then(() => {
          console.log('노트 삭제 성공:', noteId);
        })
        .catch((error) => {
          console.error('노트 삭제 실패:', error);
        });
    };
    
    dispatch(openConfirmDialog({
      title: '노트 삭제',
      message: '선택한 노트를 휴지통으로 이동하시겠습니까?',
      confirmText: '삭제',
      cancelText: '취소',
      onConfirm: confirmAction,
    }));
  }, [dispatch]);
  
  // 노트 복원 핸들러 - 새로고침 방지
  const handleRestoreNote = useCallback((noteId) => {
    console.log('노트 복원 요청:', noteId);
    dispatch(restoreNote(noteId))
      .unwrap()
      .then((result) => {
        console.log('노트 복원 성공:', noteId);
        console.log('복원된 노트 정보:', result);
        // 복원 후 목록을 새로고침하지 않음 - Redux 상태만으로 처리
      })
      .catch((error) => {
        console.error('노트 복원 실패:', error);
      });
  }, [dispatch]);
  
  // 노트 영구 삭제 핸들러
  const handleDeletePermanently = useCallback((noteId) => {
    console.log('노트 영구 삭제 요청:', noteId);
    
    const confirmAction = () => {
      console.log('노트 영구 삭제 확인됨:', noteId);
      dispatch(deleteNote(noteId))
        .unwrap()
        .then(() => {
          console.log('노트 영구 삭제 성공:', noteId);
        })
        .catch((error) => {
          console.error('노트 영구 삭제 실패:', error);
        });
    };
    
    dispatch(openConfirmDialog({
      title: '노트 영구 삭제',
      message: '선택한 노트를 영구적으로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
      confirmText: '영구 삭제',
      cancelText: '취소',
      onConfirm: confirmAction,
      danger: true
    }));
  }, [dispatch]);
  
  return {
    notes: displayedNotes,
    loading,
    error,
    filters,
    pagination,
    handleFilterChange,
    handlePageChange,
    handleTrashNote,
    handleRestoreNote,
    handleDeletePermanently
  };
};

export default useNotes;