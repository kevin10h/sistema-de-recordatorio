# services/notification/main.py
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import traceback

app = FastAPI(title="Notification Service")

EMAIL_HOST = os.getenv("EMAIL_HOST", "smtp.gmail.com")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", 587))
EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")

@app.get("/")
def root():
    return {"message": "📨 Notification service is running"}

@app.post("/send")
async def send_notification(request: Request):
    data = await request.json()
    email = data.get("email")
    note = data.get("note", "Recordatorio de tu medicamento")
    reminder_id = data.get("reminder_id")

    print(f"✅ Enviando correo a {email} con nota '{note}' (recordatorio {reminder_id})")

    # Crear correo HTML bonito
    msg = MIMEMultipart("alternative")
    msg["From"] = EMAIL_USER
    msg["To"] = email
    msg["Subject"] = "💊 Recordatorio de Medicamento"

    html = f"""
    <html>
      <body>
        <h2>💊 Recordatorio de Medicamento</h2>
        <p>{note}</p>
        <p><strong>ID Recordatorio:</strong> {reminder_id}</p>
        <hr>
        <p>Enviado automáticamente por <b>PillReminder</b></p>
      </body>
    </html>
    """

    msg.attach(MIMEText(html, "html"))

    try:
        with smtplib.SMTP(EMAIL_HOST, EMAIL_PORT) as server:
            server.starttls()
            server.login(EMAIL_USER, EMAIL_PASSWORD)
            server.send_message(msg)
        print(f"✅ Correo enviado correctamente a {email}")
        return JSONResponse(content={"status": "sent", "email": email}, status_code=200)

    except Exception as e:
        print("❌ Error enviando correo:")
        traceback.print_exc()
        return JSONResponse(content={"error": str(e)}, status_code=500)
