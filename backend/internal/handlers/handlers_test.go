package handlers_test

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/go-chi/chi/v5"
	chimw "github.com/go-chi/chi/v5/middleware"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	_ "modernc.org/sqlite"

	"miaoda/backend/internal/handlers"
	"miaoda/backend/internal/middleware"
)

// ─── Test helpers ────────────────────────────────────────────────────────────

const testSecret = "test-jwt-secret-key-32-chars-long"

func newTestDB(t *testing.T) *sql.DB {
	t.Helper()
	db, err := sql.Open("sqlite", ":memory:")
	if err != nil {
		t.Fatalf("open db: %v", err)
	}
	schema := `
	CREATE TABLE IF NOT EXISTS users (
	  id TEXT PRIMARY KEY, username TEXT NOT NULL UNIQUE, email TEXT UNIQUE,
	  password_hash TEXT NOT NULL, phone TEXT, full_name TEXT, avatar_url TEXT,
	  role TEXT NOT NULL DEFAULT 'user', stripe_customer_id TEXT,
	  created_at TEXT NOT NULL, updated_at TEXT NOT NULL
	);
	CREATE TABLE IF NOT EXISTS membership_plans (
	  id INTEGER PRIMARY KEY AUTOINCREMENT, slug TEXT NOT NULL UNIQUE,
	  name TEXT NOT NULL, price_usd REAL NOT NULL,
	  features TEXT NOT NULL DEFAULT '[]', created_at TEXT NOT NULL
	);
	CREATE TABLE IF NOT EXISTS memberships (
	  id TEXT PRIMARY KEY, user_id TEXT NOT NULL, plan_slug TEXT NOT NULL,
	  status TEXT NOT NULL DEFAULT 'pending', starts_at TEXT, expires_at TEXT,
	  created_at TEXT NOT NULL, updated_at TEXT NOT NULL
	);
	CREATE TABLE IF NOT EXISTS businesses (
	  id TEXT PRIMARY KEY, owner_id TEXT, name TEXT NOT NULL,
	  category TEXT NOT NULL DEFAULT 'Boshqa', description TEXT,
	  website TEXT, phone TEXT, email TEXT, address TEXT, logo_url TEXT,
	  region TEXT, latitude REAL, longitude REAL,
	  is_vip INTEGER NOT NULL DEFAULT 0, is_active INTEGER NOT NULL DEFAULT 1,
	  created_at TEXT NOT NULL, updated_at TEXT NOT NULL
	);
	CREATE TABLE IF NOT EXISTS events (
	  id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT,
	  category TEXT NOT NULL DEFAULT 'Forum', location TEXT NOT NULL,
	  event_date TEXT NOT NULL, event_time TEXT,
	  price_usd REAL NOT NULL DEFAULT 0, spots_total INTEGER NOT NULL DEFAULT 100,
	  spots_remaining INTEGER NOT NULL DEFAULT 100, image_url TEXT,
	  is_featured INTEGER NOT NULL DEFAULT 0, is_active INTEGER NOT NULL DEFAULT 1,
	  created_at TEXT NOT NULL, updated_at TEXT NOT NULL
	);
	CREATE TABLE IF NOT EXISTS news_posts (
	  id TEXT PRIMARY KEY, author_id TEXT, title TEXT NOT NULL, excerpt TEXT,
	  body TEXT NOT NULL, category TEXT NOT NULL DEFAULT 'Boshqa', image_url TEXT,
	  status TEXT NOT NULL DEFAULT 'pending', is_featured INTEGER NOT NULL DEFAULT 0,
	  published_at TEXT, approved_by TEXT, approved_at TEXT,
	  created_at TEXT NOT NULL, updated_at TEXT NOT NULL
	);
	CREATE TABLE IF NOT EXISTS event_registrations (
	  id TEXT PRIMARY KEY, event_id TEXT NOT NULL, user_id TEXT, full_name TEXT NOT NULL,
	  email TEXT NOT NULL, phone TEXT, company TEXT, status TEXT NOT NULL DEFAULT 'confirmed',
	  payment_status TEXT NOT NULL DEFAULT 'free', order_id TEXT,
	  amount_paid REAL NOT NULL DEFAULT 0, created_at TEXT NOT NULL
	);
	CREATE TABLE IF NOT EXISTS orders (
	  id TEXT PRIMARY KEY, user_id TEXT, items TEXT NOT NULL DEFAULT '[]',
	  total_amount REAL NOT NULL, currency TEXT NOT NULL DEFAULT 'usd',
	  status TEXT NOT NULL DEFAULT 'pending', stripe_session_id TEXT UNIQUE,
	  stripe_payment_intent_id TEXT, customer_email TEXT, customer_name TEXT,
	  metadata TEXT, completed_at TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
	);
	CREATE TABLE IF NOT EXISTS business_submissions (
	  id TEXT PRIMARY KEY, owner_id TEXT NOT NULL, name TEXT NOT NULL,
	  category TEXT NOT NULL, description TEXT, website TEXT, phone TEXT,
	  email TEXT, address TEXT, logo_url TEXT, industry TEXT, dba_name TEXT,
	  status TEXT NOT NULL DEFAULT 'pending', admin_note TEXT,
	  reviewed_at TEXT, reviewed_by TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
	);
	CREATE TABLE IF NOT EXISTS saved_cards (
	  id TEXT PRIMARY KEY, user_id TEXT NOT NULL, stripe_customer_id TEXT NOT NULL,
	  stripe_pm_id TEXT NOT NULL, brand TEXT NOT NULL DEFAULT 'card', last4 TEXT NOT NULL,
	  exp_month INTEGER NOT NULL, exp_year INTEGER NOT NULL,
	  is_default INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL
	);
	CREATE TABLE IF NOT EXISTS notifications (
	  id TEXT PRIMARY KEY, user_id TEXT NOT NULL, type TEXT NOT NULL,
	  title TEXT NOT NULL, body TEXT NOT NULL, link TEXT,
	  is_read INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL
	);
	CREATE TABLE IF NOT EXISTS hero_leads (
	  id TEXT PRIMARY KEY, email TEXT NOT NULL, unsubscribe_token TEXT NOT NULL UNIQUE,
	  source TEXT NOT NULL DEFAULT 'hero_form', unsubscribed_at TEXT, created_at TEXT NOT NULL
	);
	CREATE TABLE IF NOT EXISTS email_campaigns (
	  id TEXT PRIMARY KEY, subject TEXT NOT NULL, body TEXT NOT NULL,
	  scheduled_at TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'scheduled',
	  target_source TEXT NOT NULL DEFAULT 'all', sent_count INTEGER NOT NULL DEFAULT 0,
	  fail_count INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL
	);
	CREATE TABLE IF NOT EXISTS legal_resources (
	  id TEXT PRIMARY KEY, title TEXT NOT NULL, excerpt TEXT NOT NULL,
	  body TEXT NOT NULL, category TEXT NOT NULL,
	  resource_type TEXT NOT NULL DEFAULT 'law', source TEXT NOT NULL,
	  published_date TEXT NOT NULL, is_featured INTEGER NOT NULL DEFAULT 0,
	  status TEXT NOT NULL DEFAULT 'published',
	  created_at TEXT NOT NULL, updated_at TEXT NOT NULL
	);
	CREATE TABLE IF NOT EXISTS contact_messages (
	  id TEXT PRIMARY KEY, first_name TEXT NOT NULL, last_name TEXT NOT NULL,
	  email TEXT NOT NULL, phone TEXT, subject TEXT, message TEXT NOT NULL,
	  is_read INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL
	);
	CREATE TABLE IF NOT EXISTS membership_applications (
	  id TEXT PRIMARY KEY, order_id TEXT NOT NULL UNIQUE, user_id TEXT,
	  plan_slug TEXT NOT NULL, resident_type TEXT NOT NULL DEFAULT 'uz',
	  first_name TEXT NOT NULL, last_name TEXT NOT NULL, email TEXT NOT NULL,
	  phone TEXT NOT NULL, mobile TEXT, company_name TEXT, website TEXT,
	  dba_name TEXT, industry TEXT, country TEXT, state TEXT,
	  city TEXT NOT NULL, street TEXT NOT NULL, zip TEXT,
	  status TEXT NOT NULL DEFAULT 'pending',
	  created_at TEXT NOT NULL, updated_at TEXT NOT NULL
	);
	CREATE TABLE IF NOT EXISTS partners (
	  id TEXT PRIMARY KEY, name TEXT NOT NULL, logo_url TEXT, website TEXT,
	  sort_order INTEGER NOT NULL DEFAULT 0, is_active INTEGER NOT NULL DEFAULT 1,
	  created_at TEXT NOT NULL, updated_at TEXT NOT NULL
	);
	CREATE TABLE IF NOT EXISTS testimonials (
	  id TEXT PRIMARY KEY, name TEXT NOT NULL, company TEXT NOT NULL,
	  role TEXT NOT NULL, review TEXT NOT NULL, avatar TEXT NOT NULL DEFAULT '',
	  rating INTEGER NOT NULL DEFAULT 5, is_active INTEGER NOT NULL DEFAULT 1,
	  sort_order INTEGER NOT NULL DEFAULT 0,
	  created_at TEXT NOT NULL, updated_at TEXT NOT NULL
	);
	CREATE TABLE IF NOT EXISTS site_stats (
	  id TEXT PRIMARY KEY, label TEXT NOT NULL, value INTEGER NOT NULL DEFAULT 0,
	  suffix TEXT NOT NULL DEFAULT '+', sort_order INTEGER NOT NULL DEFAULT 0,
	  updated_at TEXT NOT NULL
	);
	CREATE TABLE IF NOT EXISTS site_services (
	  id TEXT PRIMARY KEY, icon TEXT NOT NULL DEFAULT 'TrendingUp',
	  title TEXT NOT NULL, subtitle TEXT NOT NULL, description TEXT NOT NULL,
	  features TEXT NOT NULL DEFAULT '[]', sort_order INTEGER NOT NULL DEFAULT 0,
	  is_active INTEGER NOT NULL DEFAULT 1,
	  created_at TEXT NOT NULL, updated_at TEXT NOT NULL
	);
	CREATE TABLE IF NOT EXISTS campaign_opens (
	  id TEXT PRIMARY KEY, campaign_id TEXT NOT NULL, lead_id TEXT NOT NULL,
	  opened_at TEXT NOT NULL, UNIQUE(campaign_id, lead_id)
	);
	CREATE TABLE IF NOT EXISTS campaign_clicks (
	  id TEXT PRIMARY KEY, campaign_id TEXT NOT NULL, lead_id TEXT NOT NULL,
	  clicked_at TEXT NOT NULL, UNIQUE(campaign_id, lead_id)
	);`

	for _, stmt := range strings.Split(schema, ";") {
		s := strings.TrimSpace(stmt)
		if s == "" {
			continue
		}
		if _, err := db.Exec(s); err != nil {
			t.Fatalf("schema exec: %v\nSQL: %s", err, s)
		}
	}
	return db
}

