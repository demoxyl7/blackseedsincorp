from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from models import User, Base, SessionLocal, engine
import os
from dotenv import load_dotenv
from sqlalchemy import func, desc
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
import uuid
import datetime

from database import engine, get_db, Base
import models, schemas

load_dotenv() # Load env vars
# Initialize Database Tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Parking Management API")

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 1. SEED DATA (Now includes B3, B4, B5) ---
@app.on_event("startup")
def startup_event():
    db = next(get_db())
    
    # 1. SMART SPOT GENERATOR (Creates A1-A10, B1-B10... up to E10)
    if not db.query(models.ParkingSpot).first():
        spots = []
        rows = ['A', 'B', 'C', 'D', 'E'] # Add 'F', 'G' if you need more floors
        
        for row in rows:
            for num in range(1, 11): # Creates spots 1 through 10
                spot_name = f"{row}{num}"
                
                # Logic to decide spot type (Optional: Customize as needed)
                is_ev = (row == 'A' and num in [3, 4]) # Make A3 and A4 Electric
                spot_type = "ev" if is_ev else "standard"
                
                spots.append(models.ParkingSpot(
                    spot_number=spot_name,
                    floor=1,
                    type=spot_type,
                    has_ev_charger=is_ev
                ))
        
        db.add_all(spots)
        db.commit()
        print(f"✅ Successfully created {len(spots)} parking spots (A1 - E10)!")

    # 2. Check & Add Pricing (Same as before)
    if not db.query(models.PricingConfig).first():
        pricing = models.PricingConfig(
            hourly_rate=500.0,
            suv_surcharge=200.0,
            ev_charging_per_hour=800.0,
            car_wash_basic=1500.0,
            car_wash_premium=4500.0
        )
        db.add(pricing)
        db.commit()

    # 3. Check & Add Addons (Same as before)
    if not db.query(models.AddonService).first():
        addons = [
            models.AddonService(name="Basic Car Wash", price=1500.00, duration_minutes=30),
            models.AddonService(name="EV Charging", price=800.00, icon="zap"),
            models.AddonService(name="Premium Detailing", price=4500.00, duration_minutes=60)
        ]
        db.add_all(addons)
        db.commit()

# --- 2. CORE ENDPOINTS ---

@app.get("/api/v1/spots", response_model=List[schemas.SpotResponse])
def get_spots(db: Session = Depends(get_db)):
    return db.query(models.ParkingSpot).all()

@app.get("/api/v1/spots/available", response_model=List[schemas.SpotResponse])
def get_available_spots(
    date: Optional[datetime.date] = None,
    start_time: Optional[datetime.time] = None,
    duration_hours: Optional[int] = None,
    is_electric: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.ParkingSpot)
    if is_electric is not None:
        query = query.filter(models.ParkingSpot.has_ev_charger == is_electric)
    return query.all()

@app.get("/api/v1/addons", response_model=List[schemas.AddonResponse])
def get_addons(db: Session = Depends(get_db)):
    return db.query(models.AddonService).all()

@app.get("/api/v1/pricing", response_model=schemas.PricingResponse)
def get_pricing(db: Session = Depends(get_db)):
    pricing = db.query(models.PricingConfig).first()
    if not pricing:
        return schemas.PricingResponse(
            hourly_rate=500.0, suv_surcharge=200.0, 
            ev_charging_per_hour=800.0, car_wash_basic=1500.0, 
            car_wash_premium=4500.0
        )
    return pricing

