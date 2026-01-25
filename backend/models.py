import uuid
from sqlalchemy import Column, String, Integer, Boolean, DECIMAL, ForeignKey, Date, Time, DateTime, func, Table
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from database import Base

# Junction Table for Booking <-> Addons
booking_addons = Table(
    'booking_addons', Base.metadata,
    Column('booking_id', UUID(as_uuid=True), ForeignKey('bookings.id', ondelete="CASCADE"), primary_key=True),
    Column('addon_id', UUID(as_uuid=True), ForeignKey('addon_services.id'), primary_key=True),
    Column('price_at_booking', DECIMAL(10, 2), nullable=False)
)

class ParkingSpot(Base):
    __tablename__ = "parking_spots"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    spot_number = Column(String, unique=True, nullable=False)
    floor = Column(Integer, nullable=False)
    is_available = Column(Boolean, default=True)
    has_ev_charger = Column(Boolean, default=False)
    type = Column(String, default='standard')
    created_at = Column(DateTime, default=func.now())

class AddonService(Base):
    __tablename__ = "addon_services"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    description = Column(String)
    price = Column(DECIMAL(10, 2), nullable=False)
    icon = Column(String)
    duration_minutes = Column(Integer)
    is_active = Column(Boolean, default=True)

class Booking(Base):
    __tablename__ = "bookings"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    booking_ref = Column(String, unique=True, nullable=False)
    vehicle_type = Column(String, nullable=False)
    license_plate = Column(String, nullable=False)
    is_electric = Column(Boolean, default=False)
    
    spot_id = Column(UUID(as_uuid=True), ForeignKey('parking_spots.id'))
    spot = relationship("ParkingSpot")
    
    booking_date = Column(Date, nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    duration_hours = Column(Integer, nullable=False)
    
    base_price = Column(DECIMAL(10, 2), nullable=False)
    addons_total = Column(DECIMAL(10, 2), default=0)
    total_price = Column(DECIMAL(10, 2), nullable=False)
    
    status = Column(String, default='pending')
    customer_email = Column(String)
    customer_phone = Column(String)
    
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    addons = relationship("AddonService", secondary=booking_addons, backref="bookings")

class PricingConfig(Base):
    __tablename__ = "pricing_config"
    
    id = Column(Integer, primary_key=True, default=1)
    hourly_rate = Column(DECIMAL(10, 2), default=500.00)
    suv_surcharge = Column(DECIMAL(10, 2), default=200.00)
    ev_charging_per_hour = Column(DECIMAL(10, 2), default=800.00)
    car_wash_basic = Column(DECIMAL(10, 2), default=1500.00)
    car_wash_premium = Column(DECIMAL(10, 2), default=4500.00)
    updated_at = Column(DateTime, default=func.now())