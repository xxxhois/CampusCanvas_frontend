"use client"
import { Input } from "@/components/ui/input"

export function SearchPosts() {
  // const [query, setQuery] = useState('')
  // const [debouncedQuery] = useDebounce(query, 500)
  
  // const { data } = useQuery({
  //   queryKey: ['posts', debouncedQuery],
  //   queryFn: () => axios.get(`/api/posts?q=${debouncedQuery}`)
  // })
  
  return (
    <div className="mb-6">
      <Input 
      placeholder="搜索笔记、用户和标签..."
      className="max-w-xl rounded-full"
      // value={query}
      // onChange={(e) => setQuery(e.target.value)}
      />
    </div>
    
    
  )
}