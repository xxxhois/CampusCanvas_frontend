'use client'

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Home, PlusCircle, Settings, User } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

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
      <div className="space-y-6">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-2 text-2xl font-semibold text-purple-600">CampusCanvas</h2>
        </div>
        <nav className="space-y-3">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 px-4 py-3 text-base transition-colors",
                  "hover:bg-pink-100 hover:text-pink-600",
                  pathname === item.href && "bg-gray-100 text-gray-900 font-medium"
                )}
              >
                <item.icon className="h-6 w-6" />
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>
      </div>
    </Card>
  )
}