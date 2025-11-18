# schemas.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID 

class MedicationIn(BaseModel):
    user_id: str
    name: str
    dose: Optional[str] = None
    instructions: Optional[str] = None

class MedicationOut(BaseModel):
    id: str  # Lo cambiamos a string
    user_id: str  # También a string
    name: str
    dose: str
    instructions: str
    created_at: str  # Cambiamos a string

    class Config:
        # Esto asegura que los campos UUID y datetime se serialicen correctamente como cadenas
        orm_mode = True
        json_encoders = {
            UUID: str,
            datetime: lambda v: v.isoformat(),
        }
