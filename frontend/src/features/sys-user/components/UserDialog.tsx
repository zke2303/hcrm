import { useMessage } from '@/components/common/MessageContext';
import { zodResolver } from '@hookform/resolvers/zod';
import { Info, Loader2, Lock, Mail, Phone, Plus, ShieldCheck, Stethoscope, User as UserIcon, X } from 'lucide-react';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useCreateUser, useDepartments, useTitles, useUpdateUser, useUser } from '../hooks/useUsers';
import type { User as UserType } from '../types';

const userSchema = z.object({
  username: z.string().optional(),
  realName: z.string().min(2, '请输入真实姓名'),
  phone: z.string().regex(/^1[3-9]\d{9}$/, '请输入正确的手机号'),
  email: z.string().email('请输入有效的邮箱').optional().or(z.literal('')),
  employeeNo: z.string().optional(),
  departmentId: z.number().optional().nullable(),
  remark: z.string().optional(),
  status: z.number().default(1),
  roleIds: z.array(z.number()).default([]),
  isDoctor: z.boolean().default(false),
  title: z.string().optional(),
  specialty: z.string().optional(),
  introduction: z.string().optional(),
});

type UserFormData = z.infer<typeof userSchema>;

interface UserDialogProps {
  open: boolean;
  onClose: () => void;
  user?: UserType | null;
  defaultDeptId?: number;
  hideAccountSection?: boolean;
}

const UserDialog: React.FC<UserDialogProps> = ({ open, onClose, user, defaultDeptId, hideAccountSection = false }) => {
  const isEdit = !!user;
  
  // 确保在弹窗打开且处于编辑模式时获取数据
  const { data: fullUser, isFetching } = useUser(user?.id || 0, open && isEdit);
  
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
    formState: { errors, isSubmitting },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: '',
      realName: '',
      phone: '',
      status: 1,
      roleIds: [],
      isDoctor: false,
    },
  });

  const isDoctor = watch('isDoctor');

  // 精简逻辑：监听 open 和 fullUser 的变化来同步表单
  useEffect(() => {
    if (!open) return;

    if (isEdit) {
      // 优先从详情接口获取最新数据，如果没有则使用基础列表传入的数据兜底
      const data = fullUser || user;
      if (data) {
        reset({
          username: data.username || '',
          realName: data.realName || '',
          phone: data.phone || '',
          email: data.email || '',
          employeeNo: data.employeeNo || '',
          departmentId: data.departmentId,
          remark: 'remark' in data ? (data as any).remark || '' : '',
          status: data.status,
          roleIds: 'roles' in data ? (data as any).roles?.map((r: any) => r.id) || [] : [],
          isDoctor: data.isDoctor || false,
          title: data.title || '',
          specialty: data.specialty || '',
          introduction: data.introduction || '',
        });
      }
    } else {
      reset({
        username: '',
        realName: '',
        phone: '',
        email: '',
        employeeNo: '',
        departmentId: defaultDeptId || null,
        status: 1,
        roleIds: [],
        isDoctor: false,
        title: '',
        specialty: '',
        introduction: '',
      });
    }
  }, [open, isEdit, fullUser, user, reset, defaultDeptId]);

  const onSubmit = async (data: UserFormData) => {
    try {
      if (isEdit && user) {
        await updateUser.mutateAsync({ id: user.id, data: data as any });
        message.success('更新成功');
        onClose();
      } else {
        await createUser.mutateAsync(data as any);
        message.success('创建成功');
        onClose();
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || '操作失败');
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-gray-900/60 transition-opacity backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* 精简后的加载遮罩：仅在数据真正获取中时显示 */}
        {isEdit && isFetching && !fullUser && (
          <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center gap-4 text-blue-600">
            <Loader2 className="animate-spin" size={48} />
            <p className="text-sm font-black tracking-widest uppercase">Fetching Profile...</p>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl text-white shadow-lg ${isEdit ? 'bg-blue-600 shadow-blue-200' : 'bg-emerald-600 shadow-emerald-200'}`}>
              {isEdit ? <UserIcon size={24} /> : <Plus size={24} />}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{isEdit ? '编辑人员资料' : '新增人员'}</h3>
              <p className="text-sm text-gray-500 font-medium">
                {isEdit ? `工号: ${watch('employeeNo') || '-'}` : '录入新的人员基础信息及临床档案'}
              </p>
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
            {!hideAccountSection && (
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-1.5 h-5 bg-blue-600 rounded-full" />
                  <h4 className="text-base font-bold text-gray-900 tracking-tight">账号登录信息</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Lock size={14} className="text-gray-400" />
                      登录账号 <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register('username')}
                      disabled={isEdit}
                      placeholder="请输入登录名"
                      className={`w-full px-4 py-2.5 bg-gray-50 border ${errors.username ? 'border-red-500' : 'border-gray-200'} rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all ${isEdit ? 'opacity-60 cursor-not-allowed bg-gray-100' : ''}`}
                    />
                    {errors.username && <p className="text-xs text-red-500 mt-1 font-medium">{errors.username.message}</p>}
                  </div>
                  
                  {!isEdit && (
                    <div className="md:col-span-2 p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3">
                      <Info size={18} className="text-amber-600 shrink-0 mt-0.5" />
                      <div className="text-xs text-amber-700 leading-relaxed font-medium">
                        工号由系统自动分配，初始默认密码为 <span className="font-bold underline">123456</span>。
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

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
                    placeholder="人员法定姓名"
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
                    placeholder="11位手机号"
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
                    placeholder="选填"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>
              </div>
            </section>

            {/* Section: Doctor Toggle & Info */}
            <section>
              <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600 rounded-lg text-white">
                      <Stethoscope size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 tracking-tight">医务人员身份</h4>
                      <p className="text-[11px] text-blue-600 font-bold opacity-70">开启后将同步临床档案</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" {...register('isDoctor')} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
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
                        placeholder="临床专业方向"
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-1.5">
                      <label className="text-sm font-semibold text-gray-700">个人临床简介</label>
                      <textarea
                        {...register('introduction')}
                        rows={3}
                        placeholder="请简要介绍医生的专业背景、擅长领域等..."
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
          <button type="button" onClick={onClose} className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all active:scale-95 shadow-sm">
            取消
          </button>
          <button
            type="submit"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting || (isEdit && isFetching && !fullUser)}
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
            {isSubmitting ? '正在提交...' : (isEdit ? '保存更改' : '立即创建')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDialog;
