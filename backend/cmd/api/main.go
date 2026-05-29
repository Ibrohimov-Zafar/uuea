package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"

	"github.com/joho/godotenv"

	"github.com/go-chi/chi/v5"
	chimw "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"

	"miaoda/backend/internal/config"
	"miaoda/backend/internal/db"
	"miaoda/backend/internal/handlers"
	"miaoda/backend/internal/middleware"
	"miaoda/backend/internal/seed"
)

func main() {
	// Loyiha ildizi (.env), keyin backend/.env (Stripe va boshqa server sirlar)
	_ = godotenv.Load("../.env")
	_ = godotenv.Overload(".env")
	cfg := config.Load()
	dbPath := cfg.DBPath
	if !filepath.IsAbs(dbPath) {
		wd, _ := os.Getwd()
		dbPath = filepath.Join(wd, dbPath)
	}
	conn, err := db.Open(dbPath)
	if err != nil {
		log.Fatal(err)
	}
	defer conn.Close()
	_ = seed.Run(conn)
	if os.Getenv("SEED_DEMO") == "true" || os.Getenv("SEED_DEMO") == "1" {
		if err := seed.Demo(conn); err != nil {
			log.Printf("[seed] demo: %v", err)
		}
	}

	uploadDir := cfg.UploadDir
	if !filepath.IsAbs(uploadDir) {
		wd, _ := os.Getwd()
		uploadDir = filepath.Join(wd, uploadDir)
	}
	_ = os.MkdirAll(uploadDir, 0o755)

	api := &handlers.API{
		DB:             conn,
		JWTSecret:      cfg.JWTSecret,
		StripeKey:      cfg.StripeSecret,
		FrontendOrigin: cfg.FrontendOrigin,
		UploadDir:      uploadDir,
	}

	r := chi.NewRouter()
	r.Use(chimw.Logger)
	r.Use(chimw.Recoverer)
	origins := []string{
		"http://localhost:5173",
		"http://127.0.0.1:5173",
		"http://localhost:8080",
		"http://127.0.0.1:8080",
		cfg.FrontendOrigin,
	}
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   origins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
	}))

	r.Get("/health", func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"ok":true}`))
	})
	r.Handle("/uploads/*", handlers.UploadsFileServer(uploadDir))

	auth := middleware.Auth(cfg.JWTSecret)
	admin := middleware.RequireAdmin

	r.Post("/auth/signup", api.Signup)
	r.Post("/auth/login", api.Login)

	r.Group(func(pr chi.Router) {
		pr.Use(auth)
		pr.Get("/me", api.Me)
		pr.Patch("/profiles/me", api.UpdateProfile)
		pr.Post("/auth/change-password", api.ChangePassword)

		pr.Get("/membership-plans", api.ListMembershipPlans)
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
		pr.Post("/upload", api.Upload)
	})

	r.Get("/membership-plans", api.ListMembershipPlans)
	r.Get("/businesses", api.ListBusinesses)
	r.Get("/businesses/detail", api.GetBusiness)
	r.Get("/events", api.ListEvents)
	r.Get("/events/spots", api.GetEvent)
	r.Get("/news", api.ListNews)
	r.Get("/news/detail", api.GetNews)
	r.Post("/hero-leads", api.CreateHeroLead)
	r.Post("/hero-leads/unsubscribe", api.UnsubscribeLead)
	r.Get("/hero-leads/unsubscribe", api.UnsubscribeByToken)
	r.Post("/hero-leads/unsubscribe-token", api.UnsubscribeByToken)
	r.Post("/email/send", api.SendEmail)
	r.Post("/stripe/checkout", api.StripeCheckout)
	r.Post("/stripe/verify-payment", api.StripeVerifyPayment)
	r.Post("/stripe/event-checkout", api.EventCheckout)

	r.Group(func(ar chi.Router) {
		ar.Use(auth)
		ar.Use(admin)
		ar.Get("/admin/stats", api.AdminStats)
		ar.Get("/admin/list", api.AdminList)
		ar.Post("/admin/businesses", api.AdminUpsertBusiness)
		ar.Delete("/admin/businesses", api.AdminDeleteBusiness)
		ar.Post("/admin/submissions/review", api.AdminReviewSubmission)
		ar.Post("/admin/events", api.AdminUpsertEvent)
		ar.Delete("/admin/events", api.AdminDeleteEvent)
		ar.Post("/admin/notifications", api.AdminSendNotifications)
		ar.Get("/admin/news", api.AdminListNews)
		ar.Post("/admin/news/review", api.AdminReviewNews)
		ar.Delete("/admin/news", api.AdminDeleteNews)
		ar.Get("/admin/hero-leads", api.AdminHeroLeads)
		ar.Delete("/admin/hero-leads", api.AdminDeleteHeroLead)
		ar.Post("/admin/hero-leads/import", api.AdminImportHeroLeads)
		ar.Get("/admin/campaigns", api.AdminCampaigns)
		ar.Post("/admin/campaigns", api.AdminCreateCampaign)
		ar.Post("/admin/campaigns/cancel", api.AdminCancelCampaign)
		ar.Get("/admin/memberships", api.AdminMembershipsForUsers)
		ar.Post("/admin/update", api.GenericUpdate)
	})

	// Super admin only (role/user management)
	r.Group(func(sr chi.Router) {
		sr.Use(auth)
		sr.Use(middleware.RequireSuperAdmin)
		sr.Patch("/admin/users", api.AdminUpdateUser)
		sr.Delete("/admin/users", api.AdminDeleteUser)
		sr.Post("/admin/plans", api.AdminUpsertPlan)
		sr.Delete("/admin/plans", api.AdminDeletePlan)
	})

	addr := fmt.Sprintf(":%d", cfg.Port)
	log.Printf("[api] listening on http://127.0.0.1%s", addr)
	log.Fatal(http.ListenAndServe(addr, r))
}
