import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface User {
  id: number;
  username: string;
  realName: string;
  roles: string[];
  permissions: string[];
  doctorId?: number;
  departmentId?: number;
}

interface AuthState {
  accessToken: string | null;
  user: User | null;
  isLogin: boolean;
  setLogin: (token: string, user: User) => void;
  setLogout: () => void;
  updateAccessToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      isLogin: false,
      setLogin: (token, user) => set({ accessToken: token, user, isLogin: true }),
      setLogout: () => set({ accessToken: null, user: null, isLogin: false }),
      updateAccessToken: (token) => set({ accessToken: token }),
    }),
    {
      name: 'hcrm-auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
