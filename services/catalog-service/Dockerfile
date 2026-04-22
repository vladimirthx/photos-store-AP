FROM node:20-alpine

# sharp requires native libs
RUN apk add --no-cache libc6-compat vips-dev

WORKDIR /app

# Copy service-specific package files
COPY services/catalog-service/package.json ./
RUN npm install --omit=dev

# Copy Prisma schema and generate client
COPY services/catalog-service/prisma ./prisma
RUN npx prisma generate

# Copy service source code
COPY services/catalog-service/src ./src

EXPOSE 3002

CMD ["node", "src/app.js"]