package db

import (
	"database/sql"
	"embed"
	"fmt"
	"os"
	"path/filepath"

	_ "modernc.org/sqlite"
)

//go:embed schema.sql
var schemaFS embed.FS

func Open(path string) (*sql.DB, error) {
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		return nil, err
	}
	dsn := fmt.Sprintf("file:%s?_pragma=foreign_keys(1)&_pragma=journal_mode(WAL)", path)
	conn, err := sql.Open("sqlite", dsn)
	if err != nil {
		return nil, err
	}
	if err := conn.Ping(); err != nil {
		return nil, err
	}
	schema, err := schemaFS.ReadFile("schema.sql")
	if err != nil {
		return nil, err
	}
	if _, err := conn.Exec(string(schema)); err != nil {
		return nil, err
	}
	runMigrations(conn)
	return conn, nil
}

func runMigrations(db *sql.DB) {
	alters := []string{
		`ALTER TABLE news_posts ADD COLUMN title_ru TEXT`,
		`ALTER TABLE news_posts ADD COLUMN title_en TEXT`,
		`ALTER TABLE news_posts ADD COLUMN excerpt_ru TEXT`,
		`ALTER TABLE news_posts ADD COLUMN excerpt_en TEXT`,
		`ALTER TABLE news_posts ADD COLUMN body_ru TEXT`,
		`ALTER TABLE news_posts ADD COLUMN body_en TEXT`,
		`ALTER TABLE events ADD COLUMN title_ru TEXT`,
		`ALTER TABLE events ADD COLUMN title_en TEXT`,
		`ALTER TABLE events ADD COLUMN description_ru TEXT`,
		`ALTER TABLE events ADD COLUMN description_en TEXT`,
		`ALTER TABLE legal_resources ADD COLUMN title_ru TEXT`,
		`ALTER TABLE legal_resources ADD COLUMN title_en TEXT`,
		`ALTER TABLE legal_resources ADD COLUMN excerpt_ru TEXT`,
		`ALTER TABLE legal_resources ADD COLUMN excerpt_en TEXT`,
		`ALTER TABLE legal_resources ADD COLUMN body_ru TEXT`,
		`ALTER TABLE legal_resources ADD COLUMN body_en TEXT`,
		`ALTER TABLE email_campaigns ADD COLUMN logo_url TEXT`,
		`ALTER TABLE businesses ADD COLUMN name_ru TEXT`,
		`ALTER TABLE businesses ADD COLUMN name_en TEXT`,
		`ALTER TABLE businesses ADD COLUMN category_ru TEXT`,
		`ALTER TABLE businesses ADD COLUMN category_en TEXT`,
		`ALTER TABLE businesses ADD COLUMN description_ru TEXT`,
		`ALTER TABLE businesses ADD COLUMN description_en TEXT`,
		`ALTER TABLE email_campaigns ADD COLUMN subject_ru TEXT`,
		`ALTER TABLE email_campaigns ADD COLUMN subject_en TEXT`,
		`ALTER TABLE email_campaigns ADD COLUMN body_ru TEXT`,
		`ALTER TABLE email_campaigns ADD COLUMN body_en TEXT`,
	}
	for _, q := range alters {
		db.Exec(q) //nolint: errcheck — duplicate column errors are expected on re-runs
	}
}
