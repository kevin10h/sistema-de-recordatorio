# main.py
import os
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt
from models import Base, User
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
JWT_SECRET = os.getenv("JWT_SECRET", "secret")
JWT_ALGO = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_HOURS = int(os.getenv("ACCESS_TOKEN_EXPIRE_HOURS", "8"))

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

# crear tablas si no existen
Base.metadata.create_all(bind=engine)

pwd_ctx = CryptContext(schemes=["argon2"], deprecated="auto")


# ⚡️ SOLO UNA APP
app = FastAPI(title="auth-service")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # o ["*"] si quieres permitir todo
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- MODELOS ----------

class RegisterIn(BaseModel):
    email: EmailStr
    password: str
    name: str | None = None

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"

# ---------- UTILS ----------

def create_access_token(sub: str):
    expire = datetime.utcnow() + timedelta(hours=ACCESS_HOURS)
    to_encode = {"sub": sub, "exp": expire.isoformat()}
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGO)

# ---------- ENDPOINTS ----------

@app.post("/register", status_code=201)
def register(payload: RegisterIn):
    db = SessionLocal()
    try:
        exists = db.query(User).filter(User.email == payload.email).first()
        if exists:
            raise HTTPException(status_code=400, detail="El email ya está registrado")
        user = User(
            email=payload.email,
            password_hash=pwd_ctx.hash(payload.password),
            name=payload.name
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return {"id": str(user.id), "email": user.email, "name": user.name}
    finally:
        db.close()

@app.post("/login")
def login(payload: RegisterIn):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == payload.email).first()
        if not user or not pwd_ctx.verify(payload.password, user.password_hash):
            raise HTTPException(status_code=401, detail="Credenciales inválidas")
        
        token = create_access_token(str(user.id))
        
        # 👇 Devolvemos también el user_id
        return {
            "access_token": token,
            "token_type": "bearer",
            "user_id": str(user.id)
        }
    finally:
        db.close()
        
@app.get("/users/{user_id}")
def get_user(user_id: str):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        return {"id": str(user.id), "email": user.email, "name": user.name}
    finally:
        db.close()


        