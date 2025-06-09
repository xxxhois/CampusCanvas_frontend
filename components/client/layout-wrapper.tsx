'use client'

import { SideBar } from "@/components/client/sidebar";
import { usePathname } from 'next/navigation';

export function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/register' || pathname === '/admin' || pathname === '/admin/login';

  return (
    <div className="flex min-h-screen">
      {!isAuthPage && <SideBar />}
      <main className={!isAuthPage ? "ml-64 flex-1" : "flex-1"}>
        {children}
      </main>
    </div>
  );
}