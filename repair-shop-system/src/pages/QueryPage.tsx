import { useState } from 'react';
import { Search, Phone, Calendar, User, Smartphone, Clock, AlertCircle, CheckCircle, XCircle, Pause } from 'lucide-react';
import { SimpleOrder, SimpleCustomer, mockOrders, mockCustomers } from '../lib/mockData';

const QueryPage = () => {
  const [queryType, setQueryType] = useState<'orderNumber' | 'phone'>('orderNumber');
  const [searchValue, setSearchValue] = useState('');
  const [searchResults, setSearchResults] = useState<{ order: SimpleOrder; customer: SimpleCustomer }[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  const handleSearch = async () => {
    if (!searchValue.trim()) {
      setSearchError('请输入查询内容');
      return;
    }

    setIsSearching(true);
    setSearchError('');
    setSearchResults([]);

    try {
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 800));

      const orders = JSON.parse(localStorage.getItem('simpleOrders') || JSON.stringify(mockOrders)) as SimpleOrder[];
      const customers = JSON.parse(localStorage.getItem('simpleCustomers') || JSON.stringify(mockCustomers)) as SimpleCustomer[];
      
      let filteredOrders: SimpleOrder[] = [];
      
      if (queryType === 'orderNumber') {
        filteredOrders = orders.filter(order => 
          order.id.toLowerCase().includes(searchValue.trim().toLowerCase())
        );
      } else {
        filteredOrders = orders.filter(order => 
          order.customerPhone.includes(searchValue.trim())
        );
      }

      if (filteredOrders.length === 0) {
        setSearchError('未找到相关订单，请检查输入信息是否正确');
      } else {
        const results = filteredOrders.map(order => {
          const customer = customers.find(c => c.phone === order.customerPhone) || {
            id: '1',
            name: order.customerName,
            phone: order.customerPhone,
            address: '未知地址'
          };
          return { order, customer };
        }).sort((a, b) => new Date(b.order.createdAt).getTime() - new Date(a.order.createdAt).getTime());
        
        setSearchResults(results);
      }
    } catch (error) {
      setSearchError('查询失败，请稍后重试');
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面头部 */}
        <div className="text-center mb-12">
          <Search className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">订单查询</h1>
          <p className="text-xl text-gray-600">输入订单号或手机号快速查询维修进度</p>
        </div>

        {/* 查询表单 */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="space-y-6">
            {/* 查询类型选择 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">查询方式</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    setQueryType('orderNumber');
                    setSearchValue('');
                    setSearchResults([]);
                    setSearchError('');
                  }}
                  className={`p-4 border rounded-lg text-left transition-all ${
                    queryType === 'orderNumber'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5" />
                    <div>
                      <div className="font-medium">订单号查询</div>
                      <div className="text-sm text-gray-500">输入完整的订单号码</div>
                    </div>
                  </div>
                </button>
                
                <button
                  onClick={() => {
                    setQueryType('phone');
                    setSearchValue('');
                    setSearchResults([]);
                    setSearchError('');
                  }}
                  className={`p-4 border rounded-lg text-left transition-all ${
                    queryType === 'phone'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5" />
                    <div>
                      <div className="font-medium">手机号查询</div>
                      <div className="text-sm text-gray-500">输入留留的手机号码</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* 输入框 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {queryType === 'orderNumber' ? '订单号' : '手机号'}
              </label>
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => {
                    setSearchValue(e.target.value);
                    setSearchError('');
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder={
                    queryType === 'orderNumber' 
                      ? '请输入订单号，如：RP20250119001' 
                      : '请输入手机号，如：13800138001'
                  }
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isSearching}
                />
                <button
                  onClick={handleSearch}
                  disabled={isSearching || !searchValue.trim()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  <Search className="w-5 h-5" />
                  <span>{isSearching ? '查询中...' : '查询'}</span>
                </button>
              </div>
            </div>

            {/* 错误信息 */}
            {searchError && (
              <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                <AlertCircle className="w-5 h-5" />
                <span>{searchError}</span>
              </div>
            )}
          </div>
        </div>

        {/* 查询结果 */}
        {searchResults.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              查询结果 ({searchResults.length} 条订单)
            </h2>
            
            <div className="grid gap-6">
              {searchResults.map(({ order, customer }) => (
                <div key={order.id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="p-6">
                    {/* 订单头部 */}
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">{order.id}</h3>
                        <p className="text-sm text-gray-500">创建时间：{formatDate(order.createdAt)}</p>
                      </div>
                      <div className={`px-4 py-2 rounded-full border text-sm font-medium flex items-center space-x-2 ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span>{getStatusText(order.status)}</span>
                      </div>
                    </div>

                    {/* 订单信息 */}
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* 客户信息 */}
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                          <User className="w-4 h-4" />
                          <span>客户信息</span>
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">姓名：</span>
                            <span className="font-medium">{customer.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">电话：</span>
                            <span>{customer.phone}</span>
                          </div>
                          {customer.address && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">地址：</span>
                              <span className="text-right max-w-48 truncate">{customer.address}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 设备信息 */}
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                          <Smartphone className="w-4 h-4" />
                          <span>设备信息</span>
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">设备：</span>
                            <span className="font-medium">{order.deviceBrand} {order.deviceModel}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">故障类型：</span>
                            <span>{getFaultTypeText(order.faultType)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">维修费用：</span>
                            <span className="font-semibold text-blue-600">¥{order.totalCost}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 故障描述 */}
                    <div className="mt-6">
                      <h4 className="font-medium text-gray-900 mb-2">故障描述</h4>
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                        {order.faultDescription}
                      </p>
                    </div>

                    {/* 维修进度 */}
                    <div className="mt-6">
                      <h4 className="font-medium text-gray-900 mb-3">维修进度</h4>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">负责技师：</span>
                        <span className="font-medium">{order.technicianName || '未分配'}</span>
                      </div>
                      {order.notes && (
                        <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-800">{order.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 示例信息 */}
        {searchResults.length === 0 && !searchError && (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="mb-6">
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-600 mb-2">请选择查询方式并输入信息</h3>
              <p className="text-gray-500">支持订单号和手机号两种查询方式</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">示例订单号</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>RP20250119001</li>
                  <li>RP20250119002</li>
                  <li>RP20250119003</li>
                </ul>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">示例手机号</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>13800138001</li>
                  <li>13800138002</li>
                  <li>13800138003</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QueryPage;