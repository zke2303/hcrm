import {
    ChevronLeft,
    ChevronRight,
    Copy,
    Edit3,
    Loader2,
    Plus,
    ShieldCheck,
    Trash2,
    Search,
    RotateCcw
} from 'lucide-react';
import React, { useState, useTransition } from 'react';
import { useConfirm } from '@/components/common/ConfirmContext';
import { useMessage } from '@/components/common/MessageContext';
import { useCopyRole, useDeleteRole, useRoles, useUpdateRoleStatus } from '../hooks/useRoles';
import type { Role, RoleListParams } from '../types';
import RoleDialog from './RoleDialog';
import RolePermissionDialog from './RolePermissionDialog';

const RoleList: React.FC = () => {
  const [params, setParams] = useState<RoleListParams>({
    page: 1,
    pageSize: 10,
    name: '',
  });

  const [isPending, startTransition] = useTransition();
  const { data: resp, isLoading, isError } = useRoles(params);
  const updateStatusMutation = useUpdateRoleStatus();
  const deleteMutation = useDeleteRole();
  const copyMutation = useCopyRole();
  const { confirm } = useConfirm();
  const message = useMessage();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [permissionOpen, setPermissionOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(() => {
        setParams(prev => ({ ...prev, page: 1 }));
    });
  };

  const handlePageChange = (newPage: number) => {
    startTransition(() => {
      setParams(p => ({ ...p, page: newPage }));
    });
  };

  const handleToggleStatus = async (role: Role) => {
     if (role.isSystem === 1) {
        message.info('系统内置角色，禁止修改状态');
        return;
     }
     try {
        await updateStatusMutation.mutateAsync({ id: role.id, status: role.status === 1 ? 0 : 1 });
        message.success('角色状态更新成功');
     } catch (err: any) {
        message.error(err.response?.data?.message || '状态更新失败');
     }
  };

  const handleDelete = async (id: number) => {
    const ok = await confirm({
      title: '删除确认',
      message: '确定要删除该角色吗？删除后关联该角色的用户将失去相应权限。此操作不可恢复。',
      confirmLabel: '确定删除',
      variant: 'danger',
    });
    
    if (ok) {
        try {
          await deleteMutation.mutateAsync(id);
          message.success('角色删除成功');
        } catch (err: any) {
          message.error(err.response?.data?.message || '删除失败');
        }
    }
  };

  const handleCopy = async (id: number) => {
     try {
        await copyMutation.mutateAsync(id);
        message.success('角色复制成功');
     } catch (err: any) {
        message.error(err.response?.data?.message || '复制失败');
     }
  };

  const getScopeText = (scope: number) => {
    switch (scope) {
      case 1: return '全部数据';
      case 2: return '本机构';
      case 3: return '本科室';
      case 4: return '仅本人';
      default: return '未知';
    }
  };

  return (
    <div className="m-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">角色管理</h1>
          <p className="text-sm text-gray-500 mt-1">定义系统角色、配置数据权限范围及功能权限分配</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => { setSelectedRole(null); setDialogOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all text-sm font-medium shadow-sm active:scale-95"
          >
            <Plus size={16} />
            新增角色
          </button>
        </div>
      </div>

      <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-100 mb-6 shadow-sm">
        <form onSubmit={handleSearch} className="flex flex-wrap items-end gap-6">
          <div className="flex flex-col gap-2 flex-1 min-w-[300px]">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">角色搜索</label>
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={16} />
              <input
                type="text"
                placeholder="搜索角色名称、角色编码..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
                value={params.name}
                onChange={e => setParams(p => ({ ...p, name: e.target.value }))}
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
              onClick={() => setParams({ page: 1, pageSize: 10, name: '' })}
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
                <th className="px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider pl-6">角色信息</th>
                <th className="px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">角色编码</th>
                <th className="px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">数据范围</th>
                <th className="px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">状态</th>
                <th className="px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">创建时间</th>
                <th className="px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isError ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-rose-600 text-sm font-medium">
                    数据加载失败，请检查网络或刷新重试。
                    <div className="mt-4">
                      <button onClick={() => window.location.reload()} className="px-4 py-2 bg-rose-50 rounded-md hover:bg-rose-100 transition-colors">重试</button>
                    </div>
                  </td>
                </tr>
              ) : resp?.list.length === 0 && !isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-24 text-center text-gray-400 text-sm italic">
                    暂无相关角色数据记录
                  </td>
                </tr>
              ) : (
                resp?.list.map(role => (
                  <tr key={role.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-4 py-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${role.isSystem === 1 ? 'bg-indigo-50 text-indigo-600' : 'bg-blue-50 text-blue-600'}`}>
                          <ShieldCheck size={18} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-900">{role.name}</span>
                            {role.isSystem === 1 && <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded border border-indigo-200 uppercase tracking-tighter">内置</span>}
                          </div>
                          {role.description && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1 max-w-[200px]">{role.description}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm font-mono text-gray-600">{role.code}</td>
                    <td className="px-4 py-4 text-center">
                      <span className="px-2.5 py-1 bg-gray-50 text-gray-600 border border-gray-100 rounded-full text-[11px] font-bold">
                        {getScopeText(role.dataScope)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button
                        disabled={role.isSystem === 1}
                        onClick={() => handleToggleStatus(role)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${
                          role.status === 1 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-100'
                        } ${role.isSystem === 1 ? 'opacity-50 cursor-not-allowed grayscale' : 'active:scale-95'}`}
                      >
                        {role.status === 1 ? '启用中' : '已禁用'}
                      </button>
                    </td>
                    <td className="px-4 py-4 text-xs text-gray-400 font-medium">
                      {new Date(role.createdAt).toLocaleString('zh-CN', { hour12: false })}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => { setSelectedRole(role); setDialogOpen(true); }}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="编辑信息"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button 
                          onClick={() => { setSelectedRole(role); setPermissionOpen(true); }}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="功能权限分配"
                        >
                          <ShieldCheck size={16} />
                        </button>
                        <button 
                          onClick={() => handleCopy(role.id)}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="复制角色"
                        >
                          <Copy size={16} />
                        </button>
                        <button 
                          disabled={role.isSystem === 1}
                          onClick={() => handleDelete(role.id)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            role.isSystem === 1 
                              ? 'text-gray-200 cursor-not-allowed' 
                              : 'text-rose-500 hover:bg-rose-50'
                          }`}
                          title={role.isSystem === 1 ? "系统内置禁止删除" : "删除"}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {resp && resp.total > 0 && (
          <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-200 flex items-center justify-between text-sm text-gray-600">
             <div className="font-medium">
                共 <span className="text-gray-900 font-bold">{resp.total}</span> 条角色记录
             </div>
             
             <div className="flex items-center gap-3">
                <button 
                  disabled={params.page === 1 || isPending}
                  onClick={() => handlePageChange(params.page - 1)}
                  className="p-1.5 border border-gray-300 rounded-md hover:bg-white hover:shadow-sm disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={16} />
                </button>
                
                <div className="flex items-center font-medium text-gray-700">
                  <span className="px-2">{params.page}</span>
                  <span className="text-gray-300 mx-1">/</span>
                  <span className="px-2 text-gray-400 font-normal">{Math.ceil(resp.total / params.pageSize)}</span>
                </div>

                <button 
                  disabled={params.page >= Math.ceil(resp.total / params.pageSize) || isPending}
                  onClick={() => handlePageChange(params.page + 1)}
                  className="p-1.5 border border-gray-300 rounded-md hover:bg-white hover:shadow-sm disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight size={16} />
                </button>
             </div>
          </div>
        )}
      </div>

      {dialogOpen && (
        <RoleDialog
          open={dialogOpen}
          role={selectedRole}
          onClose={() => setDialogOpen(false)}
        />
      )}

      {permissionOpen && selectedRole && (
        <RolePermissionDialog
          open={permissionOpen}
          role={selectedRole}
          onClose={() => setPermissionOpen(false)}
        />
      )}
    </div>
  );
};

export default RoleList;
