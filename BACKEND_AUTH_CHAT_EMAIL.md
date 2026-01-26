# Backend API Documentation - Authentication, Chat & Email

This document extends the existing API documentation with endpoints for:
1. **Admin Authentication** - JWT-based login for admin users
2. **Real-time Chat** - WebSocket-based customer-admin messaging
3. **Email Notifications** - Resend integration for admin alerts

---

## Database Schema Additions

Add these tables to your PostgreSQL database:

```sql
-- Admin Users Table
CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Chat Sessions Table
CREATE TABLE chat_sessions (
    id VARCHAR(100) PRIMARY KEY,
    customer_email VARCHAR(255),
    customer_name VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'closed'
    created_at TIMESTAMP DEFAULT NOW(),
    last_message_at TIMESTAMP DEFAULT NOW()
);

-- Chat Messages Table
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(100) REFERENCES chat_sessions(id) ON DELETE CASCADE,
    sender_type VARCHAR(20) NOT NULL, -- 'customer', 'admin'
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create default admin user (password: admin123 - CHANGE IN PRODUCTION!)
INSERT INTO admin_users (email, password_hash, name) VALUES (
    'admin@blackseeds.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4H5VUqq6nE5mP5Ey', -- bcrypt hash of 'admin123'
    'Admin'
);
```

---

## 1. Authentication Endpoints

### POST /api/v1/auth/login
Authenticate admin user and receive JWT token.

**Request:**
```json
{
    "email": "admin@blackseeds.com",
    "password": "admin123"
}
```

**Response (200):**
```json
{
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "admin": {
        "id": "uuid-here",
        "email": "admin@blackseeds.com",
        "name": "Admin"
    }
}
```

**Response (401):**
```json
{
    "detail": "Invalid credentials"
}
```

### GET /api/v1/auth/me
Get current admin user info (requires Authorization header).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
    "id": "uuid-here",
    "email": "admin@blackseeds.com",
    "name": "Admin"
}
```

---

## 2. WebSocket Chat Endpoints

### WS /ws/chat/{session_id}
Customer chat WebSocket connection.

**Client → Server Messages:**
```json
{
    "type": "message",
    "message": "Hello, I need help with booking",
    "sender_type": "customer",
    "customer_email": "customer@email.com",
    "customer_name": "John Doe"
}
```

**Server → Client Messages:**
```json
// Chat history on connect
{
    "type": "history",
    "messages": [...]
}

// New message received
{
    "type": "message",
    "message": {
        "id": "uuid",
        "session_id": "session_123",
        "sender_type": "admin",
        "message": "Hello! How can I help?",
        "created_at": "2024-01-15T10:30:00Z",
        "is_read": false
    }
}
```

### WS /ws/admin/chat?token={jwt_token}
Admin chat WebSocket connection (requires JWT token in query).

**Client → Server Messages:**
```json
// Get all active sessions
{
    "type": "get_sessions"
}

// Get messages for a session
{
    "type": "get_messages",
    "session_id": "session_123"
}

// Send message to customer
{
    "type": "message",
    "session_id": "session_123",
    "message": "Hello! How can I help?",
    "sender_type": "admin"
}

// Mark session as read
{
    "type": "mark_read",
    "session_id": "session_123"
}
```

**Server → Client Messages:**
```json
// All active sessions
{
    "type": "sessions",
    "sessions": [
        {
            "id": "session_123",
            "customer_email": "customer@email.com",
            "customer_name": "John Doe",
            "status": "active",
            "created_at": "2024-01-15T10:00:00Z",
            "last_message_at": "2024-01-15T10:30:00Z",
            "unread_count": 3
        }
    ]
}

// New session started
{
    "type": "new_session",
    "session": {...}
}

// Session messages
{
    "type": "session_messages",
    "messages": [...]
}

