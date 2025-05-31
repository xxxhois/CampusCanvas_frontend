export interface Post {
    id: number;
    userId: number;
    username: string;
    avatarUrl: string;
    title: string;
    content: string;
    imageUrls: string[];
    createdTime: string;//ISO 8601 格式的字符串形如2025-05-08T12:54:03
    viewCount: number;
    likeCount: number;
    isLiked: boolean;
    isSaved: boolean;
}
export interface PostDetail extends Post {
    comments: Comment[];
    tags: Tag[]; //标签需要在帖子详情中单独请求，name的数组

}
export interface PostPage {
    pages: {
      data: {
        list: Post[];
      };
    }[];
  }
export interface Comment {
    id: number;
    userId: number;
    username: string;
    avatarUrl: string;
    postId: number;
    content: string;
    createdTime: string;
    likes: number;
}
export interface PostRequest {
    page: number;
    pageSize: number;
}
export interface PostResponse{
    code: number;
    message: string;
    data: {
        total: number;
        list: Post[];
        pageNum: number;
        pageSize: number;
        size: number;
        startRow: number;
        endRow:number;
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
}
export interface Tag {
  id: number;
  name: string;
  viewCount: number;
  createdTime: string;
}