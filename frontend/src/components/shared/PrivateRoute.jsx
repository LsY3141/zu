import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Spinner from './Spinner';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading, token } = useSelector(state => state.auth);
  
  if (loading) {
    return <Spinner fullHeight={true} />;
  }
  
  if (!token && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

export default PrivateRoute;