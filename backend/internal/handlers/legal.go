package handlers

import (
	"net/http"
	"strings"
	"time"

	"github.com/google/uuid"
)

func (a *API) ListLegalResources(w http.ResponseWriter, r *http.Request) {
	q := `SELECT * FROM legal_resources WHERE status='published' ORDER BY published_date DESC, created_at DESC LIMIT 100`
	rows, err := a.DB.Query(q)
	if err != nil {
		errJSON(w, http.StatusInternalServerError, "server_error")
		return
	}
	defer rows.Close()
	data, _ := scanRows(rows)
	writeJSON(w, http.StatusOK, data)
}

func (a *API) GetLegalResource(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	if id == "" {
		errJSON(w, http.StatusBadRequest, "invalid_input")
		return
	}
	rows, err := a.DB.Query(`SELECT * FROM legal_resources WHERE id=? AND status='published'`, id)
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

func (a *API) AdminListLegalResources(w http.ResponseWriter, r *http.Request) {
	rows, err := a.DB.Query(`SELECT * FROM legal_resources ORDER BY published_date DESC, created_at DESC LIMIT 200`)
	if err != nil {
		errJSON(w, http.StatusInternalServerError, "server_error")
		return
	}
	defer rows.Close()
	data, _ := scanRows(rows)
	writeJSON(w, http.StatusOK, data)
}

func (a *API) AdminUpsertLegalResource(w http.ResponseWriter, r *http.Request) {
	var body struct {
		ID            string `json:"id"`
		Title         string `json:"title"`
		TitleRu       string `json:"title_ru"`
		TitleEn       string `json:"title_en"`
		Excerpt       string `json:"excerpt"`
		ExcerptRu     string `json:"excerpt_ru"`
		ExcerptEn     string `json:"excerpt_en"`
		Body          string `json:"body"`
		BodyRu        string `json:"body_ru"`
		BodyEn        string `json:"body_en"`
		Category      string `json:"category"`
		ResourceType  string `json:"resource_type"`
		Source        string `json:"source"`
		SourceURL     string `json:"source_url"`
		PublishedDate string `json:"published_date"`
		IsFeatured    bool   `json:"is_featured"`
		Status        string `json:"status"`
	}
	if err := readJSON(r, &body); err != nil {
		errJSON(w, http.StatusBadRequest, "invalid_input")
		return
	}
	title := strings.TrimSpace(body.Title)
	excerpt := strings.TrimSpace(body.Excerpt)
	content := strings.TrimSpace(body.Body)
	if len(title) < 3 || len(excerpt) < 5 || len(content) < 10 {
		errJSON(w, http.StatusBadRequest, "invalid_input")
		return
	}
	category := strings.TrimSpace(body.Category)
	if category == "" {
		category = "Boshqa"
	}
	rtype := strings.TrimSpace(body.ResourceType)
	if rtype == "" {
		rtype = "law"
	}
	source := strings.TrimSpace(body.Source)
	if source == "" {
		source = "UUEA"
	}
	sourceURL := nullIfEmpty(strings.TrimSpace(body.SourceURL))
	pubDate := strings.TrimSpace(body.PublishedDate)
	if pubDate == "" {
		pubDate = time.Now().UTC().Format("2006-01-02")
	}
	status := strings.TrimSpace(body.Status)
	if status != "draft" {
		status = "published"
	}
	feat := 0
	if body.IsFeatured {
		feat = 1
	}
	titleRu := nullIfEmpty(strings.TrimSpace(body.TitleRu))
	titleEn := nullIfEmpty(strings.TrimSpace(body.TitleEn))
	excerptRu := nullIfEmpty(strings.TrimSpace(body.ExcerptRu))
	excerptEn := nullIfEmpty(strings.TrimSpace(body.ExcerptEn))
	bodyRu := nullIfEmpty(strings.TrimSpace(body.BodyRu))
	bodyEn := nullIfEmpty(strings.TrimSpace(body.BodyEn))
	now := time.Now().UTC().Format(time.RFC3339)
	id := strings.TrimSpace(body.ID)
	if id == "" {
		id = uuid.NewString()
		_, err := a.DB.Exec(`INSERT INTO legal_resources (id, title, title_ru, title_en, excerpt, excerpt_ru, excerpt_en, body, body_ru, body_en, category, resource_type, source, source_url, published_date, is_featured, status, created_at, updated_at)
			VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
			id, title, titleRu, titleEn, excerpt, excerptRu, excerptEn, content, bodyRu, bodyEn, category, rtype, source, sourceURL, pubDate, feat, status, now, now)
		if err != nil {
			errJSON(w, http.StatusInternalServerError, "server_error")
			return
		}
		writeJSON(w, http.StatusOK, map[string]any{"id": id, "created": true})
		return
	}
	_, err := a.DB.Exec(`UPDATE legal_resources SET title=?, title_ru=?, title_en=?, excerpt=?, excerpt_ru=?, excerpt_en=?, body=?, body_ru=?, body_en=?, category=?, resource_type=?, source=?, source_url=?, published_date=?, is_featured=?, status=?, updated_at=? WHERE id=?`,
		title, titleRu, titleEn, excerpt, excerptRu, excerptEn, content, bodyRu, bodyEn, category, rtype, source, sourceURL, pubDate, feat, status, now, id)
	if err != nil {
		errJSON(w, http.StatusInternalServerError, "server_error")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"id": id, "created": false})
}

func (a *API) AdminDeleteLegalResource(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	if id == "" {
		errJSON(w, http.StatusBadRequest, "invalid_input")
		return
	}
	_, _ = a.DB.Exec(`DELETE FROM legal_resources WHERE id=?`, id)
	writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
}
