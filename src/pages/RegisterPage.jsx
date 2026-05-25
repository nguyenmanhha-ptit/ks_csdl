import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', phone: '', email: '', password: '', confirm: '', nationality: 'Vietnam' });
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error('Mật khẩu không khớp');
    setLoading(true);
    try {
      await register({ fullName: form.fullName, phone: form.phone, email: form.email, password: form.password, nationality: form.nationality });
      toast.success('Đăng ký thành công!');
      navigate('/customer');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đăng ký thất bại');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-bold text-white">LuxStay</h1>
          <p className="text-gray-400 mt-2">Tạo tài khoản khách hàng</p>
        </div>
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Họ và tên *</label>
              <input className="input-field" required placeholder="Nguyễn Văn A"
                value={form.fullName} onChange={e => set('fullName', e.target.value)} />
            </div>
            <div>
              <label className="label">Số điện thoại *</label>
              <input className="input-field" required placeholder="0901234567"
                value={form.phone} onChange={e => set('phone', e.target.value)} />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" className="input-field" placeholder="example@email.com"
                value={form.email} onChange={e => set('email', e.target.value)} />
            </div>
            <div>
              <label className="label">Mật khẩu *</label>
              <input type="password" className="input-field" required placeholder="••••••••"
                value={form.password} onChange={e => set('password', e.target.value)} />
            </div>
            <div>
              <label className="label">Xác nhận mật khẩu *</label>
              <input type="password" className="input-field" required placeholder="••••••••"
                value={form.confirm} onChange={e => set('confirm', e.target.value)} />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? 'Đang tạo tài khoản...' : 'Đăng ký'}
            </button>
          </form>
          <p className="text-center text-gray-400 text-sm mt-4">
            Đã có tài khoản?{' '}<Link to="/login" className="text-primary-400 hover:text-primary-300">Đăng nhập</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
