const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

let dbPromise = null;

async function setupDatabase() {
  const db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });

  console.log('✅ Connected to SQLite database.');

  // Tạo các bảng cơ bản nếu chưa tồn tại
  await db.exec(`
    CREATE TABLE IF NOT EXISTS Employees (
      EmployeeID INTEGER PRIMARY KEY AUTOINCREMENT,
      FullName TEXT NOT NULL,
      Phone TEXT,
      Email TEXT,
      Username TEXT UNIQUE NOT NULL,
      PasswordHash TEXT NOT NULL,
      Role TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS Customers (
      CustomerID INTEGER PRIMARY KEY AUTOINCREMENT,
      FullName TEXT NOT NULL,
      Phone TEXT UNIQUE NOT NULL,
      Email TEXT UNIQUE,
      PasswordHash TEXT NOT NULL,
      Nationality TEXT DEFAULT 'Vietnam'
    );

    CREATE TABLE IF NOT EXISTS Hotels (
      HotelID INTEGER PRIMARY KEY AUTOINCREMENT,
      HotelName TEXT NOT NULL,
      StarRating INTEGER,
      City TEXT,
      Country TEXT
    );

    CREATE TABLE IF NOT EXISTS Rooms (
      RoomID INTEGER PRIMARY KEY AUTOINCREMENT,
      HotelID INTEGER,
      RoomNumber TEXT NOT NULL,
      Status TEXT DEFAULT 'Available'
    );

    CREATE TABLE IF NOT EXISTS Bookings (
      BookingID INTEGER PRIMARY KEY AUTOINCREMENT,
      CustomerID INTEGER,
      HotelID INTEGER,
      BookingCode TEXT UNIQUE NOT NULL,
      CheckInDate TEXT,
      CheckOutDate TEXT,
      BookingStatus TEXT DEFAULT 'Pending'
    );

    CREATE TABLE IF NOT EXISTS Stays (
      StayID INTEGER PRIMARY KEY AUTOINCREMENT,
      BookingID INTEGER,
      RoomID INTEGER,
      ActualCheckIn TEXT,
      CheckOutDate TEXT
    );
  `);

  // Tạo dữ liệu mẫu nếu CSDL đang trống
  const empCount = await db.get('SELECT COUNT(*) as count FROM Employees');
  if (empCount.count === 0) {
    console.log('🌱 Seeding demo data into SQLite...');
    await db.exec(`
      INSERT INTO Employees (FullName, Username, PasswordHash, Role, Email) VALUES 
      ('Admin Demo', 'admin', 'Admin@123', 'Admin', 'admin@luxstay.com'),
      ('Manager Demo', 'manager1', 'Manager@123', 'Manager', 'manager@luxstay.com'),
      ('Receptionist Demo', 'receptionist1', 'Recep@123', 'Receptionist', 'recep@luxstay.com'),
      ('Housekeeping Demo', 'housekeeping1', 'House@123', 'Housekeeping', 'house@luxstay.com');

      INSERT INTO Customers (FullName, Phone, Email, PasswordHash, Nationality) VALUES
      ('Customer Demo', 'customer1', 'customer1@luxstay.com', 'Cust@123', 'Vietnam');

      INSERT INTO Hotels (HotelName, StarRating, City, Country) VALUES
      ('LuxStay Hà Nội', 5, 'Hà Nội', 'Vietnam'),
      ('LuxStay Đà Nẵng', 4, 'Đà Nẵng', 'Vietnam');

      INSERT INTO Rooms (HotelID, RoomNumber, Status) VALUES
      (1, '101', 'Available'),
      (1, '102', 'Occupied'),
      (2, '201', 'Available');
    `);
  }

  return db;
}

if (!dbPromise) {
  dbPromise = setupDatabase();
}

module.exports = {
  dbPromise
};
