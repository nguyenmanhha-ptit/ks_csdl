# Quản lý Khách sạn - Đồ án / Bài tập lớn

Hệ thống quản lý khách sạn fullstack với React.js (Frontend), Node.js/Express (Backend) và MySQL (Database).

## Yêu cầu hệ thống
- Node.js (phiên bản 16 trở lên)
- MySQL Workbench hoặc MySQL Server

## Hướng dẫn cài đặt và chạy trên máy tính mới

### Bước 1: Cài đặt Cơ sở dữ liệu (MySQL)
1. Cài đặt phần mềm MySQL Server và MySQL Workbench.
2. Mở MySQL Workbench.
3. Chạy file `mysql_schema.sql` (có sẵn trong thư mục dự án) để tự động tạo Database `HotelManagementDB` và các bảng.
4. Ghi nhớ Mật khẩu MySQL của bạn.

### Bước 2: Cài đặt Backend
1. Mở Terminal / Command Prompt, di chuyển vào thư mục `backend`:
   ```bash
   cd backend
   ```
2. Cài đặt các thư viện cần thiết:
   ```bash
   npm install
   ```
3. Tạo một file tên là `.env` trong thư mục `backend` và điền cấu hình như sau:
   ```env
   DB_USER=root
   DB_PASSWORD=mật_khẩu_mysql_của_bạn
   DB_HOST=localhost
   DB_NAME=HotelManagementDB
   JWT_SECRET=luxstay_secret_123
   PORT=5000
   ```
4. Khởi động Backend:
   ```bash
   node server.js
   ```

### Bước 3: Cài đặt Frontend
1. Mở một Terminal khác, di chuyển vào thư mục gốc của dự án (`web-ks`):
2. Cài đặt các thư viện React:
   ```bash
   npm install
   ```
3. Khởi động Frontend:
   ```bash
   npm run dev
   ```

### Bước 4: Trải nghiệm
Mở trình duyệt và truy cập: `http://localhost:5173/`

Tài khoản dùng thử:
- Khách hàng: `customer1` / `Cust@123`
- Quản lý: `manager1` / `Manager@123`
- Lễ tân: `receptionist1` / `Recep@123`
- Quản trị viên: `admin` / `Admin@123`
