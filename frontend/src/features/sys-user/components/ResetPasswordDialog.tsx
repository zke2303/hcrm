import { AnimatePresence, motion } from 'framer-motion';
import { Key, ShieldAlert, X } from 'lucide-react';
import React, { useState } from 'react';
import { userApi } from '../api';

interface ResetPasswordDialogProps {
  open: boolean;
  onClose: () => void;
  userId: number;
  username: string;
}

const ResetPasswordDialog: React.FC<ResetPasswordDialogProps> = ({ open, onClose, userId, username }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('密码长度至少为 6 位');
      return;
    }
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await userApi.resetPassword(userId, password);
      alert('密码重置成功');
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || '重置失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex-center"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl z-[51] overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-black/5 bg-red-50/50">
              <h3 className="text-lg font-bold flex items-center gap-2 text-red-700">
                <ShieldAlert size={20} />
                重置密码
              </h3>
              <button 
                onClick={onClose} 
                className="p-1 hover:bg-black/5 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <p className="text-sm text-text-sub">
                正在为用户 <span className="font-bold text-text-main">{username}</span> 重置登录密码。
              </p>

              <div className="space-y-1">
                <label className="text-sm font-medium text-text-sub">新密码</label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30" size={16} />
                  <input 
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="请输入新密码"
                    className="w-full pl-10 pr-4 py-2 bg-black/5 border border-transparent rounded-lg focus:bg-white focus:border-red-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-text-sub">确认新密码</label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30" size={16} />
                  <input 
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="请再次输入新密码"
                    className="w-full pl-10 pr-4 py-2 bg-black/5 border border-transparent rounded-lg focus:bg-white focus:border-red-500 outline-none transition-all"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600 flex items-center gap-2">
                  <ShieldAlert size={14} />
                  {error}
                </div>
              )}

              <div className="mt-6 flex items-center justify-end gap-3">
                <button 
                  type="button" 
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-bold border border-black/10 rounded-lg hover:bg-black/5"
                >
                  取消
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 shadow-lg shadow-red-200 disabled:opacity-50 transition-all"
                >
                  {loading ? '重置中...' : '确认重置'}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ResetPasswordDialog;
