import { getApiBaseUrl } from './config';
import { useUserStore } from '@/stores/userStore';
type RequestConfig = {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  headers?: HeadersInit;
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
      body: config.data ? JSON.stringify(config.data) : undefined,
    });

    if (config.responseHandler?.onResponse) {
      return await config.responseHandler.onResponse(response);
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '请求失败');//如果响应中不存在message，则抛出请求失败
    }

    return response.json();
  } catch (error) {
    if (config.responseHandler?.onError) {
      return await config.responseHandler.onError(error);
    }
    throw error;
  }
}