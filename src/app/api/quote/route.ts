import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 维修报价接口（公开接口）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { deviceBrand, deviceModel, issueDescription, customerEmail } = body

    if (!deviceBrand || !deviceModel || !issueDescription) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // 查找设备类型获取基础价格
    const device = await prisma.repairDevice.findFirst({
      where: {
        brand: {
          contains: deviceBrand,
          mode: 'insensitive'
        },
        model: {
          contains: deviceModel,
          mode: 'insensitive'
        }
      }
    })

    // 基础价格计算逻辑
    let basePrice = device?.baseRepairPrice || 50 // 默认基础价格
    let estimatedPrice = Number(basePrice)

    // 根据问题描述调整价格（简单的价格估算逻辑）
    const issueKeywords = issueDescription.toLowerCase()
    
    if (issueKeywords.includes('screen') || issueKeywords.includes('display') || issueKeywords.includes('schermo')) {
      estimatedPrice += 80 // 屏幕维修
    } else if (issueKeywords.includes('battery') || issueKeywords.includes('batteria')) {
      estimatedPrice += 40 // 电池更换
    } else if (issueKeywords.includes('water') || issueKeywords.includes('liquid') || issueKeywords.includes('acqua')) {
      estimatedPrice += 60 // 进水维修
    } else if (issueKeywords.includes('motherboard') || issueKeywords.includes('logic') || issueKeywords.includes('scheda madre')) {
      estimatedPrice += 150 // 主板维修
    } else {
      estimatedPrice += 30 // 其他问题
    }

    // 创建报价记录（可选）
    // const quote = await prisma.quote.create({
    //   data: {
    //     deviceBrand,
    //     deviceModel,
    //     issueDescription,
    //     estimatedPrice,
    //     customerEmail
    //   }
    // })

    const quote = {
      deviceBrand,
      deviceModel,
      issueDescription,
      estimatedPrice,
      currency: 'EUR',
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30天有效
      notes: '此价格为初步估算，实际价格可能根据检测结果有所调整。',
      createdAt: new Date()
    }

    return NextResponse.json(quote)
  } catch (error) {
    console.error('Error creating quote:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}