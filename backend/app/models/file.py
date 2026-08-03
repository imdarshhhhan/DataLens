from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from app.database import Base
import uuid

class File(Base):
    __tablename__ = "files"

    id          = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id     = Column(String, ForeignKey("users.id", ondelete="CASCADE"))
    filename    = Column(String, nullable=False)
    file_type   = Column(String, nullable=False)   
    row_count   = Column(Integer, default=0)
    col_count   = Column(Integer, default=0)
    schema_json = Column(Text, nullable=True)      
    duckdb_path = Column(String, nullable=True)     
    uploaded_at = Column(DateTime, default=func.now())