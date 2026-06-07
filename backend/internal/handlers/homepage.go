package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/google/uuid"
)

// ─── Partners ────────────────────────────────────────────────────────────────

func (a *API) ListPartners(w http.ResponseWriter, r *http.Request) {
	rows, err := a.DB.Query(`SELECT id, name, name_ru, name_en, description, description_ru, description_en, logo_url, website, sort_order, created_at, updated_at
		FROM partners WHERE is_active=1 ORDER BY sort_order, name`)
	if err != nil {
		errJSON(w, http.StatusInternalServerError, "server_error")
		return
	}
	defer rows.Close()
	data, _ := scanRows(rows)
	writeJSON(w, http.StatusOK, data)
}

func (a *API) AdminListPartners(w http.ResponseWriter, r *http.Request) {
	rows, err := a.DB.Query(`SELECT id, name, name_ru, name_en, description, description_ru, description_en, logo_url, website, sort_order, is_active, created_at, updated_at
		FROM partners ORDER BY sort_order, name`)
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
		ID            string `json:"id"`
		Name          string `json:"name"`
		NameRu        string `json:"name_ru"`
		NameEn        string `json:"name_en"`
		Description   string `json:"description"`
		DescriptionRu string `json:"description_ru"`
		DescriptionEn string `json:"description_en"`
		LogoURL       string `json:"logo_url"`
		Website       string `json:"website"`
		SortOrder     int    `json:"sort_order"`
		IsActive      *bool  `json:"is_active"`
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
		_, err := a.DB.Exec(`INSERT INTO partners (id, name, name_ru, name_en, description, description_ru, description_en, logo_url, website, sort_order, is_active, created_at, updated_at)
			VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
			body.ID, body.Name, body.NameRu, body.NameEn, body.Description, body.DescriptionRu, body.DescriptionEn, body.LogoURL, body.Website, body.SortOrder, isActive, now, now)
		if err != nil {
			errJSON(w, http.StatusInternalServerError, "server_error")
			return
		}
	} else {
		_, err := a.DB.Exec(`UPDATE partners SET name=?, name_ru=?, name_en=?, description=?, description_ru=?, description_en=?, logo_url=?, website=?, sort_order=?, is_active=?, updated_at=? WHERE id=?`,
			body.Name, body.NameRu, body.NameEn, body.Description, body.DescriptionRu, body.DescriptionEn, body.LogoURL, body.Website, body.SortOrder, isActive, now, body.ID)
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

// ─── Team Members ─────────────────────────────────────────────────────────────

func (a *API) ListTeamMembers(w http.ResponseWriter, r *http.Request) {
	rows, err := a.DB.Query(`SELECT id, name, role, role_ru, role_en, bio, bio_ru, bio_en, avatar, photo_url, linkedin, sort_order, created_at
		FROM team_members WHERE is_active=1 ORDER BY sort_order, name`)
	if err != nil {
		errJSON(w, http.StatusInternalServerError, "server_error")
		return
	}
	defer rows.Close()
	data, _ := scanRows(rows)
	writeJSON(w, http.StatusOK, data)
}

func (a *API) AdminListTeamMembers(w http.ResponseWriter, r *http.Request) {
	rows, err := a.DB.Query(`SELECT id, name, role, role_ru, role_en, bio, bio_ru, bio_en, avatar, photo_url, linkedin, sort_order, is_active, created_at, updated_at
		FROM team_members ORDER BY sort_order, name`)
	if err != nil {
		errJSON(w, http.StatusInternalServerError, "server_error")
		return
	}
	defer rows.Close()
	data, _ := scanRows(rows)
	writeJSON(w, http.StatusOK, data)
}

func (a *API) AdminUpsertTeamMember(w http.ResponseWriter, r *http.Request) {
	var body struct {
		ID       string `json:"id"`
		Name     string `json:"name"`
		Role     string `json:"role"`
		RoleRu   string `json:"role_ru"`
		RoleEn   string `json:"role_en"`
		Bio      string `json:"bio"`
		BioRu    string `json:"bio_ru"`
		BioEn    string `json:"bio_en"`
		Avatar   string `json:"avatar"`
		PhotoURL string `json:"photo_url"`
		LinkedIn string `json:"linkedin"`
		SortOrder int   `json:"sort_order"`
		IsActive  *bool `json:"is_active"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.Name == "" || body.Role == "" {
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
		_, err := a.DB.Exec(`INSERT INTO team_members (id, name, role, role_ru, role_en, bio, bio_ru, bio_en, avatar, photo_url, linkedin, sort_order, is_active, created_at, updated_at)
			VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
			body.ID, body.Name, body.Role, body.RoleRu, body.RoleEn, body.Bio, body.BioRu, body.BioEn, body.Avatar, body.PhotoURL, body.LinkedIn, body.SortOrder, isActive, now, now)
		if err != nil {
			errJSON(w, http.StatusInternalServerError, "server_error")
			return
		}
	} else {
		_, err := a.DB.Exec(`UPDATE team_members SET name=?, role=?, role_ru=?, role_en=?, bio=?, bio_ru=?, bio_en=?, avatar=?, photo_url=?, linkedin=?, sort_order=?, is_active=?, updated_at=? WHERE id=?`,
			body.Name, body.Role, body.RoleRu, body.RoleEn, body.Bio, body.BioRu, body.BioEn, body.Avatar, body.PhotoURL, body.LinkedIn, body.SortOrder, isActive, now, body.ID)
		if err != nil {
			errJSON(w, http.StatusInternalServerError, "server_error")
			return
		}
	}
	writeJSON(w, http.StatusOK, map[string]string{"id": body.ID})
}

func (a *API) AdminDeleteTeamMember(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	if id == "" {
		errJSON(w, http.StatusBadRequest, "bad_request")
		return
	}
	a.DB.Exec(`DELETE FROM team_members WHERE id=?`, id)
	writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
}

// ─── Timeline Events ──────────────────────────────────────────────────────────

func (a *API) ListTimelineEvents(w http.ResponseWriter, r *http.Request) {
	rows, err := a.DB.Query(`SELECT id, year, title, title_ru, title_en, description, description_ru, description_en, sort_order
		FROM timeline_events WHERE is_active=1 ORDER BY sort_order, year`)
	if err != nil {
		errJSON(w, http.StatusInternalServerError, "server_error")
		return
	}
	defer rows.Close()
	data, _ := scanRows(rows)
	writeJSON(w, http.StatusOK, data)
}

func (a *API) AdminListTimelineEvents(w http.ResponseWriter, r *http.Request) {
	rows, err := a.DB.Query(`SELECT id, year, title, title_ru, title_en, description, description_ru, description_en, sort_order, is_active, created_at, updated_at
		FROM timeline_events ORDER BY sort_order, year`)
	if err != nil {
		errJSON(w, http.StatusInternalServerError, "server_error")
		return
	}
	defer rows.Close()
	data, _ := scanRows(rows)
	writeJSON(w, http.StatusOK, data)
}

func (a *API) AdminUpsertTimelineEvent(w http.ResponseWriter, r *http.Request) {
	var body struct {
		ID            string `json:"id"`
		Year          string `json:"year"`
		Title         string `json:"title"`
		TitleRu       string `json:"title_ru"`
		TitleEn       string `json:"title_en"`
		Description   string `json:"description"`
		DescriptionRu string `json:"description_ru"`
		DescriptionEn string `json:"description_en"`
		SortOrder     int    `json:"sort_order"`
		IsActive      *bool  `json:"is_active"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.Year == "" || body.Title == "" {
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
		_, err := a.DB.Exec(`INSERT INTO timeline_events (id, year, title, title_ru, title_en, description, description_ru, description_en, sort_order, is_active, created_at, updated_at)
			VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
			body.ID, body.Year, body.Title, body.TitleRu, body.TitleEn, body.Description, body.DescriptionRu, body.DescriptionEn, body.SortOrder, isActive, now, now)
		if err != nil {
			errJSON(w, http.StatusInternalServerError, "server_error")
			return
		}
	} else {
		_, err := a.DB.Exec(`UPDATE timeline_events SET year=?, title=?, title_ru=?, title_en=?, description=?, description_ru=?, description_en=?, sort_order=?, is_active=?, updated_at=? WHERE id=?`,
			body.Year, body.Title, body.TitleRu, body.TitleEn, body.Description, body.DescriptionRu, body.DescriptionEn, body.SortOrder, isActive, now, body.ID)
		if err != nil {
			errJSON(w, http.StatusInternalServerError, "server_error")
			return
		}
	}
	writeJSON(w, http.StatusOK, map[string]string{"id": body.ID})
}

func (a *API) AdminDeleteTimelineEvent(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	if id == "" {
		errJSON(w, http.StatusBadRequest, "bad_request")
		return
	}
	a.DB.Exec(`DELETE FROM timeline_events WHERE id=?`, id)
	writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
}

// ─── Site About (Tashkilot Haqida) ────────────────────────────────────────────

func scanSiteAboutRow(row map[string]any) map[string]any {
	if s, ok := row["stats"].(string); ok {
		var parsed any
		if json.Unmarshal([]byte(s), &parsed) == nil {
			row["stats"] = parsed
		}
	}
	return row
}

func (a *API) GetSiteAbout(w http.ResponseWriter, r *http.Request) {
	rows, err := a.DB.Query(`SELECT id, badge, badge_ru, badge_en, title, title_ru, title_en, para1, para1_ru, para1_en, para2, para2_ru, para2_en, image_url, stats, updated_at FROM site_about WHERE id='default'`)
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
	writeJSON(w, http.StatusOK, scanSiteAboutRow(data[0]))
}

func (a *API) AdminUpsertSiteAbout(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Badge    string `json:"badge"`
		BadgeRu  string `json:"badge_ru"`
		BadgeEn  string `json:"badge_en"`
		Title    string `json:"title"`
		TitleRu  string `json:"title_ru"`
		TitleEn  string `json:"title_en"`
		Para1    string `json:"para1"`
		Para1Ru  string `json:"para1_ru"`
		Para1En  string `json:"para1_en"`
		Para2    string `json:"para2"`
		Para2Ru  string `json:"para2_ru"`
		Para2En  string `json:"para2_en"`
		ImageURL string `json:"image_url"`
		Stats    []struct {
			Value   string `json:"value"`
			Label   string `json:"label"`
			LabelRu string `json:"label_ru"`
			LabelEn string `json:"label_en"`
			SortOrder int  `json:"sort_order"`
		} `json:"stats"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.Badge == "" || body.Title == "" {
		errJSON(w, http.StatusBadRequest, "bad_request")
		return
	}
	now := time.Now().UTC().Format(time.RFC3339)
	statsJSON, _ := json.Marshal(body.Stats)
	var n int
	_ = a.DB.QueryRow(`SELECT COUNT(*) FROM site_about WHERE id='default'`).Scan(&n)
	if n == 0 {
		_, err := a.DB.Exec(`INSERT INTO site_about (id, badge, badge_ru, badge_en, title, title_ru, title_en, para1, para1_ru, para1_en, para2, para2_ru, para2_en, image_url, stats, updated_at)
			VALUES ('default',?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
			body.Badge, body.BadgeRu, body.BadgeEn, body.Title, body.TitleRu, body.TitleEn,
			body.Para1, body.Para1Ru, body.Para1En, body.Para2, body.Para2Ru, body.Para2En,
			body.ImageURL, string(statsJSON), now)
		if err != nil {
			errJSON(w, http.StatusInternalServerError, "server_error")
			return
		}
	} else {
		_, err := a.DB.Exec(`UPDATE site_about SET badge=?, badge_ru=?, badge_en=?, title=?, title_ru=?, title_en=?, para1=?, para1_ru=?, para1_en=?, para2=?, para2_ru=?, para2_en=?, image_url=?, stats=?, updated_at=? WHERE id='default'`,
			body.Badge, body.BadgeRu, body.BadgeEn, body.Title, body.TitleRu, body.TitleEn,
			body.Para1, body.Para1Ru, body.Para1En, body.Para2, body.Para2Ru, body.Para2En,
			body.ImageURL, string(statsJSON), now)
		if err != nil {
			errJSON(w, http.StatusInternalServerError, "server_error")
			return
		}
	}
	writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
}

// ─── Site Mission (Missiya va Vizyon) ─────────────────────────────────────────

func scanSiteMissionRow(row map[string]any) map[string]any {
	if s, ok := row["cards"].(string); ok {
		var parsed any
		if json.Unmarshal([]byte(s), &parsed) == nil {
			row["cards"] = parsed
		}
	}
	return row
}

func (a *API) GetSiteMission(w http.ResponseWriter, r *http.Request) {
	rows, err := a.DB.Query(`SELECT id, badge, badge_ru, badge_en, title, title_ru, title_en, cards, updated_at FROM site_mission WHERE id='default'`)
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
	writeJSON(w, http.StatusOK, scanSiteMissionRow(data[0]))
}

func (a *API) AdminUpsertSiteMission(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Badge   string `json:"badge"`
		BadgeRu string `json:"badge_ru"`
		BadgeEn string `json:"badge_en"`
		Title   string `json:"title"`
		TitleRu string `json:"title_ru"`
		TitleEn string `json:"title_en"`
		Cards   []struct {
			Icon      string `json:"icon"`
			Title     string `json:"title"`
			TitleRu   string `json:"title_ru"`
			TitleEn   string `json:"title_en"`
			Text      string `json:"text"`
			TextRu    string `json:"text_ru"`
			TextEn    string `json:"text_en"`
			SortOrder int    `json:"sort_order"`
		} `json:"cards"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.Badge == "" || body.Title == "" {
		errJSON(w, http.StatusBadRequest, "bad_request")
		return
	}
	now := time.Now().UTC().Format(time.RFC3339)
	cardsJSON, _ := json.Marshal(body.Cards)
	var n int
	_ = a.DB.QueryRow(`SELECT COUNT(*) FROM site_mission WHERE id='default'`).Scan(&n)
	if n == 0 {
		_, err := a.DB.Exec(`INSERT INTO site_mission (id, badge, badge_ru, badge_en, title, title_ru, title_en, cards, updated_at)
			VALUES ('default',?,?,?,?,?,?,?,?)`,
			body.Badge, body.BadgeRu, body.BadgeEn, body.Title, body.TitleRu, body.TitleEn, string(cardsJSON), now)
		if err != nil {
			errJSON(w, http.StatusInternalServerError, "server_error")
			return
		}
	} else {
		_, err := a.DB.Exec(`UPDATE site_mission SET badge=?, badge_ru=?, badge_en=?, title=?, title_ru=?, title_en=?, cards=?, updated_at=? WHERE id='default'`,
			body.Badge, body.BadgeRu, body.BadgeEn, body.Title, body.TitleRu, body.TitleEn, string(cardsJSON), now)
		if err != nil {
			errJSON(w, http.StatusInternalServerError, "server_error")
			return
		}
	}
	writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
}
