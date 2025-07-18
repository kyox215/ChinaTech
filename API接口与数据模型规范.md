# 手机维修系统 - API接口与数据模型规范

**作者：** MiniMax Agent  
**日期：** 2025-07-17

## API设计规范

### 1. 通用设计原则

#### 1.1 RESTful API 规范
```typescript
// API 路径设计规范
interface APIPathConventions {
  // 资源集合操作
  'GET /api/resources': '获取资源列表';
  'POST /api/resources': '创建新资源';
  
  // 单个资源操作
  'GET /api/resources/:id': '获取特定资源';
  'PUT /api/resources/:id': '完整更新资源';
  'PATCH /api/resources/:id': '部分更新资源';
  'DELETE /api/resources/:id': '删除资源';
  
  // 子资源操作
  'GET /api/resources/:id/subresources': '获取子资源列表';
  'POST /api/resources/:id/subresources': '创建子资源';
  
  // 资源操作
  'POST /api/resources/:id/actions': '执行资源操作';
}
```

#### 1.2 统一响应格式
```typescript
// 成功响应格式
interface SuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
  meta?: {
    timestamp: string;
    requestId: string;
    version: string;
  };
}

// 分页响应格式
interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  meta?: ResponseMeta;
}

// 错误响应格式
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    field?: string;
  };
  meta?: ResponseMeta;
}
```

### 2. 核心业务API

#### 2.1 订单管理API
```typescript
namespace OrderAPI {
  // 订单列表查询
  export interface GetOrdersRequest {
    // 基础查询
    status?: OrderStatus | OrderStatus[];
    technicianId?: string;
    customerId?: string;
    
    // 时间范围
    dateFrom?: string; // ISO 8601
    dateTo?: string;
    
    // 搜索和过滤
    search?: string; // 订单号、客户姓名、设备型号
    deviceBrand?: string;
    deviceModel?: string;
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    
    // 分页和排序
    page?: number;
    limit?: number;
    sortBy?: 'createdAt' | 'updatedAt' | 'estimatedCost' | 'priority';
    sortOrder?: 'asc' | 'desc';
    
    // 数据包含选项
    include?: Array<'customer' | 'technician' | 'repairLogs' | 'statusHistory' | 'payments'>;
  }

  export interface CreateOrderRequest {
    // 客户信息
    customer: {
      id?: string; // 现有客户ID
      name: string;
      phone: string;
      email?: string;
      address?: string;
    };
    
    // 设备信息
    device: {
      brand: string;
      model: string;
      color?: string;
      storage?: string;
      imei?: string;
      purchaseDate?: string;
      warrantyStatus?: 'in_warranty' | 'out_warranty' | 'unknown';
    };
    
    // 故障信息
    issue: {
      description: string;
      category: string; // '屏幕问题', '电池问题', '主板问题' 等
      severity: 'minor' | 'moderate' | 'severe';
      urgency: 'low' | 'normal' | 'high' | 'urgent';
      customerDescription: string;
      symptoms: string[];
      previousRepairs?: Array<{
        date: string;
        description: string;
        repairer?: string;
      }>;
    };
    
    // 服务选项
    service: {
      type: 'repair' | 'diagnostic' | 'maintenance' | 'upgrade';
      preferredDate?: string;
      preferredTime?: string;
      serviceLocation: 'in_store' | 'pickup_delivery' | 'on_site';
      dataBackupRequired?: boolean;
      expressService?: boolean;
    };
    
    // 预估费用
    estimation?: {
      diagnosticFee?: number;
      repairFee?: number;
      partsCost?: number;
      totalEstimate?: number;
      validUntil?: string;
    };
    
    // 附加信息
    notes?: string;
    attachments?: string[]; // 文件URL数组
    source: 'online' | 'phone' | 'walk_in' | 'referral';
    referralCode?: string;
  }

  export interface UpdateOrderStatusRequest {
    status: OrderStatus;
    notes?: string;
    technicianId?: string;
    estimatedCompletion?: string;
    attachments?: string[];
    notifyCustomer?: boolean;
    internalNotes?: string;
  }

  export interface OrderAssignmentRequest {
    technicianId: string;
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    expectedStartTime?: string;
    estimatedDuration?: number; // 小时
    notes?: string;
    autoNotify?: boolean;
  }

  // 订单详情响应
  export interface OrderDetailResponse {
    id: string;
    orderNumber: string;
    status: OrderStatus;
    priority: 'low' | 'normal' | 'high' | 'urgent';
    
    // 客户信息
    customer: CustomerInfo;
    
    // 设备信息
    device: DeviceInfo;
    
    // 故障信息
    issue: IssueInfo;
    
    // 服务信息
    service: ServiceInfo;
    
    // 费用信息
    costs: {
      estimated: CostBreakdown;
      final: CostBreakdown;
      payments: PaymentRecord[];
    };
    
    // 进度信息
    progress: {
      currentStep: string;
      completedSteps: string[];
      totalSteps: number;
      estimatedCompletion: string;
      actualCompletion?: string;
    };
    
    // 人员信息
    assignedTechnician?: TechnicianInfo;
    createdBy: UserInfo;
    
    // 历史记录
    statusHistory: StatusHistoryRecord[];
    repairLogs: RepairLogRecord[];
    
    // 附加信息
    attachments: AttachmentInfo[];
    notes: NoteRecord[];
    
    // 时间戳
    createdAt: string;
    updatedAt: string;
    completedAt?: string;
  }
}
```

