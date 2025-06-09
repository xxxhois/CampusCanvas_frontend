// components/chatroom/ChatList.tsx
'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { apiClient } from '@/lib/api-client'
import { useNotificationStore } from '@/stores/notificationStore'
import { ChatRoomListResponse } from '@/types/chat'
import { useInfiniteQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useRef } from 'react'
import CreateChatRoomModal from './CreateChatRoom'
import ChatRoomSkeleton from './SkeletonLoader'

const fetchChatRooms = async ({
  pageParam = 1,
  category,
}: {
  pageParam?: number
  category?: string
}): Promise<ChatRoomListResponse> => {
  const params = new URLSearchParams({
    page: String(pageParam),
    page_size: '10',
    approved: 'true',
    sort: 'lastActiveAt,desc',
    ...(category && { category }),
  })

  const res = await apiClient<ChatRoomListResponse>({
    url: `/chatrooms?${params}`,
    method: 'GET',
  })
  return res
}

export default function ChatList() {
  const searchParams = useSearchParams()
  const category = searchParams.get('category') || undefined
  const scrollRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { getUnreadCount } = useNotificationStore()

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['chatrooms', category],
    queryFn: ({ pageParam }) => fetchChatRooms({ pageParam, category }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const nextPage = lastPage.data.page + 1
      return nextPage <= lastPage.data.total_page ? nextPage : undefined
    },
  })

  const handleScroll = () => {
    if (!scrollRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
    if (scrollHeight - scrollTop - clientHeight < 10) {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage()
      }
    }
  }

  useEffect(() => {
    const container = scrollRef.current
    if (container) {
      container.addEventListener('scroll', handleScroll)
    }
    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll)
      }
    }
  }, [hasNextPage, isFetchingNextPage])

  if (isLoading) {
    return (
      <Card className="w-80 p-4">
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </Card>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <CreateChatRoomModal />
      </div>

      <ScrollArea ref={scrollRef} className="flex-1 overflow-auto p-4">
        {data?.pages.map((group, index) => (
          <React.Fragment key={index}>
            {group.data.rooms.map((room) => {
              const unreadCount = getUnreadCount(room.id)
              return (
                <Link key={room.id} href={`/chat/${room.id}`}>
                  <Card className="hover:bg-muted transition-colors mb-3">
                    <CardHeader>
                      <CardTitle>{room.name}</CardTitle>
                      <CardDescription>
                        {room.description || '暂无描述'}
                        <span className="block text-sm text-muted-foreground mt-1">
                          分类：{room.category} | 成员上限：{room.maxMembers}
                        </span>
                        {unreadCount > 0 && (
                          <Badge variant="destructive" className="ml-2">
                            {unreadCount}
                          </Badge>
                        )}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              )
            })}
          </React.Fragment>
        ))}
        {isFetchingNextPage && <ChatRoomSkeleton />}
      </ScrollArea>
    </div>
  )
}