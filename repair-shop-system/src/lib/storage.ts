// 本地存储管理
export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  vipLevel: number;
  createdAt: string;
}

export interface DeviceType {
  id: string;
  brand: string;
  model: string;
  series?: string;
  storageCapacity?: string;
  color?: string;
  marketPrice?: number;
}

export interface RepairCategory {
  id: string;
  name: string;
  description?: string;
  basePrice: number;
  estimatedTimeHours: number;
  difficultyLevel: number;
  isActive: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  deviceTypeId?: string;
  deviceModel: string;
  issueDescription: string;
  status: OrderStatus;
  estimatedCost?: number;
  finalCost?: number;
  technicianId?: string;
  priority: number;
  expectedCompletion?: string;
  notes?: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus = 
  | 'pending'
  | 'quoted'
  | 'approved'
  | 'in_progress'
  | 'testing'
  | 'completed'
  | 'delivered'
  | 'cancelled';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'technician' | 'customer';
  phone?: string;
  skills?: string[];
  avatarUrl?: string;
}

export interface StatusHistory {
  id: string;
  orderId: string;
  status: OrderStatus;
  notes?: string;
  createdBy: string;
  createdAt: string;
}

export interface RepairLog {
  id: string;
  orderId: string;
  technicianId: string;
  action: string;
  notes?: string;
  images: string[];
  createdAt: string;
}

