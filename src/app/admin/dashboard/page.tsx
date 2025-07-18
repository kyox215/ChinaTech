'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { OrderStatusTracker } from '@/components/OrderStatusTracker'
import { useLanguage } from '@/contexts/LanguageContext'
import { getTranslations } from '@/lib/translations'
import { formatPrice, formatDateTime } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/ui/data-table'
import { 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  Users, 
  ClipboardList, 
  Package, 
  TrendingUp,
  Settings,
  Plus,
  Search,
  Filter,
  Download,
  Wrench
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Order {
  id: string
  orderNumber: string
  deviceBrand: string
  deviceModel: string
  issueDescription: string
  status: string
  priority: string
  estimatedCost: number | null
  finalCost: number | null
  createdAt: string
  estimatedCompletion: string | null
  customer: {
    id: string
    name: string
    email: string
    phone: string
  }
  technician?: {
    id: string
    name: string
  }
}

interface DashboardStats {
  totalOrders: number
  pendingOrders: number
  completedOrders: number
  revenue: number
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { language } = useLanguage()
  const t = getTranslations(language)
  
  const [orders, setOrders] = useState<Order[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    revenue: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session || session.user.role !== 'ADMIN') {
      router.push('/auth/signin')
      return
    }

    fetchDashboardData()
  }, [session, status, router])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/orders')
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
        
        // 计算统计数据
        const totalOrders = data.orders?.length || 0
        const completedOrders = data.orders?.filter((order: Order) => 
          ['COMPLETED', 'DELIVERED'].includes(order.status)
        ).length || 0
        const pendingOrders = totalOrders - completedOrders
        const revenue = data.orders?.filter((order: Order) => 
          order.finalCost && ['COMPLETED', 'DELIVERED'].includes(order.status)
        ).reduce((sum: number, order: Order) => sum + (order.finalCost || 0), 0) || 0
        
        setStats({
          totalOrders,
          pendingOrders,
          completedOrders,
          revenue
        })
      }
    } catch (error) {
      console.error('获取仪表盘数据失败:', error)
      toast.error('获取数据失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        toast.success('订单状态更新成功')
        fetchDashboardData() // 重新获取数据
      } else {
        throw new Error('更新失败')
      }
    } catch (error) {
      console.error('更新订单状态失败:', error)
      toast.error('更新失败，请重试')
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'COMPLETED':
      case 'DELIVERED':
        return 'success'
      case 'REPAIRING':
      case 'TESTING':
        return 'warning'
      case 'RECEIVED':
      case 'DIAGNOSING':
        return 'info'
      case 'READY_PICKUP':
        return 'success'
      default:
        return 'secondary'
    }
  }

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'destructive'
      case 'HIGH':
        return 'warning'
      case 'NORMAL':
        return 'secondary'
      case 'LOW':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.deviceBrand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.deviceModel.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 头部 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">管理员仪表盘</h1>
          <p className="text-gray-600">欢迎回来，{session?.user?.name || '管理员'}</p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总订单数</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">所有订单</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">待处理订单</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingOrders}</div>
              <p className="text-xs text-muted-foreground">进行中的订单</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">已完成订单</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedOrders}</div>
              <p className="text-xs text-muted-foreground">成功完成</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总营收</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPrice(stats.revenue)}</div>
              <p className="text-xs text-muted-foreground">已完成订单</p>
            </CardContent>
          </Card>
        </div>

        {/* 快速操作 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>快速操作</CardTitle>
              <CardDescription>常用管理功能</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                创建新订单
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Users className="mr-2 h-4 w-4" />
                管理技术员
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Package className="mr-2 h-4 w-4" />
                库存管理
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                系统设置
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>今日概况</CardTitle>
              <CardDescription>今天的工作情况</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">新订单：</span>
                  <span className="font-medium">{orders.filter(order => {
                    const today = new Date().toDateString()
                    return new Date(order.createdAt).toDateString() === today
                  }).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">修复中：</span>
                  <span className="font-medium">{orders.filter(order => order.status === 'REPAIRING').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">可取件：</span>
                  <span className="font-medium">{orders.filter(order => order.status === 'READY_PICKUP').length}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>系统状态</CardTitle>
              <CardDescription>系统运行状态</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">数据库：</span>
                  <Badge variant="success">正常</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">API服务：</span>
                  <Badge variant="success">正常</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">在线技术员：</span>
                  <span className="font-medium">2</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 订单管理 */}
        <Card>
          <CardHeader>
            <CardTitle>订单管理</CardTitle>
            <CardDescription>查看和管理所有维修订单</CardDescription>
            
            {/* 搜索和过滤 */}
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="搜索订单号、客户、设备..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">所有状态</option>
                  <option value="RECEIVED">已接收</option>
                  <option value="DIAGNOSING">检测中</option>
                  <option value="REPAIRING">维修中</option>
                  <option value="TESTING">测试中</option>
                  <option value="COMPLETED">已完成</option>
                  <option value="READY_PICKUP">可取件</option>
                  <option value="DELIVERED">已交付</option>
                </select>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  导出
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-medium">订单号</th>
                    <th className="text-left p-4 font-medium">客户</th>
                    <th className="text-left p-4 font-medium">设备</th>
                    <th className="text-left p-4 font-medium">问题</th>
                    <th className="text-left p-4 font-medium">状态</th>
                    <th className="text-left p-4 font-medium">优先级</th>
                    <th className="text-left p-4 font-medium">技术员</th>
                    <th className="text-left p-4 font-medium">金额</th>
                    <th className="text-left p-4 font-medium">创建时间</th>
                    <th className="text-left p-4 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <div className="font-medium">{order.orderNumber}</div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="font-medium">{order.customer.name}</div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {order.customer.email}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Phone className="h-3 w-3 mr-1" />
                            {order.customer.phone}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <div className="font-medium">{order.deviceBrand}</div>
                          <div className="text-sm text-gray-500">{order.deviceModel}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm max-w-xs truncate" title={order.issueDescription}>
                          {order.issueDescription}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-2">
                          <Badge variant={getStatusBadgeVariant(order.status)}>
                            {t.orderStatus[order.status as keyof typeof t.orderStatus] || order.status}
                          </Badge>
                          <OrderStatusTracker currentStatus={order.status as any} size="sm" />
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant={getPriorityBadgeVariant(order.priority)}>
                          {order.priority}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          {order.technician ? order.technician.name : '未分配'}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          {order.finalCost ? (
                            <div className="font-medium">{formatPrice(order.finalCost)}</div>
                          ) : order.estimatedCost ? (
                            <div className="text-sm text-gray-500">估算: {formatPrice(order.estimatedCost)}</div>
                          ) : (
                            <div className="text-sm text-gray-400">待定</div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-gray-500">
                          {formatDateTime(order.createdAt)}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            查看
                          </Button>
                          <Button size="sm" variant="outline">
                            编辑
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredOrders.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  暂无订单数据
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}