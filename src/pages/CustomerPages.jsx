import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { StatCard, Loading, Empty, Stars, Modal, Field } from '../components/common';
import { hotelService, bookingService, favoriteService, reviewService, roomService } from '../services/api';
import { useAuth } from '../store/AuthContext';
import toast from 'react-hot-toast';

// ======= CUSTOMER HOME =======
export function CustomerHome() {
  const { user } = useAuth();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { hotelService.getAll({ limit: 6 }).then(r => setHotels(r.data.data)).finally(() => setLoading(false)); }, []);
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-white mb-2">Chào mừng, {user?.name}! 👋</h1>
        <p className="text-gray-400">Khám phá những khách sạn tốt nhất cho chuyến đi của bạn</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard icon="🏨" label="Khách sạn có sẵn" value={hotels.length} color="primary" />
        <StatCard icon="⭐" label="Điểm tích lũy" value={user?.LoyaltyPoint || 0} color="gold" />
        <StatCard icon="🌟" label="Hạng thành viên" value="Standard" color="blue" />
      </div>
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-display text-xl font-semibold text-white">Khách sạn nổi bật</h2>
          <Link to="/customer/hotels" className="text-primary-400 text-sm hover:text-primary-300">Xem tất cả →</Link>
        </div>
        {loading ? <Loading /> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hotels.map(h => <HotelCard key={h.HotelID} hotel={h} />)}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function HotelCard({ hotel }) {
  return (
    <Link to={`/customer/hotels/${hotel.HotelID}`} className="card hover:border-primary-700 transition-colors cursor-pointer group">
      <div className="bg-gradient-to-br from-primary-900 to-gray-800 h-32 rounded-lg mb-4 flex items-center justify-center text-4xl group-hover:scale-105 transition-transform">
        🏨
      </div>
      <h3 className="font-semibold text-white mb-1 truncate">{hotel.HotelName}</h3>
      <p className="text-gray-400 text-sm mb-2">{hotel.City}, {hotel.Country}</p>
      <div className="flex justify-between items-center">
        <Stars rating={hotel.AvgRating} />
        <span className="text-gray-400 text-xs">{hotel.ReviewCount} đánh giá</span>
      </div>
      <div className="mt-2 flex items-center gap-1">
        {Array.from({ length: hotel.StarRating || 0 }, (_, i) => <span key={i} className="text-gold-500 text-xs">★</span>)}
        <span className="text-gray-500 text-xs ml-1">{hotel.StarRating} sao</span>
      </div>
    </Link>
  );
}

