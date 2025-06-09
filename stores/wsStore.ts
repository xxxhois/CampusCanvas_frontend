import { getWsBaseUrl } from '@/lib/config';
import { create } from 'zustand';
import { useUserStore } from './userStore';

interface WSStore {
  ws: WebSocket | null;
  isConnected: boolean;
  connect: (chatRoomId: number) => void;
  disconnect: () => void;
  sendMessage: (message: any) => void;
}

const MAX_RETRY_COUNT = 5;
const RETRY_DELAY = 3000;

export const useWSStore = create<WSStore>((set, get) => ({
  ws: null,
  isConnected: false,

  connect: (chatRoomId: number) => {
    const { ws, isConnected } = get();
    console.log('尝试连接WebSocket，当前状态:', { ws: !!ws, isConnected });
    
    // 如果已经连接，不要重复连接
    if (ws && isConnected) {
      console.log('WebSocket已经连接，跳过连接');
      return;
    }

    // 如果存在旧的连接，先关闭
    if (ws) {
      console.log('关闭旧的WebSocket连接');
      ws.close();
      set({ ws: null, isConnected: false });
    }

    let retryCount = 0;

    const connectWebSocket = () => {
      try {
        const currentUser = useUserStore.getState().currentUser;
        if (!currentUser?.id) {
          console.error('用户未登录，无法建立WebSocket连接');
          return;
        }

        const wsUrl = `${getWsBaseUrl()}?user_id=${currentUser.id}&room_id=${chatRoomId}`;
        console.log('正在连接WebSocket:', wsUrl);
        
        const newWs = new WebSocket(wsUrl);
        
        newWs.onopen = () => {
          console.log('WebSocket连接已建立，状态:', newWs.readyState);
          set({ isConnected: true, ws: newWs });
          retryCount = 0;
        };

        newWs.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('收到WebSocket消息:', data);
          } catch (error) {
            console.error('处理WebSocket消息失败:', error);
          }
        };

        newWs.onclose = (event) => {
          console.log('WebSocket连接已关闭:', {
            code: event.code,
            reason: event.reason,
            wasClean: event.wasClean,
            readyState: newWs.readyState
          });
          set({ ws: null, isConnected: false });
          
          if (retryCount < MAX_RETRY_COUNT) {
            retryCount++;
            console.log(`尝试重新连接 (${retryCount}/${MAX_RETRY_COUNT})...`);
            setTimeout(connectWebSocket, RETRY_DELAY);
          } else {
            console.error('WebSocket重连失败，已达到最大重试次数');
          }
        };

        newWs.onerror = (error) => {
          console.error('WebSocket错误:', {
            error,
            readyState: newWs.readyState,
            url: wsUrl
          });
          set({ isConnected: false });
          newWs.close();
        };

        set({ ws: newWs });
      } catch (error) {
        console.error('创建WebSocket连接失败:', error);
        if (retryCount < MAX_RETRY_COUNT) {
          retryCount++;
          console.log(`尝试重新连接 (${retryCount}/${MAX_RETRY_COUNT})...`);
          setTimeout(connectWebSocket, RETRY_DELAY);
        }
      }
    };

    connectWebSocket();
  },

  disconnect: () => {
    const { ws } = get();
    if (ws) {
      console.log('主动断开WebSocket连接');
      ws.close();
      set({ ws: null, isConnected: false });
    }
  },

  sendMessage: (message: any) => {
    const { ws, isConnected } = get();
    if (!ws || !isConnected) {
      console.error('WebSocket未连接，无法发送消息');
      return;
    }
    try {
      console.log('发送WebSocket消息:', message);
      ws.send(JSON.stringify(message));
    } catch (error) {
      console.error('发送消息失败:', error);
    }
  },
})); 