import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 通过订单号查询订单（公开接口，不需要认证）
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const orderNumber = searchParams.get('orderNumber')
    
    if (!orderNumber) {
      return NextResponse.json({ error: 'Order number is required' }, { status: 400 })
    }

    const order = await prisma.order.findUnique({
      where: { orderNumber: orderNumber.toUpperCase() },
      include: {
        customer: {
          select: {
            name: true,
            phone: true
            // 不返回敏感信息
          }
        },
        technician: {
          include: {
            profile: {
              select: {
                fullName: true
              }
            }
          }
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' },
          select: {
            status: true,
            notes: true,
            createdAt: true
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // 返回公开信息，隐藏敏感数据
    const publicOrderInfo = {
      id: order.id,
      orderNumber: order.orderNumber,
      deviceBrand: order.deviceBrand,
      deviceModel: order.deviceModel,
      status: order.status,
      estimatedCompletion: order.estimatedCompletion,
      actualCompletion: order.actualCompletion,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      customerName: order.customer.name,
      technicianName: order.technician?.profile?.fullName,
      statusHistory: order.statusHistory
    }

    return NextResponse.json(publicOrderInfo)
  } catch (error) {
    console.error('Error looking up order:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}