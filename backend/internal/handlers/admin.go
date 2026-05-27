package handlers

import (
	"net/http"
	"strings"
	"time"

	"github.com/google/uuid"

	"miaoda/backend/internal/middleware"
)

func (a *API) AdminStats(w http.ResponseWriter, r *http.Request) {
	var profiles, businesses, events int
	_ = a.DB.QueryRow(`SELECT COUNT(*) FROM users`).Scan(&profiles)
	_ = a.DB.QueryRow(`SELECT COUNT(*) FROM businesses`).Scan(&businesses)
	_ = a.DB.QueryRow(`SELECT COUNT(*) FROM events`).Scan(&events)

	rows, _ := a.DB.Query(`SELECT total_amount FROM orders WHERE status='completed'`)
	var revenue float64
	for rows.Next() {
		var amt float64
		_ = rows.Scan(&amt)
		revenue += amt
	}
	rows.Close()

	revRows, _ := a.DB.Query(`
		SELECT strftime('%Y-%m-01', completed_at) AS month, COUNT(*) AS order_count, SUM(total_amount) AS revenue
		FROM orders WHERE status='completed' AND completed_at IS NOT NULL
		GROUP BY 1 ORDER BY 1 DESC LIMIT 12`)
	revMonthly, _ := scanRows(revRows)
	if revRows != nil {
		revRows.Close()
	}

	memRows, _ := a.DB.Query(`
		SELECT strftime('%Y-%m-01', created_at) AS month, COUNT(*) AS new_members
		FROM memberships WHERE status='active'
		GROUP BY 1 ORDER BY 1 DESC LIMIT 12`)
	memMonthly, _ := scanRows(memRows)
	if memRows != nil {
		memRows.Close()
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"counts": map[string]int{"profiles": profiles, "businesses": businesses, "events": events},
		"revenue_total": revenue,
		"revenue_monthly": revMonthly,
		"membership_monthly": memMonthly,
	})
}

func (a *API) AdminList(w http.ResponseWriter, r *http.Request) {
	table := r.URL.Query().Get("table")
	limit := r.URL.Query().Get("limit")
	if limit == "" {
		limit = "100"
	}
	allowed := map[string]bool{
		"users": true, "businesses": true, "events": true, "business_submissions": true,
		"hero_leads": true, "email_campaigns": true, "orders": true, "memberships": true,
		"notifications": true,
	}
	if !allowed[table] {
		errJSON(w, http.StatusBadRequest, "invalid_table")
		return
	}
	q := `SELECT * FROM ` + table
	if table == "users" {
		q = `SELECT id, username, email, phone, full_name, avatar_url, role, created_at, updated_at FROM users`
	}
	q += ` ORDER BY created_at DESC LIMIT ` + limit
	rows, err := a.DB.Query(q)
	if err != nil {
		errJSON(w, http.StatusInternalServerError, "server_error")
		return
	}
	defer rows.Close()
	data, _ := scanRows(rows)
	writeJSON(w, http.StatusOK, data)
}

func (a *API) AdminUpdateUser(w http.ResponseWriter, r *http.Request) {
	var body map[string]any
	if err := readJSON(r, &body); err != nil {
		errJSON(w, http.StatusBadRequest, "invalid_input")
		return
	}
	id, _ := body["id"].(string)
	if id == "" {
		errJSON(w, http.StatusBadRequest, "invalid_input")
		return
	}
	now := time.Now().UTC().Format(time.RFC3339)
	_, err := a.DB.Exec(`UPDATE users SET role=COALESCE(?, role), full_name=COALESCE(?, full_name), phone=COALESCE(?, phone), updated_at=? WHERE id=?`,
		body["role"], body["full_name"], body["phone"], now, id)
	if err != nil {
		errJSON(w, http.StatusInternalServerError, "server_error")
		return
	}
	writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
}

func (a *API) AdminDeleteUser(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	if id == "" {
		errJSON(w, http.StatusBadRequest, "invalid_input")
		return
	}
	_, _ = a.DB.Exec(`DELETE FROM users WHERE id=?`, id)
	writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
}

