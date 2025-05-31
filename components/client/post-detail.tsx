import { apiClient } from '@/lib/api-client';
import type { Comment, PostDetail, Tag } from '@/types/post';
import { useQueries } from '@tanstack/react-query';

export function PostDetail({ postId }: { postId: number }) {
    // 并行请求所有数据
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
            const res = await apiClient<{ data: {list: Comment[] } }>({
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
        }
      ],
    });

    const [postResult, commentsResult, tagsResult] = results;
    const post = postResult.data;
    const comments = commentsResult.data;
    const tags = tagsResult.data;
    const isLoading = results.some(result => result.isLoading);

    if (isLoading) return <div>加载中...</div>;
    if (!post) return <div>帖子不存在</div>;

    return (
      <div className="space-y-6">
        {/* 帖子内容 */}
        <div className="post-content">
          <div className="flex items-center gap-2 mb-4">
            <img src={post.avatarUrl || '/default-avatar.jpg'} alt={post.username} className="w-8 h-8 rounded-full" />
            <span className="font-medium">{post.username}</span>
          </div>
          <h1 className="text-2xl font-bold">{post.content}</h1>
          {post.imageUrls?.map((img, index) => (
            <img key={index} src={img} alt={`post image ${index + 1}`} className="mt-4 rounded-lg" />
          ))}
        </div>

        {/* 标签部分 */}
        <div className="post-tags flex gap-2">
          {tags?.map((tag) => (
            <span key={tag.id} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
              {tag.name}
            </span>
          ))}
        </div>

        {/* 评论部分 */}
        <div className="post-comments space-y-4">
          <h2 className="text-xl font-semibold">评论 ({comments?.length || 0})</h2>
          {comments?.map((comment, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <img src={comment.avatarUrl} alt={comment.username} className="w-8 h-8 rounded-full" />
                <span className="font-medium">{comment.username}</span>
              </div>
              <p className="mt-2">{comment.content}</p>
            </div>
          ))}
        </div>
      </div>
    );
}