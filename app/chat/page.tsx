import ChatList from '@/components/client/chatroom/ChatRoomList'
import ChatWindow from '@/components/client/chatroom/ChatWindow'
import { Suspense } from 'react'

export default function ChatRoomPage() {
  return (
    <div className="flex h-screen">
      <div className="flex-1">
        <Suspense fallback={<div>加载中...</div>}>
          <ChatWindow />
        </Suspense>
      </div>
      <div className="w-1/4 border-r">
        <Suspense fallback={<div>加载中...</div>}>
          <ChatList />
        </Suspense>
      </div>
    </div>
  )
}