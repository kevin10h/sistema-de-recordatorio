from pydantic import BaseModel
from typing import Optional
from uuid import UUID  # Asegúrate de importar UUID
from datetime import datetime

class MedicationIn(BaseModel):
    user_id: str
    name: str
    dose: Optional[str] = None
    instructions: Optional[str] = None
    frequency: Optional[str] = None

class MedicationOut(BaseModel):
    id: str  # Lo cambiamos a string
    user_id: str  # También a string
    name: str
    dose: str
    instructions: str
    frequency: Optional[str] = None
    created_at: str  # Cambiamos a string
    

    class Config:
        orm_mode = True
        json_encoders = {
            UUID: str,  # Convertir UUID a string
            datetime: lambda v: v.isoformat(),  # Convertir datetime a string
        }
