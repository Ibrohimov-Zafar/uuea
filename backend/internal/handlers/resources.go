package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"github.com/google/uuid"

	"miaoda/backend/internal/middleware"
)

func scanRows(rows *sql.Rows) ([]map[string]any, error) {
	cols, _ := rows.Columns()
	out := make([]map[string]any, 0)
	for rows.Next() {
		vals := make([]any, len(cols))
		ptrs := make([]any, len(cols))
		for i := range vals {
			ptrs[i] = &vals[i]
		}
		if err := rows.Scan(ptrs...); err != nil {
			return nil, err
		}
		row := map[string]any{}
		for i, c := range cols {
			switch v := vals[i].(type) {
			case []byte:
				row[c] = string(v)
			case int64:
				if strings.Contains(c, "is_") || c == "is_read" || c == "is_default" {
					row[c] = v == 1
				} else {
					row[c] = v
				}
			default:
				row[c] = v
			}
		}
		out = append(out, row)
	}
	return out, rows.Err()
}

func (a *API) ListMembershipPlans(w http.ResponseWriter, r *http.Request) {
	rows, err := a.DB.Query(`SELECT id, slug, name, price_usd, features, created_at FROM membership_plans ORDER BY price_usd`)
	if err != nil {
		errJSON(w, http.StatusInternalServerError, "server_error")
		return
	}
	defer rows.Close()
	data, _ := scanRows(rows)
	for _, row := range data {
		if f, ok := row["features"].(string); ok {
			var parsed any
			if json.Unmarshal([]byte(f), &parsed) == nil {
				row["features"] = parsed
			}
		}
	}
	writeJSON(w, http.StatusOK, data)
}

func (a *API) MyMembership(w http.ResponseWriter, r *http.Request) {
	uid := middleware.UserID(r)
	rows, err := a.DB.Query(`SELECT * FROM memberships WHERE user_id=? ORDER BY created_at DESC LIMIT 1`, uid)
	if err != nil {
		errJSON(w, http.StatusInternalServerError, "server_error")
		return
	}
	defer rows.Close()
	data, err := scanRows(rows)
	if err != nil || len(data) == 0 {
		writeJSON(w, http.StatusOK, nil)
		return
	}
	writeJSON(w, http.StatusOK, data[0])
}

func (a *API) CancelMembership(w http.ResponseWriter, r *http.Request) {
	uid := middleware.UserID(r)
	now := time.Now().UTC().Format(time.RFC3339)
	_, err := a.DB.Exec(`UPDATE memberships SET status='cancelled', updated_at=? WHERE user_id=?`, now, uid)
	if err != nil {
		errJSON(w, http.StatusInternalServerError, "server_error")
		return
	}
	a.MyMembership(w, r)
}

func (a *API) GetBusiness(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	if id == "" {
		errJSON(w, http.StatusBadRequest, "invalid_input")
		return
	}
	rows, err := a.DB.Query(`SELECT * FROM businesses WHERE id=? AND is_active=1`, id)
	if err != nil {
		errJSON(w, http.StatusInternalServerError, "server_error")
		return
	}
	defer rows.Close()
	data, _ := scanRows(rows)
	if len(data) == 0 {
		errJSON(w, http.StatusNotFound, "not_found")
		return
	}
	writeJSON(w, http.StatusOK, data[0])
}

func (a *API) ListBusinesses(w http.ResponseWriter, r *http.Request) {
	q := `SELECT * FROM businesses WHERE is_active=1`
	args := []any{}
	if cat := r.URL.Query().Get("category"); cat != "" && cat != "Hammasi" {
		q += ` AND category=?`
		args = append(args, cat)
	}
	if region := r.URL.Query().Get("region"); region != "" && region != "Hammasi" {
		q += ` AND region=?`
		args = append(args, region)
	}
	if search := r.URL.Query().Get("search"); search != "" {
		q += ` AND (name LIKE ? OR description LIKE ?)`
		args = append(args, "%"+search+"%", "%"+search+"%")
	}
	sortBy := r.URL.Query().Get("sort")
	switch sortBy {
	case "name_asc":
		q += ` ORDER BY name ASC`
	case "name_desc":
		q += ` ORDER BY name DESC`
	case "newest":
		q += ` ORDER BY created_at DESC`
	default:
		q += ` ORDER BY is_vip DESC, name ASC`
	}
	if lim := r.URL.Query().Get("limit"); lim != "" {
		q += ` LIMIT ?`
		args = append(args, lim)
		if off := r.URL.Query().Get("offset"); off != "" {
			q += ` OFFSET ?`
			args = append(args, off)
		}
	}
	rows, err := a.DB.Query(q, args...)
	if err != nil {
		errJSON(w, http.StatusInternalServerError, "server_error")
		return
	}
	defer rows.Close()
	data, _ := scanRows(rows)
	writeJSON(w, http.StatusOK, data)
}

