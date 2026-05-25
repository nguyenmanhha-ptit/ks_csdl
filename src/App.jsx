import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './store/AuthContext';
import { Toaster } from 'react-hot-toast';
import DashboardLayout from './components/layout/DashboardLayout';

// Import các trang giao diện
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { 
  ReceptionistDashboard, 
  ReceptionistBookings, 
  ReceptionistStays, 
  ReceptionistCheckIn 
} from './pages/ReceptionistPages';
import { 
  CustomerHome, 
  CustomerHotels, 
  CustomerHotelDetail, 
  CustomerBookings, 
  CustomerFavorites, 
  CustomerProfile 
} from './pages/CustomerPages';
import { ManagerDashboard, ManagerHotels, ManagerRooms, ManagerEmployees } from './pages/ManagerPages';
import { AdminDashboard, AdminAccounts } from './pages/AdminPages';

const ComingSoon = ({ title }) => (
  <DashboardLayout>
    <div className="flex flex-col items-center justify-center h-full text-center py-20">
      <div className="text-6xl mb-4">🚧</div>
      <h1 className="text-3xl font-display font-bold text-white mb-2">Phân hệ {title}</h1>
      <p className="text-gray-400">Giao diện này đang được phát triển. Vui lòng quay lại sau!</p>
    </div>
  </DashboardLayout>
);

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Định tuyến mặc định */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Xác thực hệ thống */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Phân hệ Lễ tân (Receptionist) */}
          <Route path="/receptionist" element={<ReceptionistDashboard />} />
          <Route path="/receptionist/bookings" element={<ReceptionistBookings />} />
          <Route path="/receptionist/checkin" element={<ReceptionistCheckIn />} />
          <Route path="/receptionist/stays" element={<ReceptionistStays />} />
          <Route path="/receptionist/services" element={<ComingSoon title="Dịch vụ (Lễ tân)" />} />

          {/* Phân hệ Khách hàng (Customer) */}
          <Route path="/customer" element={<CustomerHome />} />
          <Route path="/customer/hotels" element={<CustomerHotels />} />
          <Route path="/customer/hotels/:id" element={<CustomerHotelDetail />} />
          <Route path="/customer/bookings" element={<CustomerBookings />} />
          <Route path="/customer/favorites" element={<CustomerFavorites />} />
          <Route path="/customer/profile" element={<CustomerProfile />} />

          {/* Các phân hệ chưa có giao diện chi tiết */}
          <Route path="/housekeeping/*" element={<ComingSoon title="Buồng phòng (Housekeeping)" />} />

          {/* Phân hệ Quản lý (Manager) */}
          <Route path="/manager" element={<ManagerDashboard />} />
          <Route path="/manager/hotels" element={<ManagerHotels />} />
          <Route path="/manager/rooms" element={<ManagerRooms />} />
          <Route path="/manager/employees" element={<ManagerEmployees />} />
          <Route path="/manager/*" element={<ComingSoon title="Chức năng (Manager)" />} />

          {/* Phân hệ Admin */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/accounts" element={<AdminAccounts />} />
          <Route path="/admin/employees" element={<ManagerEmployees />} />
          <Route path="/admin/hotels" element={<ManagerHotels />} />
          <Route path="/admin/*" element={<ComingSoon title="Chức năng (Admin)" />} />

          {/* Đường dẫn sai cấu trúc sẽ đẩy về Login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
      {/* Thành phần hiển thị thông báo Pop-up */}
      <Toaster position="top-right" reverseOrder={false} />
    </AuthProvider>
  );
}