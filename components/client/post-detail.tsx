import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';
import { usePostStore } from '@/stores/postStore';
import { useUserStore } from '@/stores/userStore';
import type { Comment, PostDetail, Tag } from '@/types/post';
import { useQueries } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Bookmark, ChevronLeft, ChevronRight, Heart, MessageCircle, X } from 'lucide-react';
import { useState } from 'react';
import { CommentSection } from './comment-section';

export function PostDetail({ postId }: { postId: number }) {
  const [currentImage, setCurrentImage] = useState(0);
  const [commentContent, setCommentContent] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { currentUser } = useUserStore();
  const postStore = usePostStore();
    const results = useQueries({
    queries: [
      {
        queryKey: ['post', postId],
        queryFn: async () => {
          const res = await apiClient<{ data: PostDetail }>({
            url: `/posts/${postId}`,
            method: 'GET',
          });
          return res.data;
        },
      },
      {
        queryKey: ['post-comments', postId],
        queryFn: async () => {
          const res = await apiClient<{ data: { list: Comment[] } }>({
            url: `/posts/${postId}/comments`,
            method: 'GET',
          });
          return res.data.list;
        },
      },
      {
        queryKey: ['post-tags', postId],
        queryFn: async () => {
          const res = await apiClient<{ data: Tag[] }>({
            url: `/posts/${postId}/tags`,
            method: 'GET',
          });
          return res.data;
        },
      },
      {
        queryKey: ['post-liked-users', postId],
        queryFn: async () => {
          const res = await apiClient<{
            code: number,
            message: string,
            data: {
              total: number,
              list: Array<{
                id: number,
                username: string,
                avatarUrl: string | null
              }>,
            }
          }>({
            url: `/posts/${postId}/liked-users`,
            method: 'GET',
          });
          return {
            likeCount: res.data.total,
            likeList: res.data.list
          };
        },
      },
      {
        queryKey: ['post-saved-users', postId],
        queryFn: async () => {
          const res = await apiClient<{
            code: number,
            message: string,
            data: {
              total: number,
              list: Array<{
                id: number,
                username: string,
                avatarUrl: string | null
              }>
            }
          }>({
            url: `/posts/${postId}/favorited-users`,
            method: 'GET',
          });
          return {
            saveCount: res.data.total,
            saveList: res.data.list
          };
        },
      },
    ],
  });

  const [postResult, commentsResult, tagsResult, likedUsersResult, savedUsersResult] = results;
  const post = postResult.data;
  const comments = commentsResult.data;
  const tags = tagsResult.data;
  const likedUsers = likedUsersResult.data;
  const savedUsers = savedUsersResult.data;
  const isLoading = results.some((result) => result.isLoading);
  const isLiked = likedUsers?.likeList.some(user => user.id === currentUser?.id);
  const isSaved = savedUsers?.saveList.some(user => user.id === currentUser?.id);
  if (isLoading) return <div>加载中...</div>;
  if (!post) return <div>帖子不存在</div>;


  const handleLike = async () => {
    if (!currentUser) return;

    try {
      const response = await apiClient<{
        code: number;
        message: string;
        data: {
          likeId: number;
          createdTime: string;
        }
      }>({
        url: '/likes',
        method: 'POST',
        data: {
          userId: currentUser.id,
          targetId: postId,
          type: 'POST',
          like: !isLiked
        }
      });

      if (response.code !== 200) {
        throw new Error('点赞失败');
      }

      // 点赞成功后重新获取点赞用户列表
      await likedUsersResult.refetch();
      
    } catch (error: any) {
      throw new Error(error instanceof Error ? error.message : '点赞失败');
    }
  };
  const handleFavorite = async () => {
    if (!currentUser) return;

    try {
      const response = await apiClient<any>({
        url: '/favorites',
        method: isSaved ? 'DELETE' : 'POST',
        data: {
          userId: currentUser.id,
          postId: postId,
        }
      });

      if (response.code !== 200) {
        throw new Error('收藏失败');
      }
      await savedUsersResult.refetch();
    } catch (error: any) {
      throw new Error(error instanceof Error ? error.message : '收藏失败');
    }
  };
  // const handleUnfavorite = async () => {
  //   if (!currentUser) return;

  //   try {
  //     const response = await apiClient<any>({
  //       url: '/favorites',
  //       method: 'DELETE',
  //       data: {
  //         userId: currentUser.id,
  //         postId: postId,
  //       }
  //     });

  //     if (response.code !== 200) {
  //       throw new Error('收藏失败');
  //     }
  //     await savedUsersResult.refetch();
  //   } catch (error: any) {
  //     throw new Error(error instanceof Error ? error.message : '收藏失败');
  //   }
  // };
  // 图片轮播控制
  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentImage((prev) => (prev === 0 ? (post.imageUrls?.length || 1) - 1 : prev - 1));
  };
  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentImage((prev) => (prev === (post.imageUrls?.length || 1) - 1 ? 0 : prev + 1));
  };

  return (
    <div className="w-full h-[calc(90vh-2rem)] flex">
      {/* 左侧图片区域 */}
      <div className="w-[500px] flex-shrink-0 p-6">
        <div 
          className="relative aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden cursor-pointer"
          onClick={() => setIsFullscreen(true)}
        >
          {post.imageUrls?.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`post image ${idx + 1}`}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${idx === currentImage ? 'opacity-100' : 'opacity-0'}`}
            />
          ))}
          {post.imageUrls && post.imageUrls.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 text-white hover:bg-black/50"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 text-white hover:bg-black/50"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {post.imageUrls.map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-2 h-2 rounded-full ${idx === currentImage ? 'bg-white' : 'bg-white/50'}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* 右侧内容区域 */}
      <div className="flex-1 border-l">
        <div className="h-full overflow-y-auto">
          <div className="max-w-2xl mx-auto p-8 space-y-8">
            {/* 用户信息 */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.location.href = `/profile/${post.userId}`}>
              <Avatar className="w-10 h-10">
                <AvatarImage src={post.avatarUrl} />
                <AvatarFallback>{post.username.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{post.username}</div>
                <div className="text-sm text-gray-500">
                  {formatDistanceToNow(new Date(post.createdTime), { locale: zhCN })}前
                </div>
              </div>
            </div>

            {/* 内容区域 */}
            <div className="space-y-6">
              <p className="text-lg leading-relaxed">{post.content}</p>
              {/* 标签 */}
              <div className="flex flex-wrap gap-2">
                {tags?.map((tag) => (
                  <span
                    key={tag.id}
                    className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600"
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>
              {/* 互动按钮 */}
              <div className="flex items-center gap-6 pt-4 border-t">
                <Button variant="ghost" size="sm" className="gap-2" onClick={() => {
                  handleLike();
                }}>
                  <Heart className={`w-5 h-5 ${isLiked ? 'text-red-500 fill-current' : ''}`} />
                  <span>{likedUsers?.likeCount || 0}</span>
                </Button>
                <Button variant="ghost" size="sm" className="gap-2">
                  <MessageCircle className="w-5 h-5" />
                  <span>{comments?.length || 0}</span>
                </Button>
                <Button variant="ghost" size="sm" className="gap-2" onClick={() => {
                    handleFavorite();
                }}>
                  <Bookmark className={`w-5 h-5 ${isSaved ? 'text-blue-500 fill-current' : ''}`} />
                  <span>{savedUsers?.saveCount || 0}</span>
                </Button>
              </div>
            </div>

            {/* 评论区 */}
            <CommentSection 
              comments={comments || []}
              commentContent={commentContent}
              setCommentContent={setCommentContent}
              postId={postId}
              commentsResult={commentsResult}
            />
          </div>
        </div>
      </div>

      {/* 全屏图片预览 */}
      {isFullscreen && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          onClick={() => setIsFullscreen(false)}
        >
          <button
            className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-full"
            onClick={() => setIsFullscreen(false)}
          >
            <X className="w-6 h-6" />
          </button>
          <div className="relative w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <img
              src={post.imageUrls?.[currentImage]}
              alt={`post image ${currentImage + 1}`}
              className="max-w-[90vw] max-h-[90vh] object-contain"
            />
            {post.imageUrls && post.imageUrls.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 text-white hover:bg-black/50"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 text-white hover:bg-black/50"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {post.imageUrls.map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-3 h-3 rounded-full ${idx === currentImage ? 'bg-white' : 'bg-white/50'}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}