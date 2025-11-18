from fastapi import FastAPI, HTTPException
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
from models import Base, Medication # Si la clase Medication está en models.py de tu servicio de medicamentos
from schemas import MedicationIn, MedicationOut
from fastapi.middleware.cors import CORSMiddleware
import uuid
import os
from sqlalchemy import cast, String
from sqlalchemy import create_engine, cast, String 



load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="medication-service")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Endpoint para crear un medicamento
@app.post("/medications", status_code=201, response_model=MedicationOut)
def create_med(med: MedicationIn):
    db = SessionLocal()
    try:
        user_id = str(med.user_id).strip()  # Asegura que sea texto limpio

        m = Medication(
            user_id=user_id,
            name=med.name,
            dose=med.dose,
            instructions=med.instructions,
            frequency=med.frequency
        )
        db.add(m)
        db.commit()
        db.refresh(m)
        # Convertir los datos a cadenas antes de devolverlos
        return MedicationOut(
            id=str(m.id),
            user_id=str(m.user_id),
            name=m.name,
            dose=m.dose,
            instructions=m.instructions,
            frequency=med.frequency,
            created_at=m.created_at.isoformat()
        )
    finally:
        db.close()

# Endpoint para listar los medicamentos de un usuario
@app.get("/medications/{user_id}", response_model=list[MedicationOut])
def list_medications(user_id: str):
    db = SessionLocal()
    try:
        # 🧠 Fuerza el tipo del parámetro a string
        user_id_str = str(user_id)

        from sqlalchemy import cast, String

        meds = db.query(Medication).filter(cast(Medication.user_id, String) == str(user_id)).all()


        return [
            MedicationOut(
                id=str(m.id),
                user_id=str(m.user_id),
                name=m.name,
                dose=m.dose,
                instructions=m.instructions,
                frequency=m.frequency,
                created_at=m.created_at.isoformat()
            )
            for m in meds
        ]
    finally:
        db.close()

# Endpoint para obtener un medicamento por ID
@app.get("/medications/id/{med_id}", response_model=MedicationOut)
def get_medication_by_id(med_id: str):
    db = SessionLocal()
    try:
        med = db.query(Medication).filter(Medication.id == str(med_id)).first()
        if not med:
            raise HTTPException(status_code=404, detail="Medicamento no encontrado")

        return MedicationOut(
            id=str(med.id),
            user_id=str(med.user_id),
            name=med.name,
            dose=med.dose,
            instructions=med.instructions,
            created_at=med.created_at.isoformat()
        )
    finally:
        db.close()