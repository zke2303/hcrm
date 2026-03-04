import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound, Loader2, X } from 'lucide-react';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useUpdateUser } from '../hooks/useUsers';
import type { User } from '../types';

const resetPwdSchema = z.object({
  password: z.string().min(6, '密码至少6个字符'),
});

type ResetPwdFormData = z.infer<typeof resetPwdSchema>;

interface ResetPasswordDialogProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
}

const ResetPasswordDialog: React.FC<ResetPasswordDialogProps> = ({ open, onClose, user }) => {
  const updateUser = useUpdateUser();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ResetPwdFormData>({
    resolver: zodResolver(resetPwdSchema),
    defaultValues: {
      password: '',
    },
  });

  useEffect(() => {
    if (open) {
      reset({ password: '' });
    }
  }, [open, reset]);

  const onSubmit = async (data: ResetPwdFormData) => {
    if (!user) return;
    try {
      await updateUser.mutateAsync({
        id: user.id,
        data: {
          realName: user.realName,
          phone: user.phone,
          departmentId: user.departmentId,
          password: data.password 
        } as any
      });
      alert('密码重置成功');
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"
            onClick={onClose}
          />
          
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl flex flex-col mx-auto overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50 flex-shrink-0">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900">
                <KeyRound size={20} className="text-orange-500" />
                重置密码
              </h3>
              <button 
                onClick={onClose} 
                className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors"
                type="button"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 sm:p-8">
              <div className="mb-6 pb-4 border-b border-gray-100 text-sm">
                <p className="text-gray-600 mb-1">正在为以下用户重置密码：</p>
                <p className="font-semibold text-gray-900 text-base">{user?.realName || user?.username || '-'}</p>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700 block">
                  新密码 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input 
                    type="text"
                    {...register('password')}
                    placeholder="请输入新密码 (至少6位)"
                    className={`w-full px-4 py-2.5 bg-white border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow`}
                    autoComplete="off"
                  />
                  {errors.password && (
                    <p className="mt-1.5 text-sm text-red-500">{(errors.password.message as string)}</p>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  重置后，该用户可以使用新密码登录系统。
                </p>
              </div>

              <div className="mt-8 pt-5 border-t border-gray-100 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={onClose}
                  className="px-5 py-2.5 border border-gray-300 shadow-sm text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex items-center justify-center min-w-[90px] gap-2 px-5 py-2.5 shadow-sm bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 disabled:opacity-70 transition-colors"
                >
                  {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                  {isSubmitting ? '保存中...' : '确认重置'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ResetPasswordDialog;
