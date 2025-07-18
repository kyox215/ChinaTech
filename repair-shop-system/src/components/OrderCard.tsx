import React from 'react';
import { SimpleOrder } from '../lib/mockData';
import { Clock, User, Smartphone, AlertCircle, CheckCircle, XCircle, Pause } from 'lucide-react';

interface OrderCardProps {
  order: SimpleOrder;
  showActions?: boolean;
  onStatusChange?: (orderId: string, newStatus: SimpleOrder['status']) => void;
  onAssignTechnician?: (orderId: string) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ 
  order, 
  showActions = false, 
  onStatusChange, 
  onAssignTechnician 
}) => {
  const getStatusIcon = (status: SimpleOrder['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'in_progress':
        return <Pause className="w-5 h-5 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: SimpleOrder['status']) => {
    switch (status) {
      case 'pending':
        return '待处理';
      case 'in_progress':
        return '维修中';
      case 'completed':
        return '已完成';
      case 'cancelled':
        return '已取消';
      default:
        return '未知状态';
    }
  };

  const getStatusColor = (status: SimpleOrder['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getFaultTypeText = (faultType: string) => {
    const faultTypes: Record<string, string> = {
      'screen': '屏幕损坏',
      'battery': '电池老化',
      'camera': '摄像头故障', 
      'charging': '充电问题',
      'speaker': '扬声器故障',
      'water': '进水维修',
      'motherboard': '主板故障'
    };
    return faultTypes[faultType] || faultType;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      {/* 订单头部 */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{order.id}</h3>
          <p className="text-sm text-gray-500">创建时间：{formatDate(order.createdAt)}</p>
        </div>
        <div className={`px-3 py-1 rounded-full border text-sm font-medium flex items-center space-x-1 ${getStatusColor(order.status)}`}>
          {getStatusIcon(order.status)}
          <span>{getStatusText(order.status)}</span>
        </div>
      </div>

      {/* 客户和设备信息 */}
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">客户：</span>
            <span className="text-sm font-medium">{order.customerName}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">电话：</span>
            <span className="text-sm">{order.customerPhone}</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Smartphone className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">设备：</span>
            <span className="text-sm font-medium">{order.deviceBrand} {order.deviceModel}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">故障：</span>
            <span className="text-sm">{getFaultTypeText(order.faultType)}</span>
          </div>
        </div>
      </div>

      {/* 故障描述 */}
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-1">故障描述：</p>
        <p className="text-sm bg-gray-50 p-3 rounded-lg">{order.faultDescription}</p>
      </div>

      {/* 费用信息 */}
      <div className="grid grid-cols-1 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="text-center">
          <p className="text-xs text-gray-500">总费用</p>
          <p className="text-lg font-bold text-blue-600">¥{order.totalCost}</p>
        </div>
      </div>

      {/* 技师和时间信息 */}
      <div className="grid md:grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <span className="text-gray-600">负责技师：</span>
          <span className="ml-1 font-medium">
            {order.technicianName || '未分配'}
          </span>
        </div>
        <div>
          <span className="text-gray-600">预计时间：</span>
          <span className="ml-1">2-3小时</span>
        </div>
      </div>

      {/* 备注 */}
      {order.notes && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-1">维修备注：</p>
          <p className="text-sm text-gray-800">{order.notes}</p>
        </div>
      )}

      {/* 操作按钮 */}
      {showActions && (order.status === 'pending' || order.status === 'in_progress') && (
        <div className="border-t pt-4">
          <div className="flex flex-wrap gap-2">
            {order.status === 'pending' && (
              <>
                <button
                  onClick={() => onAssignTechnician?.(order.id)}
                  className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  分配技师
                </button>
                <button
                  onClick={() => onStatusChange?.(order.id, 'in_progress')}
                  className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  开始维修
                </button>
              </>
            )}
            
            {order.status === 'in_progress' && (
              <button
                onClick={() => onStatusChange?.(order.id, 'completed')}
                className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                完成维修
              </button>
            )}
            
            <button
              onClick={() => onStatusChange?.(order.id, 'cancelled')}
              className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              取消订单
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderCard;