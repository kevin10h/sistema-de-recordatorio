# services/reminder/tasks.py

import os
import requests
from celery import Celery
from datetime import datetime
from zoneinfo import ZoneInfo

# ================================
# CONFIGURACIÓN DE CELERY
# ================================
broker_url = os.getenv("CELERY_BROKER_URL", "pyamqp://user:password@rabbitmq:5672//")
backend_url = os.getenv("CELERY_RESULT_BACKEND", "redis://redis:6379/0")

celery_app = Celery("reminder_tasks", broker=broker_url, backend=backend_url)
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="America/Lima",   # Zona horaria base
    enable_utc=True,           # Ejecutar internamente en UTC (correcto)
)

# ================================
# MICRO-SERVICIOS
# ================================
NOTIFICATION_URL = os.getenv("NOTIFICATION_SERVICE_URL", "http://notification:8000/send")
AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL", "http://auth:8000")
MEDICATION_SERVICE_URL = os.getenv("MEDICATION_SERVICE_URL", "http://medication:8000")


# ================================
# TAREA PRINCIPAL DE RECORDATORIO
# ================================
@celery_app.task(name="tasks.send_notification_task")
def send_notification_task(reminder_id: str, user_id: str, medication_id: str = None, timezone: str = "America/Lima"):
    """
    Envía una notificación de recordatorio recuperando datos de usuario,
    medicamento y construyendo un mensaje HTML completo.

    Ahora incluye manejo correcto de zonas horarias por usuario.
    """

    try:
        print(f"🚀 Ejecutando tarea | Reminder={reminder_id} | User={user_id} | TZ={timezone}")

        # ================================
        # 1) Obtener datos del usuario
        # ================================
        user_resp = requests.get(f"{AUTH_SERVICE_URL}/users/{user_id}", timeout=5)
        user_resp.raise_for_status()
        user = user_resp.json()

        email = user.get("email")
        user_name = user.get("name", "Usuario")

        if not email:
            raise ValueError(f"Usuario {user_id} no tiene email registrado.")

        # ================================
        # 2) Obtener datos del medicamento
        # ================================
        med_name, med_dose, med_instr = "Desconocido", "N/A", "No definido"

        if medication_id:
            try:
                med_resp = requests.get(f"{MEDICATION_SERVICE_URL}/medications/id/{medication_id}", timeout=5)
                med_resp.raise_for_status()
                med = med_resp.json()

                med_name = med.get("name", "Desconocido")
                med_dose = med.get("dose", "N/A")
                med_instr = med.get("instructions", "No especificado")

            except Exception as e:
                print(f"⚠️ No se pudo obtener info de medicamento {medication_id}: {e}")

        # ================================
        # 3) Hora local según zona horaria del usuario
        # ================================
        try:
            hora_local = datetime.now(ZoneInfo(timezone)).strftime("%I:%M %p")
        except Exception:
            hora_local = datetime.now(ZoneInfo("America/Lima")).strftime("%I:%M %p")
            print(f"⚠️ Timezone inválido ({timezone}), usando America/Lima")

        # ================================
        # 4) Construir mensaje HTML
        # ================================
        note_html = f"""
        <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
            <h2>👋 Hola {user_name},</h2>
            <p>Este es tu recordatorio programado en <b>PillReminder</b>.</p>

            <table style="margin-top: 10px;">
                <tr><td>💊 <b>Medicamento:</b></td><td>{med_name}</td></tr>
                <tr><td>💧 <b>Dosis:</b></td><td>{med_dose}</td></tr>
                <tr><td>📘 <b>Instrucciones:</b></td><td>{med_instr}</td></tr>
            </table>

            <p style="margin-top: 15px;">⏰ <b>Hora de envío:</b> {hora_local} ({timezone})</p>

            <p style="margin-top: 15px;">Recuerda tomarlo a tiempo 😊</p>

            <hr style="margin-top: 20px;">
            <p style="font-size: 12px; color: gray;">ID de Recordatorio: {reminder_id}</p>
            <p style="font-size: 12px; color: gray;">PillReminder — Sistema automático</p>
        </body>
        </html>
        """

        # ================================
        # 5) Enviar notificación
        # ================================
        response = requests.post(
            NOTIFICATION_URL,
            json={
                "email": email,
                "note": note_html,
                "reminder_id": reminder_id,
            },
            timeout=10,
        )

        response.raise_for_status()

        print(f"✅ Notificación enviada a {email}")
        return True

    except Exception as e:
        print(f"❌ Error en tarea de recordatorio: {e}")
        return False
