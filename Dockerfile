# Stage 1: Build - Этап сборки проекта
FROM node:20-slim AS builder

WORKDIR /app

# Копируем package.json и package-lock.json
COPY package.json package-lock.json ./

# Устанавливаем зависимости (используем npm ci для детерминированных установок)
RUN npm ci

# Копируем весь исходный код
COPY . ./

# Сборка NestJS проекта
RUN npm run build


# Stage 2: Production - Легковесный образ для запуска
FROM node:20-slim AS production

WORKDIR /app

# Копируем только production зависимости
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Копируем собранное приложение
COPY --from=builder /app/dist ./dist

# По умолчанию используем CMD из package.json (скрипт start:prod)
CMD ["npm", "run", "start:prod"]