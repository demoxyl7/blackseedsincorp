from pydantic import BaseModel
from typing import List, Optional
from datetime import date, time, datetime
from uuid import UUID

class BookingCreate(BaseModel):
    vehicle_type: str
    license_plate: str
    is_electric: bool
    # CHANGE: Accept 'str' instead of 'UUID' so "A1" is allowed
    spot_id: str  
    booking_date: date
    start_time: time
    duration_hours: int
    # CHANGE: Accept list of strings so "car-wash-premium" is allowed
    addon_ids: List[str] = [] 
    customer_email: str
    customer_phone: str = ""
    
class SpotResponse(BaseModel):
    id: UUID
    spot_number: str
    floor: int
    is_available: bool
    has_ev_charger: bool
    type: str

class AddonResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str]
    price: float
    icon: Optional[str]
    duration_minutes: Optional[int]

class BookingResponse(BaseModel):
    id: UUID
    booking_ref: str
    vehicle_type: str
    license_plate: str
    total_price: float
    status: str
    start_time: time
    end_time: time
    spot: Optional[SpotResponse]
    addons: List[AddonResponse] = []
    
    class Config:
        from_attributes = True

class PricingResponse(BaseModel):
    hourly_rate: float
    suv_surcharge: float
    ev_charging_per_hour: float
    car_wash_basic: float
    car_wash_premium: float