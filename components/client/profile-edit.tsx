'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api-client"
import { useUserStore } from "@/stores/userStore"
import { ApiResponse, UserProfile } from "@/types/user-profile"
import { Upload } from "lucide-react"
import { useEffect, useState } from "react"

export function ProfileEdit() {
  const { currentUser, updateProfile } = useUserStore()
  const { toast } = useToast()
  
  const [username, setUsername] = useState(currentUser?.username || '')
  const [email, setEmail] = useState(currentUser?.email || '')
  const [bio, setBio] = useState(currentUser?.bio || '')
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl || '')
  const [password, setPassword] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // 当 currentUser 变化时更新表单数据
  useEffect(() => {
    if (currentUser) {
      setUsername(currentUser.username || '')
      setEmail(currentUser.email || '')
      setBio(currentUser.bio || '')
      setAvatarUrl(currentUser.avatarUrl || '')
    }
  }, [currentUser])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      console.log('选择的文件:', {
        name: file.name,
        type: file.type,
        size: file.size
      })
      setSelectedFile(file)
      // 创建预览URL
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleProfileUpdate = async () => {
    if (!currentUser) {
      toast({
        title: "错误",
        description: "请先登录",
        variant: "destructive",
      })
      return
    }

    try {
      const formData = new FormData()
      formData.append('username', username)
      formData.append('email', email)
      formData.append('bio', bio)
      if (password) {
        formData.append('password', password)
      }
      if (selectedFile) {
        formData.append('avatar', selectedFile)
      }

      const response = await apiClient<ApiResponse<UserProfile>>({
        url: `/users`,
        method: 'PUT',
        data: {
          id: currentUser.id,
          ...Object.fromEntries(formData)
        }
      })

      if (response.code === 200) {
        updateProfile(response.data)
        toast({
          title: "更新成功",
          description: "个人资料已更新",
          variant: "default",
        })
      } else {
        throw new Error(response.message || '更新失败')
      }
    } catch (error) {
      console.error('更新个人资料失败:', error)
      toast({
        title: "更新失败",
        description: error instanceof Error ? error.message : "请稍后重试",
        variant: "destructive",
      })
    }
  }

  if (!currentUser) {
    return <div className="text-center">请先登录</div>
  }

  return (
    <div className="space-y-6 p-4">
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <div className="relative w-24 h-24">
            <img
              src={previewUrl || avatarUrl || '/default-avatar.png'}
              alt="头像"
              className="w-full h-full rounded-full object-cover"
            />
            <label
              htmlFor="avatar-upload"
              className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1 cursor-pointer hover:bg-primary/90"
            >
              <Upload className="h-4 w-4" />
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{username}</h2>
            <p className="text-muted-foreground">{email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="username">用户名</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="email">邮箱</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="bio">个人简介</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="介绍一下自己吧..."
            />
          </div>

          <div>
            <Label htmlFor="password">新密码（可选）</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="留空表示不修改密码"
            />
          </div>

          <Button onClick={handleProfileUpdate} className="w-full">
            保存更改
          </Button>
        </div>
      </div>
    </div>
  )
}
