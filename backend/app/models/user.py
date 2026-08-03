from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.sql import func
from app.database import Base
import uuid

class User(Base):
    __tablename__ = "users"

    id            = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email         = Column(String, unique=True, nullable=True)   # nullable for guests
    username      = Column(String, nullable=True)
    password_hash = Column(String, nullable=True)                # nullable for guests
    is_guest      = Column(Boolean, default=False)
    expires_at    = Column(DateTime, nullable=True)              # only set for guests
    created_at    = Column(DateTime, default=func.now())