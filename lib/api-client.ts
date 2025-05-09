import { getApiBaseUrl } from './config';

type RequestConfig = {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  headers?: HeadersInit;
};

export async function apiClient<T>(config: RequestConfig): Promise<T> {
  const baseUrl = getApiBaseUrl();
  
  // 处理路径格式
  const path = config.url.startsWith('/') ? config.url : `/${config.url}`;
  const url = `${baseUrl}${path}`;
  console.log('API URL:', url);
  const response = await fetch(url, {
    method: config.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...config.headers,
    },
    body: config.data ? JSON.stringify(config.data) : undefined,
  });
  // console.log(response)
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '请求失败');
  }

  return response.json();
}