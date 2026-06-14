import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (username: string, password: string) => {
        await new Promise((resolve) => setTimeout(resolve, 500));

        if (username && password.length >= 3) {
          const mockUser: User = {
            id: '1',
            username,
            name: username === 'admin' ? '管理员' : username === 'tech' ? '张技师' : '王师傅',
            role: username === 'admin' ? 'admin' : 'technician',
          };
          set({
            user: mockUser,
            token: 'mock-token-' + Date.now(),
            isAuthenticated: true,
          });
          return true;
        }
        return false;
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
    }
  )
);
