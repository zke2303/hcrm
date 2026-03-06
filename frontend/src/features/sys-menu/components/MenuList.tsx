import {
    ChevronRight,
    Edit3,
    Folder,
    Loader2,
    Menu as MenuIcon,
    MousePointer2,
    Plus,
    Trash2,
    Search,
    RotateCcw
} from 'lucide-react';
import React, { useState, useTransition } from 'react';
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

  const [isPending, startTransition] = useTransition();
  const [keyword, setKeyword] = useState('');
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
      title: '删除确认',
      message: '确定要删除此菜单吗？如果该菜单包含下级子项，将无法直接删除。此操作不可恢复。',
      confirmLabel: '确定删除',
      variant: 'danger',
    });
    
    if (ok) {
        try {
          await deleteMutation.mutateAsync(id);
          message.success('菜单资源删除成功');
        } catch (err: any) {
          message.error(err.response?.data?.message || '删除失败');
        }
    }
  };

  const handleReset = () => {
    setKeyword('');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(() => {
        // 本地过滤或刷新
    });
  };

  const getTypeStyle = (type: number) => {
    switch (type) {
      case 0: return 'bg-orange-50 text-orange-600 border-orange-100';
      case 1: return 'bg-blue-50 text-blue-600 border-blue-100';
      case 2: return 'bg-gray-50 text-gray-500 border-gray-100';
      default: return 'bg-gray-50 text-gray-500 border-gray-100';
    }
  };

  const renderRows = (nodes: Menu[], depth: number = 0) => {
    // 简单的关键词本地搜索过滤逻辑
    const filteredNodes = keyword 
        ? nodes.filter(node => 
            node.name.includes(keyword) || 
            (node.children && node.children.some(child => child.name.includes(keyword)))
          )
        : nodes;

    return filteredNodes.map(node => {
      const isExpanded = expandedIds.includes(node.id);
      const hasChildren = node.children && node.children.length > 0;

      return (
        <React.Fragment key={node.id}>
          <tr className={`border-b border-gray-50 hover:bg-blue-50/30 transition-all ${depth > 0 ? 'bg-gray-50/20' : ''}`}>
            <td className="px-4 py-3.5">
              <div className="flex items-center gap-2" style={{ marginLeft: depth * 24 }}>
                {hasChildren ? (
                  <button 
                    onClick={() => toggleExpand(node.id)}
                    className="p-1 hover:bg-white rounded shadow-sm transition text-gray-400 hover:text-blue-600 border border-transparent hover:border-gray-200"
                  >
                    <ChevronRight size={14} className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-90' : 'rotate-0'}`} />
                  </button>
                ) : <div className="w-6" />}
                <div className={`p-1.5 rounded-lg ${node.type === 0 ? 'bg-orange-50 text-orange-600' : node.type === 1 ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-500'}`}>
                  {node.type === 0 ? <Folder size={16} /> : node.type === 1 ? <MenuIcon size={16} /> : <MousePointer2 size={16} />}
                </div>
                <span className="text-sm font-bold text-gray-900">{node.name}</span>
              </div>
            </td>
            <td className="px-4 py-3.5 text-center">
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getTypeStyle(node.type)}`}>
                {node.type === 0 ? '目录' : node.type === 1 ? '菜单' : '按钮'}
              </span>
            </td>
            <td className="px-4 py-3.5 text-center">
              <code className="text-[11px] font-mono text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                {node.perms || '-'}
              </code>
            </td>
            <td className="px-4 py-3.5 text-sm text-gray-600 max-w-[150px] truncate font-mono text-xs">
              {node.path || '-'}
            </td>
            <td className="px-4 py-3.5 text-sm text-blue-600 max-w-[150px] truncate font-mono text-xs font-medium">
              {node.apiPath || '-'}
            </td>
            <td className="px-4 py-3.5 text-center">
               <div className="flex items-center justify-center">
                 <span className={`inline-block w-2.5 h-2.5 rounded-full ${node.status === 1 ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'} ring-4 ring-opacity-10 ${node.status === 1 ? 'ring-emerald-400' : 'ring-gray-300'}`}></span>
               </div>
            </td>
            <td className="px-4 py-3.5">
              <div className="flex items-center justify-center gap-2">
                {node.type !== 2 && (
                  <button 
                    onClick={() => handleAddChild(node)}
                    className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" 
                    title="添加下级"
                  >
                    <Plus size={16} />
                  </button>
                )}
                <button 
                   onClick={() => handleEdit(node)}
                   className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                   title="编辑"
                >
                  <Edit3 size={16} />
                </button>
                <button 
                   onClick={() => handleDelete(node.id)}
                   className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
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

  return (
    <div className="m-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">菜单管理</h1>
          <p className="text-sm text-gray-500 mt-1">配置系统导航菜单、页面组件及接口权限标识</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => { setParentMenu(null); setSelectedMenu(null); setDialogOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all text-sm font-medium shadow-sm active:scale-95"
          >
            <Plus size={16} />
            新增顶级菜单
          </button>
        </div>
      </div>

      <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-100 mb-6 shadow-sm">
        <form onSubmit={handleSearch} className="flex flex-wrap items-end gap-6">
          <div className="flex flex-col gap-2 flex-1 min-w-[300px]">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">资源搜索</label>
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={16} />
              <input
                type="text"
                placeholder="搜索菜单名称、权限标识、API路径..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              type="submit"
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 transition-all active:scale-95 shadow-md shadow-blue-100"
            >
              <Search size={16} />
              查询
            </button>
            <button 
              type="button"
              onClick={handleReset}
              className="flex items-center gap-2 px-6 py-2 bg-white border border-gray-200 text-gray-600 text-sm font-bold rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95 shadow-sm"
            >
              <RotateCcw size={16} />
              重置
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg relative shadow-sm overflow-hidden min-h-[400px]">
        {(isLoading || isPending) && (
          <div className="absolute inset-0 bg-white/60 z-20 flex justify-center items-center backdrop-blur-[1px]">
            <Loader2 className="animate-spin text-blue-600" size={32} />
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200">
                <th className="px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider pl-6">菜单名称</th>
                <th className="px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">类型</th>
                <th className="px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">权限码</th>
                <th className="px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">路由路径</th>
                <th className="px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">API路径</th>
                <th className="px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">状态</th>
                <th className="px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isError ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center text-rose-600 text-sm font-medium">
                    数据加载失败，请检查网络或刷新重试。
                    <div className="mt-4">
                      <button onClick={() => window.location.reload()} className="px-4 py-2 bg-rose-50 rounded-md hover:bg-rose-100 transition-colors">立即刷新</button>
                    </div>
                  </td>
                </tr>
              ) : menuTree?.length === 0 && !isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-24 text-center text-gray-400 text-sm italic">
                    暂无相关菜单资源数据
                  </td>
                </tr>
              ) : (
                menuTree && renderRows(menuTree)
              )}
            </tbody>
          </table>
        </div>
      </div>

      <MenuDialog 
        key={selectedMenu?.id ? `edit-${selectedMenu.id}` : parentMenu?.id ? `add-${parentMenu.id}` : 'new'}
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)} 
        menu={selectedMenu} 
        parent={parentMenu}
      />
    </div>
  );
};

export default MenuList;
