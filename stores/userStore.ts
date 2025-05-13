import { apiClient } from '@/lib/api-client';
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, User } from '@/types/auth';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
// import { useToast } from '@/hooks/use-toast';

interface AuthState {
  token: string | null;
  currentUser: User | null;
  //isUnauthorized: boolean;
}

interface UserActions {
  register: (user: { username: string; email: string; password: string, code: string }) => Promise<RegisterResponse>;
  login: (credentials: { username: string; password: string }) => Promise<LoginResponse>;
  logout: () => void;
  //setUnauthorized: (value: boolean) => void;
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
            console.log('登录响应', response)
            set((state) => {
              state.token = response.data.token;
            })
            if (response.code === 200) {
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
                //state.token = response.data.token;
                state.currentUser = userResponse.data;
                console.log('更新store中的状态', state.token, state.currentUser)
              });
              console.log('获得用户信息', userResponse.data)
            }
            // 设置 cookie
            // Cookies.set('token', response.data.token, {
            //   expires: 7, // 7天后过期
            //   secure: process.env.NODE_ENV === 'production', // 在生产环境中使用 HTTPS
            //   sameSite: 'strict',
            // });

            return response;
          } catch (error) {
            throw error;  // 直接抛出错误，让调用者处理
          }
        },

        logout: () => set((state) => {
          state.token = null;
          state.currentUser = null;
        }),

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
        // storage: createJSONStorage(() => localStorage),
        partialize: (state: { token: any; }) => ({ token: state.token }) // 只持久化token
      }
    )
  )
);