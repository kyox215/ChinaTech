import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// 获取单个订单详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        technician: {
          include: {
            profile: true
          }
        },
        device: true,
        statusHistory: {
          orderBy: { createdAt: 'desc' }
        },
        usedParts: {
          include: {
            inventoryItem: true
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// 更新订单
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { status, notes, estimatedCost, finalCost, technicianId } = body

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        technician: true
      }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // 权限检查：技术员只能更新分配给自己的订单或接取未分配的订单
    if (session.user.role === 'TECHNICIAN') {
      const profile = await prisma.profile.findUnique({
        where: { userId: session.user.id },
        include: { technician: true }
      })
      
      if (!profile?.technician) {
        return NextResponse.json({ error: 'Technician profile not found' }, { status: 404 })
      }
      
      // 如果是接取订单（technicianId参数存在且订单未分配）
      if (technicianId && !order.technicianId) {
        // 技术员只能将订单分配给自己
        if (technicianId !== profile.technician.id) {
          return NextResponse.json({ error: 'Can only assign to yourself' }, { status: 403 })
        }
      } else if (order.technicianId && order.technicianId !== profile.technician.id) {
        // 技术员只能更新分配给自己的订单
        return NextResponse.json({ error: 'Can only update your own orders' }, { status: 403 })
      }
    }

    // 准备更新数据
    const updateData: any = {}
    if (status) updateData.status = status
    if (estimatedCost !== undefined) updateData.estimatedCost = estimatedCost
    if (finalCost !== undefined) updateData.finalCost = finalCost
    if (notes) updateData.notes = notes
    
    // 处理技术员分配
    if (technicianId) {
      if (session.user.role === 'ADMIN' || !order.technicianId) {
        updateData.technicianId = technicianId
      }
    }

    // 更新订单
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        customer: true,
        technician: true
      }
    })

    // 如果状态发生变化，记录历史
    if (status && status !== order.status) {
      await prisma.orderStatusHistory.create({
        data: {
          orderId: id,
          status,
          notes: notes || `状态更新为 ${status}`,
          changedBy: session.user.id
        }
      })
    }

    // 如果技术员有变化，也创建历史记录
    if (technicianId && technicianId !== order.technicianId) {
      await prisma.orderStatusHistory.create({
        data: {
          orderId: id,
          status: order.status,
          notes: `技术员已分配`,
          changedBy: session.user.id
        }
      })
    }

    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// 删除订单
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    await prisma.order.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting order:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}