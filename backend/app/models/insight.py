from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.sql import func
from app.database import Base
import uuid

class Insight(Base):
    __tablename__ = "insights"

    id             = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    file_id        = Column(String, ForeignKey("files.id", ondelete="CASCADE"))
    user_id        = Column(String, ForeignKey("users.id", ondelete="CASCADE"))
    insight_text   = Column(Text, nullable=False)
    followup_chips = Column(Text, nullable=True)
    chart_spec     = Column(Text, nullable=True)
    sql_used       = Column(Text, nullable=True)
    result_json    = Column(Text, nullable=True)
    is_saved       = Column(Boolean, default=False)
    created_at     = Column(DateTime, default=func.now())