import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import AuthGuard from './components/Auth/AuthGuard';
import { HasPermission } from './components/Auth/HasPermission';
import UserList from './features/sys-user/components/UserList';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login/Login';
import { useAuthStore } from './store/useAuthStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

const Dashboard: React.FC = () => {
  const user = useAuthStore(state => state.user);
  return (
    <div className="workbench-card glass-effect">
      <h2>欢迎开启高效随访工作</h2>
      <p style={{ marginTop: 12 }}>您目前的角色是：<b>{user?.roles.join(', ')}</b></p>
      
      <div style={{ marginTop: 32, padding: 20, background: 'rgba(0,86,210,0.03)', borderRadius: 12 }}>
         <p style={{ fontSize: 13, color: '#666' }}>权限指令级控制测试：</p>
         <div style={{ marginTop: 12, display: 'flex', gap: 12, justifyContent: 'center' }}>
            <HasPermission permission="user:add">
               <button className="test-btn">添加用户</button>
            </HasPermission>
            <HasPermission permission="patient:view">
               <button className="test-btn">查看患者</button>
            </HasPermission>
         </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={
            <AuthGuard>
              <MainLayout />
            </AuthGuard>
          }>
            <Route index element={<Dashboard />} />
            
            {/* 系统管理 */}
            <Route path="system">
              <Route path="users" element={<UserList />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
