# 🧠💊 Medication Reminder App  
Sistema completo de recordatorios de medicación con FastAPI, React, Docker y notificaciones automáticas

---

## 📌 Descripción General

Medication Reminder App es una plataforma completa diseñada para ayudar a los usuarios a gestionar sus medicaciones, recibir recordatorios automáticos y visualizar su rutina en un Dashboard inteligente con estadísticas y un calendario de horarios.

Este proyecto combina:

- **FastAPI + Celery + Redis** para backend y tareas programadas  
- **React + Vite** para el frontend  
- **JWT Auth** para manejo seguro de usuarios  
- **Docker Compose** para despliegue fácil  
- **Chart.js** para visualizaciones  
- **Full scheduling system** (diario, semanal, cada X horas)

---

## 🚀 Características Principales

### 🔐 Autenticación
- Registro y login con JWT  
- Protección de rutas privadas  

### 💊 Gestión de Medicaciones
- Nombre, dosis, instrucciones (“después de comer”)  
- Frecuencia asociada automáticamente a los recordatorios  

### ⏰ Sistema Avanzado de Recordatorios
Frecuencias disponibles:

- **Diario** → seleccionar horas  
- **Semanal** → seleccionar días + horas  
- **Cada X horas** → intervalo configurable  

El sistema genera recordatorios reales ejecutados por **Celery en background**.

### 📊 Dashboard Inteligente
- Frecuencia por medicación  
- Recordatorios por día de la semana  
- Top medicaciones  
- Calendario visual (CalendarHeatmap / Scheduler)  
- Tarjetas rápidas con métricas  

### 🐳 Deployment con Docker (1 comando)

---

## 🏗️ Arquitectura del Proyecto

/backend
├── app/
│ ├── main.py
│ ├── auth/
│ ├── reminders/
│ ├── medications/
│ ├── database.py
│ └── celery_worker.py
├── Dockerfile
└── requirements.txt

/frontend
├── src/
│ ├── pages/
│ └── components/
├── Dockerfile
└── package.json

docker-compose.yml

yaml
Copiar código

---

## 🛠️ Tecnologías Utilizadas

### Backend
- FastAPI  
- SQLAlchemy  
- SQLite  
- Celery  
- Redis  
- Python 3.10  
- JWT Authentication  

### Frontend
- React (Vite)  
- Chart.js + react-chartjs-2  
- TailwindCSS  

### Infraestructura
- Docker  
- Docker Compose  

---

## 🔧 Instalación con Docker

### 1️⃣ Clonar el repositorio
```bash
git clone https://github.com/tuusuario/medication-reminder-app.git
cd medication-reminder-app
2️⃣ Levantar todo el sistema
bash
Copiar código
docker-compose up --build -d
3️⃣ Acceder
Frontend → http://localhost:3000

Backend → http://localhost:8000

Docs API → http://localhost:8000/docs

📡 Endpoints Principales (FastAPI)
🔐 Autenticación
POST /auth/register

POST /auth/login

GET /auth/me

💊 Medicaciones
POST /medications/

GET /medications/

DELETE /medications/{id}

⏰ Recordatorios
POST /reminders/

GET /reminders/

DELETE /reminders/{id}

🎨 Dashboard Preview
📊 Frecuencia por medicación
🗓️ Calendario visual de recordatorios
📈 Recordatorios por día

(Reemplaza estas descripciones con imágenes reales del dashboard)

🔄 Flujo Funcional
Usuario crea una medicación

Usuario crea un recordatorio (diario, semanal o cada X horas)

El backend valida y almacena el schedule

Celery programa tareas automáticas

El usuario ve todo en el Dashboard