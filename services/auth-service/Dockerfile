FROM node:20-alpine

WORKDIR /app

# Al estar dentro de la carpeta del servicio, el package.json está en la raíz del contexto
COPY package.json ./
RUN npm install --omit=dev

# Copiamos la carpeta prisma (asumiendo que está en el mismo nivel que el Dockerfile)
COPY prisma ./prisma
RUN npx prisma generate

# Copiamos el código fuente
COPY src ./src

EXPOSE 3001

CMD ["node", "src/app.js"]
