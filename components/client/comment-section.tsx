import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"
import { Comment } from "@/types/post"
import { apiClient } from "@/lib/api-client"
import { useUserStore } from "@/stores/userStore"
import { useRouter } from "next/navigation"

export function CommentSection({ comments, commentContent, setCommentContent, postId, commentsResult }: { comments: Comment[], commentContent: string, setCommentContent: (content: string) => void, postId: number, commentsResult: any }) {
    const { currentUser } = useUserStore();
    const router = useRouter();
    // 评论提交
    const handleSubmitComment = async () => {
        if (!commentContent.trim()) return;
        try {
          const response = await apiClient<{
            code: number;
            message: string;
            data: {
              commentId: number;
              createdTime: string;
            }
          }>({
            url: '/comments',
            method: 'POST',
            data: {
              userId: currentUser?.id, 
              postId: postId,
              content: commentContent
            },
          });

          if (response.code === 200) {
            setCommentContent('');
            commentsResult.refetch();
          }
        } catch (error) {
          throw new Error(error instanceof Error ? error.message : '评论失败');
        }
    };
  
    return (
    <div className="space-y-6">
              {/* 评论输入框 */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="说点什么..."
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  className="flex-1 border rounded px-3 py-2"
                />
                <Button onClick={handleSubmitComment}>发送</Button>
              </div>
              {/* 评论列表 */}
              <div className="space-y-6">
                {comments?.map((comment) => (
                  <div key={comment.id} className="flex gap-3"><Avatar className="w-8 h-8 cursor-pointer" onClick={() => router.push(`/profile/${comment.userId}`)}>
                    
                      <AvatarImage src={comment.avatarUrl} />
                      <AvatarFallback>{comment.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{comment.username}</span>
                        <span className="text-sm text-gray-500">
                          {formatDistanceToNow(new Date(comment.createdTime), { locale: zhCN })}前
                        </span>
                      </div>
                      <p className="mt-1 text-gray-700">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
  )
}