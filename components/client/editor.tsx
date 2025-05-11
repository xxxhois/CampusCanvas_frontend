'use client'

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { X } from "lucide-react"
import { useState } from 'react'

interface EditorProps {
  onChange?: (content: string) => void
}

export function Editor({ onChange }: EditorProps) {
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [title, setTitle] = useState('')

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link,
      Placeholder.configure({
        placeholder: '开始写作...',
      }),
    ],
    content: '',
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML())
    },
  })

  const addImage = () => {
    const url = window.prompt('请输入图片URL')
    if (url) {
      editor?.chain().focus().setImage({ src: url }).run()
    }
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
        <div className="flex gap-2 mb-4 border-b pb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor?.chain().focus().toggleBold().run()}
            className={cn(
              "h-8 px-2",
              editor?.isActive('bold') && "bg-muted"
            )}
          >
            加粗
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            className={cn(
              "h-8 px-2",
              editor?.isActive('italic') && "bg-muted"
            )}
          >
            斜体
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={addImage}
            className="h-8 px-2"
          >
            插入图片
          </Button>
        </div>
        
        <EditorContent 
          editor={editor} 
          className="prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none" 
        />
      </div>

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
    </Card>
  )
} 