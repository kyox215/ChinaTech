// 智能报价引擎
import { DeviceType, RepairCategory, storage } from './storage';

// 简化的设备和故障类型定义
export interface Device {
  brand: string;
  model: string;
  category: 'flagship' | 'premium' | 'standard' | 'budget';
}

export type FaultType = 'screen' | 'battery' | 'camera' | 'charging' | 'speaker' | 'water' | 'motherboard';

// 简化的报价结果
export interface SimplePricingResult {
  partsCost: number;
  laborCost: number;
  totalCost: number;
  estimatedTime: string;
  warranty: string;
}

export interface PricingRequest {
  deviceBrand: string;
  deviceModel: string;
  repairType: string;
  issueDescription: string;
  urgency: 'normal' | 'urgent' | 'emergency';
  partQuality: 'original' | 'oem' | 'aftermarket';
}

export interface PricingResult {
  estimatedCost: number;
  breakdown: {
    laborCost: number;
    partsCost: number;
    diagnosticFee: number;
    urgencyFee: number;
    totalCost: number;
  };
  estimatedTime: {
    hours: number;
    completionDate: Date;
  };
  warranty: {
    period: number; // 保修期（天）
    coverage: string;
  };
  notes: string[];
}

class PricingEngine {
  // 品牌系数（不同品牌的维修难度和成本不同）
  private brandMultipliers = {
    'Apple': 1.5,
    'iPhone': 1.5,
    '华为': 1.3,
    'Huawei': 1.3,
    '小米': 1.0,
    'Xiaomi': 1.0,
    'OPPO': 1.1,
    'vivo': 1.1,
    '三星': 1.2,
    'Samsung': 1.2,
    '魅族': 0.9,
    'Meizu': 0.9,
    '一加': 1.1,
    'OnePlus': 1.1
  };

  // 配件质量系数
  private partQualityMultipliers = {
    original: 1.5,    // 原装配件
    oem: 1.0,        // OEM配件
    aftermarket: 0.7  // 副厂配件
  };

  // 紧急程度系数
  private urgencyMultipliers = {
    normal: 1.0,     // 正常
    urgent: 1.3,     // 加急
    emergency: 1.8   // 紧急
  };

  // 诊断费用
  private diagnosticFees = {
    basic: 50,      // 基础诊断
    advanced: 100,  // 高级诊断
    complex: 150    // 复杂诊断
  };

  calculatePrice(request: PricingRequest): PricingResult {
    // 获取维修类别基础信息
    const repairCategories = storage.getRepairCategories();
    const repairCategory = repairCategories.find(cat => 
      cat.name.includes(request.repairType) || 
      request.repairType.includes(cat.name)
    );

    if (!repairCategory) {
      throw new Error('未找到对应的维修类别');
    }

    // 计算基础工时费
    const baseLaborCost = repairCategory.basePrice;
    
    // 获取品牌系数
    const brandMultiplier = this.getBrandMultiplier(request.deviceBrand, request.deviceModel);
    
    // 计算工时费
    const laborCost = Math.round(baseLaborCost * brandMultiplier);
    
    // 计算配件费（基于设备价值和维修类型）
    const basePartsCostByRepairType = {
      '屏幕': 400,
      '电池': 120,
      '主板': 800,
      '摄像头': 200,
      '扬声器': 80,
      '听筒': 60,
      '充电口': 100,
      '指纹': 150,
      '面容': 300
    };
    
    const basePartsCost = this.getBasePartsCost(request.repairType, basePartsCostByRepairType);
    const partQualityMultiplier = this.partQualityMultipliers[request.partQuality];
    const partsCost = Math.round(basePartsCost * brandMultiplier * partQualityMultiplier);
    
    // 计算诊断费
    const diagnosticFee = this.getDiagnosticFee(repairCategory.difficultyLevel);
    
    // 计算加急费用
    const urgencyMultiplier = this.urgencyMultipliers[request.urgency];
    const baseTotal = laborCost + partsCost + diagnosticFee;
    const urgencyFee = request.urgency !== 'normal' ? 
      Math.round(baseTotal * (urgencyMultiplier - 1)) : 0;
    
    // 总费用
    const totalCost = baseTotal + urgencyFee;
    
    // 计算预计完成时间
    const baseHours = repairCategory.estimatedTimeHours;
    const actualHours = request.urgency === 'emergency' ? baseHours * 0.5 :
                       request.urgency === 'urgent' ? baseHours * 0.7 :
                       baseHours;
    
    const completionDate = new Date();
    completionDate.setHours(completionDate.getHours() + actualHours);
    
    // 保修信息
    const warranty = this.getWarrantyInfo(request.partQuality, repairCategory.name);
    
    // 生成说明
    const notes = this.generateNotes(request, repairCategory, brandMultiplier);
    
    return {
      estimatedCost: totalCost,
      breakdown: {
        laborCost,
        partsCost,
        diagnosticFee,
        urgencyFee,
        totalCost
      },
      estimatedTime: {
        hours: actualHours,
        completionDate
      },
      warranty,
      notes
    };
  }

