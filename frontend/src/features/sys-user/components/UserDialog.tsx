import { zodResolver } from '@hookform/resolvers/zod';
import { Edit3, Loader2, Plus, X } from 'lucide-react';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useMessage } from '@/components/common/MessageContext';
import { useCreateUser, useDepartments, useTitles, useUpdateUser } from '../hooks/useUsers';
import type { User as UserType } from '../types';

const userSchema = z.object({
  username: z.string().min(3, '账号至少3个字符'),
  realName: z.string().min(2, '请输入真实姓名'),
  phone: z.string().regex(/^1[3-9]\d{9}$/, '请输入正确的手机号'),
  email: z.string().email('请输入有效的邮箱').optional().or(z.literal('')),
  departmentId: z.number().optional().nullable(),
  remark: z.string().optional(),
  isDoctor: z.boolean(),
  title: z.string().optional(),
  specialty: z.string().optional(),
  introduction: z.string().optional(),
});

type UserFormData = any; // 使用 any 规避复杂的 RHF + Zod 类型冲突

interface UserDialogProps {
  open: boolean;
  onClose: () => void;
  user?: UserType | null;
}

const UserDialog: React.FC<UserDialogProps> = ({ open, onClose, user }) => {
  const isEdit = !!user;
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const message = useMessage();
  const { data: titlesResp } = useTitles();
  const titles = titlesResp?.data || [];
  const { data: deptsResp } = useDepartments();
  const departments = deptsResp?.data || [];

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: '',
      realName: '',
      phone: '',
      isDoctor: false,
    },
  });

  const isDoctor = watch('isDoctor');

  useEffect(() => {
    if (user) {
      reset({
        username: user.username,
        realName: user.realName,
        phone: user.phone,
        email: user.email || '',
        departmentId: user.departmentId,
        remark: user.remark || '',
        isDoctor: user.isDoctor || false,
        title: user.title || '',
        specialty: user.specialty || '',
        introduction: user.introduction || '',
      });
    } else {
      reset({
        username: '',
        realName: '',
        phone: '',
        email: '',
        isDoctor: false,
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: UserFormData) => {
    try {
      if (isEdit) {
        // 保留原有的角色和工号，防止在更新基础信息时被清空
        const updateData: any = {
          ...data,
          employeeNo: user!.employeeNo,
          roleIds: user!.roles?.map(r => r.id) || []
        };
        await updateUser.mutateAsync({ id: user!.id, data: updateData });
        message.success('用户信息更新成功');
      } else {
        const resp = await createUser.mutateAsync(data as any);
        // Show success message with employee number and default password
        const result = resp?.data;
        if (result) {
          message.success(
            `新增用户成功！工号: ${result.employeeNo}，默认密码: ${result.defaultPassword}。请妥善保管登录信息。`
          );
        } else {
          message.success('新增用户成功');
        }
      }
      onClose();
    } catch (err: any) {
      message.error(err.response?.data?.message || '操作失败，请稍后重试');
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

          {/* Dialog Panel - width expanded slightly, max-height bound */}
          <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl flex flex-col max-h-[90vh] mx-auto overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50 flex-shrink-0">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                {isEdit ? <Edit3 size={20} className="text-blue-600" /> : <Plus size={20} className="text-blue-600" />}
                {isEdit ? '编辑用户' : '新增用户'}
              </h3>
              <button
                onClick={onClose}
                className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Body */}
            <form onSubmit={handleSubmit(onSubmit)} className="overflow-y-auto flex-1 p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">

                {/* 账号信息 Divider */}
                <div className="col-span-1 md:col-span-2 text-base font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  账号信息
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">登录账号 <span className="text-red-500">*</span></label>
                  <input
                    {...register('username')}
                    disabled={isEdit}
                    placeholder="请输入登录账号"
                    className={`w-full px-4 py-2 bg-white border ${errors.username ? 'border-red-500' : 'border-gray-300'} rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500 transition-shadow`}
                  />
                  {errors.username && <p className="text-sm text-red-500">{(errors.username.message as string)}</p>}
                </div>

                {/* 提示：密码和工号将自动生成 */}
                {!isEdit && (
                  <div className="col-span-1 md:col-span-2 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-800">
                      <strong>提示：</strong>工号将自动生成（格式：EMP + 5位数字），默认密码为 <code className="px-1 py-0.5 bg-amber-100 rounded">123456</code>
                    </p>
                  </div>
                )}

                {/* 基本资料 Divider */}
                <div className="col-span-1 md:col-span-2 text-base font-semibold text-gray-900 border-b border-gray-200 pb-2 mt-4">
                  基本资料
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">所属科室</label>
                  <select
                    {...register('departmentId', { setValueAs: v => (v === "" || v === null || v === undefined) ? null : Number(v) })}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                  >
                    <option value="">暂无所属科室</option>
                    {departments.map((d: any) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                  {errors.departmentId && <p className="text-sm text-red-500">{(errors.departmentId.message as string)}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">真实姓名 <span className="text-red-500">*</span></label>
                  <input
                    {...register('realName')}
                    placeholder="请输入真实姓名"
                    className={`w-full px-4 py-2 bg-white border ${errors.realName ? 'border-red-500' : 'border-gray-300'} rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow`}
                  />
                  {errors.realName && <p className="text-sm text-red-500">{(errors.realName.message as string)}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">手机号码 <span className="text-red-500">*</span></label>
                  <input
                    {...register('phone')}
                    placeholder="请输入手机号码"
                    className={`w-full px-4 py-2 bg-white border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow`}
                  />
                  {errors.phone && <p className="text-sm text-red-500">{(errors.phone.message as string)}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">电子邮箱</label>
                  <input
                    {...register('email')}
                    placeholder="选填"
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                  />
                </div>

                {/* 医生开关 */}
                <div className="col-span-1 md:col-span-2 mt-4 p-5 border border-blue-100 bg-blue-50/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      {...register('isDoctor')}
                      id="isDoctorCheckbox"
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="isDoctorCheckbox" className="font-semibold text-sm text-gray-900 cursor-pointer select-none">
                      标记为医务人员 (开启医生档案)
                    </label>
                  </div>

                  {isDoctor && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-blue-100">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">医疗职称/职务</label>
                        <select
                          {...register('title')}
                          className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">请选择职称</option>
                          {titles.map(t => (
                            <option key={t.id} value={t.name}>{t.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">专业领域</label>
                        <input
                          {...register('specialty')}
                          placeholder="如: 心血管内科"
                          className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="col-span-1 md:col-span-2 space-y-2">
                        <label className="text-sm font-medium text-gray-700">个人简介</label>
                        <textarea
                          {...register('introduction')}
                          rows={3}
                          placeholder="可选填医生简介信息..."
                          className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 pt-5 border-t border-gray-100 flex justify-end gap-3 flex-shrink-0">
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
                  className="flex items-center justify-center min-w-[90px] gap-2 px-5 py-2.5 shadow-sm bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-70 transition-colors"
                >
                  {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                  {isSubmitting ? '保存中...' : '确定'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default UserDialog;