-- ============================================================
-- HOTEL MANAGEMENT SYSTEM - MYSQL CONVERTED SCRIPT
-- ============================================================

CREATE DATABASE IF NOT EXISTS HotelManagementDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE HotelManagementDB;

-- 1. BẢNG HOTELS
CREATE TABLE IF NOT EXISTS Hotels (
    HotelID       INT              NOT NULL AUTO_INCREMENT,
    HotelName     VARCHAR(200)     NOT NULL,
    StarRating    TINYINT          NULL,
    CheckInTime   TIME             NOT NULL,
    CheckOutTime  TIME             NOT NULL,
    Address       VARCHAR(255)     NOT NULL,
    City          VARCHAR(100)     NOT NULL,
    District      VARCHAR(100)     NOT NULL,
    Country       VARCHAR(100)     NOT NULL,
    Latitude      DECIMAL(10, 8)   NULL,
    Longitude     DECIMAL(11, 8)   NULL,
    Description   LONGTEXT         NULL,
    Policy        LONGTEXT         NULL,
    CreatedAt     DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (HotelID)
);

-- 2. BẢNG ROOM_TYPES
CREATE TABLE IF NOT EXISTS RoomTypes (
    RoomTypeID  INT              NOT NULL AUTO_INCREMENT,
    HotelID     INT              NOT NULL,
    TypeName    VARCHAR(100)     NOT NULL,
    BedType     VARCHAR(50)      NULL,
    Area        DECIMAL(5, 2)    NULL,
    MaxGuest    INT              NOT NULL,
    BasePrice   DECIMAL(18, 2)   NOT NULL,
    PRIMARY KEY (RoomTypeID),
    FOREIGN KEY (HotelID) REFERENCES Hotels(HotelID) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 3. BẢNG ROOMS
CREATE TABLE IF NOT EXISTS Rooms (
    RoomID          INT              NOT NULL AUTO_INCREMENT,
    HotelID         INT              NOT NULL,
    RoomTypeID      INT              NOT NULL,
    RoomNumber      VARCHAR(20)      NOT NULL,
    Floor           INT              NOT NULL,
    CapacityAdult   INT              NOT NULL,
    CapacityChild   INT              NOT NULL DEFAULT 0,
    PricePerNight   DECIMAL(18, 2)   NOT NULL,
    Status          VARCHAR(20)      NOT NULL DEFAULT 'Available',
    Description     LONGTEXT         NULL,
    PRIMARY KEY (RoomID),
    FOREIGN KEY (HotelID) REFERENCES Hotels(HotelID),
    FOREIGN KEY (RoomTypeID) REFERENCES RoomTypes(RoomTypeID),
    UNIQUE (HotelID, RoomNumber)
);

-- 4. BẢNG CUSTOMERS
CREATE TABLE IF NOT EXISTS Customers (
    CustomerID    INT              NOT NULL AUTO_INCREMENT,
    FullName      VARCHAR(150)     NOT NULL,
    Phone         VARCHAR(20)      NOT NULL,
    Email         VARCHAR(100)     NULL,
    IDCard        VARCHAR(50)      NULL,
    PasswordHash  LONGTEXT         NOT NULL,
    PassportNo    VARCHAR(20)      NULL,
    DateOfBirth   DATE             NULL,
    Nationality   VARCHAR(50)      NOT NULL DEFAULT 'Vietnam',
    Address       VARCHAR(255)     NULL,
    LoyaltyPoint  INT              NOT NULL DEFAULT 0,
    CreatedAt     DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (CustomerID),
    UNIQUE (Phone),
    UNIQUE (Email)
);

-- 5. BẢNG EMPLOYEES
CREATE TABLE IF NOT EXISTS Employees (
    EmployeeID    INT              NOT NULL AUTO_INCREMENT,
    HotelID       INT              NOT NULL,
    FullName      VARCHAR(150)     NOT NULL,
    Phone         VARCHAR(20)      NULL,
    Email         VARCHAR(100)     NULL,
    Username      VARCHAR(50)      NOT NULL,
    PasswordHash  LONGTEXT         NOT NULL,
    Role          VARCHAR(50)      NOT NULL,
    Position      VARCHAR(100)     NULL,
    Salary        DECIMAL(18, 2)   NULL,
    Status        VARCHAR(50)      NOT NULL,
    PRIMARY KEY (EmployeeID),
    FOREIGN KEY (HotelID) REFERENCES Hotels(HotelID),
    UNIQUE (Username)
);

-- 6. BẢNG BOOKINGS
CREATE TABLE IF NOT EXISTS Bookings (
    BookingID       INT              NOT NULL AUTO_INCREMENT,
    CustomerID      INT              NOT NULL,
    HotelID         INT              NOT NULL,
    BookingCode     VARCHAR(20)      NOT NULL,
    CheckInDate     DATE             NOT NULL,
    CheckOutDate    DATE             NOT NULL,
    AdultCount      INT              NOT NULL,
    ChildCount      INT              NOT NULL DEFAULT 0,
    RoomCount       INT              NOT NULL,
    BookingStatus   VARCHAR(20)      NOT NULL DEFAULT 'Pending',
    PaymentStatus   VARCHAR(50)      NOT NULL,
    BookingChannel  VARCHAR(50)      NULL,
    CreatedAt       DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (BookingID),
    FOREIGN KEY (CustomerID) REFERENCES Customers(CustomerID),
    FOREIGN KEY (HotelID) REFERENCES Hotels(HotelID),
    UNIQUE (BookingCode)
);

-- 7. BẢNG BOOKING_ROOMS
CREATE TABLE IF NOT EXISTS BookingRooms (
    BookingRoomID   INT              NOT NULL AUTO_INCREMENT,
    BookingID       INT              NOT NULL,
    RoomID          INT              NOT NULL,
    NightPrice      DECIMAL(18, 2)   NOT NULL,
    Discount        DECIMAL(18, 2)   NOT NULL DEFAULT 0,
    SpecialRequest  LONGTEXT         NULL,
    PRIMARY KEY (BookingRoomID),
    FOREIGN KEY (BookingID) REFERENCES Bookings(BookingID),
    FOREIGN KEY (RoomID) REFERENCES Rooms(RoomID)
);

-- 8. BẢNG STAYS (Chi tiết lưu trú)
CREATE TABLE IF NOT EXISTS Stays (
    StayID               INT              NOT NULL AUTO_INCREMENT,
    BookingID            INT              NOT NULL,
    RoomID               INT              NOT NULL,
    ActualCheckIn        DATETIME         NULL,
    ActualCheckOut       DATETIME         NULL,
    DepositAmount        DECIMAL(18, 2)   NOT NULL DEFAULT 0,
    RepresentativeName   VARCHAR(150)     NOT NULL,
    OrganizationName     VARCHAR(200)     NULL,
    PRIMARY KEY (StayID),
    FOREIGN KEY (BookingID) REFERENCES Bookings(BookingID),
    FOREIGN KEY (RoomID) REFERENCES Rooms(RoomID)
);

-- 9. BẢNG SERVICES
CREATE TABLE IF NOT EXISTS Services (
    ServiceID    INT              NOT NULL AUTO_INCREMENT,
    HotelID      INT              NOT NULL,
    ServiceName  VARCHAR(150)     NOT NULL,
    ServiceType  VARCHAR(100)     NULL,
    UnitPrice    DECIMAL(18, 2)   NOT NULL,
    Description  LONGTEXT         NULL,
    Status       VARCHAR(50)      NOT NULL,
    PRIMARY KEY (ServiceID),
    FOREIGN KEY (HotelID) REFERENCES Hotels(HotelID)
);

-- 10. BẢNG SERVICE_USAGE
CREATE TABLE IF NOT EXISTS ServiceUsage (
    UsageID    INT              NOT NULL AUTO_INCREMENT,
    StayID     INT              NOT NULL,
    ServiceID  INT              NOT NULL,
    Quantity   INT              NOT NULL,
    UsageTime  DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Amount     DECIMAL(18, 2)   NOT NULL,
    Note       VARCHAR(255)     NULL,
    PRIMARY KEY (UsageID),
    FOREIGN KEY (StayID) REFERENCES Stays(StayID),
    FOREIGN KEY (ServiceID) REFERENCES Services(ServiceID)
);

-- 11. BẢNG PAYMENTS
CREATE TABLE IF NOT EXISTS Payments (
    PaymentID        INT              NOT NULL AUTO_INCREMENT,
    BookingID        INT              NOT NULL,
    Amount           DECIMAL(18, 2)   NOT NULL,
    VATAmount        DECIMAL(18, 2)   NOT NULL DEFAULT 0,
    DiscountAmount   DECIMAL(18, 2)   NOT NULL DEFAULT 0,
    FinalAmount      DECIMAL(18, 2)   NOT NULL,
    PaymentMethod    VARCHAR(50)      NOT NULL,
    PaymentTime      DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PaymentStatus    VARCHAR(50)      NOT NULL,
    TransactionCode  VARCHAR(100)     NULL,
    PRIMARY KEY (PaymentID),
    FOREIGN KEY (BookingID) REFERENCES Bookings(BookingID),
    UNIQUE (TransactionCode)
);

-- 12. BẢNG REVIEWS
CREATE TABLE IF NOT EXISTS Reviews (
    ReviewID     INT              NOT NULL AUTO_INCREMENT,
    CustomerID   INT              NOT NULL,
    HotelID      INT              NOT NULL,
    BookingID    INT              NOT NULL,
    RatingScore  INT              NOT NULL,
    Comment      LONGTEXT         NULL,
    CreatedAt    DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (ReviewID),
    FOREIGN KEY (CustomerID) REFERENCES Customers(CustomerID),
    FOREIGN KEY (HotelID) REFERENCES Hotels(HotelID),
    FOREIGN KEY (BookingID) REFERENCES Bookings(BookingID)
);

-- 13. BẢNG FAVORITE_HOTELS
CREATE TABLE IF NOT EXISTS FavoriteHotels (
    FavoriteID   INT       NOT NULL AUTO_INCREMENT,
    CustomerID   INT       NOT NULL,
    HotelID      INT       NOT NULL,
    CreatedAt    DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (FavoriteID),
    FOREIGN KEY (CustomerID) REFERENCES Customers(CustomerID),
    FOREIGN KEY (HotelID) REFERENCES Hotels(HotelID),
    UNIQUE (CustomerID, HotelID)
);

-- INSERT DEMO DATA --
INSERT INTO Hotels (HotelName, StarRating, CheckInTime, CheckOutTime, Address, City, District, Country) VALUES
('LuxStay Hà Nội', 5, '14:00', '12:00', 'Số 1 Phạm Văn Đồng', 'Hà Nội', 'Cầu Giấy', 'Vietnam'),
('LuxStay Đà Nẵng', 4, '14:00', '12:00', '100 Võ Nguyên Giáp', 'Đà Nẵng', 'Sơn Trà', 'Vietnam');

INSERT INTO RoomTypes (HotelID, TypeName, BedType, MaxGuest, BasePrice) VALUES
(1, 'Standard Room', 'Single', 2, 1000000),
(1, 'Deluxe Room', 'Double', 4, 2500000),
(2, 'Ocean View', 'Double', 2, 1800000);

INSERT INTO Rooms (HotelID, RoomTypeID, RoomNumber, Floor, CapacityAdult, PricePerNight, Status) VALUES
(1, 1, '101', 1, 2, 1000000, 'Available'),
(1, 2, '201', 2, 4, 2500000, 'Occupied'),
(2, 3, '301', 3, 2, 1800000, 'Available');

INSERT INTO Customers (FullName, Phone, Email, PasswordHash, Nationality) VALUES
('Customer Demo', 'customer1', 'customer1@luxstay.com', 'Cust@123', 'Vietnam');

INSERT INTO Employees (HotelID, FullName, Username, PasswordHash, Role, Status) VALUES 
(1, 'Admin Demo', 'admin', 'Admin@123', 'Admin', 'Active'),
(1, 'Manager Demo', 'manager1', 'Manager@123', 'Manager', 'Active'),
(1, 'Receptionist Demo', 'receptionist1', 'Recep@123', 'Receptionist', 'Active'),
(1, 'Housekeeping Demo', 'housekeeping1', 'House@123', 'Housekeeping', 'Active');
