import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import LoginModal from './LoginModal';

const allowedPaths = [
  '/dashboard',
  '/movie',
  '/movielist',
  '/moviedetail',
  '/food',
  '/foodlist',
  '/surprise'
];

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  const location = useLocation();

  const isAllowed = allowedPaths.some(path => location.pathname.startsWith(path));

  if (!user && !isAllowed) {
    return <LoginModal />;
  }

  return children;
}

export default ProtectedRoute;