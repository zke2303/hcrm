import { AnimatePresence, motion } from 'framer-motion';
import { Check, Shield, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useRoles, useUpdateUser } from '../hooks/useUsers';
import type { User } from '../types';

interface UserRoleDialogProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
}

const UserRoleDialog: React.FC<UserRoleDialogProps> = ({ open, onClose, user }) => {
  const { data: rolesResp, isLoading: rolesLoading } = useRoles();
  const updateMutation = useUpdateUser();
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);

  useEffect(() => {
    if (user) {
      setSelectedRoleIds(user.roles.map(r => r.id));
    }
  }, [user]);

  const toggleRole = (roleId: number) => {
    setSelectedRoleIds(prev => 
      prev.includes(roleId) 
        ? prev.filter(id => id !== roleId) 
        : [...prev, roleId]
    );
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      await updateMutation.mutateAsync({ 
        id: user.id, 
        data: { 
          realName: user.realName,
          phone: user.phone,
          departmentId: user.departmentId,
          roleIds: selectedRoleIds 
        } 
      });
      alert('角色授权成功');
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  const roles = rolesResp?.data || [];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex-center"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-2xl shadow-2xl z-[51] overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-black/5 bg-primary/5">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Shield size={20} className="text-primary" />
                分配角色 - {user?.realName}
              </h3>
              <button 
                onClick={onClose} 
                className="p-1 hover:bg-black/5 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {rolesLoading ? (
                <div className="py-12 text-center text-text-sub">加载角色列表中...</div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {roles.map(role => {
                    const isSelected = selectedRoleIds.includes(role.id);
                    return (
                      <button
                        key={role.id}
                        onClick={() => toggleRole(role.id)}
                        className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                          isSelected 
                            ? 'bg-primary/5 border-primary shadow-sm' 
                            : 'bg-white border-black/5 hover:border-black/10'
                        }`}
                      >
                        <div className="text-left">
                          <div className={`font-bold ${isSelected ? 'text-primary' : 'text-text-main'}`}>
                            {role.name}
                          </div>
                          <div className="text-xs text-text-sub mt-1">{role.description || '暂无描述'}</div>
                        </div>
                        {isSelected && (
                          <div className="w-6 h-6 bg-primary text-white rounded-full flex-center shadow-md">
                            <Check size={14} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                  {roles.length === 0 && (
                    <div className="py-8 text-center text-text-sub italic">
                      未发现可分配的角色，请先在角色管理中创建。
                    </div>
                  )}
                </div>
              )}

              <div className="mt-8 flex items-center justify-end gap-3">
                <button 
                  type="button" 
                  onClick={onClose}
                  className="px-6 py-2 border border-black/10 rounded-lg text-sm font-bold hover:bg-black/5 transition-all"
                >
                  取消
                </button>
                <button 
                  disabled={updateMutation.isPending}
                  onClick={handleSave}
                  className="px-8 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary-light shadow-lg shadow-primary/20 disabled:opacity-50 transition-all"
                >
                  {updateMutation.isPending ? '保存中...' : '提交授权'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default UserRoleDialog;
