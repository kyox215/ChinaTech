// 简化的模拟数据

// 简化的客户接口
export interface SimpleCustomer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
}

// 简化的订单接口
export interface SimpleOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  deviceBrand: string;
  deviceModel: string;
  faultDescription: string;
  faultType: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  totalCost: number;
  technicianName: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

// 简化的用户接口
export interface SimpleUser {
  id: string;
  username: string;
  password: string;
  name: string;
  role: 'admin' | 'technician';
}

// 模拟客户数据
export const mockCustomers: SimpleCustomer[] = [
  {
    id: '1',
    name: '张三',
    phone: '13800138001',
    email: 'zhangsan@example.com',
    address: '北京市朝阳区望京街道'
  },
  {
    id: '2', 
    name: '李四',
    phone: '13800138002',
    email: 'lisi@example.com',
    address: '上海市浦东新区陆家嘴'
  },
  {
    id: '3',
    name: '王五',
    phone: '13800138003', 
    email: 'wangwu@example.com',
    address: '广州市天河区珠江新城'
  }
];

// 模拟用户数据
export const mockUsers: SimpleUser[] = [
  {
    id: '1',
    username: 'admin',
    password: 'admin123',
    name: '系统管理员',
    role: 'admin'
  },
  {
    id: '2',
    username: 'tech01',
    password: 'tech123',
    name: '李技师',
    role: 'technician'
  },
  {
    id: '3',
    username: 'tech02', 
    password: 'tech123',
    name: '王技师',
    role: 'technician'
  }
];

// 模拟订单数据
export const mockOrders: SimpleOrder[] = [
  {
    id: 'RP20250119001',
    customerName: '张三',
    customerPhone: '13800138001',
    deviceBrand: 'Apple',
    deviceModel: 'iPhone 15 Pro',
    faultDescription: '屏幕碎裂，触摸正常',
    faultType: 'screen',
    status: 'completed',
    totalCost: 1680,
    technicianName: '李技师',
    createdAt: '2025-01-17T09:30:00Z',
    updatedAt: '2025-01-17T16:45:00Z',
    notes: '已更换原装屏幕总成，测试正常'
  },
  {
    id: 'RP20250119002', 
    customerName: '李四',
    customerPhone: '13800138002',
    deviceBrand: 'Huawei',
    deviceModel: 'Mate 60 Pro',
    faultDescription: '电池续航差，充电慢',
    faultType: 'battery',
    status: 'in_progress',
    totalCost: 480,
    technicianName: '王技师',
    createdAt: '2025-01-18T14:20:00Z',
    updatedAt: '2025-01-19T10:15:00Z',
    notes: '正在更换电池，预计今日完成'
  },
  {
    id: 'RP20250119003',
    customerName: '王五',
    customerPhone: '13800138003',
    deviceBrand: 'Xiaomi',
    deviceModel: 'Mi 14 Pro',
    faultDescription: '无法开机，黑屏',
    faultType: 'motherboard',
    status: 'pending',
    totalCost: 850,
    technicianName: '',
    createdAt: '2025-01-19T11:45:00Z',
    updatedAt: '2025-01-19T11:45:00Z',
    notes: '等待技师接单检测'
  }
];

// 初始化模拟数据的函数
export const initializeMockData = () => {
  // 检查是否已经初始化过数据
  const existingOrders = localStorage.getItem('simpleOrders');
  const existingCustomers = localStorage.getItem('simpleCustomers');
  const existingUsers = localStorage.getItem('simpleUsers');
  
  if (!existingOrders) {
    localStorage.setItem('simpleOrders', JSON.stringify(mockOrders));
  }
  
  if (!existingCustomers) {
    localStorage.setItem('simpleCustomers', JSON.stringify(mockCustomers));
  }
  
  if (!existingUsers) {
    localStorage.setItem('simpleUsers', JSON.stringify(mockUsers));
  }
};

// 获取统计数据
export const getStatistics = () => {
  const orders = JSON.parse(localStorage.getItem('simpleOrders') || '[]') as SimpleOrder[];
  const today = new Date().toISOString().split('T')[0];
  
  const todayOrders = orders.filter(order => 
    order.createdAt.split('T')[0] === today
  );
  
  const completedOrders = orders.filter(order => order.status === 'completed');
  const totalRevenue = completedOrders.reduce((sum, order) => sum + order.totalCost, 0);
  const todayRevenue = todayOrders
    .filter(order => order.status === 'completed')
    .reduce((sum, order) => sum + order.totalCost, 0);
  
  return {
    totalOrders: orders.length,
    todayOrders: todayOrders.length,
    completedOrders: completedOrders.length,
    pendingOrders: orders.filter(order => order.status === 'pending').length,
    inProgressOrders: orders.filter(order => order.status === 'in_progress').length,
    totalRevenue,
    todayRevenue,
    completionRate: orders.length > 0 ? Math.round((completedOrders.length / orders.length) * 100) : 0
  };
};