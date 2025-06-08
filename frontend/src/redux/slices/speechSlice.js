import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const speechUrl = `${API_URL}/speech`;

// 파일 업로드 진행 상태를 추적하기 위한 axios 인스턴스
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

// 요청 인터셉터
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 음성 파일 업로드 (수정됨 - onUploadProgress 콜백 지원)
export const uploadSpeechFile = createAsyncThunk(
  'speech/uploadSpeechFile',
  async ({ formData, onUploadProgress }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${speechUrl}/upload`, formData, {
        onUploadProgress: onUploadProgress || ((progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          dispatch(setFileUploadProgress(percentCompleted));
        }),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: '음성 파일 업로드 실패' });
    }
  }
);

// 음성 변환 상태 확인
export const checkTranscriptionStatus = createAsyncThunk(
  'speech/checkTranscriptionStatus',
  async (jobId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${speechUrl}/status/${jobId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: '변환 상태 확인 실패' });
    }
  }
);

// 변환된 텍스트 분석 (요약, 핵심 개념 추출)
export const analyzeTranscription = createAsyncThunk(
  'speech/analyzeTranscription',
  async ({ transcriptionId, options }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${speechUrl}/analyze/${transcriptionId}`,
        { options },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: '텍스트 분석 실패' });
    }
  }
);

// 변환된 텍스트 번역
export const translateTranscription = createAsyncThunk(
  'speech/translateTranscription',
  async ({ transcriptionId, targetLanguage }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${speechUrl}/translate/${transcriptionId}`,
        { targetLanguage },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: '텍스트 번역 실패' });
    }
  }
);

// 옵션에 따른 처리 (새로 추가)
export const processWithOptions = createAsyncThunk(
  'speech/processWithOptions',
  async ({ transcriptionId, options }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${speechUrl}/process-options`,
        { transcriptionId, options },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: '옵션 처리 실패' });
    }
  }
);

// 변환 결과를 노트로 저장 (기존 함수명 유지하면서 새 엔드포인트 사용)
export const saveTranscriptionAsNote = createAsyncThunk(
  'speech/saveTranscriptionAsNote',
  async ({ transcriptionId, noteData }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${speechUrl}/create-note`,
        {
          transcriptionId,
          title: noteData.title,
          content: noteData.content,
          category: noteData.category,
          tags: noteData.tags,
          includeAnalysis: noteData.includeAnalysis,
          includeTranslation: noteData.includeTranslation
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: '노트 저장 실패' });
    }
  }
);

// 새로운 노트 생성 함수 (VoiceUpload 컴포넌트용)
export const createNoteFromTranscription = createAsyncThunk(
  'speech/createNoteFromTranscription',
  async ({ transcriptionId, title, content, category, tags }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${speechUrl}/create-note`,
        {
          transcriptionId,
          title,
          content,
          category,
          tags
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: '노트 생성 실패' });
    }
  }
);

