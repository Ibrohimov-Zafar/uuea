# syntax=docker/dockerfile:1
# public.ecr.aws — Docker Hub o‘rniga (VPSda auth.docker.io 404 bo‘lsa)

FROM public.ecr.aws/docker/library/golang:1.22-alpine AS build
WORKDIR /src
RUN apk add --no-cache git ca-certificates
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -ldflags="-s -w" -o /out/api ./cmd/api
RUN CGO_ENABLED=0 go build -ldflags="-s -w" -o /out/seed ./cmd/seed

FROM public.ecr.aws/docker/library/alpine:3.20
RUN apk add --no-cache ca-certificates curl
WORKDIR /app
COPY --from=build /out/api /app/api
COPY --from=build /out/seed /app/seed
ENV API_PORT=8787 \
    DB_PATH=/data/app.db \
    UPLOAD_DIR=/data/uploads
EXPOSE 8787
VOLUME ["/data"]
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=5 \
  CMD curl -fsS http://127.0.0.1:8787/health || exit 1
CMD ["/app/api"]
