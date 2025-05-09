import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import defaultAvatar from '@/public/default-avatar.png';

export default function ProfilePage() {
  const posts = [
    { id: 1, image: "/post1.jpg", likes: 2345, collected: 120 },
    { id: 2, image: "/post2.jpg", likes: 1850, collected: 95 },
    { id: 3, image: "/post3.jpg", likes: 3021, collected: 210 },
  ]

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* 头部信息区 */}
      <div className="flex gap-6 mb-8">
        <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
          <AvatarImage src={defaultAvatar.src} />
          <AvatarFallback>USER</AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="flex items-center gap-4 mb-4">
            <h1 className="text-2xl font-bold">用户</h1>
            <Button variant="destructive" className="rounded-full px-6">
              关注
            </Button>
          </div>

          <div className="flex gap-6 mb-4">
            <div className="text-center">
              <div className="font-bold">123</div>
              <div className="text-sm text-gray-500">关注</div>
            </div>
            <div className="text-center">
              <div className="font-bold">5.6万</div>
              <div className="text-sm text-gray-500">粉丝</div>
            </div>
            <div className="text-center">
              <div className="font-bold">23.4万</div>
              <div className="text-sm text-gray-500">获赞与收藏</div>
            </div>
          </div>

          <p className="text-gray-600">生活记录者 | 好物分享达人</p>
        </div>
      </div>

      {/* 内容导航 */}
      <Tabs defaultValue="posts" className="w-[60%]]">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="posts">笔记 (45)</TabsTrigger>
          <TabsTrigger value="collections">收藏 (12)</TabsTrigger>
          <TabsTrigger value="likes">赞过 (89)</TabsTrigger>
        </TabsList>

        {/* 帖子瀑布流 */}
        <TabsContent value="posts">
          <div className="grid grid-cols-3 gap-4">
            {posts.map(post => (
              <Card key={post.id} className="group relative overflow-hidden">
                <CardHeader className="p-0">
                  <img 
                    src={post.image}
                    alt={`Post ${post.id}`}
                    className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </CardHeader>
                <CardContent className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                  <div className="flex gap-4 text-white">
                    <Badge variant="secondary" className="gap-1">
                      ♥ {post.likes.toLocaleString()}
                    </Badge>
                    <Badge variant="secondary" className="gap-1">
                      ⭐ {post.collected}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}