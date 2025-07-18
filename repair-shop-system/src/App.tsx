import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './lib/auth';

// Pages
import HomePage from './pages/HomePage';
import PricingPage from './pages/PricingPage';
import QueryPage from './pages/QueryPage';
import TechnicianDashboard from './pages/TechnicianDashboard';
import AdminDashboard from './pages/AdminDashboard';
import LoginPage from './pages/LoginPage';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function App() {
  const { isLoggedIn, user } = useAuth();

  // 受保护的路由组件
  const ProtectedRoute = ({ children, allowedRoles }: { 
    children: React.ReactNode; 
    allowedRoles: ('admin' | 'technician')[] 
  }) => {
    if (!isLoggedIn || !user) {
      return <Navigate to="/login" replace />;
    }
    
    if (!allowedRoles.includes(user.role)) {
      return <Navigate to="/" replace />;
    }
    
    return <>{children}</>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        <Routes>
          {/* 公开页面 */}
          <Route path="/" element={<HomePage />} />
          <Route path="/quote" element={<PricingPage />} />
          <Route path="/query" element={<QueryPage />} />
          <Route path="/login" element={<LoginPage />} />
          
          {/* 技本员页面 */}
          <Route 
            path="/technician/*" 
            element={
              <ProtectedRoute allowedRoles={['technician', 'admin']}>
                <TechnicianDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* 管理员页面 */}
          <Route 
            path="/admin/*" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* 默认重定向 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      
      <Footer />
    </div>
  );
}

export default App;