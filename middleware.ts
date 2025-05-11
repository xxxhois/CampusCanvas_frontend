import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // 白名单路径（登录/注册页面和静态资源）
  const publicPaths = ['/login', '/register', '/_next', '/favicon.ico']
  if (publicPaths.some(p => request.nextUrl.pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // 从 LocalStorage 获取 Token
  const token = localStorage.getItem('auth_token')
  const isValid = await verifyTokenLocally(token)
  
  if (!isValid) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
    loginUrl.searchParams.set('unauthorization', 'true')
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

async function verifyTokenLocally(token: string | null) {
  if (!token) return false
  // 本地解析和验证JWT
  try {
    // JWT格式: header.payload.signature
    const parts = token.split('.')
    if (parts.length !== 3) return false

    const payload = JSON.parse(atob(parts[1]))
    // 检查exp字段（过期时间，单位为秒）
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      return false
    }
    // 你可以根据需要增加更多payload字段的校验
    return true
  } catch (e) {
    return false
  }
}

export const config = {
  matcher: [
    // 匹配所有页面路由，排除静态资源
    '/((?!_next/static|_next/image|favicon.ico).*)'
  ]
}