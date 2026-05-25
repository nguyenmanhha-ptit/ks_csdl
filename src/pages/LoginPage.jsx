import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [loading, setLoading] = useState(false);

  const ROLE_REDIRECTS = {
    Customer: '/customer', Receptionist: '/receptionist',
    Housekeeping: '/housekeeping', Manager: '/manager', Admin: '/admin'
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.identifier || !form.password) return toast.error('Vui lòng nhập đầy đủ thông tin');
    setLoading(true);
    try {
      const user = await login(form.identifier, form.password);
      toast.success(`Chào mừng, ${user.name}!`);
      navigate(ROLE_REDIRECTS[user.role] || '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-900 via-gray-900 to-gray-950 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #d946ef 0%, transparent 50%), radial-gradient(circle at 80% 20%, #7c3aed 0%, transparent 50%)' }} />
        <div className="relative z-10 text-center">
          <h1 className="font-display text-6xl font-bold text-white mb-4">LuxStay</h1>
          <p className="text-gray-300 text-xl mb-8">Hệ thống Quản lý Khách sạn</p>
          <div className="grid grid-cols-2 gap-4 text-left">
            {[
              { icon: '🏨', text: 'Quản lý đa khách sạn' },
              { icon: '📊', text: 'Báo cáo thời gian thực' },
              { icon: '👥', text: 'Phân quyền 5 cấp' },
              { icon: '💳', text: 'Thanh toán tích hợp' },
            ].map(i => (
              <div key={i.text} className="bg-white/10 backdrop-blur rounded-xl p-4">
                <div className="text-2xl mb-2">{i.icon}</div>
                <p className="text-white text-sm font-medium">{i.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <h1 className="font-display text-4xl font-bold text-white">LuxStay</h1>
          </div>

          <div className="card">
            <h2 className="font-display text-2xl font-bold text-white mb-2">Đăng nhập</h2>
            <p className="text-gray-400 text-sm mb-6">Nhập thông tin tài khoản của bạn</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Số điện thoại / Email / Username</label>
                <input className="input-field" placeholder="Nhập tài khoản..."
                  value={form.identifier} onChange={e => setForm(p => ({ ...p, identifier: e.target.value }))} />
              </div>
              <div>
                <label className="label">Mật khẩu</label>
                <input type="password" className="input-field" placeholder="••••••••"
                  value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-gray-800 text-center">
              <p className="text-gray-400 text-sm">Chưa có tài khoản?{' '}
                <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium">Đăng ký ngay</Link>
              </p>
            </div>

            <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
              <p className="text-xs text-gray-500 font-medium mb-2">Demo accounts:</p>
              <div className="space-y-1 text-xs text-gray-400">
                <p>Admin: <span className="text-gray-300">admin / Admin@123</span></p>
                <p>Manager: <span className="text-gray-300">manager1 / Manager@123</span></p>
                <p>Receptionist: <span className="text-gray-300">receptionist1 / Recep@123</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
