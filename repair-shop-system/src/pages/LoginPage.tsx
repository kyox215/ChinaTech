import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { User, Wrench } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { mockUsers } from '../lib/mockData';

const LoginPage = () => {
  const { isLoggedIn } = useAuth();
  const [selectedRole, setSelectedRole] = useState<'admin' | 'technician' | 'customer'>('customer');
  
  // 如果已经登录，重定向到适当的页面
  if (isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = () => {
    // 简化登录逻辑，直接跳转到首页
    if (selectedRole === 'admin') {
      window.location.href = '/admin';
    } else if (selectedRole === 'technician') {
      window.location.href = '/technician';
    } else {
      window.location.href = '/';
    }
  };

  const roleUsers = {
    admin: mockUsers.filter(u => u.role === 'admin'),
    technician: mockUsers.filter(u => u.role === 'technician'),
    customer: [] // 客户角色不需要具体用户
  };

  const roleDescriptions = {
    admin: {
      title: '管理员登录',
      description: '访问管理后台，管理订单、客户、库存等',
      features: ['订单管理', '客户管理', '库存管理', '数据统计'],
      color: 'purple'
    },
    technician: {
      title: '技术员登录',
      description: '访问技术员工作台，处理维修订单',
      features: ['订单接取', '进度更新', '维修记录', '客户沟通'],
      color: 'green'
    },
    customer: {
      title: '客户访问',
      description: '查询订单、在线报价、咨询服务',
      features: ['订单查询', '在线报价', '服务咨询', '进度追踪'],
      color: 'blue'
    }
  };

  const getColorClasses = (color: string, variant: 'bg' | 'border' | 'text') => {
    const colorMap = {
      purple: {
        bg: 'bg-purple-500',
        border: 'border-purple-500',
        text: 'text-purple-600'
      },
      green: {
        bg: 'bg-green-500',
        border: 'border-green-500',
        text: 'text-green-600'
      },
      blue: {
        bg: 'bg-blue-500',
        border: 'border-blue-500',
        text: 'text-blue-600'
      }
    };
    return colorMap[color as keyof typeof colorMap][variant];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-2xl">
              <Wrench className="h-12 w-12 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            欢迎使用极速维修
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            请选择您的身份进入系统（演示模式）
          </p>
        </div>

        {/* Role Selection */}
        <div className="space-y-4">
          {Object.entries(roleDescriptions).map(([role, info]) => {
            const isSelected = selectedRole === role;
            const colorClasses = {
              bg: getColorClasses(info.color, 'bg'),
              border: getColorClasses(info.color, 'border'),
              text: getColorClasses(info.color, 'text')
            };
            
            return (
              <div
                key={role}
                className={`cursor-pointer rounded-xl border-2 p-6 transition-all duration-300 ${
                  isSelected 
                    ? `${colorClasses.border} bg-white shadow-lg scale-105` 
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                }`}
                onClick={() => setSelectedRole(role as any)}
              >
                <div className="flex items-start space-x-4">
                  <div className={`flex-shrink-0 p-2 rounded-lg ${
                    isSelected ? colorClasses.bg : 'bg-gray-100'
                  }`}>
                    <User className={`h-6 w-6 ${
                      isSelected ? 'text-white' : 'text-gray-600'
                    }`} />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className={`font-semibold text-lg ${
                      isSelected ? colorClasses.text : 'text-gray-900'
                    }`}>
                      {info.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {info.description}
                    </p>
                    
                    <div className="mt-3 flex flex-wrap gap-1">
                      {info.features.map((feature, index) => (
                        <span
                          key={index}
                          className={`inline-block px-2 py-1 text-xs rounded ${
                            isSelected 
                              ? `${colorClasses.text} bg-opacity-10` 
                              : 'bg-gray-100 text-gray-600'
                          }`}
                          style={isSelected ? { backgroundColor: `var(--${info.color}-50)` } : {}}
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    isSelected 
                      ? `${colorClasses.border} ${colorClasses.bg}` 
                      : 'border-gray-300'
                  }`}>
                    {isSelected && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Available Users Info */}
        {selectedRole !== 'customer' && roleUsers[selectedRole].length > 0 && (
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">可用的{roleDescriptions[selectedRole].title.replace('登录', '')}账户：</h4>
            <div className="space-y-2">
              {roleUsers[selectedRole].map((user) => (
                <div key={user.id} className="flex items-center space-x-3 text-sm text-blue-800">
                  <User className="h-4 w-4" />
                  <span>{user.name}</span>
                  <span className="text-blue-600">(@{user.username})</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Login Button */}
        <button
          onClick={handleLogin}
          className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-all duration-300 transform hover:scale-105 ${
            getColorClasses(roleDescriptions[selectedRole].color, 'bg')
          } hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2`}
        >
          以{roleDescriptions[selectedRole].title.replace('登录', '')}身份进入
        </button>

        {/* Demo Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-sm text-yellow-800">
            <p className="font-medium mb-1">🎆 演示模式说明</p>
            <p>
              这是一个功能完整的演示系统，您可以随时切换不同角色体验各种功能。
              所有数据存储在本地，刷新页面不会丢失数据。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;