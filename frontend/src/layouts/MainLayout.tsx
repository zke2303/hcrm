import { LayoutDashboard, LogOut, Settings, User as UserIcon, Users } from 'lucide-react';
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
    <div className="app-main min-h-screen flex flex-col">
      <header className="app-header glass-effect h-16 shrink-0">
        <div className="logo flex items-center">
          <div className="p-2 bg-primary/10 rounded-lg mr-3">
            <LayoutDashboard size={20} className="text-primary" />
          </div>
          <h1 className="text-lg font-bold tracking-tight">HCRM 医疗服务平台</h1>
        </div>
        <div className="user-area flex items-center gap-6">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-black/5 rounded-full">
             <UserIcon size={14} className="text-text-sub" />
             <span className="text-sm font-semibold">{user?.realName}</span>
          </div>
          <button 
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold border border-black/10 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all" 
            onClick={handleLogout}
          >
            <LogOut size={16} />
            <span>注销</span>
          </button>
        </div>
      </header>
      
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 border-r border-black/5 bg-white/50 backdrop-blur-sm p-4 flex flex-col gap-2">
          <div className="text-[10px] font-bold text-text-sub/50 uppercase tracking-widest px-4 mb-2">主菜单</div>
          
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-text-sub hover:bg-primary/10 hover:text-primary rounded-xl transition-all"
          >
            <LayoutDashboard size={18} />
            工作台
          </button>

          <div className="text-[10px] font-bold text-text-sub/50 uppercase tracking-widest px-4 mt-6 mb-2">系统管理</div>
          
          <button 
            onClick={() => navigate('/system/users')}
            className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-text-sub hover:bg-primary/10 hover:text-primary rounded-xl transition-all"
          >
            <Users size={18} />
            用户管理
          </button>

          <button 
            className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-text-sub hover:bg-primary/10 hover:text-primary rounded-xl transition-all opacity-50 cursor-not-allowed"
          >
            <Settings size={18} />
            权限设置
          </button>
        </aside>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50/50 p-8">
           <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
