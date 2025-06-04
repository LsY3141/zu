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

// 음성 파일 업로드
export const uploadSpeechFile = createAsyncThunk(
  'speech/uploadSpeechFile',
  async (formData, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${speechUrl}/upload`, formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          dispatch(setFileUploadProgress(percentCompleted));
        },
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
        options,
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

// 변환 결과를 노트로 저장
export const saveTranscriptionAsNote = createAsyncThunk(
  'speech/saveTranscriptionAsNote',
  async ({ transcriptionId, noteData }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${speechUrl}/save-as-note/${transcriptionId}`,
        noteData,
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
    },
    clearSpeechError: (state) => {
      state.error = null;
    },
    clearSpeechMessage: (state) => {
      state.message = null;
    },
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
      })
      .addCase(uploadSpeechFile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || '음성 파일 업로드 실패';
      })
      // 음성 변환 상태 확인
      .addCase(checkTranscriptionStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkTranscriptionStatus.fulfilled, (state, action) => {
  console.log('상태 체크 성공:', action.payload);
  state.loading = false;
  state.transcriptionJob = action.payload.job;
  
  if (action.payload.job.status === 'COMPLETED') {
    if (action.payload.results) {
      console.log('변환 결과 설정:', action.payload.results);
      state.transcriptionResults = action.payload.results;
      state.message = '음성 변환이 완료되었습니다.';
    } else {
      console.log('변환 완료되었지만 결과 없음');
      state.message = '음성 변환이 완료되었지만 결과를 가져오는 중입니다...';
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
      })
      .addCase(analyzeTranscription.fulfilled, (state, action) => {
        state.loading = false;
        state.analysisResults = {
          ...state.analysisResults,
          ...action.payload.analysis,
        };
        state.message = '텍스트 분석이 완료되었습니다.';
      })
      .addCase(analyzeTranscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || '텍스트 분석 실패';
      })
      // 변환된 텍스트 번역
      .addCase(translateTranscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(translateTranscription.fulfilled, (state, action) => {
        state.loading = false;
        state.translationResults = {
          ...state.translationResults,
          [action.payload.targetLanguage]: action.payload.translation,
        };
        state.message = '텍스트 번역이 완료되었습니다.';
      })
      .addCase(translateTranscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || '텍스트 번역 실패';
      })
      // 변환 결과를 노트로 저장
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
} = speechSlice.actions;

export default speechSlice.reducer;