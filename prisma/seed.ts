import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // 创建默认用户
  const adminPassword = await bcrypt.hash('admin123', 12)
  const techPassword = await bcrypt.hash('tech123', 12)

  // 管理员用户
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@chinatech.com' },
    update: {},
    create: {
      email: 'admin@chinatech.com',
      name: 'Admin ChinaTech',
      password: adminPassword,
    },
  })

  // 技术员用户
  const techUser = await prisma.user.upsert({
    where: { email: 'tech@chinatech.com' },
    update: {},
    create: {
      email: 'tech@chinatech.com',
      name: 'Marco Rossi',
      password: techPassword,
    },
  })

  // 创建用户配置
  await prisma.profile.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
      userId: adminUser.id,
      role: 'ADMIN',
      fullName: 'Admin ChinaTech',
      phone: '+39 123 456 7890',
      language: 'ITALIAN',
    },
  })

  const techProfile = await prisma.profile.upsert({
    where: { userId: techUser.id },
    update: {},
    create: {
      userId: techUser.id,
      role: 'TECHNICIAN',
      fullName: 'Marco Rossi',
      phone: '+39 123 456 7891',
      language: 'ITALIAN',
    },
  })

  // 创建技术员记录
  await prisma.technician.upsert({
    where: { profileId: techProfile.id },
    update: {},
    create: {
      profileId: techProfile.id,
      specialization: 'Smartphone e Tablet',
      maxOrdersLimit: 15,
    },
  })

  // 创建一些设备类型
  const deviceTypes = [
    { brand: 'Apple', model: 'iPhone 14', category: 'SMARTPHONE' as const, baseRepairPrice: 150, commonIssues: ['Schermo rotto', 'Batteria', 'Fotocamera'] },
    { brand: 'Apple', model: 'iPhone 13', category: 'SMARTPHONE' as const, baseRepairPrice: 130, commonIssues: ['Schermo rotto', 'Batteria', 'Altoparlanti'] },
    { brand: 'Samsung', model: 'Galaxy S23', category: 'SMARTPHONE' as const, baseRepairPrice: 140, commonIssues: ['Schermo rotto', 'Batteria', 'Ricarica'] },
    { brand: 'Samsung', model: 'Galaxy S22', category: 'SMARTPHONE' as const, baseRepairPrice: 120, commonIssues: ['Schermo rotto', 'Batteria', 'Fotocamera'] },
    { brand: 'Huawei', model: 'P50 Pro', category: 'SMARTPHONE' as const, baseRepairPrice: 110, commonIssues: ['Schermo rotto', 'Batteria', 'Sistema'] },
  ]

  for (const device of deviceTypes) {
    await prisma.repairDevice.upsert({
      where: { 
        brand_model: {
          brand: device.brand,
          model: device.model,
        }
      },
      update: {},
      create: device,
    })
  }

  // 创建一些客户
  const customerData = [
    { name: 'Giuseppe Verdi', phone: '+39 331 123 4567', email: 'giuseppe@email.com' },
    { name: 'Maria Bianchi', phone: '+39 331 123 4568', email: 'maria@email.com' },
    { name: 'Luca Ferrari', phone: '+39 331 123 4569', email: 'luca@email.com' },
  ]

  for (const customer of customerData) {
    const existing = await prisma.customer.findFirst({
      where: { phone: customer.phone }
    })
    
    if (!existing) {
      await prisma.customer.create({
        data: customer
      })
    }
  }

  // 创建一些供应商
  const supplierData = [
    { name: 'TechParts Italia', contactPerson: 'Alessandro Conti', phone: '+39 02 123 456', email: 'info@techparts.it' },
    { name: 'Mobile Components SRL', contactPerson: 'Francesca Russo', phone: '+39 02 789 012', email: 'ordini@mobilecomp.it' },
  ]

  for (const supplier of supplierData) {
    const existing = await prisma.supplier.findFirst({
      where: { name: supplier.name }
    })
    
    if (!existing) {
      await prisma.supplier.create({
        data: supplier
      })
    }
  }

  // 创建测试订单数据
  console.log('Creating test orders...')
  
  const customers = await prisma.customer.findMany()
  const technician = await prisma.technician.findFirst()
  const repairDevices = await prisma.repairDevice.findMany()

  if (customers.length > 0 && technician) {
    const testOrders = [
      {
        orderNumber: 'CT001',
        customerId: customers[0].id,
        technicianId: technician.id,
        deviceBrand: 'Apple',
        deviceModel: 'iPhone 14',
        deviceImei: '123456789012345',
        issueDescription: 'Schermo rotto dopo caduta',
        status: 'COMPLETED' as const,
        estimatedCost: 150.00,
        finalCost: 140.00,
        priority: 'NORMAL' as const,
        actualCompletion: new Date(),
        customerContacted: true
      },
      {
        orderNumber: 'RT002',
        customerId: customers[1] ? customers[1].id : customers[0].id,
        technicianId: technician.id,
        deviceBrand: 'Samsung',
        deviceModel: 'Galaxy S23',
        deviceImei: '987654321098765',
        issueDescription: 'Problemi di ricarica - non carica correttamente',
        status: 'REPAIRING' as const,
        estimatedCost: 80.00,
        priority: 'HIGH' as const,
        estimatedCompletion: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        customerContacted: true
      },
      {
        orderNumber: 'MT003',
        customerId: customers[2] ? customers[2].id : customers[0].id,
        deviceBrand: 'Huawei',
        deviceModel: 'P50 Pro',
        deviceImei: '456789123456789',
        issueDescription: 'Dispositivo bagnato, non si accende',
        status: 'DIAGNOSING' as const,
        estimatedCost: 120.00,
        priority: 'URGENT' as const,
        customerContacted: false
      },
      {
        orderNumber: 'LT004',
        customerId: customers[0].id,
        deviceBrand: 'Apple',
        deviceModel: 'iPhone 13',
        deviceImei: '789123456789123',
        issueDescription: 'Batteria si scarica rapidamente',
        status: 'RECEIVED' as const,
        priority: 'LOW' as const,
        customerContacted: false
      },
      {
        orderNumber: 'ST005',
        customerId: customers[1] ? customers[1].id : customers[0].id,
        technicianId: technician.id,
        deviceBrand: 'Samsung',
        deviceModel: 'Galaxy S22',
        deviceImei: '321654987321654',
        issueDescription: 'Fotocamera posteriore non funziona',
        status: 'READY_PICKUP' as const,
        estimatedCost: 90.00,
        finalCost: 85.00,
        priority: 'NORMAL' as const,
        actualCompletion: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        customerContacted: true
      }
    ]

    for (const orderData of testOrders) {
      const order = await prisma.order.create({
        data: orderData
      })

      // 为每个订单创建状态历史
      const statusHistory = []
      
      switch (orderData.status) {
        case 'COMPLETED':
          statusHistory.push(
            { orderId: order.id, status: 'RECEIVED' as const, notes: 'Ordine ricevuto dal cliente', createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
            { orderId: order.id, status: 'DIAGNOSING' as const, notes: 'Iniziata diagnosi del dispositivo', createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
            { orderId: order.id, status: 'REPAIRING' as const, notes: 'Riparazione in corso', createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
            { orderId: order.id, status: 'TESTING' as const, notes: 'Test finale del dispositivo', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
            { orderId: order.id, status: 'COMPLETED' as const, notes: 'Riparazione completata con successo', createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) }
          )
          break
        case 'REPAIRING':
          statusHistory.push(
            { orderId: order.id, status: 'RECEIVED' as const, notes: 'Ordine ricevuto', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
            { orderId: order.id, status: 'DIAGNOSING' as const, notes: 'Problema identificato: connettore di ricarica danneggiato', createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
            { orderId: order.id, status: 'REPAIRING' as const, notes: 'Sostituzione connettore in corso', createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000) }
          )
          break
        case 'DIAGNOSING':
          statusHistory.push(
            { orderId: order.id, status: 'RECEIVED' as const, notes: 'Ordine ricevuto, dispositivo in esame', createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000) },
            { orderId: order.id, status: 'DIAGNOSING' as const, notes: 'Verifica danni da liquido in corso', createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) }
          )
          break
        case 'READY_PICKUP':
          statusHistory.push(
            { orderId: order.id, status: 'RECEIVED' as const, notes: 'Ordine ricevuto', createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
            { orderId: order.id, status: 'DIAGNOSING' as const, notes: 'Diagnosi completata', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
            { orderId: order.id, status: 'REPAIRING' as const, notes: 'Sostituzione modulo fotocamera', createdAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000) },
            { orderId: order.id, status: 'TESTING' as const, notes: 'Test funzionalità completati', createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
            { orderId: order.id, status: 'COMPLETED' as const, notes: 'Riparazione completata', createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000) },
            { orderId: order.id, status: 'READY_PICKUP' as const, notes: 'Pronto per il ritiro - cliente notificato', createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000) }
          )
          break
        default:
          statusHistory.push(
            { orderId: order.id, status: 'RECEIVED' as const, notes: 'Ordine ricevuto dal cliente', createdAt: new Date(Date.now() - 30 * 60 * 1000) }
          )
      }

      for (const history of statusHistory) {
        await prisma.orderStatusHistory.create({
          data: {
            ...history,
            changedBy: adminUser.id
          }
        })
      }
    }

    console.log('Test orders created successfully!')
  }

  // 创建一些库存物品
  console.log('Creating inventory items...')
  
  const existingSuppliers = await prisma.supplier.findMany()
  if (existingSuppliers.length > 0) {
    const inventoryItems = [
      {
        name: 'iPhone 14 Screen',
        partNumber: 'IP14-SCR-001',
        category: 'Display',
        supplierId: existingSuppliers[0].id,
        quantity: 15,
        minQuantity: 5,
        unitPrice: 89.99,
        location: 'Scaffale A1'
      },
      {
        name: 'Samsung Galaxy S23 Battery',
        partNumber: 'SG23-BAT-001',
        category: 'Battery',
        supplierId: existingSuppliers[1] ? existingSuppliers[1].id : existingSuppliers[0].id,
        quantity: 25,
        minQuantity: 10,
        unitPrice: 34.99,
        location: 'Scaffale B2'
      },
      {
        name: 'Universal Charging Port',
        partNumber: 'UNI-CHG-001',
        category: 'Connectors',
        supplierId: existingSuppliers[0].id,
        quantity: 50,
        minQuantity: 20,
        unitPrice: 12.99,
        location: 'Scaffale C1'
      },
      {
        name: 'iPhone 13 Battery',
        partNumber: 'IP13-BAT-001',
        category: 'Battery',
        supplierId: existingSuppliers[0].id,
        quantity: 8,
        minQuantity: 5,
        unitPrice: 32.99,
        location: 'Scaffale B1'
      }
    ]

    for (const item of inventoryItems) {
      await prisma.inventoryItem.create({
        data: item
      })
    }

    console.log('Inventory items created successfully!')
  }

  console.log('Database seeded successfully with comprehensive test data!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })