-- ============================================================
--  HOTEL MANAGEMENT SYSTEM - DATABASE CREATION SCRIPT
--  Tương thích: SQL Server 2016+ / SSMS 18+
--  Tác giả: Generated từ tài liệu thiết kế CSDL
-- ============================================================

USE master;
GO

-- Tạo database nếu chưa tồn tại
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'HotelManagementDB')
BEGIN
    CREATE DATABASE HotelManagementDB;
    PRINT N'Database HotelManagementDB đã được tạo thành công.';
END
ELSE
BEGIN
    PRINT N'Database HotelManagementDB đã tồn tại.';
END
GO

USE HotelManagementDB;
GO

-- ============================================================
--  1. BẢNG HOTELS
-- ============================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Hotels')
BEGIN
    CREATE TABLE Hotels (
        HotelID       INT              NOT NULL IDENTITY(1,1),
        HotelName     NVARCHAR(200)    NOT NULL,
        StarRating    TINYINT          NULL,
        CheckInTime   TIME             NOT NULL,
        CheckOutTime  TIME             NOT NULL,
        Address       NVARCHAR(255)    NOT NULL,
        City          NVARCHAR(100)    NOT NULL,
        District      NVARCHAR(100)    NOT NULL,
        Country       NVARCHAR(100)    NOT NULL,
        Latitude      DECIMAL(10, 8)   NULL,
        Longitude     DECIMAL(11, 8)   NULL,
        Description   NVARCHAR(MAX)    NULL,
        Policy        NVARCHAR(MAX)    NULL,
        CreatedAt     DATETIME         NOT NULL DEFAULT GETDATE(),

        CONSTRAINT PK_Hotels         PRIMARY KEY (HotelID),
        CONSTRAINT CHK_Hotels_Star   CHECK (StarRating BETWEEN 1 AND 5)
    );
    PRINT N'Bảng Hotels đã được tạo.';
END
GO

-- ============================================================
--  2. BẢNG ROOM_TYPES
-- ============================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'RoomTypes')
BEGIN
    CREATE TABLE RoomTypes (
        RoomTypeID  INT              NOT NULL IDENTITY(1,1),
        HotelID     INT              NOT NULL,
        TypeName    NVARCHAR(100)    NOT NULL,
        BedType     NVARCHAR(50)     NULL,
        Area        DECIMAL(5, 2)    NULL,
        MaxGuest    INT              NOT NULL,
        BasePrice   DECIMAL(18, 2)   NOT NULL,

        CONSTRAINT PK_RoomTypes           PRIMARY KEY (RoomTypeID),
        CONSTRAINT FK_RoomTypes_Hotels    FOREIGN KEY (HotelID)
            REFERENCES Hotels(HotelID)
            ON DELETE CASCADE
            ON UPDATE CASCADE,
        CONSTRAINT CHK_RoomTypes_Area     CHECK (Area > 0),
        CONSTRAINT CHK_RoomTypes_Price    CHECK (BasePrice > 0),
        CONSTRAINT CHK_RoomTypes_Guest    CHECK (MaxGuest > 0)
    );
    PRINT N'Bảng RoomTypes đã được tạo.';
END
GO

-- ============================================================
--  3. BẢNG ROOMS
-- ============================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Rooms')
BEGIN
    CREATE TABLE Rooms (
        RoomID          INT              NOT NULL IDENTITY(1,1),
        HotelID         INT              NOT NULL,
        RoomTypeID      INT              NOT NULL,
        RoomNumber      VARCHAR(20)      NOT NULL,
        Floor           INT              NOT NULL,
        CapacityAdult   INT              NOT NULL,
        CapacityChild   INT              NOT NULL DEFAULT 0,
        PricePerNight   DECIMAL(18, 2)   NOT NULL,
        Status          VARCHAR(20)      NOT NULL DEFAULT 'Available',
        Description     NVARCHAR(MAX)    NULL,

        CONSTRAINT PK_Rooms               PRIMARY KEY (RoomID),
        CONSTRAINT FK_Rooms_Hotels        FOREIGN KEY (HotelID)
            REFERENCES Hotels(HotelID),
        CONSTRAINT FK_Rooms_RoomTypes     FOREIGN KEY (RoomTypeID)
            REFERENCES RoomTypes(RoomTypeID),
        CONSTRAINT UQ_Rooms_HotelRoom     UNIQUE (HotelID, RoomNumber),
        CONSTRAINT CHK_Rooms_Status       CHECK (Status IN ('Available', 'Occupied', 'Maintenance')),
        CONSTRAINT CHK_Rooms_Floor        CHECK (Floor > 0),
        CONSTRAINT CHK_Rooms_Capacity     CHECK (CapacityAdult > 0),
        CONSTRAINT CHK_Rooms_Price        CHECK (PricePerNight > 0)
    );
    PRINT N'Bảng Rooms đã được tạo.';
END
GO

-- ============================================================
--  4. BẢNG CUSTOMERS
-- ============================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Customers')
BEGIN
    CREATE TABLE Customers (
        CustomerID    INT              NOT NULL IDENTITY(1,1),
        FullName      NVARCHAR(150)    NOT NULL,
        Phone         VARCHAR(20)      NOT NULL,
        Email         VARCHAR(100)     NULL,
        IDCard        VARCHAR(50)      NULL,
        PasswordHash  VARCHAR(MAX)     NOT NULL,
        PassportNo    VARCHAR(20)      NULL,
        DateOfBirth   DATE             NULL,
        Nationality   NVARCHAR(50)     NOT NULL DEFAULT N'Vietnam',
        Address       NVARCHAR(255)    NULL,
        LoyaltyPoint  INT              NOT NULL DEFAULT 0,
        CreatedAt     DATETIME         NOT NULL DEFAULT GETDATE(),

        CONSTRAINT PK_Customers          PRIMARY KEY (CustomerID),
        CONSTRAINT UQ_Customers_Phone    UNIQUE (Phone),
        CONSTRAINT UQ_Customers_Email    UNIQUE (Email),
        CONSTRAINT UQ_Customers_IDCard   UNIQUE (IDCard),
        CONSTRAINT UQ_Customers_Passport UNIQUE (PassportNo)
    );
    PRINT N'Bảng Customers đã được tạo.';
END
GO

-- ============================================================
--  5. BẢNG EMPLOYEES
-- ============================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Employees')
BEGIN
    CREATE TABLE Employees (
        EmployeeID    INT              NOT NULL IDENTITY(1,1),
        HotelID       INT              NOT NULL,
        FullName      NVARCHAR(150)    NOT NULL,
        Phone         VARCHAR(20)      NULL,
        Email         VARCHAR(100)     NULL,
        Username      VARCHAR(50)      NOT NULL,
        PasswordHash  VARCHAR(MAX)     NOT NULL,
        Role          NVARCHAR(50)     NOT NULL,
        Position      NVARCHAR(100)    NULL,
        Salary        DECIMAL(18, 2)   NULL,
        Status        NVARCHAR(50)     NOT NULL,

        CONSTRAINT PK_Employees           PRIMARY KEY (EmployeeID),
        CONSTRAINT FK_Employees_Hotels    FOREIGN KEY (HotelID)
            REFERENCES Hotels(HotelID),
        CONSTRAINT UQ_Employees_Username  UNIQUE (Username),
        CONSTRAINT CHK_Employees_Salary   CHECK (Salary > 0)
    );
    PRINT N'Bảng Employees đã được tạo.';
END
GO

-- ============================================================
--  6. BẢNG BOOKINGS
-- ============================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Bookings')
BEGIN
    CREATE TABLE Bookings (
        BookingID       INT              NOT NULL IDENTITY(1,1),
        CustomerID      INT              NOT NULL,
        HotelID         INT              NOT NULL,
        BookingCode     VARCHAR(20)      NOT NULL,
        CheckInDate     DATE             NOT NULL,
        CheckOutDate    DATE             NOT NULL,
        AdultCount      INT              NOT NULL,
        ChildCount      INT              NOT NULL DEFAULT 0,
        RoomCount       INT              NOT NULL,
        BookingStatus   VARCHAR(20)      NOT NULL DEFAULT 'Pending',
        PaymentStatus   NVARCHAR(50)     NOT NULL,
        BookingChannel  NVARCHAR(50)     NULL,
        CreatedAt       DATETIME         NOT NULL DEFAULT GETDATE(),

        CONSTRAINT PK_Bookings              PRIMARY KEY (BookingID),
        CONSTRAINT FK_Bookings_Customers    FOREIGN KEY (CustomerID)
            REFERENCES Customers(CustomerID),
        CONSTRAINT FK_Bookings_Hotels       FOREIGN KEY (HotelID)
            REFERENCES Hotels(HotelID),
        CONSTRAINT UQ_Bookings_Code         UNIQUE (BookingCode),
        CONSTRAINT CHK_Bookings_Status      CHECK (BookingStatus IN ('Pending', 'Confirmed', 'Cancelled')),
        CONSTRAINT CHK_Bookings_Dates       CHECK (CheckOutDate > CheckInDate),
        CONSTRAINT CHK_Bookings_Adult       CHECK (AdultCount > 0),
        CONSTRAINT CHK_Bookings_RoomCount   CHECK (RoomCount > 0)
    );
    PRINT N'Bảng Bookings đã được tạo.';
