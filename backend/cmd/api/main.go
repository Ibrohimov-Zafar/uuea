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
		SiteURL:        cfg.SiteURL,
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
	r.Get("/sitemap.xml", api.Sitemap)
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
	r.Get("/events/detail", api.GetEventDetail)
	r.Get("/events/spots", api.GetEvent)
	r.Get("/news", api.ListNews)
	r.Get("/news/detail", api.GetNews)
	r.Get("/legal-resources", api.ListLegalResources)
	r.Get("/legal-resources/detail", api.GetLegalResource)
	r.Get("/partners", api.ListPartners)
	r.Get("/testimonials", api.ListTestimonials)
	r.Get("/team-members", api.ListTeamMembers)
	r.Get("/timeline-events", api.ListTimelineEvents)
	r.Get("/site-stats", api.ListSiteStats)
	r.Get("/site-services", api.ListSiteServices)
	r.Get("/site-about", api.GetSiteAbout)
	r.Get("/site-mission", api.GetSiteMission)
	r.Post("/hero-leads", api.CreateHeroLead)
	r.Post("/contact-messages", api.CreateContactMessage)
	r.Post("/hero-leads/unsubscribe", api.UnsubscribeLead)
	r.Get("/hero-leads/unsubscribe", api.UnsubscribeByToken)
	r.Post("/hero-leads/unsubscribe-token", api.UnsubscribeByToken)
	r.Post("/email/send", api.SendEmail)
	r.Post("/stripe/checkout", api.StripeCheckout)
	r.Post("/stripe/verify-payment", api.StripeVerifyPayment)
	r.Post("/stripe/event-checkout", api.EventCheckout)

	// Admin group — kontent boshqaruvi (har ikki admin)
	r.Group(func(ar chi.Router) {
		ar.Use(auth)
		ar.Use(admin)

		// Read (stats, lists)
		ar.Get("/admin/stats", api.AdminStats)
		ar.Get("/admin/list", api.AdminList)
		ar.Get("/admin/news", api.AdminListNews)
		ar.Get("/admin/legal-resources", api.AdminListLegalResources)
		ar.Get("/admin/hero-leads", api.AdminHeroLeads)
		ar.Get("/admin/campaigns", api.AdminCampaigns)
		ar.Get("/admin/memberships", api.AdminMembershipsForUsers)

		// Yangiliklar boshqaruvi
		ar.Post("/admin/news", api.AdminCreateNews)
		ar.Post("/admin/news/review", api.AdminReviewNews)
		ar.Delete("/admin/news", api.AdminDeleteNews)

		// Qonunlar boshqaruvi
		ar.Post("/admin/legal-resources", api.AdminUpsertLegalResource)
		ar.Delete("/admin/legal-resources", api.AdminDeleteLegalResource)

		// Bildirishnomalar yuborish
		ar.Post("/admin/notifications", api.AdminSendNotifications)

		// Email obunalar
		ar.Delete("/admin/hero-leads", api.AdminDeleteHeroLead)
		ar.Post("/admin/hero-leads/import", api.AdminImportHeroLeads)

		// Aloqa xabarlari
		ar.Delete("/admin/contact-messages", api.AdminDeleteContactMessage)

		// Kampaniyalar
		ar.Post("/admin/campaigns", api.AdminCreateCampaign)
		ar.Post("/admin/campaigns/cancel", api.AdminCancelCampaign)

		// A'zolik arizalari
		ar.Post("/admin/submissions/review", api.AdminReviewSubmission)
	})

	// Super admin only — kritik boshqaruv
	r.Group(func(sr chi.Router) {
		sr.Use(auth)
		sr.Use(middleware.RequireSuperAdmin)

		// Foydalanuvchilar
		sr.Patch("/admin/users", api.AdminUpdateUser)
		sr.Delete("/admin/users", api.AdminDeleteUser)

		// Biznes katalogi
		sr.Post("/admin/businesses", api.AdminUpsertBusiness)
		sr.Delete("/admin/businesses", api.AdminDeleteBusiness)

		// Tadbirlar
		sr.Post("/admin/events", api.AdminUpsertEvent)
		sr.Delete("/admin/events", api.AdminDeleteEvent)

		// A'zolik rejalari (tariflar)
		sr.Post("/admin/plans", api.AdminUpsertPlan)
		sr.Delete("/admin/plans", api.AdminDeletePlan)

		// Generic update
		sr.Post("/admin/update", api.GenericUpdate)

		// Bosh sahifa kontenti
		sr.Post("/admin/partners", api.AdminUpsertPartner)
		sr.Delete("/admin/partners", api.AdminDeletePartner)
		sr.Get("/admin/partners", api.AdminListPartners)
		sr.Post("/admin/testimonials", api.AdminUpsertTestimonial)
		sr.Delete("/admin/testimonials", api.AdminDeleteTestimonial)
		sr.Post("/admin/site-stats", api.AdminUpsertSiteStat)
		sr.Delete("/admin/site-stats", api.AdminDeleteSiteStat)
		sr.Post("/admin/site-services", api.AdminUpsertSiteService)
		sr.Delete("/admin/site-services", api.AdminDeleteSiteService)
		sr.Get("/admin/team-members", api.AdminListTeamMembers)
		sr.Post("/admin/team-members", api.AdminUpsertTeamMember)
		sr.Delete("/admin/team-members", api.AdminDeleteTeamMember)
		sr.Get("/admin/timeline-events", api.AdminListTimelineEvents)
		sr.Post("/admin/timeline-events", api.AdminUpsertTimelineEvent)
		sr.Delete("/admin/timeline-events", api.AdminDeleteTimelineEvent)
		sr.Get("/admin/site-about", api.GetSiteAbout)
		sr.Post("/admin/site-about", api.AdminUpsertSiteAbout)
		sr.Get("/admin/site-mission", api.GetSiteMission)
		sr.Post("/admin/site-mission", api.AdminUpsertSiteMission)
	})

	addr := fmt.Sprintf(":%d", cfg.Port)
	log.Printf("[api] listening on http://127.0.0.1%s", addr)
	log.Fatal(http.ListenAndServe(addr, r))
}
