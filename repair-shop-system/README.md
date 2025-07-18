# 手机维修订单管理系统

一个现代化的手机维修店订单管理系统，基于 React + TypeScript + Tailwind CSS 构建。

## 🌟 主要功能

### 客户端功能
- **首页展示**: 公司介绍、服务项目、成功案例
- **智能报价**: 根据设备型号和故障类型自动计算维修费用
- **订单查询**: 支持订单号和手机号查询订单状态

### 技术员功能
- **工作台**: 查看分配的订单列表
- **订单管理**: 接单、更新状态、添加维修记录
- **状态更新**: 实时更新订单进度

### 管理员功能
- **数据概览**: 订单统计、营收分析、完成率监控
- **订单管理**: 全局订单管理、技术员分配
- **用户管理**: 技术员和客户信息管理

## 🛠️ 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite
- **样式框架**: Tailwind CSS
- **图标库**: Lucide React
- **路由管理**: React Router
- **图表库**: Recharts
- **数据存储**: LocalStorage (演示版本)

## 🚀 快速开始

### 安装依赖
```bash
pnpm install
```

### 开发环境运行
```bash
pnpm dev
```

### 构建生产版本
```bash
pnpm build
```

### 预览生产版本
```bash
pnpm preview
```

## 👥 默认账户

### 管理员账户
- 用户名: `admin`
- 密码: `admin123`

### 技术员账户
- 用户名: `tech01` / `tech02` / `tech03`
- 密码: `tech123`

## 📱 功能演示

### 客户查询演示
可以使用以下信息查询演示订单：
- 订单号: `RP20250119001`
- 手机号: `13800138001`

### 设备支持
系统支持主流手机品牌：
- **Apple**: iPhone 15 Pro, iPhone 15, iPhone 14, iPhone 13, iPhone 12
- **Huawei**: Mate 60 Pro, P60 Pro, Nova 11
- **Xiaomi**: Mi 14 Pro, Mi 14, Redmi Note 13
- **Samsung**: Galaxy S24 Ultra, Galaxy S24, Galaxy A55

### 故障类型
- 屏幕损坏
- 电池老化
- 摄像头故障
- 充电问题
- 扬声器故障
- 进水维修
- 主板故障

## 🎨 设计特色

- **现代化界面**: 采用蓝色主色调和橙色辅助色的现代化设计
- **响应式布局**: 完美适配桌面和移动设备
- **卡片式设计**: 清晰的信息层次和优雅的视觉体验
- **渐变元素**: 精美的渐变色彩增强视觉吸引力
- **专业图标**: 使用 Lucide 图标库提供一致的视觉语言

## 📊 数据模型

### 订单 (Order)
```typescript
interface Order {
  id: string;                    // 订单号
  customerId: string;            // 客户ID
  customerName: string;          // 客户姓名
  customerPhone: string;         // 客户电话
  deviceBrand: string;           // 设备品牌
  deviceModel: string;           // 设备型号
  faultDescription: string;      // 故障描述
  faultType: string;            // 故障类型
  status: OrderStatus;          // 订单状态
  totalCost: number;            // 总费用
  partsCost: number;            // 零件费用
  laborCost: number;            // 人工费用
  technicianId: string;         // 技师ID
  technicianName: string;       // 技师姓名
  createdAt: string;            // 创建时间
  updatedAt: string;            // 更新时间
  estimatedTime: string;        // 预计修复时间
  warranty: string;             // 质保期限
  notes: string;                // 备注
  images: string[];             // 相关图片
}
```

### 订单状态
- `pending`: 待处理
- `in_progress`: 维修中
- `completed`: 已完成
- `cancelled`: 已取消

## 🔧 系统架构

```
src/
├── components/          # 可复用组件
│   ├── Navbar.tsx      # 导航栏
│   ├── Footer.tsx      # 页脚
│   ├── OrderCard.tsx   # 订单卡片
│   ├── StatCard.tsx    # 统计卡片
│   └── LoadingSpinner.tsx # 加载动画
├── pages/              # 页面组件
│   ├── HomePage.tsx    # 首页
│   ├── PricingPage.tsx # 报价页面
│   ├── QueryPage.tsx   # 查询页面
│   ├── LoginPage.tsx   # 登录页面
│   ├── TechnicianDashboard.tsx # 技师工作台
│   └── AdminDashboard.tsx # 管理员后台
├── lib/                # 工具库
│   ├── storage.ts      # 数据存储
│   ├── auth.ts         # 认证管理
│   ├── pricing.ts      # 价格计算
│   └── mockData.ts     # 模拟数据
└── App.tsx             # 主应用
```

## 🌈 界面预览

- **首页**: 展示公司形象和服务优势
- **报价系统**: 智能计算维修费用
- **订单查询**: 便捷的状态查询界面
- **技师工作台**: 专业的订单管理界面
- **管理后台**: 全面的数据分析和管理

## 📄 许可证

MIT License

---

**手机维修专家** - 让维修更简单，让管理更高效