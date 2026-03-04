import { LayoutDashboard, LogOut, User as UserIcon } from 'lucide-react';
import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import '../App.css';
import { useConfirm } from '../components/common/ConfirmContext';
import { useAuthStore } from '../store/useAuthStore';
import Sidebar from './Sidebar';

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
    <div className="app-main min-h-screen flex flex-col">
      <header className="app-header glass-effect shrink-0">
        <div className="logo flex items-center">
          <div className="p-2 bg-blue-600/10 rounded-lg mr-3">
            <LayoutDashboard size={20} className="text-blue-600" />
          </div>
          <h1 className="text-lg font-bold tracking-tight text-gray-900">HCRM 医疗服务平台</h1>
        </div>
        <div className="user-area flex items-center gap-6">
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-100/80 rounded-full border border-gray-200 shadow-sm">
             <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                <UserIcon size={12} className="text-white" />
             </div>
             <span className="text-sm font-bold text-gray-700">{user?.realName}</span>
          </div>
          <button 
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold border border-gray-200 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all shadow-sm bg-white" 
            onClick={handleLogout}
          >
            <LogOut size={16} />
            <span>注销</span>
          </button>
        </div>
      </header>
      
      <div className="app-wrapper flex-1 flex overflow-hidden">
        <Sidebar aria-label="侧边栏" />

        {/* Content */}
        <main className="app-content flex-1 overflow-y-auto bg-slate-50 p-8">
           <div className="max-w-[1600px] mx-auto">
              <Outlet />
           </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
