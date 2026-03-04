import { LayoutDashboard, LogOut, Settings, User as UserIcon, Users } from 'lucide-react';
import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import '../App.css';
import { useConfirm } from '../components/common/ConfirmContext';
import { useAuthStore } from '../store/useAuthStore';

const MainLayout: React.FC = () => {
  const user = useAuthStore(state => state.user);
  const setLogout = useAuthStore(state => state.setLogout);
  const navigate = useNavigate();
  const { confirm } = useConfirm();

  const handleLogout = async () => {
    const ok = await confirm({
      title: '安全退出',
      message: '确定要注销当前系统账号吗？',
      confirmLabel: '退出登录',
      cancelLabel: '返回',
      variant: 'danger'
    });

    if (ok) {
      setLogout();
      navigate('/login');
    }
  };

  return (
    <div className="app-main min-h-screen">
      <header className="app-header glass-effect">
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
      
      <div className="app-wrapper">
        {/* Sidebar */}
        <aside className="app-sidebar backdrop-blur-sm">
          <div className="text-[10px] font-bold text-text-sub opacity-50 uppercase tracking-widest px-4 mb-2">主菜单</div>
          
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-text-sub hover:bg-primary/10 hover:text-primary rounded-xl transition-all"
          >
            <LayoutDashboard size={18} />
            工作台
          </button>

          <div className="text-[10px] font-bold text-text-sub opacity-50 uppercase tracking-widest px-4 mt-6 mb-2">系统管理</div>
          
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
        <main className="app-content">
           <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
