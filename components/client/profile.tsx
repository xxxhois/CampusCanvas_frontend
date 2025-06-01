'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from '@/lib/api-client';
import defaultAvatar from '@/public/default-avatar.jpg';
import { useUserStore } from '@/stores/userStore';
import { ApiResponse, FollowCounts, PaginatedResponse, Post, UserProfile } from '@/types/user-profile';
import { Pencil } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Profile({ userId }: { userId: string }) {
  const router = useRouter();
  const { currentUser, followUser, unfollowUser } = useUserStore();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [followCounts, setFollowCounts] = useState<FollowCounts | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [favoritePosts, setFavoritePosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState('posts');
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const isOwnProfile = currentUser && currentUser.id.toString() === userId;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // 获取用户基本信息
        const profileData = await apiClient<ApiResponse<UserProfile>>({
            url: `/users/${userId}`,
            method: 'GET'
        });
        setUserProfile(profileData.data);

        // 获取关注数据
        const followData = await apiClient<ApiResponse<FollowCounts>>({
            url: `/users/${userId}/follow-counts`, 
            method: 'GET'
        });
        setFollowCounts(followData.data);

        // 获取用户帖子
        const postsData = await apiClient<ApiResponse<PaginatedResponse<Post>>>({
            url: `/users/${userId}/posts`,
            method: 'GET'
        });
        setPosts(postsData.data.list);

        // 获取收藏帖子
        const favoritesData = await apiClient<ApiResponse<PaginatedResponse<Post>>>({
            url: `/users/${userId}/favorite-posts`,
            method: 'GET'
        });
        setFavoritePosts(favoritesData.data.list);

        // 获取关注列表
        const followingsData = await apiClient<ApiResponse<PaginatedResponse<UserProfile>>>({
            url: `/users/${userId}/followings`,
            method: 'GET'
        });
        if(isOwnProfile && currentUser) {
          useUserStore.setState(state => ({
            currentUser: {
              ...state.currentUser!,
              followingIds: followingsData.data.list.map(user => user.id)
            }
          }));
        }

        // 获取粉丝列表
        const followersData = await apiClient<ApiResponse<PaginatedResponse<UserProfile>>>({
            url: `/users/${userId}/followers`,
            method: 'GET'
        });
        if(isOwnProfile && currentUser) {
          useUserStore.setState(state => ({
            currentUser: {
              ...state.currentUser!,
              followerIds: followersData.data.list.map(user => user.id)
            }
          }));
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId, currentUser?.id]);

  const handleEditProfile = () => {
    setIsEditing(true);
    // TODO: 实现编辑个人资料的逻辑
  };

  const handleFollow = async () => {
    if (!currentUser) {
      toast({
        title: "请先登录",
        description: "登录后才能关注用户",
        variant: "destructive",
      });
      return;
    }

    try {
      if (userProfile && currentUser.followingIds.includes(userProfile.id)) {
        await unfollowUser(userProfile.id);
        toast({
          title: "取消关注成功",
          description: `已取消关注 ${userProfile.username}`,
        });
      } else {
        await followUser(userProfile!.id);
        toast({
          title: "关注成功",
          description: `已关注 ${userProfile!.username}`,
        });
      }
    } catch (error) {
      toast({
        title: "操作失败",
        description: error instanceof Error ? error.message : "请稍后重试",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">加载中...</div>;
  }

  if (!userProfile) {
    return <div className="flex justify-center items-center min-h-screen">用户不存在</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* 头部信息区 */}
      <div className="flex gap-6 mb-8">
        <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
          <AvatarImage src={userProfile.avatarUrl || defaultAvatar.src} />
          <AvatarFallback>{userProfile.username.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="flex items-center gap-4 mb-4">
            <h1 className="text-2xl font-bold">{userProfile.username}</h1>
            {isOwnProfile ? (
              <Button 
                variant="outline" 
                className="rounded-full px-6"
                onClick={handleEditProfile}
              >
                <Pencil className="w-4 h-4 mr-2" />
                编辑资料
              </Button>
            ) : (
              <Button 
                variant={currentUser?.followingIds.includes(userProfile.id) ? "outline" : "destructive"} 
                className="rounded-full px-6"
                onClick={handleFollow}
              >
                {currentUser?.followingIds.includes(userProfile.id) ? '取消关注' : '关注'}
              </Button>
            )}
          </div>

          <div className="flex gap-6 mb-4">
            <div className="text-center">
              <div className="font-bold">{followCounts?.followingCount || 0}</div>
              <div className="text-sm text-gray-500">关注</div>
            </div>
            <div className="text-center">
              <div className="font-bold">{followCounts?.followerCount || 0}</div>
              <div className="text-sm text-gray-500">粉丝</div>
            </div>
          </div>

          <p className="text-gray-600">{userProfile.bio || '这个人很懒，什么都没写~'}</p>
        </div>
      </div>

      {/* 内容导航 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="posts">笔记 ({posts.length})</TabsTrigger>
          <TabsTrigger value="collections">收藏 ({favoritePosts.length})</TabsTrigger>
        </TabsList>

        {/* 帖子瀑布流 */}
        <TabsContent value="posts">
          <div className="grid grid-cols-3 gap-4">
            {posts.map(post => (
              <Card key={post.id} className="group relative overflow-hidden">
                <CardHeader className="p-0">
                  <img 
                    src={post.imageUrls[0] || defaultAvatar.src}
                    alt={post.title}
                    className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </CardHeader>
                <CardContent className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                  <div className="flex gap-4 text-white">
                    <Badge variant="secondary" className="gap-1">
                      ♥ {post.likeCount}
                    </Badge>
                    <Badge variant="secondary" className="gap-1">
                      👁 {post.viewCount}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="collections">
          <div className="grid grid-cols-3 gap-4">
            {favoritePosts.map(post => (
              <Card key={post.id} className="group relative overflow-hidden">
                <CardHeader className="p-0">
                  <img 
                    src={post.imageUrls[0] || defaultAvatar.src}
                    alt={post.title}
                    className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </CardHeader>
                <CardContent className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                  <div className="flex gap-4 text-white">
                    <Badge variant="secondary" className="gap-1">
                      ♥ {post.likeCount}
                    </Badge>
                    <Badge variant="secondary" className="gap-1">
                      👁 {post.viewCount}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}