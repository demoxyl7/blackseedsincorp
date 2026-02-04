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
from jose import jwt, JWTError 

# Local imports
from database import engine, get_db
import models, schemas
from models import User

load_dotenv()

# --- 1. CONFIGURATION ---
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-very-secret-key-change-this")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

# Initialize Database
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Parking Management API")

# --- NEW: HEALTH CHECK ROUTE ---
# This prevents the 404 error when visiting the base URL
@app.get("/")
def home():
    return {
        "status": "online",
        "message": "Parking Management API is running",
        "documentation": "/docs"
    }

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

# Your login and auth endpoints would follow below...