import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mockUsers } from '@/mock/data';

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

const generateUserFromUsername = (username: string): User => {
  const matchedUser = mockUsers.find((u) => u.username.toLowerCase() === username.toLowerCase());
  if (matchedUser) {
    return {
      id: matchedUser.id,
      username: matchedUser.username,
      name: matchedUser.name,
      role: matchedUser.role,
    };
  }
  const role = username.toLowerCase().includes('admin') ? 'admin'
    : username.toLowerCase().includes('manager') ? 'manager'
    : username.toLowerCase().includes('tech') ? 'technician'
    : username.toLowerCase().includes('reception') ? 'receptionist'
    : 'technician';
  return {
    id: String(Date.now()),
    username,
    name: username,
    role,
  };
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (username: string, password: string) => {
        await new Promise((resolve) => setTimeout(resolve, 500));

        if (username && password.length >= 3) {
          const user = generateUserFromUsername(username.trim());
          const token = 'mock-token-' + Date.now() + '-' + Math.random().toString(36).substring(2, 10);
          set({
            user,
            token,
            isAuthenticated: true,
          });
          return true;
        }
        return false;
      },

      logout: () => {
        localStorage.removeItem('auth-storage');
        sessionStorage.clear();
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'auth-storage',
      version: 2,
      migrate: (persistedState: any, version) => {
        if (version < 2) {
          return {
            ...persistedState,
            user: persistedState?.user ? generateUserFromUsername(persistedState.user.username) : null,
          };
        }
        return persistedState;
      },
    }
  )
);