// 음성 변환 히스토리 조회
export const getSpeechHistory = createAsyncThunk(
  'speech/getSpeechHistory',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${speechUrl}/history`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: '변환 히스토리 조회 실패' });
    }
  }
);

// 초기 상태 (기존 구조 유지하면서 새 필드 추가)
const initialState = {
  currentFile: null,
  fileUploadProgress: 0,
  transcriptionJob: null,
  transcriptionResults: null,
  analysisResults: {
    summary: null,
    keyPhrases: [],
  },
  translationResults: {},
  history: [],
  loading: false,
  error: null,
  message: null,
  // 새로 추가된 필드들
  processingOptions: {
    summary: false,
    translation: false,
    targetLanguage: 'en'
  },
  optionProcessingStatus: {
    summary: 'idle', // 'idle', 'pending', 'completed', 'failed'
    translation: 'idle'
  }
};

const speechSlice = createSlice({
  name: 'speech',
  initialState,
  reducers: {
    setFileUploadProgress: (state, action) => {
      state.fileUploadProgress = action.payload;
    },
    resetSpeechState: (state) => {
      state.currentFile = null;
      state.fileUploadProgress = 0;
      state.transcriptionJob = null;
      state.transcriptionResults = null;
      state.analysisResults = {
        summary: null,
        keyPhrases: [],
      };
      state.translationResults = {};
      state.error = null;
      state.message = null;
      state.processingOptions = {
        summary: false,
        translation: false,
        targetLanguage: 'en'
      };
      state.optionProcessingStatus = {
        summary: 'idle',
        translation: 'idle'
      };
    },
    clearSpeechError: (state) => {
      state.error = null;
    },
    clearSpeechMessage: (state) => {
      state.message = null;
    },
    // 새로 추가된 액션들
    setProcessingOptions: (state, action) => {
      state.processingOptions = { ...state.processingOptions, ...action.payload };
    },
    resetOptionProcessingStatus: (state) => {
      state.optionProcessingStatus = {
        summary: 'idle',
        translation: 'idle'
      };
    }
  },
  extraReducers: (builder) => {
    builder
      // 음성 파일 업로드
      .addCase(uploadSpeechFile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadSpeechFile.fulfilled, (state, action) => {
        state.loading = false;
        state.currentFile = action.payload.file;
        state.transcriptionJob = action.payload.job;
        state.message = action.payload.message;
        state.fileUploadProgress = 100;
      })
      .addCase(uploadSpeechFile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || '음성 파일 업로드 실패';
        state.fileUploadProgress = 0;
      })
      
      // 음성 변환 상태 확인
      .addCase(checkTranscriptionStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkTranscriptionStatus.fulfilled, (state, action) => {
        console.log('상태 체크 성공:', action.payload);
        state.loading = false;
        state.transcriptionJob = action.payload.job; // job 정보 업데이트
        
        if (action.payload.job.status === 'COMPLETED') {
          // 백엔드에서 results가 넘어오면 transcriptionResults를 업데이트
          if (action.payload.results && action.payload.results.text) { // results 객체와 text 필드 모두 확인
            console.log('변환 결과 설정:', action.payload.results);
            state.transcriptionResults = action.payload.results; // 여기에 전체 results 객체 저장
            state.message = '음성 변환이 완료되었습니다.';
          } else {
            console.log('변환 완료되었지만 결과 없음');
            // 결과가 없는데 완료 상태라면 오류 처리 또는 메시지 조정 필요
            state.message = '음성 변환이 완료되었지만 결과를 가져오지 못했습니다.'; // 메시지 수정
            // state.error = '음성 변환 결과 가져오기 실패'; // 필요 시 오류로 처리
          }
        } else if (action.payload.job.status === 'FAILED') {
          state.error = '음성 변환에 실패했습니다.';
        } else {
          state.message = `음성 변환 중: ${action.payload.job.progress || 0}%`;
        }
      })
      .addCase(checkTranscriptionStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || '변환 상태 확인 실패';
      })
      
      // 변환된 텍스트 분석
      .addCase(analyzeTranscription.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.optionProcessingStatus.summary = 'pending';
      })
      .addCase(analyzeTranscription.fulfilled, (state, action) => {
        state.loading = false;
        state.analysisResults = {
          ...state.analysisResults,
          ...action.payload.analysis,
        };
        state.message = '텍스트 분석이 완료되었습니다.';
        state.optionProcessingStatus.summary = 'completed';
      })
      .addCase(analyzeTranscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || '텍스트 분석 실패';
        state.optionProcessingStatus.summary = 'failed';
      })
      
      // 변환된 텍스트 번역
      .addCase(translateTranscription.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.optionProcessingStatus.translation = 'pending';
      })
      .addCase(translateTranscription.fulfilled, (state, action) => {
        state.loading = false;
        state.translationResults = {
          ...state.translationResults,
          [action.payload.targetLanguage]: action.payload.translation, // 'text' 대신 'translation' 필드 사용 확인 (백엔드와 일치)
        };
        state.message = '텍스트 번역이 완료되었습니다.';
        state.optionProcessingStatus.translation = 'completed';
      })
      .addCase(translateTranscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || '텍스트 번역 실패';
        state.optionProcessingStatus.translation = 'failed';
      })
      
      // 옵션 처리 (새로 추가)
      .addCase(processWithOptions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(processWithOptions.fulfilled, (state, action) => {
        state.loading = false;
        const { results } = action.payload;
        
        if (results.analysis) {
          state.analysisResults = { ...state.analysisResults, ...results.analysis };
          state.optionProcessingStatus.summary = 'completed';
        }
        if (results.analysisError) {
          state.optionProcessingStatus.summary = 'failed';
          state.error = results.analysisError;
        }
        
        if (results.translation) {
          state.translationResults = { ...state.translationResults, ...results.translation };
          state.optionProcessingStatus.translation = 'completed';
        }
        if (results.translationError) {
          state.optionProcessingStatus.translation = 'failed';
          state.error = results.translationError;
        }
      })
      .addCase(processWithOptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || '옵션 처리 실패';
        state.optionProcessingStatus.summary = 'failed';
        state.optionProcessingStatus.translation = 'failed';
      })
      
      // 변환 결과를 노트로 저장 (기존)
      .addCase(saveTranscriptionAsNote.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveTranscriptionAsNote.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message || '노트가 성공적으로 저장되었습니다.';
      })
      .addCase(saveTranscriptionAsNote.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || '노트 저장 실패';
      })
      
      // 노트 생성 (새로 추가)
      .addCase(createNoteFromTranscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNoteFromTranscription.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message || '노트가 성공적으로 생성되었습니다.';
      })
      .addCase(createNoteFromTranscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || '노트 생성 실패';
      })
      
      // 음성 변환 히스토리 조회
      .addCase(getSpeechHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSpeechHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.history = action.payload.history;
      })
      .addCase(getSpeechHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || '변환 히스토리 조회 실패';
      });
  },
});

export const {
  setFileUploadProgress,
  resetSpeechState,
  clearSpeechError,
  clearSpeechMessage,
  setProcessingOptions,
  resetOptionProcessingStatus,
} = speechSlice.actions;

export default speechSlice.reducer;