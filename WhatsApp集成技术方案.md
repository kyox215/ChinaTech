# WhatsApp Business API 集成技术方案

**作者：** MiniMax Agent  
**日期：** 2025-07-17

## 🌍 WhatsApp集成概述

### 为什么选择WhatsApp？
- **全球用户基础**：超过20亿活跃用户，覆盖180+国家
- **海外市场主流**：在欧美、南美、东南亚等地区占主导地位
- **企业级支持**：WhatsApp Business API提供完整的企业服务解决方案
- **安全可靠**：端到端加密，符合国际隐私保护标准

## 🔧 技术实现方案

### 1. WhatsApp Business API集成架构

```typescript
// WhatsApp API配置
interface WhatsAppConfig {
  baseURL: string;
  accessToken: string;
  phoneNumberId: string;
  businessAccountId: string;
  webhookVerifyToken: string;
}

// 消息类型定义
interface WhatsAppMessage {
  messaging_product: "whatsapp";
  to: string;
  type: "text" | "image" | "document" | "audio" | "video";
  text?: {
    body: string;
  };
  image?: {
    link: string;
    caption?: string;
  };
  document?: {
    link: string;
    filename: string;
    caption?: string;
  };
  audio?: {
    link: string;
  };
}
```

### 2. 核心功能实现

#### 消息发送服务
```typescript
class WhatsAppService {
  private config: WhatsAppConfig;
  
  constructor(config: WhatsAppConfig) {
    this.config = config;
  }

  // 发送文本消息
  async sendTextMessage(to: string, message: string): Promise<void> {
    const payload: WhatsAppMessage = {
      messaging_product: "whatsapp",
      to: to,
      type: "text",
      text: {
        body: message
      }
    };

    await this.sendMessage(payload);
  }

  // 发送图片消息
  async sendImageMessage(to: string, imageUrl: string, caption?: string): Promise<void> {
    const payload: WhatsAppMessage = {
      messaging_product: "whatsapp",
      to: to,
      type: "image",
      image: {
        link: imageUrl,
        caption: caption
      }
    };

    await this.sendMessage(payload);
  }

  // 发送文档
  async sendDocument(to: string, documentUrl: string, filename: string): Promise<void> {
    const payload: WhatsAppMessage = {
      messaging_product: "whatsapp",
      to: to,
      type: "document",
      document: {
        link: documentUrl,
        filename: filename
      }
    };

    await this.sendMessage(payload);
  }

  // 统一发送接口
  private async sendMessage(payload: WhatsAppMessage): Promise<void> {
    const response = await fetch(
      `${this.config.baseURL}/${this.config.phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      throw new Error(`WhatsApp API Error: ${response.statusText}`);
    }
  }
}
```

#### Webhook处理服务
```typescript
// Webhook事件处理
export async function handleWhatsAppWebhook(req: NextRequest) {
  const body = await req.json();
  
  // 验证Webhook
  if (req.method === 'GET') {
    const mode = req.nextUrl.searchParams.get('hub.mode');
    const token = req.nextUrl.searchParams.get('hub.verify_token');
    const challenge = req.nextUrl.searchParams.get('hub.challenge');

    if (mode === 'subscribe' && token === process.env.WEBHOOK_VERIFY_TOKEN) {
      return new Response(challenge, { status: 200 });
    }
    return new Response('Forbidden', { status: 403 });
  }

  // 处理消息事件
  if (body.object === 'whatsapp_business_account') {
    for (const entry of body.entry) {
      for (const change of entry.changes) {
        if (change.field === 'messages') {
          await processIncomingMessage(change.value);
        }
      }
    }
  }

  return new Response('OK', { status: 200 });
}

