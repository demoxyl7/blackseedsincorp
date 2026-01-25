# FastAPI Backend - API Documentation

This document describes all API endpoints that the frontend expects. Implement these in your FastAPI backend.

## Base Configuration

```python
# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Parking Management API", version="1.0.0")

# CORS Configuration - Allow Lovable frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://blackseedsincorp.lovable.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# All routes should be prefixed with /api/v1
```

## Environment Variables

Create a `.env` file:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/parking_db
```

---

## Database Schema (PostgreSQL)

```sql
-- Parking Spots
CREATE TABLE parking_spots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    spot_number VARCHAR(10) NOT NULL UNIQUE,
    floor INTEGER NOT NULL,
    is_available BOOLEAN DEFAULT true,
    has_ev_charger BOOLEAN DEFAULT false,
    type VARCHAR(20) DEFAULT 'standard', -- 'standard' or 'ev'
    created_at TIMESTAMP DEFAULT NOW()
);

-- Add-on Services
CREATE TABLE addon_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    icon VARCHAR(50),
    duration_minutes INTEGER,
    is_active BOOLEAN DEFAULT true
);

-- Customers (optional - for contact info)
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255),
    phone VARCHAR(50),
    full_name VARCHAR(255),
    total_bookings INTEGER DEFAULT 0,
    total_spent DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Bookings
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_ref VARCHAR(20) NOT NULL UNIQUE,
    vehicle_type VARCHAR(10) NOT NULL, -- 'car' or 'suv'
    license_plate VARCHAR(20) NOT NULL,
    is_electric BOOLEAN DEFAULT false,
    spot_id UUID REFERENCES parking_spots(id),
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration_hours INTEGER NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    addons_total DECIMAL(10,2) DEFAULT 0,
    total_price DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, active, completed, cancelled
    customer_email VARCHAR(255),
    customer_phone VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Booking Add-ons (junction table)
CREATE TABLE booking_addons (
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    addon_id UUID REFERENCES addon_services(id),
    price_at_booking DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (booking_id, addon_id)
);

