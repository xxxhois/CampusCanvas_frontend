'use client' 

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from '@/hooks/use-toast'
import { apiClient } from "@/lib/api-client"
import { useUserStore } from "@/stores/userStore"
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from 'react-hook-form'
// import { useNavigate } from 'react-router-dom'
import * as z from 'zod'

const formSchema = z.object({
  username: z.string().min(1, "用户名不能为空"),
  email: z.string().email("无效的邮箱格式"),
  password: z.string().min(8, "密码至少8位"),
  code: z.string().min(6, "验证码不能为空")
})

export function RegistryForm() {
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const navigate = useRouter()
  const { register } = useUserStore()
  
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "", username: "", code: "" }
  })
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
      try {
        await register({
          username: values.username,
          password: values.password,
          email: values.email,
          code: values.code
        });
        toast(
          {
            title: "注册成功",
            description: "欢迎加入！",
            variant: "default",
          }
        )
        navigate.push(`/login?username=${values.username}&password=${values.password}`);
      } catch (error) {
        toast({
          title: "注册失败",
          description:error instanceof Error ? error.message : "请检查您的注册信息",
          variant: "destructive",
        });
      }
    };
  const SendCode = async () => {
    try {
      const email = form.getValues("email");
      // if (!email) {
      //   toast({
      //     title: "发送失败",
      //     description: "请先输入邮箱地址",
      //     variant: "destructive",
      //   });
      //   return;
      // }
      await apiClient({
        url: `/auth/verification-code/email?email=${encodeURIComponent(email)}`,
        method: 'GET',
      });
      toast({
        title: "验证码已发送",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "发送失败",
        description: error instanceof Error ? error.message : "请检查您的邮箱",
        variant: "destructive",
      });
    }
  }


  return (
    <div className="flex items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center">欢迎注册</h1>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
            <Label htmlFor="username">用户名</Label>
            <Input 
              id="username" 
              placeholder="请输入用户名"
              {...form.register("username")}
            />
            {form.formState.errors.username && (
              <p className="text-sm text-red-500">
                {form.formState.errors.username.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">邮箱</Label>
            <Input 
              id="email" 
              placeholder="name@example.com"
              {...form.register("email")}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-red-500">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">密码</Label>
            <Input
              id="password"
              type="password"
              placeholder="至少8位"
              {...form.register("password")}
            />
            {form.formState.errors.password && (
              <p className="text-sm text-red-500">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>
            <div className="space-y-2">
            <Label htmlFor="code">验证码</Label>
            <div className="flex gap-2">
              <Input
              id="code"
              placeholder="请输入验证码"
              {...form.register("code")}
              />
              <Button type="button" variant="outline" onClick={ SendCode }>
              发送验证码
              </Button>
            </div>
            {form.formState.errors.code && (
              <p className="text-sm text-red-500">
              {form.formState.errors.code.message}
              </p>
            )}
            </div>

          <Button type="submit" className="w-full">
            注册
          </Button>
        </form>
      </div>
    </div>
  )
}