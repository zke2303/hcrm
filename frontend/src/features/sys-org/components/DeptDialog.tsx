import { useMessage } from '@/components/common/MessageContext';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, Folder, Info, Loader2, Plus, X } from 'lucide-react';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useCreateDept } from '../hooks/useOrg';
import type { DepartmentTreeVO } from '../types';

const deptSchema = z.object({
  name: z.string().min(2, '名称至少2个字符'),
  code: z.string().min(2, '编码至少2个字符'),
  parentId: z.number().nullable(),
  status: z.number(),
  type: z.number(), // 1-医院/机构, 2-科室
});

type DeptFormData = z.infer<typeof deptSchema>;

interface DeptDialogProps {
  open: boolean;
  onClose: () => void;
  parent?: DepartmentTreeVO | null;
}

const DeptDialog: React.FC<DeptDialogProps> = ({ open, onClose, parent }) => {
  const createDept = useCreateDept();
  const message = useMessage();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<DeptFormData>({
    resolver: zodResolver(deptSchema),
    defaultValues: {
      name: '',
      code: '',
      parentId: parent?.id || null,
      status: 1,
      type: 2,
    },
  });

  const deptType = watch('type');

  useEffect(() => {
    if (open) {
      reset({
        name: '',
        code: '',
        parentId: parent?.id || null,
        status: 1,
        type: 2,
      });
    }
  }, [open, parent, reset]);

  const onSubmit = async (data: DeptFormData) => {
    // 逻辑验证：医院(1) 不能创建在 医院(1) 之内
    if (data.type === 1 && parent?.type === 1) {
      message.error('医院节点无法创建在另一个医院节点内');
      return;
    }

    try {
      await createDept.mutateAsync(data);
      message.success('新增科室/节点成功');
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
            <div className="p-2.5 rounded-xl text-white shadow-lg bg-emerald-600 shadow-emerald-200">
              <Plus size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">新增组织节点</h3>
              <p className="text-sm text-gray-500 font-medium">
                {parent ? (
                  <>正在为 <span className="text-blue-600 font-bold">{parent.name}</span> 添加下级科室</>
                ) : '创建顶级组织机构节点'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all">
            <X size={24} />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="overflow-y-auto flex-1 p-8">
          <div className="space-y-8">
            {/* Section: Type Selector */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1.5 h-5 bg-blue-600 rounded-full" />
                <h4 className="text-base font-bold text-gray-900 tracking-tight">节点类型</h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { type: 1, label: '机构/院区', icon: Building2, color: 'blue' },
                  { type: 2, label: '临床科室', icon: Folder, color: 'orange' },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = deptType === item.type;
                  return (
                    <div
                      key={item.type}
                      onClick={() => setValue('type', item.type)}
                      className={`
                        cursor-pointer flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all
                        ${isActive 
                          ? `bg-${item.color}-50 border-${item.color}-500 text-${item.color}-700 ring-4 ring-${item.color}-500/10 shadow-sm` 
                          : 'bg-gray-50 border-transparent text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                        }
                      `}
                    >
                      <Icon size={24} />
                      <span className="text-sm font-bold">{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Section: Basic Info */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1.5 h-5 bg-indigo-600 rounded-full" />
                <h4 className="text-base font-bold text-gray-900 tracking-tight">基础配置</h4>
              </div>
              
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">科室名称 <span className="text-red-500">*</span></label>
                  <input
                    {...register('name')}
                    placeholder="请输入科室或机构名称"
                    className={`w-full px-4 py-2.5 bg-gray-50 border ${errors.name ? 'border-red-500' : 'border-gray-200'} rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all`}
                  />
                  {errors.name && <p className="text-xs text-red-500 mt-1 font-medium">{errors.name.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">科室编码 <span className="text-red-500">*</span></label>
                  <input
                    {...register('code')}
                    placeholder="系统唯一编码，如: DEPT_001"
                    className={`w-full px-4 py-2.5 bg-gray-50 border ${errors.code ? 'border-red-500' : 'border-gray-200'} rounded-xl text-sm font-mono focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all`}
                  />
                  {errors.code && <p className="text-xs text-red-500 mt-1 font-medium">{errors.code.message}</p>}
                </div>

                <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3">
                   <Info size={18} className="text-amber-600 shrink-0 mt-0.5" />
                   <p className="text-xs text-amber-700 leading-relaxed font-medium">
                      名称和编码在全院范围内必须唯一。建立层级关系后，可通过拖拽功能在组织树中灵活调整。
                   </p>
                </div>
              </div>
            </section>

            {/* Section: Status */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1.5 h-5 bg-emerald-500 rounded-full" />
                <h4 className="text-base font-bold text-gray-900 tracking-tight">状态维护</h4>
              </div>
              <div className="flex items-center gap-8 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative inline-flex items-center">
                    <input type="checkbox" checked={watch('status') === 1} onChange={() => setValue('status', watch('status') === 1 ? 0 : 1)} className="sr-only" />
                    <div className={`w-11 h-6 rounded-full transition-colors duration-200 ${watch('status') === 1 ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
                    <div className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${watch('status') === 1 ? 'translate-x-5' : 'translate-x-0'}`}></div>
                  </div>
                  <span className="text-sm font-bold text-gray-700">启用状态</span>
                </label>
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
            disabled={isSubmitting}
            className="flex items-center justify-center min-w-[120px] gap-2 px-8 py-2.5 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-200 transition-all active:scale-95 shadow-md shadow-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : null}
            {isSubmitting ? '正在提交...' : '立即创建'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeptDialog;
