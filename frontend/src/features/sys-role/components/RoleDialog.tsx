import { zodResolver } from '@hookform/resolvers/zod';
import { Edit3, Loader2, Plus, X, ShieldCheck, Database, Info } from 'lucide-react';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useMessage } from '@/components/common/MessageContext';
import { useCreateRole, useUpdateRole } from '../hooks/useRoles';
import type { Role } from '../types';

const roleSchema = z.object({
  name: z.string().min(2, '名称至少2个字符'),
  code: z.string().min(2, '编码至少2个字符'),
  description: z.string().optional(),
  dataScope: z.number().default(1),
  status: z.number().default(1),
});

type RoleFormData = z.infer<typeof roleSchema>;

interface RoleDialogProps {
  open: boolean;
  onClose: () => void;
  role?: Role | null;
}

const RoleDialog: React.FC<RoleDialogProps> = ({ open, onClose, role }) => {
  const isEdit = !!role;
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();
  const message = useMessage();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: '',
      code: '',
      description: '',
      dataScope: 1,
      status: 1,
    },
  });

  useEffect(() => {
    if (open) {
      if (role) {
        reset({
          name: role.name,
          code: role.code,
          description: role.description || '',
          dataScope: role.dataScope,
          status: role.status,
        });
      } else {
        reset({
          name: '',
          code: '',
          description: '',
          dataScope: 1,
          status: 1,
        });
      }
    }
  }, [role, reset, open]);

  const onSubmit = async (data: RoleFormData) => {
    try {
      if (isEdit && role) {
        await updateRole.mutateAsync({ id: role.id, data });
        message.success('角色信息更新成功');
      } else {
        await createRole.mutateAsync(data as any);
        message.success('新角色创建成功');
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
      
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl text-white shadow-lg ${isEdit ? 'bg-blue-600 shadow-blue-200' : 'bg-emerald-600 shadow-emerald-200'}`}>
              {isEdit ? <Edit3 size={24} /> : <Plus size={24} />}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{isEdit ? '编辑角色信息' : '新建角色'}</h3>
              <p className="text-sm text-gray-500 font-medium">请配置角色名称、唯一编码及数据权限范围</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all">
            <X size={24} />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="overflow-y-auto flex-1 p-8">
          <div className="space-y-8">
            {/* Section: Basic Info */}
            <section>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1.5 h-5 bg-blue-600 rounded-full" />
                <h4 className="text-base font-bold text-gray-900 tracking-tight">基础及识别信息</h4>
              </div>
              
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">角色名称 <span className="text-red-500">*</span></label>
                  <input
                    {...register('name')}
                    placeholder="请输入易于识别的角色名称"
                    className={`w-full px-4 py-2.5 bg-gray-50 border ${errors.name ? 'border-red-500' : 'border-gray-200'} rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all`}
                  />
                  {errors.name && <p className="text-xs text-red-500 mt-1 font-medium">{errors.name.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">角色编码 <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <ShieldCheck size={18} />
                    </div>
                    <input
                      {...register('code')}
                      disabled={isEdit && role?.isSystem === 1}
                      placeholder="全局唯一标识，如: role_admin"
                      className={`w-full pl-11 pr-4 py-2.5 bg-gray-50 border ${errors.code ? 'border-red-500' : 'border-gray-200'} rounded-xl text-sm font-mono focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all ${isEdit && role?.isSystem === 1 ? 'opacity-60 cursor-not-allowed' : ''}`}
                    />
                  </div>
                  {errors.code && <p className="text-xs text-red-500 mt-1 font-medium">{errors.code.message}</p>}
                  {isEdit && role?.isSystem === 1 && <p className="text-[11px] text-indigo-500 mt-1 font-medium">系统内置角色，禁止修改编码</p>}
                </div>
              </div>
            </section>

            {/* Section: Data Scope */}
            <section>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1.5 h-5 bg-amber-500 rounded-full" />
                <h4 className="text-base font-bold text-gray-900 tracking-tight">数据权限范围</h4>
              </div>
              
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">可见数据级别</label>
                  <div className="relative">
                     <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <Database size={18} />
                     </div>
                     <select
                        {...register('dataScope', { valueAsNumber: true })}
                        className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all appearance-none cursor-pointer"
                      >
                        <option value={1}>全部数据权限 (无限制)</option>
                        <option value={2}>本机构数据权限</option>
                        <option value={3}>本科室数据权限</option>
                        <option value={4}>仅本人数据权限 (最小闭环)</option>
                      </select>
                  </div>
                </div>

                <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3">
                   <Info size={18} className="text-amber-600 shrink-0 mt-0.5" />
                   <p className="text-xs text-amber-700 leading-relaxed">
                      数据权限将决定该角色在各业务模块下能够查阅到的数据行级别范围，功能权限需在角色列表中另行分配。
                   </p>
                </div>
              </div>
            </section>

            {/* Section: Other */}
            <section>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1.5 h-5 bg-gray-400 rounded-full" />
                <h4 className="text-base font-bold text-gray-900 tracking-tight">备注信息</h4>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-1.5">
                  <textarea
                    {...register('description')}
                    rows={3}
                    placeholder="简要说明角色的职能或用途 (选填)"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all resize-none shadow-inner"
                  />
                </div>

                <div className="flex flex-col gap-3">
                   <label className="text-sm font-semibold text-gray-700">角色生命周期状态</label>
                   <div className="flex gap-4 p-1.5 bg-gray-100 rounded-xl w-fit">
                      <button 
                        type="button" 
                        disabled={isEdit && role?.isSystem === 1}
                        onClick={() => setValue('status', 1)}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${watch('status') === 1 ? 'bg-white text-emerald-600 shadow-sm ring-1 ring-emerald-500/10' : 'text-gray-500 hover:text-gray-700'} ${isEdit && role?.isSystem === 1 ? 'opacity-50' : ''}`}
                      >
                        启用
                      </button>
                      <button 
                        type="button"
                        disabled={isEdit && role?.isSystem === 1}
                        onClick={() => setValue('status', 0)} 
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${watch('status') === 0 ? 'bg-white text-rose-600 shadow-sm ring-1 ring-rose-500/10' : 'text-gray-500 hover:text-gray-700'} ${isEdit && role?.isSystem === 1 ? 'opacity-50' : ''}`}
                      >
                        禁用
                      </button>
                   </div>
                </div>
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
            {isSubmitting ? '正在提交...' : (isEdit ? '保存更改' : '立即创建')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleDialog;