@app.post("/api/v1/bookings", response_model=schemas.BookingResponse)
def create_booking(booking: schemas.BookingCreate, db: Session = Depends(get_db)):
    print(f"🔍 DEBUG: Processing booking for spot {booking.spot_id}")

    # 1. Handle Spot ID
    spot = db.query(models.ParkingSpot).filter(models.ParkingSpot.spot_number == booking.spot_id).first()
    
    if not spot:
        try:
            spot = db.query(models.ParkingSpot).filter(models.ParkingSpot.id == booking.spot_id).first()
        except:
            pass 
            
    if not spot:
        print(f"❌ ERROR: Spot {booking.spot_id} not found in DB")
        raise HTTPException(status_code=404, detail=f"Spot '{booking.spot_id}' not found. Please refresh page.")
    
    # 2. Handle Addons
    selected_addons = []
    if booking.addon_ids:
        slug_map = {
            "car-wash-basic": "Basic Car Wash",
            "car-wash-premium": "Premium Detailing",
            "ev-charging": "EV Charging",
            "premium-spot": "Premium Spot" # Just in case you have this
        }
        for addon_input in booking.addon_ids:
            db_name = slug_map.get(addon_input, addon_input)
            addon = db.query(models.AddonService).filter(models.AddonService.name == db_name).first()
            if addon:
                selected_addons.append(addon)

    # 3. Calculate Costs
    pricing = db.query(models.PricingConfig).first()
    if not pricing:
         pricing = models.PricingConfig() 

    base_cost = float(pricing.hourly_rate) * booking.duration_hours
    if booking.vehicle_type == 'suv':
        base_cost += float(pricing.suv_surcharge)
        
    addons_cost = 0
    for addon in selected_addons:
        addons_cost += float(addon.price)

    total_cost = base_cost + addons_cost
    
    # 4. Time Calculation
    start_dt = datetime.datetime.combine(booking.booking_date, booking.start_time)
    end_dt = start_dt + datetime.timedelta(hours=booking.duration_hours)
    
    # 5. Save Booking
    new_booking = models.Booking(
        booking_ref=f"BK-{uuid.uuid4().hex[:8].upper()}",
        vehicle_type=booking.vehicle_type,
        license_plate=booking.license_plate,
        is_electric=booking.is_electric,
        spot_id=spot.id,
        booking_date=booking.booking_date,
        start_time=booking.start_time,
        end_time=end_dt.time(),
        duration_hours=booking.duration_hours,
        base_price=base_cost,
        addons_total=addons_cost,
        total_price=total_cost,
        customer_email=booking.customer_email,
        customer_phone=booking.customer_phone,
        status="confirmed"
    )
    
    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)

    # 6. Save Addon Links
    if selected_addons:
        for addon in selected_addons:
            stmt = models.booking_addons.insert().values(
                booking_id=new_booking.id,
                addon_id=addon.id,
                price_at_booking=addon.price
            )
            db.execute(stmt)
        db.commit()
        db.refresh(new_booking)
    
    # THIS RETURN STATEMENT WAS LIKELY MISSING OR BROKEN
    return new_booking

@app.get("/api/v1/bookings", response_model=List[schemas.BookingResponse])
def get_bookings(db: Session = Depends(get_db)):
    return db.query(models.Booking).order_by(desc(models.Booking.created_at)).all()

# --- 3. DASHBOARD ENDPOINTS ---

@app.get("/api/v1/dashboard/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    total_revenue = db.query(func.sum(models.Booking.total_price)).scalar() or 0
    total_bookings = db.query(models.Booking).count()
    active_spots = db.query(models.ParkingSpot).count()
    
    utilization = 0
    if active_spots > 0:
        utilization = round((total_bookings % 10) / active_spots * 100, 1)

    return {
        "total_revenue": total_revenue,
        "total_bookings": total_bookings,
        "active_spots": active_spots,
        "utilization_rate": utilization
    }

@app.get("/api/v1/dashboard/recent-bookings")
def get_recent_bookings(limit: int = 100, db: Session = Depends(get_db)):
    bookings = db.query(models.Booking)\
        .order_by(desc(models.Booking.created_at))\
        .limit(limit)\
        .all()
    return bookings
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_default_admin():
    db = SessionLocal()
    try:
        admin_email = os.getenv("ADMIN_EMAIL", "admin@blackseeds.com")
        existing_admin = db.query(User).filter(User.email == admin_email).first()
        
        if not existing_admin:
            print(f"Creating default admin: {admin_email}")
            hashed_pw = pwd_context.hash("admin123") # Default password
            new_admin = User(email=admin_email, hashed_password=hashed_pw, is_admin=True)
            db.add(new_admin)
            db.commit()
            print("Admin created successfully!")
        else:
            print("Admin already exists.")
    except Exception as e:
        print(f"Error creating admin: {e}")
    finally:
        db.close()

# Run this just once when the file loads to ensure admin exists
# (In a real app, you might use a separate script, but this works for now)
Base.metadata.create_all(bind=engine) # Ensure tables exist
create_default_admin()    