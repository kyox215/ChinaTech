# ChinaTech 手机维修订单管理系统

一个现代化的手机维修订单管理系统，专为ChinaTech维修店设计。

## 🎯 项目概述

这是一个功能完整的手机维修订单管理系统，采用极简设计理念，支持多用户角色（客户、技术员、管理员），提供完整的订单状态追踪和管理功能。

### ✨ 核心特性

- **极简首页设计**：专注核心功能，去除冗余信息
- **多语言支持**：意大利语（默认）、英语、中文
- **多用户角色**：客户、技术员、管理员
- **订单状态追踪**：6阶段可视化追踪系统
- **技术员自主选择订单系统**：提高工作效率
- **管理员仪表盘**：完整的统计和管理功能
- **移动端优化**：技术员工作台专为移动设备优化
- **响应式设计**：适配所有设备

## 🏗️ 技术栈

- **前端**: Next.js 15 + React 19 + TypeScript + Tailwind CSS
- **数据库**: Neon PostgreSQL + Prisma ORM
- **认证**: NextAuth.js
- **部署**: Vercel
- **集成**: Google Maps API + WhatsApp Business API

## 🚀 快速开始

### 环境要求

- Node.js 18+
- pnpm (推荐) 或 npm
- Neon PostgreSQL 数据库

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd phone-repair-system
```

2. **安装依赖**
```bash
pnpm install
```

3. **环境配置**
```bash
cp .env.example .env.local
```

编辑 `.env.local` 文件：
```env
# Neon 数据库连接
DATABASE_URL="postgresql://username:password@hostname:5432/database_name?sslmode=require"

# NextAuth.js 配置
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-key-here"

# Google Maps API
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="AIzaSyCO0kKndUNlmQi3B5mxy4dblg_8WYcuKuk"

# WhatsApp Business API (可选)
WHATSAPP_ACCESS_TOKEN="your-whatsapp-token"
WHATSAPP_PHONE_NUMBER_ID="your-phone-number-id"
WHATSAPP_WEBHOOK_VERIFY_TOKEN="your-verify-token"

# 公司信息配置
NEXT_PUBLIC_COMPANY_NAME="ChinaTech"
NEXT_PUBLIC_COMPANY_PHONE="+39 123 456 7890"
NEXT_PUBLIC_COMPANY_ADDRESS="Via Roma 123, 20100 Milano, Italy"
NEXT_PUBLIC_BUSINESS_HOURS="Lunedì - Sabato: 9:00 - 19:00"
```

4. **数据库设置**
```bash
# 推送数据库架构
pnpm db:push

# 运行种子脚本（创建测试数据）
pnpm db:seed
```

5. **启动开发服务器**
```bash
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用程序。

## 📱 功能演示

由于完整功能需要数据库连接，我们提供了演示页面：

### 管理员仪表盘演示
访问：`/admin/demo`
- 完整的统计概览
- 订单管理表格
- 搜索和过滤功能
- 快速操作工具

### 技术员工作台演示
访问：`/technician/demo`
- 移动端优化界面
- 订单池系统
- 交互式订单管理
- 客户联系工具

## 🎨 设计理念

### 极简设计
- 专注核心功能，删除所有冗余信息
- 清晰的视觉层次
- 直观的用户交互

### 多语言支持
- 意大利语（首页默认）
- 英语
- 中文（管理后台默认）

### 响应式设计
- 桌面端：管理员界面优化
- 移动端：技术员工作台优化
- 通用：客户查询界面

## 📊 用户角色

### 客户
- 订单查询（通过订单号）
- 维修报价申请
- 订单状态实时查看

### 技术员
- 自主选择订单池
- 订单状态更新
- 客户沟通工具
- 工作负载管理

### 管理员
- 完整订单管理
- 统计数据分析
- 用户和权限管理
- 系统配置

## 🔧 API 端点

### 公开接口
```
GET  /api/orders/lookup?orderNumber=CT001  # 订单查询
POST /api/quote                           # 维修报价
POST /api/auth/register                   # 用户注册
```

### 认证接口
```
GET    /api/orders                # 订单列表
POST   /api/orders               # 创建订单
GET    /api/orders/[id]          # 订单详情
PATCH  /api/orders/[id]          # 更新订单
DELETE /api/orders/[id]          # 删除订单
GET    /api/technicians          # 技术员列表
POST   /api/technicians          # 创建技术员
```

## 📦 项目结构

```
src/
├── app/                          # Next.js App Router
│   ├── admin/                    # 管理员页面
│   │   ├── dashboard/           # 管理员仪表盘
│   │   └── demo/                # 管理员演示页面
│   ├── technician/              # 技术员页面
│   │   ├── dashboard/           # 技术员工作台
│   │   └── demo/                # 技术员演示页面
│   ├── auth/                    # 认证页面
│   ├── api/                     # API 路由
│   ├── order-lookup/            # 订单查询
│   └── quote/                   # 维修报价
├── components/                   # React 组件
│   ├── ui/                      # UI 基础组件
│   ├── ChinaTechLogo.tsx       # 公司Logo
│   ├── LanguageSwitcher.tsx    # 语言切换器
│   └── OrderStatusTracker.tsx  # 订单状态追踪
├── contexts/                    # React Contexts
├── lib/                         # 工具库
│   ├── auth.ts                 # 认证配置
│   ├── prisma.ts               # 数据库客户端
│   ├── translations.ts         # 多语言配置
│   └── utils.ts                # 工具函数
└── types/                       # TypeScript 类型定义

prisma/
├── schema.prisma               # 数据库架构
└── seed.ts                     # 数据种子脚本
```

## 🌍 多语言配置

系统支持三种语言，配置在 `src/lib/translations.ts`：

```typescript
export const translations = {
  it: { /* 意大利语翻译 */ },
  en: { /* 英语翻译 */ },
  zh: { /* 中文翻译 */ }
}
```

## 📋 订单状态流程

```
RECEIVED → DIAGNOSING → REPAIRING → TESTING → COMPLETED → READY_PICKUP → DELIVERED
已接收    检测中        维修中      测试中     完成        可取件         已交付
```

## 🔐 认证系统

使用 NextAuth.js 实现认证，支持：
- 邮箱/密码登录
- 会话管理
- 角色权限控制

### Demo 账户
```
管理员: admin@chinatech.com / admin123
技术员: tech@chinatech.com / tech123
```

## 📱 WhatsApp 集成

系统预留了 WhatsApp Business API 接口：
- 客户通知功能
- 技术员快速联系
- 状态更新通知

## 🗺️ Google Maps 集成

- 地址导航链接
- 店铺位置显示
- 一键导航功能

## 🚀 部署到 Vercel

1. **连接 GitHub**
```bash
vercel --prod
```

2. **配置环境变量**
在 Vercel Dashboard 中设置所有环境变量

3. **数据库迁移**
```bash
pnpm db:push
pnpm db:seed
```

详细部署指南请参考 [DEPLOYMENT.md](./DEPLOYMENT.md)

## 📖 可用脚本

```bash
pnpm dev          # 启动开发服务器
pnpm build        # 构建生产版本
pnpm start        # 启动生产服务器
pnpm lint         # 代码检查
pnpm db:push      # 推送数据库架构
pnpm db:seed      # 运行种子脚本
pnpm db:studio    # 打开 Prisma Studio
```

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

此项目仅供学习和参考使用。

## 📞 联系方式

- **项目**: ChinaTech 手机维修管理系统
- **技术支持**: 请通过 GitHub Issues 联系

---

**ChinaTech** - 专业手机维修管理系统 🔧📱

*现代化 · 高效 · 可靠*