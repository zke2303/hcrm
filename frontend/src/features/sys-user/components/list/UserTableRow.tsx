import { Edit, KeyRound, ShieldAlert, Trash2 } from 'lucide-react';
import React from 'react';
import type { User } from '../../types';

interface UserTableRowProps {
  user: User;
  onEdit: (user: User) => void;
  onStatusToggle: (user: User) => void;
  onResetPwd: (user: User) => void;
  onDelete: (id: number) => void;
  onRoleManage: (user: User) => void;
}

const UserTableRow: React.FC<UserTableRowProps> = ({ 
  user, 
  onEdit, 
  onStatusToggle, 
  onResetPwd, 
  onDelete, 
  onRoleManage 
}) => {
  const isAdmin = user.username === 'admin' || user.id === 1;

  return (
    <tr className="hover:bg-gray-50 border-b border-gray-200">
      <td className="px-4 py-3 text-sm text-gray-700 text-center">{user.employeeNo || '-'}</td>
      <td className="px-4 py-3 text-sm text-gray-900 text-center">
        <div className="font-medium text-gray-900">{user.username}</div>
        <div className="text-gray-500 text-xs mt-0.5">{user.realName}</div>
      </td>
      <td className="px-4 py-3 text-sm text-center">
        <button 
          onClick={() => onRoleManage(user)}
          className="text-blue-600 hover:text-blue-800 hover:underline"
        >
          {user.roles && user.roles.length > 0 ? user.roles.map(r => r.name).join(', ') : '设置角色'}
        </button>
      </td>
      <td className="px-4 py-3 text-sm text-gray-700 text-center">{user.departmentName || '-'}</td>
      <td className="px-4 py-3 text-sm text-gray-700 text-center">{user.phone || '-'}</td>
      <td className="px-4 py-3 text-sm text-center">
        <button
          disabled={isAdmin}
          onClick={() => onStatusToggle(user)}
          className={`px-4 py-1.5 rounded-md text-xs font-medium border transition-colors ${
            user.status === 1 
              ? 'bg-green-50 text-green-700 border-green-200' + (isAdmin ? '' : ' hover:bg-green-100')
              : 'bg-red-50 text-red-700 border-red-200' + (isAdmin ? '' : ' hover:bg-red-100')
          } ${isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
          title={isAdmin ? "内置管理员禁止禁用" : ""}
        >
          {user.status === 1 ? '正常' : '禁用'}
        </button>
      </td>
      <td className="px-4 py-3 text-xs text-gray-500 text-center">
        {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('zh-CN', { hour12: false }) : '-'}
      </td>
      <td className="px-4 py-3 text-sm text-center">
        <div className="flex items-center justify-center gap-4">
          <button 
            onClick={() => onEdit(user)}
            className="text-blue-600 hover:text-blue-800 flex items-center justify-center gap-1"
            title="编辑"
          >
            <Edit size={16} />
          </button>
          <button 
            onClick={() => onRoleManage(user)}
            className="text-blue-600 hover:text-blue-800 flex items-center justify-center gap-1"
            title="分配角色"
          >
            <ShieldAlert size={16} />
          </button>
          <button 
            onClick={() => onResetPwd(user)}
            className="text-orange-500 hover:text-orange-700 flex items-center justify-center gap-1"
            title="重置密码"
          >
            <KeyRound size={16} />
          </button>
          <button 
            disabled={isAdmin}
            onClick={() => onDelete(user.id)}
            className={`flex items-center justify-center gap-1 transition-colors ${
              isAdmin ? 'text-gray-300 cursor-not-allowed' : 'text-red-600 hover:text-red-800'
            }`}
            title={isAdmin ? "系统管理员禁止删除" : "删除"}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default React.memo(UserTableRow);