#### 2.2 客户管理API
```typescript
namespace CustomerAPI {
  export interface CreateCustomerRequest {
    // 基础信息
    personalInfo: {
      name: string;
      phone: string;
      email?: string;
      dateOfBirth?: string;
      gender?: 'male' | 'female' | 'other';
      idType?: 'id_card' | 'passport' | 'other';
      idNumber?: string;
    };
    
    // 联系信息
    contactInfo: {
      primaryPhone: string;
      secondaryPhone?: string;
      email?: string;
      wechat?: string;
      qq?: string;
      preferredContactMethod: 'phone' | 'sms' | 'email' | 'wechat';
      contactTimePreference?: 'morning' | 'afternoon' | 'evening' | 'anytime';
    };
    
    // 地址信息
    addresses: Array<{
      type: 'home' | 'work' | 'other';
      address: string;
      city: string;
      district: string;
      zipCode?: string;
      isDefault: boolean;
    }>;
    
    // 客户分类
    classification: {
      type: 'individual' | 'business' | 'vip' | 'enterprise';
      source: 'walk_in' | 'online' | 'referral' | 'advertising' | 'social_media';
      tags: string[]; // 自定义标签
      creditRating?: 'A' | 'B' | 'C' | 'D';
      businessName?: string; // 企业客户
      taxId?: string; // 企业税号
    };
    
    // 偏好设置
    preferences: {
      preferredTechnician?: string;
      preferredServiceTime?: string;
      serviceReminders: boolean;
      marketingMessages: boolean;
      newsletter: boolean;
      language: 'zh-CN' | 'en-US';
    };
    
    // 附加信息
    notes?: string;
    referralCode?: string;
    referredBy?: string;
  }

  export interface CustomerSearchRequest {
    // 基础搜索
    query?: string; // 姓名、电话、邮箱模糊搜索
    phone?: string;
    email?: string;
    name?: string;
    
    // 分类筛选
    type?: 'individual' | 'business' | 'vip' | 'enterprise';
    source?: string;
    tags?: string[];
    creditRating?: string;
    
    // 业务筛选
    hasOrders?: boolean;
    lastOrderDateFrom?: string;
    lastOrderDateTo?: string;
    totalOrdersMin?: number;
    totalOrdersMax?: number;
    totalSpentMin?: number;
    totalSpentMax?: number;
    
    // 状态筛选
    isActive?: boolean;
    isVip?: boolean;
    hasOutstandingBalance?: boolean;
    
    // 分页和排序
    page?: number;
    limit?: number;
    sortBy?: 'name' | 'createdAt' | 'lastOrderDate' | 'totalSpent' | 'totalOrders';
    sortOrder?: 'asc' | 'desc';
    
    // 数据包含选项
    include?: Array<'orders' | 'statistics' | 'addresses' | 'preferences'>;
  }

  export interface CustomerDetailResponse {
    id: string;
    personalInfo: PersonalInfo;
    contactInfo: ContactInfo;
    addresses: AddressInfo[];
    classification: ClassificationInfo;
    preferences: PreferenceInfo;
    
    // 业务统计
    statistics: {
      totalOrders: number;
      completedOrders: number;
      cancelledOrders: number;
      totalSpent: number;
      averageOrderValue: number;
      lastOrderDate?: string;
      firstOrderDate?: string;
      customerLifetime: number; // 天数
      loyaltyPoints: number;
    };
    
    // 信用信息
    creditInfo: {
      rating: 'A' | 'B' | 'C' | 'D';
      outstandingBalance: number;
      creditLimit: number;
      paymentHistory: {
        onTime: number;
        late: number;
        defaulted: number;
      };
    };
    
    // 关系信息
    relationships: {
      referredCustomers: CustomerBasicInfo[];
      referredBy?: CustomerBasicInfo;
      familyMembers: CustomerBasicInfo[];
    };
    
    // 最近订单
    recentOrders: OrderBasicInfo[];
    
    // 沟通记录
    communicationHistory: CommunicationRecord[];
    
    // 时间戳
    createdAt: string;
    updatedAt: string;
    lastContactDate?: string;
  }
}
```

