import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Bookmark, MessageCircle } from "lucide-react";
import Image from "next/image";

type Post = {
  id: number | string;
  user: {
    name: string;
    avatar: string;
  };
  image: string;
  title: string;
  tags?: string[];
  likes: number;
  collected: number;
  comments: number;
  isLiked?: boolean;
  isCollected?: boolean;
  time?: string;
};

interface PostCardProps {
  post: Post;
  onLike?: (id: Post["id"]) => void;
  onCollect?: (id: Post["id"]) => void;
  onComment?: (id: Post["id"]) => void;
}

export function PostCard({ post, onLike, onCollect, onComment }: PostCardProps) {
  return (
    <Card className="rounded-2xl overflow-hidden shadow-md bg-white hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center gap-3 pb-2">
        <Avatar className="w-9 h-9">
          <AvatarImage src={post.user.avatar} />
          <AvatarFallback>
            {post.user.name?.[0] || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="font-semibold text-sm">{post.user.name}</div>
          {post.time && (
            <div className="text-xs text-gray-400">{post.time}</div>
          )}
        </div>
        <Button variant="outline" size="sm" className="rounded-full px-3 py-1 text-xs">
          关注
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative w-full aspect-[4/5] bg-gray-100">
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 400px"
            priority
          />
        </div>
        <div className="p-3">
          <div className="font-medium text-base truncate mb-1">{post.title}</div>
          <div className="flex flex-wrap gap-1 mb-2">
            {post.tags?.map((tag) => (
              <Badge key={tag} variant="secondary" className="rounded-full px-2 py-0.5 text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between px-3 pb-3 pt-0">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className={`hover:bg-pink-100 ${post.isLiked ? "text-pink-500" : "text-gray-500"}`}
            onClick={() => onLike?.(post.id)}
          >
            <Heart fill={post.isLiked ? "#ec4899" : "none"} className="w-5 h-5" />
          </Button>
          <span className="text-xs text-gray-600">{post.likes}</span>
          <Button
            variant="ghost"
            size="icon"
            className={`hover:bg-yellow-100 ${post.isCollected ? "text-yellow-500" : "text-gray-500"}`}
            onClick={() => onCollect?.(post.id)}
          >
            <Bookmark fill={post.isCollected ? "#facc15" : "none"} className="w-5 h-5" />
          </Button>
          <span className="text-xs text-gray-600">{post.collected}</span>
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-500 hover:bg-gray-100"
            onClick={() => onComment?.(post.id)}
          >
            <MessageCircle className="w-5 h-5" />
          </Button>
          <span className="text-xs text-gray-600">{post.comments}</span>
        </div>
      </CardFooter>
    </Card>
  );
}
