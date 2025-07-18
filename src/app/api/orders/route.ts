import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateOrderNumber } from '@/lib/utils'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// 获取订单列表
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const status = searchParams.get('status')
    const technicianFilter = searchParams.get('technician')
    const unassigned = searchParams.get('unassigned') === 'true'
    
    const skip = (page - 1) * limit
    
    const where: any = {}
    if (status && status !== 'ALL') where.status = status
    
    // 处理技术员过滤
    if (technicianFilter === 'me' && session.user.role === 'TECHNICIAN') {
      const profile = await prisma.profile.findUnique({
        where: { userId: session.user.id },
        include: { technician: true }
      })
      if (profile?.technician) {
        where.technicianId = profile.technician.id
      }
    } else if (unassigned) {
      where.technicianId = null
    }
    
    // 管理员可以查看所有订单，技术员只能查看分配给自己的或未分配的
    if (session.user.role === 'TECHNICIAN' && !unassigned && technicianFilter !== 'me') {
      const profile = await prisma.profile.findUnique({
        where: { userId: session.user.id },
        include: { technician: true }
      })
      if (profile?.technician) {
        where.technicianId = profile.technician.id
      }
    }
    
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        include: {
          customer: true,
          technician: true,
          statusHistory: {
            orderBy: { createdAt: 'desc' },
            take: 5
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.order.count({ where })
    ])
    
    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// 创建新订单
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      customerName,
      customerPhone,
      customerEmail,
      deviceBrand,
      deviceModel,
      deviceImei,
      issueDescription,
      priority = 'NORMAL'
    } = body

    // 验证必要字段
    if (!customerName || !customerPhone || !deviceBrand || !deviceModel || !issueDescription) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // 查找或创建客户
    let customer = await prisma.customer.findFirst({
      where: {
        OR: [
          { phone: customerPhone },
          { email: customerEmail || '' }
        ]
      }
    })

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          name: customerName,
          phone: customerPhone,
          email: customerEmail
        }
      })
    }

    // 生成订单号
    let orderNumber: string
    let isUnique = false
    do {
      orderNumber = generateOrderNumber()
      const existing = await prisma.order.findUnique({
        where: { orderNumber }
      })
      isUnique = !existing
    } while (!isUnique)

    // 创建订单
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId: customer.id,
        deviceBrand,
        deviceModel,
        deviceImei,
        issueDescription,
        priority,
        status: 'RECEIVED'
      },
      include: {
        customer: true
      }
    })

    // 创建状态历史记录
    await prisma.orderStatusHistory.create({
      data: {
        orderId: order.id,
        status: 'RECEIVED',
        notes: 'Order created',
        changedBy: session.user.id
      }
    })

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}