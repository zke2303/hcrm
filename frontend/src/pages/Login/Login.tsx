import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import { Activity, AlertCircle, ChevronRight, Lock, User } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMessage } from '../../components/common/MessageContext';
import { useAuthStore } from '../../store/useAuthStore';
import './Login.css';

const API_BASE_URL = '/api'; // 代理路径

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const message = useMessage();

  const isLogin = useAuthStore(state => state.isLogin);
  const setLogin = useAuthStore(state => state.setLogin);
  const navigate = useNavigate();

  // 如果已经登录，直接跳转到首页
  useEffect(() => {
    if (isLogin) {
      navigate('/', { replace: true });
    }
  }, [isLogin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/v1/auth/login`, {
        username,
        password,
      });

      const { accessToken, user } = response.data.data;
      setLogin(accessToken, user);
      message.success('登录成功，欢迎进入协作工作台');
      
      // 登录成功转向
      navigate('/', { replace: true });
    } catch (err: any) {
      const msg = err.response?.data?.message || '登录请求失败，请检查网络或配置';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container flex-center">
      {/* 动态背景装饰 */}
      <motion.div 
        className="bg-blob" 
        style={{ top: '10%', left: '15%', background: '#E0F2FE' }}
        animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
        transition={{ duration: 15, repeat: Infinity }}
      />
      <motion.div 
        className="bg-blob" 
        style={{ bottom: '15%', right: '10%', background: '#F0F9FF' }}
        animate={{ scale: [1, 1.15, 1], rotate: [0, -45, 0] }}
        transition={{ duration: 12, repeat: Infinity }}
      />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="login-card glass-effect"
      >
        <div className="login-header">
          <div className="logo-box flex-center">
            <Activity size={28} strokeWidth={2.5} />
          </div>
          <h2>HCRM 系统</h2>
          <p>新一代协作式健康管理工作台</p>
        </div>

        <form onSubmit={handleSubmit}>
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="error-message overflow-hidden"
              >
                <AlertCircle size={16} />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="form-group">
            <label>账户</label>
            <div className="input-wrapper">
              <User size={18} className="icon" />
              <input 
                type="text" 
                placeholder="请输入登录用户名" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>安全凭证</label>
            <div className="input-wrapper">
              <Lock size={18} className="icon" />
              <input 
                type="password" 
                placeholder="请输入管理密码" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <motion.button 
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="submit" 
            className="login-button flex-center"
            disabled={loading}
          >
            {loading ? '身份校验中...' : (
              <>
                进入系统 <ChevronRight size={18} style={{ marginLeft: 6 }} />
              </>
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
