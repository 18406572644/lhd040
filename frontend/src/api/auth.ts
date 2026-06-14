import request from '@/utils/request';

export const authApi = {
  login: (data: { username: string; password: string }): Promise<{ code: number; data: { token: string; username: string; role: string; realName: string }; message?: string }> => {
    return request.post('/auth/login', data);
  },

  register: (data: { username: string; password: string; realName: string; phone?: string; email?: string }): Promise<{ code: number; data: any; message?: string }> => {
    return request.post('/auth/register', data);
  },

  getCurrentUser: (): Promise<{ code: number; data: any; message?: string }> => {
    return request.get('/auth/me');
  },
};

export default authApi;
