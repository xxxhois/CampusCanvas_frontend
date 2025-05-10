import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { apiClient } from '@/lib/api-client';
import { http } from '@/lib/fetch';
import { immer } from 'zustand/middleware/immer';
import { LoginResponse } from '@/types/auth';

interface User {
  id: number; // 修改为 number 类型
  username: string;
  email: string;
  followingIds: number[]; // 数组元素类型改为 number
  followerIds: number[];
  avatar: string;
  bio: string;
}

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

        register: async (credentials:any) => {
          try {
            return await http.
              post('/api/register', {
                data: credentials
              });
          } catch (error) {
            console.error('注册失败:', error);
            throw error;
          }
        },

        login: async (credentials: { username: string; password: string }) => {
          try {
            const response = await apiClient<LoginResponse>({
              url: '/auth/login',
              method: 'POST',
              data: credentials,
              responseHandler: {
                onResponse: async (response) => {
                  const data = await response.json();
                  if (data.code !== 200) {
                    throw new Error(data.message);
                  }
                  return data;
                }
              }
            });
            const userResponse = await apiClient<{
              code: number;
              message: string;
              data: User;
            }>({
              url: `/users/${response.data.userId}`,
              method: 'GET',
              responseHandler: {
                onResponse: async (response) => {
                  const data = await response.json();
                  if (data.code !== 200) {
                    throw new Error(data.message);
                  }
                  return data;
                }
              }
            });
            // 更新 store 中的状态
            set((state) => {
              state.token = response.data.token;
              state.currentUser = userResponse.data;
            });

            return response;
          } catch (error) {
            // 使用 toast 显示错误信息
            const { toast } = useToast();
            toast({
              title: "登录失败",
              description: error instanceof Error ? error.message : "请检查您的登录信息",
              variant: "destructive",
            });
            throw error;
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
        // logout() {
        //   set({ token: null, currentUser: null });
        // },

        // updateProfile(update: any) {
        //   set((state: { currentUser: any; }) => {
        //     if (state.currentUser) {
        //       Object.assign(state.currentUser, update);
        //     }
        //   });
        // },

        // followUser(userId: any) {
        //   set((state: { currentUser: { followingIds: any[]; }; }) => {
        //     if (state.currentUser && !state.currentUser.followingIds.includes(userId)) {
        //       state.currentUser.followingIds.push(userId);
        //     }
        //   });
        // },

        // unfollowUser(userId: any) {
        //   set((state: { currentUser: { followingIds: any[]; }; }) => {
        //     if (state.currentUser) {
        //       state.currentUser.followingIds = state.currentUser.followingIds.filter((id: any) => id !== userId);
        //     }
        //   });
        // }
      })),
      {
        name: 'user-storage', // 本地存储的key
        partialize: (state: { token: any; }) => ({ token: state.token }) // 只持久化token
      }
    )
  )
);