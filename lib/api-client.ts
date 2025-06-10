//import { useToast } from '@/components/ui/use-toast';
import { useUserStore } from '@/stores/userStore';
import { getApiBaseUrl } from './config';

// 从localStorage获取token的辅助函数
const getTokenFromStorage = () => {
  if (typeof window === 'undefined') return null;
  
  try {
    const storedState = localStorage.getItem('user-storage');
    if (storedState) {
      const { state } = JSON.parse(storedState);
      return state.token;
    }
  } catch (error) {
    console.error('从localStorage获取token失败:', error);
  }
  return null;
};

// 获取token的统一方法
const getToken = () => {
  // 首先尝试从store获取
  const storeToken = useUserStore.getState().token;
  if (storeToken) return storeToken;
  
  // 如果store中没有，尝试从localStorage获取
  const storageToken = getTokenFromStorage();
  if (storageToken) {
    // 如果从localStorage获取到token，同步到store
    useUserStore.setState({ token: storageToken });
    return storageToken;
  }
  
  return null;
};

type RequestConfig = {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  headers?: HeadersInit;
  credentials?: RequestCredentials;
  responseHandler?: {
    parseJson?: boolean;
    onResponse?: (response: Response) => Promise<any>;
    onError?: (error: any) => Promise<any>;
  };
};

export async function apiClient<T>(config: RequestConfig): Promise<T> {
  const baseUrl = getApiBaseUrl();
  
  // 处理路径格式
  const path = config.url.startsWith('/') ? config.url : `/${config.url}`;
  const url = `${baseUrl}${path}`;
  console.log('API URL:', url);

  // 获取token
  const token = getToken();
  
  // 构建请求头
  const headers = new Headers();
  
  // 设置基础请求头
  headers.append('Content-Type', 'application/json');
  
  // 添加自定义请求头
  if (config.headers) {
    Object.entries(config.headers).forEach(([key, value]) => {
      headers.append(key, value);
    });
  }

  // 如果有token，添加到请求头
  if (token) {
    // 如果已经存在Authorization头，先删除
    if (headers.has('Authorization')) {
      headers.delete('Authorization');
    }
    headers.append('Authorization', token)
  }

  try {
    const response = await fetch(url, {
      method: config.method || 'GET',
      headers,
      credentials: config.credentials,
      body: config.data ? JSON.stringify(config.data) : undefined,
    });

    console.log('原始请求状态码:', response.status);

    if (config.responseHandler?.onResponse) {
      return await config.responseHandler.onResponse(response);
    }

    // 尝试解析响应体
    const data = await response.json();
    console.log('API Response:', data);

    // 如果原始请求状态码不是200或业务状态码不是200，则视为失败
    if (response.status !== 200 || (data.code && data.code !== 200)) {
      console.log('状态码:', response.status);
      if (data.code === 401) {
        useUserStore.getState().logout();
        window.location.href = '/login';
      }
      throw new Error(data.message || '请求响应失败');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    if (config.responseHandler?.onError) {
      return await config.responseHandler.onError(error);
    }
    throw error;
  }
}