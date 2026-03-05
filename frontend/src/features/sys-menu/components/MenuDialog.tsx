import { zodResolver } from '@hookform/resolvers/zod';
import { Edit3, Folder, Loader2, Menu as MenuIcon, MousePointer2, Plus, X } from 'lucide-react';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useMessage } from '@/components/common/MessageContext';
import { useCreateMenu, useUpdateMenu } from '../hooks/useMenus';
import type { Menu } from '../types';

const menuSchema = z.object({
  parentId: z.number().default(0),
  name: z.string().min(2, '名称至少2个字符'),
  type: z.number().default(1), // 0-目录, 1-菜单, 2-按钮
  path: z.string().optional().or(z.literal('')),
  component: z.string().optional().or(z.literal('')),
  perms: z.string().optional().or(z.literal('')),
  icon: z.string().optional().or(z.literal('')),
  sortOrder: z.number().default(0),
  status: z.number().default(1),
  visible: z.number().default(1),
  apiPath: z.string().optional().or(z.literal('')),
});

type MenuFormData = any;

interface MenuDialogProps {
  open: boolean;
  onClose: () => void;
  menu?: Menu | null; // 编辑模式
  parent?: Menu | null; // 添加子菜单模式
}

const nodeAsNumber = (val: any) => {
  const n = Number(val);
  return isNaN(n) ? 0 : n;
};