  private getBrandMultiplier(brand: string, model: string): number {
    // 先检查完整型号
    const fullModel = `${brand} ${model}`;
    for (const [key, multiplier] of Object.entries(this.brandMultipliers)) {
      if (fullModel.toLowerCase().includes(key.toLowerCase()) || 
          brand.toLowerCase().includes(key.toLowerCase())) {
        return multiplier;
      }
    }
    return 1.0; // 默认系数
  }

  private getBasePartsCost(repairType: string, costMap: Record<string, number>): number {
    for (const [key, cost] of Object.entries(costMap)) {
      if (repairType.includes(key) || key.includes(repairType)) {
        return cost;
      }
    }
    return 200; // 默认配件费用
  }

  private getDiagnosticFee(difficultyLevel: number): number {
    if (difficultyLevel <= 2) return this.diagnosticFees.basic;
    if (difficultyLevel <= 3) return this.diagnosticFees.advanced;
    return this.diagnosticFees.complex;
  }

  private getWarrantyInfo(partQuality: string, repairType: string): { period: number; coverage: string } {
    const basePeriod = partQuality === 'original' ? 180 : 
                      partQuality === 'oem' ? 90 : 30;
    
    return {
      period: basePeriod,
      coverage: `${repairType}维修质保，包含人工和配件`
    };
  }

  private generateNotes(request: PricingRequest, category: RepairCategory, brandMultiplier: number): string[] {
    const notes: string[] = [];
    
    if (brandMultiplier > 1.3) {
      notes.push('该品牌维修难度较高，需要专业技师处理');
    }
    
    if (request.partQuality === 'original') {
      notes.push('使用原装配件，质量有保障，保修期更长');
    } else if (request.partQuality === 'aftermarket') {
      notes.push('使用副厂配件，性价比高，保修期相对较短');
    }
    
    if (request.urgency === 'emergency') {
      notes.push('紧急维修，优先安排，24小时内完成');
    } else if (request.urgency === 'urgent') {
      notes.push('加急维修，优先处理，1-2个工作日完成');
    }
    
    if (category.difficultyLevel >= 4) {
      notes.push('高难度维修，可能需要额外检测时间');
    }
    
    notes.push('价格仅供参考，最终以实际检测结果为准');
    
    return notes;
  }
}

export const pricingEngine = new PricingEngine();

// 简化的报价函数供PricingPage使用
export function getPricing(device: Device, faultType: FaultType): SimplePricingResult {
  const basePartsCosts = {
    screen: { flagship: 1500, premium: 1000, standard: 600, budget: 300 },
    battery: { flagship: 400, premium: 300, standard: 200, budget: 120 },
    camera: { flagship: 800, premium: 500, standard: 300, budget: 150 },
    charging: { flagship: 200, premium: 150, standard: 100, budget: 60 },
    speaker: { flagship: 300, premium: 200, standard: 120, budget: 80 },
    water: { flagship: 1200, premium: 800, standard: 500, budget: 300 },
    motherboard: { flagship: 2000, premium: 1500, standard: 1000, budget: 600 }
  };

  const laborCosts = {
    screen: 200,
    battery: 100,
    camera: 150,
    charging: 100,
    speaker: 100,
    water: 150,
    motherboard: 300
  };

  const estimatedTimes = {
    screen: '2-3小时',
    battery: '1-2小时',
    camera: '1-2小时',
    charging: '1小时',
    speaker: '2-3小时',
    water: '3-5天',
    motherboard: '3-5天'
  };

  const warranties = {
    screen: '6个月',
    battery: '3个月',
    camera: '3个月',
    charging: '3个月',
    speaker: '3个月',
    water: '1个月',
    motherboard: '3个月'
  };

  const partsCost = basePartsCosts[faultType][device.category];
  const laborCost = laborCosts[faultType];
  const totalCost = partsCost + laborCost;

  return {
    partsCost,
    laborCost,
    totalCost,
    estimatedTime: estimatedTimes[faultType],
    warranty: warranties[faultType]
  };
}