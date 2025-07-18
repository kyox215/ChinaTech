import { Link, useLocation } from 'react-router-dom';
import { Phone, User, LogOut, Settings, Wrench, BarChart3 } from 'lucide-react';
import { useAuth } from '../lib/auth';

const Navbar = () => {
  const { isLoggedIn, user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  // Role switching removed for simplification

  return (
    <nav className="bg-white shadow-lg border-b border-blue-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
              <Wrench className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">极速维修</h1>
              <p className="text-xs text-gray-500">专业手机维修服务</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === '/' 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              首页
            </Link>
            
            <Link 
              to="/quote" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/quote') 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              在线报价
            </Link>
            
            <Link 
              to="/query" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/query') 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              订单查询
            </Link>

            {/* 联系方式 */}
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Phone className="h-4 w-4" />
              <span>400-888-9999</span>
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {isLoggedIn && user ? (
              <div className="flex items-center space-x-4">
                {/* 角色切换按钮（演示用） */}
                <div className="hidden lg:flex items-center space-x-2">
                  <span className="text-xs text-gray-500">演示模式:</span>
                  <button
                    onClick={() => () => {}}
                    className={`px-2 py-1 text-xs rounded ${
                      false 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    客户
                  </button>
                  <button
                    onClick={() => () => {}}
                    className={`px-2 py-1 text-xs rounded ${
                      user.role === 'technician' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    技术员
                  </button>
                  <button
                    onClick={() => () => {}}
                    className={`px-2 py-1 text-xs rounded ${
                      user.role === 'admin' 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    管理员
                  </button>
                </div>

                {/* 用户信息 */}
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-gray-600" />
                    <div className="text-sm">
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">
                        {user.role === 'admin' ? '管理员' : 
                         user.role === 'technician' ? '技术员' : '客户'}
                      </p>
                    </div>
                  </div>

                  {/* 工作台链接 */}
                  {user.role === 'technician' && (
                    <Link
                      to="/technician"
                      className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive('/technician') 
                          ? 'text-green-600 bg-green-50' 
                          : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                      }`}
                    >
                      <Settings className="h-4 w-4" />
                      <span>工作台</span>
                    </Link>
                  )}

                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive('/admin') 
                          ? 'text-purple-600 bg-purple-50' 
                          : 'text-gray-700 hover:text-purple-600 hover:bg-purple-50'
                      }`}
                    >
                      <BarChart3 className="h-4 w-4" />
                      <span>管理后台</span>
                    </Link>
                  )}

                  {/* 登出按钮 */}
                  <button
                    onClick={logout}
                    className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>登出</span>
                  </button>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <User className="h-4 w-4" />
                <span>登录</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden bg-white border-t border-gray-200">
        <div className="px-2 pt-2 pb-3 space-y-1">
          <Link 
            to="/" 
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              location.pathname === '/' 
                ? 'text-blue-600 bg-blue-50' 
                : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            首页
          </Link>
          
          <Link 
            to="/quote" 
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive('/quote') 
                ? 'text-blue-600 bg-blue-50' 
                : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            在线报价
          </Link>
          
          <Link 
            to="/query" 
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive('/query') 
                ? 'text-blue-600 bg-blue-50' 
                : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            订单查询
          </Link>

          {/* Mobile Role Switch */}
          {isLoggedIn && user && (
            <div className="pt-2 border-t border-gray-200">
              <div className="px-3 py-2">
                <p className="text-xs text-gray-500 mb-2">演示模式 - 角色切换:</p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => () => {}}
                    className={`px-3 py-1 text-sm rounded ${
                      false 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    客户
                  </button>
                  <button
                    onClick={() => () => {}}
                    className={`px-3 py-1 text-sm rounded ${
                      user.role === 'technician' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    技术员
                  </button>
                  <button
                    onClick={() => () => {}}
                    className={`px-3 py-1 text-sm rounded ${
                      user.role === 'admin' 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    管理员
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;