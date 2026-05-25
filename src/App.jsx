import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './store/AuthContext';
import { Toaster } from 'react-hot-toast';

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

          {/* Phân hệ Khách hàng (Customer) */}
          <Route path="/customer" element={<CustomerHome />} />
          <Route path="/customer/hotels" element={<CustomerHotels />} />
          <Route path="/customer/hotels/:id" element={<CustomerHotelDetail />} />
          <Route path="/customer/bookings" element={<CustomerBookings />} />
          <Route path="/customer/favorites" element={<CustomerFavorites />} />
          <Route path="/customer/profile" element={<CustomerProfile />} />

          {/* Đường dẫn sai cấu trúc sẽ đẩy về Login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
      {/* Thành phần hiển thị thông báo Pop-up */}
      <Toaster position="top-right" reverseOrder={false} />
    </AuthProvider>
  );
}