#### 2.3 库存管理API
```typescript
namespace InventoryAPI {
  export interface InventoryItemRequest {
    // 基础信息
    basicInfo: {
      name: string;
      sku: string;
      barcode?: string;
      category: string;
      subcategory?: string;
      brand: string;
      model?: string;
      description?: string;
    };
    
    // 兼容性信息
    compatibility: {
      deviceBrands: string[];
      deviceModels: string[];
      partType: 'original' | 'oem' | 'aftermarket' | 'refurbished';
      quality: 'premium' | 'standard' | 'economy';
      warranty: number; // 保修期（天）
    };
    
    // 供应商信息
    suppliers: Array<{
      supplierId: string;
      supplierSku: string;
      cost: number;
      minOrderQuantity: number;
      leadTime: number; // 交货期（天）
      isPreferred: boolean;
    }>;
    
    // 库存设置
    stockSettings: {
      minStock: number;
      maxStock: number;
      reorderPoint: number;
      reorderQuantity: number;
      location: string;
      storageRequirements?: string;
    };
    
    // 价格信息
    pricing: {
      cost: number;
      markup: number;
      sellingPrice: number;
      vipPrice?: number;
      bulkDiscounts?: Array<{
        quantity: number;
        discount: number;
      }>;
    };
    
    // 附加信息
    attributes: Record<string, string>; // 自定义属性
    images: string[];
    documents: string[];
    notes?: string;
  }

  export interface InventorySearchRequest {
    // 基础搜索
    query?: string; // 名称、SKU、描述搜索
    sku?: string;
    barcode?: string;
    category?: string;
    brand?: string;
    
    // 兼容性搜索
    deviceBrand?: string;
    deviceModel?: string;
    partType?: string;
    
    // 库存筛选
    inStock?: boolean;
    lowStock?: boolean;
    outOfStock?: boolean;
    quantityMin?: number;
    quantityMax?: number;
    
    // 价格筛选
    priceMin?: number;
    priceMax?: number;
    costMin?: number;
    costMax?: number;
    
    // 供应商筛选
    supplierId?: string;
    hasPreferredSupplier?: boolean;
    
    // 分页和排序
    page?: number;
    limit?: number;
    sortBy?: 'name' | 'sku' | 'quantity' | 'cost' | 'price' | 'lastUpdated';
    sortOrder?: 'asc' | 'desc';
    
    // 数据包含选项
    include?: Array<'suppliers' | 'movements' | 'usage' | 'forecasts'>;
  }

  export interface StockMovementRequest {
    type: 'in' | 'out' | 'transfer' | 'adjustment';
    reference: {
      type: 'purchase_order' | 'sales_order' | 'repair_order' | 'adjustment' | 'transfer';
      id: string;
      number?: string;
    };
    
    items: Array<{
      inventoryId: string;
      quantity: number;
      unitCost?: number;
      reason?: string;
      location?: string;
      batchNumber?: string;
      expiryDate?: string;
    }>;
    
    notes?: string;
    performedBy: string;
    approvedBy?: string;
    attachments?: string[];
  }

  export interface InventoryRequestRequest {
    type: 'normal' | 'urgent' | 'emergency';
    orderId?: string;
    requestedBy: string;
    
    items: Array<{
      inventoryId: string;
      quantity: number;
      priority: 'low' | 'normal' | 'high';
      reason: string;
      alternatives?: string[]; // 替代配件ID
    }>;
    
    deliveryInfo: {
      location: string;
      expectedDate: string;
      contactPerson: string;
      contactPhone: string;
    };
    
    notes?: string;
    attachments?: string[];
  }

  export interface InventoryDetailResponse {
    id: string;
    basicInfo: BasicInfo;
    compatibility: CompatibilityInfo;
    suppliers: SupplierInfo[];
    stockSettings: StockSettings;
    pricing: PricingInfo;
    
    // 当前库存状态
    currentStock: {
      quantity: number;
      availableQuantity: number;
      reservedQuantity: number;
      inTransitQuantity: number;
      value: number;
      lastUpdated: string;
      lastMovement: StockMovementInfo;
    };
    
    // 库存分析
    analytics: {
      averageUsage: {
        daily: number;
        weekly: number;
        monthly: number;
      };
      turnoverRate: number;
      daysSinceLastMovement: number;
      projectedStockout: string;
      reorderSuggestion: {
        shouldReorder: boolean;
        suggestedQuantity: number;
        urgency: 'low' | 'medium' | 'high';
      };
    };
    
    // 使用历史
    usageHistory: Array<{
      date: string;
      quantity: number;
      orderId: string;
      technicianId: string;
      customerName: string;
    }>;
    
    // 库存移动记录
    movements: StockMovementRecord[];
    
    // 时间戳
    createdAt: string;
    updatedAt: string;
  }
}
```

