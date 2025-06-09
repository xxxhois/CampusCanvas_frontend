

import React from 'react'
import { Card, CardHeader } from '@/components/ui/card'

export default function ChatRoomSkeleton() {
  return Array.from({ length: 6 }).map((_, i) => (
    <Card key={i}>
      <CardHeader className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </CardHeader>
    </Card>
  ))
}