func (a *API) ListEvents(w http.ResponseWriter, r *http.Request) {
	activeOnly := r.URL.Query().Get("active") != "false"
	q := `SELECT * FROM events`
	if activeOnly {
		q += ` WHERE is_active=1`
	}
	q += ` ORDER BY event_date`
	rows, err := a.DB.Query(q)
	if err != nil {
		errJSON(w, http.StatusInternalServerError, "server_error")
		return
	}
	defer rows.Close()
	data, _ := scanRows(rows)
	writeJSON(w, http.StatusOK, data)
}

func (a *API) ListNotifications(w http.ResponseWriter, r *http.Request) {
	uid := middleware.UserID(r)
	rows, err := a.DB.Query(`SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC LIMIT 40`, uid)
	if err != nil {
		errJSON(w, http.StatusInternalServerError, "server_error")
		return
	}
	defer rows.Close()
	data, _ := scanRows(rows)
	writeJSON(w, http.StatusOK, data)
}

func (a *API) MarkNotificationRead(w http.ResponseWriter, r *http.Request) {
	uid := middleware.UserID(r)
	id := chiURLParam(r, "id")
	_, _ = a.DB.Exec(`UPDATE notifications SET is_read=1 WHERE id=? AND user_id=?`, id, uid)
	writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
}

func (a *API) MarkAllNotificationsRead(w http.ResponseWriter, r *http.Request) {
	uid := middleware.UserID(r)
	_, _ = a.DB.Exec(`UPDATE notifications SET is_read=1 WHERE user_id=? AND is_read=0`, uid)
	writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
}

func (a *API) DeleteNotification(w http.ResponseWriter, r *http.Request) {
	uid := middleware.UserID(r)
	id := chiURLParam(r, "id")
	_, _ = a.DB.Exec(`DELETE FROM notifications WHERE id=? AND user_id=?`, id, uid)
	writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
}

func (a *API) CreateHeroLead(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Email string `json:"email"`
	}
	if err := readJSON(r, &body); err != nil || body.Email == "" {
		errJSON(w, http.StatusBadRequest, "invalid_input")
		return
	}
	id := uuid.NewString()
	token := uuid.NewString()
	now := time.Now().UTC().Format(time.RFC3339)
	_, err := a.DB.Exec(`INSERT INTO hero_leads (id, email, unsubscribe_token, source, created_at) VALUES (?,?,?,?,?)`,
		id, strings.TrimSpace(body.Email), token, "hero_form", now)
	if err != nil {
		errJSON(w, http.StatusInternalServerError, "server_error")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"id": id, "email": body.Email, "unsubscribe_token": token, "created_at": now})
}

func (a *API) UnsubscribeByToken(w http.ResponseWriter, r *http.Request) {
	token := r.URL.Query().Get("token")
	if token == "" {
		var body struct {
			Token string `json:"token"`
		}
		_ = readJSON(r, &body)
		token = body.Token
	}
	if token == "" {
		errJSON(w, http.StatusBadRequest, "invalid_input")
		return
	}
	var unsubscribed sql.NullString
	err := a.DB.QueryRow(`SELECT unsubscribed_at FROM hero_leads WHERE unsubscribe_token=?`, token).Scan(&unsubscribed)
	if err == sql.ErrNoRows {
		errJSON(w, http.StatusNotFound, "not_found")
		return
	}
	if unsubscribed.Valid && unsubscribed.String != "" {
		writeJSON(w, http.StatusOK, map[string]any{"ok": true, "already": true})
		return
	}
	now := time.Now().UTC().Format(time.RFC3339)
	_, _ = a.DB.Exec(`UPDATE hero_leads SET unsubscribed_at=? WHERE unsubscribe_token=?`, now, token)
	writeJSON(w, http.StatusOK, map[string]any{"ok": true, "already": false})
}

func (a *API) UnsubscribeLead(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Email string `json:"email"`
		Token string `json:"token"`
	}
	_ = readJSON(r, &body)
	email := strings.TrimSpace(r.URL.Query().Get("email"))
	if email == "" {
		email = body.Email
	}
	if email == "" {
		errJSON(w, http.StatusBadRequest, "invalid_input")
		return
	}
	_, _ = a.DB.Exec(`DELETE FROM hero_leads WHERE lower(email)=lower(?)`, email)
	writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
}

