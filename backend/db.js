const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '123456', // Bạn nhớ dặn user đổi mật khẩu nếu cần
  database: process.env.DB_NAME || 'HotelManagementDB',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let pool = null;

async function setupDatabase() {
  try {
    pool = mysql.createPool(dbConfig);
    // Thử kết nối để xem có lỗi không
    const connection = await pool.getConnection();
    console.log('✅ Connected to MySQL database (HotelManagementDB).');
    connection.release();
    return pool;
  } catch (err) {
    console.error('Database Connection Failed! Sai mật khẩu MySQL hoặc DB chưa tạo: ', err.message);
    throw err;
  }
}

const dbPromise = setupDatabase();

module.exports = { dbPromise };