func newTestAPI(t *testing.T, db *sql.DB) *handlers.API {
	t.Helper()
	return &handlers.API{
		DB:             db,
		JWTSecret:      testSecret,
		FrontendOrigin: "http://localhost:5173",
		SiteURL:        "http://localhost:8080",
		UploadDir:      t.TempDir(),
	}
}

func makeToken(t *testing.T, userID, role string) string {
	t.Helper()
	claims := jwt.MapClaims{
		"sub":  userID,
		"role": role,
		"exp":  time.Now().Add(time.Hour).Unix(),
	}
	tok, err := jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString([]byte(testSecret))
	if err != nil {
		t.Fatalf("make token: %v", err)
	}
	return "Bearer " + tok
}

func seedUser(t *testing.T, db *sql.DB, role string) (id string) {
	t.Helper()
	id = uuid.NewString()
	hash, _ := bcrypt.GenerateFromPassword([]byte("password123"), 10)
	now := time.Now().UTC().Format(time.RFC3339)
	username := "testuser_" + role + "_" + id[:6]
	_, err := db.Exec(
		`INSERT INTO users (id, username, email, password_hash, role, full_name, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?)`,
		id, username, username+"@test.com", string(hash), role, "Test User", now, now,
	)
	if err != nil {
		t.Fatalf("seed user: %v", err)
	}
	return id
}

