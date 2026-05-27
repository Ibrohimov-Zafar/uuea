package handlers

import (
	"database/sql"
	"time"

	"github.com/google/uuid"
)

// notifyUsersByRole inserts the same notification for all users with the given role.
// Best-effort: individual inserts may fail without aborting the whole request.
func notifyUsersByRole(db *sql.DB, role, typ, title, body, link string) {
	rows, err := db.Query(`SELECT id FROM users WHERE role=?`, role)
	if err != nil {
		return
	}
	defer rows.Close()

	now := time.Now().UTC().Format(time.RFC3339)
	for rows.Next() {
		var uid string
		if err := rows.Scan(&uid); err != nil || uid == "" {
			continue
		}
		_, _ = db.Exec(
			`INSERT INTO notifications (id, user_id, type, title, body, link, is_read, created_at) VALUES (?,?,?,?,?,?,0,?)`,
			uuid.NewString(), uid, typ, title, body, nullIfEmpty(link), now,
		)
	}
}

