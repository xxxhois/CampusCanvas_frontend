'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useUserStore } from '@/stores/userStore'

export function withAuth<P extends object>(WrappedComponent: React.ComponentType<P>) {
  return function ProtectedRoute(props: P) {
    const router = useRouter()
    const token = useUserStore(state => state.token)

    useEffect(() => {
      if (!token) {
        router.push('/login')
      }
    }, [token, router])

    if (!token) {
      return null // 或者返回一个加载状态
    }

    return <WrappedComponent {...props} />
  }
}