// ======= HOTELS LIST =======
export function CustomerHotels() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState({ city: '', star: '', name: '' });

  const fetch = () => {
    setLoading(true);
    hotelService.getAll(search).then(r => setHotels(r.data.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  return (
    <DashboardLayout>
      <h1 className="font-display text-2xl font-bold text-white mb-6">Tìm kiếm khách sạn</h1>
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input className="input-field" placeholder="Tên khách sạn..." value={search.name}
            onChange={e => setSearch(p => ({ ...p, name: e.target.value }))} />
          <input className="input-field" placeholder="Thành phố..." value={search.city}
            onChange={e => setSearch(p => ({ ...p, city: e.target.value }))} />
          <select className="input-field" value={search.star} onChange={e => setSearch(p => ({ ...p, star: e.target.value }))}>
            <option value="">Tất cả hạng sao</option>
            {[1,2,3,4,5].map(s => <option key={s} value={s}>{s} sao</option>)}
          </select>
          <button onClick={fetch} className="btn-primary">🔍 Tìm kiếm</button>
        </div>
      </div>
      {loading ? <Loading /> : hotels.length === 0 ? <Empty message="Không tìm thấy khách sạn" /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {hotels.map(h => <HotelCard key={h.HotelID} hotel={h} />)}
        </div>
      )}
    </DashboardLayout>
  );
}

// ======= HOTEL DETAIL =======
export function CustomerHotelDetail() {
  const hotelId = window.location.pathname.split('/').pop();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookModal, setBookModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [bookForm, setBookForm] = useState({ checkInDate: '', checkOutDate: '', adultCount: 1, childCount: 0 });

  useEffect(() => {
    hotelService.getById(hotelId).then(r => setHotel(r.data)).finally(() => setLoading(false));
  }, [hotelId]);

  const handleBook = async () => {
    if (!bookForm.checkInDate || !bookForm.checkOutDate) return toast.error('Chọn ngày check-in/out');
    try {
      await bookingService.create({ hotelId: +hotelId, roomIds: [selectedRoom.RoomID], ...bookForm });
      toast.success('Đặt phòng thành công!');
      setBookModal(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Lỗi đặt phòng'); }
  };

  const handleFavorite = async () => {
    try {
      const res = await favoriteService.toggle(+hotelId);
      toast.success(res.data.favorited ? 'Đã thêm vào yêu thích' : 'Đã xóa khỏi yêu thích');
    } catch { toast.error('Lỗi'); }
  };

  if (loading) return <DashboardLayout><Loading /></DashboardLayout>;
  if (!hotel) return <DashboardLayout><Empty message="Không tìm thấy khách sạn" /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="max-w-4xl">
        <div className="bg-gradient-to-br from-primary-900 to-gray-800 rounded-2xl h-56 flex items-center justify-center text-6xl mb-6">🏨</div>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-white">{hotel.HotelName}</h1>
            <p className="text-gray-400 mt-1">📍 {hotel.Address}, {hotel.City}, {hotel.Country}</p>
            <div className="flex items-center gap-3 mt-2">
              <Stars rating={hotel.AvgRating} />
              <span className="text-gray-400 text-sm">({hotel.ReviewCount} đánh giá)</span>
              <span className="text-gold-500 text-sm">{hotel.StarRating} ⭐ sao</span>
            </div>
          </div>
          <button onClick={handleFavorite} className="btn-secondary">❤️ Yêu thích</button>
        </div>

        {hotel.Description && <div className="card mb-6"><p className="text-gray-300">{hotel.Description}</p></div>}

        <h2 className="font-display text-xl font-semibold text-white mb-4">Danh sách phòng</h2>
        <div className="space-y-4 mb-8">
          {hotel.rooms?.filter(r => r.Status === 'Available').map(room => (
            <div key={room.RoomID} className="card flex justify-between items-center">
              <div>
                <p className="font-semibold text-white">Phòng {room.RoomNumber} - Tầng {room.Floor}</p>
                <p className="text-gray-400 text-sm">{room.TypeName} | {room.CapacityAdult} người lớn</p>
                <p className="text-primary-400 font-bold mt-1">{room.PricePerNight?.toLocaleString()}đ/đêm</p>
              </div>
              <button onClick={() => { setSelectedRoom(room); setBookModal(true); }} className="btn-gold">Đặt phòng</button>
            </div>
          ))}
          {!hotel.rooms?.some(r => r.Status === 'Available') && <Empty message="Hiện không có phòng trống" />}
        </div>

        <h2 className="font-display text-xl font-semibold text-white mb-4">Đánh giá khách hàng</h2>
        <div className="space-y-3">
          {hotel.reviews?.map(r => (
            <div key={r.ReviewID} className="card">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-white">{r.CustomerName}</span>
                <Stars rating={r.RatingScore} />
              </div>
              <p className="text-gray-400 text-sm">{r.Comment}</p>
            </div>
          ))}
          {!hotel.reviews?.length && <Empty message="Chưa có đánh giá" />}
        </div>
      </div>

      <Modal open={bookModal} onClose={() => setBookModal(false)} title={`Đặt phòng ${selectedRoom?.RoomNumber}`}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Ngày check-in">
              <input type="date" className="input-field" value={bookForm.checkInDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => setBookForm(p => ({ ...p, checkInDate: e.target.value }))} />
            </Field>
            <Field label="Ngày check-out">
              <input type="date" className="input-field" value={bookForm.checkOutDate}
                min={bookForm.checkInDate}
                onChange={e => setBookForm(p => ({ ...p, checkOutDate: e.target.value }))} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Người lớn">
              <input type="number" className="input-field" min={1} value={bookForm.adultCount}
                onChange={e => setBookForm(p => ({ ...p, adultCount: +e.target.value }))} />
            </Field>
            <Field label="Trẻ em">
              <input type="number" className="input-field" min={0} value={bookForm.childCount}
                onChange={e => setBookForm(p => ({ ...p, childCount: +e.target.value }))} />
            </Field>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Giá/đêm: <span className="text-white font-bold">{selectedRoom?.PricePerNight?.toLocaleString()}đ</span></p>
          </div>
          <button onClick={handleBook} className="btn-gold w-full py-3">✅ Xác nhận đặt phòng</button>
        </div>
      </Modal>
    </DashboardLayout>
  );
}

// ======= MY BOOKINGS =======
export function CustomerBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { bookingService.getMy().then(r => setBookings(r.data)).finally(() => setLoading(false)); }, []);

  const cancel = async (id) => {
    try { await bookingService.cancel(id); setBookings(p => p.map(b => b.BookingID === id ? { ...b, BookingStatus: 'Cancelled' } : b)); toast.success('Đã hủy đặt phòng'); }
    catch { toast.error('Không thể hủy'); }
  };

  return (
    <DashboardLayout>
      <h1 className="font-display text-2xl font-bold text-white mb-6">Lịch sử đặt phòng</h1>
      {loading ? <Loading /> : bookings.length === 0 ? <Empty message="Bạn chưa có đặt phòng nào" /> : (
        <div className="space-y-4">
          {bookings.map(b => (
            <div key={b.BookingID} className="card">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-white font-bold">{b.BookingCode}</span>
                    <span className={`badge-${b.BookingStatus.toLowerCase()}`}>{b.BookingStatus}</span>
                  </div>
                  <p className="text-gray-300 font-medium">{b.HotelName}</p>
                  <p className="text-gray-400 text-sm">📍 {b.City}</p>
                  <p className="text-gray-400 text-sm mt-1">
                    {new Date(b.CheckInDate).toLocaleDateString('vi-VN')} → {new Date(b.CheckOutDate).toLocaleDateString('vi-VN')}
                  </p>
                  <p className="text-gray-400 text-sm">{b.AdultCount} người lớn • {b.RoomCount} phòng</p>
                </div>
                {b.BookingStatus === 'Pending' && (
                  <button onClick={() => cancel(b.BookingID)} className="btn-danger text-sm">Hủy</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}

// ======= FAVORITES =======
export function CustomerFavorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { favoriteService.getAll().then(r => setFavorites(r.data)).finally(() => setLoading(false)); }, []);
  return (
    <DashboardLayout>
      <h1 className="font-display text-2xl font-bold text-white mb-6">Khách sạn yêu thích</h1>
      {loading ? <Loading /> : favorites.length === 0 ? <Empty message="Chưa có khách sạn yêu thích" /> : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {favorites.map(h => <HotelCard key={h.HotelID} hotel={h} />)}
        </div>
      )}
    </DashboardLayout>
  );
}

// ======= PROFILE =======
export function CustomerProfile() {
  const { user } = useAuth();
  return (
    <DashboardLayout>
      <h1 className="font-display text-2xl font-bold text-white mb-6">Hồ sơ cá nhân</h1>
      <div className="card max-w-lg">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-primary-800 rounded-full flex items-center justify-center text-2xl">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h2 className="text-white font-bold text-xl">{user?.name}</h2>
            <p className="text-gray-400 text-sm">{user?.email}</p>
            <span className="badge-confirmed mt-1 inline-block">Customer</span>
          </div>
        </div>
        <div className="space-y-3">
          {[['📞 Điện thoại', user?.Phone], ['📧 Email', user?.email], ['🗺️ Địa chỉ', user?.Address || 'Chưa cập nhật'], ['🌍 Quốc tịch', user?.Nationality]].map(([k, v]) => (
            <div key={k} className="flex justify-between py-2 border-b border-gray-800">
              <span className="text-gray-400 text-sm">{k}</span>
              <span className="text-gray-200 text-sm">{v || '—'}</span>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
