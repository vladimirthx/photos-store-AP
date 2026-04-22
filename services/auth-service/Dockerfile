FROM node:20-alpine

WORKDIR /app

# Copy service-specific package files
COPY services/auth-service/package.json ./
# If you have a lockfile inside the service folder, uncomment the next line
# COPY services/auth-service/package-lock.json ./

RUN npm install --omit=dev

# Copy Prisma schema and generate client
COPY services/auth-service/prisma ./prisma
RUN npx prisma generate

# Copy service source code
COPY services/auth-service/src ./src

EXPOSE 3001

CMD ["node", "src/app.js"]
