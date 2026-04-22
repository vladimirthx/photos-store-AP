FROM node:20-alpine

# Prisma needs openssl to connect securely to the database
RUN apk add --no-cache openssl

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

COPY prisma ./prisma
RUN npx prisma generate

COPY src ./src

EXPOSE 3002

CMD ["node", "src/app.js"]