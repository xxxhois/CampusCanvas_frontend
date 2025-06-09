// components/InfiniteMessageList.tsx
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { apiClient } from '@/lib/api-client';
import { useUserStore } from '@/stores/userStore';
import { ChatMessageListResponse, ChatRoomMember } from '@/types/chat';
import { useInfiniteQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useEffect, useRef } from 'react';

interface MessageListProps {
  chatRoomId: number;
  pageSize?: number;
  members: ChatRoomMember[];
}

const fetchChatMessages = async (chatRoomId: number, page: number, pageSize: number): Promise<ChatMessageListResponse> => {
  const response = await apiClient<ChatMessageListResponse>({
    url: `/group-messages/chatroom/${chatRoomId}?page=${page}&page_size=${pageSize}`,
    method: 'GET',
  });
  return response;
};

export const InfiniteMessageList: React.FC<MessageListProps> = ({ chatRoomId, pageSize = 20, members }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { currentUser } = useUserStore();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ['chat-messages', chatRoomId],
    queryFn: ({ pageParam = 1 }) => fetchChatMessages(chatRoomId, pageParam as number, pageSize),
    getNextPageParam: (lastPage: ChatMessageListResponse) => {
      const nextPage = lastPage.data.page + 1;
      return nextPage <= lastPage.data.totalPage ? nextPage : undefined;
    },
    initialPageParam: 1,
  });

  // 滚动监听
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      if (scrollTop < 50 && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (status === 'pending') {
    return (
      <div className="flex justify-center p-4">
        <span className="text-sm text-muted-foreground">加载中...</span>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="p-4 text-destructive">
        加载失败，请重试。
      </div>
    );
  }

  const allMessages = data?.pages.flatMap(page => page.data.messages) || [];
  const sortedMessages = [...allMessages].reverse();

  return (
    <ScrollArea ref={scrollRef} className="flex-1 px-4 py-2">
      {isFetchingNextPage && (
        <div className="text-center text-sm text-muted-foreground my-2">
          加载中...
        </div>
      )}

      <div className="space-y-4">
        {sortedMessages.map((msg) => {
          const isOwnMessage = msg.userId === currentUser?.id;
          const messageUser = members.find(m => m.userId === msg.userId)?.user;
          
          return (
            <div key={msg.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} items-end gap-2`}>
              {!isOwnMessage && (
                <Avatar className="w-8 h-8">
                  <AvatarImage src={messageUser?.avatarUrl} />
                  <AvatarFallback>{messageUser?.username?.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
              )}
              
              <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} max-w-[70%]`}>
                <div className={`flex items-center gap-2 mb-1 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                  <span className="text-sm font-medium">{messageUser?.username || `用户${msg.userId}`}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true, locale: zhCN })}
                  </span>
                </div>
                
                <div className={`rounded-lg px-4 py-2 ${
                  isOwnMessage 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted'
                }`}>
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>

              {isOwnMessage && (
                <Avatar className="w-8 h-8">
                  <AvatarImage src={currentUser?.avatarUrl} />
                  <AvatarFallback>{currentUser?.username?.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
              )}
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};