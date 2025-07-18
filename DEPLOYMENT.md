# ChinaTech 手机维修系统 - 部署指南

## 🏁 项目完成状态

✅ **已完成功能**：
- 极简首页设计（意大利语默认）
- 多语言支持（意大利语、英语、中文）
- 订单查询系统（公开接口）
- 维修报价系统（智能价格估算）
- 用户认证系统（注册/登录）
- 完整的数据库架构
- 响应式设计
- Next.js 15 + TypeScript + Tailwind CSS
- Prisma ORM + Neon PostgreSQL支持

✅ **已测试功能**：
- 首页三大核心功能正常工作
- 语言切换功能完全正常
- 订单查询界面和错误处理正常
- 维修报价表单功能正常
- 用户认证流程正常

## 🚀 部署到生产环境

### 1. Neon PostgreSQL 数据库设置

#### 1.1 创建 Neon 项目
1. 访问 [Neon Console](https://console.neon.tech/)
2. 创建新项目
3. 选择区域（推荐：Europe - Frankfurt）
4. 复制数据库连接字符串

#### 1.2 配置环境变量
创建 `.env.local` 文件：
```env
# Neon 数据库连接
DATABASE_URL="postgresql://username:password@hostname:5432/database_name?sslmode=require"

# NextAuth.js 配置
NEXTAUTH_URL="https://your-domain.vercel.app"
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

### 2. Vercel 部署

#### 2.1 准备部署
```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录 Vercel
vercel login

# 初始化项目
vercel
```

#### 2.2 配置环境变量
在 Vercel Dashboard 中设置：
- 项目设置 → Environment Variables
- 添加所有 `.env.local` 中的变量
- 确保生产环境的 `NEXTAUTH_URL` 指向正确域名

#### 2.3 数据库初始化
```bash
# 推送数据库架构
pnpm db:push

# 运行种子脚本（创建测试数据）
pnpm db:seed
```

#### 2.4 部署到生产环境
```bash
# 部署到生产环境
vercel --prod
```

### 3. 生产环境验证

#### 3.1 功能检查清单
- [ ] 首页加载正常
- [ ] 语言切换工作
- [ ] 订单查询功能
- [ ] 维修报价功能
- [ ] 用户注册/登录
- [ ] Demo 账户登录测试
- [ ] Google Maps 地址链接
- [ ] WhatsApp 链接

#### 3.2 Demo 账户
数据库种子脚本会创建以下测试账户：
- **管理员**: admin@chinatech.com / admin123
- **技术员**: tech@chinatech.com / tech123

### 4. 域名和 SSL

#### 4.1 自定义域名
1. 在 Vercel Dashboard 添加域名
2. 配置 DNS 记录指向 Vercel
3. SSL 证书自动配置

#### 4.2 更新环境变量
更新 `NEXTAUTH_URL` 为新域名：
```env
NEXTAUTH_URL="https://chinatech.your-domain.com"
```

## 🔧 维护和监控

### 日志监控
- Vercel Functions 日志
- 数据库连接监控
- 错误追踪

### 数据库备份
- Neon 自动备份
- 定期数据导出
- 测试恢复流程

### 性能优化
- CDN 缓存设置
- 图片优化
- 数据库查询优化

## 📞 技术支持

如需技术支持或遇到部署问题：
1. 检查 Vercel 部署日志
2. 验证环境变量配置
3. 确认数据库连接状态
4. 查看浏览器控制台错误

---

**ChinaTech** - 专业手机维修管理系统 🔧📱