// src/redux/slices/chatSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import chatApi from '../../api/chatApi';

// 챗봇 메시지 전송
export const sendChatMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ noteId, message, noteContent }, { rejectWithValue }) => {
    try {
      const response = await chatApi.sendMessage({
        noteId,
        message,
        noteContent,
        timestamp: new Date().toISOString()
      });
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: '메시지 전송 실패' });
    }
  }
);

// 노트 관련 질문
export const askAboutNote = createAsyncThunk(
  'chat/askAboutNote',
  async ({ noteId, question }, { rejectWithValue }) => {
    try {
      const response = await chatApi.askAboutNote(noteId, question);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: '질문 처리 실패' });
    }
  }
);

// 노트 요약
export const summarizeNote = createAsyncThunk(
  'chat/summarizeNote',
  async (noteId, { rejectWithValue }) => {
    try {
      const response = await chatApi.summarizeNote(noteId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: '노트 요약 실패' });
    }
  }
);

// 키워드 추출
export const extractKeywords = createAsyncThunk(
  'chat/extractKeywords',
  async (noteId, { rejectWithValue }) => {
    try {
      const response = await chatApi.extractKeywords(noteId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: '키워드 추출 실패' });
    }
  }
);

// 관련 노트 추천
export const getRelatedNotes = createAsyncThunk(
  'chat/getRelatedNotes',
  async (noteId, { rejectWithValue }) => {
    try {
      const response = await chatApi.getRelatedNotes(noteId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: '관련 노트 조회 실패' });
    }
  }
);

// 채팅 히스토리 조회
export const getChatHistory = createAsyncThunk(
  'chat/getChatHistory',
  async (noteId, { rejectWithValue }) => {
    try {
      const response = await chatApi.getChatHistory(noteId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: '채팅 히스토리 조회 실패' });
    }
  }
);

// 채팅 히스토리 삭제
export const clearChatHistory = createAsyncThunk(
  'chat/clearChatHistory',
  async (noteId, { rejectWithValue }) => {
    try {
      const response = await chatApi.clearChatHistory(noteId);
      return { noteId };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: '채팅 히스토리 삭제 실패' });
    }
  }
);