func buildRouter(api *handlers.API) http.Handler {
	r := chi.NewRouter()
	r.Use(chimw.Recoverer)

	authMW := middleware.Auth(testSecret)
	adminMW := middleware.RequireAdmin
	superMW := middleware.RequireSuperAdmin

	r.Get("/health", func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte(`{"ok":true}`))
	})

	// Auth
	r.Post("/auth/signup", api.Signup)
	r.Post("/auth/login", api.Login)

	// Public
	r.Get("/membership-plans", api.ListMembershipPlans)
	r.Get("/businesses", api.ListBusinesses)
	r.Get("/businesses/detail", api.GetBusiness)
	r.Get("/events", api.ListEvents)
	r.Get("/events/detail", api.GetEventDetail)
	r.Get("/events/spots", api.GetEvent)
	r.Get("/news", api.ListNews)
	r.Get("/news/detail", api.GetNews)
	r.Get("/legal-resources", api.ListLegalResources)
	r.Get("/legal-resources/detail", api.GetLegalResource)
	r.Get("/partners", api.ListPartners)
	r.Get("/testimonials", api.ListTestimonials)
	r.Get("/site-stats", api.ListSiteStats)
	r.Get("/site-services", api.ListSiteServices)
	r.Post("/hero-leads", api.CreateHeroLead)
	r.Post("/contact-messages", api.CreateContactMessage)
	r.Post("/hero-leads/unsubscribe", api.UnsubscribeLead)
	r.Get("/hero-leads/unsubscribe", api.UnsubscribeByToken)

	// Public membership plans (no auth needed)
	r.Get("/membership-plans", api.ListMembershipPlans)

	// Auth required
	r.Group(func(pr chi.Router) {
		pr.Use(authMW)
		pr.Get("/me", api.Me)
		pr.Patch("/profiles/me", api.UpdateProfile)
		pr.Post("/auth/change-password", api.ChangePassword)
		pr.Get("/memberships/me", api.MyMembership)
		pr.Patch("/memberships/me/cancel", api.CancelMembership)
		pr.Get("/notifications", api.ListNotifications)
		pr.Patch("/notifications/{id}/read", api.MarkNotificationRead)
		pr.Post("/notifications/read-all", api.MarkAllNotificationsRead)
		pr.Delete("/notifications/{id}", api.DeleteNotification)
		pr.Get("/business-submissions/me", api.MyBusinessSubmissions)
		pr.Post("/business-submissions", api.CreateBusinessSubmission)
		pr.Get("/event-registrations/me", api.MyEventRegistrations)
		pr.Get("/orders/me", api.MyOrders)
		pr.Get("/saved-cards/me", api.MySavedCards)
		pr.Post("/news", api.CreateNews)
	})

	// Admin (read + kontent boshqaruvi)
	r.Group(func(ar chi.Router) {
		ar.Use(authMW)
		ar.Use(adminMW)
		ar.Get("/admin/stats", api.AdminStats)
		ar.Get("/admin/list", api.AdminList)
		ar.Get("/admin/news", api.AdminListNews)
		ar.Get("/admin/legal-resources", api.AdminListLegalResources)
		ar.Get("/admin/hero-leads", api.AdminHeroLeads)
		ar.Get("/admin/campaigns", api.AdminCampaigns)
		ar.Get("/admin/memberships", api.AdminMembershipsForUsers)
		ar.Post("/admin/news/review", api.AdminReviewNews)
		ar.Delete("/admin/news", api.AdminDeleteNews)
		ar.Post("/admin/legal-resources", api.AdminUpsertLegalResource)
		ar.Delete("/admin/legal-resources", api.AdminDeleteLegalResource)
		ar.Post("/admin/notifications", api.AdminSendNotifications)
		ar.Delete("/admin/hero-leads", api.AdminDeleteHeroLead)
		ar.Post("/admin/hero-leads/import", api.AdminImportHeroLeads)
		ar.Delete("/admin/contact-messages", api.AdminDeleteContactMessage)
		ar.Post("/admin/campaigns", api.AdminCreateCampaign)
		ar.Post("/admin/campaigns/cancel", api.AdminCancelCampaign)
		ar.Post("/admin/submissions/review", api.AdminReviewSubmission)
	})

	// Super admin
	r.Group(func(sr chi.Router) {
		sr.Use(authMW)
		sr.Use(superMW)
		sr.Patch("/admin/users", api.AdminUpdateUser)
		sr.Delete("/admin/users", api.AdminDeleteUser)
		sr.Post("/admin/businesses", api.AdminUpsertBusiness)
		sr.Delete("/admin/businesses", api.AdminDeleteBusiness)
		sr.Post("/admin/events", api.AdminUpsertEvent)
		sr.Delete("/admin/events", api.AdminDeleteEvent)
		sr.Post("/admin/plans", api.AdminUpsertPlan)
		sr.Delete("/admin/plans", api.AdminDeletePlan)
		sr.Post("/admin/update", api.GenericUpdate)
		sr.Post("/admin/partners", api.AdminUpsertPartner)
		sr.Delete("/admin/partners", api.AdminDeletePartner)
		sr.Post("/admin/testimonials", api.AdminUpsertTestimonial)
		sr.Delete("/admin/testimonials", api.AdminDeleteTestimonial)
		sr.Post("/admin/site-stats", api.AdminUpsertSiteStat)
		sr.Delete("/admin/site-stats", api.AdminDeleteSiteStat)
		sr.Post("/admin/site-services", api.AdminUpsertSiteService)
		sr.Delete("/admin/site-services", api.AdminDeleteSiteService)
	})

	return r
}

// do executes an HTTP request against the router and returns status + decoded body.
func do(t *testing.T, router http.Handler, method, path string, body any, token string) (int, map[string]any) {
	t.Helper()
	var buf *bytes.Buffer
	if body != nil {
		b, _ := json.Marshal(body)
		buf = bytes.NewBuffer(b)
	} else {
		buf = bytes.NewBuffer(nil)
	}
	req := httptest.NewRequest(method, path, buf)
	req.Header.Set("Content-Type", "application/json")
	if token != "" {
		req.Header.Set("Authorization", token)
	}
	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, req)

	var result map[string]any
	_ = json.NewDecoder(rr.Body).Decode(&result)
	return rr.Code, result
}

func doList(t *testing.T, router http.Handler, method, path string, body any, token string) (int, []any) {
	t.Helper()
	var buf *bytes.Buffer
	if body != nil {
		b, _ := json.Marshal(body)
		buf = bytes.NewBuffer(b)
	} else {
		buf = bytes.NewBuffer(nil)
	}
	req := httptest.NewRequest(method, path, buf)
	req.Header.Set("Content-Type", "application/json")
	if token != "" {
		req.Header.Set("Authorization", token)
	}
	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, req)

	var result []any
	_ = json.NewDecoder(rr.Body).Decode(&result)
	return rr.Code, result
}

// ─── Tests ───────────────────────────────────────────────────────────────────

