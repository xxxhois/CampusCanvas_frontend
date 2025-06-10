import { LoginForm } from '@/components/client/auth/login-form'
import { Suspense } from 'react'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-6">
        <Suspense fallback={<div>加载中...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
