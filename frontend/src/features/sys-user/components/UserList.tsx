import {
  Edit3,
  Key,
  MoreHorizontal,
  Plus,
  Power,
  PowerOff,
  Search,
  Trash2,
  Users
} from 'lucide-react';
import React, { useState } from 'react';
import { useDeleteUser, useUpdateUserStatus, useUsers } from '../hooks/useUsers';
import type { User, UserListParams } from '../types';
import ResetPasswordDialog from './ResetPasswordDialog';
import UserDialog from './UserDialog';
import UserRoleDialog from './UserRoleDialog';

const UserList: React.FC = () => {
  const [params, setParams] = useState<UserListParams>({
    page: 1,
    pageSize: 10,
    username: '',
    realName: '',
  });

  const { data: resp, isLoading } = useUsers(params);
  const updateStatusMutation = useUpdateUserStatus();
  const deleteMutation = useDeleteUser();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [resetPwdOpen, setResetPwdOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleAdd = () => {
    setSelectedUser(null);
    setDialogOpen(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setDialogOpen(true);
  };

  const handleOpenRoleDialog = (user: User) => {
    setSelectedUser(user);
    setRoleDialogOpen(true);
  };

  const handleOpenResetPwd = (user: User) => {
    setSelectedUser(user);
    setResetPwdOpen(true);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setParams(p => ({ ...p, page: 1 }));
  };

  const handleStatusToggle = (user: User) => {
    const newStatus = user.status === 1 ? 0 : 1;
    updateStatusMutation.mutate({ id: user.id, status: newStatus });
  };

  const handleDelete = (id: number) => {
    if (window.confirm('确定要删除该用户吗？此操作不可恢复。')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Users size={24} className="text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">用户管理</h2>
            <p className="text-sm text-text-sub">管理系统账号及权限分配</p>
          </div>
        </div>
        <button 
          onClick={handleAdd}
          className="flex-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-light transition-all"
        >
          <Plus size={18} />
          <span>新增用户</span>
        </button>
      </div>

      <div className="glass-effect p-4 rounded-xl">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-sub" size={16} />
            <input 
              type="text" 
              placeholder="搜索账号或真实姓名..."
              className="w-full pl-10 pr-4 py-2 bg-white/50 border border-black/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
              value={params.username}
              onChange={e => setParams(p => ({ ...p, username: e.target.value }))}
            />
          </div>
          
          <select 
            className="px-4 py-2 bg-white/50 border border-black/10 rounded-lg focus:outline-none"
            value={params.status}
            onChange={e => setParams(p => ({ ...p, status: e.target.value ? Number(e.target.value) : undefined }))}
          >
            <option value="">所有状态</option>
            <option value="1">启用</option>
            <option value="0">禁用</option>
          </select>

          <button type="submit" className="hidden">搜索</button>
        </form>
      </div>

      <div className="glass-effect rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-primary/5 text-text-sub text-sm font-semibold uppercase tracking-wider">
                <th className="px-6 py-4">账号/姓名</th>
                <th className="px-6 py-4">所属科室</th>
                <th className="px-6 py-4">手机号</th>
                <th className="px-6 py-4">角色</th>
                <th className="px-6 py-4">状态</th>
                <th className="px-6 py-4">最后登录</th>
                <th className="px-6 py-4 text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-text-sub">加载中...</td>
                </tr>
              ) : resp?.data.list.map(user => (
                <tr key={user.id} className="hover:bg-primary/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-text-main">{user.username}</div>
                    <div className="text-xs text-text-sub">{user.realName}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm">{user.departmentName || '未分配'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium">{user.phone}</span>
                  </td>
                  <td className="px-6 py-4">
                      <button 
                        onClick={() => handleOpenRoleDialog(user)}
                        className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] rounded-full hover:bg-blue-200 transition-colors"
                        title="点击管理角色"
                      >
                        {user.roles.map(r => r.name).join(', ') || '未分配'}
                      </button>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      user.status === 1 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${user.status === 1 ? 'bg-green-500' : 'bg-red-500'}`} />
                      {user.status === 1 ? '启用' : '禁用'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-text-sub">
                      {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : '从不'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEdit(user)}
                        className="p-1.5 hover:bg-black/5 rounded-md text-text-sub hover:text-primary transition-colors"
                        title="编辑"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button 
                        className={`p-1.5 hover:bg-black/5 rounded-md transition-colors ${
                          user.status === 1 ? 'text-text-sub hover:text-error' : 'text-text-sub hover:text-green-600'
                        }`}
                        title={user.status === 1 ? '禁用' : '启用'}
                        onClick={() => handleStatusToggle(user)}
                      >
                        {user.status === 1 ? <PowerOff size={16} /> : <Power size={16} />}
                      </button>
                      <button 
                        onClick={() => handleOpenResetPwd(user)}
                        className="p-1.5 hover:bg-black/5 rounded-md text-text-sub hover:text-primary transition-colors"
                        title="重置密码"
                      >
                        <Key size={16} />
                      </button>
                      <button 
                        className="p-1.5 hover:bg-black/5 rounded-md text-text-sub hover:text-error transition-colors"
                        title="删除"
                        onClick={() => handleDelete(user.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="group-hover:hidden flex justify-center text-text-sub/50">
                      <MoreHorizontal size={16} />
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && resp?.data.list.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-text-sub italic">暂无用户数据</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="px-6 py-4 bg-primary/5 flex items-center justify-between border-t border-black/5">
           <div className="text-xs text-text-sub">
              共 <b>{resp?.data.total || 0}</b> 名用户
           </div>
           <div className="flex items-center gap-2">
              <button 
                disabled={params.page === 1}
                onClick={() => setParams(p => ({ ...p, page: p.page - 1 }))}
                className="px-3 py-1 text-xs border border-black/10 rounded hover:bg-white disabled:opacity-50"
              >
                上一页
              </button>
              <span className="text-xs font-semibold px-2">第 {params.page} 页</span>
              <button 
                disabled={!resp || params.page * params.pageSize >= resp.data.total}
                onClick={() => setParams(p => ({ ...p, page: p.page + 1 }))}
                className="px-3 py-1 text-xs border border-black/10 rounded hover:bg-white disabled:opacity-50"
              >
                下一页
              </button>
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
        userId={selectedUser?.id || 0} 
        username={selectedUser?.realName || ''} 
      />
    </div>
  );
};

export default UserList;
