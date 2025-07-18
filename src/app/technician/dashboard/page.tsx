'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { OrderStatusTracker } from '@/components/OrderStatusTracker'
import { useLanguage } from '@/contexts/LanguageContext'
import { getTranslations } from '@/lib/translations'
import { formatPrice, formatDateTime, generateWhatsAppLink } from '@/lib/utils'
import { 
  Phone, 
  MessageCircle, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  Wrench,
  Search,
  Filter,
  RefreshCw,
  User,
  Smartphone,
  Calendar,
  Euro,
  MessageSquare
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Order {
  id: string
  orderNumber: string
  deviceBrand: string
  deviceModel: string
  deviceImei?: string
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

interface TechnicianStats {
  assignedOrders: number
  completedToday: number
  pendingOrders: number
  averageCompletionTime: number
}

export default function TechnicianDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { language } = useLanguage()
  const t = getTranslations(language)
  
  const [assignedOrders, setAssignedOrders] = useState<Order[]>([])
  const [availableOrders, setAvailableOrders] = useState<Order[]>([])
  const [stats, setStats] = useState<TechnicianStats>({
    assignedOrders: 0,
    completedToday: 0,
    pendingOrders: 0,
    averageCompletionTime: 0
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'assigned' | 'available'>('assigned')
  const [statusFilter, setStatusFilter] = useState('ALL')

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session || session.user.role !== 'TECHNICIAN') {
      router.push('/auth/signin')
      return
    }

    fetchTechnicianData()
  }, [session, status, router])

  const fetchTechnicianData = async () => {
    try {
      // 获取分配给技术员的订单
      const assignedResponse = await fetch('/api/orders?technician=me')
      if (assignedResponse.ok) {
        const assignedData = await assignedResponse.json()
        setAssignedOrders(assignedData.orders || [])
        
        // 计算统计数据
        const today = new Date().toDateString()
        const completedToday = assignedData.orders?.filter((order: Order) => 
          ['COMPLETED', 'DELIVERED'].includes(order.status) &&
          new Date(order.createdAt).toDateString() === today
        ).length || 0
        
        const pendingOrders = assignedData.orders?.filter((order: Order) => 
          !['COMPLETED', 'DELIVERED'].includes(order.status)
        ).length || 0
        
        setStats({
          assignedOrders: assignedData.orders?.length || 0,
          completedToday,
          pendingOrders,
          averageCompletionTime: 2.5 // 示例数据
        })
      }
      
      // 获取可接取的订单（未分配技术员的订单）
      const availableResponse = await fetch('/api/orders?unassigned=true')
      if (availableResponse.ok) {
        const availableData = await availableResponse.json()
        setAvailableOrders(availableData.orders || [])
      }
    } catch (error) {
      console.error('获取技术员数据失败:', error)
      toast.error('获取数据失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handlePickUpOrder = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          technicianId: session?.user?.id,
          status: 'DIAGNOSING'
        }),
      })

      if (response.ok) {
        toast.success('订单接取成功')
        fetchTechnicianData() // 重新获取数据
      } else {
        throw new Error('接取失败')
      }
    } catch (error) {
      console.error('接取订单失败:', error)
      toast.error('接取失败，请重试')
    }
  }

  const handleStatusUpdate = async (orderId: string, newStatus: string, notes?: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status: newStatus,
          notes
        }),
      })

      if (response.ok) {
        toast.success('状态更新成功')
        fetchTechnicianData() // 重新获取数据
      } else {
        throw new Error('更新失败')
      }
    } catch (error) {
      console.error('更新订单状态失败:', error)
      toast.error('更新失败，请重试')
    }
  }

  const getNextStatus = (currentStatus: string) => {
    const statusFlow = {
      'RECEIVED': 'DIAGNOSING',
      'DIAGNOSING': 'REPAIRING',
      'REPAIRING': 'TESTING',
      'TESTING': 'COMPLETED',
      'COMPLETED': 'READY_PICKUP'
    }
    return statusFlow[currentStatus as keyof typeof statusFlow]
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

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'HIGH':
        return <Clock className="h-4 w-4 text-orange-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const filteredOrders = (activeTab === 'assigned' ? assignedOrders : availableOrders).filter(order => {
    if (statusFilter === 'ALL') return true
    return order.status === statusFilter
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* 移动端优化的顶部导航 */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">技术员工作台</h1>
              <p className="text-sm text-gray-600">你好，{session?.user?.name}</p>
            </div>
            <Button 
              size="sm" 
              variant="outline"
              onClick={fetchTechnicianData}
              className="flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              刷新
            </Button>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* 统计卡片 - 移动端优化 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Wrench className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-xs text-gray-600">分配给我</p>
                  <p className="text-lg font-bold">{stats.assignedOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-xs text-gray-600">今日完成</p>
                  <p className="text-lg font-bold">{stats.completedToday}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-xs text-gray-600">待处理</p>
                  <p className="text-lg font-bold">{stats.pendingOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-xs text-gray-600">平均时长</p>
                  <p className="text-lg font-bold">{stats.averageCompletionTime}天</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tab切换 */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('assigned')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'assigned'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            我的订单 ({assignedOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('available')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'available'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            可接取订单 ({availableOrders.length})
          </button>
        </div>

        {/* 过滤器 */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">
            {activeTab === 'assigned' ? '我的订单' : '可接取订单'}
          </h2>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">所有状态</option>
            <option value="RECEIVED">已接收</option>
            <option value="DIAGNOSING">检测中</option>
            <option value="REPAIRING">维修中</option>
            <option value="TESTING">测试中</option>
            <option value="COMPLETED">已完成</option>
            <option value="READY_PICKUP">可取件</option>
          </select>
        </div>

        {/* 订单列表 - 移动端优化 */}
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="">
              <CardContent className="p-4">
                {/* 订单头部信息 */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Badge variant={getStatusBadgeVariant(order.status)} className="text-xs">
                      {t.orderStatus[order.status as keyof typeof t.orderStatus] || order.status}
                    </Badge>
                    {getPriorityIcon(order.priority)}
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">{order.orderNumber}</div>
                    <div className="text-xs text-gray-500">
                      {formatDateTime(order.createdAt)}
                    </div>
                  </div>
                </div>

                {/* 设备信息 */}
                <div className="flex items-center space-x-3 mb-3">
                  <Smartphone className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="font-medium">{order.deviceBrand} {order.deviceModel}</div>
                    {order.deviceImei && (
                      <div className="text-sm text-gray-500">IMEI: {order.deviceImei}</div>
                    )}
                  </div>
                </div>

                {/* 问题描述 */}
                <div className="mb-3">
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {order.issueDescription}
                  </p>
                </div>

                {/* 客户信息 */}
                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="font-medium text-sm">{order.customer.name}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <a 
                      href={`tel:${order.customer.phone}`}
                      className="flex items-center space-x-1 text-blue-600 text-sm"
                    >
                      <Phone className="h-3 w-3" />
                      <span>拨打电话</span>
                    </a>
                    <a 
                      href={generateWhatsAppLink(order.customer.phone, `您好！关于您的维修订单 ${order.orderNumber}`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 text-green-600 text-sm"
                    >
                      <MessageCircle className="h-3 w-3" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>

                {/* 价格信息 */}
                {(order.estimatedCost || order.finalCost) && (
                  <div className="flex items-center space-x-2 mb-3">
                    <Euro className="h-4 w-4 text-gray-400" />
                    {order.finalCost ? (
                      <span className="font-medium">{formatPrice(order.finalCost)}</span>
                    ) : (
                      <span className="text-sm text-gray-600">估算: {formatPrice(order.estimatedCost!)}</span>
                    )}
                  </div>
                )}

                {/* 状态追踪 */}
                <div className="mb-4">
                  <OrderStatusTracker currentStatus={order.status as any} size="sm" />
                </div>

                {/* 操作按钮 */}
                <div className="flex space-x-2">
                  {activeTab === 'available' ? (
                    <Button
                      onClick={() => handlePickUpOrder(order.id)}
                      className="flex-1"
                      size="sm"
                    >
                      <Wrench className="h-4 w-4 mr-1" />
                      接取订单
                    </Button>
                  ) : (
                    <>
                      {getNextStatus(order.status) && (
                        <Button
                          onClick={() => handleStatusUpdate(order.id, getNextStatus(order.status)!)}
                          className="flex-1"
                          size="sm"
                        >
                          推进至下一阶段
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="px-3"
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredOrders.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-gray-500">
                  {activeTab === 'assigned' ? '暂无分配的订单' : '暂无可接取的订单'}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}