func (a *API) AdminUpsertBusiness(w http.ResponseWriter, r *http.Request) {
	var body map[string]any
	if err := readJSON(r, &body); err != nil {
		errJSON(w, http.StatusBadRequest, "invalid_input")
		return
	}
	now := time.Now().UTC().Format(time.RFC3339)
	id, _ := body["id"].(string)
	isVIP := boolVal(body["is_vip"])
	isActive := boolVal(body["is_active"])
	if !boolVal(body["is_active"]) && body["is_active"] == nil {
		isActive = true
	}
	if id != "" {
		_, err := a.DB.Exec(`UPDATE businesses SET name=?, category=?, description=?, website=?, phone=?, email=?, address=?, logo_url=?, region=?, is_vip=?, is_active=?, updated_at=? WHERE id=?`,
			str(body["name"]), str(body["category"]), str(body["description"]), str(body["website"]), str(body["phone"]),
			str(body["email"]), str(body["address"]), str(body["logo_url"]), str(body["region"]), boolInt(isVIP), boolInt(isActive), now, id)
		if err != nil {
			errJSON(w, http.StatusInternalServerError, "server_error")
			return
		}
		writeJSON(w, http.StatusOK, map[string]any{"id": id})
		return
	}
	id = uuid.NewString()
	_, err := a.DB.Exec(`INSERT INTO businesses (id, owner_id, name, category, description, website, phone, email, address, logo_url, region, is_vip, is_active, created_at, updated_at)
		VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
		id, str(body["owner_id"]), str(body["name"]), str(body["category"]), str(body["description"]),
		str(body["website"]), str(body["phone"]), str(body["email"]), str(body["address"]), str(body["logo_url"]), str(body["region"]),
		boolInt(isVIP), boolInt(isActive), now, now)
	if err != nil {
		errJSON(w, http.StatusInternalServerError, "server_error")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"id": id})
}

func (a *API) AdminDeleteBusiness(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	_, _ = a.DB.Exec(`DELETE FROM businesses WHERE id=?`, id)
	writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
}

func (a *API) AdminReviewSubmission(w http.ResponseWriter, r *http.Request) {
	var body map[string]any
	if err := readJSON(r, &body); err != nil {
		errJSON(w, http.StatusBadRequest, "invalid_input")
		return
	}
	id, _ := body["id"].(string)
	status, _ := body["status"].(string)
	now := time.Now().UTC().Format(time.RFC3339)
	adminID := middleware.UserID(r)
	_, _ = a.DB.Exec(`UPDATE business_submissions SET status=?, admin_note=?, reviewed_at=?, reviewed_by=?, updated_at=? WHERE id=?`,
		status, str(body["admin_note"]), now, adminID, now, id)

	if status == "approved" {
		var sub map[string]any
		rows, _ := a.DB.Query(`SELECT * FROM business_submissions WHERE id=?`, id)
		if rows != nil {
			defer rows.Close()
			list, _ := scanRows(rows)
			if len(list) > 0 {
				sub = list[0]
			}
		}
		if sub != nil {
			bid := uuid.NewString()
			_, _ = a.DB.Exec(`INSERT INTO businesses (id, owner_id, name, category, description, website, phone, email, address, logo_url, is_active, created_at, updated_at)
				VALUES (?,?,?,?,?,?,?,?,?,?,1,?,?)`,
				bid, str(sub["owner_id"]), str(sub["name"]), str(sub["category"]), str(sub["description"]),
				str(sub["website"]), str(sub["phone"]), str(sub["email"]), str(sub["address"]), str(sub["logo_url"]), now, now)
		}
	}
	writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
}

func (a *API) AdminUpsertEvent(w http.ResponseWriter, r *http.Request) {
	var body map[string]any
	if err := readJSON(r, &body); err != nil {
		errJSON(w, http.StatusBadRequest, "invalid_input")
		return
	}
	now := time.Now().UTC().Format(time.RFC3339)
	id, _ := body["id"].(string)
	spotsTotal := num(body["spots_total"])
	if spotsTotal == 0 {
		spotsTotal = 100
	}
	spotsRemaining := num(body["spots_remaining"])
	if spotsRemaining == 0 && id == "" {
		spotsRemaining = spotsTotal
	}
	if id != "" {
		_, err := a.DB.Exec(`UPDATE events SET title=?, description=?, category=?, location=?, event_date=?, event_time=?, price_usd=?, spots_total=?, spots_remaining=?, image_url=?, is_featured=?, is_active=?, updated_at=? WHERE id=?`,
			str(body["title"]), str(body["description"]), str(body["category"]), str(body["location"]),
			str(body["event_date"]), str(body["event_time"]), num(body["price_usd"]), spotsTotal, spotsRemaining,
			str(body["image_url"]), boolInt(boolVal(body["is_featured"])), boolInt(boolVal(body["is_active"])), now, id)
		if err != nil {
			errJSON(w, http.StatusInternalServerError, "server_error")
			return
		}
		writeJSON(w, http.StatusOK, map[string]any{"id": id})
		return
	}
	id = uuid.NewString()
	_, err := a.DB.Exec(`INSERT INTO events (id, title, description, category, location, event_date, event_time, price_usd, spots_total, spots_remaining, image_url, is_featured, is_active, created_at, updated_at)
		VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
		id, str(body["title"]), str(body["description"]), str(body["category"]), str(body["location"]),
		str(body["event_date"]), str(body["event_time"]), num(body["price_usd"]), spotsTotal, spotsRemaining,
		str(body["image_url"]), boolInt(boolVal(body["is_featured"])), boolInt(boolVal(body["is_active"])), now, now)
	if err != nil {
		errJSON(w, http.StatusInternalServerError, "server_error")
		return
	}

	// Notify business owners about new active events
	if boolVal(body["is_active"]) {
		title := "Yangi tadbir"
		evTitle := str(body["title"])
		when := strings.TrimSpace(str(body["event_date"]))
		msg := evTitle
		if when != "" {
			msg = evTitle + " — " + when
		}
		notifyUsersByRole(a.DB, "business_owner", "new_event", title, msg, "/tadbirlar")
	}
	writeJSON(w, http.StatusOK, map[string]any{"id": id})
}

