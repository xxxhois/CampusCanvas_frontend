import { User } from "./auth";

export interface ChatRoom{
    id: number;
    name: string;
    description: string;
    category: string;
    creatorId: number;
    creator: chatProfile;
    maxMembers: number;
    isActive: boolean;
    isApproved: boolean;
    createdAt: string;
    updatedAt: string;
}
export interface chatProfile extends User{
    createdTime: string;
    status: string;
}
export interface ChatRoomListResponse{
    data: {
        page: number;
        page_size: number;
        rooms: ChatRoom[];
        total: number;
        total_page: number;
    }
}

export interface ChatRoomDetail extends ChatRoom{
    members: ChatRoomMember[];
}
export interface ChatRoomDetailResponse{
    data: ChatRoomDetail;
}
export interface ChatRoomMember{
    id: number;
    chatRoomId: number;
    userId: number;
    role: string;
    isMuted: boolean;
    joinedAt: string;
    updatedAt: string;
    user: chatProfile;
}

export interface ChatMessage{
    id: number;
    chatRoomId: number;
    userId: number;
    content: string;
    createdAt: string;
}
export interface ChatMessageListResponse{
    data: {
        messages: ChatMessage[];
        page: number;
        pageSize: number;
        total: number;
        totalPage: number;
    }
    message: string;
}