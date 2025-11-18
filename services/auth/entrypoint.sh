#!/bin/sh
set -e

echo "Esperando a que Postgres esté listo..."
until nc -z postgres 5432; do
  sleep 2
done

echo "Postgres listo, iniciando servicio Auth..."
exec uvicorn main:app --host 0.0.0.0 --port 8000
