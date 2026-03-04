import { LayoutDashboard, LogOut, User as UserIcon } from 'lucide-react';
import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import '../App.css';
import { useAuthStore } from '../store/useAuthStore';

const MainLayout: React.FC = () => {
  const user = useAuthStore(state => state.user);
  const setLogout = useAuthStore(state => state.setLogout);
  const navigate = useNavigate();

  const handleLogout = () => {
    setLogout();
    navigate('/login');
  };

  return (
    <div className="app-main">
      <header className="app-header glass-effect">
        <div className="logo flex-center">
          <LayoutDashboard size={24} color="#0056D2" />
          <h1 style={{ marginLeft: 12, fontSize: 18, fontWeight: 700 }}>HCRM 工作台</h1>
        </div>
        <div className="user-area flex-center">
          <div className="user-info-chip flex-center">
             <UserIcon size={14} style={{ marginRight: 6 }} />
             <span className="username">{user?.realName}</span>
          </div>
          <button className="logout-btn flex-center" onClick={handleLogout}>
            <LogOut size={16} />
            <span>注销</span>
          </button>
        </div>
      </header>
      
      <main className="content">
         <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
