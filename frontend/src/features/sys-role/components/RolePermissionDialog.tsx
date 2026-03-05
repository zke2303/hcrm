import { Loader2, Save, ShieldCheck, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useMessage } from '@/components/common/MessageContext';
import { useMenuTree } from '../../sys-menu/hooks/useMenus';
import type { Menu } from '../../sys-menu/types';
import { useAssignRoleMenus, useRoleMenus } from '../hooks/useRoles';
import type { Role } from '../types';

interface RolePermissionDialogProps {
  open: boolean;
  onClose: () => void;
  role: Role;
}

const RolePermissionDialog: React.FC<RolePermissionDialogProps> = ({ open, onClose, role }) => {
  const { data: menuTree, isLoading: treeLoading } = useMenuTree();
  const { data: roleMenus, isLoading: roleMenusLoading } = useRoleMenus(role.id);
  const assignMenusMutation = useAssignRoleMenus();
  const message = useMessage();

  const [checkedIds, setCheckedIds] = useState<number[]>([]);
  const [expandedIds, setExpandedIds] = useState<number[]>([]);

  useEffect(() => {
    if (roleMenus) {
      setCheckedIds(roleMenus);
    }
  }, [roleMenus]);

  const toggleExpand = (id: number) => {
    setExpandedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleCheck = (id: number, children?: Menu[]) => {
     const isChecked = checkedIds.includes(id);
     let newIds = isChecked ? checkedIds.filter(i => i !== id) : [...checkedIds, id];
     
     // 联动选择子节点
     if (children && children.length > 0) {
        const childIds = getAllChildIds(children);
        if (isChecked) {
            newIds = newIds.filter(i => !childIds.includes(i));
        } else {
            newIds = Array.from(new Set([...newIds, ...childIds]));
        }
     }
     
     setCheckedIds(newIds);
  };

  const getAllChildIds = (nodes: Menu[]): number[] => {
    let ids: number[] = [];
    nodes.forEach(node => {
        ids.push(node.id);
        if (node.children) {
            ids = ids.concat(getAllChildIds(node.children));
        }
    });
    return ids;
  };

  const handleSave = async () => {
    try {
      await assignMenusMutation.mutateAsync({ id: role.id, menuIds: checkedIds });
      message.success('权限分配成功');
      onClose();
    } catch (err: any) {
      message.error(err.response?.data?.message || '分配失败');
    }
  };

  const renderTreeNode = (node: Menu) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedIds.includes(node.id);
    const isChecked = checkedIds.includes(node.id);

    return (
      <div key={node.id} className="ml-4">
        <div className="flex items-center gap-2 group py-1.5 hover:bg-gray-50 rounded px-2 transition">
          {hasChildren ? (
            <button 
                onClick={() => toggleExpand(node.id)}
                className="w-4 h-4 flex items-center justify-center text-gray-400 hover:text-blue-600 transition"
            >
               <span className="text-xs transition transform duration-200" style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0)' }}>▶</span>
            </button>
          ) : <div className="w-4" />}
          
          <label className="flex items-center gap-2 cursor-pointer flex-1">
            <input 
                type="checkbox" 
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition cursor-pointer"
                checked={isChecked}
                onChange={() => handleCheck(node.id, node.children)}
            />
            <span className={`text-sm select-none ${isChecked ? 'text-blue-700 font-semibold' : 'text-gray-700 font-medium'}`}>{node.name}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-tight ${
                 node.type === 0 ? 'bg-orange-100 text-orange-600' :
                 node.type === 1 ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
            }`}>
                 {node.type === 0 ? '目录' : node.type === 1 ? '菜单' : '按钮'}
            </span>
          </label>
        </div>
        
        {hasChildren && isExpanded && (
          <div className="border-l border-gray-200 ml-2 animate-in slide-in-from-left-2 duration-200">
            {node.children!.map(child => renderTreeNode(child))}
          </div>
        )}
      </div>
    );
  };

  if (!open) return null;

  const totalLoading = treeLoading || roleMenusLoading;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[85vh] transform animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">权限分配</h3>
              <p className="text-xs text-gray-400 mt-0.5 font-medium">当前角色：<span className="text-indigo-600 font-bold">{role.name}</span></p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-full transition">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 scroll-smooth bg-white/50">
          {totalLoading ? (
             <div className="flex flex-col items-center justify-center p-20 gap-3">
               <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
               <span className="text-sm font-semibold text-gray-500">正在构建权限树...</span>
             </div>
          ) : (
             <div className="space-y-1">
                <div className="mb-4 bg-blue-50/50 p-3 rounded-xl border border-blue-100 text-xs text-blue-600 font-medium leading-relaxed">
                   提示：勾选目录将自动选中其下属的所有菜单及按钮。请根据角色职责需求精细化配置。
                </div>
                {menuTree?.map(node => renderTreeNode(node))}
                {(!menuTree || menuTree.length === 0) && (
                   <div className="p-12 text-center text-gray-400 bg-gray-50 rounded-xl">未配置系统菜单资源</div>
                )}
             </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50/30 flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-200 transition active:scale-95"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={totalLoading || assignMenusMutation.isPending}
            className="flex-1 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {assignMenusMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            保存授权
          </button>
        </div>
      </div>
    </div>
  );
};

export default RolePermissionDialog;
