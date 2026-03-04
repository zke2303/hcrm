import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

const instance = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// 请求拦截器: 注入 Access Token
instance.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器: 处理 401 (Token 过期)
instance.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;
    
    // 如果返回 401 且未重试过
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // 尝试调用刷新 Token 接口 (后端会从 HttpOnly Cookie 获取 RefreshToken)
        const res = await axios.post('/api/v1/auth/refresh');
        const { accessToken } = res.data.data;
        
        // 更新 Store 中的 AccessToken
        useAuthStore.getState().updateAccessToken(accessToken);
        
        // 重新发起原始请求
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return instance(originalRequest);
      } catch (refreshError) {
        // 刷新失败，强制登出
        useAuthStore.getState().setLogout();
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default instance;
