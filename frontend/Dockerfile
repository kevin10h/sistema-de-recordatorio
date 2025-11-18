FROM node:18-alpine

WORKDIR /app

# Copiar los archivos de dependencias
COPY package*.json ./

# Instalar dependencias iniciales
RUN npm install

# Instalar dependencias adicionales necesarias para el dashboard
RUN npm install react-chartjs-2 chart.js react-calendar

# Instalar Vite globalmente
RUN npm install -g vite

# Copiar el resto del código del frontend
COPY . .

COPY .env .env

# Verificación (opcional)
RUN echo "✅ Vite instalado correctamente:" && vite --version

EXPOSE 3000

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
