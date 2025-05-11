'use client'

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Home, PlusCircle, User, Settings } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function SideBar() {
  const pathname = usePathname()

  const navItems = [
    { href: '/', icon: Home, label: '首页' },
    { href: '/publish', icon: PlusCircle, label: '发布' },
    { href: '/profile', icon: User, label: '我的' },
    { href: '/settings', icon: Settings, label: '设置' },
  ]

  return (
    <Card className="fixed left-0 top-0 h-screen w-64 border-r rounded-none p-4">
      <div className="space-y-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold">CampusCanvas</h2>
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-2",
                  pathname === item.href && "bg-muted"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>
      </div>
    </Card>
  )
}