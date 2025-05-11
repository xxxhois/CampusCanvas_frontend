// components/PostList.tsx
'use client'

import { apiClient } from '@/lib/api-client'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import { Post, PostResponse, PostRequest } from '@/types/post'


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
        url: `/api/posts?page=${pageParam}`,
        method: 'GET'
      })
      return response
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1
  })

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, fetchNextPage])

  return (
    <>
      {/* 瀑布流渲染 */}
      {data?.pages.map(page => 
        page.data.map((post: Post) => (
          <div key={post.id} className="post-card">
            <h3>{post.title}</h3>
            <p>{post.content}</p>
          </div>
        ))
      )}
      
      {/* 加载指示器 */}
      <div ref={ref} className="col-span-full py-8 text-center">
        {isFetchingNextPage ? '加载中...' : '没有更多内容了'}
      </div>
    </>
  )
}