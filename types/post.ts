
export interface Post {
    postId: number;
    userId: number;
    title: string;
    content: string;
    imageUrls: string[];
    tagIds: number[];
    createdTime: string;//ISO 8601 格式的字符串形如2025-05-08T12:54:03
    viewCount: number;
}