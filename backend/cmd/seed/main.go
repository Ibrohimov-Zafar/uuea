package main

import (
	"log"
	"os"
	"path/filepath"

	"github.com/joho/godotenv"

	"miaoda/backend/internal/config"
	"miaoda/backend/internal/db"
	"miaoda/backend/internal/seed"
)

func main() {
	_ = godotenv.Load("../.env")
	_ = godotenv.Overload(".env")

	cfg := config.Load()
	dbPath := cfg.DBPath
	if !filepath.IsAbs(dbPath) {
		wd, _ := os.Getwd()
		dbPath = filepath.Join(wd, dbPath)
	}

	conn, err := db.Open(dbPath)
	if err != nil {
		log.Fatal(err)
	}
	defer conn.Close()

	_ = seed.Run(conn)
	if err := seed.Demo(conn); err != nil {
		log.Fatal(err)
	}
	log.Printf("[seed] demo data added to %s", dbPath)
}

