import {
    Edit,
    Folder,
    Loader2,
    Menu as MenuIcon,
    MousePointer2,
    Plus,
    Trash2,
    ChevronRight
} from 'lucide-react';
import React, { useState } from 'react';
import { useConfirm } from '@/components/common/ConfirmContext';
import { useMessage } from '@/components/common/MessageContext';
import { useDeleteMenu, useMenuTree } from '../hooks/useMenus';
import type { Menu } from '../types';
import MenuDialog from './MenuDialog';

const MenuList: React.FC = () => {
  const { data: menuTree, isLoading, isError } = useMenuTree();
  const deleteMutation = useDeleteMenu();
  const { confirm } = useConfirm();
  const message = useMessage();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
  const [parentMenu, setParentMenu] = useState<Menu | null>(null);
  const [expandedIds, setExpandedIds] = useState<number[]>([]);

  const toggleExpand = (id: number) => {
    setExpandedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleAddChild = (parent: Menu) => {
    setParentMenu(parent);
    setSelectedMenu(null);
    setDialogOpen(true);
  };

  const handleEdit = (menu: Menu) => {
    setParentMenu(null);
    setSelectedMenu(menu);
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    const ok = await confirm({
      title: '确认删除',
      message: '确定要删除此菜单吗？如果包含子节点将无法删除。',
      confirmLabel: '确定删除',
      variant: 'danger',
    });
    
    if (ok) {
        try {
          await deleteMutation.mutateAsync(id);
          message.success('删除成功');
        } catch (err: any) {
          message.error(err.response?.data?.message || '删除失败');
        }
    }
  };

  const getTypeStyle = (type: number) => {
    switch (type) {
      case 0: return 'bg-orange-100 text-orange-700 border-orange-200';
      case 1: return 'bg-blue-100 text-blue-700 border-blue-200';
      case 2: return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-100';
    }
  };

  const renderRows = (nodes: Menu[], depth: number = 0) => {
    return nodes.map(node => {
      const isExpanded = expandedIds.includes(node.id);
      const hasChildren = node.children && node.children.length > 0;

      return (
        <React.Fragment key={node.id}>
          <tr className={`border-b border-gray-100 hover:bg-blue-50/20 transition-all ${depth > 0 ? 'bg-gray-50/20' : ''}`}>
            <td className="px-5 py-3">
              <div className="flex items-center gap-2" style={{ marginLeft: depth * 28 }}>
                {hasChildren ? (
                  <button 
                    onClick={() => toggleExpand(node.id)}
                    className="p-1 hover:bg-gray-200 rounded transition text-gray-400 hover:text-blue-600"
                  >
                    <ChevronRight size={14} className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-90' : 'rotate-0'}`} />
                  </button>
                ) : <div className="w-6" />}
                <div className={`p-1.5 rounded-lg ${node.type === 0 ? 'bg-orange-50 text-orange-600' : node.type === 1 ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-500'}`}>
                  {node.type === 0 ? <Folder size={16} /> : node.type === 1 ? <MenuIcon size={16} /> : <MousePointer2 size={16} />}
                </div>
                <span className="text-sm font-semibold text-gray-900">{node.name}</span>
              </div>
            </td>
            <td className="px-5 py-3 text-center">
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getTypeStyle(node.type)}`}>
                {node.type === 0 ? '目录' : node.type === 1 ? '菜单' : '按钮'}
              </span>
            </td>
            <td className="px-5 py-3 text-sm text-center font-mono text-gray-500">{node.perms || '-'}</td>
            <td className="px-5 py-3 text-sm text-gray-600 truncate max-w-[150px]">{node.path || '-'}</td>
            <td className="px-5 py-3 text-sm text-blue-600 truncate max-w-[150px] font-mono text-xs font-bold leading-normal">{node.apiPath || '-'}</td>
            <td className="px-5 py-3 text-sm text-center">
               <span className={`inline-block w-2.5 h-2.5 rounded-full ${node.status === 1 ? 'bg-green-500 animate-pulse' : 'bg-gray-300'} ring-4 ring-opacity-10 ${node.status === 1 ? 'ring-green-400' : 'ring-gray-300'}`}></span>
            </td>
            <td className="px-5 py-3 text-sm text-center">
              <div className="flex items-center justify-center gap-3">
                {node.type !== 2 && (
                  <button 
                    onClick={() => handleAddChild(node)}
                    className="text-green-600 hover:text-green-800 p-1 hover:bg-green-50 rounded transition" 
                    title="添加下级"
                  >
                    <Plus size={16} />
                  </button>
                )}
                <button 
                   onClick={() => handleEdit(node)}
                   className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded transition"
                   title="编辑"
                >
                  <Edit size={16} />
                </button>
                <button 
                   onClick={() => handleDelete(node.id)}
                   className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded transition"
                   title="删除"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </td>
          </tr>
          {hasChildren && isExpanded && renderRows(node.children!, depth + 1)}
        </React.Fragment>
      );
    });
  };

  if (isError) {
    return (
      <div className="p-10 text-center bg-white rounded-xl shadow-sm border border-red-100">
        <p className="text-red-500 font-bold mb-4">资源树加载异常，请联系系统管理员</p>
        <button onClick={() => window.location.reload()} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold shadow-lg shadow-blue-100 transition hover:bg-blue-700">立即刷新</button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <MenuIcon size={20} className="text-blue-600" />
            菜单权限资源池
        </h2>
        <button 
          onClick={() => { setParentMenu(null); setSelectedMenu(null); setDialogOpen(true); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100 active:scale-95"
        >
          <Plus size={18} />
          新建顶级菜单
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative min-h-[500px]">
        {isLoading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] z-10 flex items-center justify-center">
             <div className="flex flex-col items-center gap-3">
                <Loader2 size={40} className="text-blue-600 animate-spin" />
                <span className="text-sm font-bold text-gray-500">正在索引全局资源...</span>
             </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">菜单名称</th>
                <th className="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-center">类型</th>
                <th className="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-center">权限码</th>
                <th className="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">路由路径</th>
                <th className="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">API路径</th>
                <th className="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-center">状态</th>
                <th className="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {menuTree && renderRows(menuTree)}
              {menuTree?.length === 0 && !isLoading && (
                <tr>
                   <td colSpan={7} className="px-5 py-20 text-center text-gray-400 bg-white">
                      <div className="flex flex-col items-center gap-3">
                         <Folder size={64} className="text-gray-100 mb-2" />
                         <span className="text-gray-300 font-bold">空荡荡的，先创建一些资源吧</span>
                      </div>
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {dialogOpen && (
        <MenuDialog 
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          menu={selectedMenu}
          parent={parentMenu}
        />
      )}
    </div>
  );
};

export default MenuList;
