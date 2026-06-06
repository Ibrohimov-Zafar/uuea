package handlers

import (
	"database/sql"
	"strings"
	"time"

	"github.com/google/uuid"
)

func insertMembershipApplication(a *API, orderID, userID, planSlug string, body map[string]any) error {
	residentType := str(body["resident_type"])
	if residentType != "uz" && residentType != "intl" {
		residentType = "uz"
	}
	firstName := strings.TrimSpace(str(body["first_name"]))
	lastName := strings.TrimSpace(str(body["last_name"]))
	email := strings.TrimSpace(str(body["email"]))
	if email == "" {
		email = strings.TrimSpace(str(body["customer_email"]))
	}
	phone := strings.TrimSpace(str(body["phone"]))
	city := strings.TrimSpace(str(body["city"]))
	street := strings.TrimSpace(str(body["street"]))
	if firstName == "" || lastName == "" || email == "" || phone == "" || city == "" || street == "" {
		return sql.ErrNoRows // signal invalid_input to caller
	}
	if residentType == "uz" && strings.TrimSpace(str(body["state"])) == "" {
		return sql.ErrNoRows
	}
	if residentType == "intl" && strings.TrimSpace(str(body["country"])) == "" {
		return sql.ErrNoRows
	}

	id := uuid.NewString()
	now := time.Now().UTC().Format(time.RFC3339)
	_, err := a.DB.Exec(`INSERT INTO membership_applications (
		id, order_id, user_id, plan_slug, resident_type,
		first_name, last_name, email, phone, mobile,
		company_name, website, dba_name, industry,
		country, state, city, street, zip,
		status, created_at, updated_at
	) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'pending',?,?)`,
		id, orderID, nullIfEmpty(userID), planSlug, residentType,
		firstName, lastName, email, phone, str(body["mobile"]),
		str(body["company_name"]), str(body["website"]), str(body["dba_name"]), str(body["industry"]),
		str(body["country"]), str(body["state"]), city, street, str(body["zip"]),
		now, now,
	)
	return err
}

func markMembershipApplicationPaid(a *API, orderID string) {
	if orderID == "" {
		return
	}
	now := time.Now().UTC().Format(time.RFC3339)
	_, _ = a.DB.Exec(`UPDATE membership_applications SET status='paid', updated_at=? WHERE order_id=?`, now, orderID)
}
