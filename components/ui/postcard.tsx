import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Post } from "@/types/post";
import { Bookmark, Eye, Heart, MessageCircle } from "lucide-react";
import Image from "next/image";

interface PostCardProps {
  post: Post;
  onLike?: (postId: number) => void;
  onCollect?: (postId: number) => void;
  onComment?: (postId: number) => void;
}

export function PostCard({ post, onLike, onCollect, onComment }: PostCardProps) {
  return (
    <Card className="rounded-2xl overflow-hidden shadow-md bg-white hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center gap-3 pb-2">
        <Avatar className="w-9 h-9">
          <AvatarImage src={post.userAvatar} />
          <AvatarFallback>
            {post.userName?.[0] || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="font-semibold text-sm">{post.userName}</div>
          <div className="text-xs text-gray-400">
            {new Date(post.createdTime).toLocaleDateString()}
          </div>
        </div>
        <Button variant="outline" size="sm" className="rounded-full px-3 py-1 text-xs">
          关注
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative w-full aspect-[4/5] bg-gray-100">
          <Image
            src={post.imageUrls[0] || '/default-image.png'}
            alt={post.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 400px"
            priority
          />
        </div>
        <div className="p-3">
          <div className="font-medium text-base truncate mb-1">{post.title}</div>
          <div className="text-sm text-gray-600 line-clamp-2 mb-2">{post.content}</div>
          <div className="flex flex-wrap gap-1 mb-2">
            {post.tagIds.map((tagId) => (
              <Badge key={tagId} variant="secondary" className="rounded-full px-2 py-0.5 text-xs">
                #{tagId}
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
            className="text-gray-500 hover:bg-pink-100"
            onClick={() => onLike?.(post.postId)}
          >
            <Heart className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-500 hover:bg-yellow-100"
            onClick={() => onCollect?.(post.postId)}
          >
            <Bookmark className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-500 hover:bg-gray-100"
            onClick={() => onComment?.(post.postId)}
          >
            <MessageCircle className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <Eye className="w-4 h-4" />
            <span>{post.viewCount}</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