class LocalStorage {
  private getItem<T>(key: string): T[] {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : [];
    } catch {
      return [];
    }
  }

  private setItem<T>(key: string, data: T[]): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  // Customers
  getCustomers(): Customer[] {
    return this.getItem<Customer>('customers');
  }

  setCustomers(customers: Customer[]): void {
    this.setItem('customers', customers);
  }

  addCustomer(customer: Omit<Customer, 'id' | 'createdAt'>): Customer {
    const customers = this.getCustomers();
    const newCustomer: Customer = {
      ...customer,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    customers.push(newCustomer);
    this.setCustomers(customers);
    return newCustomer;
  }

  getCustomerById(id: string): Customer | undefined {
    return this.getCustomers().find(c => c.id === id);
  }

  getCustomerByPhone(phone: string): Customer | undefined {
    return this.getCustomers().find(c => c.phone === phone);
  }

  // Device Types
  getDeviceTypes(): DeviceType[] {
    return this.getItem<DeviceType>('deviceTypes');
  }

  setDeviceTypes(deviceTypes: DeviceType[]): void {
    this.setItem('deviceTypes', deviceTypes);
  }

  // Repair Categories
  getRepairCategories(): RepairCategory[] {
    return this.getItem<RepairCategory>('repairCategories');
  }

  setRepairCategories(categories: RepairCategory[]): void {
    this.setItem('repairCategories', categories);
  }

  // Orders
  getOrders(): Order[] {
    return this.getItem<Order>('orders');
  }

  setOrders(orders: Order[]): void {
    this.setItem('orders', orders);
  }

  addOrder(order: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>): Order {
    const orders = this.getOrders();
    const newOrder: Order = {
      ...order,
      id: crypto.randomUUID(),
      orderNumber: this.generateOrderNumber(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    orders.push(newOrder);
    this.setOrders(orders);
    this.addStatusHistory({
      orderId: newOrder.id,
      status: newOrder.status,
      notes: '订单已创建',
      createdBy: 'system'
    });
    return newOrder;
  }

  updateOrder(id: string, updates: Partial<Order>): Order | null {
    const orders = this.getOrders();
    const index = orders.findIndex(o => o.id === id);
    if (index === -1) return null;
    
    const oldStatus = orders[index].status;
    orders[index] = {
      ...orders[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    // 如果状态发生变化，记录状态历史
    if (updates.status && updates.status !== oldStatus) {
      this.addStatusHistory({
        orderId: id,
        status: updates.status,
        notes: `状态从 ${oldStatus} 更新为 ${updates.status}`,
        createdBy: updates.technicianId || 'system'
      });
    }
    
    this.setOrders(orders);
    return orders[index];
  }

  getOrderById(id: string): Order | undefined {
    return this.getOrders().find(o => o.id === id);
  }

  getOrderByNumber(orderNumber: string): Order | undefined {
    return this.getOrders().find(o => o.orderNumber === orderNumber);
  }

  getOrdersByCustomer(customerId: string): Order[] {
    return this.getOrders().filter(o => o.customerId === customerId);
  }

  getOrdersByTechnician(technicianId: string): Order[] {
    return this.getOrders().filter(o => o.technicianId === technicianId);
  }

  private generateOrderNumber(): string {
    const timestamp = Date.now().toString().slice(-8);
    return `WX${timestamp}`;
  }

  // Users
  getUsers(): User[] {
    return this.getItem<User>('users');
  }

  setUsers(users: User[]): void {
    this.setItem('users', users);
  }

  getUserById(id: string): User | undefined {
    return this.getUsers().find(u => u.id === id);
  }

  getUsersByRole(role: User['role']): User[] {
    return this.getUsers().filter(u => u.role === role);
  }

  // Status History
  getStatusHistory(): StatusHistory[] {
    return this.getItem<StatusHistory>('statusHistory');
  }

  setStatusHistory(history: StatusHistory[]): void {
    this.setItem('statusHistory', history);
  }

  addStatusHistory(history: Omit<StatusHistory, 'id' | 'createdAt'>): StatusHistory {
    const statusHistories = this.getStatusHistory();
    const newHistory: StatusHistory = {
      ...history,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    statusHistories.push(newHistory);
    this.setStatusHistory(statusHistories);
    return newHistory;
  }

  getStatusHistoryByOrder(orderId: string): StatusHistory[] {
    return this.getStatusHistory()
      .filter(h => h.orderId === orderId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Repair Logs
  getRepairLogs(): RepairLog[] {
    return this.getItem<RepairLog>('repairLogs');
  }

  setRepairLogs(logs: RepairLog[]): void {
    this.setItem('repairLogs', logs);
  }

  addRepairLog(log: Omit<RepairLog, 'id' | 'createdAt'>): RepairLog {
    const logs = this.getRepairLogs();
    const newLog: RepairLog = {
      ...log,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    logs.push(newLog);
    this.setRepairLogs(logs);
    return newLog;
  }

  getRepairLogsByOrder(orderId: string): RepairLog[] {
    return this.getRepairLogs()
      .filter(l => l.orderId === orderId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // 清空所有数据
  clearAll(): void {
    const keys = ['customers', 'deviceTypes', 'repairCategories', 'orders', 'users', 'statusHistory', 'repairLogs'];
    keys.forEach(key => localStorage.removeItem(key));
  }

  // 初始化演示数据
  initDemoData(): void {
    // 如果已有数据则不重复初始化
    if (this.getUsers().length > 0) return;

    // 初始化用户
    const users: User[] = [
      {
        id: 'admin-1',
        name: '系统管理员',
        email: 'admin@repair.com',
        role: 'admin',
        phone: '13800138000'
      },
      {
        id: 'tech-1',
        name: '张师傅',
        email: 'zhang@repair.com',
        role: 'technician',
        phone: '13800138001',
        skills: ['iPhone维修', '华为维修', '屏幕更换', '主板维修']
      },
      {
        id: 'tech-2',
        name: '李技师',
        email: 'li@repair.com',
        role: 'technician',
        phone: '13800138002',
        skills: ['小米维修', 'OPPO维修', '电池更换', '摄像头维修']
      },
      {
        id: 'tech-3',
        name: '王工程师',
        email: 'wang@repair.com',
        role: 'technician',
        phone: '13800138003',
        skills: ['三星维修', 'vivo维修', '数据恢复', '系统刷机']
      }
    ];
    this.setUsers(users);

    // 初始化客户
    const customers: Customer[] = [
      {
        id: 'cust-1',
        name: '陈先生',
        phone: '13912345678',
        email: 'chen@example.com',
        address: '北京市朝阳区CBD商务区',
        vipLevel: 1,
        createdAt: new Date('2024-01-15').toISOString()
      },
      {
        id: 'cust-2',
        name: '林女士',
        phone: '13987654321',
        email: 'lin@example.com',
        address: '上海市浦东新区陆家嘴',
        vipLevel: 2,
        createdAt: new Date('2024-02-20').toISOString()
      },
      {
        id: 'cust-3',
        name: '刘先生',
        phone: '13666666666',
        email: 'liu@example.com',
        address: '深圳市南山区科技园',
        vipLevel: 0,
        createdAt: new Date('2024-03-10').toISOString()
      },
      {
        id: 'cust-4',
        name: '赵女士',
        phone: '13888888888',
        email: 'zhao@example.com',
        address: '广州市天河区珠江新城',
        vipLevel: 1,
        createdAt: new Date('2024-04-05').toISOString()
      }
    ];
    this.setCustomers(customers);

    // 初始化设备类型
    const deviceTypes: DeviceType[] = [
      {
        id: 'device-1',
        brand: 'Apple',
        model: 'iPhone 15 Pro',
        series: 'iPhone 15',
        storageCapacity: '256GB',
        color: '原色钛金属',
        marketPrice: 8999
      },
      {
        id: 'device-2',
        brand: 'Apple',
        model: 'iPhone 14',
        series: 'iPhone 14',
        storageCapacity: '128GB',
        color: '午夜色',
        marketPrice: 5999
      },
      {
        id: 'device-3',
        brand: '华为',
        model: 'Mate 60 Pro',
        series: 'Mate 60',
        storageCapacity: '512GB',
        color: '雅川青',
        marketPrice: 6999
      },
      {
        id: 'device-4',
        brand: '小米',
        model: 'Xiaomi 14',
        series: 'Xiaomi 14',
        storageCapacity: '256GB',
        color: '黑色',
        marketPrice: 3999
      }
    ];
    this.setDeviceTypes(deviceTypes);

    // 初始化维修类别
    const repairCategories: RepairCategory[] = [
      {
        id: 'repair-1',
        name: '屏幕维修',
        description: '屏幕破碎、显示异常、触摸失灵等问题',
        basePrice: 300,
        estimatedTimeHours: 2,
        difficultyLevel: 2,
        isActive: true
      },
      {
        id: 'repair-2',
        name: '电池更换',
        description: '电池老化、续航短、充电异常等问题',
        basePrice: 150,
        estimatedTimeHours: 1,
        difficultyLevel: 1,
        isActive: true
      },
      {
        id: 'repair-3',
        name: '主板维修',
        description: '不开机、死机、进水等主板相关问题',
        basePrice: 500,
        estimatedTimeHours: 4,
        difficultyLevel: 4,
        isActive: true
      },
      {
        id: 'repair-4',
        name: '摄像头维修',
        description: '摄像头模糊、无法对焦、闪光灯故障等',
        basePrice: 200,
        estimatedTimeHours: 1,
        difficultyLevel: 2,
        isActive: true
      },
      {
        id: 'repair-5',
        name: '扬声器维修',
        description: '听筒、扬声器无声音或声音异常',
        basePrice: 100,
        estimatedTimeHours: 1,
        difficultyLevel: 1,
        isActive: true
      }
    ];
    this.setRepairCategories(repairCategories);

    // 初始化订单
    const orders: Order[] = [
      {
        id: 'order-1',
        orderNumber: 'WX24071901',
        customerId: 'cust-1',
        deviceTypeId: 'device-1',
        deviceModel: 'iPhone 15 Pro',
        issueDescription: '屏幕右下角出现裂纹，触摸正常，显示正常，希望更换原装屏幕',
        status: 'in_progress',
        estimatedCost: 1200,
        finalCost: 1200,
        technicianId: 'tech-1',
        priority: 1,
        expectedCompletion: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'VIP客户，优先处理',
        images: [],
        createdAt: new Date('2024-07-19T09:00:00').toISOString(),
        updatedAt: new Date('2024-07-19T10:30:00').toISOString()
      },
      {
        id: 'order-2',
        orderNumber: 'WX24071902',
        customerId: 'cust-2',
        deviceTypeId: 'device-2',
        deviceModel: 'iPhone 14',
        issueDescription: '电池续航明显下降，原本可以用一天，现在半天就没电了',
        status: 'completed',
        estimatedCost: 350,
        finalCost: 350,
        technicianId: 'tech-1',
        priority: 0,
        expectedCompletion: new Date('2024-07-19T16:00:00').toISOString(),
        notes: '已更换原装电池，测试正常',
        images: [],
        createdAt: new Date('2024-07-19T08:30:00').toISOString(),
        updatedAt: new Date('2024-07-19T15:45:00').toISOString()
      },
      {
        id: 'order-3',
        orderNumber: 'WX24071903',
        customerId: 'cust-3',
        deviceTypeId: 'device-3',
        deviceModel: '华为 Mate 60 Pro',
        issueDescription: '手机突然开不了机，充电时有反应但是无法启动到桌面',
        status: 'quoted',
        estimatedCost: 800,
        technicianId: 'tech-2',
        priority: 2,
        expectedCompletion: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        notes: '需要进一步诊断主板问题',
        images: [],
        createdAt: new Date('2024-07-19T11:15:00').toISOString(),
        updatedAt: new Date('2024-07-19T14:20:00').toISOString()
      },
      {
        id: 'order-4',
        orderNumber: 'WX24071904',
        customerId: 'cust-4',
        deviceTypeId: 'device-4',
        deviceModel: '小米 14',
        issueDescription: '后置摄像头拍照模糊，无法自动对焦，前置摄像头正常',
        status: 'pending',
        estimatedCost: 280,
        priority: 0,
        expectedCompletion: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        notes: '',
        images: [],
        createdAt: new Date('2024-07-19T13:45:00').toISOString(),
        updatedAt: new Date('2024-07-19T13:45:00').toISOString()
      },
      {
        id: 'order-5',
        orderNumber: 'WX24071905',
        customerId: 'cust-1',
        deviceTypeId: 'device-2',
        deviceModel: 'iPhone 14',
        issueDescription: '听筒声音很小，通话时对方声音几乎听不见',
        status: 'delivered',
        estimatedCost: 180,
        finalCost: 180,
        technicianId: 'tech-3',
        priority: 0,
        expectedCompletion: new Date('2024-07-18T17:00:00').toISOString(),
        notes: '已更换听筒模块，测试通话正常',
        images: [],
        createdAt: new Date('2024-07-18T10:00:00').toISOString(),
        updatedAt: new Date('2024-07-18T16:30:00').toISOString()
      }
    ];
    this.setOrders(orders);
  }
}

export const storage = new LocalStorage();

// 导出一些常用的状态映射
export const ORDER_STATUS_LABELS = {
  pending: '待处理',
  quoted: '已报价',
  approved: '已确认',
  in_progress: '维修中',
  testing: '测试中',
  completed: '已完成',
  delivered: '已交付',
  cancelled: '已取消'
} as const;

export const ORDER_STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  quoted: 'bg-purple-100 text-purple-800',
  approved: 'bg-green-100 text-green-800',
  in_progress: 'bg-orange-100 text-orange-800',
  testing: 'bg-indigo-100 text-indigo-800',
  completed: 'bg-green-100 text-green-800',
  delivered: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800'
} as const;

export const PRIORITY_LABELS = {
  0: '普通',
  1: '重要',
  2: '紧急'
} as const;

export const PRIORITY_COLORS = {
  0: 'bg-gray-100 text-gray-800',
  1: 'bg-blue-100 text-blue-800',
  2: 'bg-red-100 text-red-800'
} as const;