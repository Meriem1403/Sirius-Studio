FROM node:22-alpine AS build

WORKDIR /app

ARG VITE_API_BASE_URL=
ARG VITE_ENABLE_DEMO_FIXTURES=
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_ENABLE_DEMO_FIXTURES=$VITE_ENABLE_DEMO_FIXTURES

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
