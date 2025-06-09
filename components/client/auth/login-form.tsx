'use client'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from '@/hooks/use-toast'
import { useUserStore } from "@/stores/userStore"
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

const formSchema = z.object({
  username: z.string().min(1, "用户名不能为空"),
  password: z.string().min(3, "密码至少3位"),
})

export function LoginForm({ isAdmin = false }: { isAdmin?: boolean }) {
  const { toast } = useToast()
  const navigate = useRouter()
  const searchParams = useSearchParams()
  const { token } = useUserStore()
  // const { isUnauthorized, setUnauthorized } = useUserStore()
  
  useEffect(() => {
    if (!token) {
      toast({
        title: "访问受限",
        description: "请先登录以继续操作",
        variant: "destructive",
      });
    }
  }, [token, toast]);
  
  // 自动填充逻辑
  useEffect(() => {
    const urlUsername = searchParams.get('username')
    const urlPassword = searchParams.get('password')

    if (urlUsername) {
      form.setValue('username', decodeURIComponent(urlUsername))
    }
    if (urlPassword) {
      form.setValue('password', decodeURIComponent(urlPassword))
    }

    window.history.replaceState(null, '', isAdmin ? '/admin/login' : '/login')
  }, [])

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { username: "", password: "" }
  })
  const { login } = useUserStore()

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await login({
        username: values.username,
        password: values.password
      });
      toast(
        {
          title: "登录成功",
          description: "欢迎回来！",
          variant: "default",
          duration: 1500
        }
      )
      // 登录成功后跳转回原页面或首页
      const redirectTo = searchParams.get("redirect") || "/";//redirect参数不需要手动删除，下次跳转前重新设置
      navigate.push(redirectTo);
    } catch (error) {
      toast({
        title: "登录失败",
        description: error instanceof Error ? error.message : "请检查您的登录信息",
        variant: "destructive",
      });
    }
  };


  return (
    <div className="flex items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center">欢迎登录</h1>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
        <Label htmlFor="username">用户名</Label>
        <Input
          id="username"
          placeholder="请输入用户名"
          {...form.register("username", {
            required: "用户名不能为空"
          })}
        />
        {form.formState.errors.username && (
          <p className="text-sm text-red-500">
            {form.formState.errors.username.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">密码</Label>
        <Input
          id="password"
          type="password"
          placeholder="至少8位"
          {...form.register("password", {
            required: "密码不能为空",
            minLength: {
              value: 8,
              message: "密码至少需要8位"
            }
          })}
        />
        {form.formState.errors.password && (
          <p className="text-sm text-red-500">
            {form.formState.errors.password.message}
          </p>
        )}
      </div>

          <Button type="submit" className="w-full">
            登录
          </Button>

          <Link href="/register" className="w-full text-center text-sm text-pink-500 hover:underline">         
            还没有账号？注册
          </Link>
        </form>
      </div>
    </div>
  )
}