export function getApiBaseUrl() {
  // 开发环境
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:8080'; // 开发环境后端地址
  }
  
  // 生产环境
  return process.env.NEXT_PUBLIC_API_URL || 'https://api.yourdomain.com'; // 生产环境后端地址
}