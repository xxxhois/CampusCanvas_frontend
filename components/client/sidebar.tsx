import { Button } from "@/components/ui/button";

export function SideBar() {
    return(
        <div>
            <aside className="w-64 fixed left-0 top-0 h-screen p-4 border-r">
                <div className="flex flex-col gap-4">
                <h1 className="text-2xl font-bold text-purple-500">CampusCanvas</h1>
                <nav className="space-y-2">
                    <Button variant="ghost" className="w-full justify-start">
                    首页
                    </Button>
                    <Button variant="ghost" className="w-full justify-start">
                    发布
                    </Button>
                    <Button variant="ghost" className="w-full justify-start">
                    消息
                    </Button>
                </nav>
                </div>
            </aside>
        </div>
    )
}