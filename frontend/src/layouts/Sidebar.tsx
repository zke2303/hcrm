import { ChevronDown, ChevronRight, LayoutDashboard, Settings, Users, Shield, Database, Activity } from 'lucide-react';
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface MenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  path?: string;
  children?: MenuItem[];
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

const MENU_DATA: MenuSection[] = [
  {
    title: '统计分析',
    items: [
      {
        id: 'dashboard',
        label: '工作台',
        icon: <LayoutDashboard size={18} />,
        path: '/'
      }
    ]
  },
  {
    title: '系统核心',
    items: [
      {
        id: 'system',
        label: '系统管理',
        icon: <Settings size={18} />,
        children: [
          {
            id: 'users',
            label: '用户管理',
            icon: <Users size={16} />,
            path: '/system/users'
          },
          {
            id: 'roles',
            label: '角色权限',
            icon: <Shield size={16} />,
            path: '/system/roles'
          },
          {
            id: 'dicts',
            label: '字典数据',
            icon: <Database size={16} />,
            path: '/system/dicts'
          }
        ]
      },
      {
        id: 'monitor',
        label: '系统监控',
        icon: <Activity size={18} />,
        children: [
          {
            id: 'logs',
            label: '操作日志',
            path: '/system/logs'
          }
        ]
      }
    ]
  }
];

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState<string[]>(['system']);

  const toggleMenu = (id: string) => {
    setOpenMenus(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id) 
        : [...prev, id]
    );
  };

  const isActive = (path?: string) => {
    if (!path) return false;
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isOpen = openMenus.includes(item.id);
    const active = isActive(item.path);

    return (
      <div key={item.id} className="w-full">
        <button
          onClick={() => {
            if (hasChildren) {
              toggleMenu(item.id);
            } else if (item.path) {
              navigate(item.path);
            }
          }}
          className={`
            w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-all duration-200 group relative
            ${active 
              ? 'bg-blue-50 text-blue-700 font-bold' 
              : 'text-gray-600 hover:bg-gray-100 hover:text-blue-600'
            }
            ${level > 0 ? 'mt-1' : 'mt-2'}
          `}
          style={{ paddingLeft: level > 0 ? `${(level + 1) * 1.25}rem` : '1rem' }}
        >
          {active && (
            <motion.div 
              layoutId="sidebar-active-indicator"
              className="absolute left-0 w-1 h-6 bg-blue-600 rounded-r-full"
            />
          )}
          <div className="flex items-center gap-3">
            {item.icon && (
              <span className={`${active ? 'text-blue-600' : 'text-gray-500 group-hover:text-blue-600'}`}>
                {item.icon}
              </span>
            )}
            <span className="text-sm tracking-wide">
              {item.label}
            </span>
          </div>
          {hasChildren && (
            <span className={`${active ? 'text-blue-600' : 'text-gray-400'}`}>
              {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </span>
          )}
        </button>

        <AnimatePresence>
          {hasChildren && isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              {item.children?.map(child => renderMenuItem(child, level + 1))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <aside className="app-sidebar backdrop-blur-md bg-white/80 border-r border-gray-100 flex flex-col gap-6 p-4">
      {MENU_DATA.map((section, idx) => (
        <div key={idx} className="flex flex-col">
          <div className="px-4 mb-2">
            <h3 className="text-xs font-semibold text-gray-400 tracking-wider">
              {section.title}
            </h3>
          </div>
          <div className="flex flex-col">
            {section.items.map(item => renderMenuItem(item))}
          </div>
        </div>
      ))}
    </aside>
  );
};

export default Sidebar;
