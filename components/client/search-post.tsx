"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"
import { SearchPostList } from "./search-post-list"

interface SearchPostsProps {
  onSearchModeChange: (isSearchMode: boolean) => void;
}

type SearchType = 'keyword' | 'user'

export function SearchPosts({ onSearchModeChange }: SearchPostsProps) {
  const [isSearchMode, setIsSearchMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchType, setSearchType] = useState<SearchType>('keyword')

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

  const handleSearchTypeChange = (value: string) => {
    setSearchType(value as SearchType)
    if (isSearchMode && searchQuery.trim()) {
      // 当切换搜索类型时，如果已经在搜索模式且有搜索内容，则重新搜索
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

      {isSearchMode && (
        <>
          <Tabs 
            defaultValue="keyword" 
            className="mt-4"
            onValueChange={handleSearchTypeChange}
          >
            <TabsList>
              <TabsTrigger value="keyword">关键词</TabsTrigger>
              <TabsTrigger value="user">用户</TabsTrigger>
            </TabsList>
          </Tabs>
          <SearchPostList 
            keyword={searchQuery} 
            searchType={searchType}
          />
        </>
      )}
    </div>
  )
}