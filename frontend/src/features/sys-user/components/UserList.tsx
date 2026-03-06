import { useConfirm } from '@/components/common/ConfirmContext';
import { useMessage } from '@/components/common/MessageContext';
import {
    ChevronLeft,
    ChevronRight,
    Loader2,
    Plus
} from 'lucide-react';
import React, { useCallback, useState, useTransition } from 'react';
import { useDeleteUser, useUpdateUserStatus, useUsers } from '../hooks/useUsers';
import type { User, UserListParams } from '../types';
import ResetPasswordDialog from './ResetPasswordDialog';
import UserDialog from './UserDialog';
import UserRoleDialog from './UserRoleDialog';
import UserSearchForm from './list/UserSearchForm';
import UserTableRow from './list/UserTableRow';

const UserList: React.FC = () => {
  const [params, setParams] = useState<UserListParams>({
    page: 1,
    pageSize: 10,
    username: '',
    status: undefined,
  });

  const [isPending, startTransition] = useTransition();
  const { data: resp, isLoading, isError } = useUsers(params);
  const updateStatusMutation = useUpdateUserStatus();
  const deleteMutation = useDeleteUser();
  const { confirm } = useConfirm();
  const message = useMessage();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [resetPwdOpen, setResetPwdOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleSearch = useCallback((newParams: Partial<UserListParams>) => {
    startTransition(() => {
      setParams(prev => ({ ...prev, ...newParams }));
    });
  }, []);

  const handlePageChange = (newPage: number) => {
    startTransition(() => {
      setParams(p => ({ ...p, page: newPage }));
    });
  };

  const handleAdd = useCallback(() => {
    setSelectedUser(null);
    setDialogOpen(true);
  }, []);

  const handleEdit = useCallback((user: User) => {
    setSelectedUser(user);
    setDialogOpen(true);
  }, []);

  const handleOpenRoleDialog = useCallback((user: User) => {
    setSelectedUser(user);
    setRoleDialogOpen(true);
  }, []);

  const handleOpenResetPwd = useCallback((user: User) => {
    setSelectedUser(user);
    setResetPwdOpen(true);
  }, []);

  const handleStatusToggle = useCallback((user: User) => {
    const newStatus = user.status === 1 ? 0 : 1;
    updateStatusMutation.mutate({ id: user.id, status: newStatus }, {
      onSuccess: () => {
        message.success(`${newStatus === 1 ? '启用' : '禁用'}用户成功`);
      }
    });
  }, [updateStatusMutation, message]);

  const handleDelete = useCallback(async (id: number) => {
    const ok = await confirm({
      title: '删除确认',
      message: '确定要删除该用户吗？此操作将永久移除该用户且不可恢复。',
      confirmLabel: '删除',
      variant: 'danger'
    });

    if (ok) {
      deleteMutation.mutate(id, {
        onSuccess: () => {
          message.success('用户删除成功');
        }
      });
    }
  }, [deleteMutation, confirm, message]);

  return (
    <div className="m-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">用户管理</h1>
          <p className="text-sm text-gray-500 mt-1">管理系统登录账号、基本信息及其角色权限</p>
        </div>
        <button 
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all text-sm font-medium shadow-sm active:scale-95"
        >
          <Plus size={16} />
          新增用户
        </button>
      </div>

      <UserSearchForm initialParams={params} onSearch={handleSearch} />

      <div className="bg-white border border-gray-200 rounded-lg relative shadow-sm overflow-hidden">
        {(isLoading || isPending) && (
          <div className="absolute inset-0 bg-white/60 z-20 flex justify-center items-center backdrop-blur-[1px]">
            <Loader2 className="animate-spin text-blue-600 space-x-2" size={32} />
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200">
                <th className="px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">工号</th>
                <th className="px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">账号 / 姓名</th>
                <th className="px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">角色分配</th>
                <th className="px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">科室部门</th>
                <th className="px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">手机号</th>
                <th className="px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">账号状态</th>
                <th className="px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">最后登录</th>
                <th className="px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider w-56">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isError ? (
                <tr>
                  <td colSpan={8} className="px-6 py-20 text-center text-rose-600 text-sm font-medium">
                    数据加载失败，请检查网络或刷新重试。
                    <div className="mt-4">
                      <button onClick={() => setParams({...params})} className="px-4 py-2 bg-rose-50 rounded-md hover:bg-rose-100 transition-colors">重试</button>
                    </div>
                  </td>
                </tr>
              ) : resp?.list?.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-24 text-center text-gray-400 text-sm italic">
                    暂无相关用户数据
                  </td>
                </tr>
              ) : (
                resp?.list?.map(user => (
                  <UserTableRow 
                    key={user.id}
                    user={user}
                    onEdit={handleEdit}
                    onStatusToggle={handleStatusToggle}
                    onResetPwd={handleOpenResetPwd}
                    onDelete={handleDelete}
                    onRoleManage={handleOpenRoleDialog}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-200 flex items-center justify-between text-sm text-gray-600">
           <div className="font-medium">
              共 <span className="text-gray-900 font-bold">{resp?.total || 0}</span> 条用户记录
           </div>
           
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                 <span className="text-gray-500">每页</span>
                 <select 
                   className="border border-gray-300 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-xs font-medium"
                   value={params.pageSize}
                   onChange={e => handleSearch({ pageSize: Number(e.target.value), page: 1 })}
                 >
                   {[10, 20, 50, 100].map(size => (
                     <option key={size} value={size}>{size}</option>
                   ))}
                 </select>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  disabled={params.page === 1 || isPending}
                  onClick={() => handlePageChange(params.page - 1)}
                  className="p-1.5 border border-gray-300 rounded-md hover:bg-white hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={16} />
                </button>
                
                <div className="flex items-center font-medium text-gray-700">
                  <span className="px-2">{params.page}</span>
                  <span className="text-gray-300 mx-1">/</span>
                  <span className="px-2 text-gray-400 font-normal">{Math.ceil((resp?.total || 1) / params.pageSize)}</span>
                </div>

                <button 
                  disabled={!resp || params.page * params.pageSize >= resp.total || isPending}
                  onClick={() => handlePageChange(params.page + 1)}
                  className="p-1.5 border border-gray-300 rounded-md hover:bg-white hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
           </div>
        </div>
      </div>

      <UserDialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)} 
        user={selectedUser} 
      />

      <UserRoleDialog 
        open={roleDialogOpen} 
        onClose={() => setRoleDialogOpen(false)} 
        user={selectedUser} 
      />

      <ResetPasswordDialog 
        open={resetPwdOpen} 
        onClose={() => setResetPwdOpen(false)} 
        user={selectedUser} 
      />
    </div>
  );
};

export default UserList;