const initialState = {
  // 현재 활성 채팅
  currentChat: {
    noteId: null,
    messages: [],
    isOpen: false,
  },
  
  // 노트별 채팅 히스토리 (noteId를 키로 사용)
  chatHistories: {},
  
  // AI 분석 결과
  analysis: {
    summary: null,
    keywords: [],
    relatedNotes: [],
  },
  
  // 상태 관리
  loading: false,
  error: null,
  message: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    // 채팅 열기/닫기
    toggleChat: (state, action) => {
      const { noteId } = action.payload;
      if (state.currentChat.noteId === noteId) {
        state.currentChat.isOpen = !state.currentChat.isOpen;
      } else {
        state.currentChat = {
          noteId,
          messages: state.chatHistories[noteId] || [],
          isOpen: true,
        };
      }
    },
    
    // 채팅 닫기
    closeChat: (state) => {
      state.currentChat.isOpen = false;
    },
    
    // 로컬 메시지 추가 (사용자 메시지)
    addLocalMessage: (state, action) => {
      const { noteId, message } = action.payload;
      const newMessage = {
        id: Date.now(),
        text: message,
        isUser: true,
        timestamp: new Date().toISOString(),
      };
      
      // 현재 채팅에 추가
      if (state.currentChat.noteId === noteId) {
        state.currentChat.messages.push(newMessage);
      }
      
      // 히스토리에도 추가
      if (!state.chatHistories[noteId]) {
        state.chatHistories[noteId] = [];
      }
      state.chatHistories[noteId].push(newMessage);
    },
    
    // AI 응답 추가
    addAIResponse: (state, action) => {
      const { noteId, response } = action.payload;
      const newMessage = {
        id: Date.now() + 1,
        text: response,
        isUser: false,
        timestamp: new Date().toISOString(),
      };
      
      // 현재 채팅에 추가
      if (state.currentChat.noteId === noteId) {
        state.currentChat.messages.push(newMessage);
      }
      
      // 히스토리에도 추가
      if (!state.chatHistories[noteId]) {
        state.chatHistories[noteId] = [];
      }
      state.chatHistories[noteId].push(newMessage);
    },
    
    // 채팅 히스토리 로컬 삭제
    clearLocalChatHistory: (state, action) => {
      const { noteId } = action.payload;
      delete state.chatHistories[noteId];
      
      if (state.currentChat.noteId === noteId) {
        state.currentChat.messages = [];
      }
    },
    
    // 오류 및 메시지 초기화
    clearChatError: (state) => {
      state.error = null;
    },
    
    clearChatMessage: (state) => {
      state.message = null;
    },
    
    // 분석 결과 초기화
    clearAnalysis: (state) => {
      state.analysis = {
        summary: null,
        keywords: [],
        relatedNotes: [],
      };
    },
  },
  
  extraReducers: (builder) => {
    builder
      // 메시지 전송
      .addCase(sendChatMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendChatMessage.fulfilled, (state, action) => {
        state.loading = false;
        const { noteId, response } = action.payload;
        
        // AI 응답을 채팅에 추가
        const aiMessage = {
          id: Date.now(),
          text: response.message,
          isUser: false,
          timestamp: new Date().toISOString(),
        };
        
        if (state.currentChat.noteId === noteId) {
          state.currentChat.messages.push(aiMessage);
        }
        
        if (!state.chatHistories[noteId]) {
          state.chatHistories[noteId] = [];
        }
        state.chatHistories[noteId].push(aiMessage);
      })
      .addCase(sendChatMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || '메시지 전송 실패';
      })
      
      // 노트 요약
      .addCase(summarizeNote.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(summarizeNote.fulfilled, (state, action) => {
        state.loading = false;
        state.analysis.summary = action.payload.summary;
        state.message = '노트 요약이 완료되었습니다.';
      })
      .addCase(summarizeNote.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || '노트 요약 실패';
      })
      
      // 키워드 추출
      .addCase(extractKeywords.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(extractKeywords.fulfilled, (state, action) => {
        state.loading = false;
        state.analysis.keywords = action.payload.keywords;
        state.message = '키워드 추출이 완료되었습니다.';
      })
      .addCase(extractKeywords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || '키워드 추출 실패';
      })
      
      // 관련 노트 추천
      .addCase(getRelatedNotes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRelatedNotes.fulfilled, (state, action) => {
        state.loading = false;
        state.analysis.relatedNotes = action.payload.relatedNotes;
        state.message = '관련 노트 조회가 완료되었습니다.';
      })
      .addCase(getRelatedNotes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || '관련 노트 조회 실패';
      })
      
      // 채팅 히스토리 조회
      .addCase(getChatHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getChatHistory.fulfilled, (state, action) => {
        state.loading = false;
        const { noteId, messages } = action.payload;
        state.chatHistories[noteId] = messages;
        
        if (state.currentChat.noteId === noteId) {
          state.currentChat.messages = messages;
        }
      })
      .addCase(getChatHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || '채팅 히스토리 조회 실패';
      })
      
      // 채팅 히스토리 삭제
      .addCase(clearChatHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearChatHistory.fulfilled, (state, action) => {
        state.loading = false;
        const { noteId } = action.payload;
        delete state.chatHistories[noteId];
        
        if (state.currentChat.noteId === noteId) {
          state.currentChat.messages = [];
        }
        
        state.message = '채팅 히스토리가 삭제되었습니다.';
      })
      .addCase(clearChatHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || '채팅 히스토리 삭제 실패';
      });
  },
});

export const {
  toggleChat,
  closeChat,
  addLocalMessage,
  addAIResponse,
  clearLocalChatHistory,
  clearChatError,
  clearChatMessage,
  clearAnalysis,
} = chatSlice.actions;

export default chatSlice.reducer;