// 多语言翻译配置
export type Language = 'it' | 'en' | 'zh'

export const translations = {
  it: {
    // 通用
    loading: 'Caricamento...',
    error: 'Errore',
    success: 'Successo',
    save: 'Salva',
    cancel: 'Annulla',
    delete: 'Elimina',
    edit: 'Modifica',
    search: 'Cerca',
    submit: 'Invia',
    back: 'Indietro',
    next: 'Avanti',
    
    // 首页
    companyName: 'ChinaTech',
    homepage: {
      title: 'Riparazione Smartphone Professionale',
      subtitle: 'Servizio rapido e affidabile per tutti i tuoi dispositivi',
      orderLookup: 'Cerca Ordine',
      repairQuote: 'Preventivo Riparazione',
      login: 'Accedi',
      orderNumber: 'Numero Ordine',
      lookupOrder: 'Cerca Ordine',
      getQuote: 'Richiedi Preventivo',
      businessHours: 'Orari di Apertura',
      address: 'Indirizzo',
      phone: 'Telefono'
    },
    
    // 订单状态
    orderStatus: {
      RECEIVED: 'Ricevuto',
      DIAGNOSING: 'Diagnosi',
      REPAIRING: 'Riparazione',
      TESTING: 'Test',
      COMPLETED: 'Completato',
      READY_PICKUP: 'Pronto per il Ritiro',
      DELIVERED: 'Consegnato',
      CANCELLED: 'Annullato'
    },
    
    // 设备类型
    deviceCategory: {
      SMARTPHONE: 'Smartphone',
      TABLET: 'Tablet',
      LAPTOP: 'Laptop',
      SMARTWATCH: 'Smartwatch',
      OTHER: 'Altro'
    },
    
    // 优先级
    priority: {
      LOW: 'Bassa',
      NORMAL: 'Normale',
      HIGH: 'Alta',
      URGENT: 'Urgente'
    },
    
    // 用户角色
    userRole: {
      CUSTOMER: 'Cliente',
      TECHNICIAN: 'Tecnico',
      ADMIN: 'Amministratore'
    }
  },
  
  en: {
    // 通用
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    search: 'Search',
    submit: 'Submit',
    back: 'Back',
    next: 'Next',
    
    // 首页
    companyName: 'ChinaTech',
    homepage: {
      title: 'Professional Smartphone Repair',
      subtitle: 'Fast and reliable service for all your devices',
      orderLookup: 'Order Lookup',
      repairQuote: 'Repair Quote',
      login: 'Login',
      orderNumber: 'Order Number',
      lookupOrder: 'Lookup Order',
      getQuote: 'Get Quote',
      businessHours: 'Business Hours',
      address: 'Address',
      phone: 'Phone'
    },
    
    // 订单状态
    orderStatus: {
      RECEIVED: 'Received',
      DIAGNOSING: 'Diagnosing',
      REPAIRING: 'Repairing',
      TESTING: 'Testing',
      COMPLETED: 'Completed',
      READY_PICKUP: 'Ready for Pickup',
      DELIVERED: 'Delivered',
      CANCELLED: 'Cancelled'
    },
    
    // 设备类型
    deviceCategory: {
      SMARTPHONE: 'Smartphone',
      TABLET: 'Tablet',
      LAPTOP: 'Laptop',
      SMARTWATCH: 'Smartwatch',
      OTHER: 'Other'
    },
    
    // 优先级
    priority: {
      LOW: 'Low',
      NORMAL: 'Normal',
      HIGH: 'High',
      URGENT: 'Urgent'
    },
    
    // 用户角色
    userRole: {
      CUSTOMER: 'Customer',
      TECHNICIAN: 'Technician',
      ADMIN: 'Administrator'
    }
  },
  
  zh: {
    // 通用
    loading: '加载中...',
    error: '错误',
    success: '成功',
    save: '保存',
    cancel: '取消',
    delete: '删除',
    edit: '编辑',
    search: '搜索',
    submit: '提交',
    back: '返回',
    next: '下一步',
    
    // 首页
    companyName: 'ChinaTech',
    homepage: {
      title: '专业手机维修服务',
      subtitle: '为您的所有设备提供快速可靠的服务',
      orderLookup: '订单查询',
      repairQuote: '维修报价',
      login: '登录',
      orderNumber: '订单号',
      lookupOrder: '查询订单',
      getQuote: '获取报价',
      businessHours: '营业时间',
      address: '地址',
      phone: '电话'
    },
    
    // 订单状态
    orderStatus: {
      RECEIVED: '已接收',
      DIAGNOSING: '检测中',
      REPAIRING: '维修中',
      TESTING: '测试中',
      COMPLETED: '完成',
      READY_PICKUP: '可取件',
      DELIVERED: '已交付',
      CANCELLED: '已取消'
    },
    
    // 设备类型
    deviceCategory: {
      SMARTPHONE: '智能手机',
      TABLET: '平板电脑',
      LAPTOP: '笔记本电脑',
      SMARTWATCH: '智能手表',
      OTHER: '其他'
    },
    
    // 优先级
    priority: {
      LOW: '低',
      NORMAL: '普通',
      HIGH: '高',
      URGENT: '紧急'
    },
    
    // 用户角色
    userRole: {
      CUSTOMER: '客户',
      TECHNICIAN: '技术员',
      ADMIN: '管理员'
    }
  }
}

export function getTranslation(lang: Language, key: string): string {
  const keys = key.split('.')
  let value: any = translations[lang]
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k]
    } else {
      return key // 返回key作为fallback
    }
  }
  
  return typeof value === 'string' ? value : key
}

// 获取完整的翻译对象
export function getTranslations(lang: Language) {
  return translations[lang]
}