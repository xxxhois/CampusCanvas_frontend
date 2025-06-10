import { RegistryForm } from '@/components/client/auth/register-form'
import { Suspense } from 'react'

export default function RegistryPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-6">
        <Suspense fallback={<div>加载中...</div>}>
          <RegistryForm />
        </Suspense>
      </div>
    </div>
  )
}