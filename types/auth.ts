
// export interface ApiResponse<T = unknown> {
//     code: number
//     message: string
//     data: T
//   }
  
  // 用户实体类型
export interface User {
  id: number;
  username: string;
  email: string;
  followingIds: number[];
  followerIds: number[];
  avatar?: string;
  bio?: string;
}
  
  // 登录请求/响应
export interface LoginRequest {
    username: string
    password: string
  }
  
export interface LoginResponse {
    code: number
    message: string
    data: {
      userId: number
      token: string
    }
  }
  
  // 注册请求/响应
export interface RegisterRequest extends LoginRequest {
    email: string
    code: string
    avatar?: string
    bio?: string
  }
  
export interface RegisterResponse {
    code: number
    message: string
    data: {
      id: number
      username: string
      email: string
      bio?: string
      avatarUrl?: string
    }
  }