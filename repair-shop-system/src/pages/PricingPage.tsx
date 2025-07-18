import React, { useState } from 'react';
import { getPricing, Device, FaultType } from '../lib/pricing';
import { Calculator, Smartphone, Wrench } from 'lucide-react';

const PricingPage: React.FC = () => {
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [selectedFault, setSelectedFault] = useState<FaultType | ''>('');
  const [pricing, setPricing] = useState<any>(null);

  const devices: Device[] = [
    { brand: 'Apple', model: 'iPhone 15 Pro', category: 'flagship' },
    { brand: 'Apple', model: 'iPhone 15', category: 'premium' },
    { brand: 'Apple', model: 'iPhone 14', category: 'premium' },
    { brand: 'Apple', model: 'iPhone 13', category: 'standard' },
    { brand: 'Apple', model: 'iPhone 12', category: 'standard' },
    { brand: 'Huawei', model: 'Mate 60 Pro', category: 'flagship' },
    { brand: 'Huawei', model: 'P60 Pro', category: 'premium' },
    { brand: 'Huawei', model: 'Nova 11', category: 'standard' },
    { brand: 'Xiaomi', model: 'Mi 14 Pro', category: 'flagship' },
    { brand: 'Xiaomi', model: 'Mi 14', category: 'premium' },
    { brand: 'Xiaomi', model: 'Redmi Note 13', category: 'budget' },
    { brand: 'Samsung', model: 'Galaxy S24 Ultra', category: 'flagship' },
    { brand: 'Samsung', model: 'Galaxy S24', category: 'premium' },
    { brand: 'Samsung', model: 'Galaxy A55', category: 'standard' },
  ];

  const faultTypes: { value: FaultType; label: string; icon: React.ReactNode }[] = [
    { value: 'screen', label: '屏幕损坏', icon: <Smartphone className="w-4 h-4" /> },
    { value: 'battery', label: '电池老化', icon: <div className="w-4 h-4 bg-green-500 rounded-sm" /> },
    { value: 'camera', label: '摄像头故障', icon: <div className="w-4 h-4 bg-blue-500 rounded-full" /> },
    { value: 'charging', label: '充电问题', icon: <div className="w-4 h-4 bg-yellow-500 rounded" /> },
    { value: 'speaker', label: '扬声器故障', icon: <div className="w-4 h-4 bg-purple-500 rounded-full" /> },
    { value: 'water', label: '进水维修', icon: <div className="w-4 h-4 bg-blue-400 rounded-full" /> },
    { value: 'motherboard', label: '主板故障', icon: <div className="w-4 h-4 bg-gray-600 rounded" /> },
  ];

  const brands = [...new Set(devices.map(device => device.brand))];
  const models = devices.filter(device => device.brand === selectedBrand);

  const handleCalculate = () => {
    if (selectedBrand && selectedModel && selectedFault) {
      const device = devices.find(d => d.brand === selectedBrand && d.model === selectedModel);
      if (device) {
        const result = getPricing(device, selectedFault as FaultType);
        setPricing(result);
      }
    }
  };

  const resetForm = () => {
    setSelectedBrand('');
    setSelectedModel('');
    setSelectedFault('');
    setPricing(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Calculator className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">智能报价系统</h1>
          <p className="text-xl text-gray-600">选择您的设备和故障类型，获取精准维修报价</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* 左侧表单 */}
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold text-gray-900 mb-6">设备选择</h3>
                
                {/* 品牌选择 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">手机品牌</label>
                  <select
                    value={selectedBrand}
                    onChange={(e) => {
                      setSelectedBrand(e.target.value);
                      setSelectedModel('');
                      setPricing(null);
                    }}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">请选择品牌</option>
                    {brands.map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>

                {/* 型号选择 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">手机型号</label>
                  <select
                    value={selectedModel}
                    onChange={(e) => {
                      setSelectedModel(e.target.value);
                      setPricing(null);
                    }}
                    disabled={!selectedBrand}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  >
                    <option value="">请选择型号</option>
                    {models.map(device => (
                      <option key={device.model} value={device.model}>{device.model}</option>
                    ))}
                  </select>
                </div>

                {/* 故障类型选择 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">故障类型</label>
                  <div className="grid grid-cols-2 gap-3">
                    {faultTypes.map(fault => (
                      <button
                        key={fault.value}
                        onClick={() => {
                          setSelectedFault(fault.value);
                          setPricing(null);
                        }}
                        className={`p-3 border rounded-lg text-left transition-all ${
                          selectedFault === fault.value
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 hover:border-blue-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          {fault.icon}
                          <span className="text-sm">{fault.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex space-x-4">
                  <button
                    onClick={handleCalculate}
                    disabled={!selectedBrand || !selectedModel || !selectedFault}
                    className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    <Calculator className="w-5 h-5 inline mr-2" />
                    计算报价
                  </button>
                  <button
                    onClick={resetForm}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    重置
                  </button>
                </div>
              </div>

              {/* 右侧报价结果 */}
              <div>
                {pricing ? (
                  <div className="bg-gradient-to-br from-blue-500 to-orange-500 rounded-xl p-6 text-white">
                    <h3 className="text-xl font-semibold mb-6">维修报价详情</h3>
                    
                    <div className="space-y-4">
                      <div className="bg-white/20 rounded-lg p-4">
                        <div className="text-sm opacity-90">设备信息</div>
                        <div className="font-medium">{selectedBrand} {selectedModel}</div>
                      </div>
                      
                      <div className="bg-white/20 rounded-lg p-4">
                        <div className="text-sm opacity-90">故障类型</div>
                        <div className="font-medium">
                          {faultTypes.find(f => f.value === selectedFault)?.label}
                        </div>
                      </div>
                      
                      <div className="bg-white/20 rounded-lg p-4">
                        <div className="text-sm opacity-90">零件费用</div>
                        <div className="text-2xl font-bold">¥{pricing.partsCost}</div>
                      </div>
                      
                      <div className="bg-white/20 rounded-lg p-4">
                        <div className="text-sm opacity-90">人工费用</div>
                        <div className="text-xl font-semibold">¥{pricing.laborCost}</div>
                      </div>
                      
                      <div className="border-t border-white/30 pt-4">
                        <div className="flex justify-between items-center">
                          <span className="text-lg">总计费用</span>
                          <span className="text-3xl font-bold">¥{pricing.totalCost}</span>
                        </div>
                      </div>
                      
                      <div className="bg-white/20 rounded-lg p-4">
                        <div className="text-sm opacity-90">预计维修时间</div>
                        <div className="font-medium">{pricing.estimatedTime}</div>
                      </div>

                      <div className="bg-white/20 rounded-lg p-4">
                        <div className="text-sm opacity-90">质保期限</div>
                        <div className="font-medium">{pricing.warranty}</div>
                      </div>
                    </div>
                    
                    <div className="mt-6 p-4 bg-white/10 rounded-lg">
                      <div className="text-sm opacity-90 mb-2">温馨提示</div>
                      <div className="text-sm">
                        • 报价仅供参考，最终价格以实际检测为准<br/>
                        • 如需额外更换配件，费用另计<br/>
                        • 我们提供{pricing.warranty}质保服务
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-xl p-8 text-center">
                    <Wrench className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-600 mb-2">选择设备和故障类型</h3>
                    <p className="text-gray-500">填写左侧表单信息，点击计算报价按钮获取详细维修费用</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 服务承诺 */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-6 text-center shadow-md">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Smartphone className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">原厂品质</h4>
            <p className="text-gray-600 text-sm">使用原厂或同等品质配件，确保维修质量</p>
          </div>
          
          <div className="bg-white rounded-lg p-6 text-center shadow-md">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-6 h-6 bg-orange-600 rounded-full"></div>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">快速维修</h4>
            <p className="text-gray-600 text-sm">大部分故障当天可修，复杂问题3天内解决</p>
          </div>
          
          <div className="bg-white rounded-lg p-6 text-center shadow-md">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-6 h-6 bg-green-600 rounded-full"></div>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">质保服务</h4>
            <p className="text-gray-600 text-sm">提供3-6个月质保，让您维修无忧</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;