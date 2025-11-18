# worker_app.py
from tasks import celery_app

# Alias opcional para mantener compatibilidad con el comando del worker
celery = celery_app

