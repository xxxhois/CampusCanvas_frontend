'use client'

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api-client"
import { useUserStore } from "@/stores/userStore"
import 'cropperjs/dist/cropper.css'
import { useEffect, useState } from "react"
import Cropper from 'react-cropper'

export function ProfileEdit() {
  const { currentUser, updateProfile } = useUserStore()
  const { toast } = useToast()
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [password, setPassword] = useState('')
  const [isCropperOpen, setIsCropperOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [cropper, setCropper] = useState<any>(null)
  const [isImageReady, setIsImageReady] = useState(false)

  // 加载用户数据
  useEffect(() => {
    if (currentUser) {
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
      setIsCropperOpen(true)
    }
  }

  const handleCrop = async () => {
    if (!cropper || !selectedFile) {
      console.log('Cropper状态:', {
        cropper: cropper ? '已初始化' : '未初始化',
        selectedFile: selectedFile ? {
          name: selectedFile.name,
          type: selectedFile.type,
          size: selectedFile.size
        } : '未选择文件'
      })
      return
    }

    if (!isImageReady) {
      toast({
        title: "请稍候",
        description: "图片正在加载中，请等待...",
        variant: "destructive",
      })
      return
    }

    try {
      console.log('开始裁剪，Cropper实例:', {
        imageData: cropper.getImageData(),
        cropBoxData: cropper.getCropBoxData()
      })

      // 使用 getDataURL 方法
      const dataUrl = cropper.getDataURL({
        width: 200,
        height: 200,
        fillColor: '#fff',
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high',
      })

      console.log('生成的DataURL:', dataUrl ? '成功' : '失败')

      if (!dataUrl) {
        throw new Error('无法生成裁剪后的图片')
      }

      // 将 DataURL 转换为 Blob
      const imageResponse = await fetch(dataUrl)
      const blob = await imageResponse.blob()

      const formData = new FormData()
      formData.append('file', blob, selectedFile.name)

      const uploadResponse = await apiClient<any>({
        url: '/upload',
        method: 'POST',
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      setAvatarUrl(uploadResponse.data.url)
      setIsCropperOpen(false)
      toast({
        title: "上传成功",
        description: "头像已更新",
        variant: "default",
      })
    } catch (error) {
      console.error('裁剪或上传失败:', error)
      toast({
        title: "上传失败",
        description: error instanceof Error ? error.message : "请检查文件格式或大小",
        variant: "destructive",
      })
    }
  }

  const handleProfileUpdate = async () => {
    if (!currentUser) return
    
    try {
      await apiClient({
        url: `/users`,
        method: 'PUT',
        data: {
          id: currentUser.id,
          password: password || undefined,
          bio,
          avatarUrl
        }
      })

      updateProfile({
        ...currentUser,
        bio,
        avatarUrl
      })

      toast({
        title: "更新成功",
        description: "个人资料已更新",
        variant: "default",
      })
    } catch (error) {
      toast({
        title: "更新失败",
        description: error instanceof Error ? error.message : "请稍后重试",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center space-x-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={avatarUrl} />
          <AvatarFallback>头像</AvatarFallback>
        </Avatar>
        <Input 
          type="file" 
          accept="image/*"
          onChange={handleFileSelect}
          className="w-auto"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">个人简介</Label>
        <Textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">新密码（可选）</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="不修改请留空"
        />
      </div>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button>保存修改</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认保存修改？</AlertDialogTitle>
            <AlertDialogDescription>
              此操作将更新您的个人资料信息。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleProfileUpdate}>确认</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isCropperOpen} onOpenChange={setIsCropperOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>裁剪头像</DialogTitle>
          </DialogHeader>
          <div className="h-[400px]">
            {selectedFile && (
              <Cropper
                src={URL.createObjectURL(selectedFile)}
                style={{ height: 400, width: '100%' }}
                aspectRatio={1}
                guides={true}
                viewMode={1}
                autoCropArea={1}
                background={false}
                responsive={true}
                restore={false}
                onInitialized={(instance) => {
                  setCropper(instance)
                  setIsImageReady(false)
                }}
                ready={() => {
                  console.log('图片加载完成')
                  setIsImageReady(true)
                }}
              />
            )}
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setIsCropperOpen(false)}>
              取消
            </Button>
            <Button onClick={handleCrop}>
              确认裁剪
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