// 处理收到的消息
async function processIncomingMessage(value: any) {
  const { messages, contacts } = value;
  
  if (messages) {
    for (const message of messages) {
      const from = message.from;
      const messageId = message.id;
      const timestamp = message.timestamp;
      
      // 根据消息类型处理
      switch (message.type) {
        case 'text':
          await handleTextMessage(from, message.text.body, messageId);
          break;
        case 'image':
          await handleImageMessage(from, message.image, messageId);
          break;
        case 'document':
          await handleDocumentMessage(from, message.document, messageId);
          break;
        case 'audio':
          await handleAudioMessage(from, message.audio, messageId);
          break;
      }
    }
  }
}
```

### 3. 数据库集成

```sql
-- WhatsApp通信记录表
CREATE TABLE whatsapp_communications (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id),
    customer_phone VARCHAR(20) NOT NULL,
    technician_id INTEGER REFERENCES users(id),
    message_type VARCHAR(20) NOT NULL, -- text, image, document, audio, video
    message_content TEXT,
    file_url VARCHAR(500),
    file_name VARCHAR(255),
    message_direction VARCHAR(10) NOT NULL, -- inbound, outbound
    whatsapp_message_id VARCHAR(100) UNIQUE,
    delivery_status VARCHAR(20) DEFAULT 'pending', -- pending, delivered, read, failed
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    delivered_at TIMESTAMP,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX idx_whatsapp_order_id ON whatsapp_communications(order_id);
CREATE INDEX idx_whatsapp_customer_phone ON whatsapp_communications(customer_phone);
CREATE INDEX idx_whatsapp_technician_id ON whatsapp_communications(technician_id);
CREATE INDEX idx_whatsapp_message_direction ON whatsapp_communications(message_direction);
CREATE INDEX idx_whatsapp_sent_at ON whatsapp_communications(sent_at);

