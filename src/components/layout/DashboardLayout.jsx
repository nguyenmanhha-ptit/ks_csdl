import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';

const ROLE_MENUS = {
  Customer: [
    { path: '/customer', label: 'Trang chủ', icon: '🏠' },
    { path: '/customer/hotels', label: 'Tìm khách sạn', icon: '🔍' },
    { path: '/customer/bookings', label: 'Đặt phòng của tôi', icon: '📋' },
    { path: '/customer/favorites', label: 'Yêu thích', icon: '❤️' },
    { path: '/customer/profile', label: 'Hồ sơ', icon: '👤' },
  ],
  Receptionist: [
    { path: '/receptionist', label: 'Tổng quan', icon: '🏨' },
    { path: '/receptionist/bookings', label: 'Tìm kiếm Booking', icon: '🔍' },
    { path: '/receptionist/checkin', label: 'Check-in', icon: '✅' },
    { path: '/receptionist/stays', label: 'Khách đang ở', icon: '🛏️' },
    { path: '/receptionist/services', label: 'Dịch vụ', icon: '🍽️' },
  ],
  Housekeeping: [
    { path: '/housekeeping', label: 'Danh sách phòng', icon: '🧹' },
    { path: '/housekeeping/maintenance', label: 'Báo bảo trì', icon: '🔧' },
  ],
  Manager: [
    { path: '/manager', label: 'Dashboard', icon: '📊' },
    { path: '/manager/hotels', label: 'Khách sạn', icon: '🏨' },
    { path: '/manager/rooms', label: 'Phòng', icon: '🛏️' },
    { path: '/manager/room-types', label: 'Loại phòng', icon: '📄' },
    { path: '/manager/services', label: 'Dịch vụ', icon: '🍽️' },
    { path: '/manager/employees', label: 'Nhân viên', icon: '👥' },
    { path: '/manager/revenue', label: 'Doanh thu', icon: '💰' },
    { path: '/manager/occupancy', label: 'Công suất phòng', icon: '📈' },
  ],
  Admin: [
    { path: '/admin', label: 'Dashboard', icon: '⚙️' },
    { path: '/admin/accounts', label: 'Tài khoản hệ thống', icon: '👤' },
    { path: '/admin/hotels', label: 'Khách sạn', icon: '🏨' },
    { path: '/admin/employees', label: 'Nhân viên', icon: '👥' },
  ],
};

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const menu = ROLE_MENUS[user?.role] || [];

  const handleLogout = () => { logout(); navigate('/login'); };

  const ROLE_COLORS = {
    Customer: 'text-blue-400', Receptionist: 'text-emerald-400',
    Housekeeping: 'text-yellow-400', Manager: 'text-purple-400', Admin: 'text-red-400'
  };

  return (
    <div className="flex min-h-screen bg-gray-950">
      {/* Sidebar */}
      <aside className={`${collapsed ? 'w-16' : 'w-64'} bg-gray-900 border-r border-gray-800 flex flex-col transition-all duration-300 fixed top-0 left-0 h-full z-50`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          {!collapsed && (
            <div>
              <h1 className="font-display text-xl font-bold text-white">LuxStay</h1>
              <p className={`text-xs font-medium ${ROLE_COLORS[user?.role]}`}>{user?.role}</p>
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)} className="text-gray-400 hover:text-white p-1 rounded">
            {collapsed ? '→' : '←'}
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {menu.map(item => (
            <Link key={item.path} to={item.path}
              className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}>
              <span className="text-lg">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-800">
          {!collapsed && (
            <div className="px-4 py-2 mb-2">
              <p className="text-sm font-medium text-gray-200 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          )}
          <button onClick={handleLogout}
            className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-900/20">
            <span>🚪</span>
            {!collapsed && <span>Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className={`flex-1 ${collapsed ? 'ml-16' : 'ml-64'} transition-all duration-300 min-h-screen`}>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