END
GO

-- ============================================================
--  7. BẢNG BOOKING_ROOMS
-- ============================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'BookingRooms')
BEGIN
    CREATE TABLE BookingRooms (
        BookingRoomID   INT              NOT NULL IDENTITY(1,1),
        BookingID       INT              NOT NULL,
        RoomID          INT              NOT NULL,
        NightPrice      DECIMAL(18, 2)   NOT NULL,
        Discount        DECIMAL(18, 2)   NOT NULL DEFAULT 0,
        SpecialRequest  NVARCHAR(MAX)    NULL,

        CONSTRAINT PK_BookingRooms           PRIMARY KEY (BookingRoomID),
        CONSTRAINT FK_BookingRooms_Bookings  FOREIGN KEY (BookingID)
            REFERENCES Bookings(BookingID),
        CONSTRAINT FK_BookingRooms_Rooms     FOREIGN KEY (RoomID)
            REFERENCES Rooms(RoomID),
        CONSTRAINT CHK_BookingRooms_Price    CHECK (NightPrice > 0)
    );
    PRINT N'Bảng BookingRooms đã được tạo.';
END
GO

-- ============================================================
--  8. BẢNG STAYS (Chi tiết lưu trú)
-- ============================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Stays')
BEGIN
    CREATE TABLE Stays (
        StayID               INT              NOT NULL IDENTITY(1,1),
        BookingID            INT              NOT NULL,
        RoomID               INT              NOT NULL,
        ActualCheckIn        DATETIME         NULL,
        ActualCheckOut       DATETIME         NULL,
        DepositAmount        DECIMAL(18, 2)   NOT NULL DEFAULT 0,
        RepresentativeName   NVARCHAR(150)    NOT NULL,
        OrganizationName     NVARCHAR(200)    NULL,

        CONSTRAINT PK_Stays              PRIMARY KEY (StayID),
        CONSTRAINT FK_Stays_Bookings     FOREIGN KEY (BookingID)
            REFERENCES Bookings(BookingID),
        CONSTRAINT FK_Stays_Rooms        FOREIGN KEY (RoomID)
            REFERENCES Rooms(RoomID)
    );
    PRINT N'Bảng Stays đã được tạo.';
END
GO

-- ============================================================
--  9. BẢNG SERVICES
-- ============================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Services')
BEGIN
    CREATE TABLE Services (
        ServiceID    INT              NOT NULL IDENTITY(1,1),
        HotelID      INT              NOT NULL,
        ServiceName  NVARCHAR(150)    NOT NULL,
        ServiceType  NVARCHAR(100)    NULL,
        UnitPrice    DECIMAL(18, 2)   NOT NULL,
        Description  NVARCHAR(MAX)    NULL,
        Status       NVARCHAR(50)     NOT NULL,

        CONSTRAINT PK_Services           PRIMARY KEY (ServiceID),
        CONSTRAINT FK_Services_Hotels    FOREIGN KEY (HotelID)
            REFERENCES Hotels(HotelID),
        CONSTRAINT CHK_Services_Price    CHECK (UnitPrice > 0)
    );
    PRINT N'Bảng Services đã được tạo.';
END
GO

-- ============================================================
--  10. BẢNG SERVICE_USAGE
-- ============================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ServiceUsage')
BEGIN
    CREATE TABLE ServiceUsage (
        UsageID    INT              NOT NULL IDENTITY(1,1),
        StayID     INT              NOT NULL,
        ServiceID  INT              NOT NULL,
        Quantity   INT              NOT NULL,
        UsageTime  DATETIME         NOT NULL DEFAULT GETDATE(),
        Amount     DECIMAL(18, 2)   NOT NULL,
        Note       NVARCHAR(255)    NULL,

        CONSTRAINT PK_ServiceUsage           PRIMARY KEY (UsageID),
        CONSTRAINT FK_ServiceUsage_Stays     FOREIGN KEY (StayID)
            REFERENCES Stays(StayID),
        CONSTRAINT FK_ServiceUsage_Services  FOREIGN KEY (ServiceID)
            REFERENCES Services(ServiceID),
        CONSTRAINT CHK_ServiceUsage_Qty      CHECK (Quantity > 0)
    );
    PRINT N'Bảng ServiceUsage đã được tạo.';
