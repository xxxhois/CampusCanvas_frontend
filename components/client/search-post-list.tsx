// components/SearchPost.tsx
'use client'

import { PostCard } from '@/components/ui/post-card'
import { PostDetailDialog } from '@/components/ui/post-detail-dialog'
import { apiClient } from '@/lib/api-client'
import { PostResponse } from '@/types/post'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useInView } from 'react-intersection-observer'

interface SearchPostProps {
  keyword: string;
  searchType: 'keyword' | 'user';
}

interface UserSearchResponse {
  code: number;
  message: string;
  data: Array<{
    id: number;
    username: string;
    avatarUrl: string;
  }>;
}

export function SearchPostList({ keyword, searchType }: SearchPostProps) {
  const { ref, inView } = useInView()
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null)
  const [userIds, setUserIds] = useState<number[]>([])
  
  // 用户搜索查询
  const { data: userSearchData } = useInfiniteQuery({
    queryKey: ['users', 'search', keyword],
    queryFn: async () => {
      const response = await apiClient<UserSearchResponse>({
        url: `/users/search?username=${encodeURIComponent(keyword)}`,
        method: 'GET'
      });
      return response;
    },
    getNextPageParam: () => undefined, // 用户搜索不需要分页
    initialPageParam: 1,
    enabled: searchType === 'user' && !!keyword
  });

  // 当用户搜索结果更新时，更新用户ID列表
  useEffect(() => {
    if (userSearchData?.pages[0]?.data) {
      setUserIds(userSearchData.pages[0].data.map(user => user.id));
    }
  }, [userSearchData]);

  // 帖子搜索查询
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading
  } = useInfiniteQuery({
    queryKey: ['posts', searchType, keyword, userIds],
    queryFn: async ({ pageParam = 1 }) => {
      if (searchType === 'keyword') {
        const params = new URLSearchParams({
          keyword,
          pageNum: pageParam.toString(),
          pageSize: '5'
        });
        console.log('关键词搜索参数:', params.toString())
        const response = await apiClient<PostResponse>({
          url: `/posts?${params.toString()}`,
          method: 'GET'
        });
        return response;
      } else {
        // 用户搜索模式
        const userId = userIds[pageParam - 1];
        if (!userId) {
          return {
            data: {
              list: [],
              hasNextPage: false,
              nextPage: undefined
            }
          };
        }
        console.log('用户帖子搜索参数:', { userId, pageNum: pageParam })
        const response = await apiClient<PostResponse>({
          url: `/users/${userId}/posts`,
          method: 'GET'
        });
        return response;
      }
    },
    getNextPageParam: (lastPage, allPages) => {
      if (searchType === 'keyword') {
        return lastPage.data.hasNextPage ? lastPage.data.nextPage : undefined;
      } else {
        // 用户搜索模式下，检查是否还有更多用户
        const currentUserIndex = allPages.length;
        return currentUserIndex < userIds.length ? currentUserIndex + 1 : undefined;
      }
    },
    initialPageParam: 1,
    // 设置缓存时间
    staleTime: 5 * 60 * 1000, // 5分钟
    // 设置缓存数量
    gcTime: 30 * 60 * 1000, // 30分钟
    enabled: !!keyword && (searchType === 'keyword' || userIds.length > 0)
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
        {isLoading ? '加载中...' : 
         isFetchingNextPage ? '加载中...' : 
         !data?.pages[0].data.list.length ? '没有找到帖子' :
         hasNextPage ? null : '没有更多内容了'}
      </div>
    </div>
  )
}