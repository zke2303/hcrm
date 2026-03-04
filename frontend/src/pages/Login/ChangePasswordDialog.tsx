import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, Loader2, X } from 'lucide-react';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useMessage } from '@/components/common/MessageContext';
import { useAuthStore } from '@/store/useAuthStore';
import axios from 'axios';

const ChangePasswordSchema = z.object({
  oldPassword: z.string().min(6, '原密码至少6个字符'),
  newPassword: z.string().min(6, '新密码至少6个字符'),
  confirmPassword: z.string().min(6, '请确认密码'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: '两次输入的密码不一致',
  path: ['confirmPassword'],
});

type ChangePasswordFormData = z.infer<typeof ChangePasswordSchema>;

interface ChangePasswordDialogProps {
  open: boolean;
  onClose: () => void;
  onPasswordChanged: () => void;
  currentPassword: string;
}

const ChangePasswordDialog: React.FC<ChangePasswordDialogProps> = ({
  open,
  onClose,
  onPasswordChanged,
  currentPassword,
}) => {
  const message = useMessage();
  const user = useAuthStore(state => state.user);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(ChangePasswordSchema),
    defaultValues: {
      oldPassword: currentPassword,
      newPassword: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        oldPassword: currentPassword,
        newPassword: '',
        confirmPassword: '',
      });
    }
  }, [open, currentPassword, reset]);

  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      await axios.put('/api/v1/users/me/password', {
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      });

      message.success('密码修改成功');
      onPasswordChanged();
    } catch (err: any) {
      message.error(err.response?.data?.message || '密码修改失败');
    }
  };

  if (!open || !user) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Dialog Panel */}
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl flex flex-col max-h-[90vh] mx-auto overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-amber-50 flex-shrink-0">
          <h3 className="text-lg font-semibold text-amber-900 flex items-center gap-2">
            <Lock size={20} className="text-amber-600" />
            首次登录
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-amber-500 hover:text-amber-700 hover:bg-amber-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-8">
          <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>提示：</strong>根据系统安全策略，您首次登录必须修改密码。
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">当前密码（默认密码）</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="password"
                  {...register('oldPassword')}
                  className={`w-full pl-10 pr-4 py-2 bg-white border ${errors.oldPassword ? 'border-red-500' : 'border-gray-300'} rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="请输入当前密码"
                />
              </div>
              {errors.oldPassword && (
                <p className="text-sm text-red-500">{errors.oldPassword.message as string}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">新密码</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="password"
                  {...register('newPassword')}
                  className={`w-full pl-10 pr-4 py-2 bg-white border ${errors.newPassword ? 'border-red-500' : 'border-gray-300'} rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="请输入新密码"
                />
              </div>
              {errors.newPassword && (
                <p className="text-sm text-red-500">{errors.newPassword.message as string}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">确认新密码</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="password"
                  {...register('confirmPassword')}
                  className={`w-full pl-10 pr-4 py-2 bg-white border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="请再次输入新密码"
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword.message as string}</p>
              )}
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-gray-300 shadow-sm text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              稍后修改
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center min-w-[100px] gap-2 px-5 py-2.5 shadow-sm bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 disabled:opacity-70 transition-colors"
            >
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              {isSubmitting ? '保存中...' : '确定'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordDialog;