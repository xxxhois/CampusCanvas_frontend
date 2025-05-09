import { LoginForm } from '@/components/client/auth/login-form'


export default function LoginPage() {
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-6">
        <LoginForm />
      </div>
    </div>
  )
}
