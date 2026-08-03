from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta
from app.database import get_db
from app.models.user import User
from app.services.auth_utils import (
    hash_password, verify_password,
    create_token, get_current_user
)
import os
import uuid

router = APIRouter()

GUEST_DAYS = int(os.getenv("GUEST_SESSION_DAYS", 7))

class SignupRequest(BaseModel):
    email: EmailStr
    username: str
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

# Signup  
@router.post("/signup")
def signup(body: SignupRequest, db: Session = Depends(get_db)):
    # Check if email already exists
    existing = db.query(User).filter(User.email == body.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        id            = str(uuid.uuid4()),
        email         = body.email,
        username      = body.username,
        password_hash = hash_password(body.password),
        is_guest      = False,
        expires_at    = None
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_token({"sub": user.id})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id":       user.id,
            "email":    user.email,
            "username": user.username,
            "is_guest": user.is_guest
        }
    }

#Login  ─
@router.post("/login")
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()

    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_token({"sub": user.id})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id":       user.id,
            "email":    user.email,
            "username": user.username,
            "is_guest": user.is_guest
        }
    }

#Guest login 
@router.post("/guest")
def guest_login(db: Session = Depends(get_db)):
    guest_id = str(uuid.uuid4())

    user = User(
        id         = guest_id,
        email      = None,
        username   = f"Guest_{guest_id[:6]}",
        is_guest   = True,
        expires_at = datetime.utcnow() + timedelta(days=GUEST_DAYS)
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_token({"sub": user.id})
    return {
        "access_token": token,
        "token_type":   "bearer",
        "user": {
            "id":         user.id,
            "username":   user.username,
            "is_guest":   user.is_guest,
            "expires_at": user.expires_at.isoformat()
        }
    }

# Get current user 
@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id":         current_user.id,
        "email":      current_user.email,
        "username":   current_user.username,
        "is_guest":   current_user.is_guest,
        "expires_at": current_user.expires_at.isoformat() if current_user.expires_at else None,
        "created_at": current_user.created_at.isoformat()
    }

from pydantic import BaseModel as PydanticBaseModel

class ProfileUpdate(PydanticBaseModel):
    username: str

class PasswordUpdate(PydanticBaseModel):
    old_password: str
    new_password: str

@router.patch("/profile")
def update_profile(
    body: ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    current_user.username = body.username
    db.commit()
    return { "message": "Profile updated", "username": current_user.username }

@router.patch("/password")
def update_password(
    body: PasswordUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not verify_password(body.old_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect current password")
    
    current_user.password_hash = hash_password(body.new_password)
    db.commit()
    return { "message": "Password updated successfully" }