import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/userapi';

// 사용자 통계 조회 액션
export const getUserStats = createAsyncThunk(
'user/getUserStats',
async (_, { rejectWithValue }) => {
try {
    const response = await api.get('/users/stats');
    return response.data.stats;
} catch (error) {
    return rejectWithValue(
    error.response?.data?.message || '통계 정보를 가져오는데 실패했습니다.'
    );
}
}
);

// 프로필 업데이트 액션
export const updateUserProfile = createAsyncThunk(
'user/updateProfile',
async (profileData, { rejectWithValue }) => {
try {
    const response = await api.put('/users/profile', profileData);
    return response.data.user;
} catch (error) {
    return rejectWithValue(
    error.response?.data?.message || '프로필 업데이트에 실패했습니다.'
    );
}
}
);

const initialState = {
stats: null,
loading: false,
error: null,
message: null,
};

const userSlice = createSlice({
name: 'user',
initialState,
reducers: {
clearUserMessage: (state) => {
    state.message = null;
    state.error = null;
},
clearUserError: (state) => {
    state.error = null;
},
resetUserState: (state) => {
    return initialState;
},
},
extraReducers: (builder) => {
builder
    // 사용자 통계 조회
    .addCase(getUserStats.pending, (state) => {
    state.loading = true;
    state.error = null;
    })
    .addCase(getUserStats.fulfilled, (state, action) => {
    state.loading = false;
    state.stats = action.payload;
    state.error = null;
    })
    .addCase(getUserStats.rejected, (state, action) => {
    state.loading = false;
    state.error = action.payload;
    state.stats = null;
    })
    
    // 프로필 업데이트
    .addCase(updateUserProfile.pending, (state) => {
    state.loading = true;
    state.error = null;
    })
    .addCase(updateUserProfile.fulfilled, (state, action) => {
    state.loading = false;
    state.message = '프로필이 성공적으로 업데이트되었습니다.';
    state.error = null;
    })
    .addCase(updateUserProfile.rejected, (state, action) => {
    state.loading = false;
    state.error = action.payload;
    });
},
});

export const { clearUserMessage, clearUserError, resetUserState } = userSlice.actions;
export default userSlice.reducer;