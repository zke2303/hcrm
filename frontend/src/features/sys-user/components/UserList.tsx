import {
    ChevronLeft,
    ChevronRight,
    Loader2,
    Plus
} from 'lucide-react';
import React, { useCallback, useState, useTransition } from 'react';
import { useConfirm } from '@/components/common/ConfirmContext';
import { useMessage } from '@/components/common/MessageContext';
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
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xs font-bold text-gray-900">用户管理</h1>
        <button 
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <Plus size={16} />
          新增用户
        </button>
      </div>

      <UserSearchForm initialParams={params} onSearch={handleSearch} />

      <div className="bg-white border border-gray-200 rounded-md relative shadow-sm">
        {(isLoading || isPending) && (
          <div className="absolute inset-0 bg-white/50 z-20 flex justify-center items-center">
            <Loader2 className="animate-spin text-blue-600 space-x-2" size={32} />
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-sm font-medium text-gray-600 text-center">账号/姓名</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-600 text-center">科室部门</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-600 text-center">手机号</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-600 text-center">角色分配</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-600 text-center">账号状态</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-600 text-center">最后登录</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-600 text-center w-56">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isError ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center text-red-600 text-sm">
                    数据加载失败，请检查网络或刷新重试。
                    <div className="mt-4">
                      <button onClick={() => setParams({...params})} className="text-blue-600 hover:text-blue-800 underline">重试</button>
                    </div>
                  </td>
                </tr>
              ) : resp?.data?.list?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center text-gray-500 text-sm">
                    暂无相关用户数据
                  </td>
                </tr>
              ) : (
                resp?.data?.list?.map(user => (
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
        
        <div className="px-4 py-3 bg-white border-t border-gray-200 flex items-center justify-between text-sm text-gray-600">
           <div>
              共 <span className="font-semibold text-gray-900">{resp?.data?.total || 0}</span> 条数据
           </div>
           
           <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                 <span>单页显示</span>
                 <select 
                   className="border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:border-blue-500 text-sm"
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
                  className="p-1.5 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>
                
                <span className="w-20 text-center">
                  {params.page} / {Math.ceil((resp?.data?.total || 1) / params.pageSize)}
                </span>

                <button 
                  disabled={!resp?.data || params.page * params.pageSize >= resp.data.total || isPending}
                  onClick={() => handlePageChange(params.page + 1)}
                  className="p-1.5 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
