from fastapi import FastAPI, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, date, time
from typing import List, Dict, Optional
import json
import uuid
import os
from dotenv import load_dotenv
from passlib.context import CryptContext
from jose import jwt, JWTError # Correct library for FastAPI

# Local imports
from database import engine, get_db
import models, schemas
from models import User

load_dotenv()

# --- 1. CONFIGURATION ---
# Use one source of truth for your security settings
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-very-secret-key-change-this")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

# Initialize Database
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Parking Management API")

# --- 2. CORS CONFIGURATION ---
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:8081",
    "http://127.0.0.1:8081",
    "https://blackseedsincorp.onrender.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 3. HELPER FUNCTIONS ---
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# --- 4. CHAT MANAGER ---
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.admin_connection: Optional[WebSocket] = None

    async def connect(self, websocket: WebSocket, client_id: str):
        await websocket.accept()
        self.active_connections[client_id] = websocket

    async def connect_admin(self, websocket: WebSocket):
        await websocket.accept()
        self.admin_connection = websocket

    def disconnect(self, client_id: str):
        if client_id in self.active_connections:
            del self.active_connections[client_id]

    def disconnect_admin(self):
        self.admin_connection = None

    async def broadcast_to_admin(self, message: dict):
        if self.admin_connection:
            try:
                await self.admin_connection.send_json(message)
            except:
                self.admin_connection = None

    async def broadcast_to_client(self, client_id: str, message: dict):
        if client_id in self.active_connections:
            try:
                await self.active_connections[client_id].send_json(message)
            except:
                del self.active_connections[client_id]

manager = ConnectionManager()

# --- 5. AUTH & LOGIN ---
@app.post("/api/v1/auth/login")
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(), 
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == form_data.username).first()
    
    if not user or not pwd_context.verify(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    
    access_token = create_access_token(data={"sub": user.email})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "email": user.email, 
            "is_admin": user.is_admin,
            "name": getattr(user, 'name', 'Admin') # Fallback if name field is missing
        }
    }

# --- 6. WEBSOCKET CHAT ROUTES ---
@app.websocket("/ws/chat/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    await manager.connect(websocket, session_id)
    try:
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            await manager.broadcast_to_admin({
                "type": "message",
                "sessionId": session_id,
                "text": message_data.get("text"),
                "sender": "customer",
                "timestamp": datetime.now().isoformat()
            })
    except WebSocketDisconnect:
        manager.disconnect(session_id)

@app.websocket("/ws/admin")
async def admin_websocket_endpoint(websocket: WebSocket):
    await manager.connect_admin(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            if message_data.get("type") == "reply":
                target_sid = message_data.get("sessionId")
                await manager.broadcast_to_client(target_sid, {
                    "type": "message",
                    "text": message_data.get("text"),
                    "sender": "admin",
                    "timestamp": datetime.now().isoformat()
                })
    except WebSocketDisconnect:
        manager.disconnect_admin()

# (Include your other endpoints like /spots/available here...)