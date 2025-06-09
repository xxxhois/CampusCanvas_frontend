export const getApiBaseUrl = () => {
    if (process.env.NEXT_PUBLIC_API_BASE) {
      return process.env.NEXT_PUBLIC_API_BASE
    }

    switch (process.env.NEXT_PUBLIC_MODE) {
      case 'development':
        return 'http://100.66.86.59:8080/campus-canvas/api'
      case 'mock':
        return 'http://127.0.0.1:4523/m1/5986883-0-default'
      case 'production':
        return 'http://100.66.86.59:8080/campus-canvas/api'
      case 'test':
        return 'https://staging-api.yourdomain.com'
      default:
        return 'http://localhost:3000/api'
    }
  }

export const getWsBaseUrl = () => {
    if (process.env.NEXT_PUBLIC_WS_BASE) {
        return process.env.NEXT_PUBLIC_WS_BASE
    }

    switch (process.env.NEXT_PUBLIC_MODE) {
        case 'development':
            return 'ws://100.66.86.59:8080/ws'
        case 'production':
            return 'ws://100.66.86.59:8080/ws'
        default:
            return 'ws://localhost:8080/ws'
    }
}