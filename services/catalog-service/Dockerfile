FROM node:20-slim

# Instalamos libvips para asegurar compatibilidad con sharp en Debian
RUN apt-get update && apt-get install -y \
    libvips-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

COPY prisma ./prisma
RUN npx prisma generate

COPY src ./src

EXPOSE 3002

CMD ["node", "src/app.js"]