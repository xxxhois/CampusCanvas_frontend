import { NextResponse } from 'next/server'
import { apiClient } from '@/lib/api-client'
import { LoginResponse } from '@/types/auth'



export async function POST(request: Request) {
  console.log('Login API called')
  const requestBody = await request.json()
  // 1. 直接转发请求到 Spring Boot
  const springBootRes:LoginResponse = await apiClient({
    url: '/auth/login',//SpringBoot的登录接口（通过apiClient拼接baseUrl)
    method: 'POST', 
    headers: request.headers,
    data: requestBody.data // 透传请求体
  });
  
  // 2. 从 Spring Boot 响应中提取 Token 并设置 Cookie
  const responseData: LoginResponse = springBootRes;
  if (responseData.code !== 200) {
    return NextResponse.json(
      { error: responseData.message || 'Login failed' },
      { status: responseData.code }
    );
  }

  const token = responseData.data.token;
  const response = NextResponse.json({ success: true });
  response.cookies.set({
    name: 'auth_token',
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 3600,
    sameSite: 'strict'
  });

  return response;
}