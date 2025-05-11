import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // 白名单路径（登录/注册页面和静态资源）
  const publicPaths = ['/login', '/register', '/_next', '/favicon.ico']
  if (publicPaths.some(p => request.nextUrl.pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // 从 Cookie 获取 Token
  const token = request.cookies.get('auth_token')?.value
  const isValid = await verifyTokenLocally(token)
  
  if (!isValid) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
    loginUrl.searchParams.set('unauthorization', 'true')
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

async function verifyTokenLocally(token?: string) {
  if (!token) return false
  return true
}

export const config = {
  matcher: [
    // 匹配所有页面路由，排除静态资源
    '/((?!_next/static|_next/image|favicon.ico).*)'
  ]
}