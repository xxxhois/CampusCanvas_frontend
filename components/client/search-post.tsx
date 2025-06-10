"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { SearchPostList } from "./search-post-list"

interface SearchPostsProps {
  onSearchModeChange: (isSearchMode: boolean) => void;
}

export function SearchPosts({ onSearchModeChange }: SearchPostsProps) {
  const [isSearchMode, setIsSearchMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setIsSearchMode(true)
      onSearchModeChange(true)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="mb-6">
      <div className="flex gap-2 max-w-xl">
        <Input 
          placeholder="搜索笔记、用户和标签..."
          className="rounded-full"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <Button 
          onClick={handleSearch}
          className="rounded-full"
        >
          搜索
        </Button>
      </div>

      {isSearchMode && <SearchPostList keyword={searchQuery} />}
    </div>
  )
}