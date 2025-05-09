import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = searchParams.get('page') || '1'
  
  // 模拟异步请求
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // 实际项目中替换为真实数据源
  const mockPosts = generateMockPosts(Number(page))
  
  return NextResponse.json({
    data: mockPosts,
    nextPage: Number(page) < 3 ? Number(page) + 1 : null
  })
}

function generateMockPosts(page: number) {
const postsPerPage = 10
const startIndex = (page - 1) * postsPerPage

return Array(postsPerPage).fill(null).map((_, index) => {
    const id = startIndex + index + 1
    return {
        id,
        title: `测试帖子标题 ${id}`,
        content: `这是测试帖子 ${id} 的内容。这是一段示例文字...`,
        author: {
            id: id % 5 + 1,
            name: `用户${id % 5 + 1}`,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${id % 5 + 1}`
        },
        createdAt: new Date(Date.now() - id * 86400000).toISOString(),
        likes: Math.floor(Math.random() * 100),
        comments: Math.floor(Math.random() * 50)
    }
})
}