END
GO

-- ============================================================
--  11. BẢNG PAYMENTS
-- ============================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Payments')
BEGIN
    CREATE TABLE Payments (
        PaymentID        INT              NOT NULL IDENTITY(1,1),
        BookingID        INT              NOT NULL,
        Amount           DECIMAL(18, 2)   NOT NULL,
        VATAmount        DECIMAL(18, 2)   NOT NULL DEFAULT 0,
        DiscountAmount   DECIMAL(18, 2)   NOT NULL DEFAULT 0,
        FinalAmount      DECIMAL(18, 2)   NOT NULL,
        PaymentMethod    VARCHAR(50)      NOT NULL,
        PaymentTime      DATETIME         NOT NULL DEFAULT GETDATE(),
        PaymentStatus    NVARCHAR(50)     NOT NULL,
        TransactionCode  VARCHAR(100)     NULL,

        CONSTRAINT PK_Payments              PRIMARY KEY (PaymentID),
        CONSTRAINT FK_Payments_Bookings     FOREIGN KEY (BookingID)
            REFERENCES Bookings(BookingID),
        CONSTRAINT UQ_Payments_TxCode       UNIQUE (TransactionCode),
        CONSTRAINT CHK_Payments_Amount      CHECK (Amount >= 0),
        CONSTRAINT CHK_Payments_Final       CHECK (FinalAmount > 0),
        CONSTRAINT CHK_Payments_Method      CHECK (PaymentMethod IN ('Cash', 'Credit Card', 'Transfer'))
    );
    PRINT N'Bảng Payments đã được tạo.';
END
GO

-- ============================================================
--  12. BẢNG REVIEWS
-- ============================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Reviews')
BEGIN
    CREATE TABLE Reviews (
        ReviewID     INT              NOT NULL IDENTITY(1,1),
        CustomerID   INT              NOT NULL,
        HotelID      INT              NOT NULL,
        BookingID    INT              NOT NULL,
        RatingScore  INT              NOT NULL,
        Comment      NVARCHAR(MAX)    NULL,
        CreatedAt    DATETIME         NOT NULL DEFAULT GETDATE(),

        CONSTRAINT PK_Reviews              PRIMARY KEY (ReviewID),
        CONSTRAINT FK_Reviews_Customers    FOREIGN KEY (CustomerID)
            REFERENCES Customers(CustomerID),
        CONSTRAINT FK_Reviews_Hotels       FOREIGN KEY (HotelID)
            REFERENCES Hotels(HotelID),
        CONSTRAINT FK_Reviews_Bookings     FOREIGN KEY (BookingID)
            REFERENCES Bookings(BookingID),
        CONSTRAINT CHK_Reviews_Score       CHECK (RatingScore BETWEEN 1 AND 5)
    );
    PRINT N'Bảng Reviews đã được tạo.';
END
GO

-- ============================================================
--  13. BẢNG FAVORITE_HOTELS
-- ============================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'FavoriteHotels')
BEGIN
    CREATE TABLE FavoriteHotels (
        FavoriteID   INT       NOT NULL IDENTITY(1,1),
        CustomerID   INT       NOT NULL,
        HotelID      INT       NOT NULL,
        CreatedAt    DATETIME  NOT NULL DEFAULT GETDATE(),

        CONSTRAINT PK_FavoriteHotels              PRIMARY KEY (FavoriteID),
        CONSTRAINT FK_FavoriteHotels_Customers    FOREIGN KEY (CustomerID)
            REFERENCES Customers(CustomerID),
        CONSTRAINT FK_FavoriteHotels_Hotels       FOREIGN KEY (HotelID)
            REFERENCES Hotels(HotelID),
        CONSTRAINT UQ_FavoriteHotels_Pair         UNIQUE (CustomerID, HotelID)
    );
    PRINT N'Bảng FavoriteHotels đã được tạo.';
END
GO

-- ============================================================
--  XÁC NHẬN HOÀN TẤT
-- ============================================================
PRINT N'';
PRINT N'==================================================';
PRINT N' Tất cả bảng đã được tạo thành công!';
PRINT N' Database: HotelManagementDB';
PRINT N' Tổng số bảng: 13';
PRINT N'==================================================';
GO