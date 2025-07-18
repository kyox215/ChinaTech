import { useState, useEffect } from 'react';
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer
} from 'recharts';
import {
  Users,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Calendar,
  Award
} from 'lucide-react';
import { useAuth } from '../lib/auth';
import { getStatistics, SimpleOrder, mockOrders } from '../lib/mockData';
import OrderCard from '../components/OrderCard';
import StatCard from '../components/StatCard';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<SimpleOrder[]>([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    todayOrders: 0,
    completedOrders: 0,
    pendingOrders: 0,
    inProgressOrders: 0,
    totalRevenue: 0,
    todayRevenue: 0,
    completionRate: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const allOrders = JSON.parse(localStorage.getItem('simpleOrders') || JSON.stringify(mockOrders)) as SimpleOrder[];
    setOrders(allOrders);
    
    const statistics = getStatistics();
    setStats(statistics);
  };

  const handleStatusChange = (orderId: string, newStatus: SimpleOrder['status']) => {
    const allOrders = JSON.parse(localStorage.getItem('simpleOrders') || JSON.stringify(mockOrders)) as SimpleOrder[];
    const updatedOrders = allOrders.map(order => {
      if (order.id === orderId) {
        return {
          ...order,
          status: newStatus,
          updatedAt: new Date().toISOString()
        };
      }
      return order;
    });
    
    localStorage.setItem('simpleOrders', JSON.stringify(updatedOrders));
    loadData();
  };

  const handleAssignTechnician = (orderId: string) => {
    // 简化版本，直接分配给默认技师
    const allOrders = JSON.parse(localStorage.getItem('simpleOrders') || JSON.stringify(mockOrders)) as SimpleOrder[];
    const updatedOrders = allOrders.map(order => {
      if (order.id === orderId) {
        return {
          ...order,
          technicianName: '李技师', // 默认分配
          status: 'in_progress' as const,
          updatedAt: new Date().toISOString()
        };
      }
      return order;
    });
    
    localStorage.setItem('simpleOrders', JSON.stringify(updatedOrders));
    loadData();
  };

  // 统计数据处理
  const statusData = [
    { name: '待处理', value: stats.pendingOrders, color: '#f59e0b' },
    { name: '进行中', value: stats.inProgressOrders, color: '#3b82f6' },
    { name: '已完成', value: stats.completedOrders, color: '#10b981' },
  ];

  const recentOrders = orders
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const pendingOrders = orders.filter(o => o.status === 'pending');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面头部 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">管理员后台</h1>
          <p className="text-gray-600 mt-2">欢迎，{user?.name}！管理您的维修业务</p>
        </div>

        {/* 概览统计 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="总订单数"
            value={stats.totalOrders}
            icon={ShoppingCart}
            color="blue"
            description="全部订单数量"
          />
          <StatCard
            title="今日订单"
            value={stats.todayOrders}
            icon={Calendar}
            color="green"
            description="今日新增订单"
          />
          <StatCard
            title="总营收"
            value={`¥${stats.totalRevenue}`}
            icon={DollarSign}
            color="purple"
            description="累计营業收入"
          />
          <StatCard
            title="完成率"
            value={`${stats.completionRate}%`}
            icon={Award}
            color="orange"
            description="订单完成率"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* 左侧区域 */}
          <div className="lg:col-span-2 space-y-8">
            {/* 订单状态统计 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">订单状态分布</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 待处理订单 */}
            {pendingOrders.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-orange-500" />
                  待处理订单 ({pendingOrders.length})
                </h3>
                <div className="space-y-4">
                  {pendingOrders.slice(0, 3).map(order => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      showActions={true}
                      onStatusChange={handleStatusChange}
                      onAssignTechnician={handleAssignTechnician}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 右侧区域 */}
          <div className="space-y-8">
            {/* 快速操作 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">快速操作</h3>
              <div className="space-y-3">
                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                  新增订单
                </button>
                <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                  导出报表
                </button>
                <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors">
                  系统设置
                </button>
              </div>
            </div>

            {/* 最近订单 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">最近订单</h3>
              <div className="space-y-3">
                {recentOrders.map(order => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{order.id}</p>
                      <p className="text-xs text-gray-500">{order.customerName}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {order.status === 'pending' && <Clock className="w-4 h-4 text-orange-500" />}
                      {order.status === 'in_progress' && <AlertCircle className="w-4 h-4 text-blue-500" />}
                      {order.status === 'completed' && <CheckCircle className="w-4 h-4 text-green-500" />}
                      {order.status === 'cancelled' && <XCircle className="w-4 h-4 text-red-500" />}
                      <span className="text-sm font-medium">¥{order.totalCost}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 系统状态 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">系统状态</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">在线技师</span>
                  <span className="text-sm font-medium text-green-600">3/5</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">系统负载</span>
                  <span className="text-sm font-medium text-blue-600">78%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">平均响应</span>
                  <span className="text-sm font-medium text-purple-600">120ms</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;