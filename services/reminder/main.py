# main.py
import os, json
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import datetime, timedelta, time as dt_time
from dotenv import load_dotenv
from models import Base, Reminder
from tasks import send_notification_task
from fastapi.middleware.cors import CORSMiddleware
import requests
from zoneinfo import ZoneInfo

# ========================
# Configuración inicial
# ========================
load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
API_MED = os.getenv("API_MED", "http://medication:8000")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="reminder-service")

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # frontend React
    allow_credentials=True,
    allow_methods=["*"],  # aceptar GET, POST, OPTIONS, etc.
    allow_headers=["*"],
)

# ========================
# Esquemas
# ========================
class Schedule(BaseModel):
    type: str   # "daily" | "weekly" | "interval"
    times: list[str] | None = None   # para daily y weekly
    days: list[str] | None = None    # solo para weekly
    interval: int | None = None      # solo para interval


class ReminderIn(BaseModel):
    user_id: str
    medication_id: str
    timezone: str | None = "America/Lima"
    start_date: datetime | None = None
    schedule: Schedule

# ========================
# Endpoints
# ========================
from zoneinfo import ZoneInfo  # <-- al inicio del archivo

...

@app.post("/reminders", status_code=201)
async def create_reminder(payload: ReminderIn):
    db = SessionLocal()
    try:
        # Crear recordatorio
        r = Reminder(
            user_id=payload.user_id,
            medication_id=payload.medication_id,
            schedule=json.dumps(payload.schedule.dict()),
            start_date=payload.start_date or datetime.utcnow(),
            timezone=payload.timezone or "America/Lima",
            active=True
        )
        db.add(r)
        db.commit()
        db.refresh(r)

        # =====================
        # Calcular próxima ejecución según el tipo
        # =====================
        schedule = payload.schedule
        tz = ZoneInfo(r.timezone)
        now_local = datetime.now(tz)
        eta_local = None

        # ----------------------
        # DAILY
        # ----------------------
        if schedule.type == "daily":
            for t in schedule.times or []:
                h, m = map(int, t.split(":"))
                candidate = datetime.combine(now_local.date(), dt_time(hour=h, minute=m, tzinfo=tz))
                if candidate >= now_local:
                    eta_local = candidate
                    break

            if eta_local is None:
                # mañana a esa hora
                h, m = map(int, (schedule.times or ["09:00"])[0].split(":"))
                eta_local = datetime.combine(
                    now_local.date() + timedelta(days=1),
                    dt_time(hour=h, minute=m, tzinfo=tz)
                )

        # ----------------------
        # WEEKLY
        # ----------------------
        elif schedule.type == "weekly":
            weekdays = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"]
            target_days = [weekdays.index(d.lower()) for d in schedule.days or []]

            for t in schedule.times or []:
                h, m = map(int, t.split(":"))
                for i in range(7):
                    candidate_day = now_local + timedelta(days=i)
                    if candidate_day.weekday() in target_days:
                        candidate = datetime.combine(candidate_day.date(),
                                                    dt_time(hour=h, minute=m, tzinfo=tz))
                        if candidate >= now_local:
                            eta_local = candidate
                            break
                if eta_local:
                    break

        # ----------------------
        # INTERVAL
        # ----------------------
        elif schedule.type == "interval":
            interval_hours = schedule.interval or 6
            eta_local = now_local + timedelta(hours=interval_hours)

        # Si por algún motivo no se encontró nada
        if eta_local is None:
            eta_local = now_local + timedelta(minutes=2)


        # Si ya pasó la hora de hoy → en modo prueba, en 2 min; si no, al día siguiente
        if eta_local is None:
            eta_local = now_local + timedelta(minutes=2)
            print(f"⚙️ Hora ya pasada, se programa recordatorio de prueba a {eta_local}", flush=True)

        # Convertimos a UTC para Celery
        eta_utc = eta_local.astimezone(ZoneInfo("UTC"))

        print(f"📬 DEBUG: Programando recordatorio para {eta_local} (local) / {eta_utc} (UTC)", flush=True)
        send_notification_task.apply_async(
        args=[str(r.id), str(r.user_id), str(r.medication_id), r.timezone],
        eta=eta_utc
        )
        print(f"✅ Tarea programada para recordatorio {r.id} y usuario {r.user_id} a las {eta_local}", flush=True)
        
        # 🚀 Emitir evento al dashboard
        import asyncio
        await broadcast_event(({
            "type": "new_reminder",
            "reminder_id": str(r.id),
            "user_id": str(r.user_id),
            "time": eta_local.isoformat(),
            "status": "scheduled"
        }))

        return {"id": str(r.id), "scheduled_next": eta_local.isoformat()}

    finally:
        db.close()




@app.get("/medications/{user_id}")
def list_medications(user_id: str):
    """
    Este endpoint pide al microservicio de medications
    los medicamentos de un usuario que aún no tengan recordatorio.
    """
    try:
        resp = requests.get(f"{API_MED}/medications/{user_id}", timeout=5)
        resp.raise_for_status()
    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Error al consultar medications: {str(e)}")

    return resp.json()


@app.get("/reminders/{user_id}")
def get_reminders_by_user(user_id: str):
    db = SessionLocal()
    try:
        reminders = db.query(Reminder).filter(Reminder.user_id == user_id).all()

        result = []
        for r in reminders:
            result.append({
                "id": str(r.id),
                "user_id": str(r.user_id),
                "medication_id": str(r.medication_id),
                "schedule": json.loads(r.schedule),   # ← ← ← CLAVE FINAL
                "start_date": r.start_date.isoformat() if r.start_date else None,
                "timezone": r.timezone,
                "active": r.active,
                "created_at": r.created_at.isoformat() if r.created_at else None
            })

        return result

    finally:
        db.close()

        
@app.get("/reminders")
def list_all_reminders():
    db = SessionLocal()
    try:
        return db.query(Reminder).all()
    finally:
        db.close()


@app.get("/reminder/{reminder_id}")
def get_reminder(reminder_id: str):
    db = SessionLocal()
    try:
        r = db.query(Reminder).filter(Reminder.id == reminder_id).first()
        if not r:
            raise HTTPException(status_code=404, detail="Recordatorio no encontrado")
        return r
    finally:
        db.close()



from fastapi import WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse

active_connections = []

@app.websocket("/ws/reminders")
async def reminders_ws(websocket: WebSocket):
    await websocket.accept()
    active_connections.append(websocket)
    try:
        while True:
            await websocket.receive_text()  # mantener conexión
    except WebSocketDisconnect:
        active_connections.remove(websocket)
        
        
# --- Función para enviar eventos ---
async def broadcast_event(event: dict):
    dead_connections = []
    for ws in active_connections:
        try:
            await ws.send_json(event)
        except Exception:
            dead_connections.append(ws)
    for ws in dead_connections:
        active_connections.remove(ws)        
        
        

                