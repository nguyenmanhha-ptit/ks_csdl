const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { dbPromise } = require('./db');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey_luxstay';

const auth = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

app.post('/api/auth/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;
    const db = await dbPromise;

    // Check Employees
    let user = await db.get('SELECT * FROM Employees WHERE Username = ? OR Email = ? OR Phone = ?', [identifier, identifier, identifier]);
    let isCustomer = false;

    // Check Customers if not employee
    if (!user) {
      user = await db.get('SELECT * FROM Customers WHERE Email = ? OR Phone = ?', [identifier, identifier]);
      if (user) isCustomer = true;
    }

    if (!user) {
      return res.status(401).json({ message: 'Tài khoản không tồn tại!' });
    }

    if (user.PasswordHash !== password) {
      return res.status(401).json({ message: 'Sai mật khẩu!' });
    }

    const payload = {
      id: isCustomer ? user.CustomerID : user.EmployeeID,
      role: isCustomer ? 'Customer' : user.Role,
      name: user.FullName,
      email: user.Email || identifier
    };
    
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: payload });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/auth/me', auth, (req, res) => {
  res.json(req.user);
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { fullName, phone, email, password, nationality } = req.body;
    const db = await dbPromise;
    
    const exists = await db.get('SELECT * FROM Customers WHERE Phone = ? OR Email = ?', [phone, email]);
    if (exists) return res.status(400).json({ message: 'Số điện thoại hoặc Email đã tồn tại' });

    const result = await db.run('INSERT INTO Customers (FullName, Phone, Email, PasswordHash, Nationality) VALUES (?, ?, ?, ?, ?)', 
      [fullName, phone, email, password, nationality || 'Vietnam']);
    
    const payload = { id: result.lastID, role: 'Customer', name: fullName, email };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: payload });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi đăng ký: ' + err.message });
  }
});

app.get('/api/stays', auth, async (req, res) => {
  try {
    const db = await dbPromise;
    const stays = await db.all(`
      SELECT s.StayID, s.RoomID, r.RoomNumber, c.FullName as CustomerName, c.Phone as CustomerPhone, 
             s.ActualCheckIn, s.CheckOutDate, s.BookingID
      FROM Stays s
      JOIN Rooms r ON s.RoomID = r.RoomID
      JOIN Bookings b ON s.BookingID = b.BookingID
      JOIN Customers c ON b.CustomerID = c.CustomerID
    `);
    res.json(stays);
  } catch (err) {
    res.json([]);
  }
});

app.get('/api/hotels', async (req, res) => {
  try {
    const db = await dbPromise;
    const hotels = await db.all('SELECT * FROM Hotels');
    res.json({ data: hotels });
  } catch (err) {
    res.json({ data: [] });
  }
});

app.get('/api/employees', auth, async (req, res) => {
  try {
    const db = await dbPromise;
    const emps = await db.all('SELECT EmployeeID, FullName, Username, Role, Email, Phone FROM Employees');
    res.json(emps);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/rooms', auth, async (req, res) => {
  try {
    const db = await dbPromise;
    const rooms = await db.all(`
      SELECT r.RoomID, r.RoomNumber, r.Status, h.HotelName 
      FROM Rooms r 
      JOIN Hotels h ON r.HotelID = h.HotelID
    `);
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/admin/accounts', auth, async (req, res) => {
  try {
    const db = await dbPromise;
    const emps = await db.all("SELECT EmployeeID as id, FullName, Username, Role, Email, Phone FROM Employees");
    const custs = await db.all("SELECT CustomerID as id, FullName, Phone as Username, 'Customer' as Role, Email, Phone FROM Customers");
    res.json([...emps, ...custs]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/manager/dashboard', auth, async (req, res) => {
  try {
    const db = await dbPromise;
    const bookings = await db.get('SELECT COUNT(*) as total FROM Bookings');
    const rooms = await db.get('SELECT COUNT(*) as total FROM Rooms');
    const emps = await db.get('SELECT COUNT(*) as total FROM Employees');
    res.json({
      totalBookings: bookings.total,
      totalRooms: rooms.total,
      totalEmployees: emps.total,
      revenue: 125000000 // Mock revenue for demo
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/bookings/search', auth, async (req, res) => {
  try {
    const db = await dbPromise;
    const bookings = await db.all(`
      SELECT b.BookingID, b.BookingCode, c.FullName as CustomerName, c.Phone as CustomerPhone, b.CheckInDate, b.CheckOutDate, b.BookingStatus, b.HotelID
      FROM Bookings b
      JOIN Customers c ON b.CustomerID = c.CustomerID
    `);
    res.json(bookings);
  } catch (err) {
    res.json([]);
  }
});

app.post('/api/stays/checkin', auth, async (req, res) => {
  try {
    const { bookingId, roomId, depositAmount, representativeName } = req.body;
    const db = await dbPromise;
    await db.run('INSERT INTO Stays (BookingID, RoomID, ActualCheckIn) VALUES (?, ?, ?)', [bookingId, roomId, new Date().toISOString()]);
    await db.run("UPDATE Rooms SET Status = 'Occupied' WHERE RoomID = ?", [roomId]);
    await db.run("UPDATE Bookings SET BookingStatus = 'Confirmed' WHERE BookingID = ?", [bookingId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/hotels/:id', async (req, res) => {
  try {
    const db = await dbPromise;
    const hotel = await db.get('SELECT * FROM Hotels WHERE HotelID = ?', [req.params.id]);
    if (!hotel) return res.status(404).json({ message: 'Not found' });
    const rooms = await db.all("SELECT RoomID, HotelID, RoomNumber, Status, 1500000 as PricePerNight, 'Standard' as TypeName, 2 as CapacityAdult, 1 as Floor FROM Rooms WHERE HotelID = ?", [req.params.id]);
    const reviews = [];
    res.json({ ...hotel, rooms, reviews, AvgRating: 5, ReviewCount: 12 });
  } catch (err) {
    res.json({ data: [] });
  }
});

app.post('/api/bookings', auth, async (req, res) => {
  try {
    const { hotelId, roomIds, checkInDate, checkOutDate } = req.body;
    const db = await dbPromise;
    const code = 'BK' + Math.floor(Math.random() * 100000);
    await db.run(
      'INSERT INTO Bookings (CustomerID, HotelID, BookingCode, CheckInDate, CheckOutDate) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, hotelId, code, checkInDate, checkOutDate]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/bookings/my', auth, async (req, res) => {
  try {
    const db = await dbPromise;
    const bookings = await db.all(`
      SELECT b.BookingID, b.BookingCode, b.CheckInDate, b.CheckOutDate, b.BookingStatus, h.HotelName, h.City, 2 as AdultCount, 1 as RoomCount 
      FROM Bookings b JOIN Hotels h ON b.HotelID = h.HotelID 
      WHERE b.CustomerID = ?
    `, [req.user.id]);
    res.json(bookings);
  } catch (err) {
    res.json([]);
  }
});

app.patch('/api/bookings/:id/cancel', auth, async (req, res) => {
  try {
    const db = await dbPromise;
    await db.run("UPDATE Bookings SET BookingStatus = 'Cancelled' WHERE BookingID = ? AND CustomerID = ?", [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/favorites', auth, (req, res) => {
  res.json([]);
});

app.post('/api/favorites', auth, (req, res) => {
  res.json({ favorited: true });
});

app.use('/api', (req, res) => {
  res.json({ data: [], message: 'API chưa cài đặt chi tiết trên SQLite!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('✅ Backend Server (SQLite) đang chạy tại port:', PORT);
});
