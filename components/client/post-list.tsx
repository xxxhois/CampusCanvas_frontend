// components/PostList.tsx
'use client'

import { PostCard } from '@/components/ui/post-card'
import { PostDetailDialog } from '@/components/ui/post-detail-dialog'
import { apiClient } from '@/lib/api-client'
import { PostResponse } from '@/types/post'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useInView } from 'react-intersection-observer'

export function PostList() {
  const { ref, inView } = useInView()
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null)
  
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ['posts'],
    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams({
        pageNum: pageParam.toString(),
        pageSize: '3',
        days: '100'
      });
      console.log('params', params.toString())
      const response = await apiClient<PostResponse>({
        url: `/posts/hot?${params.toString()}`,
        method: 'GET'
      });

      return response;
    },
    getNextPageParam: (lastPage) => lastPage.data.hasNextPage ? lastPage.data.nextPage : undefined,
    initialPageParam: 1,
    // 设置缓存时间
    staleTime: 5 * 60 * 1000, // 5分钟
    // 设置缓存数量
    gcTime: 30 * 60 * 1000, // 30分钟
  })

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, fetchNextPage])

  return (
    <div className="container mx-auto px-4">
      {/* 帖子详情弹窗 */}
      <PostDetailDialog 
        postId={selectedPostId} 
        onClose={() => setSelectedPostId(null)} 
      />

      {/* 瀑布流布局 */}
      <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
        {data?.pages.map((page, pageIndex) =>
          page.data.list.map((post, postIndex) => (
            <div 
              key={`post-${post.id}-page-${pageIndex}-index-${postIndex}`} 
              className="break-inside-avoid"
            >
              <div 
                onClick={() => {
                  console.log('被点击的post.id', post.id)
                  setSelectedPostId(post.id)
                }}
                className="cursor-pointer"
              >
                <PostCard post={post} />
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* 加载指示器 */}
      <div ref={ref} className="col-span-full py-8 text-center">
        {isFetchingNextPage ? '加载中...' : hasNextPage ? null : '没有更多内容了'}
      </div>
    </div>
  )
}