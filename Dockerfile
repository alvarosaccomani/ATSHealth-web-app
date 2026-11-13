# atshealth-web-app/Dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build --configuration=production

# Etapa de producción
FROM nginx:alpine
COPY --from=builder /app/dist/ATSHealth-web-app/browser /usr/share/nginx/html

# Copia nginx.conf personalizado
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