func TestHealth(t *testing.T) {
	db := newTestDB(t)
	api := &handlers.API{DB: db, JWTSecret: testSecret}
	r := buildRouter(api)
	code, _ := do(t, r, "GET", "/health", nil, "")
	if code != 200 {
		t.Errorf("GET /health: want 200, got %d", code)
	}
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

func TestSignup(t *testing.T) {
	db := newTestDB(t)
	api := &handlers.API{DB: db, JWTSecret: testSecret}
	r := buildRouter(api)

	t.Run("success", func(t *testing.T) {
		code, body := do(t, r, "POST", "/auth/signup", map[string]any{
			"username": "newuser", "password": "password123", "email": "new@test.com",
		}, "")
		if code != 200 {
			t.Errorf("want 200, got %d: %v", code, body)
		}
		if body["token"] == nil {
			t.Error("token not returned")
		}
	})

	t.Run("duplicate username", func(t *testing.T) {
		code, _ := do(t, r, "POST", "/auth/signup", map[string]any{
			"username": "newuser", "password": "password123",
		}, "")
		if code != 409 {
			t.Errorf("want 409 conflict, got %d", code)
		}
	})

	t.Run("short password", func(t *testing.T) {
		code, _ := do(t, r, "POST", "/auth/signup", map[string]any{
			"username": "user2", "password": "123",
		}, "")
		if code != 400 {
			t.Errorf("want 400, got %d", code)
		}
	})

	t.Run("short username", func(t *testing.T) {
		code, _ := do(t, r, "POST", "/auth/signup", map[string]any{
			"username": "ab", "password": "password123",
		}, "")
		if code != 400 {
			t.Errorf("want 400, got %d", code)
		}
	})
}

func TestLogin(t *testing.T) {
	db := newTestDB(t)
	api := &handlers.API{DB: db, JWTSecret: testSecret}
	r := buildRouter(api)
	seedUser(t, db, "user")

	// Create a known user via signup
	do(t, r, "POST", "/auth/signup", map[string]any{
		"username": "logintest", "password": "password123",
	}, "")

	t.Run("success", func(t *testing.T) {
		code, body := do(t, r, "POST", "/auth/login", map[string]any{
			"identifier": "logintest", "password": "password123",
		}, "")
		if code != 200 {
			t.Errorf("want 200, got %d: %v", code, body)
		}
		if body["token"] == nil {
			t.Error("token not returned")
		}
	})

	t.Run("wrong password", func(t *testing.T) {
		code, _ := do(t, r, "POST", "/auth/login", map[string]any{
			"identifier": "logintest", "password": "wrongpassword",
		}, "")
		if code != 401 {
			t.Errorf("want 401, got %d", code)
		}
	})

	t.Run("not found", func(t *testing.T) {
		code, _ := do(t, r, "POST", "/auth/login", map[string]any{
			"identifier": "doesnotexist", "password": "password123",
		}, "")
		if code != 401 {
			t.Errorf("want 401, got %d", code)
		}
	})
}

// ─── Auth guard ───────────────────────────────────────────────────────────────

func TestAuthRequired(t *testing.T) {
	db := newTestDB(t)
	api := &handlers.API{DB: db, JWTSecret: testSecret}
	r := buildRouter(api)

	protectedRoutes := []struct{ method, path string }{
		{"GET", "/me"},
		{"GET", "/memberships/me"},
		{"GET", "/notifications"},
		{"GET", "/business-submissions/me"},
		{"GET", "/event-registrations/me"},
		{"GET", "/orders/me"},
	}
	for _, rt := range protectedRoutes {
		code, _ := do(t, r, rt.method, rt.path, nil, "")
		if code != 401 {
			t.Errorf("%s %s without token: want 401, got %d", rt.method, rt.path, code)
		}
	}
}

func TestMe(t *testing.T) {
	db := newTestDB(t)
	api := &handlers.API{DB: db, JWTSecret: testSecret}
	r := buildRouter(api)
	uid := seedUser(t, db, "user")
	tok := makeToken(t, uid, "user")

	code, body := do(t, r, "GET", "/me", nil, tok)
	if code != 200 {
		t.Errorf("GET /me: want 200, got %d: %v", code, body)
	}
	// /me returns {"user":{...}, "profile":{...}}
	if body["profile"] == nil {
		t.Errorf("/me should return profile, got: %v", body)
	}
}

// ─── Public endpoints ─────────────────────────────────────────────────────────

func TestMembershipPlans(t *testing.T) {
	db := newTestDB(t)
	now := time.Now().UTC().Format(time.RFC3339)
	db.Exec(`INSERT INTO membership_plans (slug, name, price_usd, features, created_at) VALUES ('starter','Starter',99,'["feature1"]',?)`, now)

	api := &handlers.API{DB: db, JWTSecret: testSecret}
	r := buildRouter(api)

	code, list := doList(t, r, "GET", "/membership-plans", nil, "")
	if code != 200 {
		t.Errorf("want 200, got %d", code)
	}
	if len(list) == 0 {
		t.Error("expected at least one plan")
	}
}

func TestListBusinesses(t *testing.T) {
	db := newTestDB(t)
	now := time.Now().UTC().Format(time.RFC3339)
	db.Exec(`INSERT INTO businesses (id, name, category, is_active, created_at, updated_at) VALUES ('b1','Test Co','IT',1,?,?)`, now, now)

	api := &handlers.API{DB: db, JWTSecret: testSecret}
	r := buildRouter(api)

	t.Run("list all", func(t *testing.T) {
		code, list := doList(t, r, "GET", "/businesses", nil, "")
		if code != 200 {
			t.Errorf("want 200, got %d", code)
		}
		if len(list) == 0 {
			t.Error("expected businesses")
		}
	})

	t.Run("detail found", func(t *testing.T) {
		code, body := do(t, r, "GET", "/businesses/detail?id=b1", nil, "")
		if code != 200 {
			t.Errorf("want 200, got %d: %v", code, body)
		}
	})

	t.Run("detail not found", func(t *testing.T) {
		code, _ := do(t, r, "GET", "/businesses/detail?id=notexist", nil, "")
		if code != 404 {
			t.Errorf("want 404, got %d", code)
		}
	})
}

func TestListEvents(t *testing.T) {
	db := newTestDB(t)
	now := time.Now().UTC().Format(time.RFC3339)
	tomorrow := time.Now().Add(24 * time.Hour).Format("2006-01-02")
	db.Exec(`INSERT INTO events (id, title, category, location, event_date, price_usd, spots_total, spots_remaining, is_active, created_at, updated_at)
		VALUES ('ev1','Test Event','Forum','Toshkent',?,0,100,100,1,?,?)`, tomorrow, now, now)

	api := &handlers.API{DB: db, JWTSecret: testSecret}
	r := buildRouter(api)

	t.Run("list active events", func(t *testing.T) {
		code, list := doList(t, r, "GET", "/events?active=true", nil, "")
		if code != 200 {
			t.Errorf("want 200, got %d", code)
		}
		if len(list) == 0 {
			t.Error("expected events")
		}
	})

	t.Run("event detail found", func(t *testing.T) {
		code, body := do(t, r, "GET", "/events/detail?id=ev1", nil, "")
		if code != 200 {
			t.Errorf("want 200, got %d: %v", code, body)
		}
	})

	t.Run("event detail not found", func(t *testing.T) {
		code, _ := do(t, r, "GET", "/events/detail?id=notexist", nil, "")
		if code != 404 {
			t.Errorf("want 404, got %d", code)
		}
	})

	t.Run("event spots", func(t *testing.T) {
		code, body := do(t, r, "GET", "/events/spots?id=ev1", nil, "")
		if code != 200 {
			t.Errorf("want 200, got %d", code)
		}
		if body["spots_remaining"] == nil {
			t.Error("spots_remaining not returned")
		}
	})
}

func TestListNews(t *testing.T) {
	db := newTestDB(t)
	now := time.Now().UTC().Format(time.RFC3339)
	db.Exec(`INSERT INTO news_posts (id, title, body, category, status, created_at, updated_at) VALUES ('n1','Test News','Body','Iqtisodiyot','approved',?,?)`, now, now)

	api := &handlers.API{DB: db, JWTSecret: testSecret}
	r := buildRouter(api)

	t.Run("list approved", func(t *testing.T) {
		code, list := doList(t, r, "GET", "/news", nil, "")
		if code != 200 {
			t.Errorf("want 200, got %d", code)
		}
		if len(list) == 0 {
			t.Error("expected news")
		}
	})

	t.Run("news detail", func(t *testing.T) {
		code, body := do(t, r, "GET", "/news/detail?id=n1", nil, "")
		if code != 200 {
			t.Errorf("want 200, got %d: %v", code, body)
		}
	})

	t.Run("pending news not visible publicly", func(t *testing.T) {
		db.Exec(`INSERT INTO news_posts (id, title, body, category, status, created_at, updated_at) VALUES ('n2','Pending','Body','Cat','pending',?,?)`, now, now)
		code, _ := do(t, r, "GET", "/news/detail?id=n2", nil, "")
		if code != 404 {
			t.Errorf("pending news should be 404 publicly, got %d", code)
		}
	})
}

func TestLegalResources(t *testing.T) {
	db := newTestDB(t)
	now := time.Now().UTC().Format(time.RFC3339)
	db.Exec(`INSERT INTO legal_resources (id, title, excerpt, body, category, resource_type, source, published_date, status, created_at, updated_at)
		VALUES ('lr1','Test Law','Excerpt','Body text','Qonunlar','law','O''zbekiston Respublikasi','2024-01-01','published',?,?)`, now, now)

	api := &handlers.API{DB: db, JWTSecret: testSecret}
	r := buildRouter(api)

	t.Run("list", func(t *testing.T) {
		code, list := doList(t, r, "GET", "/legal-resources", nil, "")
		if code != 200 {
			t.Errorf("want 200, got %d", code)
		}
		if len(list) == 0 {
			t.Error("expected legal resources")
		}
	})

	t.Run("detail", func(t *testing.T) {
		code, _ := do(t, r, "GET", "/legal-resources/detail?id=lr1", nil, "")
		if code != 200 {
			t.Errorf("want 200, got %d", code)
		}
	})

	t.Run("not found", func(t *testing.T) {
		code, _ := do(t, r, "GET", "/legal-resources/detail?id=notexist", nil, "")
		if code != 404 {
			t.Errorf("want 404, got %d", code)
		}
	})
}

func TestHomepagePublicEndpoints(t *testing.T) {
	db := newTestDB(t)
	now := time.Now().UTC().Format(time.RFC3339)
	db.Exec(`INSERT INTO partners (id, name, sort_order, is_active, created_at, updated_at) VALUES ('p1','Google',1,1,?,?)`, now, now)
	db.Exec(`INSERT INTO testimonials (id, name, company, role, review, rating, is_active, created_at, updated_at) VALUES ('t1','Test User','Test Co','CEO','Great!',5,1,?,?)`, now, now)
	db.Exec(`INSERT INTO site_stats (id, label, value, suffix, sort_order, updated_at) VALUES ('ss1','A''zolar',1200,'+',1,?)`, now)
	db.Exec(`INSERT INTO site_services (id, icon, title, subtitle, description, is_active, created_at, updated_at) VALUES ('sv1','Shield','Himoya','Advocacy','Description',1,?,?)`, now, now)

	api := &handlers.API{DB: db, JWTSecret: testSecret}
	r := buildRouter(api)

	for _, path := range []string{"/partners", "/testimonials", "/site-stats", "/site-services"} {
		code, list := doList(t, r, "GET", path, nil, "")
		if code != 200 {
			t.Errorf("GET %s: want 200, got %d", path, code)
		}
		if len(list) == 0 {
			t.Errorf("GET %s: expected at least one item", path)
		}
	}
}

func TestHeroLead(t *testing.T) {
	db := newTestDB(t)
	api := &handlers.API{DB: db, JWTSecret: testSecret}
	r := buildRouter(api)

	t.Run("create lead", func(t *testing.T) {
		code, body := do(t, r, "POST", "/hero-leads", map[string]any{
			"email": "lead@test.com", "source": "hero_form",
		}, "")
		if code != 200 {
			t.Errorf("want 200, got %d: %v", code, body)
		}
		if body["id"] == nil {
			t.Error("id not returned")
		}
	})

	t.Run("duplicate email allowed (idempotent)", func(t *testing.T) {
		code, _ := do(t, r, "POST", "/hero-leads", map[string]any{
			"email": "lead@test.com",
		}, "")
		if code != 200 {
			t.Errorf("duplicate lead should be 200, got %d", code)
		}
	})
}

func TestContactMessage(t *testing.T) {
	db := newTestDB(t)
	api := &handlers.API{DB: db, JWTSecret: testSecret}
	r := buildRouter(api)

	t.Run("create message", func(t *testing.T) {
		code, body := do(t, r, "POST", "/contact-messages", map[string]any{
			"first_name": "Ali", "last_name": "Valiyev",
			"email": "ali@test.com", "message": "Salom, yordam kerak",
		}, "")
		if code != 200 {
			t.Errorf("want 200, got %d: %v", code, body)
		}
	})

	t.Run("honeypot spam block", func(t *testing.T) {
		code, _ := do(t, r, "POST", "/contact-messages", map[string]any{
			"first_name": "Spam", "last_name": "Bot",
			"email": "spam@test.com", "message": "spam",
			"website": "http://spam.com",
		}, "")
		// Honeypot triggers silent 200 (not blocked, just silently accepted)
		if code != 200 {
			t.Errorf("honeypot should silently 200, got %d", code)
		}
	})

	t.Run("missing required fields", func(t *testing.T) {
		code, _ := do(t, r, "POST", "/contact-messages", map[string]any{
			"first_name": "Ali",
		}, "")
		if code != 400 {
			t.Errorf("want 400, got %d", code)
		}
	})
}

// ─── Admin access control ─────────────────────────────────────────────────────

func TestAdminAccessControl(t *testing.T) {
	db := newTestDB(t)
	api := &handlers.API{DB: db, JWTSecret: testSecret}
	r := buildRouter(api)

	userID := seedUser(t, db, "user")
	adminID := seedUser(t, db, "admin")
	superID := seedUser(t, db, "super_admin")

	userTok := makeToken(t, userID, "user")
	adminTok := makeToken(t, adminID, "admin")
	superTok := makeToken(t, superID, "super_admin")

	t.Run("admin stats — user forbidden", func(t *testing.T) {
		code, _ := do(t, r, "GET", "/admin/stats", nil, userTok)
		if code != 403 {
			t.Errorf("want 403, got %d", code)
		}
	})

	t.Run("admin stats — admin allowed", func(t *testing.T) {
		code, _ := do(t, r, "GET", "/admin/stats", nil, adminTok)
		if code != 200 {
			t.Errorf("admin should access stats, got %d", code)
		}
	})

	t.Run("admin stats — super admin allowed", func(t *testing.T) {
		code, _ := do(t, r, "GET", "/admin/stats", nil, superTok)
		if code != 200 {
			t.Errorf("super admin should access stats, got %d", code)
		}
	})

	t.Run("super admin route — admin forbidden", func(t *testing.T) {
		code, _ := do(t, r, "POST", "/admin/businesses", map[string]any{
			"name": "Test", "category": "IT",
		}, adminTok)
		if code != 403 {
			t.Errorf("regular admin should not create business, got %d", code)
		}
	})

	t.Run("super admin route — super admin allowed", func(t *testing.T) {
		code, body := do(t, r, "POST", "/admin/businesses", map[string]any{
			"name": "Test Business", "category": "IT",
		}, superTok)
		if code != 200 {
			t.Errorf("super admin should create business, got %d: %v", code, body)
		}
	})

	t.Run("no token — 401", func(t *testing.T) {
		code, _ := do(t, r, "GET", "/admin/stats", nil, "")
		if code != 401 {
			t.Errorf("want 401, got %d", code)
		}
	})
}

// ─── Admin: yangiliklar ───────────────────────────────────────────────────────

func TestAdminNews(t *testing.T) {
	db := newTestDB(t)
	now := time.Now().UTC().Format(time.RFC3339)
	db.Exec(`INSERT INTO news_posts (id, title, body, category, status, created_at, updated_at) VALUES ('n1','Test','Body','Cat','pending',?,?)`, now, now)

	api := &handlers.API{DB: db, JWTSecret: testSecret}
	r := buildRouter(api)

	adminID := seedUser(t, db, "admin")
	superID := seedUser(t, db, "super_admin")
	adminTok := makeToken(t, adminID, "admin")
	superTok := makeToken(t, superID, "super_admin")

	t.Run("admin can list news", func(t *testing.T) {
		code, list := doList(t, r, "GET", "/admin/news", nil, adminTok)
		if code != 200 || len(list) == 0 {
			t.Errorf("admin list news: code=%d len=%d", code, len(list))
		}
	})

	t.Run("admin can approve news", func(t *testing.T) {
		code, _ := do(t, r, "POST", "/admin/news/review", map[string]any{
			"id": "n1", "status": "approved",
		}, adminTok)
		if code != 200 {
			t.Errorf("admin approve news: want 200, got %d", code)
		}
	})

	t.Run("admin can delete news", func(t *testing.T) {
		code, _ := do(t, r, "DELETE", "/admin/news?id=n1", nil, superTok)
		if code != 200 {
			t.Errorf("delete news: want 200, got %d", code)
		}
	})
}

// ─── Admin: qonunlar ─────────────────────────────────────────────────────────

func TestAdminLegalResources(t *testing.T) {
	db := newTestDB(t)
	api := &handlers.API{DB: db, JWTSecret: testSecret}
	r := buildRouter(api)

	adminID := seedUser(t, db, "admin")
	adminTok := makeToken(t, adminID, "admin")

	var legalID string

	t.Run("create legal resource", func(t *testing.T) {
		code, body := do(t, r, "POST", "/admin/legal-resources", map[string]any{
			"title": "Test Qonun", "excerpt": "Qisqa tavsif", "body": "To'liq matn",
			"category": "Qonunlar", "resource_type": "law",
			"source": "O'zR", "published_date": "2024-01-01",
		}, adminTok)
		if code != 200 {
			t.Errorf("create legal: want 200, got %d: %v", code, body)
		}
		if id, ok := body["id"].(string); ok {
			legalID = id
		} else {
			t.Error("id not returned")
		}
	})

	t.Run("list legal resources (admin)", func(t *testing.T) {
		code, list := doList(t, r, "GET", "/admin/legal-resources", nil, adminTok)
		if code != 200 || len(list) == 0 {
			t.Errorf("list legal: code=%d len=%d", code, len(list))
		}
	})

	t.Run("delete legal resource", func(t *testing.T) {
		if legalID == "" {
			t.Skip("no legal ID from create")
		}
		code, _ := do(t, r, "DELETE", "/admin/legal-resources?id="+legalID, nil, adminTok)
		if code != 200 {
			t.Errorf("delete legal: want 200, got %d", code)
		}
	})
}

// ─── Admin: kampaniyalar ──────────────────────────────────────────────────────

func TestAdminCampaigns(t *testing.T) {
	db := newTestDB(t)
	api := &handlers.API{DB: db, JWTSecret: testSecret}
	r := buildRouter(api)

	adminID := seedUser(t, db, "admin")
	adminTok := makeToken(t, adminID, "admin")

	var campID string

	t.Run("create campaign", func(t *testing.T) {
		code, body := do(t, r, "POST", "/admin/campaigns", map[string]any{
			"subject":      "Test Campaign",
			"body":         "Email matni",
			"scheduled_at": time.Now().Add(time.Hour).UTC().Format(time.RFC3339),
			"target_source": "all",
		}, adminTok)
		if code != 200 {
			t.Errorf("create campaign: want 200, got %d: %v", code, body)
		}
		if id, ok := body["id"].(string); ok {
			campID = id
		}
	})

	t.Run("list campaigns", func(t *testing.T) {
		code, list := doList(t, r, "GET", "/admin/campaigns", nil, adminTok)
		if code != 200 {
			t.Errorf("list campaigns: want 200, got %d", code)
		}
		_ = list
	})

	t.Run("cancel campaign", func(t *testing.T) {
		if campID == "" {
			t.Skip("no campaign ID")
		}
		code, _ := do(t, r, "POST", fmt.Sprintf("/admin/campaigns/cancel?id=%s", campID), nil, adminTok)
		if code != 200 {
			t.Errorf("cancel campaign: want 200, got %d", code)
		}
	})
}

// ─── Super admin: tadbirlar ───────────────────────────────────────────────────

func TestAdminEvents(t *testing.T) {
	db := newTestDB(t)
	api := &handlers.API{DB: db, JWTSecret: testSecret}
	r := buildRouter(api)

	superID := seedUser(t, db, "super_admin")
	adminID := seedUser(t, db, "admin")
	superTok := makeToken(t, superID, "super_admin")
	adminTok := makeToken(t, adminID, "admin")

	var eventID string

	t.Run("regular admin cannot create event", func(t *testing.T) {
		code, _ := do(t, r, "POST", "/admin/events", map[string]any{
			"title": "Test", "location": "Toshkent", "event_date": "2025-01-01",
		}, adminTok)
		if code != 403 {
			t.Errorf("want 403, got %d", code)
		}
	})

	t.Run("super admin creates event", func(t *testing.T) {
		tomorrow := time.Now().Add(24 * time.Hour).Format("2006-01-02")
		code, body := do(t, r, "POST", "/admin/events", map[string]any{
			"title": "Super Event", "location": "Toshkent",
			"event_date": tomorrow, "category": "Forum",
			"price_usd": 0, "spots_total": 100, "spots_remaining": 100,
			"is_active": true,
		}, superTok)
		if code != 200 {
			t.Errorf("super admin create event: want 200, got %d: %v", code, body)
		}
		if id, ok := body["id"].(string); ok {
			eventID = id
		}
	})

	t.Run("super admin deletes event", func(t *testing.T) {
		if eventID == "" {
			t.Skip("no event ID")
		}
		code, _ := do(t, r, "DELETE", "/admin/events?id="+eventID, nil, superTok)
		if code != 200 {
			t.Errorf("delete event: want 200, got %d", code)
		}
	})
}

// ─── Super admin: a'zolik rejalari ───────────────────────────────────────────

func TestAdminPlans(t *testing.T) {
	db := newTestDB(t)
	api := &handlers.API{DB: db, JWTSecret: testSecret}
	r := buildRouter(api)

	superID := seedUser(t, db, "super_admin")
	adminID := seedUser(t, db, "admin")
	superTok := makeToken(t, superID, "super_admin")
	adminTok := makeToken(t, adminID, "admin")

	t.Run("admin cannot create plan", func(t *testing.T) {
		code, _ := do(t, r, "POST", "/admin/plans", map[string]any{
			"slug": "test", "name": "Test", "price_usd": 99, "features": []string{},
		}, adminTok)
		if code != 403 {
			t.Errorf("want 403, got %d", code)
		}
	})

	t.Run("super admin creates plan", func(t *testing.T) {
		code, body := do(t, r, "POST", "/admin/plans", map[string]any{
			"slug": "testplan", "name": "Test Plan",
			"price_usd": 99, "features": []string{"Feature 1"},
		}, superTok)
		if code != 200 {
			t.Errorf("super admin create plan: want 200, got %d: %v", code, body)
		}
	})

	t.Run("super admin deletes plan", func(t *testing.T) {
		code, _ := do(t, r, "DELETE", "/admin/plans?slug=testplan", nil, superTok)
		if code != 200 {
			t.Errorf("delete plan: want 200, got %d", code)
		}
	})
}

// ─── Super admin: foydalanuvchilar ───────────────────────────────────────────

func TestAdminUsers(t *testing.T) {
	db := newTestDB(t)
	api := &handlers.API{DB: db, JWTSecret: testSecret}
	r := buildRouter(api)

	superID := seedUser(t, db, "super_admin")
	targetID := seedUser(t, db, "user")
	adminID := seedUser(t, db, "admin")
	superTok := makeToken(t, superID, "super_admin")
	adminTok := makeToken(t, adminID, "admin")

	t.Run("admin cannot update user role", func(t *testing.T) {
		code, _ := do(t, r, "PATCH", "/admin/users", map[string]any{
			"id": targetID, "role": "admin",
		}, adminTok)
		if code != 403 {
			t.Errorf("want 403, got %d", code)
		}
	})

	t.Run("super admin updates user role", func(t *testing.T) {
		code, body := do(t, r, "PATCH", "/admin/users", map[string]any{
			"id": targetID, "role": "business_owner",
		}, superTok)
		if code != 200 {
			t.Errorf("update user role: want 200, got %d: %v", code, body)
		}
	})

	t.Run("admin cannot delete user", func(t *testing.T) {
		code, _ := do(t, r, "DELETE", "/admin/users?id="+targetID, nil, adminTok)
		if code != 403 {
			t.Errorf("want 403, got %d", code)
		}
	})

	t.Run("super admin deletes user", func(t *testing.T) {
		delID := seedUser(t, db, "user")
		code, _ := do(t, r, "DELETE", "/admin/users?id="+delID, nil, superTok)
		if code != 200 {
			t.Errorf("delete user: want 200, got %d", code)
		}
	})
}

// ─── Profile update ───────────────────────────────────────────────────────────

func TestUpdateProfile(t *testing.T) {
	db := newTestDB(t)
	api := &handlers.API{DB: db, JWTSecret: testSecret}
	r := buildRouter(api)

	uid := seedUser(t, db, "user")
	tok := makeToken(t, uid, "user")

	code, body := do(t, r, "PATCH", "/profiles/me", map[string]any{
		"full_name": "Yangi Ism", "phone": "+998901234567",
	}, tok)
	if code != 200 {
		t.Errorf("update profile: want 200, got %d: %v", code, body)
	}
}

// ─── Notifications ────────────────────────────────────────────────────────────

func TestNotifications(t *testing.T) {
	db := newTestDB(t)
	now := time.Now().UTC().Format(time.RFC3339)
	api := &handlers.API{DB: db, JWTSecret: testSecret}
	r := buildRouter(api)

	uid := seedUser(t, db, "user")
	tok := makeToken(t, uid, "user")

	notifID := uuid.NewString()
	db.Exec(`INSERT INTO notifications (id, user_id, type, title, body, created_at) VALUES (?,?,'general','Test','Body',?)`,
		notifID, uid, now)

	t.Run("list notifications", func(t *testing.T) {
		code, list := doList(t, r, "GET", "/notifications", nil, tok)
		if code != 200 {
			t.Errorf("want 200, got %d", code)
		}
		if len(list) == 0 {
			t.Error("expected notifications")
		}
	})

	t.Run("mark read", func(t *testing.T) {
		code, _ := do(t, r, "PATCH", "/notifications/"+notifID+"/read", nil, tok)
		if code != 200 {
			t.Errorf("want 200, got %d", code)
		}
	})

	t.Run("mark all read", func(t *testing.T) {
		code, _ := do(t, r, "POST", "/notifications/read-all", nil, tok)
		if code != 200 {
			t.Errorf("want 200, got %d", code)
		}
	})

	t.Run("delete notification", func(t *testing.T) {
		code, _ := do(t, r, "DELETE", "/notifications/"+notifID, nil, tok)
		if code != 200 {
			t.Errorf("want 200, got %d", code)
		}
	})
}

// ─── Business submissions ─────────────────────────────────────────────────────

func TestBusinessSubmissions(t *testing.T) {
	db := newTestDB(t)
	api := &handlers.API{DB: db, JWTSecret: testSecret}
	r := buildRouter(api)

	uid := seedUser(t, db, "user")
	tok := makeToken(t, uid, "user")

	t.Run("create submission", func(t *testing.T) {
		code, body := do(t, r, "POST", "/business-submissions", map[string]any{
			"name": "My Business", "category": "IT",
		}, tok)
		if code != 200 {
			t.Errorf("create submission: want 200, got %d: %v", code, body)
		}
	})

	t.Run("list my submissions", func(t *testing.T) {
		code, list := doList(t, r, "GET", "/business-submissions/me", nil, tok)
		if code != 200 {
			t.Errorf("want 200, got %d", code)
		}
		if len(list) == 0 {
			t.Error("expected submissions")
		}
	})
}

// ─── Homepage content admin (super admin) ─────────────────────────────────────

func TestAdminHomepageContent(t *testing.T) {
	db := newTestDB(t)
	api := &handlers.API{DB: db, JWTSecret: testSecret}
	r := buildRouter(api)

	superID := seedUser(t, db, "super_admin")
	superTok := makeToken(t, superID, "super_admin")

	var partnerID, testimonialID, statID, serviceID string

	t.Run("create partner", func(t *testing.T) {
		code, body := do(t, r, "POST", "/admin/partners", map[string]any{
			"name": "Google", "website": "https://google.com",
		}, superTok)
		if code != 200 {
			t.Errorf("create partner: want 200, got %d: %v", code, body)
		}
		partnerID, _ = body["id"].(string)
	})

	t.Run("delete partner", func(t *testing.T) {
		if partnerID == "" {
			t.Skip()
		}
		code, _ := do(t, r, "DELETE", "/admin/partners?id="+partnerID, nil, superTok)
		if code != 200 {
			t.Errorf("delete partner: want 200, got %d", code)
		}
	})

	t.Run("create testimonial", func(t *testing.T) {
		code, body := do(t, r, "POST", "/admin/testimonials", map[string]any{
			"name": "Test User", "company": "Test Co",
			"role": "CEO", "review": "Ajoyib xizmat!", "rating": 5,
		}, superTok)
		if code != 200 {
			t.Errorf("create testimonial: want 200, got %d: %v", code, body)
		}
		testimonialID, _ = body["id"].(string)
	})

	t.Run("delete testimonial", func(t *testing.T) {
		if testimonialID == "" {
			t.Skip()
		}
		code, _ := do(t, r, "DELETE", "/admin/testimonials?id="+testimonialID, nil, superTok)
		if code != 200 {
			t.Errorf("delete testimonial: want 200, got %d", code)
		}
	})

	t.Run("create site stat", func(t *testing.T) {
		code, body := do(t, r, "POST", "/admin/site-stats", map[string]any{
			"label": "A'zolar", "value": 1200, "suffix": "+",
		}, superTok)
		if code != 200 {
			t.Errorf("create stat: want 200, got %d: %v", code, body)
		}
		statID, _ = body["id"].(string)
	})

	t.Run("delete site stat", func(t *testing.T) {
		if statID == "" {
			t.Skip()
		}
		code, _ := do(t, r, "DELETE", "/admin/site-stats?id="+statID, nil, superTok)
		if code != 200 {
			t.Errorf("delete stat: want 200, got %d", code)
		}
	})

	t.Run("create site service", func(t *testing.T) {
		code, body := do(t, r, "POST", "/admin/site-services", map[string]any{
			"title": "Himoya", "subtitle": "Advocacy",
			"description": "Biznes huquqlari", "icon": "Shield",
			"features": []string{"Huquqiy himoya"},
		}, superTok)
		if code != 200 {
			t.Errorf("create service: want 200, got %d: %v", code, body)
		}
		serviceID, _ = body["id"].(string)
	})

	t.Run("delete site service", func(t *testing.T) {
		if serviceID == "" {
			t.Skip()
		}
		code, _ := do(t, r, "DELETE", "/admin/site-services?id="+serviceID, nil, superTok)
		if code != 200 {
			t.Errorf("delete service: want 200, got %d", code)
		}
	})
}

// ─── Email leads (admin) ──────────────────────────────────────────────────────

func TestAdminLeads(t *testing.T) {
	db := newTestDB(t)
	now := time.Now().UTC().Format(time.RFC3339)
	leadID := uuid.NewString()
	tok := uuid.NewString()
	db.Exec(`INSERT INTO hero_leads (id, email, unsubscribe_token, source, created_at) VALUES (?,?,?,'test',?)`,
		leadID, "lead@test.com", tok, now)

	api := &handlers.API{DB: db, JWTSecret: testSecret}
	r := buildRouter(api)

	adminID := seedUser(t, db, "admin")
	adminTok := makeToken(t, adminID, "admin")

	t.Run("list leads", func(t *testing.T) {
		code, list := doList(t, r, "GET", "/admin/hero-leads", nil, adminTok)
		if code != 200 || len(list) == 0 {
			t.Errorf("list leads: code=%d len=%d", code, len(list))
		}
	})

	t.Run("import leads", func(t *testing.T) {
		code, _ := do(t, r, "POST", "/admin/hero-leads/import", map[string]any{
			"leads": []map[string]string{{"email": "import1@test.com"}, {"email": "import2@test.com"}},
		}, adminTok)
		if code != 200 {
			t.Errorf("import leads: want 200, got %d", code)
		}
	})

	t.Run("delete lead", func(t *testing.T) {
		code, _ := do(t, r, "DELETE", "/admin/hero-leads?id="+leadID, nil, adminTok)
		if code != 200 {
			t.Errorf("delete lead: want 200, got %d", code)
		}
	})
}

// ─── Unsubscribe ──────────────────────────────────────────────────────────────

func TestUnsubscribe(t *testing.T) {
	db := newTestDB(t)
	now := time.Now().UTC().Format(time.RFC3339)
	unsubTok := uuid.NewString()
	db.Exec(`INSERT INTO hero_leads (id, email, unsubscribe_token, source, created_at) VALUES (?,?,?,'test',?)`,
		uuid.NewString(), "unsub@test.com", unsubTok, now)

	api := &handlers.API{DB: db, JWTSecret: testSecret}
	r := buildRouter(api)

	t.Run("unsubscribe by token (GET)", func(t *testing.T) {
		code, _ := do(t, r, "GET", "/hero-leads/unsubscribe?token="+unsubTok, nil, "")
		if code != 200 {
			t.Errorf("want 200, got %d", code)
		}
	})

	t.Run("unsubscribe by email (POST)", func(t *testing.T) {
		code, _ := do(t, r, "POST", "/hero-leads/unsubscribe", map[string]any{
			"email": "unsub@test.com",
		}, "")
		if code != 200 {
			t.Errorf("want 200, got %d", code)
		}
	})
}

// ─── Admin notifications ──────────────────────────────────────────────────────

func TestAdminSendNotifications(t *testing.T) {
	db := newTestDB(t)
	api := &handlers.API{DB: db, JWTSecret: testSecret}
	r := buildRouter(api)

	adminID := seedUser(t, db, "admin")
	targetID := seedUser(t, db, "user")
	adminTok := makeToken(t, adminID, "admin")

	code, _ := do(t, r, "POST", "/admin/notifications", map[string]any{
		"user_ids": []string{targetID},
		"type":     "general",
		"title":    "Test",
		"body":     "Test bildirishnoma",
	}, adminTok)
	if code != 200 {
		t.Errorf("send notification: want 200, got %d", code)
	}
}

// ─── Admin: aloqa xabarlari ───────────────────────────────────────────────────

func TestAdminContactMessages(t *testing.T) {
	db := newTestDB(t)
	now := time.Now().UTC().Format(time.RFC3339)
	msgID := uuid.NewString()
	db.Exec(`INSERT INTO contact_messages (id, first_name, last_name, email, message, created_at) VALUES (?,?,?,?,?,?)`,
		msgID, "Ali", "Valiyev", "ali@test.com", "Salom", now)

	api := &handlers.API{DB: db, JWTSecret: testSecret}
	r := buildRouter(api)

	adminID := seedUser(t, db, "admin")
	adminTok := makeToken(t, adminID, "admin")

	t.Run("delete contact message", func(t *testing.T) {
		code, _ := do(t, r, "DELETE", "/admin/contact-messages?id="+msgID, nil, adminTok)
		if code != 200 {
			t.Errorf("want 200, got %d", code)
		}
	})
}
