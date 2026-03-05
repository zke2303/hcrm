import { zodResolver } from '@hookform/resolvers/zod';
import { Edit3, Loader2, Plus, X } from 'lucide-react';
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

type RoleFormData = any;

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
    formState: { errors },
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
  }, [role, reset, open]);

  const onSubmit = async (data: RoleFormData) => {
    try {
      if (isEdit && role) {
        await updateRole.mutateAsync({ id: role.id, data });
        message.success('更新成功');
      } else {
        await createRole.mutateAsync(data as any);
        message.success('创建成功');
      }
      onClose();
    } catch (err: any) {
      message.error(err.response?.data?.message || '保存失败');
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${isEdit ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
              {isEdit ? <Edit3 size={20} /> : <Plus size={20} />}
            </div>
            <h3 className="text-lg font-bold text-gray-900">{isEdit ? '编辑角色' : '新建角色'}</h3>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-full transition">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
              角色名称 <span className="text-red-500">*</span>
            </label>
            <input
              {...register('name')}
              className={`w-full px-4 py-2 border rounded-xl outline-none transition duration-200 ${
                errors.name ? 'border-red-500 ring-4 ring-red-50' : 'border-gray-200 focus:ring-4 focus:ring-blue-50 focus:border-blue-500'
              }`}
              placeholder="请输入角色名称"
            />
            {errors.name && <p className="text-xs text-red-500 font-medium">{(errors.name as any).message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
              角色编码 <span className="text-red-500">*</span>
            </label>
            <input
              {...register('code')}
              disabled={isEdit && role?.isSystem === 1}
              className={`w-full px-4 py-2 border rounded-xl outline-none transition duration-200 ${
                 isEdit && role?.isSystem === 1 ? 'bg-gray-50 text-gray-400' : ''
              } ${
                errors.code ? 'border-red-500 ring-4 ring-red-50' : 'border-gray-200 focus:ring-4 focus:ring-blue-50 focus:border-blue-500'
              }`}
              placeholder="请输入角色编码（如 role_admin）"
            />
            {errors.code && <p className="text-xs text-red-500 font-medium">{(errors.code as any).message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">数据范围</label>
            <select
              {...register('dataScope', { valueAsNumber: true })}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition duration-200 bg-white"
            >
              <option value={1}>全部数据</option>
              <option value={2}>本机构</option>
              <option value={3}>本科室</option>
              <option value={4}>仅本人</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">角色描述</label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition duration-200 resize-none"
              placeholder="简要说明角色的用途"
            />
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-gray-50 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-200 transition active:scale-95"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={createRole.isPending || updateRole.isPending}
              className="flex-1 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {(createRole.isPending || updateRole.isPending) && <Loader2 size={18} className="animate-spin" />}
              {isEdit ? '保存更新' : '立即创建'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoleDialog;
