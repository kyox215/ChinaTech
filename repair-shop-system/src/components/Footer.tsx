import { Phone, Mail, MapPin, Clock, Wrench } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* 公司信息 */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
                <Wrench className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold">极速维修</h3>
                <p className="text-sm text-gray-400">专业手机维修服务</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              专业从事手机维修服务10余年，技术精湛，服务贴心。
              支持多品牌手机维修，原装配件，品质保证。
            </p>
          </div>

          {/* 服务项目 */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">服务项目</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li className="hover:text-white transition-colors cursor-pointer">
                iPhone系列维修
              </li>
              <li className="hover:text-white transition-colors cursor-pointer">
                华为手机维修
              </li>
              <li className="hover:text-white transition-colors cursor-pointer">
                小米手机维修
              </li>
              <li className="hover:text-white transition-colors cursor-pointer">
                OPPO/vivo维修
              </li>
              <li className="hover:text-white transition-colors cursor-pointer">
                三星手机维修
              </li>
              <li className="hover:text-white transition-colors cursor-pointer">
                手机回收买卖
              </li>
            </ul>
          </div>

          {/* 联系方式 */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">联系我们</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-gray-400 text-sm">
                <Phone className="h-4 w-4 text-blue-500" />
                <span>400-888-9999</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-400 text-sm">
                <Mail className="h-4 w-4 text-blue-500" />
                <span>service@repair.com</span>
              </div>
              <div className="flex items-start space-x-3 text-gray-400 text-sm">
                <MapPin className="h-4 w-4 text-blue-500 mt-0.5" />
                <span>北京市朝阳区建国路88号<br />现代城市广场B座12层</span>
              </div>
            </div>
          </div>

          {/* 营业时间 */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">营业时间</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-gray-400 text-sm">
                <Clock className="h-4 w-4 text-orange-500" />
                <div>
                  <p>周一至周六</p>
                  <p>9:00 - 21:00</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 text-gray-400 text-sm">
                <Clock className="h-4 w-4 text-orange-500" />
                <div>
                  <p>周日及节假日</p>
                  <p>10:00 - 18:00</p>
                </div>
              </div>
            </div>
            
            {/* 服务承诺 */}
            <div className="bg-blue-900/30 rounded-lg p-4 mt-6">
              <h5 className="font-medium text-blue-300 mb-2">服务承诺</h5>
              <ul className="text-xs text-gray-400 space-y-1">
                <li>• 免费检测诊断</li>
                <li>• 原装配件保证</li>
                <li>• 180天质保服务</li>
                <li>• 30分钟快修</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 底部版权 */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              <p>&copy; 2024 极速维修. 保留所有权利.</p>
            </div>
            <div className="flex space-x-6 text-gray-400 text-sm">
              <span className="hover:text-white cursor-pointer transition-colors">
                隐私政策
              </span>
              <span className="hover:text-white cursor-pointer transition-colors">
                服务条款
              </span>
              <span className="hover:text-white cursor-pointer transition-colors">
                关于我们
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;