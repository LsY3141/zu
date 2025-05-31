import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ThemeProvider } from 'styled-components';
import { loadUser } from './redux/slices/authSlice';
import theme from './styles/theme';
import GlobalStyle from './styles/GlobalStyle';

// 레이아웃 컴포넌트
import Layout from './components/layout/Layout';
import PrivateRoute from './components/shared/PrivateRoute';
import ConfirmDialog from './components/shared/ConfirmDialog';
import Notification from './components/shared/Notification';

// 페이지 컴포넌트
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import NoteList from './pages/NoteList';
import NoteDetail from './pages/NoteDetail';
import NoteEditor from './pages/NoteEditor';
import VoiceUpload from './pages/VoiceUpload';
import SharedByMeNotes from './pages/SharedByMeNotes';
import SharedWithMeNotes from './pages/SharedWithMeNotes';
import Trash from './pages/Trash';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

const App = () => {
  const dispatch = useDispatch();
  
  useEffect(() => {
    // 페이지 로드 시 로컬 스토리지에 토큰이 있으면 사용자 정보 로드
    if (localStorage.getItem('token')) {
      dispatch(loadUser());
    }
  }, [dispatch]);
  
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Router>
        <ConfirmDialog />
        <Notification />
        <Routes>
          {/* 공개 라우트 */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          
          {/* 인증된 사용자만 접근 가능한 라우트 */}
          <Route path="/" element={<Layout />}>
            <Route index element={<PrivateRoute><Home /></PrivateRoute>} />
            <Route path="notes" element={<PrivateRoute><NoteList /></PrivateRoute>} />
            <Route path="notes/:id" element={<PrivateRoute><NoteDetail /></PrivateRoute>} />
            <Route path="notes/create" element={<PrivateRoute><NoteEditor /></PrivateRoute>} />
            <Route path="notes/edit/:id" element={<PrivateRoute><NoteEditor isEdit={true} /></PrivateRoute>} />
            <Route path="voice" element={<PrivateRoute><VoiceUpload /></PrivateRoute>} />
            <Route path="shared" element={<PrivateRoute><SharedByMeNotes /></PrivateRoute>} />
            <Route path="shared-with-me" element={<PrivateRoute><SharedWithMeNotes /></PrivateRoute>} />
            <Route path="trash" element={<PrivateRoute><Trash /></PrivateRoute>} />
            <Route path="profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          </Route>
          
          {/* 404 페이지 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;