func (a *API) AdminDeleteEvent(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	_, _ = a.DB.Exec(`DELETE FROM events WHERE id=?`, id)
	writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
}

func (a *API) AdminSendNotifications(w http.ResponseWriter, r *http.Request) {
	var body struct {
		UserIDs []string `json:"user_ids"`
		Type    string   `json:"type"`
		Title   string   `json:"title"`
		Body    string   `json:"body"`
		Link    string   `json:"link"`
	}
	if err := readJSON(r, &body); err != nil || len(body.UserIDs) == 0 {
		errJSON(w, http.StatusBadRequest, "invalid_input")
		return
	}
	now := time.Now().UTC().Format(time.RFC3339)
	for _, uid := range body.UserIDs {
		nid := uuid.NewString()
		_, _ = a.DB.Exec(`INSERT INTO notifications (id, user_id, type, title, body, link, is_read, created_at) VALUES (?,?,?,?,?,?,0,?)`,
			nid, uid, body.Type, body.Title, body.Body, body.Link, now)
	}
	writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
}

func (a *API) AdminHeroLeads(w http.ResponseWriter, r *http.Request) {
	rows, err := a.DB.Query(`SELECT * FROM hero_leads ORDER BY created_at DESC LIMIT 500`)
	if err != nil {
		errJSON(w, http.StatusInternalServerError, "server_error")
		return
	}
	defer rows.Close()
	data, _ := scanRows(rows)
	writeJSON(w, http.StatusOK, data)
}

func (a *API) AdminDeleteHeroLead(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	_, _ = a.DB.Exec(`DELETE FROM hero_leads WHERE id=?`, id)
	writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
}

func (a *API) AdminImportHeroLeads(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Leads []struct {
			Email string `json:"email"`
		} `json:"leads"`
	}
	if err := readJSON(r, &body); err != nil {
		errJSON(w, http.StatusBadRequest, "invalid_input")
		return
	}
	now := time.Now().UTC().Format(time.RFC3339)
	for _, l := range body.Leads {
		if l.Email == "" {
			continue
		}
		id := uuid.NewString()
		_, err := a.DB.Exec(`INSERT OR IGNORE INTO hero_leads (id, email, created_at) VALUES (?,?,?)`, id, strings.TrimSpace(l.Email), now)
		if err != nil {
			_, _ = a.DB.Exec(`INSERT INTO hero_leads (id, email, created_at) SELECT ?,?,? WHERE NOT EXISTS (SELECT 1 FROM hero_leads WHERE lower(email)=lower(?))`,
				id, strings.TrimSpace(l.Email), now, l.Email)
		}
	}
	writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
}

