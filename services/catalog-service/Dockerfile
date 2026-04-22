FROM node:20-alpine

# sharp requires native libs
RUN apk add --no-cache libc6-compat vips-dev

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

COPY prisma ./prisma
RUN npx prisma generate

COPY src ./src

EXPOSE 3002

CMD ["node", "src/app.js"]