import { useMessage } from '@/components/common/MessageContext';
import { zodResolver } from '@hookform/resolvers/zod';
import { Edit3, Loader2, Plus, Upload, X } from 'lucide-react';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useDepartments, useRoles, useTitles } from '../../sys-user/hooks/useUsers';
import { useCreateDoctor, useUpdateDoctor } from '../hooks/useDoctors';
import type { Doctor } from '../types';

const doctorSchema = z.object({
  realName: z.string().min(2, '请输入真实姓名'),
  phone: z.string().regex(/^1[3-9]\d{9}$/, '请输入正确的手机号'),
  departmentId: z.number(),
  title: z.string().min(1, '请选择职称'),
  roleIds: z.array(z.number()).min(1, '请至少分配一个角色'),
  employeeNo: z.string().optional(),
  introduction: z.string().optional(),
  specialty: z.string().optional(),
  avatarUrl: z.string().optional(),
  status: z.number().optional(),
});

type DoctorFormData = z.infer<typeof doctorSchema>;

interface DoctorDialogProps {
  open: boolean;
  onClose: () => void;
  doctor?: Doctor | null;
}

const DoctorDialog: React.FC<DoctorDialogProps> = ({ open, onClose, doctor }) => {
  const isEdit = !!doctor;
  const createDoctor = useCreateDoctor();
  const updateDoctor = useUpdateDoctor();
  const message = useMessage();
  
  const { data: titles = [] } = useTitles();
  const { data: departments = [] } = useDepartments();
  const { data: roles = [] } = useRoles();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<DoctorFormData>({
    resolver: zodResolver(doctorSchema),
    defaultValues: {
      realName: '',
      phone: '',
      roleIds: [],
      status: 1,
    },
  });

  const selectedRoleIds = watch('roleIds') || [];

  useEffect(() => {
    if (doctor) {
      reset({
        realName: doctor.realName,
        phone: doctor.phone,
        departmentId: doctor.departmentId,
        title: doctor.title,
        roleIds: doctor.roles.map(r => r.id),
        employeeNo: doctor.employeeNo,
        introduction: doctor.introduction || '',
        specialty: doctor.specialty || '',
        avatarUrl: doctor.avatarUrl || '',
        status: doctor.status,
      });
    } else {
      reset({
        realName: '',
        phone: '',
        roleIds: [],
        status: 1,
      });
    }
  }, [doctor, reset]);

  const onSubmit = async (data: DoctorFormData) => {
    try {
      if (isEdit) {
        await updateDoctor.mutateAsync({ id: doctor!.id, data });
        message.success('医生档案更新成功');
      } else {
        await createDoctor.mutateAsync(data);
        message.success('医生档案创建成功');
      }
      onClose();
    } catch (err: any) {
      message.error(err.response?.data?.message || '操作失败，请稍后重试');
    }
  };

  const toggleRole = (roleId: number) => {
    const current = [...selectedRoleIds];
    const index = current.indexOf(roleId);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(roleId);
    }
    setValue('roleIds', current, { shouldValidate: true });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-gray-900/60 transition-opacity backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-200">
              {isEdit ? <Edit3 size={24} /> : <Plus size={24} />}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{isEdit ? '编辑医生档案' : '新建医生档案'}</h3>
              <p className="text-sm text-gray-500 font-medium">请填写医生基础信息及系统权限配置</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all">
            <X size={24} />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="overflow-y-auto flex-1 p-8 md:p-10">
          <div className="space-y-10">
            {/* Section: Basic Info */}
            <section>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1.5 h-5 bg-blue-600 rounded-full" />
                <h4 className="text-base font-bold text-gray-900 tracking-tight">基础及执业信息</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">姓名 <span className="text-red-500">*</span></label>
                  <input
                    {...register('realName')}
                    placeholder="请输入医生真实姓名"
                    className={`w-full px-4 py-2.5 bg-gray-50 border ${errors.realName ? 'border-red-500' : 'border-gray-200'} rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all`}
                  />
                  {errors.realName && <p className="text-xs text-red-500 mt-1 font-medium">{errors.realName.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">手机号 (系统登录名) <span className="text-red-500">*</span></label>
                  <input
                    {...register('phone')}
                    placeholder="请输入11位手机号码"
                    className={`w-full px-4 py-2.5 bg-gray-50 border ${errors.phone ? 'border-red-500' : 'border-gray-200'} rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all`}
                  />
                  {errors.phone && <p className="text-xs text-red-500 mt-1 font-medium">{errors.phone.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">所属科室 <span className="text-red-500">*</span></label>
                  <select
                    {...register('departmentId', { setValueAs: v => Number(v) })}
                    className={`w-full px-4 py-2.5 bg-gray-50 border ${errors.departmentId ? 'border-red-500' : 'border-gray-200'} rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all appearance-none cursor-pointer`}
                  >
                    <option value="">请选择科室</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                  {errors.departmentId && <p className="text-xs text-red-500 mt-1 font-medium">{errors.departmentId.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">专业职称 <span className="text-red-500">*</span></label>
                  <select
                    {...register('title')}
                    className={`w-full px-4 py-2.5 bg-gray-50 border ${errors.title ? 'border-red-500' : 'border-gray-200'} rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all appearance-none cursor-pointer`}
                  >
                    <option value="">请选择职称</option>
                    {titles.map(t => (
                      <option key={t.id} value={t.name}>{t.name}</option>
                    ))}
                  </select>
                  {errors.title && <p className="text-xs text-red-500 mt-1 font-medium">{errors.title.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">工号 (可选)</label>
                  <input
                    {...register('employeeNo')}
                    placeholder="不填写将自动生成"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">擅长领域</label>
                  <input
                    {...register('specialty')}
                    placeholder="如: 冠心病、高血压诊治"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>
              </div>
            </section>

            {/* Section: Roles */}
            <section>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1.5 h-5 bg-purple-600 rounded-full" />
                <h4 className="text-base font-bold text-gray-900 tracking-tight">角色权限分配 <span className="text-red-500 text-sm ml-1 font-normal">*</span></h4>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {roles.map(role => {
                  const isChecked = selectedRoleIds.includes(role.id);
                  return (
                    <div 
                      key={role.id}
                      onClick={() => toggleRole(role.id)}
                      className={`
                        cursor-pointer px-4 py-3 rounded-xl border-2 transition-all flex flex-col gap-1
                        ${isChecked 
                          ? 'bg-purple-50 border-purple-500 text-purple-700 ring-4 ring-purple-500/10' 
                          : 'bg-white border-gray-100 text-gray-600 hover:border-gray-200 hover:bg-gray-50'
                        }
                      `}
                    >
                      <span className="text-xs font-bold whitespace-nowrap">{role.name}</span>
                      <span className="text-[10px] opacity-70 truncate">{role.description || '无描述'}</span>
                    </div>
                  );
                })}
              </div>
              {errors.roleIds && <p className="text-xs text-red-500 mt-2 font-medium">{errors.roleIds.message}</p>}
            </section>

            {/* Section: Other */}
            <section>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1.5 h-5 bg-amber-500 rounded-full" />
                <h4 className="text-base font-bold text-gray-900 tracking-tight">个人背景及状态</h4>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">医生简介</label>
                  <textarea
                    {...register('introduction')}
                    rows={4}
                    placeholder="详细描述医生的执业背景、学术成果等 (200字以内)"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all resize-none shadow-inner"
                  />
                </div>

                <div className="flex flex-col md:flex-row gap-10">
                   <div className="space-y-3">
                      <label className="text-sm font-semibold text-gray-700">头像上传 (支持 jpg/png, &lt;2MB)</label>
                      <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-2xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 overflow-hidden group hover:border-blue-500 transition-all">
                          {watch('avatarUrl') ? (
                            <img src={watch('avatarUrl')} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            <Upload size={24} className="group-hover:text-blue-500 transition-colors" />
                          )}
                        </div>
                        <button type="button" className="text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-lg transition-colors border border-blue-100">选择图片</button>
                      </div>
                   </div>

                   {isEdit && (
                     <div className="space-y-3 flex-1">
                        <label className="text-sm font-semibold text-gray-700">执业状态维护</label>
                        <div className="flex gap-4 p-1.5 bg-gray-100 rounded-xl w-fit">
                           <button 
                             type="button" 
                             onClick={() => setValue('status', 1)}
                             className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${watch('status') === 1 ? 'bg-white text-emerald-600 shadow-sm ring-1 ring-emerald-500/10' : 'text-gray-500 hover:text-gray-700'}`}
                           >
                             在职
                           </button>
                           <button 
                             type="button"
                             onClick={() => setValue('status', 0)} 
                             className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${watch('status') === 0 ? 'bg-white text-rose-600 shadow-sm ring-1 ring-rose-500/10' : 'text-gray-500 hover:text-gray-700'}`}
                           >
                             离职
                           </button>
                        </div>
                     </div>
                   )}
                </div>
              </div>
            </section>
          </div>
        </form>

        {/* Action Buttons */}
        <div className="px-8 py-6 border-t border-gray-100 flex justify-end gap-4 bg-gray-50/30">
          {!isEdit && (
            <div className="flex-1 flex items-center gap-2 text-amber-600 font-medium text-xs bg-amber-50 px-4 py-2 rounded-xl border border-amber-100 mr-auto w-fit">
              <Plus size={14} className="stroke-[3]" />
              新建将同步创建系统账号，默认密码 123456
            </div>
          )}
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
            className="flex items-center justify-center min-w-[120px] gap-2 px-8 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-md shadow-blue-100"
          >
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : null}
            {isSubmitting ? '正在提交...' : (isEdit ? '保存更改' : '创建档案')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorDialog;
