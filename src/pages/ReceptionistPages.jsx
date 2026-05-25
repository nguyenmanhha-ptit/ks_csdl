import { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { StatCard, Loading, Empty, StatusBadge, Modal, Field, PageHeader } from '../components/common';
import { bookingService, stayService, serviceService, paymentService, roomService, employeeService } from '../services/api';
import { useAuth } from '../store/AuthContext';
import toast from 'react-hot-toast';

// ======= RECEPTIONIST DASHBOARD =======
export function ReceptionistDashboard() {
  const { user } = useAuth();
  const [stays, setStays] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    stayService.getAll({ hotelId: user?.hotelId, active: true }).then(r => setStays(r.data)).finally(() => setLoading(false));
  }, []);
  return (
    <DashboardLayout>
      <PageHeader title="Lễ tân - Tổng quan" subtitle={`Khách sạn ID: ${user?.hotelId || 'N/A'}`} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard icon="🛏️" label="Khách đang lưu trú" value={stays.length} color="emerald" />
        <StatCard icon="📋" label="Ca làm việc" value="Sáng (6:00 - 14:00)" color="blue" />
        <StatCard icon="⏰" label="Thời gian hiện tại" value={new Date().toLocaleTimeString('vi-VN')} color="primary" />
      </div>
      <h2 className="font-display text-xl font-semibold text-white mb-4">Khách đang lưu trú</h2>
      {loading ? <Loading /> : stays.length === 0 ? <Empty message="Hiện không có khách lưu trú" /> : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr>
              {['Phòng', 'Khách hàng', 'Điện thoại', 'Check-in', 'Check-out dự kiến'].map(h => <th key={h} className="table-header">{h}</th>)}
            </tr></thead>
            <tbody>
              {stays.map(s => (
                <tr key={s.StayID} className="hover:bg-gray-800/50">
                  <td className="table-cell font-bold text-primary-400">{s.RoomNumber}</td>
                  <td className="table-cell">{s.CustomerName}</td>
                  <td className="table-cell">{s.CustomerPhone}</td>
                  <td className="table-cell">{s.ActualCheckIn ? new Date(s.ActualCheckIn).toLocaleString('vi-VN') : '—'}</td>
                  <td className="table-cell">{new Date(s.CheckOutDate).toLocaleDateString('vi-VN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}

// ======= SEARCH BOOKINGS =======
export function ReceptionistBookings() {
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState({ code: '', phone: '', status: '' });
  const [loading, setLoading] = useState(false);
  const [checkInModal, setCheckInModal] = useState(null);
  const [checkInForm, setCheckInForm] = useState({ roomId: '', depositAmount: 0, representativeName: '' });
  const [rooms, setRooms] = useState([]);
  const { user } = useAuth();

  const doSearch = () => {
    setLoading(true);
    bookingService.search(search).then(r => setBookings(r.data)).finally(() => setLoading(false));
  };

  const openCheckIn = (booking) => {
    setCheckInModal(booking);
    roomService.getAll({ hotelId: booking.HotelID || user?.hotelId, status: 'Available' }).then(r => setRooms(r.data));
  };

  const handleCheckIn = async () => {
    if (!checkInForm.roomId || !checkInForm.representativeName) return toast.error('Điền đầy đủ thông tin');
    try {
      await stayService.checkIn({ bookingId: checkInModal.BookingID, roomId: +checkInForm.roomId, depositAmount: checkInForm.depositAmount, representativeName: checkInForm.representativeName });
      toast.success('Check-in thành công!');
      setCheckInModal(null);
      doSearch();
    } catch (err) { toast.error(err.response?.data?.message || 'Lỗi check-in'); }
  };

  return (
    <DashboardLayout>
      <PageHeader title="Tìm kiếm Booking" />
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input className="input-field" placeholder="Mã booking..." value={search.code} onChange={e => setSearch(p => ({ ...p, code: e.target.value }))} />
          <input className="input-field" placeholder="Số điện thoại..." value={search.phone} onChange={e => setSearch(p => ({ ...p, phone: e.target.value }))} />
          <select className="input-field" value={search.status} onChange={e => setSearch(p => ({ ...p, status: e.target.value }))}>
            <option value="">Tất cả trạng thái</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <button onClick={doSearch} className="btn-primary">🔍 Tìm kiếm</button>
        </div>
      </div>
      {loading ? <Loading /> : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr>
              {['Mã booking', 'Khách hàng', 'Điện thoại', 'Check-in', 'Check-out', 'Trạng thái', 'Thao tác'].map(h => <th key={h} className="table-header">{h}</th>)}
            </tr></thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b.BookingID} className="hover:bg-gray-800/50">
                  <td className="table-cell font-bold text-primary-400">{b.BookingCode}</td>
                  <td className="table-cell">{b.CustomerName}</td>
                  <td className="table-cell">{b.CustomerPhone}</td>
                  <td className="table-cell">{new Date(b.CheckInDate).toLocaleDateString('vi-VN')}</td>
                  <td className="table-cell">{new Date(b.CheckOutDate).toLocaleDateString('vi-VN')}</td>
                  <td className="table-cell"><StatusBadge status={b.BookingStatus} /></td>
                  <td className="table-cell">
                    {b.BookingStatus === 'Pending' && (
                      <button onClick={() => openCheckIn(b)} className="btn-primary text-xs py-1">Check-in</button>
                    )}
                  </td>
                </tr>
              ))}
              {!bookings.length && <tr><td colSpan={7} className="table-cell text-center text-gray-500">Nhập điều kiện tìm kiếm</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={!!checkInModal} onClose={() => setCheckInModal(null)} title={`Check-in: ${checkInModal?.BookingCode}`}>
        <div className="space-y-4">
          <Field label="Phòng">
            <select className="input-field" value={checkInForm.roomId} onChange={e => setCheckInForm(p => ({ ...p, roomId: e.target.value }))}>
              <option value="">-- Chọn phòng --</option>
              {rooms.map(r => <option key={r.RoomID} value={r.RoomID}>Phòng {r.RoomNumber} - {r.TypeName}</option>)}
            </select>
          </Field>
          <Field label="Tên đại diện">
            <input className="input-field" value={checkInForm.representativeName}
              onChange={e => setCheckInForm(p => ({ ...p, representativeName: e.target.value }))} />
          </Field>
          <Field label="Tiền đặt cọc">
            <input type="number" className="input-field" value={checkInForm.depositAmount}
              onChange={e => setCheckInForm(p => ({ ...p, depositAmount: +e.target.value }))} />
          </Field>
          <button onClick={handleCheckIn} className="btn-primary w-full">✅ Xác nhận Check-in</button>
        </div>
      </Modal>
    </DashboardLayout>
  );
}

// ======= ACTIVE STAYS (checkout) =======
export function ReceptionistStays() {
  const { user } = useAuth();
  const [stays, setStays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [invoiceModal, setInvoiceModal] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [payModal, setPayModal] = useState(null);
  const [services, setServices] = useState([]);
  const [svcForm, setSvcForm] = useState({ serviceId: '', quantity: 1, note: '' });

  useEffect(() => {
    stayService.getAll({ hotelId: user?.hotelId, active: true }).then(r => setStays(r.data)).finally(() => setLoading(false));
    serviceService.getAll({ hotelId: user?.hotelId }).then(r => setServices(r.data));
  }, []);

  const handleCheckOut = async (stay) => {
    try {
      await stayService.checkOut({ stayId: stay.StayID });
      toast.success('Check-out thành công!');
      setStays(p => p.filter(s => s.StayID !== stay.StayID));
    } catch { toast.error('Lỗi check-out'); }
  };

  const openInvoice = async (stay) => {
    const res = await stayService.getInvoice(stay.BookingID);
    setInvoice(res.data);
    setInvoiceModal(stay);
  };

  const addService = async (stayId) => {
    if (!svcForm.serviceId) return toast.error('Chọn dịch vụ');
    try {
      await serviceService.addUsage({ stayId, serviceId: +svcForm.serviceId, quantity: svcForm.quantity, note: svcForm.note });
      toast.success('Thêm dịch vụ thành công!');
      setSvcForm({ serviceId: '', quantity: 1, note: '' });
    } catch { toast.error('Lỗi thêm dịch vụ'); }
  };

  return (
    <DashboardLayout>
      <PageHeader title="Khách đang lưu trú" subtitle={`${stays.length} phòng đang sử dụng`} />
      {loading ? <Loading /> : stays.length === 0 ? <Empty message="Không có khách đang lưu trú" /> : (
        <div className="space-y-4">
          {stays.map(s => (
            <div key={s.StayID} className="card">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-primary-400 font-bold text-lg">Phòng {s.RoomNumber}</p>
                  <p className="text-white font-medium">{s.CustomerName} - {s.CustomerPhone}</p>
                  <p className="text-gray-400 text-sm">Check-in: {s.ActualCheckIn ? new Date(s.ActualCheckIn).toLocaleString('vi-VN') : '—'}</p>
                  <p className="text-gray-400 text-sm">Check-out dự kiến: {new Date(s.CheckOutDate).toLocaleDateString('vi-VN')}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openInvoice(s)} className="btn-secondary text-xs">🧾 Hóa đơn</button>
                  <button onClick={() => setPayModal(s)} className="btn-secondary text-xs">➕ Dịch vụ</button>
                  <button onClick={() => handleCheckOut(s)} className="btn-primary text-xs">Check-out</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!invoiceModal} onClose={() => setInvoiceModal(null)} title="Chi tiết hóa đơn" size="lg">
        {invoice && (
          <div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div><p className="text-gray-400 text-sm">Mã booking</p><p className="text-white font-bold">{invoice.booking?.BookingCode}</p></div>
              <div><p className="text-gray-400 text-sm">Khách hàng</p><p className="text-white">{invoice.booking?.CustomerName}</p></div>
            </div>
            <h4 className="text-gray-300 font-medium mb-2">Phòng</h4>
            {invoice.rooms?.map(r => (
              <div key={r.BookingRoomID} className="flex justify-between py-2 border-b border-gray-800">
                <span className="text-gray-300">Phòng {r.RoomNumber} ({r.Nights} đêm)</span>
                <span className="text-white">{(r.NightPrice * r.Nights)?.toLocaleString()}đ</span>
              </div>
            ))}
            {invoice.services?.length > 0 && <>
              <h4 className="text-gray-300 font-medium mt-4 mb-2">Dịch vụ</h4>
              {invoice.services.map(s => (
                <div key={s.UsageID} className="flex justify-between py-2 border-b border-gray-800">
                  <span className="text-gray-300">{s.ServiceName} x{s.Quantity}</span>
                  <span className="text-white">{s.Amount?.toLocaleString()}đ</span>
                </div>
              ))}
            </>}
            <div className="flex justify-between py-3 text-lg font-bold">
              <span className="text-white">Tổng cộng</span>
              <span className="text-gold-400">
                {((invoice.rooms?.reduce((a, r) => a + r.NightPrice * r.Nights, 0) || 0) + (invoice.services?.reduce((a, s) => a + s.Amount, 0) || 0))?.toLocaleString()}đ
              </span>
            </div>
            <button className="btn-gold w-full" onClick={async () => {
              const total = (invoice.rooms?.reduce((a, r) => a + r.NightPrice * r.Nights, 0) || 0) + (invoice.services?.reduce((a, s) => a + s.Amount, 0) || 0);
              try {
                await paymentService.create({ bookingId: invoice.booking.BookingID, amount: total, finalAmount: total * 1.1, vatAmount: total * 0.1, paymentMethod: 'Cash' });
                toast.success('Thanh toán thành công!');
                setInvoiceModal(null);
              } catch { toast.error('Lỗi thanh toán'); }
            }}>💳 Thanh toán (Cash)</button>
          </div>
        )}
      </Modal>

      <Modal open={!!payModal} onClose={() => setPayModal(null)} title="Thêm dịch vụ">
        <div className="space-y-4">
          <Field label="Dịch vụ">
            <select className="input-field" value={svcForm.serviceId} onChange={e => setSvcForm(p => ({ ...p, serviceId: e.target.value }))}>
              <option value="">-- Chọn dịch vụ --</option>
              {services.filter(s => s.Status === 'Active').map(s => (
                <option key={s.ServiceID} value={s.ServiceID}>{s.ServiceName} - {s.UnitPrice?.toLocaleString()}đ</option>
              ))}
            </select>
          </Field>
          <Field label="Số lượng">
            <input type="number" min={1} className="input-field" value={svcForm.quantity} onChange={e => setSvcForm(p => ({ ...p, quantity: +e.target.value }))} />
          </Field>
          <Field label="Ghi chú">
            <input className="input-field" value={svcForm.note} onChange={e => setSvcForm(p => ({ ...p, note: e.target.value }))} />
          </Field>
          <button onClick={() => addService(payModal.StayID)} className="btn-primary w-full">Thêm dịch vụ</button>
        </div>
      </Modal>
    </DashboardLayout>
  );
}

// ======= DIRECT BOOKING =======
export function ReceptionistCheckIn() {
  const { user } = useAuth();
  const [form, setForm] = useState({ phone: '', hotelId: user?.hotelId || '', checkInDate: '', checkOutDate: '', adultCount: 1, childCount: 0 });
  const [customer, setCustomer] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [selected, setSelected] = useState([]);

  const searchCustomer = async () => {
    try {
      const res = await bookingService.search({ phone: form.phone });
      if (res.data.length > 0) { setCustomer({ CustomerID: res.data[0].CustomerID, FullName: res.data[0].CustomerName }); toast.success('Tìm thấy khách hàng'); }
      else toast.error('Không tìm thấy');
    } catch { toast.error('Lỗi tìm kiếm'); }
  };

  const loadRooms = () => {
    roomService.getAll({ hotelId: form.hotelId, status: 'Available' }).then(r => setRooms(r.data));
  };

  const handleCreate = async () => {
    if (!customer || selected.length === 0 || !form.checkInDate || !form.checkOutDate) return toast.error('Điền đầy đủ thông tin');
    try {
      await bookingService.createDirect({ customerId: customer.CustomerID, hotelId: +form.hotelId, roomIds: selected, checkInDate: form.checkInDate, checkOutDate: form.checkOutDate, adultCount: form.adultCount, childCount: form.childCount });
      toast.success('Tạo booking trực tiếp thành công!');
    } catch (err) { toast.error(err.response?.data?.message || 'Lỗi'); }
  };

  return (
    <DashboardLayout>
      <PageHeader title="Tạo Booking Trực tiếp" />
      <div className="card max-w-2xl space-y-5">
        <div>
          <label className="label">Tìm khách hàng (số điện thoại)</label>
          <div className="flex gap-2">
            <input className="input-field flex-1" placeholder="0901234567" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
            <button onClick={searchCustomer} className="btn-secondary">Tìm</button>
          </div>
          {customer && <div className="mt-2 p-3 bg-emerald-900/30 border border-emerald-800 rounded-lg"><p className="text-emerald-400 text-sm">✅ {customer.FullName}</p></div>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Ngày check-in"><input type="date" className="input-field" value={form.checkInDate} onChange={e => setForm(p => ({ ...p, checkInDate: e.target.value }))} /></Field>
          <Field label="Ngày check-out"><input type="date" className="input-field" value={form.checkOutDate} onChange={e => setForm(p => ({ ...p, checkOutDate: e.target.value }))} /></Field>
        </div>
        <div><button onClick={loadRooms} className="btn-secondary w-full">🔄 Tải danh sách phòng trống</button></div>
        {rooms.length > 0 && (
          <div>
            <label className="label">Chọn phòng</label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {rooms.map(r => (
                <label key={r.RoomID} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border ${selected.includes(r.RoomID) ? 'border-primary-500 bg-primary-900/20' : 'border-gray-700 hover:border-gray-600'}`}>
                  <input type="checkbox" checked={selected.includes(r.RoomID)} onChange={() => setSelected(p => p.includes(r.RoomID) ? p.filter(i => i !== r.RoomID) : [...p, r.RoomID])} />
                  <span className="text-white flex-1">Phòng {r.RoomNumber} - {r.TypeName}</span>
                  <span className="text-primary-400">{r.PricePerNight?.toLocaleString()}đ/đêm</span>
                </label>
              ))}
            </div>
          </div>
        )}
        <button onClick={handleCreate} className="btn-gold w-full py-3">✅ Tạo Booking</button>
      </div>
    </DashboardLayout>
  );
}
