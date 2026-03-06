import { zodResolver } from '@hookform/resolvers/zod';
import { Edit3, Loader2, Plus, X, User as UserIcon, ShieldCheck, Stethoscope, Mail, Phone, Info } from 'lucide-react';
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

type UserFormData = z.infer<typeof userSchema>;

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
  const titles = titlesResp || [];
  const { data: deptsResp } = useDepartments();
  const departments = deptsResp || [];

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
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
    if (open) {
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
    }
  }, [user, reset, open]);

  const onSubmit = async (data: UserFormData) => {
    try {
      if (isEdit) {
        const updateData: any = {
          ...data,
          employeeNo: user!.employeeNo,
        };
        await updateUser.mutateAsync({ id: user!.id, data: updateData });
        message.success('用户信息更新成功');
      } else {
        const resp = await createUser.mutateAsync(data as any);
        const result = resp as any;
        if (result && result.employeeNo) {
          message.success(
            `新增用户成功！工号: ${result.employeeNo}，默认密码: 123456。`
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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-gray-900/60 transition-opacity backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl text-white shadow-lg ${isEdit ? 'bg-blue-600 shadow-blue-200' : 'bg-emerald-600 shadow-emerald-200'}`}>
              {isEdit ? <Edit3 size={24} /> : <Plus size={24} />}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{isEdit ? '编辑系统用户' : '新建系统用户'}</h3>
              <p className="text-sm text-gray-500 font-medium">配置账号登录凭证、人员基本信息及科室归属</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all">
            <X size={24} />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="overflow-y-auto flex-1 p-8 md:p-10">
          <div className="space-y-10">
            {/* Section: Account Info */}
            <section>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1.5 h-5 bg-blue-600 rounded-full" />
                <h4 className="text-base font-bold text-gray-900 tracking-tight">账号登录信息</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <UserIcon size={14} className="text-gray-400" />
                    登录账号 <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('username')}
                    disabled={isEdit}
                    placeholder="请输入登录名 (建议使用姓名拼音)"
                    className={`w-full px-4 py-2.5 bg-gray-50 border ${errors.username ? 'border-red-500' : 'border-gray-200'} rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all ${isEdit ? 'opacity-60 cursor-not-allowed bg-gray-100' : ''}`}
                  />
                  {errors.username && <p className="text-xs text-red-500 mt-1 font-medium">{errors.username.message}</p>}
                </div>

                {!isEdit && (
                  <div className="md:col-span-2 p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3">
                    <Info size={18} className="text-amber-600 shrink-0 mt-0.5" />
                    <div className="text-xs text-amber-700 leading-relaxed font-medium">
                      工号将由系统自动分配（EMP + 序列号），初始默认登录密码为 <span className="bg-amber-100 px-1.5 py-0.5 rounded font-bold border border-amber-200 text-amber-900 mx-1">123456</span>，请在创建成功后通知用户及时修改。
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Section: Profile Info */}
            <section>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1.5 h-5 bg-indigo-600 rounded-full" />
                <h4 className="text-base font-bold text-gray-900 tracking-tight">人员基础资料</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">真实姓名 <span className="text-red-500">*</span></label>
                  <input
                    {...register('realName')}
                    placeholder="请输入人员法定姓名"
                    className={`w-full px-4 py-2.5 bg-gray-50 border ${errors.realName ? 'border-red-500' : 'border-gray-200'} rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all`}
                  />
                  {errors.realName && <p className="text-xs text-red-500 mt-1 font-medium">{errors.realName.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Phone size={14} className="text-gray-400" />
                    手机号码 <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('phone')}
                    placeholder="请输入11位手机号"
                    className={`w-full px-4 py-2.5 bg-gray-50 border ${errors.phone ? 'border-red-500' : 'border-gray-200'} rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all`}
                  />
                  {errors.phone && <p className="text-xs text-red-500 mt-1 font-medium">{errors.phone.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <ShieldCheck size={14} className="text-gray-400" />
                    所属管理科室
                  </label>
                  <select
                    {...register('departmentId', { setValueAs: v => (v === "" || v === null || v === undefined) ? null : Number(v) })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all appearance-none cursor-pointer"
                  >
                    <option value="">暂无所属科室</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Mail size={14} className="text-gray-400" />
                    电子邮箱
                  </label>
                  <input
                    {...register('email')}
                    placeholder="用于接收系统通知 (选填)"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>
              </div>
            </section>

            {/* Section: Doctor Toggle */}
            <section>
              <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600 rounded-lg text-white">
                      <Stethoscope size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 tracking-tight">医务人员标记</h4>
                      <p className="text-[11px] text-blue-600 font-bold opacity-70">开启后将同步建立医生临床档案</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" {...register('isDoctor')} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {isDoctor && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6 pt-6 border-t border-blue-100 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-gray-700">临床职称</label>
                      <select
                        {...register('title')}
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all cursor-pointer appearance-none"
                      >
                        <option value="">请选择职称</option>
                        {titles.map(t => (
                          <option key={t.id} value={t.name}>{t.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-gray-700">专业特长</label>
                      <input
                        {...register('specialty')}
                        placeholder="如: 介入心脏病学"
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-1.5">
                      <label className="text-sm font-semibold text-gray-700">个人临床简介</label>
                      <textarea
                        {...register('introduction')}
                        rows={3}
                        placeholder="请简要介绍医生的教育背景、科研成果等..."
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all resize-none shadow-inner"
                      />
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>
        </form>

        {/* Action Buttons */}
        <div className="px-8 py-6 border-t border-gray-100 flex justify-end gap-4 bg-gray-50/30">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95 shadow-sm"
          >
            取消
          </button>
          <button
            type="submit"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className={`
              flex items-center justify-center min-w-[120px] gap-2 px-8 py-2.5 text-white text-sm font-bold rounded-xl transition-all active:scale-95 shadow-md
              ${isEdit 
                ? 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-200 shadow-blue-100' 
                : 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-emerald-200 shadow-emerald-100'
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : null}
            {isSubmitting ? '正在提交...' : (isEdit ? '保存更改' : '创建用户')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDialog;
