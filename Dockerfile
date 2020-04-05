FROM node:latest as build-stage
WORKDIR /app
COPY package*.json ./

# Proxy configuration
RUN npm config set proxy http://172.16.98.151:8118
RUN npm config set https-proxy http://172.16.98.151:8118


RUN npm install
COPY ./ .
RUN npm run build

FROM nginx as production-stage
RUN mkdir /app
COPY --from=build-stage /app/dist /app
COPY nginx.conf /etc/nginx/nginx.conf