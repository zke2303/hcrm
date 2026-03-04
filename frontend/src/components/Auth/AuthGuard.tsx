import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * 身份验证路由守卫
 */
const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const isLogin = useAuthStore(state => state.isLogin);
  const location = useLocation();

  if (!isLogin) {
    // 强制跳转回登录页，并携带 redirect 参数
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
