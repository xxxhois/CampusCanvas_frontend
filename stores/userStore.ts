import { apiClient } from '@/lib/api-client';
import { AdminLoginResponse, LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, User } from '@/types/auth';
import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
// import { useToast } from '@/hooks/use-toast';

interface AuthState {
  token: string | null;
  currentUser: User | null;
  isAdmin: boolean;
  //isUnauthorized: boolean;
}

interface UserActions {
  register: (user: { username: string; email: string; password: string; code: string; avatarUrl?: string }) => Promise<RegisterResponse>;
  login: (credentials: LoginRequest) => Promise<boolean>;
  adminLogin: (credentials: LoginRequest) => Promise<boolean>;
  logout: () => void;
  //setUnauthorized: (value: boolean) => void;
  updateProfile: (update: Partial<User>) => void;
  followUser: (userId: number) => Promise<void>;
  unfollowUser: (userId: number) => Promise<void>;
}

export const useUserStore = create<AuthState & UserActions>()(
  devtools(
    persist(
      immer((set, get) => ({
        token: null,
        currentUser: null,
        isAdmin: false,
        //isUnauthorized: false,
        // setUnauthorized: (value) => set((state) => {
        //   state.isUnauthorized = value;
        // }),
        

        register: async (credentials: RegisterRequest) => {
          try {
            // 无感唯一性校验 - 用户名
            const usernameCheck = await apiClient<{ code: number; message: string; data: boolean }>({
              url: `/users/check/username?username=${encodeURIComponent(credentials.username)}`,
              method: 'GET'
            });
            // if (usernameCheck.code !== 200) {
            //   throw new Error(usernameCheck.message || '用户名校验失败');
            // }

            // 无感唯一性校验 - 邮箱
            const emailCheck = await apiClient<{ code: number; message: string; data: boolean }>({
              url: `/users/check/email?email=${encodeURIComponent(credentials.email)}`,
              method: 'GET'
            });
            // if (emailCheck.code !== 200) {
            //   throw new Error(emailCheck.message || '邮箱校验失败');
            // }
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
            console.log('注册失败', error)
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

            if (response.code === 200) {
              const { userId, token } = response.data;
              
              // 先设置 token
              set((state) => {
                state.token = token;
                state.isAdmin = false;
              });
              
              // 获取用户信息
              const userResponse = await apiClient<{
                code: number;
                message: string;
                data: User;
              }>({
                url: `/users/${userId}`,
                method: 'GET'
              });

              // 更新用户信息
              set((state) => {
                state.currentUser = userResponse.data;
                console.log('更新store中的状态', state.token, state.currentUser)
              });
              console.log('获得用户信息', userResponse.data)
              return true;
            }
            return false;
          } catch (error) {
            throw error;
          }
        },

        adminLogin: async (credentials: LoginRequest) => {
          try {
            const response = await apiClient<AdminLoginResponse>({
              url: '/admin/login',
              method: 'POST',
              data: credentials
            });

            if (response.code === 200) {
              const { token } = response.data;
              // 设置 token
              set((state) => {
                state.token = token;
                state.isAdmin = true;
              });
              return true;
            }
            return false;
          } catch (error) {
            throw error;
          }
        },

        logout: () => set((state) => {
          state.token = null;
          state.currentUser = null;
          state.isAdmin = false;
        }),

        updateProfile: (update: Partial<User>) => {
          set((state) => ({
            ...state,
            currentUser: state.currentUser ? { ...state.currentUser, ...update } : null
          }));
        },
        followUser: async (userId: number) => {
          try {
            // 调用关注API
            await apiClient({
              url: '/follows',
              method: 'POST',
              data: {
                followerId: useUserStore.getState().currentUser?.id,
                followingId: userId
              }
            });

            // 更新本地状态
            set((state) => {
              if (state.currentUser && !state.currentUser.followingIds.includes(userId)) {
                state.currentUser.followingIds.push(userId);
              }
            });
          } catch (error) {
            console.error('关注用户失败:', error);
            throw error;
          }
        },
        unfollowUser: async (userId: number) => {
          try {
            // 调用取消关注API
            await apiClient({
              url: '/follows',
              method: 'DELETE',
              data: {
                followerId: useUserStore.getState().currentUser?.id,
                followingId: userId
              }
            });

            // 更新本地状态
            set((state) => {
              if (state.currentUser) {
                state.currentUser.followingIds = state.currentUser.followingIds.filter(id => id !== userId);
              }
            });
          } catch (error) {
            console.error('取消关注用户失败:', error);
            throw error;
          }
        }
      })),
      {
        name: 'user-storage', // 本地存储的key
        storage: createJSONStorage(() => localStorage), // 明确指定使用localStorage
        partialize: (state) => ({ 
          token: state.token,
          currentUser: state.currentUser 
        }) // 持久化token和用户信息
      }
    )
  )
);