from sqlalchemy import Column, String, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
import uuid

Base = declarative_base()

def gen_uuid():
    return str(uuid.uuid4())  # Devolver UUID como cadena

class Medication(Base):
    __tablename__ = "medications"
    id = Column(String, primary_key=True, default=gen_uuid)  # Almacenar UUID como String
    user_id = Column(String(36), nullable=False)  # Mantener user_id como String, no UUID
    name = Column(String(200), nullable=False)
    dose = Column(String(100), nullable=True)
    instructions = Column(Text, nullable=True)
    frequency = Column(String(100)) 
    created_at = Column(DateTime, default=datetime.utcnow)
