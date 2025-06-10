// app/page.tsx
'use client'

import { PostList } from "@/components/client/post-list";
import { SearchPosts } from "@/components/client/search-post";
import { useState } from "react";

export default function HomePage() {
  const [isSearchMode, setIsSearchMode] = useState(false);

  return (
    <div className="p-6">
      <SearchPosts onSearchModeChange={setIsSearchMode} />
      {!isSearchMode && <PostList />}
    </div>
  )
}