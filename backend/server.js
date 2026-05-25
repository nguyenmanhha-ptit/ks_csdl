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
    const pool = await dbPromise;

    // Check Employees
    let [rows] = await pool.execute('SELECT * FROM Employees WHERE Username = ? OR Email = ? OR Phone = ?', [identifier, identifier, identifier]);
    let user = rows[0];
    let isCustomer = false;

    // Check Customers
    if (!user) {
      [rows] = await pool.execute('SELECT * FROM Customers WHERE Email = ? OR Phone = ?', [identifier, identifier]);
      user = rows[0];
      if (user) isCustomer = true;
    }

    if (!user) return res.status(401).json({ message: 'Tài khoản không tồn tại!' });
    if (user.PasswordHash !== password) return res.status(401).json({ message: 'Sai mật khẩu!' });

    const payload = {
      id: isCustomer ? user.CustomerID : user.EmployeeID,
      role: isCustomer ? 'Customer' : user.Role,
      name: user.FullName,
      email: user.Email || identifier
    };
    
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: payload });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.get('/api/auth/me', auth, (req, res) => { res.json(req.user); });

app.post('/api/auth/register', async (req, res) => {
  try {
    const { fullName, phone, email, password, nationality } = req.body;
    const pool = await dbPromise;
    
    const [check] = await pool.execute('SELECT * FROM Customers WHERE Phone = ? OR Email = ?', [phone, email]);
      
    if (check.length > 0) return res.status(400).json({ message: 'Số điện thoại hoặc Email đã tồn tại' });

    const [result] = await pool.execute(`
        INSERT INTO Customers (FullName, Phone, Email, PasswordHash, Nationality) 
        VALUES (?, ?, ?, ?, ?)
      `, [fullName, phone, email, password, nationality || 'Vietnam']);
    
    const payload = { id: result.insertId, role: 'Customer', name: fullName, email };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: payload });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.get('/api/hotels', async (req, res) => {
  try {
    const pool = await dbPromise;
    const [hotels] = await pool.execute('SELECT * FROM Hotels');
    res.json({ data: hotels });
  } catch (err) { res.json({ data: [] }); }
});

app.get('/api/hotels/:id', async (req, res) => {
  try {
    const pool = await dbPromise;
    const [hotelRes] = await pool.execute('SELECT * FROM Hotels WHERE HotelID = ?', [req.params.id]);
    const hotel = hotelRes[0];
    if (!hotel) return res.status(404).json({ message: 'Not found' });
    
    const [rooms] = await pool.execute(`
      SELECT r.RoomID, r.HotelID, r.RoomNumber, r.Status, r.PricePerNight, rt.TypeName, rt.MaxGuest as CapacityAdult, r.Floor 
      FROM Rooms r
      JOIN RoomTypes rt ON r.RoomTypeID = rt.RoomTypeID
      WHERE r.HotelID = ?
    `, [req.params.id]);
    const [reviews] = await pool.execute(`
      SELECT r.ReviewID, c.FullName as CustomerName, r.RatingScore, r.Comment
      FROM Reviews r JOIN Customers c ON r.CustomerID = c.CustomerID
      WHERE r.HotelID = ?
    `, [req.params.id]);
    res.json({ ...hotel, rooms, reviews, AvgRating: 5, ReviewCount: reviews.length });
  } catch (err) { res.json({ data: [] }); }
});

app.post('/api/bookings', auth, async (req, res) => {
  try {
    const { hotelId, roomIds, checkInDate, checkOutDate } = req.body;
    const pool = await dbPromise;
    const code = 'BK' + Math.floor(Math.random() * 100000);
    await pool.execute(`
        INSERT INTO Bookings (CustomerID, HotelID, BookingCode, CheckInDate, CheckOutDate, AdultCount, RoomCount, PaymentStatus) 
        VALUES (?, ?, ?, ?, ?, 2, 1, 'Unpaid')
      `, [req.user.id, hotelId, code, checkInDate, checkOutDate]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.get('/api/bookings/my', auth, async (req, res) => {
  try {
    const pool = await dbPromise;
    const [bookings] = await pool.execute(`
      SELECT b.BookingID, b.BookingCode, b.CheckInDate, b.CheckOutDate, b.BookingStatus, h.HotelName, h.City, b.AdultCount, b.RoomCount 
      FROM Bookings b JOIN Hotels h ON b.HotelID = h.HotelID 
      WHERE b.CustomerID = ?
    `, [req.user.id]);
    res.json(bookings);
  } catch (err) { res.json([]); }
});

app.get('/api/bookings/search', auth, async (req, res) => {
  try {
    const pool = await dbPromise;
    const [bookings] = await pool.execute(`
      SELECT b.BookingID, b.BookingCode, c.FullName as CustomerName, c.Phone as CustomerPhone, b.CheckInDate, b.CheckOutDate, b.BookingStatus, b.HotelID
      FROM Bookings b JOIN Customers c ON b.CustomerID = c.CustomerID
    `);
    res.json(bookings);
  } catch (err) { res.json([]); }
});

app.post('/api/stays/checkin', auth, async (req, res) => {
  try {
    const { bookingId, roomId, depositAmount, representativeName } = req.body;
    const pool = await dbPromise;
    
    // MySQL2 doesn't support multiple statements by default in execute() unless enabled
    // We execute them sequentially
    await pool.execute(`INSERT INTO Stays (BookingID, RoomID, ActualCheckIn, DepositAmount, RepresentativeName) VALUES (?, ?, NOW(), ?, ?)`, [bookingId, roomId, depositAmount || 0, representativeName || 'Khách']);
    await pool.execute(`UPDATE Rooms SET Status = 'Occupied' WHERE RoomID = ?`, [roomId]);
    await pool.execute(`UPDATE Bookings SET BookingStatus = 'Confirmed' WHERE BookingID = ?`, [bookingId]);
    
    res.json({ success: true });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.get('/api/stays', auth, async (req, res) => {
  try {
    const pool = await dbPromise;
    const [stays] = await pool.execute(`
      SELECT s.StayID, s.RoomID, r.RoomNumber, c.FullName as CustomerName, c.Phone as CustomerPhone, 
             s.ActualCheckIn, s.CheckOutDate, s.BookingID
      FROM Stays s
      JOIN Rooms r ON s.RoomID = r.RoomID
      JOIN Bookings b ON s.BookingID = b.BookingID
      JOIN Customers c ON b.CustomerID = c.CustomerID
      WHERE s.ActualCheckOut IS NULL
    `);
    res.json(stays);
  } catch (err) { res.json([]); }
});

app.get('/api/employees', auth, async (req, res) => {
  try {
    const pool = await dbPromise;
    const [emps] = await pool.execute('SELECT EmployeeID, FullName, Username, Role, Email, Phone FROM Employees');
    res.json(emps);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.get('/api/rooms', auth, async (req, res) => {
  try {
    const pool = await dbPromise;
    const [rooms] = await pool.execute(`
      SELECT r.RoomID, r.RoomNumber, r.Status, h.HotelName 
      FROM Rooms r JOIN Hotels h ON r.HotelID = h.HotelID
    `);
    res.json(rooms);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.get('/api/admin/accounts', auth, async (req, res) => {
  try {
    const pool = await dbPromise;
    const [emps] = await pool.execute("SELECT EmployeeID as id, FullName, Username, Role, Email, Phone FROM Employees");
    const [custs] = await pool.execute("SELECT CustomerID as id, FullName, Phone as Username, 'Customer' as Role, Email, Phone FROM Customers");
    res.json([...emps, ...custs]);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.get('/api/manager/dashboard', auth, async (req, res) => {
  try {
    const pool = await dbPromise;
    const [[bookings]] = await pool.execute('SELECT COUNT(*) as total FROM Bookings');
    const [[rooms]] = await pool.execute('SELECT COUNT(*) as total FROM Rooms');
    const [[emps]] = await pool.execute('SELECT COUNT(*) as total FROM Employees');
    res.json({
      totalBookings: bookings.total,
      totalRooms: rooms.total,
      totalEmployees: emps.total,
      revenue: 125000000
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.get('/api/favorites', auth, (req, res) => { res.json([]); });
app.post('/api/favorites', auth, (req, res) => { res.json({ favorited: true }); });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('✅ Backend Server (MySQL) đang chạy tại port:', PORT);
});
