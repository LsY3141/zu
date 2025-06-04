import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authApi from '../../api/authApi';
import i18n from '../../i18n'; // i18n import 추가

// =============================================================================
// ASYNC THUNKS
// =============================================================================

// 로그인
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authApi.login(credentials);
      
      // 토큰 저장
      localStorage.setItem('token', response.data.token);
      
      // 사용자 언어 설정이 있으면 i18n 언어 변경
      if (response.data.user?.language) {
        i18n.changeLanguage(response.data.user.language);
      }
      
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: '로그인에 실패했습니다.' }
      );
    }
  }
);

// 회원가입
export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authApi.register(userData);
      
      // 토큰 저장
      localStorage.setItem('token', response.data.token);
      
      // 언어 설정
      if (response.data.user?.language) {
        i18n.changeLanguage(response.data.user.language);
      }
      
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: '회원가입에 실패했습니다.' }
      );
    }
  }
);

// 사용자 정보 불러오기
export const loadUser = createAsyncThunk(
  'auth/loadUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authApi.getCurrentUser();
      
      // 사용자 언어로 i18n 설정
      if (response.data.user?.language) {
        i18n.changeLanguage(response.data.user.language);
      }
      
      return response.data;
    } catch (error) {
      // 토큰이 유효하지 않으면 제거
      localStorage.removeItem('token');
      
      return rejectWithValue(
        error.response?.data || { message: '사용자 정보를 불러올 수 없습니다.' }
      );
    }
  }
);

// 비밀번호 변경
export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (passwordData, { rejectWithValue }) => {
    try {
      const response = await authApi.changePassword(passwordData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: '비밀번호 변경에 실패했습니다.' }
      );
    }
  }
);

// 프로필 업데이트
export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await authApi.updateProfile(profileData);
      
      // 언어가 변경되었으면 i18n 언어도 변경
      if (profileData.language) {
        i18n.changeLanguage(profileData.language);
      }
      
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: '프로필 업데이트에 실패했습니다.' }
      );
    }
  }
);

// =============================================================================
// INITIAL STATE
// =============================================================================

const initialState = {
  // 사용자 인증 정보
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  user: null,
  
  // 상태 관리
  loading: false,
  error: null,
  message: null,
  
  // 추가 상태 (향후 확장용)
  lastLoginAt: null,
  loginAttempts: 0,
  isEmailVerified: true, // 기본값
};

// =============================================================================
// SLICE
// =============================================================================

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // 로그아웃
    logout: (state) => {
      // 토큰 제거
      localStorage.removeItem('token');
      
      // 상태 초기화
      state.token = null;
      state.isAuthenticated = false;
      state.user = null;
      state.error = null;
      state.message = '로그아웃 되었습니다.';
      state.lastLoginAt = null;
      state.loginAttempts = 0;
      
      // 기본 언어로 복원
      i18n.changeLanguage('ko');
    },
    
    // 에러 초기화
    clearError: (state) => {
      state.error = null;
    },
    
    // 메시지 초기화
    clearMessage: (state) => {
      state.message = null;
    },
    
    // 모든 알림 초기화
    clearNotifications: (state) => {
      state.error = null;
      state.message = null;
    },
    
    // 로그인 시도 횟수 증가
    incrementLoginAttempts: (state) => {
      state.loginAttempts += 1;
    },
    
    // 로그인 시도 횟수 초기화
    resetLoginAttempts: (state) => {
      state.loginAttempts = 0;
    },
  },
  
  extraReducers: (builder) => {
    builder
      // =======================================================================
      // 로그인
      // =======================================================================
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.message = action.payload.message || '로그인되었습니다.';
        state.lastLoginAt = new Date().toISOString();
        state.loginAttempts = 0; // 성공 시 초기화
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        state.error = action.payload?.message || '로그인에 실패했습니다.';
        state.loginAttempts += 1;
      })
      
      // =======================================================================
      // 회원가입
      // =======================================================================
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.message = action.payload.message || '회원가입이 완료되었습니다.';
        state.lastLoginAt = new Date().toISOString();
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        state.error = action.payload?.message || '회원가입에 실패했습니다.';
      })
      
      // =======================================================================
      // 사용자 정보 로드
      // =======================================================================
      .addCase(loadUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        // 로드 시에는 메시지 표시하지 않음
      })
      .addCase(loadUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        // 자동 로드 실패 시에는 에러 메시지 표시하지 않음
        // (사용자가 의도적으로 로그인하지 않은 상태일 수 있음)
      })
      
      // =======================================================================
      // 비밀번호 변경
      // =======================================================================
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message || '비밀번호가 변경되었습니다.';
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || '비밀번호 변경에 실패했습니다.';
      })
      
      // =======================================================================
      // 프로필 업데이트
      // =======================================================================
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        
        // 사용자 정보 업데이트 (기존 데이터 유지하면서 새 데이터로 덮어쓰기)
        state.user = {
          ...state.user,
          ...action.payload.user
        };
        
        state.message = action.payload.message || '프로필이 업데이트되었습니다.';
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || '프로필 업데이트에 실패했습니다.';
      });
  },
});

// =============================================================================
// EXPORTS
// =============================================================================

// Actions
export const { 
  logout, 
  clearError, 
  clearMessage, 
  clearNotifications,
  incrementLoginAttempts,
  resetLoginAttempts
} = authSlice.actions;

// Selectors (성능 최적화용)
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;
export const selectUserLanguage = (state) => state.auth.user?.language || 'ko';

// Reducer
export default authSlice.reducer;