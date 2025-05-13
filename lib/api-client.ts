//import { useToast } from '@/components/ui/use-toast';
import { useUserStore } from '@/stores/userStore';
import { getApiBaseUrl } from './config';
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
  try {
    const response = await fetch(url, {
      method: config.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${useUserStore.getState().token}`,
        ...config.headers,
      },
      credentials: config.credentials,
      body: config.data ? JSON.stringify(config.data) : undefined,
    });

    if (config.responseHandler?.onResponse) {
      return await config.responseHandler.onResponse(response);
    }

    // 先检查响应状态
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // 尝试解析响应体
    const data = await response.json();
    console.log('API Response:', data);

    // 检查业务状态码
    if (data.code && data.code !== 200) {
      if (data.code === 401) {
        useUserStore.getState().logout();
        //window.location.href = '/login';
        //return data;
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