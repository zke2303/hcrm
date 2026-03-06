import { zodResolver } from '@hookform/resolvers/zod';
import * as LucideIcons from 'lucide-react';
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

const COMMON_ICONS = [
  'LayoutDashboard', 'Users', 'UserCog', 'Settings', 'Shield', 'Menu', 'List',
  'FileText', 'Database', 'BarChart', 'Bell', 'Calendar', 'Clipboard', 'Folder',
  'Home', 'Key', 'Lock', 'Mail', 'Search', 'Star', 'User', 'Activity', 'Book',
  'Box', 'Briefcase', 'Camera', 'CheckCircle', 'Circle', 'Cloud', 'Code', 'Coffee',
  'CreditCard', 'Download', 'Edit', 'Eye', 'Flag', 'Gift', 'Globe', 'Heart',
  'Image', 'Inbox', 'Info', 'Layers', 'Link', 'Map', 'MessageSquare', 'Monitor',
  'Package', 'Phone', 'PieChart', 'Plus', 'Printer', 'Radio', 'Save', 'Send',
  'Share', 'ShoppingCart', 'Smartphone', 'Smile', 'Sun', 'Tag', 'Target', 'Trash',
  'TrendingUp', 'Video', 'Wifi', 'Zap'
];

type MenuFormData = z.infer<typeof menuSchema>;

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
    formState: { errors, isSubmitting },
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
        message.success('菜单资源更新成功');
      } else {
        await createMenu.mutateAsync(data as any);
        message.success('菜单资源创建成功');
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
      
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl text-white shadow-lg ${isEdit ? 'bg-blue-600 shadow-blue-200' : 'bg-emerald-600 shadow-emerald-200'}`}>
              {isEdit ? <Edit3 size={24} /> : <Plus size={24} />}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{isEdit ? '编辑菜单资源' : '新建菜单/按钮'}</h3>
              <p className="text-sm text-gray-500 font-medium">
                {parent ? (
                   <>正在为 <span className="text-blue-600 font-bold">{parent.name}</span> 添加下级资源</>
                ) : '请配置资源的基础信息、路由路径及权限标识'}
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
                <h4 className="text-base font-bold text-gray-900 tracking-tight">资源类型</h4>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { type: 0, label: '目录', icon: Folder, color: 'orange' },
                  { type: 1, label: '菜单', icon: MenuIcon, color: 'blue' },
                  { type: 2, label: '按钮', icon: MousePointer2, color: 'gray' },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = menuType === item.type;
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-semibold text-gray-700">资源名称 <span className="text-red-500">*</span></label>
                  <input
                    {...register('name')}
                    placeholder="请输入资源名称，如：系统管理、用户列表"
                    className={`w-full px-4 py-2.5 bg-gray-50 border ${errors.name ? 'border-red-500' : 'border-gray-200'} rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all`}
                  />
                  {errors.name && <p className="text-xs text-red-500 mt-1 font-medium">{errors.name.message}</p>}
                </div>

                {menuType !== 2 && (
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">路由地址</label>
                    <input
                      {...register('path')}
                      placeholder="前端访问路径，如：/system/user"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all"
                    />
                  </div>
                )}

                {menuType === 1 && (
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">组件路径</label>
                    <input
                      {...register('component')}
                      placeholder="如：sys-user/components/UserList"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all"
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">权限标识</label>
                  <input
                    {...register('perms')}
                    placeholder="后端鉴权标识，如：sys:user:add"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">API 接口路径</label>
                  <input
                    {...register('apiPath')}
                    placeholder="API 匹配路径，如：/api/v1/users"
                    className="w-full px-4 py-2.5 bg-blue-50/30 border border-blue-100 rounded-xl text-sm font-mono text-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">排列顺序</label>
                  <input
                    type="number"
                    {...register('sortOrder', { valueAsNumber: true })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>

                {menuType !== 2 && (
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-sm font-semibold text-gray-700">菜单图标</label>
                    <div className="relative group/icon-select">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 relative">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                            {(() => {
                              const iconName = (watch('icon') as string) || '';
                              const IconComp = (LucideIcons as any)[iconName];
                              return IconComp ? <IconComp size={18} /> : <Plus size={18} />;
                            })()}
                          </div>
                          <input 
                            {...register('icon')} 
                            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all" 
                            placeholder="选择或输入图标名" 
                            autoComplete="off"
                            onFocus={(e) => {
                              const dropdown = e.currentTarget.nextElementSibling;
                              dropdown?.classList.remove('hidden');
                            }}
                          />
                          <div className="hidden absolute left-0 bottom-full mb-2 w-full max-h-64 overflow-y-auto bg-white border border-gray-100 rounded-2xl shadow-2xl z-[60] p-3 animate-in fade-in slide-in-from-bottom-2 duration-200"
                               onMouseDown={(e) => e.preventDefault()}>
                            <div className="grid grid-cols-8 gap-1.5">
                              {COMMON_ICONS.filter((name: string) => !watch('icon') || name.toLowerCase().includes(String(watch('icon')).toLowerCase())).map((iconName: string) => {
                                const IconRef = (LucideIcons as any)[iconName];
                                if (!IconRef) return null;
                                return (
                                  <button
                                    key={iconName}
                                    type="button"
                                    onClick={() => {
                                      setValue('icon', iconName);
                                      (document.activeElement as HTMLElement)?.blur();
                                    }}
                                    title={iconName}
                                    className={`p-2.5 flex items-center justify-center rounded-lg transition-all hover:bg-blue-50 hover:text-blue-600 ${watch('icon') === iconName ? 'bg-blue-100 text-blue-700 shadow-sm ring-1 ring-blue-200' : 'text-gray-500'}`}
                                  >
                                    <IconRef size={20} />
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                        <div className="w-12 h-10.5 flex items-center justify-center bg-gray-50 border border-gray-200 rounded-xl text-gray-400 group-focus-within/icon-select:border-blue-200 group-focus-within/icon-select:bg-blue-50 transition-all">
                          {(() => {
                            const iconName = (watch('icon') as string) || '';
                            const IconComp = (LucideIcons as any)[iconName];
                            return IconComp ? <IconComp size={22} className="text-blue-600" /> : <Plus size={20} />;
                          })()}
                        </div>
                      </div>
                      <style dangerouslySetInnerHTML={{ __html: `
                        input:not(:focus) + div { display: none !important; }
                      ` }} />
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Section: Status */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1.5 h-5 bg-emerald-500 rounded-full" />
                <h4 className="text-base font-bold text-gray-900 tracking-tight">状态维护</h4>
              </div>
              <div className="flex flex-wrap gap-8 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative inline-flex items-center">
                    <input type="checkbox" checked={watch('status') === 1} onChange={() => setValue('status', watch('status') === 1 ? 0 : 1)} className="sr-only" />
                    <div className={`w-11 h-6 rounded-full transition-colors duration-200 ${watch('status') === 1 ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
                    <div className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${watch('status') === 1 ? 'translate-x-5' : 'translate-x-0'}`}></div>
                  </div>
                  <span className="text-sm font-bold text-gray-700">启用状态</span>
                </label>

                {menuType !== 2 && (
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative inline-flex items-center">
                      <input type="checkbox" checked={watch('visible') === 1} onChange={() => setValue('visible', watch('visible') === 1 ? 0 : 1)} className="sr-only" />
                      <div className={`w-11 h-6 rounded-full transition-colors duration-200 ${watch('visible') === 1 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                      <div className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${watch('visible') === 1 ? 'translate-x-5' : 'translate-x-0'}`}></div>
                    </div>
                    <span className="text-sm font-bold text-gray-700">可见状态</span>
                  </label>
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
            {isSubmitting ? '正在提交...' : (isEdit ? '保存更改' : '立即创建')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuDialog;
