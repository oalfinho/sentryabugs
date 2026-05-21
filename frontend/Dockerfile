# frontend/Dockerfile
FROM node:22-slim as base
WORKDIR /app
COPY package*.json .
RUN npm ci
COPY . .

FROM base as development
# O flag --host 0.0.0.0 é crucial para o container receber conexões
CMD ["npm", "run", "dev"]