'use client'

import { PostDetail } from "@/components/client/post-detail"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"

interface PostDetailDialogProps {
  postId: number | null
  onClose: () => void
}

export function PostDetailDialog({ postId, onClose }: PostDetailDialogProps) {
  console.log('PostDetailDialog rendered with postId:', postId)

  return (
    <Dialog open={!!postId} onOpenChange={(open) => {
        console.log('Dialog open state changed:', open);
        if (!open) onClose();
      }}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogTitle className="sr-only">帖子详情</DialogTitle>
        {postId ? (
          <PostDetail postId={postId} />
        ) : (
          <div className="text-center text-gray-500">
            帖子不存在或已被删除
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}