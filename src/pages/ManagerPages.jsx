import { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { managerService, hotelService, roomService, employeeService } from '../services/api';

const StatCard = ({ icon, label, value, color }) => (
  <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl flex items-center gap-4">
    <div className={`text-4xl bg-${color}-500/10 text-${color}-400 p-4 rounded-xl`}>{icon}</div>
    <div>
      <p className="text-gray-400 text-sm">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  </div>
);

const Loading = () => <div className="text-gray-400 text-center py-8">Đang tải dữ liệu...</div>;
const Empty = ({ message }) => <div className="text-gray-500 text-center py-8">{message}</div>;

export function ManagerDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    managerService.getDashboard()
      .then(res => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-display font-bold text-white mb-6">Tổng quan Kinh doanh</h1>
      {loading ? <Loading /> : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon="💰" label="Doanh thu (Ước tính)" value={new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.revenue)} color="emerald" />
          <StatCard icon="📋" label="Tổng Booking" value={stats.totalBookings} color="blue" />
          <StatCard icon="🛏️" label="Tổng Số Phòng" value={stats.totalRooms} color="purple" />
          <StatCard icon="👥" label="Tổng Nhân viên" value={stats.totalEmployees} color="yellow" />
        </div>
      ) : <Empty message="Không thể tải dữ liệu thống kê" />}
    </DashboardLayout>
  );
}

export function ManagerHotels() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    hotelService.getAll()
      .then(res => setHotels(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-display font-bold text-white">Quản lý Khách sạn</h1>
        <button className="btn btn-primary">Thêm Khách sạn</button>
      </div>
      {loading ? <Loading /> : hotels.length === 0 ? <Empty message="Chưa có khách sạn nào" /> : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr>
              {['ID', 'Tên khách sạn', 'Hạng', 'Thành phố', 'Quốc gia'].map(h => <th key={h} className="table-header">{h}</th>)}
            </tr></thead>
            <tbody>
              {hotels.map(h => (
                <tr key={h.HotelID} className="hover:bg-gray-800/50">
                  <td className="table-cell">{h.HotelID}</td>
                  <td className="table-cell font-medium text-white">{h.HotelName}</td>
                  <td className="table-cell">{h.StarRating} Sao</td>
                  <td className="table-cell">{h.City}</td>
                  <td className="table-cell">{h.Country}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}

export function ManagerRooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    roomService.getAll()
      .then(res => setRooms(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-display font-bold text-white">Quản lý Phòng</h1>
        <button className="btn btn-primary">Thêm Phòng</button>
      </div>
      {loading ? <Loading /> : rooms.length === 0 ? <Empty message="Chưa có phòng nào" /> : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr>
              {['Phòng', 'Khách sạn', 'Trạng thái'].map(h => <th key={h} className="table-header">{h}</th>)}
            </tr></thead>
            <tbody>
              {rooms.map(r => (
                <tr key={r.RoomID} className="hover:bg-gray-800/50">
                  <td className="table-cell font-bold text-primary-400">{r.RoomNumber}</td>
                  <td className="table-cell">{r.HotelName}</td>
                  <td className="table-cell">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      r.Status === 'Available' ? 'bg-emerald-500/20 text-emerald-400' :
                      r.Status === 'Occupied' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {r.Status === 'Available' ? 'Trống' : r.Status === 'Occupied' ? 'Có khách' : r.Status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}

export function ManagerEmployees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    employeeService.getAll()
      .then(res => setEmployees(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-display font-bold text-white">Nhân sự</h1>
        <button className="btn btn-primary">Thêm Nhân viên</button>
      </div>
      {loading ? <Loading /> : employees.length === 0 ? <Empty message="Chưa có nhân viên" /> : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr>
              {['Họ tên', 'Email / SĐT', 'Tài khoản', 'Vai trò'].map(h => <th key={h} className="table-header">{h}</th>)}
            </tr></thead>
            <tbody>
              {employees.map(e => (
                <tr key={e.EmployeeID} className="hover:bg-gray-800/50">
                  <td className="table-cell font-medium text-white">{e.FullName}</td>
                  <td className="table-cell text-gray-400">{e.Email || e.Phone}</td>
                  <td className="table-cell">{e.Username}</td>
                  <td className="table-cell">
                    <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs font-medium">{e.Role}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}
