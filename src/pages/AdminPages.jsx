import { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { adminService, managerService } from '../services/api';

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

export function AdminDashboard() {
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
      <h1 className="text-2xl font-display font-bold text-white mb-6">Trang Quản Trị Hệ Thống</h1>
      {loading ? <Loading /> : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon="⚙️" label="Hệ thống" value="Hoạt động" color="emerald" />
          <StatCard icon="📋" label="Tổng Booking" value={stats.totalBookings} color="blue" />
          <StatCard icon="🛏️" label="Tổng Số Phòng" value={stats.totalRooms} color="purple" />
          <StatCard icon="👥" label="Tổng Nhân sự" value={stats.totalEmployees} color="yellow" />
        </div>
      ) : <Empty message="Không thể tải dữ liệu thống kê" />}
    </DashboardLayout>
  );
}

export function AdminAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getAccounts()
      .then(res => setAccounts(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-display font-bold text-white">Quản lý Tài khoản (Nhân viên & Khách)</h1>
        <button className="btn btn-primary">Tạo tài khoản</button>
      </div>
      {loading ? <Loading /> : accounts.length === 0 ? <Empty message="Chưa có tài khoản nào" /> : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr>
              {['Họ tên', 'Định danh (SĐT/Email)', 'Vai trò'].map(h => <th key={h} className="table-header">{h}</th>)}
            </tr></thead>
            <tbody>
              {accounts.map((a, i) => (
                <tr key={`${a.id}-${a.Role}-${i}`} className="hover:bg-gray-800/50">
                  <td className="table-cell font-medium text-white">{a.FullName}</td>
                  <td className="table-cell text-gray-400">{a.Username || a.Email || a.Phone}</td>
                  <td className="table-cell">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      a.Role === 'Admin' ? 'bg-red-500/20 text-red-400' :
                      a.Role === 'Manager' ? 'bg-purple-500/20 text-purple-400' :
                      a.Role === 'Customer' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-gray-700 text-gray-300'
                    }`}>
                      {a.Role}
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
