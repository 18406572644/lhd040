import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '@/api/auth';

interface User {
  id: string;
  username: string;
  name: string;
  role: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const ROLE_LABEL_MAP: Record<string, string> = {
  ADMIN: 'admin',
  TECHNICIAN: 'technician',
  RECEPTIONIST: 'receptionist',
  MANAGER: 'manager',
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (username: string, password: string) => {
        try {
          const res = await authApi.login({ username, password });

          if (res.code === 0 && res.data) {
            const { token, username: uname, role, realName } = res.data;
            const normalizedRole = ROLE_LABEL_MAP[role] || role.toLowerCase();

            const user: User = {
              id: String(Date.now()),
              username: uname,
              name: realName || uname,
              role: normalizedRole,
            };

            set({
              user,
              token,
              isAuthenticated: true,
            });

            return true;
          }

          return false;
        } catch (error: any) {
          const msg = error?.response?.data?.message || error?.message || '登录失败';
          console.error('登录失败:', msg);
          return false;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'auth-storage',
      version: 3,
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
