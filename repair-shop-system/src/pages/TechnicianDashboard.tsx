import { useState, useEffect } from 'react';
import { 
  Home, 
  ClipboardList, 
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Smartphone,
  Star
} from 'lucide-react';
import { useAuth } from '../lib/auth';
import { SimpleOrder, mockOrders } from '../lib/mockData';
import OrderCard from '../components/OrderCard';
import StatCard from '../components/StatCard';

const TechnicianDashboard = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<SimpleOrder[]>([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    inProgress: 0,
    completed: 0,
    pending: 0
  });

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = () => {
    if (!user) return;
    
    const allOrders = JSON.parse(localStorage.getItem('simpleOrders') || JSON.stringify(mockOrders)) as SimpleOrder[];
    const techOrders = allOrders.filter(o => o.technicianName === user.name || o.technicianName === '');
    
    setOrders(techOrders);
    
    const totalOrders = techOrders.length;
    const inProgress = techOrders.filter(o => o.status === 'in_progress').length;
    const completed = techOrders.filter(o => o.status === 'completed').length;
    const pending = techOrders.filter(o => o.status === 'pending').length;
    
    setStats({
      totalOrders,
      inProgress,
      completed,
      pending
    });
  };

  const handleStatusChange = (orderId: string, newStatus: SimpleOrder['status']) => {
    const allOrders = JSON.parse(localStorage.getItem('simpleOrders') || JSON.stringify(mockOrders)) as SimpleOrder[];
    const updatedOrders = allOrders.map(order => {
      if (order.id === orderId) {
        return {
          ...order,
          status: newStatus,
          technicianName: user?.name || '',
          updatedAt: new Date().toISOString()
        };
      }
      return order;
    });
    
    localStorage.setItem('simpleOrders', JSON.stringify(updatedOrders));
    loadData();
  };

  const handleAssignTechnician = (orderId: string) => {
    handleStatusChange(orderId, 'in_progress');
  };

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const inProgressOrders = orders.filter(o => o.status === 'in_progress');
  const completedOrders = orders.filter(o => o.status === 'completed');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面头部 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">技师工作台</h1>
          <p className="text-gray-600 mt-2">欢迎，{user?.name}！管理您的维修订单</p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="总订单"
            value={stats.totalOrders}
            icon={ClipboardList}
            color="blue"
            description="分配给您的订单"
          />
          <StatCard
            title="待处理"
            value={stats.pending}
            icon={Clock}
            color="orange"
            description="等待接单的订单"
          />
          <StatCard
            title="进行中"
            value={stats.inProgress}
            icon={AlertCircle}
            color="purple"
            description="正在维修的订单"
          />
          <StatCard
            title="已完成"
            value={stats.completed}
            icon={CheckCircle}
            color="green"
            description="已经完成的订单"
          />
        </div>

        {/* 订单列表 */}
        <div className="space-y-8">
          {/* 待处理订单 */}
          {pendingOrders.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-orange-500" />
                待处理订单 ({pendingOrders.length})
              </h2>
              <div className="grid gap-4">
                {pendingOrders.map(order => (
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

          {/* 进行中订单 */}
          {inProgressOrders.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 text-blue-500" />
                进行中订单 ({inProgressOrders.length})
              </h2>
              <div className="grid gap-4">
                {inProgressOrders.map(order => (
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

          {/* 已完成订单 */}
          {completedOrders.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                已完成订单 ({completedOrders.length})
              </h2>
              <div className="grid gap-4">
                {completedOrders.slice(0, 5).map(order => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    showActions={false}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 空状态 */}
          {orders.length === 0 && (
            <div className="text-center py-12">
              <ClipboardList className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-600 mb-2">暂无订单</h3>
              <p className="text-gray-500">您目前没有分配的订单，请等待管理员分配</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TechnicianDashboard;