#### 2.4 技术员管理API
```typescript
namespace TechnicianAPI {
  export interface TechnicianProfileRequest {
    // 基础信息
    personalInfo: {
      employeeId: string;
      name: string;
      phone: string;
      email: string;
      dateOfBirth: string;
      idNumber: string;
      address: string;
      emergencyContact: {
        name: string;
        phone: string;
        relationship: string;
      };
    };
    
    // 职业信息
    professionalInfo: {
      position: string;
      department: string;
      level: 'junior' | 'intermediate' | 'senior' | 'expert';
      hireDate: string;
      probationEndDate?: string;
      employmentType: 'full_time' | 'part_time' | 'contract' | 'intern';
      workLocation: string;
      reportingManager?: string;
    };
    
    // 技能信息
    skills: {
      specializations: string[]; // 专业领域
      certifications: Array<{
        name: string;
        issuer: string;
        issueDate: string;
        expiryDate?: string;
        certificateNumber: string;
        document?: string;
      }>;
      languages: Array<{
        language: string;
        proficiency: 'basic' | 'intermediate' | 'advanced' | 'native';
      }>;
      deviceBrands: string[]; // 擅长的设备品牌
      repairTypes: string[]; // 擅长的维修类型
    };
    
    // 工作设置
    workSettings: {
      maxConcurrentOrders: number;
      workingHours: {
        monday: { start: string; end: string; };
        tuesday: { start: string; end: string; };
        wednesday: { start: string; end: string; };
        thursday: { start: string; end: string; };
        friday: { start: string; end: string; };
        saturday?: { start: string; end: string; };
        sunday?: { start: string; end: string; };
      };
      timeZone: string;
      autoAssignOrders: boolean;
      preferredOrderTypes: string[];
    };
    
    // 权限设置
    permissions: {
      canCreateOrders: boolean;
      canModifyPrices: boolean;
      canAccessInventory: boolean;
      canViewAllOrders: boolean;
      canApproveRefunds: boolean;
      maxDiscountPercent: number;
      accessLevel: 'basic' | 'standard' | 'advanced' | 'admin';
    };
  }

  export interface TechnicianPerformanceRequest {
    technicianId: string;
    dateFrom: string;
    dateTo: string;
    metrics?: Array<'orders' | 'efficiency' | 'quality' | 'customer_satisfaction'>;
  }

  export interface TechnicianScheduleRequest {
    technicianId: string;
    date: string;
    
    schedule: Array<{
      orderId?: string;
      startTime: string;
      endTime: string;
      type: 'repair' | 'diagnostic' | 'meeting' | 'training' | 'break';
      status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
      notes?: string;
    }>;
  }

  export interface TechnicianDetailResponse {
    id: string;
    personalInfo: PersonalInfo;
    professionalInfo: ProfessionalInfo;
    skills: SkillInfo;
    workSettings: WorkSettings;
    permissions: PermissionInfo;
    
    // 当前状态
    currentStatus: {
      isActive: boolean;
      availability: 'available' | 'busy' | 'break' | 'offline';
      currentOrders: OrderBasicInfo[];
      workload: number; // 当前工作负载百分比
      lastActiveTime: string;
      location?: string;
    };
    
    // 绩效统计
    performance: {
      thisMonth: {
        ordersCompleted: number;
        averageCompletionTime: number;
        customerSatisfaction: number;
        qualityScore: number;
        revenue: number;
      };
      lastMonth: {
        ordersCompleted: number;
        averageCompletionTime: number;
        customerSatisfaction: number;
        qualityScore: number;
        revenue: number;
      };
      yearToDate: {
        ordersCompleted: number;
        averageCompletionTime: number;
        customerSatisfaction: number;
        qualityScore: number;
        revenue: number;
      };
    };
    
    // 认证和培训
    trainingRecords: Array<{
      title: string;
      provider: string;
      completionDate: string;
      score?: number;
      certificate?: string;
    }>;
    
    // 设备权限
    deviceAccess: Array<{
      brand: string;
      models: string[];
      repairTypes: string[];
      certified: boolean;
    }>;
    
    // 时间戳
    createdAt: string;
    updatedAt: string;
    lastLoginAt?: string;
  }
}
```

