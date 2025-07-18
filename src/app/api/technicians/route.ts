import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// 获取技术员列表
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'TECHNICIAN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const technicians = await prisma.technician.findMany({
      include: {
        profile: {
          select: {
            fullName: true,
            phone: true,
            isActive: true
          }
        },
        _count: {
          select: {
            orders: {
              where: {
                status: {
                  notIn: ['COMPLETED', 'DELIVERED', 'CANCELLED']
                }
              }
            }
          }
        }
      },
      orderBy: {
        profile: {
          fullName: 'asc'
        }
      }
    })

    return NextResponse.json(technicians)
  } catch (error) {
    console.error('Error fetching technicians:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// 创建技术员
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { userId, specialization, maxOrdersLimit = 10 } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // 检查用户是否存在
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // 检查是否已经是技术员
    const existingTechnician = await prisma.technician.findUnique({
      where: { profileId: user.profile!.id }
    })

    if (existingTechnician) {
      return NextResponse.json({ error: 'User is already a technician' }, { status: 400 })
    }

    // 更新用户角色为技术员
    await prisma.profile.update({
      where: { id: user.profile!.id },
      data: { role: 'TECHNICIAN' }
    })

    // 创建技术员记录
    const technician = await prisma.technician.create({
      data: {
        profileId: user.profile!.id,
        specialization,
        maxOrdersLimit
      },
      include: {
        profile: true
      }
    })

    return NextResponse.json(technician, { status: 201 })
  } catch (error) {
    console.error('Error creating technician:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}