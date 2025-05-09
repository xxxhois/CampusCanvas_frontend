import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // 白名单路径（登录/公开API）
  const publicPaths = ['/login', '/register','/api']
  if (publicPaths.some(p => request.nextUrl.pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // 从 Cookie 获取 Token
  const token = request.cookies.get('auth_token')?.value

  // 验证 Token 有效性
  const isValid = await verifyTokenLocally(token) 

  // if (request.nextUrl.pathname.startsWith('/api')) {
  //   return NextResponse.next();
  // }
  
  if (!isValid) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', request.nextUrl.pathname)
    loginUrl.searchParams.set('unauthorization', 'true')
    return NextResponse.redirect(loginUrl)
  }

  // 克隆请求并添加 Authorization 头（兼容已有后端）
  const headers = new Headers(request.headers)
  headers.set('Authorization', `Bearer ${token}`)

  return NextResponse.next({
    request: {
      headers: headers
    }
  })
}

// 简单本地验证（可选扩展）
async function verifyTokenLocally(token?: string) {
  //if (!token) return false
  // 可添加 JWT 解码验证（不调用后端）
  return true // 示例直接放行，实际需补充验证逻辑
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
  }