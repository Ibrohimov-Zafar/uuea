package config

import (
	"os"
	"strconv"
)

type Config struct {
	Port          int
	JWTSecret     string
	DBPath        string
	UploadDir     string
	StripeSecret  string
	FrontendOrigin string
}

func Load() Config {
	port, _ := strconv.Atoi(getEnv("API_PORT", "8787"))
	return Config{
		Port:           port,
		JWTSecret:      getEnv("JWT_SECRET", "dev_change_me"),
		DBPath:         getEnv("DB_PATH", "./data/app.db"),
		UploadDir:      getEnv("UPLOAD_DIR", "./data/uploads"),
		StripeSecret:   os.Getenv("STRIPE_SECRET_KEY"),
		FrontendOrigin: getEnv("FRONTEND_ORIGIN", "http://localhost:5173"),
	}
}

func getEnv(k, fallback string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return fallback
}
