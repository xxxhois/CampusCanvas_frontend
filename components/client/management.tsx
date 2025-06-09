'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { apiClient } from '@/lib/api-client'
import { useUserStore } from '@/stores/userStore'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

// 类型定义
interface DashboardData {
  totalUsers: number
  totalPosts: number
  dailyUserCounts: Array<{ date: string; count: number }>
  dailyPostCounts: Array<{ date: string; count: number }>
}

interface User {
  id: number
  username: string
  email: string
  status: 'active' | 'banned'
  createdAt: string
}

interface ChatRoom {
  id: number
  name: string
  status: 'pending' | 'approved' | 'rejected'
  memberCount: number
  createdAt: string
}

// 数据获取函数
const fetchDashboardData = async (): Promise<DashboardData> => {
  const res = await apiClient<{ data: DashboardData }>({
    url: '/admin/dashboard',
    method: 'GET'
  });
  return res.data;
};

const fetchUsers = async (): Promise<User[]> => {
  const res = await apiClient<{ data: User[] }>({
    url: '/admin/users',
    method: 'GET'
  });
  return res.data;
};

const fetchChatRooms = async (): Promise<ChatRoom[]> => {
  const res = await apiClient<{ data: ChatRoom[] }>({
    url: '/admin/chatrooms',
    method: 'GET'
  });
  return res.data;
};

export default function Management() {
  const router = useRouter();
  const { currentUser } = useUserStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [userSearch, setUserSearch] = useState('');
  const [userStatus, setUserStatus] = useState<string>('all');
  const [chatRoomSearch, setChatRoomSearch] = useState('');
  const [chatRoomStatus, setChatRoomStatus] = useState<string>('all');

  // 检查权限
  useEffect(() => {
    if (!currentUser) {
      router.push('/login');
      return;
    }
  }, [currentUser, router]);

  // 获取数据
  const { data: dashboardData } = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboardData
  });

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers
  });

  const { data: chatRooms } = useQuery({
    queryKey: ['chatrooms'],
    queryFn: fetchChatRooms
  });

  // 处理用户封禁
  const handleBanUser = async (userId: number) => {
    try {
      await apiClient({
        url: `/admin/users/${userId}/ban`,
        method: 'POST'
      });
      toast({
        title: '操作成功',
        description: '用户已被封禁'
      });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    } catch (error) {
      toast({
        title: '操作失败',
        description: '请稍后重试',
        variant: 'destructive'
      });
    }
  };

  // 处理聊天室审核
  const handleApproveChatRoom = async (chatRoomId: number) => {
    try {
      await apiClient({
        url: `/admin/chatrooms/${chatRoomId}/approve`,
        method: 'POST'
      });
      toast({
        title: '操作成功',
        description: '聊天室已通过审核'
      });
      queryClient.invalidateQueries({ queryKey: ['chatrooms'] });
    } catch (error) {
      toast({
        title: '操作失败',
        description: '请稍后重试',
        variant: 'destructive'
      });
    }
  };

  // 过滤用户列表
  const filteredUsers = users?.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(userSearch.toLowerCase()) ||
                         user.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchesStatus = userStatus === 'all' || user.status === userStatus;
    return matchesSearch && matchesStatus;
  });

  // 过滤聊天室列表
  const filteredChatRooms = chatRooms?.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(chatRoomSearch.toLowerCase());
    const matchesStatus = chatRoomStatus === 'all' || room.status === chatRoomStatus;
    return matchesSearch && matchesStatus;
  });

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
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dashboardData?.dailyUserCounts}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#8884d8" name="用户数" />
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
            <Select value={userStatus} onValueChange={setUserStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="选择状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
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
                      <th className="h-12 px-4 text-left align-middle font-medium">邮箱</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">状态</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">注册时间</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">操作</th>
                    </tr>
                  </thead>
                  <tbody className="[&_tr:last-child]:border-0">
                    {filteredUsers?.map((user) => (
                      <tr key={user.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                        <td className="p-4 align-middle">{user.username}</td>
                        <td className="p-4 align-middle">{user.email}</td>
                        <td className="p-4 align-middle">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.status === 'active' ? '正常' : '已封禁'}
                          </span>
                        </td>
                        <td className="p-4 align-middle">{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td className="p-4 align-middle">
                          {user.status === 'active' && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleBanUser(user.id)}
                            >
                              封禁
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

        {/* 聊天室管理 */}
        <TabsContent value="chatrooms" className="space-y-4">
          <div className="flex gap-4">
            <Input
              placeholder="搜索聊天室..."
              value={chatRoomSearch}
              onChange={(e) => setChatRoomSearch(e.target.value)}
              className="max-w-sm"
            />
            <Select value={chatRoomStatus} onValueChange={setChatRoomStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="选择状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="pending">待审核</SelectItem>
                <SelectItem value="approved">已通过</SelectItem>
                <SelectItem value="rejected">已拒绝</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead className="[&_tr]:border-b">
                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <th className="h-12 px-4 text-left align-middle font-medium">聊天室名称</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">成员数</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">状态</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">创建时间</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">操作</th>
                    </tr>
                  </thead>
                  <tbody className="[&_tr:last-child]:border-0">
                    {filteredChatRooms?.map((room) => (
                      <tr key={room.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                        <td className="p-4 align-middle">{room.name}</td>
                        <td className="p-4 align-middle">{room.memberCount}</td>
                        <td className="p-4 align-middle">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            room.status === 'approved' ? 'bg-green-100 text-green-800' :
                            room.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {room.status === 'approved' ? '已通过' :
                             room.status === 'pending' ? '待审核' : '已拒绝'}
                          </span>
                        </td>
                        <td className="p-4 align-middle">{new Date(room.createdAt).toLocaleDateString()}</td>
                        <td className="p-4 align-middle">
                          {room.status === 'pending' && (
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
