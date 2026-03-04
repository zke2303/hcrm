import { useQueryClient } from '@tanstack/react-query';
import { Check, Loader2, Shield, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useRoles, useUpdateUser } from '../hooks/useUsers';
import type { User } from '../types';

interface UserRoleDialogProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
}

const UserRoleDialog: React.FC<UserRoleDialogProps> = ({ open, onClose, user }) => {
  const queryClient = useQueryClient();
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);

  const { data: rolesResp, isLoading: rolesLoading } = useRoles();
  const updateMutation = useUpdateUser();

  useEffect(() => {
    if (user && user.roles) {
      setSelectedRoleIds(user.roles.map(r => r.id));
    } else {
      setSelectedRoleIds([]);
    }
  }, [user, open]);

  const toggleRole = (roleId: number) => {
    setSelectedRoleIds(prev => 
      prev.includes(roleId) ? prev.filter(id => id !== roleId) : [...prev, roleId]
    );
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      await updateMutation.mutateAsync({
        id: user.id,
        data: {
          ...user,
          roleIds: selectedRoleIds
        } as any
      });
      alert('角色配置成功');
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  const roles = rolesResp?.data || [];

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"
            onClick={onClose}
          />
          
          <div className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl flex flex-col max-h-[90vh] mx-auto overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50 flex-shrink-0">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900">
                <Shield size={20} />
                配置角色
                <span className="text-sm font-normal text-gray-500 ml-2">
                  (用户: {user?.realName || user?.username || '-'})
                </span>
              </h3>
              <button 
                onClick={onClose} 
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
              {rolesLoading ? (
                <div className="py-16 flex justify-center items-center">
                  <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-gray-500 ml-4">正在加载角色...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 max-h-[50vh] overflow-y-auto pr-2">
                  {roles.map((role: any) => {
                    const isSelected = selectedRoleIds.includes(role.id);
                    return (
                      <button
                        key={role.id}
                        onClick={() => toggleRole(role.id)}
                        className={`flex items-center justify-between p-4 rounded-md border text-left transition-colors ${
                          isSelected 
                            ? 'bg-blue-50 border-blue-600' 
                            : 'bg-white border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div>
                          <div className={`text-sm font-bold ${isSelected ? 'text-blue-700' : 'text-gray-900'}`}>
                            {role.name}
                          </div>
                          <div className="text-xs text-gray-500 mt-1 max-w-[360px] truncate">{role.remark || '暂无描述'}</div>
                        </div>
                        
                        <div className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${
                          isSelected ? 'bg-blue-600 text-white' : 'border border-gray-300'
                        }`}>
                          {isSelected && <Check size={14} />}
                        </div>
                      </button>
                    );
                  })}
                  {roles.length === 0 && (
                    <div className="py-12 text-center">
                      <Shield size={36} className="mx-auto text-gray-300 mb-4" />
                      <p className="text-sm text-gray-500 font-medium">暂无可用角色</p>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-8 pt-5 border-t border-gray-100 flex justify-end gap-3 flex-shrink-0">
                <button 
                  type="button" 
                  onClick={onClose}
                  className="px-5 py-2.5 border border-gray-300 shadow-sm text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button 
                  disabled={updateMutation.isPending}
                  onClick={handleSave}
                  className="flex items-center justify-center min-w-[90px] gap-2 px-5 py-2.5 shadow-sm bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-70 transition-colors"
                >
                  {updateMutation.isPending && <Loader2 size={16} className="animate-spin" />}
                  {updateMutation.isPending ? '保存中...' : '确定'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserRoleDialog;
