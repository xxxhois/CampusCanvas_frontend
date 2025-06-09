'use client'

import React, { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { UserCircle2Icon, MoreVerticalIcon } from 'lucide-react'
import { ChatRoomMember } from '@/types/chat'

interface MemberSidebarProps {
  members: ChatRoomMember[]
}

export default function MemberSidebar({ members }: MemberSidebarProps) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">查看成员 ({members.length})</Button>
      </SheetTrigger>
      <SheetContent className="w-80 sm:max-w-md">
        <SheetHeader>
          <SheetTitle>群成员</SheetTitle>
        </SheetHeader>
        <ScrollArea className="mt-4 h-[calc(100vh-100px)]">
          <ul className="space-y-3">
            {members.map((member) => (
              <li key={member.id} className="flex items-center justify-between p-2 rounded hover:bg-muted">
                <div className="flex items-center gap-2">
                  <UserCircle2Icon className="h-6 w-6 text-gray-500" />
                  <span>{member.user.username || member.user.email}</span>
                </div>
                <Button variant="ghost" size="icon">
                  <MoreVerticalIcon className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}