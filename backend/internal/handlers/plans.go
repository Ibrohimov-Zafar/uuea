package handlers

import (
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"github.com/google/uuid"
)

// Super admin: create/update membership plan
func (a *API) AdminUpsertPlan(w http.ResponseWriter, r *http.Request) {
	var body struct {
		ID       *int    `json:"id"`
		Slug     string  `json:"slug"`
		Name     string  `json:"name"`
		PriceUSD float64 `json:"price_usd"`
		Features any     `json:"features"` // []string
	}
	if err := readJSON(r, &body); err != nil {
		errJSON(w, http.StatusBadRequest, "invalid_input")
		return
	}
	body.Slug = strings.TrimSpace(body.Slug)
	body.Name = strings.TrimSpace(body.Name)
	if body.Slug == "" || body.Name == "" || body.PriceUSD <= 0 {
		errJSON(w, http.StatusBadRequest, "invalid_input")
		return
	}
	featJSON := "[]"
	if body.Features != nil {
		if b, err := json.Marshal(body.Features); err == nil {
			featJSON = string(b)
		}
	}
	now := time.Now().UTC().Format(time.RFC3339)

	// We keep schema with integer autoincrement id; updating by slug (unique) is simplest.
	_, err := a.DB.Exec(`
		INSERT INTO membership_plans (slug, name, price_usd, features, created_at)
		VALUES (?,?,?,?,?)
		ON CONFLICT(slug) DO UPDATE SET
		  name=excluded.name,
		  price_usd=excluded.price_usd,
		  features=excluded.features
	`, body.Slug, body.Name, body.PriceUSD, featJSON, now)
	if err != nil {
		errJSON(w, http.StatusInternalServerError, "server_error")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"ok": true, "slug": body.Slug})
}

func (a *API) AdminDeletePlan(w http.ResponseWriter, r *http.Request) {
	slug := strings.TrimSpace(r.URL.Query().Get("slug"))
	if slug == "" {
		errJSON(w, http.StatusBadRequest, "invalid_input")
		return
	}
	_, _ = a.DB.Exec(`DELETE FROM membership_plans WHERE slug=?`, slug)
	writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
}

// not used currently; kept for future expansions
func newID() string { return uuid.NewString() }

