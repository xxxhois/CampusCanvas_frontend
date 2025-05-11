export const getApiBaseUrl = () => {
    if (process.env.NEXT_PUBLIC_API_BASE) {
      return process.env.NEXT_PUBLIC_API_BASE
    }

    switch (process.env.NEXT_PUBLIC_MODE) {
      case 'development':
        return 'http://100.66.86.59:8080'
      case 'mock':
        return 'http://127.0.0.1:4523/m1/5986883-0-default'
      case 'production':
        return 'https://api.yourdomain.com'
      case 'test':
        return 'https://staging-api.yourdomain.com'
      default:
        return 'http://localhost:3000/api'
    }
  }