'use client'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from "@/hooks/use-toast"
import { apiClient } from '@/lib/api-client'
import { useUserStore } from '@/stores/userStore'
import { ChatRoom } from "@/types/chat"
import { ApiResponse } from '@/types/user-profile'
import React, { useState } from 'react'

export default function CreateChatRoomModal() {
  const { currentUser } = useUserStore()
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    maxMembers: 50,
  })
  const { toast } = useToast()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {
    if (!currentUser?.id) return alert('请先登录')

    const body = {
      ...formData,
      creatorId: currentUser.id,
    }

    const res = await apiClient<ApiResponse<ChatRoom>>({
      url: '/chatrooms',
      method: 'POST',
      data: body,
      responseHandler: {
        onResponse: async (response) => {
          if (response.status === 201) {
            toast({ title: '创建成功，等待审核', variant: 'default' });
            setOpen(false);
            return await response.json();
          } else {
            const data = await response.json();
            toast({ title: data.message, variant: 'destructive' });
            setOpen(false);
          }
        }
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>新建群聊</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>创建新聊天室</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="name">名称</Label>
            <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">描述（可选）</Label>
            <Textarea id="description" name="description" value={formData.description} onChange={handleChange} maxLength={1000} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">分类</Label>
            <Input id="category" name="category" value={formData.category} onChange={handleChange} maxLength={50} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxMembers">最大成员数</Label>
            <Input
              id="maxMembers"
              name="maxMembers"
              type="number"
              min="1"
              max="1000"
              value={formData.maxMembers}
              onChange={handleChange}
            />
          </div>
          <Button onClick={handleSubmit}>提交</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}