'use client'

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api-client"
import { useUserStore } from "@/stores/userStore"
import { Image as ImageIcon, Loader2, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useRef, useState } from 'react'

interface Tag {
  id: number;
  name: string;
}

export function Editor() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const router = useRouter()
  const { currentUser } = useUserStore()

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setImages(prev => [...prev, ...files])
    
    // 预览图片
    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImageUrls(prev => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
    setImageUrls(prev => prev.filter((_, i) => i !== index))
  }

  const addTag = () => {
    if (tagInput && !tags.includes(tagInput)) {
      setTags([...tags, tagInput])
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast({
        title: "发布失败",
        description: "标题不能为空",
        variant: "destructive",
      })
      return
    }

    if (!content.trim()) {
      toast({
        title: "发布失败",
        description: "内容不能为空",
        variant: "destructive",
      })
      return
    }

    if (tags.length === 0) {
      toast({
        title: "发布失败",
        description: "请至少添加一个标签",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      // 第一步：上传标签
      const tagPromises = tags.map(tag => 
        apiClient<{ code: number; data: Tag }>({
          url: '/tags',
          method: 'POST',
          data: { name: tag }
        })
      )
      const tagResults = await Promise.all(tagPromises)
      const tagIds = tagResults.map(res => res.data.id)

      // 第二步：上传帖子
      const postData = {
        userId: currentUser?.id,
        title,
        content,
        imageUrls: imageUrls, // 这里假设图片已经上传到服务器并返回了URL
        tagIds
      }

      await apiClient({
        url: '/posts',
        method: 'POST',
        data: postData
      })

      toast({
        title: "发布成功",
        description: "你的帖子已经发布",
      })
      router.push('/')
    } catch (error) {
      toast({
        title: "发布失败",
        description: error instanceof Error ? error.message : "请稍后重试",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto p-6 space-y-6">
      <Input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="标题"
        className="text-xl font-bold border-none shadow-none focus-visible:ring-0 px-0"
      />
      
      <div className="border rounded-lg p-4 min-h-[300px] bg-background">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="分享你的想法..."
          className="w-full h-full min-h-[200px] resize-none border-none focus:outline-none"
        />
      </div>

      {/* 图片上传区域 */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2"
          >
            <ImageIcon className="h-4 w-4" />
            添加图片
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            multiple
            className="hidden"
          />
        </div>

        {/* 图片预览 */}
        <div className="grid grid-cols-3 gap-4">
          {imageUrls.map((url, index) => (
            <div key={index} className="relative aspect-square">
              <img
                src={url}
                alt={`预览图 ${index + 1}`}
                className="w-full h-full object-cover rounded-lg"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6 bg-black/50 hover:bg-black/70"
                onClick={() => removeImage(index)}
              >
                <X className="h-4 w-4 text-white" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* 标签区域 */}
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="添加标签"
            className="flex-1"
            onKeyPress={(e) => e.key === 'Enter' && addTag()}
          />
          <Button
            onClick={addTag}
            variant="secondary"
          >
            添加
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <div
              key={tag}
              className="inline-flex items-center gap-1 px-3 py-1 bg-muted rounded-full text-sm"
            >
              <span>#{tag}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 hover:bg-transparent"
                onClick={() => removeTag(tag)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* 发布按钮 */}
      <Button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            发布中...
          </>
        ) : (
          '发布'
        )}
      </Button>
    </Card>
  )
} 