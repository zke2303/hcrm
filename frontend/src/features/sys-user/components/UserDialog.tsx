import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Building,
    Edit3,
    Key,
    Mail,
    Phone,
    Plus,
    ShieldCheck,
    Stethoscope,
    User,
    X
} from 'lucide-react';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useCreateUser, useUpdateUser } from '../hooks/useUsers';
import type { User as UserType } from '../types';

const userSchema = z.object({
  username: z.string().min(3, '账号至少3个字符'),
  password: z.string().min(6, '密码至少6个字符').optional().or(z.literal('')),
  realName: z.string().min(2, '请输入真实姓名'),
  phone: z.string().regex(/^1[3-9]\d{9}$/, '请输入正确的手机号'),
  email: z.string().email('请输入有效的邮箱').optional().or(z.literal('')),
  employeeNo: z.string().optional(),
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
        employeeNo: user.employeeNo || '',
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
        password: '',
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
        await updateUser.mutateAsync({ id: user!.id, data });
      } else {
        await createUser.mutateAsync(data as any);
      }
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex-center"
          />
          
          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-2xl shadow-2xl z-[51] overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-black/5 bg-primary/5">
              <h3 className="text-lg font-bold flex items-center gap-2">
                {isEdit ? <Edit3 size={20} className="text-primary" /> : <Plus size={20} className="text-primary" />}
                {isEdit ? '编辑用户信息' : '创建新用户'}
              </h3>
              <button 
                onClick={onClose} 
                className="p-1 hover:bg-black/5 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                {/* 账号信息 */}
                <div className="col-span-2 text-xs font-bold text-primary uppercase tracking-wider mb-2 flex items-center gap-2">
                  <ShieldCheck size={14} /> 账号与安全
                </div>
                
                <div className="space-y-1">
                  <label className="text-sm font-medium text-text-sub">用户账号*</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30" size={16} />
                    <input 
                      {...register('username')}
                      disabled={isEdit}
                      className={`w-full pl-10 pr-4 py-2 bg-black/5 border ${errors.username ? 'border-red-500' : 'border-transparent'} rounded-lg focus:bg-white focus:border-primary outline-none transition-all`}
                    />
                  </div>
                  {errors.username && <p className="text-xs text-red-500">{(errors.username.message as string)}</p>}
                </div>

                {!isEdit && (
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-text-sub">登录密码*</label>
                    <div className="relative">
                       <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30" size={16} />
                       <input 
                         type="password"
                         {...register('password')}
                         className={`w-full pl-10 pr-4 py-2 bg-black/5 border ${errors.password ? 'border-red-500' : 'border-transparent'} rounded-lg focus:bg-white focus:border-primary outline-none transition-all`}
                       />
                    </div>
                    {errors.password && <p className="text-xs text-red-500">{(errors.password.message as string)}</p>}
                  </div>
                 )}

                {/* 个人资料 */}
                <div className="col-span-2 text-xs font-bold text-primary uppercase tracking-wider mt-4 mb-2 flex items-center gap-2">
                  <Building size={14} /> 基本资料
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-text-sub">真实姓名*</label>
                  <input 
                    {...register('realName')}
                    className={`w-full px-4 py-2 bg-black/5 border ${errors.realName ? 'border-red-500' : 'border-transparent'} rounded-lg focus:bg-white focus:border-primary outline-none transition-all`}
                  />
                  {errors.realName && <p className="text-xs text-red-500">{(errors.realName.message as string)}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-text-sub">联系电话*</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30" size={16} />
                    <input 
                      {...register('phone')}
                      className={`w-full pl-10 pr-4 py-2 bg-black/5 border ${errors.phone ? 'border-red-500' : 'border-transparent'} rounded-lg focus:bg-white focus:border-primary outline-none transition-all`}
                    />
                  </div>
                  {errors.phone && <p className="text-xs text-red-500">{(errors.phone.message as string)}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-text-sub">电子邮箱</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30" size={16} />
                    <input 
                      {...register('email')}
                      className={`w-full pl-10 pr-4 py-2 bg-black/5 border border-transparent rounded-lg focus:bg-white focus:border-primary outline-none transition-all`}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-text-sub">工号</label>
                  <input 
                    {...register('employeeNo')}
                    className="w-full px-4 py-2 bg-black/5 border border-transparent rounded-lg focus:bg-white focus:border-primary outline-none transition-all"
                  />
                </div>

                {/* 医护联动 */}
                <div className="col-span-2 mt-4 p-4 bg-primary/5 rounded-xl border border-primary/10">
                   <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Stethoscope size={18} className="text-primary" />
                        <span className="font-bold text-sm">医务人员档案联动</span>
                      </div>
                      <input 
                        type="checkbox" 
                        {...register('isDoctor')}
                        className="w-5 h-5 accent-primary cursor-pointer"
                      />
                   </div>
                   
                   {isDoctor && (
                     <motion.div 
                       initial={{ opacity: 0, height: 0 }}
                       animate={{ opacity: 1, height: 'auto' }}
                       className="grid grid-cols-2 gap-4 mt-2"
                     >
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-text-sub">职务/职称</label>
                          <input 
                            {...register('title')}
                            placeholder="如：副主任医师"
                            className="w-full px-3 py-1.5 text-sm bg-white border border-black/10 rounded-lg outline-none focus:border-primary"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-text-sub">擅长领域</label>
                          <input 
                            {...register('specialty')}
                            placeholder="如：心血管、高血压"
                            className="w-full px-3 py-1.5 text-sm bg-white border border-black/10 rounded-lg outline-none focus:border-primary"
                          />
                        </div>
                        <div className="col-span-2 space-y-1">
                          <label className="text-xs font-semibold text-text-sub">个人简介</label>
                          <textarea 
                            {...register('introduction')}
                            rows={3}
                            className="w-full px-3 py-1.5 text-sm bg-white border border-black/10 rounded-lg outline-none focus:border-primary resize-none"
                          />
                        </div>
                     </motion.div>
                   )}
                </div>
              </div>

              <div className="mt-8 flex items-center justify-end gap-3 px-2">
                <button 
                  type="button" 
                  onClick={onClose}
                  className="px-6 py-2 border border-black/10 rounded-lg text-sm font-bold hover:bg-black/5 transition-all"
                >
                  取消
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-8 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary-light shadow-lg shadow-primary/20 disabled:opacity-50 transition-all"
                >
                  {isSubmitting ? '提交中...' : isEdit ? '保存更改' : '立即创建'}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default UserDialog;
