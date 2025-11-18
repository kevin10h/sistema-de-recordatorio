# models.py
from sqlalchemy import Column, String, DateTime, Boolean, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
import uuid

Base = declarative_base()
def gen_uuid():
    return str(uuid.uuid4())

class Reminder(Base):
    __tablename__ = "reminders"
    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    user_id = Column(UUID(as_uuid=False), nullable=False)
    medication_id = Column(UUID(as_uuid=False), nullable=False)
    schedule = Column(Text, nullable=False)  # JSON string
    start_date = Column(DateTime, default=datetime.utcnow)
    timezone = Column(String(100), default="America/Lima")
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
