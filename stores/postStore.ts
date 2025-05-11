import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { Post } from '@/types/post';

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
    searchPosts: (params: { keyword?: string; tags?: string[] }) => Promise<void>;
    createPost: (post: { content: string; images?: string[]; tags?: string[] }) => Promise<void>;
    deletePost: (postId: string) => void;
    likePost: (postId: string) => void;
    unlikePost: (postId: string) => void;
    savePost: (postId: string) => void;
    unsavePost: (postId: string) => void;
    addComment: (postId: string, content: string) => void;
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
          } catch (err) {
            set({ error: err.message, loading: false });
          }
        },
  
        async searchPosts(params) {
          set({ searchParams: params, loading: true });
          // 调用搜索API
          const res = await fetch('/api/posts/search', {
            method: 'POST',
            body: JSON.stringify(params)
          });
          const data = await res.json();
          set({ posts: data.posts, loading: false });
        },
  
        async createPost(post) {
          const { currentUser } = useUserStore.getState();
          if (!currentUser) throw new Error('需要登录');
          
          const newPost = {
            ...post,
            authorId: currentUser.id,
            createdAt: new Date(),
            likesCount: 0,
            savesCount: 0,
            comments: []
          };
          
          set(state => {
            state.posts.unshift(newPost);
          });
          
          // 调用创建帖子API
          await fetch('/api/posts', {
            method: 'POST',
            body: JSON.stringify(newPost)
          });
        },
  
        deletePost(postId) {
          set(state => {
            state.posts = state.posts.filter(post => post.id !== postId);
          });
          // 调用删除API
          fetch(`/api/posts/${postId}`, { method: 'DELETE' });
        },
  
        likePost(postId) {
          const { currentUser } = useUserStore.getState();
          if (!currentUser) return;
  
          set(state => {
            const post = state.posts.find(p => p.id === postId);
            if (post && !post.likes.includes(currentUser.id)) {
              post.likesCount++;
              post.likes.push(currentUser.id);
            }
          });
        },
  
        // 其他互动方法实现类似...
      }))
    )
  );