import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loadUser, logout } from '../redux/slices/authSlice';

const useAuth = (requireAuth = true) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user, loading, token } = useSelector((state) => state.auth);
  
  useEffect(() => {
    // 로컬 스토리지에 토큰이 있는데 사용자 정보가 없는 경우
    if (token && !user && !loading) {
      dispatch(loadUser());
    }
    
    // 인증이 필요한 페이지에서 토큰이 없거나 인증 실패 시 로그인 페이지로 리다이렉트
    if (requireAuth && !token && !loading) {
      navigate('/login');
    }
    
    // 이미 인증된 사용자가 로그인 또는 회원가입 페이지에 접근하면 메인 페이지로 리다이렉트
    if (!requireAuth && isAuthenticated) {
      navigate('/');
    }
  }, [dispatch, isAuthenticated, loading, navigate, requireAuth, token, user]);
  
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };
  
  return { isAuthenticated, user, loading, handleLogout };
};

export default useAuth;