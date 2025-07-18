'use client'

import { useState } from 'react'
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
  RefreshCw,
  User,
  Smartphone,
  Calendar,
  Euro,
  MessageSquare
} from 'lucide-react'
import toast from 'react-hot-toast'

// 模拟分配给技术员的订单
const mockAssignedOrders = [
  {
    id: '2',
    orderNumber: 'RT002',
    deviceBrand: 'Samsung',
    deviceModel: 'Galaxy S23',
    deviceImei: '987654321098765',
    issueDescription: 'Problemi di ricarica - non carica correttamente',
    status: 'REPAIRING',
    priority: 'HIGH',
    estimatedCost: 80.00,
    finalCost: null,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    customer: {
      id: '2',
      name: 'Maria Bianchi',
      email: 'maria@email.com',
      phone: '+39 331 123 4568'
    },
    technician: {
      id: '1',
      name: 'Marco Tecnini'
    }
  },
  {
    id: '5',
    orderNumber: 'ST005',
    deviceBrand: 'Samsung',
    deviceModel: 'Galaxy S22',
    deviceImei: '321654987321654',
    issueDescription: 'Fotocamera posteriore non funziona',
    status: 'READY_PICKUP',
    priority: 'NORMAL',
    estimatedCost: 90.00,
    finalCost: 85.00,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    customer: {
      id: '2',
      name: 'Maria Bianchi',
      email: 'maria@email.com',
      phone: '+39 331 123 4568'
    },
    technician: {
      id: '1',
      name: 'Marco Tecnini'
    }
  }
]

// 模拟可接取的订单
const mockAvailableOrders = [
  {
    id: '3',
    orderNumber: 'MT003',
    deviceBrand: 'Huawei',
    deviceModel: 'P50 Pro',
    deviceImei: '456789123456789',
    issueDescription: 'Dispositivo bagnato, non si accende',
    status: 'DIAGNOSING',
    priority: 'URGENT',
    estimatedCost: 120.00,
    finalCost: null,
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    customer: {
      id: '3',
      name: 'Luca Ferrari',
      email: 'luca@email.com',
      phone: '+39 331 123 4569'
    },
    technician: null
  },
  {
    id: '4',
    orderNumber: 'LT004',
    deviceBrand: 'Apple',
    deviceModel: 'iPhone 13',
    deviceImei: '789123456789123',
    issueDescription: 'Batteria si scarica rapidamente',
    status: 'RECEIVED',
    priority: 'LOW',
    estimatedCost: null,
    finalCost: null,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    customer: {
      id: '1',
      name: 'Giuseppe Verdi',
      email: 'giuseppe@email.com',
      phone: '+39 331 123 4567'
    },
    technician: null
  }
]

interface TechnicianStats {
  assignedOrders: number
  completedToday: number
  pendingOrders: number
  averageCompletionTime: number
}

export default function TechnicianDashboardDemo() {
  const { language } = useLanguage()
  const t = getTranslations(language)
  
  const [assignedOrders, setAssignedOrders] = useState(mockAssignedOrders)
  const [availableOrders, setAvailableOrders] = useState(mockAvailableOrders)
  const [activeTab, setActiveTab] = useState<'assigned' | 'available'>('assigned')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const stats: TechnicianStats = {
    assignedOrders: assignedOrders.length,
    completedToday: 1,
    pendingOrders: assignedOrders.filter(order => !['COMPLETED', 'DELIVERED'].includes(order.status)).length,
    averageCompletionTime: 2.5
  }

  const handlePickUpOrder = (orderId: string) => {
    const order = availableOrders.find(o => o.id === orderId)
    if (order) {
      // 模拟接取订单
      const updatedOrder = {
        ...order,
        status: 'DIAGNOSING',
        estimatedCost: order.estimatedCost || 0,
        technician: {
          id: '1',
          name: 'Marco Tecnini'
        }
      }
      setAssignedOrders([...assignedOrders, updatedOrder])
      setAvailableOrders(availableOrders.filter(o => o.id !== orderId))
      toast.success('订单接取成功')
    }
  }

  const handleStatusUpdate = (orderId: string, newStatus: string) => {
    setAssignedOrders(assignedOrders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ))
    toast.success('状态更新成功')
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

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* 移动端优化的顶部导航 */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">技术员工作台 - 演示模式</h1>
              <p className="text-sm text-gray-600">你好，Marco Tecnini（演示数据）</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                演示模式
              </div>
              <Button 
                size="sm" 
                variant="outline"
                className="flex items-center"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                刷新
              </Button>
            </div>
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