import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import noteApi from '../../api/noteApi';

// 노트 목록 불러오기
export const fetchNotes = createAsyncThunk(
  'notes/fetchNotes',
  async (params, { rejectWithValue }) => {
    try {
      const response = await noteApi.getNotes(params);
      console.log('fetchNotes 응답:', response);
      return {
        notes: response.notes || [],
        total: response.total || 0
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: '노트 목록 불러오기 실패' });
    }
  }
);

// 노트 상세 불러오기
export const fetchNoteById = createAsyncThunk(
  'notes/fetchNoteById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await noteApi.getNoteById(id);
      console.log('fetchNoteById 응답:', response);
      return {
        note: response.note
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: '노트 상세 불러오기 실패' });
    }
  }
);

// 노트 생성
export const createNote = createAsyncThunk(
  'notes/createNote',
  async (noteData, { rejectWithValue }) => {
    try {
      const response = await noteApi.createNote(noteData);
      console.log('createNote 응답:', response);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: '노트 생성 실패' });
    }
  }
);

// 노트 수정
export const updateNote = createAsyncThunk(
  'notes/updateNote',
  async ({ id, noteData }, { rejectWithValue }) => {
    try {
      const response = await noteApi.updateNote(id, noteData);
      console.log('updateNote 응답:', response);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: '노트 수정 실패' });
    }
  }
);

// 노트 삭제 (휴지통으로 이동)
export const moveNoteToTrash = createAsyncThunk(
  'notes/moveNoteToTrash',
  async (id, { rejectWithValue }) => {
    try {
      console.log('moveNoteToTrash API 호출:', id);
      const response = await noteApi.trashNote(id);
      console.log('moveNoteToTrash 응답:', response);
      return { id, ...response };
    } catch (error) {
      console.error('moveNoteToTrash 오류:', error);
      return rejectWithValue(error.response?.data || { message: '노트 삭제 실패' });
    }
  }
);

// 노트 영구 삭제
export const deleteNote = createAsyncThunk(
  'notes/deleteNote',
  async (id, { rejectWithValue }) => {
    try {
      console.log('deleteNote API 호출:', id);
      await noteApi.deleteNote(id);
      return { id };
    } catch (error) {
      console.error('deleteNote 오류:', error);
      return rejectWithValue(error.response?.data || { message: '노트 영구 삭제 실패' });
    }
  }
);

// 노트 복원
export const restoreNote = createAsyncThunk(
  'notes/restoreNote',
  async (id, { rejectWithValue }) => {
    try {
      console.log('restoreNote API 호출:', id);
      const response = await noteApi.restoreNote(id);
      console.log('restoreNote 응답:', response);
      return { id, ...response };
    } catch (error) {
      console.error('restoreNote 오류:', error);
      return rejectWithValue(error.response?.data || { message: '노트 복원 실패' });
    }
  }
);

// 공유된 노트 불러오기
export const fetchSharedNotes = createAsyncThunk(
  'notes/fetchSharedNotes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await noteApi.getSharedNotes();
      console.log('fetchSharedNotes 응답:', response);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: '공유된 노트 불러오기 실패' });
    }
  }
);

// 노트 공유하기
export const shareNote = createAsyncThunk(
  'notes/shareNote',
  async ({ id, shareData }, { rejectWithValue }) => {
    try {
      const response = await noteApi.shareNote(id, shareData);
      console.log('shareNote 응답:', response);
      return { id, ...response };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: '노트 공유 실패' });
    }
  }
);

const initialState = {
  notes: [],
  sharedNotes: [],
  currentNote: null,
  trash: [],
  loading: false,
  error: null,
  message: null,
  filters: {
  category: '전체',
  searchText: '',
  sortBy: 'createdAt',
  sortOrder: 'desc',
},
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
};

const noteSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    clearCurrentNote: (state) => {
      state.currentNote = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    clearNoteError: (state) => {
      state.error = null;
    },
    clearNoteMessage: (state) => {
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 노트 목록 불러오기
      .addCase(fetchNotes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotes.fulfilled, (state, action) => {
        console.log('fetchNotes.fulfilled 액션:', action.payload);
        state.loading = false;
        state.notes = action.payload.notes;
        state.pagination.total = action.payload.total;
      })
      .addCase(fetchNotes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || '노트 목록 불러오기 실패';
      })
      
      // 노트 상세 불러오기
      .addCase(fetchNoteById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNoteById.fulfilled, (state, action) => {
        console.log('fetchNoteById.fulfilled 액션:', action.payload);
        state.loading = false;
        state.currentNote = action.payload.note;
      })
      .addCase(fetchNoteById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || '노트 상세 불러오기 실패';
      })
      
      // 노트 생성
      .addCase(createNote.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNote.fulfilled, (state, action) => {
        console.log('createNote.fulfilled 액션:', action.payload);
        state.loading = false;
        if (action.payload && action.payload.note) {
          state.notes = [action.payload.note, ...state.notes];
          state.currentNote = action.payload.note;
          state.message = action.payload.message;
        }
      })
      .addCase(createNote.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || '노트 생성 실패';
      })
      
      // 노트 수정
      .addCase(updateNote.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateNote.fulfilled, (state, action) => {
        console.log('updateNote.fulfilled 액션:', action.payload);
        state.loading = false;
        if (action.payload && action.payload.note) {
          state.notes = state.notes.map(note => 
            note._id === action.payload.note._id ? action.payload.note : note
          );
          state.currentNote = action.payload.note;
          state.message = action.payload.message;
        }
      })
      .addCase(updateNote.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || '노트 수정 실패';
      })
      
      // 노트 삭제 (휴지통으로 이동) - 원본 날짜 완전 보존
      .addCase(moveNoteToTrash.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(moveNoteToTrash.fulfilled, (state, action) => {
        console.log('moveNoteToTrash.fulfilled 액션:', action.payload);
        state.loading = false;
        const noteId = action.payload.id;
        
        // notes 배열에서 해당 노트를 찾아서 제거
        const noteToRemove = state.notes.find(note => note._id === noteId);
        if (noteToRemove) {
          state.notes = state.notes.filter(note => note._id !== noteId);
          
          // 휴지통에 추가 시 원본 날짜 완전 보존 + 삭제 날짜만 추가
          const trashedNote = { 
            ...noteToRemove, 
            isDeleted: true, 
            deletedAt: new Date().toISOString()
            // 중요: createdAt, updatedAt은 원본 그대로 완전 보존
          };
          
          console.log('휴지통 이동 - 원본 날짜 보존:', {
            noteId: trashedNote._id,
            title: trashedNote.title,
            originalCreatedAt: noteToRemove.createdAt,
            originalUpdatedAt: noteToRemove.updatedAt,
            preservedCreatedAt: trashedNote.createdAt,
            preservedUpdatedAt: trashedNote.updatedAt,
            deletedAt: trashedNote.deletedAt
          });
          
          state.trash = [...state.trash, trashedNote];
        }
        
        state.message = action.payload.message || '노트가 휴지통으로 이동되었습니다.';
      })
      .addCase(moveNoteToTrash.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || '노트 삭제 실패';
      })
      
      // 노트 영구 삭제
      .addCase(deleteNote.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteNote.fulfilled, (state, action) => {
        console.log('deleteNote.fulfilled 액션:', action.payload);
        state.loading = false;
        state.trash = state.trash.filter(note => note._id !== action.payload.id);
        state.message = '노트가 영구적으로 삭제되었습니다.';
      })
      .addCase(deleteNote.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || '노트 영구 삭제 실패';
      })
      
      // 노트 복원 - 백엔드 응답보다 로컬 원본 날짜 우선
      .addCase(restoreNote.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(restoreNote.fulfilled, (state, action) => {
        console.log('restoreNote.fulfilled 액션:', action.payload);
        state.loading = false;
        const noteId = action.payload.id;
        
        // trash 배열에서 해당 노트를 찾기
        const noteToRestore = state.trash.find(note => note._id === noteId);
        console.log('휴지통에서 찾은 노트:', noteToRestore);
        
        if (noteToRestore) {
          // 휴지통에서 제거
          state.trash = state.trash.filter(note => note._id !== noteId);
          
          // 백엔드 응답과 상관없이 로컬 상태의 원본 날짜 완전 보존
          const { isDeleted, deletedAt, ...originalNote } = noteToRestore;
          
          // 백엔드에서 온 데이터보다 로컬의 원본 날짜를 강제로 우선 적용
          const restoredNote = {
            ...originalNote, // 로컬 상태의 원본 데이터 (원본 날짜 포함)
            // 백엔드 응답이 있어도 무시하고 로컬 원본 날짜만 사용
            createdAt: noteToRestore.createdAt,  // 로컬 원본 생성일 강제 사용
            updatedAt: noteToRestore.updatedAt   // 로컬 원본 수정일 강제 사용
          };
          
          console.log('최종 복원 노트 (원본 날짜 강제 보존):', {
            id: restoredNote._id,
            title: restoredNote.title,
            finalCreatedAt: restoredNote.createdAt,
            finalUpdatedAt: restoredNote.updatedAt,
            originalCreatedAt: noteToRestore.createdAt,
            originalUpdatedAt: noteToRestore.updatedAt,
            backendResponse: action.payload.note || 'no backend note data'
          });
          
          // notes 배열에 추가 - 원본 updatedAt 기준으로 올바른 위치에 삽입
          const insertIndex = state.notes.findIndex(note => 
            new Date(note.updatedAt) < new Date(restoredNote.updatedAt)
          );
          
          if (insertIndex === -1) {
            state.notes = [...state.notes, restoredNote];
          } else {
            state.notes = [
              ...state.notes.slice(0, insertIndex),
              restoredNote,
              ...state.notes.slice(insertIndex)
            ];
          }
          
          console.log('복원 완료 - 원본 날짜 완전 보존됨');
        } else {
          console.error('휴지통에서 복원할 노트를 찾을 수 없음:', noteId);
        }
        
        state.message = action.payload.message || '노트가 성공적으로 복원되었습니다.';
      })
      .addCase(restoreNote.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || '노트 복원 실패';
      })
      
      // 공유된 노트 불러오기
      .addCase(fetchSharedNotes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSharedNotes.fulfilled, (state, action) => {
        console.log('fetchSharedNotes.fulfilled 액션:', action.payload);
        state.loading = false;
        if (action.payload && action.payload.notes) {
          state.sharedNotes = action.payload.notes;
        }
      })
      .addCase(fetchSharedNotes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || '공유된 노트 불러오기 실패';
      })
      
      // 노트 공유하기
      .addCase(shareNote.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(shareNote.fulfilled, (state, action) => {
        console.log('shareNote.fulfilled 액션:', action.payload);
        state.loading = false;
        if (action.payload && action.payload.note) {
          state.notes = state.notes.map(note => 
            note._id === action.payload.id ? action.payload.note : note
          );
          if (state.currentNote && state.currentNote._id === action.payload.id) {
            state.currentNote = action.payload.note;
          }
          state.message = action.payload.message;
        }
      })
      .addCase(shareNote.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || '노트 공유 실패';
      });
  },
});

export const { 
  clearCurrentNote,
  setFilters,
  setPagination,
  clearNoteError,
  clearNoteMessage,
} = noteSlice.actions;

export default noteSlice.reducer;