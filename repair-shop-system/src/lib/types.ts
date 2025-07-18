// 生产级类型定义

// 用户相关类型
export interface Profile {
  id: string;
  full_name: string;
  phone?: string;
  email: string;
  role: 'customer' | 'technician' | 'admin';
  avatar_url?: string;
  skills?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// 客户类型
export interface Customer {
  id: string;
  profile_id?: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  vip_level: number;
  total_orders: number;
  total_spent: number;
  created_at: string;
  updated_at: string;
}

// 设备类型
export interface DeviceType {
  id: string;
  brand: string;
  model: string;
  series?: string;
  storage_capacity?: string;
  color?: string;
  market_price?: number;
  category: 'flagship' | 'premium' | 'standard' | 'budget';
  is_active: boolean;
  created_at: string;
}

// 维修类别
export interface RepairCategory {
  id: string;
  name: string;
  description?: string;
  base_price: number;
  estimated_time_hours: number;
  difficulty_level: number;
  is_active: boolean;
  created_at: string;
}

// 价格规则
export interface PricingRule {
  id: string;
  device_category: string;
  repair_category_id: string;
  parts_cost: number;
  labor_cost: number;
  brand_multiplier: number;
  difficulty_multiplier: number;
  is_active: boolean;
  created_at: string;
}

// 订单状态类型
export type OrderStatus = 
  | 'pending' 
  | 'quoted' 
  | 'approved' 
  | 'in_progress' 
  | 'testing' 
  | 'completed' 
  | 'delivered' 
  | 'cancelled';

// 支付状态类型
export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'refunded';

// 订单类型
export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  device_type_id?: string;
  device_brand: string;
  device_model: string;
  device_serial?: string;
  issue_description: string;
  repair_category_id?: string;
  fault_type: string;
  status: OrderStatus;
  priority: number;
  estimated_cost?: number;
  final_cost?: number;
  parts_cost?: number;
  labor_cost?: number;
  diagnostic_fee?: number;
  urgency_fee?: number;
  technician_id?: string;
  technician_name?: string;
  assigned_at?: string;
  started_at?: string;
  completed_at?: string;
  expected_completion?: string;
  delivery_method?: string;
  delivery_address?: string;
  payment_status: PaymentStatus;
  payment_method?: string;
  warranty_months: number;
  notes?: string;
  internal_notes?: string;
  customer_rating?: number;
  customer_feedback?: string;
  created_at: string;
  updated_at: string;
}

// 订单状态历史
export interface OrderStatusHistory {
  id: string;
  order_id: string;
  old_status?: string;
  new_status: string;
  changed_by?: string;
  changed_by_name?: string;
  notes?: string;
  created_at: string;
}

// 维修记录
export interface RepairLog {
  id: string;
  order_id: string;
  technician_id: string;
  technician_name: string;
  action_type: 'diagnostic' | 'repair' | 'test' | 'quality_check' | 'note';
  description: string;
  parts_used?: any; // JSONB
  time_spent_minutes?: number;
  images?: string[];
  created_at: string;
}

// 订单附件
export interface OrderAttachment {
  id: string;
  order_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size?: number;
  uploaded_by: string;
  upload_type: 'before' | 'during' | 'after' | 'document';
  description?: string;
  created_at: string;
}

// 库存
export interface Inventory {
  id: string;
  part_name: string;
  part_number?: string;
  description?: string;
  category?: string;
  compatible_devices?: string[];
  supplier?: string;
  cost_price?: number;
  selling_price?: number;
  stock_quantity: number;
  min_stock_level: number;
  location?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// 库存变动
export interface InventoryTransaction {
  id: string;
  inventory_id: string;
  order_id?: string;
  transaction_type: 'in' | 'out' | 'adjustment';
  quantity: number;
  unit_cost?: number;
  total_cost?: number;
  notes?: string;
  performed_by: string;
  created_at: string;
}

// 系统设置
export interface SystemSetting {
  id: string;
  key: string;
  value: any; // JSONB
  description?: string;
  updated_by?: string;
  updated_at: string;
}

// API 响应类型
export interface ApiResponse<T = any> {
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

// 分页参数
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

// 搜索参数
export interface SearchParams extends PaginationParams {
  query?: string;
  status?: OrderStatus[];
  technician_id?: string;
  customer_id?: string;
  date_from?: string;
  date_to?: string;
}

// 统计数据类型
export interface Statistics {
  total_orders: number;
  today_orders: number;
  completed_orders: number;
  pending_orders: number;
  in_progress_orders: number;
  cancelled_orders: number;
  total_revenue: number;
  today_revenue: number;
  avg_completion_time: number;
  completion_rate: number;
  customer_satisfaction: number;
  technician_performance: {
    technician_id: string;
    technician_name: string;
    completed_orders: number;
    avg_rating: number;
    total_revenue: number;
  }[];
}

// 报价请求
export interface PricingRequest {
  device_brand: string;
  device_model: string;
  device_category?: string;
  fault_type: string;
  repair_category_id?: string;
  urgency: 'normal' | 'urgent' | 'emergency';
  part_quality: 'original' | 'oem' | 'aftermarket';
  customer_vip_level?: number;
}

// 报价结果
export interface PricingResult {
  estimated_cost: number;
  breakdown: {
    parts_cost: number;
    labor_cost: number;
    diagnostic_fee: number;
    urgency_fee: number;
    total_cost: number;
  };
  estimated_time: {
    hours: number;
    completion_date: Date;
  };
  warranty: {
    period: number; // 天数
    coverage: string;
  };
  notes: string[];
}

// 文件上传类型
export interface FileUpload {
  file: File;
  order_id: string;
  upload_type: 'before' | 'during' | 'after' | 'document';
  description?: string;
}

// WebSocket 消息类型
export interface WebSocketMessage {
  type: 'order_update' | 'status_change' | 'assignment' | 'notification';
  data: any;
  timestamp: string;
}

// 通知类型
export interface Notification {
  id: string;
  user_id: string;
  type: 'order_status' | 'assignment' | 'reminder' | 'system';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  created_at: string;
}

// 表单验证错误类型
export interface ValidationError {
  field: string;
  message: string;
}

// 表单状态类型
export interface FormState<T = any> {
  data: T;
  loading: boolean;
  errors: ValidationError[];
  touched: Record<string, boolean>;
}