### 3. 数据模型定义

#### 3.1 核心实体模型
```typescript
// 订单状态枚举
enum OrderStatus {
  PENDING = 'pending',                    // 待处理
  ASSIGNED = 'assigned',                  // 已分配
  DIAGNOSTIC = 'diagnostic',              // 诊断中
  DIAGNOSED = 'diagnosed',                // 已诊断
  QUOTED = 'quoted',                      // 已报价
  QUOTE_APPROVED = 'quote_approved',      // 报价确认
  PARTS_ORDERED = 'parts_ordered',        // 配件已订购
  PARTS_RECEIVED = 'parts_received',      // 配件已到货
  REPAIR_STARTED = 'repair_started',      // 开始维修
  REPAIR_IN_PROGRESS = 'repair_in_progress', // 维修中
  REPAIR_COMPLETED = 'repair_completed',  // 维修完成
  TESTING = 'testing',                    // 测试中
  QUALITY_CHECK = 'quality_check',        // 质量检查
  READY_FOR_PICKUP = 'ready_for_pickup', // 待取机
  DELIVERED = 'delivered',                // 已交付
  COMPLETED = 'completed',                // 已完成
  CANCELLED = 'cancelled',                // 已取消
  ON_HOLD = 'on_hold',                   // 暂停处理
  RETURNED = 'returned'                   // 已退回
}

// 订单实体
interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  
  // 关联实体
  customerId: string;
  technicianId?: string;
  
  // 设备信息
  device: {
    brand: string;
    model: string;
    color?: string;
    storage?: string;
    imei?: string;
    serialNumber?: string;
    purchaseDate?: Date;
    warrantyStatus: 'in_warranty' | 'out_warranty' | 'unknown';
  };
  
  // 问题描述
  issue: {
    category: string;
    description: string;
    severity: 'minor' | 'moderate' | 'severe';
    symptoms: string[];
    customerDescription: string;
    technicianDiagnosis?: string;
    rootCause?: string;
    repairability: 'repairable' | 'not_repairable' | 'unknown';
  };
  
  // 服务信息
  service: {
    type: 'repair' | 'diagnostic' | 'maintenance' | 'upgrade';
    location: 'in_store' | 'pickup_delivery' | 'on_site';
    urgency: 'standard' | 'express' | 'same_day';
    dataBackupRequired: boolean;
    originalBox: boolean;
    accessories: string[];
  };
  
  // 时间信息
  timeline: {
    createdAt: Date;
    updatedAt: Date;
    estimatedStartDate?: Date;
    actualStartDate?: Date;
    estimatedCompletionDate?: Date;
    actualCompletionDate?: Date;
    deliveryDate?: Date;
    estimatedDuration?: number; // 小时
    actualDuration?: number;
  };
  
  // 费用信息
  costs: {
    diagnostic: number;
    labor: number;
    parts: number;
    tax: number;
    discount: number;
    total: number;
    estimatedTotal: number;
    currency: string;
  };
  
  // 附加信息
  metadata: {
    source: 'online' | 'phone' | 'walk_in' | 'referral';
    referralCode?: string;
    tags: string[];
    notes: string;
    internalNotes: string;
    attachments: string[];
  };
}

// 客户实体
interface Customer {
  id: string;
  
  // 个人信息
  personalInfo: {
    name: string;
    phone: string;
    email?: string;
    dateOfBirth?: Date;
    gender?: 'male' | 'female' | 'other';
    idType?: 'id_card' | 'passport' | 'other';
    idNumber?: string;
  };
  
  // 联系信息
  contactInfo: {
    primaryPhone: string;
    secondaryPhone?: string;
    email?: string;
    wechat?: string;
    qq?: string;
    preferredContactMethod: 'phone' | 'sms' | 'email' | 'wechat';
    contactTimePreference: 'morning' | 'afternoon' | 'evening' | 'anytime';
  };
  
  // 地址信息
  addresses: Array<{
    id: string;
    type: 'home' | 'work' | 'other';
    address: string;
    city: string;
    district: string;
    zipCode?: string;
    isDefault: boolean;
  }>;
  
  // 客户分类
  classification: {
    type: 'individual' | 'business' | 'vip' | 'enterprise';
    level: 'bronze' | 'silver' | 'gold' | 'platinum';
    source: 'walk_in' | 'online' | 'referral' | 'advertising' | 'social_media';
    tags: string[];
    creditRating: 'A' | 'B' | 'C' | 'D';
    riskLevel: 'low' | 'medium' | 'high';
  };
  
  // 业务信息（企业客户）
  businessInfo?: {
    businessName: string;
    taxId: string;
    businessType: string;
    industry: string;
    contactPerson: string;
    businessAddress: string;
  };
  
  // 偏好设置
  preferences: {
    preferredTechnician?: string;
    preferredServiceTime?: string;
    communicationPreferences: {
      serviceReminders: boolean;
      marketingMessages: boolean;
      newsletter: boolean;
      smsNotifications: boolean;
      emailNotifications: boolean;
      wechatNotifications: boolean;
    };
    servicePreferences: {
      originalParts: boolean;
      expressService: boolean;
      dataBackup: boolean;
      pickupDelivery: boolean;
    };
    language: 'zh-CN' | 'en-US';
    timezone: string;
  };
  
  // 统计信息
  statistics: {
    totalOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    totalSpent: number;
    averageOrderValue: number;
    lifetimeValue: number;
    loyaltyPoints: number;
    referralCount: number;
    lastOrderDate?: Date;
    firstOrderDate?: Date;
    averageOrderInterval: number; // 天数
  };
  
  // 信用信息
  creditInfo: {
    rating: 'A' | 'B' | 'C' | 'D';
    creditLimit: number;
    outstandingBalance: number;
    paymentHistory: {
      onTimePayments: number;
      latePayments: number;
      defaultedPayments: number;
      averagePaymentDelay: number; // 天数
    };
    riskFlags: string[];
  };
  
  // 关系信息
  relationships: {
    referredBy?: string; // 客户ID
    referredCustomers: string[]; // 客户ID数组
    familyMembers: string[]; // 客户ID数组
    associatedBusinesses: string[]; // 企业客户ID数组
  };
  
  // 时间戳
  createdAt: Date;
  updatedAt: Date;
  lastContactDate?: Date;
  lastLoginAt?: Date;
}

// 库存实体
interface InventoryItem {
  id: string;
  
  // 基础信息
  basicInfo: {
    name: string;
    sku: string;
    barcode?: string;
    category: string;
    subcategory?: string;
    brand: string;
    model?: string;
    partNumber?: string;
    description: string;
    specifications: Record<string, any>;
  };
  
  // 兼容性信息
  compatibility: {
    deviceBrands: string[];
    deviceModels: string[];
    deviceSeries: string[];
    partType: 'original' | 'oem' | 'aftermarket' | 'refurbished';
    quality: 'premium' | 'standard' | 'economy';
    warranty: number; // 保修期（天）
    warrantyCoverage: string;
  };
  
  // 供应商信息
  suppliers: Array<{
    id: string;
    supplierId: string;
    supplierName: string;
    supplierSku: string;
    cost: number;
    minOrderQuantity: number;
    leadTime: number; // 交货期（天）
    isPreferred: boolean;
    reliability: number; // 可靠性评分 0-10
    qualityRating: number; // 质量评分 0-10
    lastOrderDate?: Date;
    contractEndDate?: Date;
  }>;
  
  // 库存信息
  stock: {
    quantity: number;
    availableQuantity: number;
    reservedQuantity: number;
    inTransitQuantity: number;
    committedQuantity: number;
    minStock: number;
    maxStock: number;
    reorderPoint: number;
    reorderQuantity: number;
    safetyStock: number;
  };
  
  // 位置信息
  location: {
    warehouse: string;
    zone: string;
    aisle: string;
    shelf: string;
    bin: string;
    storageRequirements: string[];
    temperatureRange?: { min: number; max: number };
    humidityRange?: { min: number; max: number };
  };
  
  // 财务信息
  financial: {
    averageCost: number;
    lastCost: number;
    standardCost: number;
    sellingPrice: number;
    vipPrice?: number;
    currency: string;
    costMethod: 'fifo' | 'lifo' | 'average' | 'standard';
    totalValue: number;
  };
  
  // 使用统计
  usage: {
    averageDailyUsage: number;
    averageWeeklyUsage: number;
    averageMonthlyUsage: number;
    turnoverRate: number;
    daysSinceLastMovement: number;
    velocityClass: 'A' | 'B' | 'C'; // ABC分析
    seasonalFactor: number;
  };
  
  // 质量信息
  quality: {
    defectRate: number;
    returnRate: number;
    customerSatisfaction: number;
    qualityIssues: string[];
    lastQualityCheck?: Date;
    qualityCheckFrequency: number; // 天数
  };
  
  // 附加信息
  metadata: {
    images: string[];
    documents: string[];
    videos: string[];
    manuals: string[];
    certifications: string[];
    tags: string[];
    notes: string;
    isActive: boolean;
    isDiscontinued: boolean;
    replacementParts: string[]; // 替代配件ID
  };
  
  // 时间戳
  createdAt: Date;
  updatedAt: Date;
  lastMovementDate?: Date;
  discontinuedDate?: Date;
}

// 技术员实体
interface Technician {
  id: string;
  userId: string; // 关联用户表
  
  // 基础信息
  personalInfo: {
    employeeId: string;
    name: string;
    phone: string;
    email: string;
    avatar?: string;
    dateOfBirth: Date;
    idNumber: string;
    address: string;
    emergencyContact: {
      name: string;
      phone: string;
      relationship: string;
    };
  };
  
  // 职业信息
  professionalInfo: {
    position: string;
    department: string;
    level: 'junior' | 'intermediate' | 'senior' | 'expert' | 'master';
    grade: string;
    hireDate: Date;
    probationEndDate?: Date;
    confirmationDate?: Date;
    employmentType: 'full_time' | 'part_time' | 'contract' | 'intern';
    workLocation: string;
    reportingManager?: string;
    teamMembers: string[];
  };
  
  // 技能信息
  skills: {
    specializations: string[]; // 专业领域
    certifications: Array<{
      id: string;
      name: string;
      issuer: string;
      issueDate: Date;
      expiryDate?: Date;
      certificateNumber: string;
      level: string;
      document?: string;
      isVerified: boolean;
    }>;
    languages: Array<{
      language: string;
      proficiency: 'basic' | 'intermediate' | 'advanced' | 'native';
    }>;
    deviceExpertise: Array<{
      brand: string;
      models: string[];
      proficiencyLevel: number; // 1-10
      certificationLevel?: string;
    }>;
    repairSkills: Array<{
      skill: string;
      level: number; // 1-10
      yearsExperience: number;
      lastTrainingDate?: Date;
    }>;
    tools: string[]; // 掌握的工具
  };
  
  // 工作配置
  workConfiguration: {
    maxConcurrentOrders: number;
    maxDailyOrders: number;
    workingHours: {
      [key: string]: { // 'monday', 'tuesday', etc.
        isWorkingDay: boolean;
        shifts: Array<{
          start: string;
          end: string;
          breakStart?: string;
          breakEnd?: string;
        }>;
      };
    };
    timeZone: string;
    workLocation: string[];
    autoAssignOrders: boolean;
    preferredOrderTypes: string[];
    maxOrderValue: number;
    canWorkWeekends: boolean;
    canWorkHolidays: boolean;
  };
  
  // 权限设置
  permissions: {
    systemAccess: {
      canCreateOrders: boolean;
      canModifyOrders: boolean;
      canDeleteOrders: boolean;
      canViewAllOrders: boolean;
      canAssignOrders: boolean;
      canCancelOrders: boolean;
    };
    financialAccess: {
      canModifyPrices: boolean;
      canApplyDiscounts: boolean;
      maxDiscountPercent: number;
      canApproveRefunds: boolean;
      maxRefundAmount: number;
      canViewCosts: boolean;
      canViewProfitMargins: boolean;
    };
    inventoryAccess: {
      canAccessInventory: boolean;
      canRequestParts: boolean;
      canReceiveParts: boolean;
      canAdjustInventory: boolean;
      canViewInventoryCosts: boolean;
    };
    customerAccess: {
      canViewCustomerData: boolean;
      canModifyCustomerData: boolean;
      canViewCustomerHistory: boolean;
      canAccessCustomerFinancials: boolean;
    };
    reportAccess: {
      canViewReports: boolean;
      canExportData: boolean;
      accessibleReports: string[];
    };
    adminAccess: {
      canManageUsers: boolean;
      canManageSettings: boolean;
      canViewAuditLogs: boolean;
      canBackupData: boolean;
    };
  };
  
  // 绩效信息
  performance: {
    currentMonth: PerformanceMetrics;
    lastMonth: PerformanceMetrics;
    quarterToDate: PerformanceMetrics;
    yearToDate: PerformanceMetrics;
    career: PerformanceMetrics;
    
    kpis: {
      efficiency: number; // 效率评分
      quality: number; // 质量评分
      customerSatisfaction: number; // 客户满意度
      punctuality: number; // 准时性
      teamwork: number; // 团队合作
      initiative: number; // 主动性
      overallRating: number; // 综合评分
    };
    
    achievements: Array<{
      title: string;
      description: string;
      achievedDate: Date;
      category: string;
      points: number;
    }>;
    
    goals: Array<{
      title: string;
      description: string;
      targetValue: number;
      currentValue: number;
      targetDate: Date;
      status: 'not_started' | 'in_progress' | 'completed' | 'overdue';
    }>;
  };
  
  // 培训记录
  trainingHistory: Array<{
    id: string;
    title: string;
    provider: string;
    type: 'internal' | 'external' | 'online' | 'certification';
    startDate: Date;
    endDate: Date;
    duration: number; // 小时
    status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
    score?: number;
    grade?: string;
    certificate?: string;
    cost: number;
    skills: string[]; // 学到的技能
    notes?: string;
  }>;
  
  // 当前状态
  currentStatus: {
    isActive: boolean;
    availability: 'available' | 'busy' | 'break' | 'meeting' | 'training' | 'offline' | 'vacation' | 'sick';
    currentOrders: string[]; // 订单ID数组
    workload: number; // 工作负载百分比
    lastActiveTime: Date;
    currentLocation?: string;
    estimatedFreeTime?: Date;
  };
  
  // 设备访问权限
  deviceAccess: Array<{
    brand: string;
    models: string[];
    repairTypes: string[];
    accessLevel: 'basic' | 'intermediate' | 'advanced' | 'expert';
    certified: boolean;
    certificationDate?: Date;
    certificationExpiry?: Date;
  }>;
  
  // 时间戳
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  lastPerformanceReview?: Date;
  nextPerformanceReview?: Date;
}

// 绩效指标接口
interface PerformanceMetrics {
  ordersCompleted: number;
  ordersInProgress: number;
  ordersCancelled: number;
  averageCompletionTime: number; // 小时
  averageResponseTime: number; // 分钟
  firstTimeFixRate: number; // 一次修复成功率
  customerSatisfactionScore: number;
  qualityScore: number;
  efficiencyScore: number;
  revenue: number;
  profit: number;
  hoursWorked: number;
  overtimeHours: number;
  attendanceRate: number;
  punctualityRate: number;
}
```

