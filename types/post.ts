
export interface Post {
    postId: number;
    userId: number;
    userName: string;
    userAvatar: string;
    title: string;
    content: string;
    imageUrls: string[];
    tagIds: number[];
    createdTime: string;//ISO 8601 格式的字符串形如2025-05-08T12:54:03
    viewCount: number;
}
export interface PostRequest {
    page: number;
    pageSize: number;
}
export interface PostResponse{
    code: number;
    message: string;
    data: {
        list: Post[];
        hasNextPage: boolean;
        nextPage: number;
    }
}
export interface UserPostResponse{
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