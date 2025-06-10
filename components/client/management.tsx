'use client'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { apiClient } from '@/lib/api-client'
import { cn } from '@/lib/utils'
import { useUserStore } from '@/stores/userStore'
import { ChatRoomListResponse } from '@/types/chat'
import { ApiResponse } from '@/types/user-profile'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

// 类型定义
interface DashboardData {
  totalUsers: number
  totalPosts: number
  dailyUserCounts: Array<{ date: string; count: number }>
  dailyPostCounts: Array<{ date: string; count: number }>
}

interface UserManagement {
  id: number
  username: string
  status: 'ACTIVE' | 'DISABLED'
  isBanned:boolean
}

interface QueryParams {
  status?: string;
  search?: string;
}

// interface ChatRoom {
//   id: number
//   name: string
//   status: 'pending' | 'approved' | 'rejected'
//   memberCount: number
//   createdAt: string
// }

// 数据获取函数
const fetchDashboardData = async (startDate: string, endDate: string): Promise<DashboardData> => {
  console.log('Dashboard请求头:', {
    url: `/overview?startDate=${startDate}&endDate=${endDate}`,
    token: useUserStore.getState().token
  });
  const res = await apiClient<{ data: DashboardData }>({
    url: `/overview?startDate=${startDate}&endDate=${endDate}`,
  });
  return res.data;
};

const fetchUsers = async (): Promise<ApiResponse<UserManagement[]>> => {
  const res = await apiClient<ApiResponse<UserManagement[]>>({
    url: '/users/all',
    method: 'GET'
  });
  return res;
};

const fetchChatRooms = async (approved: boolean): Promise<ChatRoomListResponse> => {
  console.log('聊天室请求头:', {
    url: `/chatrooms?approved=${approved}`,
    token: useUserStore.getState().token
  });
  const res = await apiClient<ChatRoomListResponse>({
    url: `/chatrooms?approved=${approved}`,
    method: 'GET'
  });
  return res;
};

