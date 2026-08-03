from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from app.database import Base
import uuid

class Query(Base):
    __tablename__ = "queries"

    id             = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id        = Column(String, ForeignKey("users.id", ondelete="CASCADE"))
    file_id        = Column(String, ForeignKey("files.id", ondelete="CASCADE"))
    query_text     = Column(Text, nullable=False)
    query_type     = Column(String, default="nl")
    sql_generated  = Column(Text, nullable=True)
    result_json    = Column(Text, nullable=True)
    chart_spec     = Column(Text, nullable=True)
    created_at     = Column(DateTime, default=func.now())