import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

// Auth
export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// Hotels
export const hotelService = {
  getAll: (params) => api.get('/hotels', { params }),
  getById: (id) => api.get(`/hotels/${id}`),
  create: (data) => api.post('/hotels', data),
  update: (id, data) => api.put(`/hotels/${id}`, data),
  delete: (id) => api.delete(`/hotels/${id}`),
};

// Rooms
export const roomService = {
  getAll: (params) => api.get('/rooms', { params }),
  create: (data) => api.post('/rooms', data),
  update: (id, data) => api.put(`/rooms/${id}`, data),
  updateStatus: (id, status) => api.patch(`/rooms/${id}/status`, { status }),
  delete: (id) => api.delete(`/rooms/${id}`),
};

// Room Types
export const roomTypeService = {
  getAll: (params) => api.get('/room-types', { params }),
  create: (data) => api.post('/room-types', data),
  update: (id, data) => api.put(`/room-types/${id}`, data),
  delete: (id) => api.delete(`/room-types/${id}`),
};

// Bookings
export const bookingService = {
  create: (data) => api.post('/bookings', data),
  getMy: () => api.get('/bookings/my'),
  getById: (id) => api.get(`/bookings/${id}`),
  cancel: (id) => api.patch(`/bookings/${id}/cancel`),
  search: (params) => api.get('/bookings/search', { params }),
  createDirect: (data) => api.post('/bookings/direct', data),
};

// Stays
export const stayService = {
  checkIn: (data) => api.post('/stays/checkin', data),
  checkOut: (data) => api.post('/stays/checkout', data),
  getAll: (params) => api.get('/stays', { params }),
  getInvoice: (bookingId) => api.get(`/invoices/${bookingId}`),
};

// Employees
export const employeeService = {
  getAll: (params) => api.get('/employees', { params }),
  create: (data) => api.post('/employees', data),
  update: (id, data) => api.put(`/employees/${id}`, data),
  delete: (id) => api.delete(`/employees/${id}`),
};

// Services
export const serviceService = {
  getAll: (params) => api.get('/services', { params }),
  create: (data) => api.post('/services', data),
  update: (id, data) => api.put(`/services/${id}`, data),
  delete: (id) => api.delete(`/services/${id}`),
  addUsage: (data) => api.post('/service-usage', data),
};

// Payments
export const paymentService = {
  create: (data) => api.post('/payments', data),
};

// Reviews & Favorites
export const reviewService = {
  create: (data) => api.post('/reviews', data),
};
export const favoriteService = {
  toggle: (hotelId) => api.post('/favorites', { hotelId }),
  getAll: () => api.get('/favorites'),
};

// Reports
export const reportService = {
  getRevenue: (params) => api.get('/reports/revenue', { params }),
  getOccupancy: (params) => api.get('/reports/occupancy', { params }),
};

// Admin
export const adminService = {
  getAccounts: () => api.get('/admin/accounts'),
  updateRole: (id, role) => api.put(`/admin/employees/${id}/role`, { role }),
  toggleLock: (id) => api.patch(`/admin/accounts/${id}/toggle-lock`),
};

// Housekeeping
export const housekeepingService = {
  reportMaintenance: (roomId) => api.post('/housekeeping/maintenance', { roomId }),
  markCleaned: (roomId) => api.post('/housekeeping/cleaned', { roomId }),
};
