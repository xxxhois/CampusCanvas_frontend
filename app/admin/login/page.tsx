import { LoginForm } from '@/components/client/auth/login-form'

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-6">
        <h1 className="text-center text-2xl font-bold">管理员登录</h1>
        <LoginForm isAdmin={true} />
      </div>
    </div>
  )
}