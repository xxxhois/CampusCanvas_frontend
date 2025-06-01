export interface UserProfile {
    id: number;
    username: string;
    email: string;
    avatarUrl?: string;
    bio?: string;
    isFollowing?: boolean;
  }
  
  export interface FollowCounts {
    followingCount: number;
    followerCount: number;
  }
  
  export interface Post {
    id: number;
    userId: number;
    username: string;
    avatarUrl: string;
    title: string;
    content: string;
    imageUrls: string[];
    createdTime: string;
    viewCount: number;
    likeCount: number;
  }
  
  export interface PaginatedResponse<T> {
    total: number;
    list: T[];
    pageNum: number;
    pageSize: number;
    size: number;
    startRow: number;
    endRow: number;
    pages: number;
    prePage: number;
    nextPage: number;
    isFirstPage: boolean;
    isLastPage: boolean;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
    navigatePages: number;
    navigatepageNums: number[];
    navigateFirstPage: number;
    navigateLastPage: number;
  }
  
  export interface ApiResponse<T> {
    code: number;
    message: string;
    data: T;
  }