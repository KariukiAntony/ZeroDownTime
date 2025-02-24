# Stage 1: Build stage
FROM node:18 AS build

WORKDIR /app

COPY package*.json  ./
RUN npm install

COPY . .

ENV NODE_ENV=production
RUN npm run build

# Stage 2: Serve the static files
FROM nginx:alpine AS production

RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/dist /usr/share/nginx/html

RUN useradd --create-home --shell /bin/bash newuser
USER newuser

EXPOSE 80

