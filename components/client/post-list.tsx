// components/PostList.tsx
'use client'

import { PostCard } from '@/components/ui/postcard'
import { apiClient } from '@/lib/api-client'
import { Post, PostResponse } from '@/types/post'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useInView } from 'react-intersection-observer'

export function PostList() {
  const { ref, inView } = useInView()
  
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ['posts'],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await apiClient<PostResponse>({
        url: `/api/posts?page=${pageParam}`,//待改
        method: 'GET'
      })
      return response
    },
    getNextPageParam: (lastPage) => lastPage.data.hasNextPage ? lastPage.data.nextPage : undefined,
    initialPageParam: 1
  })

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, fetchNextPage])

  return (
    <div className="container mx-auto px-4">
      {/* 瀑布流布局 */}
      <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
        {data?.pages.flatMap(page =>
          page.data.list.map((post: Post) => (
            <div key={post.postId} className="break-inside-avoid">
              <PostCard post={post} />
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