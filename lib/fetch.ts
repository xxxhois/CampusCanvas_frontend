type FetchOptions = RequestInit & {
    baseUrl?: string
    timeout?: number
}
  
  async function coreFetch<T>(endpoint: string, options?: FetchOptions): Promise<T> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), options?.timeout || 5000)
  
    try {
      const response = await fetch(`${options?.baseUrl || ''}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers
        }
      })
  
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Request failed')
      }
  
      return response.json()
    } catch (error) {
      // 统一错误处理（可对接 Sentry）
      throw error instanceof Error ? error : new Error('Network error')
    } finally {
      clearTimeout(timeoutId)
    }
  }
  
  // 业务方法导出
  export const http = {
    get: <T>(url: string) => coreFetch<T>(url, { method: 'GET' }),
    post: <T>(url: string, body: unknown) => 
      coreFetch<T>(url, { method: 'POST', body: JSON.stringify(body) })
  }