import { usePostStore } from "@/stores/postStore"
import { useUserStore } from "@/stores/userStore"
import { Post } from "@/types/post"
import Image from "next/image"
import { useRouter } from "next/navigation"

interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  const router = useRouter()
  const { currentUser } = useUserStore()

  // console.log('Post data:', post)

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* 帖子内容 */}
      <div className="p-4">
        {/* 用户信息 */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full overflow-hidden">
            <Image
              src={post.avatarUrl || '/default-avatar.jpg'}
              alt={post.username}
              width={32}
              height={32}
              className="object-cover"
            />
          </div>
          <div>
            <span className="text-sm font-medium text-gray-900">{post.username}</span>
            <p className="text-xs text-gray-500">{new Date(post.createdTime).toLocaleDateString()}</p>
          </div>
        </div>

        {/* 帖子内容 */}
        <div className="mb-3">
          <h3 className="text-base font-medium text-gray-900 line-clamp-2 mb-2">{post.title}</h3>
          <p className="text-sm text-gray-600 line-clamp-3">{post.content}</p>
        </div>

        {/* 图片展示 */}
        {post.imageUrls && post.imageUrls.length > 0 && (
          <div className="mb-3 grid gap-2 rounded-lg overflow-hidden">
            {post.imageUrls.length === 1 ? (
              // 单张图片时显示大图
              <div className="relative aspect-[4/3]">
                <Image
                  src={post.imageUrls[0]}
                  alt="Post image"
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              // 多张图片时使用网格布局
              <div className="grid grid-cols-2 gap-2">
                {post.imageUrls.slice(0, 4).map((url, index) => (
                  <div key={index} className="relative aspect-square">
                    <Image
                      src={url}
                      alt={`Post image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    {/* 当是第4张图片且还有更多图片时，显示遮罩层 */}
                    {index === 3 && post.imageUrls.length > 4 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white text-lg font-medium">
                          +{post.imageUrls.length - 4}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 互动数据 */}
        <div className="flex items-center gap-4 text-sm text-gray-500 border-t pt-3">
            <span>♥ {post.likeCount}</span>
        </div>
      </div>
    </div>
  )
} 