package handlers

import (
	"fmt"
	"net/http"
	"strings"
	"time"
)

var sitemapStaticPaths = []struct {
	path     string
	priority string
	changefreq string
}{
	{"/", "1.0", "weekly"},
	{"/biz-haqimizda", "0.8", "monthly"},
	{"/xizmatlar", "0.8", "monthly"},
	{"/azolik", "0.9", "monthly"},
	{"/korporativ", "0.9", "monthly"},
	{"/qonunlar", "0.8", "weekly"},
	{"/katalog", "0.8", "weekly"},
	{"/tadbirlar", "0.8", "weekly"},
	{"/yangiliklar", "0.8", "daily"},
	{"/aloqa", "0.7", "yearly"},
	{"/qoshilish", "0.9", "monthly"},
}

func (a *API) Sitemap(w http.ResponseWriter, r *http.Request) {
	base := strings.TrimRight(a.SiteURL, "/")
	if base == "" {
		base = strings.TrimRight(a.FrontendOrigin, "/")
	}

	type entry struct {
		loc        string
		lastmod    string
		changefreq string
		priority   string
	}
	var urls []entry
	now := time.Now().UTC().Format("2006-01-02")

	for _, p := range sitemapStaticPaths {
		urls = append(urls, entry{
			loc:        base + p.path,
			lastmod:    now,
			changefreq: p.changefreq,
			priority:   p.priority,
		})
	}

	appendRows := func(prefix string, query string) {
		rows, err := a.DB.Query(query)
		if err != nil {
			return
		}
		defer rows.Close()
		for rows.Next() {
			var id, updated string
			if err := rows.Scan(&id, &updated); err != nil {
				continue
			}
			lm := now
			if len(updated) >= 10 {
				lm = updated[:10]
			}
			urls = append(urls, entry{
				loc:        fmt.Sprintf("%s%s/%s", base, prefix, id),
				lastmod:    lm,
				changefreq: "weekly",
				priority:   "0.6",
			})
		}
	}

	appendRows("/yangiliklar", `SELECT id, COALESCE(updated_at, published_at, created_at) FROM news_posts WHERE status='approved' ORDER BY published_at DESC LIMIT 500`)
	appendRows("/qonunlar", `SELECT id, COALESCE(updated_at, created_at) FROM legal_resources WHERE status='published' ORDER BY published_date DESC LIMIT 500`)
	appendRows("/katalog", `SELECT id, updated_at FROM businesses WHERE is_active=1 ORDER BY updated_at DESC LIMIT 500`)

	w.Header().Set("Content-Type", "application/xml; charset=utf-8")
	w.Header().Set("Cache-Control", "public, max-age=3600")
	var b strings.Builder
	b.WriteString(`<?xml version="1.0" encoding="UTF-8"?>`)
	b.WriteString(`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`)
	for _, u := range urls {
		b.WriteString("<url>")
		b.WriteString("<loc>" + xmlEscape(u.loc) + "</loc>")
		if u.lastmod != "" {
			b.WriteString("<lastmod>" + u.lastmod + "</lastmod>")
		}
		b.WriteString("<changefreq>" + u.changefreq + "</changefreq>")
		b.WriteString("<priority>" + u.priority + "</priority>")
		b.WriteString("</url>")
	}
	b.WriteString("</urlset>")
	_, _ = w.Write([]byte(b.String()))
}

func xmlEscape(s string) string {
	s = strings.ReplaceAll(s, "&", "&amp;")
	s = strings.ReplaceAll(s, "<", "&lt;")
	s = strings.ReplaceAll(s, ">", "&gt;")
	s = strings.ReplaceAll(s, "\"", "&quot;")
	s = strings.ReplaceAll(s, "'", "&apos;")
	return s
}
