import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sidebarOpen: true,
  calendarOpen: true,
  theme: 'light',
  notification: null,
  viewMode: 'list', // 'list' or 'grid'
  isConfirmDialogOpen: false,
  confirmDialogProps: {
    title: '',
    message: '',
    confirmText: '확인',
    cancelText: '취소',
    onConfirm: null,
    onCancel: null,
    danger: false
  }
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    toggleCalendar: (state) => {
      state.calendarOpen = !state.calendarOpen;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    showNotification: (state, action) => {
      state.notification = {
        message: action.payload.message,
        type: action.payload.type || 'info',
        duration: action.payload.duration || 3000,
      };
    },
    clearNotification: (state) => {
      state.notification = null;
    },
    setViewMode: (state, action) => {
      state.viewMode = action.payload;
    },
    // 확인 다이얼로그 열기
    openConfirmDialog: (state, action) => {
      const { 
        title, 
        message, 
        confirmText, 
        cancelText, 
        onConfirm, 
        onCancel, 
        danger 
      } = action.payload;
      
      state.isConfirmDialogOpen = true;
      state.confirmDialogProps = { 
        title, 
        message, 
        confirmText: confirmText || '확인',
        cancelText: cancelText || '취소',
        onConfirm: onConfirm || null,
        onCancel: onCancel || null,
        danger: danger || false
      };
    },
    // 확인 다이얼로그 닫기
    closeConfirmDialog: (state) => {
      state.isConfirmDialogOpen = false;
      state.confirmDialogProps = {
        title: '',
        message: '',
        confirmText: '확인',
        cancelText: '취소',
        onConfirm: null,
        onCancel: null,
        danger: false
      };
    },
  },
});

export const {
  toggleSidebar,
  toggleCalendar,
  toggleTheme,
  setTheme,
  showNotification,
  clearNotification,
  setViewMode,
  openConfirmDialog,
  closeConfirmDialog,
} = uiSlice.actions;

export default uiSlice.reducer;