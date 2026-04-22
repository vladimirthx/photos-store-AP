FROM node:20-alpine

WORKDIR /app

# Copy service-specific package files
COPY services/payment-service/package.json ./
RUN npm install --omit=dev

# Copy Prisma schema and generate client
COPY services/payment-service/prisma ./prisma
RUN npx prisma generate

# Copy service source code
COPY services/payment-service/src ./src

EXPOSE 3003

CMD ["node", "src/app.js"]
