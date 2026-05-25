// Modal
export function Modal({ open, onClose, title, children, size = 'md' }) {
  if (!open) return null;
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className={`${sizes[size]} w-full bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h3 className="font-display text-lg font-semibold text-white">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl leading-none">✕</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// Stats Card
export function StatCard({ icon, label, value, sub, color = 'primary' }) {
  const colors = {
    primary: 'from-primary-900/40 to-primary-800/20 border-primary-700/50',
    gold: 'from-yellow-900/40 to-yellow-800/20 border-yellow-700/50',
    emerald: 'from-emerald-900/40 to-emerald-800/20 border-emerald-700/50',
    blue: 'from-blue-900/40 to-blue-800/20 border-blue-700/50',
    red: 'from-red-900/40 to-red-800/20 border-red-700/50',
  };
  return (
    <div className={`bg-gradient-to-br ${colors[color]} border rounded-xl p-5`}>
      <div className="text-2xl mb-2">{icon}</div>
      <p className="text-gray-400 text-sm">{label}</p>
      <p className="text-2xl font-bold text-white mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  );
}

// Badge
export function StatusBadge({ status }) {
  const map = {
    Available: 'badge-available', Occupied: 'badge-occupied', Maintenance: 'badge-maintenance',
    Pending: 'badge-pending', Confirmed: 'badge-confirmed', Cancelled: 'badge-cancelled',
    Active: 'badge-available', Inactive: 'badge-cancelled',
    Paid: 'badge-confirmed', Unpaid: 'badge-pending',
  };
  return <span className={map[status] || 'badge-pending'}>{status}</span>;
}

// Stars
export function Stars({ rating }) {
  return (
    <span>{Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < Math.round(rating) ? 'star-gold' : 'text-gray-600'}>★</span>
    ))}</span>
  );
}

// Loading
export function Loading() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

// Empty
export function Empty({ message = 'Không có dữ liệu' }) {
  return (
    <div className="text-center py-16 text-gray-500">
      <div className="text-5xl mb-4">📭</div>
      <p>{message}</p>
    </div>
  );
}

// Page Header
export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-white">{title}</h1>
        {subtitle && <p className="text-gray-400 text-sm mt-1">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

// Form Field
export function Field({ label, error, children }) {
  return (
    <div>
      {label && <label className="label">{label}</label>}
      {children}
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}

// Confirm Dialog
export function Confirm({ open, onClose, onConfirm, message }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-sm w-full mx-4">
        <p className="text-gray-200 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="btn-secondary">Hủy</button>
          <button onClick={onConfirm} className="btn-danger">Xác nhận</button>
        </div>
      </div>
    </div>
  );
}