const MenuDialog: React.FC<MenuDialogProps> = ({ open, onClose, menu, parent }) => {
  const isEdit = !!menu;
  const createMenu = useCreateMenu();
  const updateMenu = useUpdateMenu();
  const message = useMessage();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<MenuFormData>({
    resolver: zodResolver(menuSchema),
    defaultValues: {
      parentId: 0,
      name: '',
      type: 1,
      sortOrder: 0,
      status: 1,
      visible: 1,
    },
  });

  const menuType = watch('type');

  useEffect(() => {
    if (!open) return;

    if (menu) {
      reset({
        parentId: menu.parentId,
        name: menu.name,
        type: menu.type,
        path: menu.path || '',
        component: menu.component || '',
        perms: menu.perms || '',
        icon: menu.icon || '',
        sortOrder: nodeAsNumber(menu.sortOrder),
        status: menu.status,
        visible: menu.visible,
        apiPath: menu.apiPath || '',
      });
    } else if (parent) {
      reset({
        parentId: parent.id,
        name: '',
        type: parent.type === 0 ? 1 : 2,
        sortOrder: 0,
        status: 1,
        visible: 1,
      });
    } else {
      reset({
        parentId: 0,
        name: '',
        type: 0,
        sortOrder: 0,
        status: 1,
        visible: 1,
      });
    }
  }, [open, menu, parent, reset]);

  const onSubmit = async (data: MenuFormData) => {
    try {
      if (isEdit && menu) {
        await updateMenu.mutateAsync({ id: menu.id, data: data as any });
        message.success('菜单更新成功');
      } else {
        await createMenu.mutateAsync(data as any);
        message.success('子资源创建成功');
      }
      onClose();
    } catch (err: any) {
      message.error(err.response?.data?.message || '保存失败');
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
       <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden transform animate-in zoom-in-95 duration-200 my-auto">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-lg ${isEdit ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                {isEdit ? <Edit3 size={20} /> : <Plus size={20} />}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{isEdit ? '编辑菜单资源' : '新增菜单/按钮'}</h3>
                {parent && <p className="text-xs text-gray-400 mt-0.5 font-medium">上级：<span className="text-blue-600 font-bold">{parent.name}</span></p>}
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-full transition">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6">
             <div className="grid grid-cols-2 gap-5">
                 <div className="col-span-2 flex items-center gap-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-2 flex-1">
                       <div 
                          onClick={() => setValue('type', 0)}
                          className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all cursor-pointer select-none ${menuType === 0 ? 'bg-white border-blue-500 shadow-lg text-blue-700 font-bold' : 'border-dashed border-gray-200 text-gray-400 grayscale hover:grayscale-0 hover:border-blue-100'}`}>
                          <Folder size={18} />
                          <span>目录</span>
                       </div>
                       <div 
                          onClick={() => setValue('type', 1)}
                          className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all cursor-pointer select-none ${menuType === 1 ? 'bg-white border-blue-500 shadow-lg text-blue-700 font-bold' : 'border-dashed border-gray-200 text-gray-400 grayscale hover:grayscale-0 hover:border-blue-100'}`}>
                          <MenuIcon size={18} />
                          <span>菜单</span>
                       </div>
                       <div 
                          onClick={() => setValue('type', 2)}
                          className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all cursor-pointer select-none ${menuType === 2 ? 'bg-white border-blue-500 shadow-lg text-blue-700 font-bold' : 'border-dashed border-gray-200 text-gray-400 grayscale hover:grayscale-0 hover:border-blue-100'}`}>
                          <MousePointer2 size={18} />
                          <span>按钮</span>
                       </div>
                    </div>
                 </div>

                <div className="space-y-2 col-span-2">
                   <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">资源名称 <span className="text-red-500">*</span></label>
                   <input {...register('name')} className={`w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all ${errors.name ? 'border-red-500' : 'border-gray-200'}`} placeholder="如：系统管理、用户列表、新增按钮" />
                   {errors.name && <p className="text-xs text-red-500 font-medium">{(errors.name as any).message}</p>}
                </div>

                {menuType !== 2 && (
                   <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">路由地址</label>
                      <input {...register('path')} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all font-mono text-sm" placeholder="前端路径，如：/system/user" />
                   </div>
                )}

                {menuType === 1 && (
                   <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">组件路径</label>
                      <input {...register('component')} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all font-mono text-sm" placeholder="src/features/sys-user/components/UserList" />
                   </div>
                )}

                <div className="space-y-2">
                   <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">权限标识</label>
                   <input {...register('perms')} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all font-mono text-sm" placeholder="后端鉴权标识，如：sys:user:add" />
                </div>

                <div className="space-y-2">
                   <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">API 路径接口</label>
                   <input {...register('apiPath')} className="w-full px-4 py-2.5 bg-blue-50/30 border border-blue-100 rounded-xl outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all font-mono text-sm text-blue-700" placeholder="API 匹配路径，如：/api/v1/users/status" />
                </div>

                {menuType !== 2 && (
                   <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">图标</label>
                      <input {...register('icon')} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all" placeholder="Lucide 图标名，如：Users" />
                   </div>
                )}

                <div className="space-y-2">
                   <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">排列顺序</label>
                   <input type="number" {...register('sortOrder', { valueAsNumber: true })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all" />
                </div>

                <div className="flex items-center gap-8 py-2 col-span-2">
                   <label className="flex items-center gap-2 cursor-pointer group">
                      <div className="relative inline-flex items-center">
                         <input type="checkbox" checked={watch('status') === 1} onChange={() => setValue('status', watch('status') === 1 ? 0 : 1)} className="sr-only" />
                         <div className={`w-10 h-5 rounded-full transition-colors duration-200 ${watch('status') === 1 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                         <div className={`absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform duration-200 ${watch('status') === 1 ? 'translate-x-5' : 'translate-x-0'}`}></div>
                      </div>
                      <span className="text-sm font-bold text-gray-700">状态：{watch('status') === 1 ? '启用' : '停用'}</span>
                   </label>
                   
                   {menuType !== 2 && (
                      <label className="flex items-center gap-2 cursor-pointer group">
                         <div className="relative inline-flex items-center">
                            <input type="checkbox" checked={watch('visible') === 1} onChange={() => setValue('visible', watch('visible') === 1 ? 0 : 1)} className="sr-only" />
                            <div className={`w-10 h-5 rounded-full transition-colors duration-200 ${watch('visible') === 1 ? 'bg-green-600' : 'bg-gray-200'}`}></div>
                            <div className={`absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform duration-200 ${watch('visible') === 1 ? 'translate-x-5' : 'translate-x-0'}`}></div>
                         </div>
                         <span className="text-sm font-bold text-gray-700">可见：{watch('visible') === 1 ? '显示' : '隐藏'}</span>
                      </label>
                   )}
                </div>
             </div>

             <div className="flex items-center gap-4 pt-8 border-t border-gray-100 mt-6">
                <button type="button" onClick={onClose} className="flex-1 p-3 bg-gray-100 text-gray-700 rounded-2xl text-sm font-bold hover:bg-gray-200 transition-all active:scale-95">取消</button>
                <button type="submit" disabled={createMenu.isPending || updateMenu.isPending} className="flex-1 p-3 bg-blue-600 text-white rounded-2xl text-sm font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
                   {(createMenu.isPending || updateMenu.isPending) && <Loader2 size={18} className="animate-spin" />}
                   {isEdit ? '保存更新' : '立即发布'}
                </button>
             </div>
          </form>
       </div>
    </div>
  );
};

export default MenuDialog;
