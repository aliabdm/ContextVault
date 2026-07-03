FROM node:22-alpine AS builder
WORKDIR /app

RUN apk add --no-cache \
    gtk+3.0 \
    libnotify \
    nss \
    libxcb \
    libxkbcommon \
    libxcomposite \
    libxdamage \
    libxrandr \
    libxrender \
    libxtst \
    alsa-lib \
    dbus-glib

COPY desktop/package.json desktop/package-lock.json* ./
RUN npm install

COPY desktop/ .

RUN npm run build

FROM scratch
COPY --from=builder /app/dist /dist