func (a *API) MyBusinessSubmissions(w http.ResponseWriter, r *http.Request) {
	uid := middleware.UserID(r)
	rows, err := a.DB.Query(`SELECT * FROM business_submissions WHERE owner_id=? ORDER BY created_at DESC LIMIT 20`, uid)
	if err != nil {
		errJSON(w, http.StatusInternalServerError, "server_error")
		return
	}
	defer rows.Close()
	data, _ := scanRows(rows)
	writeJSON(w, http.StatusOK, data)
}

func (a *API) CreateBusinessSubmission(w http.ResponseWriter, r *http.Request) {
	uid := middleware.UserID(r)
	var body map[string]any
	if err := readJSON(r, &body); err != nil {
		errJSON(w, http.StatusBadRequest, "invalid_input")
		return
	}
	id := uuid.NewString()
	now := time.Now().UTC().Format(time.RFC3339)
	name, _ := body["name"].(string)
	category, _ := body["category"].(string)
	if name == "" || category == "" {
		errJSON(w, http.StatusBadRequest, "invalid_input")
		return
	}
	_, err := a.DB.Exec(`INSERT INTO business_submissions (id, owner_id, name, category, description, website, phone, email, address, logo_url, industry, dba_name, status, created_at, updated_at)
		VALUES (?,?,?,?,?,?,?,?,?,?,?,?,'pending',?,?)`,
		id, uid, name, category,
		str(body["description"]), str(body["website"]), str(body["phone"]), str(body["email"]), str(body["address"]), str(body["logo_url"]),
		str(body["industry"]), str(body["dba_name"]), now, now)
	if err != nil {
		errJSON(w, http.StatusInternalServerError, "server_error")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"id": id})
}

func str(v any) string {
	if v == nil {
		return ""
	}
	if s, ok := v.(string); ok {
		return s
	}
	return ""
}

func (a *API) MyEventRegistrations(w http.ResponseWriter, r *http.Request) {
	uid := middleware.UserID(r)
	rows, err := a.DB.Query(`
		SELECT er.*, e.title AS event_title, e.event_date AS event_event_date, e.location AS event_location, e.price_usd AS event_price_usd
		FROM event_registrations er
		LEFT JOIN events e ON e.id = er.event_id
		WHERE er.user_id=? ORDER BY er.created_at DESC LIMIT 20`, uid)
	if err != nil {
		errJSON(w, http.StatusInternalServerError, "server_error")
		return
	}
	defer rows.Close()
	raw, _ := scanRows(rows)
	out := make([]map[string]any, 0, len(raw))
	for _, row := range raw {
		ev := map[string]any{}
		if t, ok := row["event_title"]; ok && t != nil {
			ev["title"] = t
			ev["event_date"] = row["event_event_date"]
			ev["location"] = row["event_location"]
			ev["price_usd"] = row["event_price_usd"]
			row["event"] = ev
		}
		delete(row, "event_title")
		delete(row, "event_event_date")
		delete(row, "event_location")
		delete(row, "event_price_usd")
		out = append(out, row)
	}
	writeJSON(w, http.StatusOK, out)
}

func (a *API) MyOrders(w http.ResponseWriter, r *http.Request) {
	uid := middleware.UserID(r)
	rows, err := a.DB.Query(`SELECT * FROM orders WHERE user_id=? ORDER BY created_at DESC LIMIT 50`, uid)
	if err != nil {
		errJSON(w, http.StatusInternalServerError, "server_error")
		return
	}
	defer rows.Close()
	data, _ := scanRows(rows)
	writeJSON(w, http.StatusOK, data)
}

func (a *API) MySavedCards(w http.ResponseWriter, r *http.Request) {
	uid := middleware.UserID(r)
	rows, err := a.DB.Query(`SELECT id, brand, last4, exp_month, exp_year, is_default, created_at FROM saved_cards WHERE user_id=?`, uid)
	if err != nil {
		errJSON(w, http.StatusInternalServerError, "server_error")
		return
	}
	defer rows.Close()
	data, _ := scanRows(rows)
	writeJSON(w, http.StatusOK, data)
}

func (a *API) GetEvent(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	if id == "" {
		errJSON(w, http.StatusBadRequest, "invalid_input")
		return
	}
	rows, err := a.DB.Query(`SELECT spots_remaining FROM events WHERE id=?`, id)
	if err != nil {
		errJSON(w, http.StatusInternalServerError, "server_error")
		return
	}
	defer rows.Close()
	data, _ := scanRows(rows)
	if len(data) == 0 {
		writeJSON(w, http.StatusOK, nil)
		return
	}
	writeJSON(w, http.StatusOK, data[0])
}