export default function Management() {
  const router = useRouter();
  const { currentUser } = useUserStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [userSearch, setUserSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [queryParams, setQueryParams] = useState<QueryParams>({});
  const [chatRoomSearch, setChatRoomSearch] = useState('');
  const [showApproved, setShowApproved] = useState(false);
  const [startDate, setStartDate] = useState<Date>(new Date(2024, 5, 9))
  const [endDate, setEndDate] = useState<Date>(new Date(2025, 5, 9))


  // 获取数据
  const { data: dashboardData, refetch: refetchDashboard } = useQuery({
    queryKey: ['dashboard', format(startDate, 'yyyy-MM-dd'), format(endDate, 'yyyy-MM-dd')],
    queryFn: () => fetchDashboardData(format(startDate, 'yyyy-MM-dd'), format(endDate, 'yyyy-MM-dd'))
  });

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: () => fetchUsers().then(res => res.data)
  });

  const { data: approvedRooms } = useQuery({
    queryKey: ['chatrooms', 'approved'],
    queryFn: () => fetchChatRooms(true).then(res => res.data.rooms),
    enabled: showApproved
  });

  const { data: pendingRooms } = useQuery({
    queryKey: ['chatrooms', 'pending'],
    queryFn: () => fetchChatRooms(false).then(res => res.data.rooms),
    enabled: !showApproved
  });

  //处理用户封禁
  const handleBanUser = async (userId: number) => {
    try {
      const user = users?.find(u => u.id === userId);
      if (!user) return;

      const response = await apiClient<{ code: number; message: string }>({
        url: user.status === 'ACTIVE' ? `/users/${userId}/ban` : `/users/${userId}/unban`,
        method: 'PUT',
      });

      if (response.code === 200) {
        toast({
          title: user.status === 'ACTIVE' ? '封禁成功' : '解禁成功',
          description: user.status === 'ACTIVE' ? '用户已被封禁' : '用户已被解禁',
        });
        queryClient.invalidateQueries({ queryKey: ['users'] });
      }
    } catch (error) {
      toast({
        title: '操作失败',
        description: '请稍后重试',
        variant: 'destructive',
      });
    }
  };
  // const handleUnbanUser = async (userId: number) => {
  //   try {
  //     const response = await apiClient<{ code: number; message: string }>({
  //       url: `/users/${userId}/unban`,
  //       method: 'PUT',
  //     });
  //   } catch (error) {
  //     toast({
  //       title: '操作失败',
  //       description: '请稍后重试',
  //       variant: 'destructive',
  //     });
  //   }
  // }

  // 处理聊天室审核
  const handleApproveChatRoom = async (chatRoomId: number): Promise<void> => {
    try {
      console.log('批准聊天室请求头:', {
        url: `/chatrooms/${chatRoomId}/approve`,
        token: useUserStore.getState().token
      });
      await apiClient({
        url: `/chatrooms/${chatRoomId}/approve`,
        method: 'PUT',
        data: {
          approved: true
        }
      });
      toast({
        title: '操作成功',
        description: '聊天室已通过审核'
      });
      // 同时刷新两个列表
      queryClient.invalidateQueries({ queryKey: ['chatrooms'] });
    } catch (error) {
      toast({
        title: '操作失败',
        description: '请稍后重试',
        variant: 'destructive'
      });
    }
  };

  //过滤用户列表
  const filteredUsers = users?.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(userSearch.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && user.status === 'ACTIVE') ||
      (statusFilter === 'banned' && user.status === 'DISABLED');
    return matchesSearch && matchesStatus;
  });

  // 过滤聊天室列表
  const filteredChatRooms = (showApproved ? approvedRooms ?? [] : pendingRooms ?? []).filter(room => {
    return room.name.toLowerCase().includes(chatRoomSearch.toLowerCase());
  });

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value)
    // 将筛选值映射到后端状态
    const statusMap = {
      'active': 'ACTIVE',
      'banned': 'DISABLED'
    }
    setQueryParams(prev => ({
      ...prev,
      status: statusMap[value as keyof typeof statusMap] || undefined
    }))
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">后台管理</h1>
      
      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">数据仪表盘</TabsTrigger>
          <TabsTrigger value="users">用户管理</TabsTrigger>
          <TabsTrigger value="chatrooms">聊天室管理</TabsTrigger>
        </TabsList>

        {/* 数据仪表盘 */}
        <TabsContent value="dashboard" className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[240px] justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "yyyy-MM-dd") : "选择开始日期"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date: Date) => date && setStartDate(date)}
                    initialFocus
                    required
                  />
                </PopoverContent>
              </Popover>
              <span>至</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[240px] justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "yyyy-MM-dd") : "选择结束日期"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date: Date) => date && setEndDate(date)}
                    initialFocus
                    required
                  />
                </PopoverContent>
              </Popover>
            </div>
            <Button onClick={() => refetchDashboard()}>刷新数据</Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>总用户数</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{dashboardData?.totalUsers}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>总帖子数</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{dashboardData?.totalPosts}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>每日数据统计</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dashboardData?.dailyUserCounts.map((item, index) => ({
                    ...item,
                    postCount: dashboardData?.dailyPostCounts[index]?.count || 0
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => format(new Date(value), 'MM-dd')}
                    />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip 
                      labelFormatter={(value) => format(new Date(value), 'yyyy-MM-dd')}
                    />
                    <Legend />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="count" 
                      stroke="#8884d8" 
                      name="用户数" 
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="postCount" 
                      stroke="#82ca9d" 
                      name="帖子数" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 用户管理 */}
        <TabsContent value="users" className="space-y-4">
          <div className="flex gap-4">
            <Input
              placeholder="搜索用户..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="max-w-sm"
            />
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="选择状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                <SelectItem value="active">正常</SelectItem>
                <SelectItem value="banned">已封禁</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead className="[&_tr]:border-b">
                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <th className="h-12 px-4 text-left align-middle font-medium">用户名</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">状态</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">操作</th>
                    </tr>
                  </thead>
                  <tbody className="[&_tr:last-child]:border-0">
                    {filteredUsers?.map((user: UserManagement) => (
                      <tr key={user.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                        <td className="p-4 align-middle">{user.username}</td>
                        <td className="p-4 align-middle">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            user.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.status === 'ACTIVE' ? '正常' : '已封禁'}
                          </span>
                        </td>
                        <td className="p-4 align-middle">
                          <Button
                            variant={user.status === 'ACTIVE' ? "destructive" : "default"}
                            size="sm"
                            onClick={() => handleBanUser(user.id)}
                          >
                            {user.status === 'ACTIVE' ? '封禁' : '解禁'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 聊天室管理 */}
        <TabsContent value="chatrooms" className="space-y-4">
          <div className="flex items-center gap-4">
            <Input
              placeholder="搜索聊天室..."
              value={chatRoomSearch}
              onChange={(e) => setChatRoomSearch(e.target.value)}
              className="max-w-sm"
            />
            <div className="flex rounded-md shadow-sm">
              <Button
                variant={!showApproved ? "default" : "outline"}
                onClick={() => setShowApproved(false)}
                className="rounded-r-none"
              >
                待审核
              </Button>
              <Button
                variant={showApproved ? "default" : "outline"}
                onClick={() => setShowApproved(true)}
                className="rounded-l-none"
              >
                已审核
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead className="[&_tr]:border-b">
                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <th className="h-12 px-4 text-left align-middle font-medium">聊天室名称</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">成员数</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">创建时间</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">操作</th>
                    </tr>
                  </thead>
                  <tbody className="[&_tr:last-child]:border-0">
                    {filteredChatRooms?.map((room) => (
                      <tr key={room.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                        <td className="p-4 align-middle">{room.name}</td>
                        <td className="p-4 align-middle">{room.maxMembers}</td>
                        <td className="p-4 align-middle">{new Date(room.createdAt).toLocaleDateString()}</td>
                        <td className="p-4 align-middle">
                          {showApproved ? (
                            <span className="text-green-600">已通过</span>
                          ) : (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleApproveChatRoom(room.id)}
                            >
                              通过
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
