import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { usePostStore } from "@/stores/postStore"
import { useUserStore } from "@/stores/userStore"
import { PostDetail } from "@/types/post"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"
import { Bookmark, Heart, MessageCircle, Share2 } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"

interface PostDetailCardProps {
  post: PostDetail
}

export function PostDetailCard({ post }: PostDetailCardProps) {
  const router = useRouter()
  const { currentUser } = useUserStore()
  const { likePost, unlikePost, savePost, unsavePost } = usePostStore()

  const handleLike = () => {
    if (!currentUser) {
      router.push('/login')
      return
    }
    if (post.isLiked) {
      unlikePost(post.id)
    } else {
      likePost(post.id)
    }
  }

  const handleSave = () => {
    if (!currentUser) {
      router.push('/login')
      return
    }
    if (post.isSaved) {
      unsavePost(post.id)
    } else {
      savePost(post.id)
    }
  }

  return (
    <Card className="max-w-3xl mx-auto">
      {/* 图片轮播 */}
      <div className="relative aspect-[4/3]">
        <Image
          src={post.imageUrls[0]}
          alt={post.title}
          fill
          className="object-cover"
        />
      </div>

      {/* 内容区域 */}
      <div className="p-6 space-y-6">
        {/* 标题和作者信息 */}
        <div className="space-y-4">
          <h1 className="text-2xl font-bold">{post.title}</h1>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={post.avatarUrl} />
                <AvatarFallback>{post.username[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{post.username}</p>
                <p className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(post.createdTime), { 
                    addSuffix: true,
                    locale: zhCN 
                  })}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              关注
            </Button>
          </div>
        </div>

        {/* 正文内容 */}
        <div className="prose max-w-none">
          <p>{post.content}</p>
        </div>

        {/* 标签 */}
        <div className="flex flex-wrap gap-2">
          {post.tags?.map(tag => (
            <span 
              key={tag.id}
              className="px-3 py-1 bg-muted rounded-full text-sm"
            >
              #{tag.name}
            </span>
          ))}
        </div>

        {/* 交互按钮 */}
        <div className="flex items-center gap-6 pt-4 border-t">
          <button 
            onClick={handleLike}
            className="flex items-center gap-2"
          >
            <Heart 
              className={cn(
                "w-5 h-5",
                post.isLiked && "fill-current text-red-500"
              )} 
            />
            <span>{post.likeCount}</span>
          </button>
          <button className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            <span>{post.commentCount}</span>
          </button>
          <button 
            onClick={handleSave}
            className="flex items-center gap-2"
          >
            <Bookmark 
              className={cn(
                "w-5 h-5",
                post.isSaved && "fill-current"
              )} 
            />
            <span>收藏</span>
          </button>
          <button className="flex items-center gap-2 ml-auto">
            <Share2 className="w-5 h-5" />
            <span>分享</span>
          </button>
        </div>
      </div>
    </Card>
  )
} 