// components/PostList.tsx
'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import axios from 'axios'
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
      const res = await axios.get(`/api/posts?page=${pageParam}`)
      return res.data
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
          <PostCard key={post.id} post={post} />
        ))
      )}
      
      {/* 加载指示器 */}
      <div ref={ref} className="col-span-full py-8 text-center">
        {isFetchingNextPage ? '加载中...' : '没有更多内容了'}
      </div>
    </>
  )
}