func (a *API) AdminCampaigns(w http.ResponseWriter, r *http.Request) {
	rows, err := a.DB.Query(`SELECT * FROM email_campaigns ORDER BY created_at DESC LIMIT 100`)
	if err != nil {
		errJSON(w, http.StatusInternalServerError, "server_error")
		return
	}
	defer rows.Close()
	campaigns, _ := scanRows(rows)

	ids := []string{}
	for _, c := range campaigns {
		if id, ok := c["id"].(string); ok {
			ids = append(ids, id)
		}
	}
	opens := map[string]int{}
	clicks := map[string]int{}
	if len(ids) > 0 {
		placeholders := strings.Repeat("?,", len(ids))
		placeholders = placeholders[:len(placeholders)-1]
		args := make([]any, len(ids))
		for i, id := range ids {
			args[i] = id
		}
		orows, _ := a.DB.Query(`SELECT campaign_id, COUNT(*) FROM campaign_opens WHERE campaign_id IN (`+placeholders+`) GROUP BY campaign_id`, args...)
		if orows != nil {
			for orows.Next() {
				var cid string
				var cnt int
				_ = orows.Scan(&cid, &cnt)
				opens[cid] = cnt
			}
			orows.Close()
		}
		crows, _ := a.DB.Query(`SELECT campaign_id, COUNT(*) FROM campaign_clicks WHERE campaign_id IN (`+placeholders+`) GROUP BY campaign_id`, args...)
		if crows != nil {
			for crows.Next() {
				var cid string
				var cnt int
				_ = crows.Scan(&cid, &cnt)
				clicks[cid] = cnt
			}
			crows.Close()
		}
	}
	for _, c := range campaigns {
		id, _ := c["id"].(string)
		c["open_count"] = opens[id]
		c["click_count"] = clicks[id]
	}
	writeJSON(w, http.StatusOK, campaigns)
}

func (a *API) AdminCreateCampaign(w http.ResponseWriter, r *http.Request) {
	var body map[string]any
	if err := readJSON(r, &body); err != nil {
		errJSON(w, http.StatusBadRequest, "invalid_input")
		return
	}
	id := uuid.NewString()
	now := time.Now().UTC().Format(time.RFC3339)
	_, err := a.DB.Exec(`INSERT INTO email_campaigns (id, subject, body, scheduled_at, status, target_source, created_at) VALUES (?,?,?,?,?,?,?)`,
		id, str(body["subject"]), str(body["body"]), str(body["scheduled_at"]), "scheduled", str(body["target_source"]), now)
	if err != nil {
		errJSON(w, http.StatusInternalServerError, "server_error")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"id": id})
}

func (a *API) AdminCancelCampaign(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	_, _ = a.DB.Exec(`UPDATE email_campaigns SET status='cancelled' WHERE id=? AND status='scheduled'`, id)
	writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
}

func (a *API) AdminMembershipsForUsers(w http.ResponseWriter, r *http.Request) {
	ids := strings.Split(r.URL.Query().Get("user_ids"), ",")
	if len(ids) == 0 {
		writeJSON(w, http.StatusOK, []any{})
		return
	}
	placeholders := strings.Repeat("?,", len(ids))
	placeholders = placeholders[:len(placeholders)-1]
	args := make([]any, len(ids))
	for i, id := range ids {
		args[i] = id
	}
	rows, err := a.DB.Query(`SELECT * FROM memberships WHERE user_id IN (`+placeholders+`)`, args...)
	if err != nil {
		errJSON(w, http.StatusInternalServerError, "server_error")
		return
	}
	defer rows.Close()
	data, _ := scanRows(rows)
	writeJSON(w, http.StatusOK, data)
}

func boolVal(v any) bool {
	switch t := v.(type) {
	case bool:
		return t
	case float64:
		return t != 0
	default:
		return false
	}
}

func boolInt(b bool) int {
	if b {
		return 1
	}
	return 0
}

func num(v any) float64 {
	switch t := v.(type) {
	case float64:
		return t
	case int:
		return float64(t)
	default:
		return 0
	}
}

func (a *API) GenericUpdate(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Table  string         `json:"table"`
		ID     string         `json:"id"`
		Values map[string]any `json:"values"`
	}
	if err := readJSON(r, &body); err != nil || body.Table == "" || body.ID == "" {
		errJSON(w, http.StatusBadRequest, "invalid_input")
		return
	}
	allowed := map[string]bool{"profiles": true, "users": true, "business_submissions": true, "orders": true}
	table := body.Table
	if table == "profiles" {
		table = "users"
	}
	if !allowed[table] {
		errJSON(w, http.StatusBadRequest, "invalid_table")
		return
	}
	for k, v := range body.Values {
		if k == "id" {
			continue
		}
		_, _ = a.DB.Exec(`UPDATE `+table+` SET `+k+`=? WHERE id=?`, v, body.ID)
	}
	writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
}
