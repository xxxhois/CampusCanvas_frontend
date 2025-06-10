import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // 获取token
  const token = request.cookies.get('token')?.value
  console.log('中间件cookie获取到token', token)
  // 只检查/admin路径
  if (request.nextUrl.pathname === '/admin') {
    // 如果没有token，重定向到登录页
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return NextResponse.next()
}

// 只匹配/admin路径
export const config = {
  matcher: '/admin'
} 