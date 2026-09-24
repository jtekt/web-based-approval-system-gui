FROM node:24 as build-stage
WORKDIR /app
COPY package*.json ./

RUN npm install
COPY ./ .

ARG APP_VERSION=dev
ENV VITE_APP_VERSION=$APP_VERSION

RUN npm run build

FROM nginx as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY default.conf /etc/nginx/conf.d/default.conf

# Generates /usr/share/nginx/html/env.js from VITE_* env vars before nginx starts
COPY ./40-env-config.sh /docker-entrypoint.d/40-env-config.sh
RUN chmod +x /docker-entrypoint.d/40-env-config.sh
