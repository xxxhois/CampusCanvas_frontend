// import { apiClient } from '@/lib/api-client'
// import { RegisterResponse } from '@/types/auth'
// import { NextResponse } from 'next/server'

// export async function POST(request: Request) {
//   console.log('Register API called')
//   const requestBody = await request.json()
//   // 1. 直接转发请求到 Spring Boot
//   const springBootRes:RegisterResponse = await apiClient({
//     url: '/users',
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json', // 明确指定 JSON 类型
//       ...request.headers,                  // 透传其他头（可选）
//     },
//     data: requestBody.data, // 直接传递解析后的 JSON 对象
//   });
  
//   const responseData: RegisterResponse = await springBootRes;
//   console.log('Spring Boot Response:', responseData)
//   if (responseData.code !== 200) {
//     return NextResponse.json(
//       { error: responseData.message || 'Signin Failed' },
//       { status: responseData.code }
//     );
//   }

//   return NextResponse.json({ success: true });
// }