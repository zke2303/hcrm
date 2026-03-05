import {
    ChevronLeft,
    ChevronRight,
    Copy,
    Edit,
    Loader2,
    Plus,
    ShieldCheck,
    Trash2
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
        message.success('状态更新成功');
     } catch (err: any) {
        message.error(err.response?.data?.message || '状态更新失败');
     }
  };

  const handleDelete = async (id: number) => {
    const ok = await confirm({
      title: '确认删除',
      message: '确定要删除该角色吗？删除后不可恢复。',
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

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl shadow-sm border border-red-100">
        <div className="text-red-500 font-medium">获取数据失败，请稍后重试</div>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          刷新重试
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="搜索角色名称/编码"
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none w-64 bg-gray-50/50"
            value={params.name}
            onChange={e => setParams(p => ({ ...p, name: e.target.value }))}
          />
          <button 
            type="submit"
            className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition shadow-sm"
          >
            查询
          </button>
        </form>
        <button 
            onClick={() => { setSelectedRole(null); setDialogOpen(true); }}
            className="flex items-center justify-center gap-2 px-5 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition shadow-sm"
        >
          <Plus size={18} />
          新建角色
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative min-h-[400px]">
        {(isLoading || isPending) && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10 transition-all">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <span className="text-sm font-medium text-gray-500">正在努力加载...</span>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/80 sticky top-0 border-b border-gray-100 z-10">
              <tr>
                <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center w-16">ID</th>
                <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">角色名称</th>
                <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">角色编码</th>
                <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">数据范围</th>
                <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">状态</th>
                <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">创建时间</th>
                <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">操作</th>
              </tr>
            </thead>
            <tbody>
              {resp?.list.map(role => (
                <tr key={role.id} className="hover:bg-blue-50/30 border-b border-gray-100 transition-colors">
                  <td className="px-5 py-4 text-sm text-gray-500 text-center">{role.id}</td>
                  <td className="px-5 py-4 text-sm font-medium text-gray-900">
                    <div className="flex items-center gap-2">
                      {role.name}
                      {role.isSystem === 1 && <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded">内置</span>}
                    </div>
                    {role.description && <div className="text-gray-400 text-xs mt-1 font-normal truncate max-w-[200px]">{role.description}</div>}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600 font-mono">{role.code}</td>
                  <td className="px-5 py-4 text-sm text-center">
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium border border-gray-200">
                      {getScopeText(role.dataScope)}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-center">
                    <button
                      disabled={role.isSystem === 1}
                      onClick={() => handleToggleStatus(role)}
                      className={`px-4 py-1.5 rounded-md text-xs font-medium border transition-all ${
                        role.status === 1 
                          ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:border-green-300'
                          : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:border-red-300'
                      } ${role.isSystem === 1 ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:scale-105 active:scale-95'}`}
                    >
                      {role.status === 1 ? '启用' : '禁用'}
                    </button>
                  </td>
                  <td className="px-5 py-4 text-xs text-gray-400">
                    {new Date(role.createdAt).toLocaleString('zh-CN', { hour12: false })}
                  </td>
                  <td className="px-5 py-4 text-sm text-center">
                    <div className="flex items-center justify-center gap-4">
                      <button 
                        onClick={() => { setSelectedRole(role); setDialogOpen(true); }}
                        className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded transition"
                        title="编辑"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => { setSelectedRole(role); setPermissionOpen(true); }}
                        className="text-indigo-600 hover:text-indigo-800 p-1 hover:bg-indigo-50 rounded transition"
                        title="权限分配"
                      >
                        <ShieldCheck size={16} />
                      </button>
                      <button 
                        onClick={() => handleCopy(role.id)}
                        className="text-green-600 hover:text-green-800 p-1 hover:bg-green-50 rounded transition"
                        title="复制角色"
                      >
                        <Copy size={16} />
                      </button>
                      <button 
                        disabled={role.isSystem === 1}
                        onClick={() => handleDelete(role.id)}
                        className={`p-1 rounded transition ${
                          role.isSystem === 1 
                            ? 'text-gray-200 cursor-not-allowed' 
                            : 'text-red-500 hover:text-red-700 hover:bg-red-50'
                        }`}
                        title={role.isSystem === 1 ? "系统内置禁止删除" : "删除"}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {(!resp || resp.list.length === 0) && !isLoading && (
                <tr>
                  <td colSpan={7} className="px-5 py-20 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                       <ShieldCheck size={48} className="text-gray-200" />
                       <span>暂无角色数据</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {resp && resp.total > params.pageSize && (
          <div className="px-5 py-4 flex items-center justify-between border-t border-gray-50 bg-gray-50/30">
            <div className="text-sm text-gray-500">
              共 <span className="font-semibold text-gray-700">{resp.total}</span> 条数据
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={params.page === 1}
                onClick={() => handlePageChange(params.page - 1)}
                className="p-2 border border-gray-200 rounded-lg hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent transition shadow-sm"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="flex items-center gap-1 px-2">
                <span className="text-sm font-semibold text-blue-600">{params.page}</span>
                <span className="text-sm text-gray-400">/</span>
                <span className="text-sm text-gray-600">{Math.ceil(resp.total / params.pageSize)}</span>
              </div>
              <button
                disabled={params.page >= Math.ceil(resp.total / params.pageSize)}
                onClick={() => handlePageChange(params.page + 1)}
                className="p-2 border border-gray-200 rounded-lg hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent transition shadow-sm"
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