-- WhatsApp模板消息表
CREATE TABLE whatsapp_templates (
    id SERIAL PRIMARY KEY,
    template_name VARCHAR(100) NOT NULL UNIQUE,
    template_content TEXT NOT NULL,
    language_code VARCHAR(10) DEFAULT 'en',
    category VARCHAR(50) NOT NULL, -- order_update, appointment, promotion, etc.
    variables JSON, -- 模板变量定义
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4. 模板消息系统

```typescript
// 模板消息管理
class WhatsAppTemplateService {
  async sendOrderStatusUpdate(
    customerPhone: string, 
    orderNumber: string, 
    status: string
  ): Promise<void> {
    const template = {
      name: "order_status_update",
      language: { code: "en" },
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: orderNumber },
            { type: "text", text: status }
          ]
        }
      ]
    };

    await this.sendTemplateMessage(customerPhone, template);
  }

  async sendAppointmentReminder(
    customerPhone: string,
    appointmentDate: string,
    deviceModel: string
  ): Promise<void> {
    const template = {
      name: "appointment_reminder",
      language: { code: "en" },
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: appointmentDate },
            { type: "text", text: deviceModel }
          ]
        }
      ]
    };

    await this.sendTemplateMessage(customerPhone, template);
  }

  private async sendTemplateMessage(to: string, template: any): Promise<void> {
    const payload = {
      messaging_product: "whatsapp",
      to: to,
      type: "template",
      template: template
    };

    // 发送模板消息的具体实现
    await this.whatsAppService.sendMessage(payload);
  }
}
```

## 🎯 业务场景集成

### 1. 订单状态更新通知

```typescript
// 订单状态变更时自动发送WhatsApp消息
export async function notifyOrderStatusUpdate(
  orderId: number, 
  newStatus: string
) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { customer: true }
  });

  if (order && order.customer.whatsapp_number) {
    const whatsAppService = new WhatsAppService(whatsAppConfig);
    
    const statusMessages = {
      'received': '我们已收到您的维修订单，正在安排技术员处理。',
      'in_progress': '您的设备正在维修中，我们会及时更新进度。',
      'completed': '维修已完成！请您前来取件。',
      'ready_for_pickup': '您的设备已准备好取件，营业时间内随时可来。'
    };

    const message = statusMessages[newStatus] || `订单状态已更新为：${newStatus}`;
    
    await whatsAppService.sendTextMessage(
      order.customer.whatsapp_number,
      `订单 #${order.order_number}: ${message}`
    );

    // 记录通信日志
    await prisma.whatsappCommunication.create({
      data: {
        order_id: orderId,
        customer_phone: order.customer.whatsapp_number,
        message_type: 'text',
        message_content: message,
        message_direction: 'outbound',
        delivery_status: 'sent'
      }
    });
  }
}
```

### 2. 技术员沟通界面

```typescript
// 技术员端WhatsApp集成组件
export default function TechnicianWhatsAppPanel({ orderId }: { orderId: number }) {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // 加载历史消息
  useEffect(() => {
    loadWhatsAppHistory(orderId);
  }, [orderId]);

  const sendMessage = async () => {
    if (!newMessage.trim() && !selectedFile) return;

    try {
      if (selectedFile) {
        // 上传文件并发送
        const fileUrl = await uploadFile(selectedFile);
        await sendWhatsAppFile(orderId, fileUrl, selectedFile.name);
      } else {
        // 发送文本消息
        await sendWhatsAppText(orderId, newMessage);
      }
      
      setNewMessage('');
      setSelectedFile(null);
      await loadWhatsAppHistory(orderId); // 刷新消息列表
    } catch (error) {
      console.error('发送消息失败:', error);
    }
  };

  return (
    <div className="whatsapp-panel">
      <div className="message-history">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.direction}`}>
            <div className="message-content">
              {msg.type === 'text' && <p>{msg.content}</p>}
              {msg.type === 'image' && <img src={msg.file_url} alt="图片" />}
              {msg.type === 'document' && (
                <a href={msg.file_url} download={msg.file_name}>
                  📄 {msg.file_name}
                </a>
              )}
            </div>
            <div className="message-time">
              {formatTime(msg.sent_at)}
            </div>
          </div>
        ))}
      </div>
      
      <div className="message-input">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="输入消息..."
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
        />
        <input
          type="file"
          onChange={(e) => setSelectedFile(e.files?.[0] || null)}
          accept="image/*,application/pdf,.doc,.docx"
        />
        <button onClick={sendMessage} disabled={!newMessage.trim() && !selectedFile}>
          发送
        </button>
      </div>
    </div>
  );
}
```

## 🔧 部署和配置

### 1. 环境变量配置

```env
# WhatsApp Business API配置
WHATSAPP_ACCESS_TOKEN=your_access_token_here
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_webhook_verify_token
WHATSAPP_API_BASE_URL=https://graph.facebook.com/v18.0

# Webhook URL配置 (Vercel部署后的URL)
WHATSAPP_WEBHOOK_URL=https://your-app.vercel.app/api/whatsapp/webhook
```

### 2. Vercel部署配置

```json
// vercel.json
{
  "functions": {
    "pages/api/whatsapp/webhook.ts": {
      "maxDuration": 30
    }
  },
  "env": {
    "WHATSAPP_ACCESS_TOKEN": "@whatsapp-access-token",
    "WHATSAPP_PHONE_NUMBER_ID": "@whatsapp-phone-number-id",
    "WHATSAPP_BUSINESS_ACCOUNT_ID": "@whatsapp-business-account-id",
    "WHATSAPP_WEBHOOK_VERIFY_TOKEN": "@whatsapp-webhook-verify-token"
  }
}
```

### 3. WhatsApp Business平台设置

```bash
# 1. 设置Webhook URL
curl -X POST \
  "https://graph.facebook.com/v18.0/${WHATSAPP_BUSINESS_ACCOUNT_ID}/subscriptions" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "object": "whatsapp_business_account",
    "callback_url": "https://your-app.vercel.app/api/whatsapp/webhook",
    "verify_token": "your_verify_token",
    "fields": "messages"
  }'

# 2. 验证Webhook
curl -X GET \
  "https://your-app.vercel.app/api/whatsapp/webhook?hub.mode=subscribe&hub.challenge=challenge_string&hub.verify_token=your_verify_token"
```

## 📊 监控和分析

### 1. 消息统计Dashboard

```typescript
// WhatsApp消息统计API
export async function getWhatsAppStats(timeRange: string) {
  const stats = await prisma.whatsappCommunication.groupBy({
    by: ['message_type', 'message_direction'],
    where: {
      sent_at: {
        gte: getTimeRangeStart(timeRange)
      }
    },
    _count: {
      id: true
    }
  });

  return {
    totalMessages: stats.reduce((sum, stat) => sum + stat._count.id, 0),
    byType: stats.reduce((acc, stat) => {
      acc[stat.message_type] = (acc[stat.message_type] || 0) + stat._count.id;
      return acc;
    }, {}),
    byDirection: stats.reduce((acc, stat) => {
      acc[stat.message_direction] = (acc[stat.message_direction] || 0) + stat._count.id;
      return acc;
    }, {})
  };
}
```

### 2. 性能监控

```typescript
// 消息发送成功率监控
export async function getDeliveryStats() {
  const deliveryStats = await prisma.whatsappCommunication.groupBy({
    by: ['delivery_status'],
    where: {
      message_direction: 'outbound',
      sent_at: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // 最近24小时
      }
    },
    _count: {
      id: true
    }
  });

  const total = deliveryStats.reduce((sum, stat) => sum + stat._count.id, 0);
  const delivered = deliveryStats
    .filter(stat => stat.delivery_status === 'delivered')
    .reduce((sum, stat) => sum + stat._count.id, 0);

  return {
    total,
    delivered,
    deliveryRate: total > 0 ? (delivered / total) * 100 : 0
  };
}
```

## 💰 成本控制

### 1. 消息费用管理

```typescript
// WhatsApp消息费用计算
const WHATSAPP_PRICING = {
  'text': 0.005, // $0.005 per message
  'image': 0.005,
  'document': 0.005,
  'audio': 0.005,
  'template': 0.009 // 模板消息稍贵
};

export async function calculateWhatsAppCosts(month: number, year: number) {
  const messages = await prisma.whatsappCommunication.findMany({
    where: {
      message_direction: 'outbound',
      sent_at: {
        gte: new Date(year, month - 1, 1),
        lt: new Date(year, month, 1)
      }
    },
    select: {
      message_type: true
    }
  });

  const costs = messages.reduce((acc, message) => {
    const cost = WHATSAPP_PRICING[message.message_type] || 0.005;
    return acc + cost;
  }, 0);

  return {
    totalMessages: messages.length,
    totalCost: costs,
    averageCostPerMessage: messages.length > 0 ? costs / messages.length : 0
  };
}
```

### 2. 消息发送限制

```typescript
// 防止消息滥用的限制机制
export class WhatsAppRateLimiter {
  private static dailyLimits = new Map<string, number>();
  private static readonly DAILY_LIMIT = 1000; // 每个号码每天最多1000条消息

  static async checkRateLimit(phoneNumber: string): Promise<boolean> {
    const today = new Date().toDateString();
    const key = `${phoneNumber}-${today}`;
    
    const currentCount = this.dailyLimits.get(key) || 0;
    
    if (currentCount >= this.DAILY_LIMIT) {
      return false; // 超出限制
    }
    
    this.dailyLimits.set(key, currentCount + 1);
    return true; // 可以发送
  }

  static async getUsageStats(phoneNumber: string): Promise<{used: number, limit: number}> {
    const today = new Date().toDateString();
    const key = `${phoneNumber}-${today}`;
    
    return {
      used: this.dailyLimits.get(key) || 0,
      limit: this.DAILY_LIMIT
    };
  }
}
```

## 🔒 安全和合规

### 1. 数据隐私保护

```typescript
// 消息内容加密存储
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.MESSAGE_ENCRYPTION_KEY;

export function encryptMessage(message: string): string {
  const cipher = crypto.createCipher('aes-256-cbc', ENCRYPTION_KEY);
  let encrypted = cipher.update(message, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

export function decryptMessage(encryptedMessage: string): string {
  const decipher = crypto.createDecipher('aes-256-cbc', ENCRYPTION_KEY);
  let decrypted = decipher.update(encryptedMessage, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
```

### 2. 合规性要求

```typescript
// GDPR合规 - 数据保留和删除
export async function cleanupOldMessages() {
  const retentionPeriod = 365; // 保留365天
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionPeriod);

  // 删除超过保留期的消息
  await prisma.whatsappCommunication.deleteMany({
    where: {
      sent_at: {
        lt: cutoffDate
      }
    }
  });
}

// 用户数据删除请求处理
export async function deleteUserWhatsAppData(phoneNumber: string) {
  await prisma.whatsappCommunication.deleteMany({
    where: {
      customer_phone: phoneNumber
    }
  });
}
```

---

## 🎯 总结

这个WhatsApp集成方案提供了：

1. **完整的API集成** - 支持文本、图片、文档、音频消息
2. **企业级功能** - 模板消息、Webhook处理、批量发送
3. **数据库集成** - 完整的消息记录和统计
4. **成本控制** - 费用监控和发送限制
5. **安全合规** - 数据加密和隐私保护
6. **监控分析** - 详细的使用统计和性能监控

这将为您的手机维修业务提供强大的国际化沟通能力，特别适合海外市场的客户服务需求。