// New message in any session
{
    "type": "new_message",
    "message": {...}
}
```

---

## 3. Email Notification Endpoints

### POST /api/v1/notifications/new-booking
Send email notification to admin when new booking is created.
(Called internally when a booking is created)

**Request:**
```json
{
    "booking_ref": "BK-ABC123",
    "customer_email": "customer@email.com",
    "customer_phone": "+234...",
    "vehicle_type": "suv",
    "license_plate": "ABC123XY",
    "spot_number": "A1",
    "booking_date": "2024-01-20",
    "start_time": "09:00",
    "duration_hours": 3,
    "total_price": 4500
}
```

### POST /api/v1/notifications/new-chat
Send email notification to admin when customer starts a new chat.
(Called internally when a new chat session is created)

**Request:**
```json
{
    "session_id": "session_123",
    "customer_name": "John Doe",
    "customer_email": "john@email.com",
    "first_message": "Hello, I need help..."
}
```

---

## FastAPI Implementation Example

### main.py additions:

```python
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
import resend
import os

# JWT Configuration
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

# Resend Configuration
resend.api_key = os.getenv("RESEND_API_KEY")
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@blackseeds.com")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")

# WebSocket connection managers
class CustomerConnectionManager:
    def __init__(self):
        self.active_connections: dict[str, WebSocket] = {}
    
    async def connect(self, session_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[session_id] = websocket
    
    def disconnect(self, session_id: str):
        if session_id in self.active_connections:
            del self.active_connections[session_id]
    
    async def send_to_session(self, session_id: str, message: dict):
        if session_id in self.active_connections:
            await self.active_connections[session_id].send_json(message)

class AdminConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
    
    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
    
    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            await connection.send_json(message)

customer_manager = CustomerConnectionManager()
admin_manager = AdminConnectionManager()

# Authentication endpoints
@app.post("/api/v1/auth/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    admin = db.query(AdminUser).filter(AdminUser.email == form_data.username).first()
    if not admin or not pwd_context.verify(form_data.password, admin.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token_data = {"sub": str(admin.id), "email": admin.email}
    token = jwt.encode(
        {**token_data, "exp": datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)},
        SECRET_KEY, algorithm=ALGORITHM
    )
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "admin": {"id": str(admin.id), "email": admin.email, "name": admin.name}
    }

@app.get("/api/v1/auth/me")
async def get_current_admin(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        admin_id = payload.get("sub")
        admin = db.query(AdminUser).filter(AdminUser.id == admin_id).first()
        if admin is None:
            raise HTTPException(status_code=401, detail="Admin not found")
        return {"id": str(admin.id), "email": admin.email, "name": admin.name}
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# WebSocket endpoints
@app.websocket("/ws/chat/{session_id}")
async def customer_chat(websocket: WebSocket, session_id: str, db: Session = Depends(get_db)):
    await customer_manager.connect(session_id, websocket)
    
    # Get or create session
    session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
    if not session:
        session = ChatSession(id=session_id)
        db.add(session)
        db.commit()
        # Notify admins of new session
        await admin_manager.broadcast({"type": "new_session", "session": session_to_dict(session)})
    
    # Send chat history
    messages = db.query(ChatMessage).filter(ChatMessage.session_id == session_id).all()
    await websocket.send_json({"type": "history", "messages": [msg_to_dict(m) for m in messages]})
    
    try:
        while True:
            data = await websocket.receive_json()
            if data["type"] == "message":
                # Update session info
                session.customer_email = data.get("customer_email", session.customer_email)
                session.customer_name = data.get("customer_name", session.customer_name)
                session.last_message_at = datetime.utcnow()
                
                # Save message
                msg = ChatMessage(
                    session_id=session_id,
                    sender_type="customer",
                    message=data["message"]
                )
                db.add(msg)
                db.commit()
                
                # Notify admin
                await admin_manager.broadcast({
                    "type": "new_message",
                    "message": msg_to_dict(msg)
                })
                
                # Send email notification for first message
                if len(messages) == 0:
                    send_new_chat_notification(session, data["message"])
                
    except WebSocketDisconnect:
        customer_manager.disconnect(session_id)

@app.websocket("/ws/admin/chat")
async def admin_chat(websocket: WebSocket, token: str, db: Session = Depends(get_db)):
    # Validate token
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        await websocket.close(code=1008)
        return
    
    await admin_manager.connect(websocket)
    
    # Send all active sessions
    sessions = db.query(ChatSession).filter(ChatSession.status == "active").all()
    await websocket.send_json({
        "type": "sessions",
        "sessions": [session_to_dict_with_unread(s, db) for s in sessions]
    })
    
    try:
        while True:
            data = await websocket.receive_json()
            
            if data["type"] == "get_messages":
                messages = db.query(ChatMessage).filter(
                    ChatMessage.session_id == data["session_id"]
                ).order_by(ChatMessage.created_at).all()
                await websocket.send_json({
                    "type": "session_messages",
                    "messages": [msg_to_dict(m) for m in messages]
                })
            
            elif data["type"] == "message":
                msg = ChatMessage(
                    session_id=data["session_id"],
                    sender_type="admin",
                    message=data["message"]
                )
                db.add(msg)
                db.commit()
                
                # Send to customer
                await customer_manager.send_to_session(data["session_id"], {
                    "type": "message",
                    "message": msg_to_dict(msg)
                })
            
            elif data["type"] == "mark_read":
                db.query(ChatMessage).filter(
                    ChatMessage.session_id == data["session_id"],
                    ChatMessage.sender_type == "customer"
                ).update({"is_read": True})
                db.commit()
                
    except WebSocketDisconnect:
        admin_manager.disconnect(websocket)

# Email notification function
def send_new_booking_notification(booking_data: dict):
    try:
        resend.Emails.send({
            "from": "Blackseeds Parking <noreply@yourdomain.com>",
            "to": [ADMIN_EMAIL],
            "subject": f"New Booking: {booking_data['booking_ref']}",
            "html": f"""
                <h1>New Parking Booking</h1>
                <p><strong>Reference:</strong> {booking_data['booking_ref']}</p>
                <p><strong>Customer:</strong> {booking_data['customer_email']}</p>
                <p><strong>Vehicle:</strong> {booking_data['vehicle_type'].upper()} - {booking_data['license_plate']}</p>
                <p><strong>Spot:</strong> {booking_data['spot_number']}</p>
                <p><strong>Date:</strong> {booking_data['booking_date']} at {booking_data['start_time']}</p>
                <p><strong>Duration:</strong> {booking_data['duration_hours']} hours</p>
                <p><strong>Total:</strong> ₦{booking_data['total_price']:,.0f}</p>
            """
        })
    except Exception as e:
        print(f"Failed to send booking notification: {e}")

def send_new_chat_notification(session, first_message: str):
    try:
        resend.Emails.send({
            "from": "Blackseeds Parking <noreply@yourdomain.com>",
            "to": [ADMIN_EMAIL],
            "subject": f"New Chat: {session.customer_name or 'Customer'}",
            "html": f"""
                <h1>New Customer Chat</h1>
                <p><strong>Customer:</strong> {session.customer_name or 'Anonymous'}</p>
                <p><strong>Email:</strong> {session.customer_email or 'Not provided'}</p>
                <p><strong>Message:</strong> {first_message}</p>
                <p><a href="http://localhost:5173/admin">Open Admin Dashboard</a></p>
            """
        })
    except Exception as e:
        print(f"Failed to send chat notification: {e}")
```

---

## Required Python Dependencies

Add to `requirements.txt`:
```
python-jose[cryptography]
passlib[bcrypt]
resend
```

## Environment Variables

```bash
# JWT Configuration
JWT_SECRET_KEY=your-super-secret-key-change-in-production

# Resend Email API
RESEND_API_KEY=re_your_api_key_here

# Admin email to receive notifications
ADMIN_EMAIL=admin@blackseeds.com
```

---

## Resend Setup Instructions

1. Go to https://resend.com and create an account
2. Verify your email domain at https://resend.com/domains
3. Create an API key at https://resend.com/api-keys
4. Add the API key to your environment variables

---

## Testing

**Test Login:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -d "username=admin@blackseeds.com&password=admin123"
```

**Test WebSocket Chat (using wscat):**
```bash
# Customer
wscat -c ws://localhost:8000/ws/chat/test_session_1

# Admin (after getting token)
wscat -c "ws://localhost:8000/ws/admin/chat?token=YOUR_JWT_TOKEN"
```