-- Pricing Configuration
CREATE TABLE pricing_config (
    id INTEGER PRIMARY KEY DEFAULT 1,
    hourly_rate DECIMAL(10,2) DEFAULT 500.00,
    suv_surcharge DECIMAL(10,2) DEFAULT 200.00,
    ev_charging_per_hour DECIMAL(10,2) DEFAULT 800.00,
    car_wash_basic DECIMAL(10,2) DEFAULT 1500.00,
    car_wash_premium DECIMAL(10,2) DEFAULT 4500.00,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default pricing
INSERT INTO pricing_config DEFAULT VALUES;

-- Insert sample parking spots
INSERT INTO parking_spots (spot_number, floor, has_ev_charger, type) VALUES
('A1', 1, false, 'standard'),
('A2', 1, false, 'standard'),
('A3', 1, true, 'ev'),
('A4', 1, true, 'ev'),
('B1', 1, false, 'standard'),
('B2', 1, false, 'standard'),
('C1', 2, false, 'standard'),
('C2', 2, true, 'ev');

-- Insert sample add-ons
INSERT INTO addon_services (name, description, price, icon, duration_minutes) VALUES
('Basic Car Wash', 'Exterior wash and rinse', 1500.00, 'droplet', 30),
('Premium Detailing', 'Full interior and exterior detailing', 4500.00, 'sparkles', 120),
('EV Charging', 'Electric vehicle charging per hour', 800.00, 'zap', NULL);
```

---

## API Endpoints

### 1. Bookings

#### Create Booking
```
POST /api/v1/bookings
```

**Request Body:**
```json
{
    "vehicle_type": "car",
    "license_plate": "ABC-1234",
    "is_electric": false,
    "spot_id": "uuid-string",
    "booking_date": "2024-01-25",
    "start_time": "10:00",
    "duration_hours": 3,
    "addon_ids": ["addon-uuid-1", "addon-uuid-2"],
    "customer_email": "user@example.com",
    "customer_phone": "+234 800 000 0000"
}
```

**Response (201):**
```json
{
    "id": "uuid",
    "booking_ref": "BK20240125001",
    "vehicle_type": "car",
    "license_plate": "ABC-1234",
    "is_electric": false,
    "spot": {
        "id": "uuid",
        "spot_number": "A1",
        "floor": 1,
        "is_available": false,
        "has_ev_charger": false,
        "type": "standard"
    },
    "booking_date": "2024-01-25",
    "start_time": "10:00",
    "end_time": "13:00",
    "duration_hours": 3,
    "addons": [...],
    "base_price": 1500.00,
    "addons_total": 1500.00,
    "total_price": 3000.00,
    "status": "pending",
    "customer_email": "user@example.com",
    "created_at": "2024-01-25T09:30:00Z",
    "updated_at": "2024-01-25T09:30:00Z"
}
```

#### Get All Bookings
```
GET /api/v1/bookings?status=active&page=1&page_size=20&date_from=2024-01-01&date_to=2024-12-31
```

**Response (200):**
```json
{
    "items": [...],
    "total": 150,
    "page": 1,
    "page_size": 20,
    "total_pages": 8
}
```

#### Get Booking by ID
```
GET /api/v1/bookings/{booking_id}
```

#### Update Booking Status
```
PATCH /api/v1/bookings/{booking_id}/status
```

**Request Body:**
```json
{
    "status": "confirmed"
}
```

---

### 2. Parking Spots

#### Get All Spots
```
GET /api/v1/spots
```

**Response (200):**
```json
[
    {
        "id": "uuid",
        "spot_number": "A1",
        "floor": 1,
        "is_available": true,
        "has_ev_charger": false,
        "type": "standard"
    }
]
```

#### Get Available Spots
```
GET /api/v1/spots/available?date=2024-01-25&start_time=10:00&duration_hours=3&is_electric=false
```

Returns only spots that are free for the requested time slot.

---

### 3. Add-on Services

#### Get All Add-ons
```
GET /api/v1/addons
```

**Response (200):**
```json
[
    {
        "id": "uuid",
        "name": "Basic Car Wash",
        "description": "Exterior wash and rinse",
        "price": 1500.00,
        "icon": "droplet",
        "duration_minutes": 30
    }
]
```

---

### 4. Dashboard

#### Get Statistics
```
GET /api/v1/dashboard/stats
```

**Response (200):**
```json
{
    "total_bookings": 1234,
    "active_vehicles": 89,
    "revenue_today": 245000,
    "occupancy_rate": 78,
    "bookings_change_percent": 12,
    "vehicles_change_percent": 5,
    "revenue_change_percent": 18,
    "occupancy_change_percent": 3
}
```

#### Get Recent Bookings
```
GET /api/v1/dashboard/recent-bookings?limit=10
```

---

### 5. Customers

#### Get All Customers
```
GET /api/v1/customers?page=1&page_size=20
```

#### Get Customer by ID
```
GET /api/v1/customers/{customer_id}
```

---

### 6. Pricing

#### Get Pricing Configuration
```
GET /api/v1/pricing
```

**Response (200):**
```json
{
    "hourly_rate": 500.00,
    "suv_surcharge": 200.00,
    "ev_charging_per_hour": 800.00,
    "car_wash_basic": 1500.00,
    "car_wash_premium": 4500.00
}
```

---

## Running Locally

1. **Start PostgreSQL** in your IDE or Docker:
```bash
docker run -d --name parking-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=parking_db -p 5432:5432 postgres:15
```

2. **Create virtual environment and install deps:**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install fastapi uvicorn psycopg2-binary sqlalchemy python-dotenv
```

3. **Run the API:**
```bash
uvicorn main:app --reload --port 8000
```

4. **Frontend will connect to:** `http://localhost:8000/api/v1`

---

## Frontend Environment Variable

Create `.env.local` in your Lovable project root:
```env
VITE_API_BASE_URL=http://localhost:8000
```

The frontend will fall back to `http://localhost:8000` if this isn't set.
