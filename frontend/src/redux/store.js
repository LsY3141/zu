// src/redux/store.js - ChatBot 슬라이스 추가
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import noteReducer from './slices/noteSlice';
import uiReducer from './slices/uiSlice';
import speechReducer from './slices/speechSlice';
import chatReducer from './slices/chatSlice';
import userReducer from './slices/userSlice'; // 추가

const store = configureStore({
  reducer: {
    auth: authReducer,
    notes: noteReducer,
    ui: uiReducer,
    speech: speechReducer,
    chat: chatReducer,
    user: userReducer // 추가
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Redux에서 함수 저장을 허용 (채팅 콜백 함수용)
        ignoredActions: ['chat/toggleChat'],
        ignoredPaths: ['chat.currentChat.onMessage'],
      },
    }),
});

export default store;