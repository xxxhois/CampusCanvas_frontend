// components/chat/ChatWindow.tsx
'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'
import { apiClient } from '@/lib/api-client'
import { useNotificationStore } from '@/stores/notificationStore'
import { useUserStore } from '@/stores/userStore'
import { useWSStore } from '@/stores/wsStore'
import { ChatRoomDetailResponse, ChatRoomListResponse } from '@/types/chat'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import MemberSidebar from './MemberSidebar'
import { InfiniteMessageList } from './MessageList'

const fetchChatDetail = async (chatroomId: number): Promise<ChatRoomDetailResponse> => {
  const res = await apiClient<ChatRoomDetailResponse>({
    url: `/chatrooms/${chatroomId}`,
    method: 'GET',
    responseHandler: {
      onResponse: async (response) => {
        if (response.status === 200) {
          return await response.json();
        } else {
          const data = await response.json();
          throw new Error(data.message || '获取聊天室详情失败');
        }
      }
    }
  });
  return res;
}

export default function ChatWindow() {
  const params = useParams()
  const [initialRoomId, setInitialRoomId] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const { currentUser } = useUserStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { ws, isConnected, connect, sendMessage } = useWSStore();
  const { markAsRead } = useNotificationStore();

  // 获取最近活动的聊天室
  useEffect(() => {
    const fetchRecentRoom = async () => {
      try {
        const response = await apiClient<ChatRoomListResponse>({
          url: '/chatrooms?page=1&page_size=1&approved=true',
          method: 'GET',
        });
        if (response.data.rooms.length > 0) {
          setInitialRoomId(response.data.rooms[0].id);
        }
      } catch (error) {
        console.error('获取最近活动聊天室失败:', error);
      }
    };

    if (!params?.roomId) {
      fetchRecentRoom();
    }
  }, [params?.roomId]);

  const chatroomId = Number(params?.roomId) || initialRoomId || null;

  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['chatroom', chatroomId],
    queryFn: () => fetchChatDetail(chatroomId!),
    enabled: !!chatroomId,
  })

  // 监听WebSocket消息
  useEffect(() => {
    if (!chatroomId || !data?.data) return;

    // 检查当前用户是否是聊天室成员
    const isMember = data.data.members.some(member => member.userId === currentUser?.id);
    if (!isMember) {
      console.log('当前用户不是聊天室成员，不建立WebSocket连接');
      return;
    }

    // 先断开之前的连接
    useWSStore.getState().disconnect();

    // 建立新连接
    useWSStore.getState().connect(chatroomId);
    const { ws } = useWSStore.getState();

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'group_message') {
          queryClient.invalidateQueries({ queryKey: ['chat-messages', chatroomId] });
        }
      } catch (error) {
        console.error('处理WebSocket消息失败:', error);
      }
    };

    ws?.addEventListener('message', handleMessage);
    
    return () => {
      // 确保在组件卸载时断开连接
      useWSStore.getState().disconnect();
    };
  }, [chatroomId, queryClient, data?.data, currentUser?.id]);

  const handleSendMessage = async () => {
    if (!message.trim() || !currentUser?.id || !chatroomId) return;

    try {
      await apiClient({
        url: '/group-messages/send',
        method: 'POST',
        data: {
          chatRoomId: chatroomId,
          userId: currentUser.id,
          content: message.trim()
        }
      });

      // 清空输入框
      setMessage('');
      
      // 刷新消息列表
      queryClient.invalidateQueries({ queryKey: ['chat-messages', chatroomId] });
    } catch (error) {
      toast({
        title: '发送失败',
        description: '消息发送失败，请重试',
        variant: 'destructive'
      });
    }
  };

  const handleJoinRequest = async () => {
    if (!chatroomId || !currentUser?.id) return;

    try {
      await apiClient({
        url: `/chatrooms/${chatroomId}/join`,
        method: 'POST',
        data: {
          userId: currentUser.id
        }
      });

      toast({
        title: '申请成功'
      });

      // 刷新聊天室数据
      queryClient.invalidateQueries({ queryKey: ['chatroom', chatroomId] });
    } catch (error) {
      toast({
        title: '申请失败',
        description: '请稍后重试',
        variant: 'destructive'
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!chatroomId) {
    return (
      <Card className="flex-1 flex flex-col items-center justify-center border-none shadow-none">
        <p className="text-lg text-muted-foreground">请选择一个聊天室开始对话</p>
      </Card>
    )
  }

  if (isLoading) {
    return <Card className="flex-1 p-4">加载中...</Card>
  }

  if (isError || !data?.data) {
    return <Card className="flex-1 p-4 text-red-500">加载失败，请重试</Card>
  }

  const chatroom = data.data;
  const isMember = chatroom.members.some(member => {
    return member.userId === currentUser?.id;
  });

  if (!isMember) {
    return (
      <Card className="h-screen flex flex-col">
        {/* Header */}
        <div className="border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">{chatroom.name}</h2>
          <MemberSidebar members={chatroom.members} />
        </div>

        {/* Non-member Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="text-center space-y-4">
            <p className="text-lg text-muted-foreground">
              您还不是该聊天室的成员
            </p>
            <p className="text-sm text-muted-foreground">
              申请加入后即可查看消息和参与讨论
            </p>
            <Button 
              onClick={handleJoinRequest}
              className="mt-4"
            >
              申请加入
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b p-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold">{chatroom.name}</h2>
        <MemberSidebar members={chatroom.members} />
      </div>

      {/* Message Area */}
      <ScrollArea className="flex-1 p-4">
        <InfiniteMessageList 
          chatRoomId={chatroom.id} 
          members={chatroom.members}
        />
      </ScrollArea>

      {/* Footer - Input Area */}
      <div className="border-t p-4 bg-background">
        <div className="flex space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="输入消息..."
            className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Button onClick={handleSendMessage}>发送</Button>
        </div>
      </div>
    </Card>
  )
}