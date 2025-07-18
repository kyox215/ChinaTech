import { Link } from 'react-router-dom';
import { 
  Smartphone, 
  Zap, 
  Shield, 
  Clock, 
  Star, 
  ArrowRight,
  CheckCircle,
  Users,
  Award,
  Wrench,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import { useAuth } from '../lib/auth';
import { getStatistics } from '../lib/mockData';
import { useState, useEffect } from 'react';

const HomePage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalOrders: 0,
    completedOrders: 0,
    satisfactionRate: 98,
    totalCustomers: 0
  });

  useEffect(() => {
    // 计算统计数据
    const statistics = getStatistics();
    setStats({
      totalOrders: statistics.totalOrders,
      completedOrders: statistics.completedOrders,
      satisfactionRate: 98, // 模拟数据
      totalCustomers: 5 // 模拟数据
    });
  }, []);

  const services = [
    {
      icon: Smartphone,
      title: '屏幕维修',
      description: '专业屏幕更换，支持所有主流品牌',
      price: '从 200元起',
      features: ['原装屏幕', '免费贴膜', '30分钟完成']
    },
    {
      icon: Zap,
      title: '电池更换',
      description: '高品质电池，恢复续航能力',
      price: '从 150元起',
      features: ['大容量电池', '快速更换', '6个月保修']
    },
    {
      icon: Wrench,
      title: '主板维修',
      description: '专业芯片级维修，解决复杂问题',
      price: '从 500元起',
      features: ['芯片级维修', '数据保护', '专业设备']
    },
    {
      icon: Shield,
      title: '数据恢复',
      description: '专业数据恢复服务，找回珍贵回忆',
      price: '从 300元起',
      features: ['专业软件', '高成功率', '隐私保护']
    }
  ];

  const brands = [
    { name: 'Apple', logo: '🍎', popular: true },
    { name: '华为', logo: '📱', popular: true },
    { name: '小米', logo: '📱', popular: true },
    { name: 'OPPO', logo: '📱', popular: false },
    { name: 'vivo', logo: '📱', popular: false },
    { name: '三星', logo: '📱', popular: false }
  ];

  const testimonials = [
    {
      name: '陈先生',
      rating: 5,
      comment: 'iPhone屏幕破了，30分钟就修好了，和新的一样！',
      device: 'iPhone 15 Pro'
    },
    {
      name: '林女士',
      rating: 5,
      comment: '电池老化问题完美解决，现在能用一整天了。',
      device: 'iPhone 14'
    },
    {
      name: '刘先生',
      rating: 5,
      comment: '主板问题都能修好，技术真的很专业！',
      device: '华为 Mate 60'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                  专业手机维修
                  <br />
                  <span className="text-orange-400">快速可靠</span>
                </h1>
                <p className="text-xl text-blue-100 leading-relaxed">
                  10年维修经验，支持所有主流品牌。原装配件，品质保证，
                  30分钟快修，180天质保服务。
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/quote"
                  className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-lg font-semibold text-white transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  在线报价
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                
                <Link
                  to="/query"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg font-semibold text-white transition-all duration-300"
                >
                  订单查询
                </Link>
              </div>

              {/* 快速统计 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-400">{stats.totalOrders}+</div>
                  <div className="text-sm text-blue-200">累计订单</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-400">{stats.completedOrders}+</div>
                  <div className="text-sm text-blue-200">成功修复</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-400">{stats.satisfactionRate}%</div>
                  <div className="text-sm text-blue-200">满意度</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-400">{stats.totalCustomers}+</div>
                  <div className="text-sm text-blue-200">信赖客户</div>
                </div>
              </div>
            </div>

            {/* 右侧图片区域 */}
            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-pink-500 rounded-3xl blur-3xl opacity-30 animate-pulse"></div>
                <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="bg-white/20 rounded-xl p-4 text-center">
                        <Smartphone className="h-8 w-8 mx-auto mb-2 text-orange-400" />
                        <div className="text-sm">屏幕维修</div>
                      </div>
                      <div className="bg-white/20 rounded-xl p-4 text-center">
                        <Zap className="h-8 w-8 mx-auto mb-2 text-orange-400" />
                        <div className="text-sm">电池更换</div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-white/20 rounded-xl p-4 text-center">
                        <Wrench className="h-8 w-8 mx-auto mb-2 text-orange-400" />
                        <div className="text-sm">主板维修</div>
                      </div>
                      <div className="bg-white/20 rounded-xl p-4 text-center">
                        <Shield className="h-8 w-8 mx-auto mb-2 text-orange-400" />
                        <div className="text-sm">数据恢复</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 服务项目 */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              专业维修服务
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              支持所有主流品牌手机维修，从简单更换到复杂修复，我们都能为您提供专业解决方案
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => {
              const IconComponent = service.icon;
              return (
                <div 
                  key={index}
                  className="bg-gradient-to-br from-white to-blue-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-100 group hover:scale-105"
                >
                  <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl group-hover:from-orange-500 group-hover:to-orange-600 transition-all duration-300">
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{service.title}</h3>
                      <p className="text-gray-600 text-sm mb-3">{service.description}</p>
                      <div className="text-lg font-bold text-orange-600 mb-4">{service.price}</div>
                    </div>
                    
                    <div className="space-y-2">
                      {service.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 支持品牌 */}
      <section className="py-20 bg-gradient-to-r from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              支持品牌
            </h2>
            <p className="text-xl text-gray-600">
              支持所有主流手机品牌，技术精湛，经验丰富
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {brands.map((brand, index) => (
              <div 
                key={index}
                className={`relative bg-white rounded-xl p-6 text-center shadow-md hover:shadow-lg transition-all duration-300 border-2 ${
                  brand.popular 
                    ? 'border-orange-200 hover:border-orange-300' 
                    : 'border-gray-200 hover:border-gray-300'
                } group hover:scale-105`}
              >
                {brand.popular && (
                  <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                    热门
                  </div>
                )}
                <div className="text-3xl mb-2">{brand.logo}</div>
                <div className="font-semibold text-gray-900">{brand.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 客户评价 */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              客户好评
            </h2>
            <p className="text-xl text-gray-600">
              听听客户怎么说
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 shadow-lg border border-blue-100"
              >
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <p className="text-gray-700 mb-4 italic">“{testimonial.comment}”</p>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.device}</div>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 服务优势 */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              为什么选择我们
            </h2>
            <p className="text-xl text-blue-100">
              专业、可靠、快速的维修服务
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-full">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold">快速维修</h3>
              <p className="text-blue-100">大部分问题30分钟内解决，紧急问题即修即取</p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-full">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold">质量保证</h3>
              <p className="text-blue-100">原装配件，专业工艺，180天质保服务</p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-full">
                <Award className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold">专业技术</h3>
              <p className="text-blue-100">资深技师团队，10年维修经验，技术精湛</p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-full">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold">贴心服务</h3>
              <p className="text-blue-100">一对一服务，全程透明，随时追踪进度</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA 区域 */}
      <section className="py-20 bg-gradient-to-r from-orange-500 to-pink-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            手机故障了？立即获取免费报价！
          </h2>
          <p className="text-xl mb-8 text-orange-100">
            专业技师在线服务，5分钟内快速报价，透明价格，放心选择
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/quote"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-orange-600 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              立即报价
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            
            <a
              href="tel:400-888-9999"
              className="inline-flex items-center justify-center px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-orange-600 transition-all duration-300"
            >
              <Phone className="mr-2 h-5 w-5" />
              电话咨询
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;