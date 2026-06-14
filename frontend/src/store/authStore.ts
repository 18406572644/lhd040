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
          const res: any = await authApi.login({ username, password });
          console.log('[Login] 后端响应:', JSON.stringify(res));

          const isSuccess = (res.code === 0 || res.code === 200) && (res.data || res.token);
          if (!isSuccess) {
            console.warn('[Login] 登录失败判断: code=', res.code, ' hasData=', !!res.data);
            return false;
          }

          const payload = res.data || res;
          const token = payload.token;
          const uname = payload.username;
          const role = payload.role;
          const realName = payload.realName || uname;

          if (!token) {
            console.error('[Login] 响应中没有 token:', payload);
            return false;
          }

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

          console.log('[Login] 登录成功, user=', user, 'roleOriginal=', role, 'roleNormalized=', normalizedRole);
          return true;
        } catch (error: any) {
          const msg = error?.response?.data?.message || error?.message || '登录失败';
          console.error('[Login] 登录异常:', msg, error);
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
