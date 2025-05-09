import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { apiClient } from '@/lib/api-client';
import { http } from '@/lib/fetch';
import { immer } from 'zustand/middleware/immer';

interface User {
  id: number; // 修改为 number 类型
  username: string;
  email: string;
  followingIds: number[]; // 数组元素类型改为 number
  followerIds: number[];
  //id: string;
  //username: string;
  //email: string;
  avatar: string;
  bio: string;
  //followingIds: string[];
  //followerIds: string[];
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

        login: async (credentials: any) => {
          try {
            return await http.
              post('/api/login', {
                data: credentials
              });
          } catch (error) {
            console.error('登录失败:', error);
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