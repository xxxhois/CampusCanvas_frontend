import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { apiClient } from '@/lib/api-client';
import { http } from '@/lib/fetch';
import { immer } from 'zustand/middleware/immer';
import { LoginResponse, User } from '@/types/auth';
import { useToast } from '@/hooks/use-toast';

interface AuthState {
  token: string | null;
  currentUser: User | null;
}

interface UserActions {
  register: (user: { username: string; email: string; password: string, code: string }) => Promise<void>;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  logout: () => void;
  updateProfile: (update: Partial<User>) => void;
  followUser: (userId: number) => void;
  unfollowUser: (userId: number) => void;
}

export const useUserStore = create<AuthState & UserActions>()(
  devtools(
    persist(
      immer((set, get) => ({
        token: null,
        currentUser: null,

        register: async (credentials: RegisterRequest) => {
          try {
            // 无感唯一性校验 - 用户名
            const usernameCheck = await apiClient<{ code: number; message: string; data: boolean }>({
              url: '/users/check/username',
              method: 'POST',
              data: { username: credentials.username }
            });
            // if (!usernameCheck.data) {
            //   throw new Error('用户名已被占用');
            // }

            // 无感唯一性校验 - 邮箱
            const emailCheck = await apiClient<{ code: number; message: string; data: boolean }>({
              url: '/users/check/email',
              method: 'POST',
              data: { email: credentials.email }
            });
            // if (!emailCheck.data) {
            //   throw new Error('邮箱已被占用');
            // }

            // 注册请求
            const res = await apiClient<RegisterResponse>({
              url: '/users',
              method: 'POST',
              data: credentials
            });

            return res;
          } catch (error) {
            throw error;  // 直接抛出错误，让调用者处理
          }
        },

        login: async (credentials: LoginRequest) => {
          try {
            const response = await apiClient<LoginResponse>({
              url: '/auth/login',
              method: 'POST',
              data: credentials
            });

            const userResponse = await apiClient<{
              code: number;
              message: string;
              data: User;
            }>({
              url: `/users/${response.data.userId}`,
              method: 'GET'
            });

            // 更新 store 中的状态
            set((state) => {
              state.token = response.data.token;
              state.currentUser = userResponse.data;
            });

            return response;
          } catch (error) {
            throw error;  // 直接抛出错误，让调用者处理
          }
        },

        logout: () => {
          set({ token: null, currentUser: null });
        },
        updateProfile: (update: Partial<User>) => {
          set((state: { currentUser: User | null; }) => {
            if (state.currentUser) {
              Object.assign(state.currentUser, update);
            }
          });
        },
        followUser: (userId: number) => {
          set((state: AuthState & UserActions) => {
            if (state.currentUser && !state.currentUser.followingIds.includes(userId)) {
              state.currentUser.followingIds.push(userId);
            }
          });
        },
        unfollowUser: (userId: number) => {
          set((state: AuthState & UserActions) => {
            if (state.currentUser) {
              state.currentUser.followingIds = state.currentUser.followingIds.filter((id: number) => id !== userId);
            }
          });
        }
      })),
      {
        name: 'user-storage', // 本地存储的key
        partialize: (state: { token: any; }) => ({ token: state.token }) // 只持久化token
      }
    )
  )
);