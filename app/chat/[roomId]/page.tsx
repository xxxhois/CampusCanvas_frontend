import ChatWindow from '@/components/client/chatroom/ChatWindow'
import ChatList from '@/components/client/chatroom/ChatRoomList'
export default function ChatRoomPage() {
    return (
      <div className="flex h-screen">
        <div className="flex-1">
          <ChatWindow />
        </div>
        <div className="w-1/4 border-r">
          <ChatList />
        </div>
      </div>
    )
  }