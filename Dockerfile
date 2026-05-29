# syntax=docker/dockerfile:1
# public.ecr.aws — Docker Hub o‘rniga (VPSda auth.docker.io 404 bo‘lsa)

FROM public.ecr.aws/docker/library/node:22-alpine AS build
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.33.2 --activate
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
ARG VITE_API_URL=http://localhost:8787
ENV VITE_API_URL=$VITE_API_URL
RUN pnpm build

FROM public.ecr.aws/docker/library/nginx:1.27-alpine
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
