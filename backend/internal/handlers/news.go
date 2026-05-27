package handlers

import (
	"net/http"
	"strings"
	"time"

	"github.com/google/uuid"

	"miaoda/backend/internal/middleware"
)

// Public: single approved news post
func (a *API) GetNews(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	if id == "" {
		errJSON(w, http.StatusBadRequest, "invalid_input")
		return
	}
	rows, err := a.DB.Query(`SELECT * FROM news_posts WHERE id=? AND status='approved'`, id)
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

// Public: approved news only
func (a *API) ListNews(w http.ResponseWriter, r *http.Request) {
	q := `SELECT * FROM news_posts WHERE status='approved' ORDER BY published_at DESC, created_at DESC LIMIT 50`
	rows, err := a.DB.Query(q)
	if err != nil {
		errJSON(w, http.StatusInternalServerError, "server_error")
		return
	}
	defer rows.Close()
	data, _ := scanRows(rows)
	writeJSON(w, http.StatusOK, data)
}

// Auth: create pending news
func (a *API) CreateNews(w http.ResponseWriter, r *http.Request) {
	uid := middleware.UserID(r)
	var body struct {
		Title    string  `json:"title"`
		Excerpt  *string `json:"excerpt"`
		Body     string  `json:"body"`
		Category *string `json:"category"`
		ImageURL *string `json:"image_url"`
	}
	if err := readJSON(r, &body); err != nil {
		errJSON(w, http.StatusBadRequest, "invalid_input")
		return
	}
	title := strings.TrimSpace(body.Title)
	content := strings.TrimSpace(body.Body)
	if len(title) < 3 || len(content) < 10 {
		errJSON(w, http.StatusBadRequest, "invalid_input")
		return
	}
	now := time.Now().UTC().Format(time.RFC3339)
	id := uuid.NewString()
	category := "Boshqa"
	if body.Category != nil && strings.TrimSpace(*body.Category) != "" {
		category = strings.TrimSpace(*body.Category)
	}
	_, err := a.DB.Exec(`INSERT INTO news_posts (id, author_id, title, excerpt, body, category, image_url, status, created_at, updated_at)
		VALUES (?,?,?,?,?,?,?,'pending',?,?)`,
		id, nullIfEmpty(uid), title, body.Excerpt, content, category, body.ImageURL, now, now)
	if err != nil {
		errJSON(w, http.StatusInternalServerError, "server_error")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"id": id})
}

// Admin: list all (pending + approved + rejected)
func (a *API) AdminListNews(w http.ResponseWriter, r *http.Request) {
	rows, err := a.DB.Query(`SELECT * FROM news_posts ORDER BY created_at DESC LIMIT 200`)
	if err != nil {
		errJSON(w, http.StatusInternalServerError, "server_error")
		return
	}
	defer rows.Close()
	data, _ := scanRows(rows)
	writeJSON(w, http.StatusOK, data)
}

// Admin: approve/reject news
func (a *API) AdminReviewNews(w http.ResponseWriter, r *http.Request) {
	adminID := middleware.UserID(r)
	var body struct {
		ID         string `json:"id"`
		Status     string `json:"status"` // approved|rejected
		IsFeatured *bool  `json:"is_featured"`
	}
	if err := readJSON(r, &body); err != nil || body.ID == "" {
		errJSON(w, http.StatusBadRequest, "invalid_input")
		return
	}
	if body.Status != "approved" && body.Status != "rejected" {
		errJSON(w, http.StatusBadRequest, "invalid_input")
		return
	}
	now := time.Now().UTC().Format(time.RFC3339)

	publishedAt := any(nil)
	if body.Status == "approved" {
		publishedAt = now
	}
	feat := any(nil)
	if body.IsFeatured != nil {
		if *body.IsFeatured {
			feat = 1
		} else {
			feat = 0
		}
	}
	_, err := a.DB.Exec(`UPDATE news_posts
		SET status=?, approved_by=?, approved_at=?, published_at=COALESCE(?, published_at), is_featured=COALESCE(?, is_featured), updated_at=?
		WHERE id=?`,
		body.Status, nullIfEmpty(adminID), now, publishedAt, feat, now, body.ID)
	if err != nil {
		errJSON(w, http.StatusInternalServerError, "server_error")
		return
	}

	// Notify business owners when a news post is published
	if body.Status == "approved" {
		var title string
		_ = a.DB.QueryRow(`SELECT title FROM news_posts WHERE id=?`, body.ID).Scan(&title)
		if strings.TrimSpace(title) == "" {
			title = "Yangilik"
		}
		notifyUsersByRole(a.DB, "business_owner", "general", "Yangi yangilik", title, "/yangiliklar/"+body.ID)
	}
	writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
}

func (a *API) AdminDeleteNews(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	if id == "" {
		errJSON(w, http.StatusBadRequest, "invalid_input")
		return
	}
	_, _ = a.DB.Exec(`DELETE FROM news_posts WHERE id=?`, id)
	writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
}

