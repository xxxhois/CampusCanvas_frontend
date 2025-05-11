// app/page.tsx
import { PostList } from "@/components/client/post-list";

export default function HomePage() {
  return (
    <div className="p-6">
      <PostList />
    </div>
  )
}
//       likes: 2345,
//       collected: 120,
//       content: "今日OOTD｜春日温柔系穿搭🌿"
//     },
//     { 
//       id: 2,
//       image: "/post2.jpg",
//       likes: 1850,
//       collected: 95,
//       content: "上海咖啡地图｜藏在弄堂里的宝藏小店☕️"
//     },
//     // 更多测试数据...
//   ]

//   return (
//     <div className="flex min-h-screen">
//       {/* 侧边栏 */}
//       <SideBar/>
//       {/* 主内容区 */}
//       <main className="ml-64 flex-1 p-6">
//         {/* 搜索栏 */}       
//         <SearchPosts/>

//         {/* 瀑布流帖子 */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//           {posts.map(post => (
//             <Card key={post.id} className="group overflow-hidden">
//               <CardHeader className="p-0 relative">
//                 <Image
//                   src={post.image}
//                   alt={post.content}
//                   width={400}
//                   height={500}
//                   className="w-full h-80 object-cover transition-transform duration-300 group-hover:scale-105"
//                 />
//                 <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 p-4">
//                   <p className="text-white line-clamp-2">{post.content}</p>
//                 </div>
//               </CardHeader>
//               <CardContent className="p-4 flex justify-between text-gray-500">
//                 <div className="flex items-center gap-1">
//                   <HeartIcon className="w-5 h-5" />
//                   {post.likes.toLocaleString()}
//                 </div>
//                 <div className="flex items-center gap-1">
//                   <StarIcon className="w-5 h-5" />
//                   {post.collected}
//                 </div>
//               </CardContent>
//             </Card>
//           ))}
//         </div>
//       </main>
//     </div>
//   )
// }

// // 图标组件
// function HeartIcon(props: React.SVGProps<SVGSVGElement>) {
//   return (
//     <svg {...props} viewBox="0 0 24 24" fill="currentColor">
//       <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
//     </svg>
//   )
// }

// function StarIcon(props: React.SVGProps<SVGSVGElement>) {
//   return (
//     <svg {...props} viewBox="0 0 24 24" fill="currentColor">
//       <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
//     </svg>
//   )
// }