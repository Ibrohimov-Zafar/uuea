package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/google/uuid"
)

// ─── Partners ────────────────────────────────────────────────────────────────

func (a *API) ListPartners(w http.ResponseWriter, r *http.Request) {
	rows, err := a.DB.Query(`SELECT id, name, logo_url, website, sort_order, is_active, created_at, updated_at
		FROM partners WHERE is_active=1 ORDER BY sort_order, name`)
	if err != nil {
		errJSON(w, http.StatusInternalServerError, "server_error")
		return
	}
	defer rows.Close()
	data, _ := scanRows(rows)
	writeJSON(w, http.StatusOK, data)
}

func (a *API) AdminUpsertPartner(w http.ResponseWriter, r *http.Request) {
	var body struct {
		ID         string `json:"id"`
		Name       string `json:"name"`
		LogoURL    string `json:"logo_url"`
		Website    string `json:"website"`
		SortOrder  int    `json:"sort_order"`
		IsActive   *bool  `json:"is_active"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.Name == "" {
		errJSON(w, http.StatusBadRequest, "bad_request")
		return
	}
	now := time.Now().UTC().Format(time.RFC3339)
	isActive := 1
	if body.IsActive != nil && !*body.IsActive {
		isActive = 0
	}
	if body.ID == "" {
		body.ID = uuid.NewString()
		_, err := a.DB.Exec(`INSERT INTO partners (id, name, logo_url, website, sort_order, is_active, created_at, updated_at)
			VALUES (?,?,?,?,?,?,?,?)`,
			body.ID, body.Name, body.LogoURL, body.Website, body.SortOrder, isActive, now, now)
		if err != nil {
			errJSON(w, http.StatusInternalServerError, "server_error")
			return
		}
	} else {
		_, err := a.DB.Exec(`UPDATE partners SET name=?, logo_url=?, website=?, sort_order=?, is_active=?, updated_at=? WHERE id=?`,
			body.Name, body.LogoURL, body.Website, body.SortOrder, isActive, now, body.ID)
		if err != nil {
			errJSON(w, http.StatusInternalServerError, "server_error")
			return
		}
	}
	writeJSON(w, http.StatusOK, map[string]string{"id": body.ID})
}

func (a *API) AdminDeletePartner(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	if id == "" {
		errJSON(w, http.StatusBadRequest, "bad_request")
		return
	}
	a.DB.Exec(`DELETE FROM partners WHERE id=?`, id)
	writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
}

// ─── Testimonials ─────────────────────────────────────────────────────────────

func (a *API) ListTestimonials(w http.ResponseWriter, r *http.Request) {
	rows, err := a.DB.Query(`SELECT id, name, company, role, review, avatar, rating, sort_order, created_at
		FROM testimonials WHERE is_active=1 ORDER BY sort_order, created_at`)
	if err != nil {
		errJSON(w, http.StatusInternalServerError, "server_error")
		return
	}
	defer rows.Close()
	data, _ := scanRows(rows)
	writeJSON(w, http.StatusOK, data)
}

func (a *API) AdminUpsertTestimonial(w http.ResponseWriter, r *http.Request) {
	var body struct {
		ID        string `json:"id"`
		Name      string `json:"name"`
		Company   string `json:"company"`
		Role      string `json:"role"`
		Review    string `json:"review"`
		Avatar    string `json:"avatar"`
		Rating    int    `json:"rating"`
		SortOrder int    `json:"sort_order"`
		IsActive  *bool  `json:"is_active"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.Name == "" || body.Review == "" {
		errJSON(w, http.StatusBadRequest, "bad_request")
		return
	}
	now := time.Now().UTC().Format(time.RFC3339)
	if body.Rating < 1 || body.Rating > 5 {
		body.Rating = 5
	}
	isActive := 1
	if body.IsActive != nil && !*body.IsActive {
		isActive = 0
	}
	if body.ID == "" {
		body.ID = uuid.NewString()
		_, err := a.DB.Exec(`INSERT INTO testimonials (id, name, company, role, review, avatar, rating, sort_order, is_active, created_at, updated_at)
			VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
			body.ID, body.Name, body.Company, body.Role, body.Review, body.Avatar, body.Rating, body.SortOrder, isActive, now, now)
		if err != nil {
			errJSON(w, http.StatusInternalServerError, "server_error")
			return
		}
	} else {
		_, err := a.DB.Exec(`UPDATE testimonials SET name=?, company=?, role=?, review=?, avatar=?, rating=?, sort_order=?, is_active=?, updated_at=? WHERE id=?`,
			body.Name, body.Company, body.Role, body.Review, body.Avatar, body.Rating, body.SortOrder, isActive, now, body.ID)
		if err != nil {
			errJSON(w, http.StatusInternalServerError, "server_error")
			return
		}
	}
	writeJSON(w, http.StatusOK, map[string]string{"id": body.ID})
}

func (a *API) AdminDeleteTestimonial(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	if id == "" {
		errJSON(w, http.StatusBadRequest, "bad_request")
		return
	}
	a.DB.Exec(`DELETE FROM testimonials WHERE id=?`, id)
	writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
}

// ─── Site Stats ───────────────────────────────────────────────────────────────

func (a *API) ListSiteStats(w http.ResponseWriter, r *http.Request) {
	rows, err := a.DB.Query(`SELECT id, label, value, suffix, sort_order, updated_at
		FROM site_stats ORDER BY sort_order`)
	if err != nil {
		errJSON(w, http.StatusInternalServerError, "server_error")
		return
	}
	defer rows.Close()
	data, _ := scanRows(rows)
	writeJSON(w, http.StatusOK, data)
}

func (a *API) AdminUpsertSiteStat(w http.ResponseWriter, r *http.Request) {
	var body struct {
		ID        string `json:"id"`
		Label     string `json:"label"`
		Value     int    `json:"value"`
		Suffix    string `json:"suffix"`
		SortOrder int    `json:"sort_order"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.Label == "" {
		errJSON(w, http.StatusBadRequest, "bad_request")
		return
	}
	now := time.Now().UTC().Format(time.RFC3339)
	if body.Suffix == "" {
		body.Suffix = "+"
	}
	if body.ID == "" {
		body.ID = uuid.NewString()
		_, err := a.DB.Exec(`INSERT INTO site_stats (id, label, value, suffix, sort_order, updated_at) VALUES (?,?,?,?,?,?)`,
			body.ID, body.Label, body.Value, body.Suffix, body.SortOrder, now)
		if err != nil {
			errJSON(w, http.StatusInternalServerError, "server_error")
			return
		}
	} else {
		_, err := a.DB.Exec(`UPDATE site_stats SET label=?, value=?, suffix=?, sort_order=?, updated_at=? WHERE id=?`,
			body.Label, body.Value, body.Suffix, body.SortOrder, now, body.ID)
		if err != nil {
			errJSON(w, http.StatusInternalServerError, "server_error")
			return
		}
	}
	writeJSON(w, http.StatusOK, map[string]string{"id": body.ID})
}

func (a *API) AdminDeleteSiteStat(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	if id == "" {
		errJSON(w, http.StatusBadRequest, "bad_request")
		return
	}
	a.DB.Exec(`DELETE FROM site_stats WHERE id=?`, id)
	writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
}

// ─── Site Services ────────────────────────────────────────────────────────────

func (a *API) ListSiteServices(w http.ResponseWriter, r *http.Request) {
	rows, err := a.DB.Query(`SELECT id, icon, title, subtitle, description, features, sort_order, created_at
		FROM site_services WHERE is_active=1 ORDER BY sort_order`)
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

func (a *API) AdminUpsertSiteService(w http.ResponseWriter, r *http.Request) {
	var body struct {
		ID          string   `json:"id"`
		Icon        string   `json:"icon"`
		Title       string   `json:"title"`
		Subtitle    string   `json:"subtitle"`
		Description string   `json:"description"`
		Features    []string `json:"features"`
		SortOrder   int      `json:"sort_order"`
		IsActive    *bool    `json:"is_active"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.Title == "" {
		errJSON(w, http.StatusBadRequest, "bad_request")
		return
	}
	now := time.Now().UTC().Format(time.RFC3339)
	if body.Icon == "" {
		body.Icon = "TrendingUp"
	}
	featJSON, _ := json.Marshal(body.Features)
	isActive := 1
	if body.IsActive != nil && !*body.IsActive {
		isActive = 0
	}
	if body.ID == "" {
		body.ID = uuid.NewString()
		_, err := a.DB.Exec(`INSERT INTO site_services (id, icon, title, subtitle, description, features, sort_order, is_active, created_at, updated_at)
			VALUES (?,?,?,?,?,?,?,?,?,?)`,
			body.ID, body.Icon, body.Title, body.Subtitle, body.Description, string(featJSON), body.SortOrder, isActive, now, now)
		if err != nil {
			errJSON(w, http.StatusInternalServerError, "server_error")
			return
		}
	} else {
		_, err := a.DB.Exec(`UPDATE site_services SET icon=?, title=?, subtitle=?, description=?, features=?, sort_order=?, is_active=?, updated_at=? WHERE id=?`,
			body.Icon, body.Title, body.Subtitle, body.Description, string(featJSON), body.SortOrder, isActive, now, body.ID)
		if err != nil {
			errJSON(w, http.StatusInternalServerError, "server_error")
			return
		}
	}
	writeJSON(w, http.StatusOK, map[string]string{"id": body.ID})
}

func (a *API) AdminDeleteSiteService(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	if id == "" {
		errJSON(w, http.StatusBadRequest, "bad_request")
		return
	}
	a.DB.Exec(`DELETE FROM site_services WHERE id=?`, id)
	writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
}