#### 3.2 业务规则模型
```typescript
// 业务规则配置
interface BusinessRules {
  orderRules: {
    autoAssignment: {
      enabled: boolean;
      strategy: 'round_robin' | 'skill_based' | 'workload_based' | 'priority_based';
      considerLocation: boolean;
      considerSkills: boolean;
      considerWorkload: boolean;
      maxOrdersPerTechnician: number;
    };
    
    pricing: {
      dynamicPricing: boolean;
      surge: {
        enabled: boolean;
        factors: Array<{
          condition: string;
          multiplier: number;
        }>;
      };
      discounts: {
        vipDiscount: number;
        volumeDiscounts: Array<{
          orderCount: number;
          discount: number;
        }>;
        seasonalDiscounts: Array<{
          startDate: string;
          endDate: string;
          discount: number;
        }>;
      };
    };
    
    completion: {
      autoCompleteAfterDelivery: boolean;
      requireCustomerConfirmation: boolean;
      followUpPeriod: number; // 天数
      warrantyPeriod: number; // 天数
    };
  };
  
  inventoryRules: {
    reordering: {
      autoReorder: boolean;
      reorderMethod: 'min_max' | 'economic_order_quantity' | 'demand_based';
      leadTimeBuffer: number; // 天数
      seasonalAdjustment: boolean;
    };
    
    allocation: {
      reservationDuration: number; // 小时
      priorityAllocation: boolean;
      backorderManagement: boolean;
    };
    
    valuation: {
      method: 'fifo' | 'lifo' | 'average' | 'standard';
      revaluationFrequency: number; // 天数
    };
  };
  
  customerRules: {
    classification: {
      autoClassification: boolean;
      vipThreshold: {
        orderCount: number;
        totalSpent: number;
        timeframe: number; // 月数
      };
      loyaltyProgram: {
        enabled: boolean;
        pointsPerDollar: number;
        redemptionRate: number;
      };
    };
    
    communication: {
      defaultChannels: string[];
      autoNotifications: {
        orderCreated: boolean;
        statusUpdated: boolean;
        readyForPickup: boolean;
        paymentDue: boolean;
      };
      marketingPermissions: {
        requireOptIn: boolean;
        defaultOptIn: boolean;
      };
    };
  };
  
  technicianRules: {
    performance: {
      reviewFrequency: number; // 月数
      kpiWeights: {
        efficiency: number;
        quality: number;
        customerSatisfaction: number;
        punctuality: number;
      };
      bonusThresholds: Array<{
        metric: string;
        threshold: number;
        bonus: number;
      }>;
    };
    
    scheduling: {
      maxConsecutiveDays: number;
      minRestHours: number;
      maxOvertimeHours: number;
      emergencyCallAvailability: boolean;
    };
  };
}
```

这个详细的API接口与数据模型规范确保了系统各模块间的完整互通性。通过标准化的接口设计和完善的数据模型，系统能够实现高效的数据交换和业务协作。