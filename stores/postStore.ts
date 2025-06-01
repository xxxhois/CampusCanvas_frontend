import { Post } from '@/types/post';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { useUserStore } from './userStore';
import { apiClient } from '@/lib/api-client';

interface Comment {
    id: string;
    content: string;
    authorId: string;
    createdAt: Date;
  }
  
  interface PostState {
    posts: Post[];
    currentPost: Post | null;
    searchParams: {
      keyword?: string;
      tags?: string[];
    };
    loading: boolean;
    error: string | null;
  }
  


  interface PostActions {
    getPosts: (page?: number) => Promise<void>;
    // getPostDetail: (postId: number) => Promise<PostDetail | undefined>;
    // searchPosts: (params: { keyword?: string; tags?: string[] }) => Promise<void>;
    // createPost: (post: { content: string; images?: string[]; tags?: string[] }) => Promise<void>;
    // deletePost: (postId: number) => void;
    // likePost: (postId: number) => void;
    // unlikePost: (postId: number) => void;
    savePost: (postId: number) => void;//收藏帖子
    unsavePost: (postId: number) => void;//取消收藏
    addComment: (postId: number, content: string) => void;
    deleteComment: (postId: number, commentId: number) => void;
    getTags: (postId: number) => Promise<void>;
  }
  
  export const usePostStore = create<PostState & PostActions>()(
    devtools(
      immer((set, get) => ({
        posts: [],
        currentPost: null,
        searchParams: {},
        loading: false,
        error: null,
  
        async getPosts(page = 1) {
          set({ loading: true });
          try {
            // 调用获取帖子API
            const res = await fetch(`/api/posts?page=${page}`);
            const data = await res.json();
            set({ posts: data.posts, loading: false });
          } catch (err: any) {
            set({ error: err.message, loading: false });
          }
        },

        // async getPostDetail(postId: number): Promise<PostDetail | undefined> {
        //   // 从 React Query 的缓存中获取数据
        //   const queryClient = useQueryClient();
        //   const posts = queryClient.getQueryData<PostPage>(['posts']);
        //   return posts?.pages
        //     .flatMap((page) => page.data.list)
        //     .find((post) => post.postId === postId);
        // },

  
        // async searchPosts(params) {
        //   set({ searchParams: params, loading: true });
        //   // 调用搜索API
        //   const res = await fetch('/api/posts/search', {
        //     method: 'POST',
        //     body: JSON.stringify(params)
        //   });
        //   const data = await res.json();
        //   set({ posts: data.posts, loading: false });
        // },
  
        // async createPost(post) {
        //   const { currentUser } = useUserStore.getState();
        //   if (!currentUser) throw new Error('需要登录');
          
        //   const newPost = {
        //     ...post,
        //     authorId: currentUser.id,
        //     createdAt: new Date(),
        //     likesCount: 0,
        //     savesCount: 0,
        //     comments: []
        //   };
          
        //   set(state => {
        //     state.posts.unshift(newPost);
        //   });
          
        //   // 调用创建帖子API
        //   await fetch('/api/posts', {
        //     method: 'POST',
        //     body: JSON.stringify(newPost)
        //   });
        // },
  
        // deletePost(postId) {
        //   set(state => {
        //     state.posts = state.posts.filter(post => post.id !== postId);
        //   });
        //   // 调用删除API
        //   fetch(`/api${postId}`, { method: 'DELETE' });
        // },
  


      // 收藏帖子
      savePost(postId) {
        const { currentUser } = useUserStore.getState();
        if (!currentUser) return;

        set(state => {
          const post = state.posts.find(p => p.id === postId);
          if (post && (!post.saves || !post.saves.includes(currentUser.id))) {
            post.savesCount = (post.savesCount || 0) + 1;
            if (!post.saves) post.saves = [];
            post.saves.push(currentUser.id);
          }
        });
        // 可选：调用后端API
        fetch(`/api/posts/${postId}/save`, { method: 'POST' });
      },

      // 取消收藏
      unsavePost(postId) {
        const { currentUser } = useUserStore.getState();
        if (!currentUser) return;

        set(state => {
          const post = state.posts.find(p => p.id === postId);
          if (post && post.saves && post.saves.includes(currentUser.id)) {
            post.savesCount = Math.max(0, (post.savesCount || 1) - 1);
            post.saves = post.saves.filter(id => id !== currentUser.id);
          }
        });
        // 可选：调用后端API
        fetch(`/api/posts/${postId}/unsave`, { method: 'POST' });
      },

      // 添加评论
      addComment(postId, comment) {
        const { currentUser } = useUserStore.getState();
        if (!currentUser) throw new Error('需要登录');

        const newComment = {
          ...comment,
          userId: currentUser.id,
          userName: currentUser.username,
          userAvatar: currentUser.avatar,
          createdAt: new Date().toISOString(),
        };

        set(state => {
          const post = state.posts.find(p => p.id === postId);
          if (post) {
            if (!post.comments) post.comments = [];
            post.comments.push(newComment);
          }
        });

        // 可选：调用后端API
        fetch(`/api/posts/${postId}/comments`, {
          method: 'POST',
          body: JSON.stringify(newComment),
          headers: {
            'Content-Type': 'application/json'
          }
        });
      
      },
      // 删除评论
      deleteComment(postId, commentId) {
        set(state => {
          const post = state.posts.find(p => p.id === postId);
          if (post) {
            post.comments = post.comments?.filter(c => c.id !== commentId);
          }
        });
      },

      async getTags(postId) {
        const res = await fetch(`/api/posts/${postId}/tags`);
        const data = await res.json();
        set({ tags: data.tags });
      }
    })
  ),
))
