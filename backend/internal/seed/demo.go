package seed

import (
	"database/sql"
	"encoding/json"
	"time"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

// Demo writes richer mock data for UX testing.
// It is idempotent: if core tables already have data, it won't add duplicates.
func ensureUser(db *sql.DB, username, email, fullName, role, password string) string {
	now := time.Now().UTC().Format(time.RFC3339)
	hash, _ := bcrypt.GenerateFromPassword([]byte(password), 10)
	var id string
	err := db.QueryRow(`SELECT id FROM users WHERE lower(username)=lower(?) LIMIT 1`, username).Scan(&id)
	if err == sql.ErrNoRows {
		id = uuid.NewString()
		_, _ = db.Exec(`INSERT INTO users (id, username, email, password_hash, full_name, role, created_at, updated_at)
			VALUES (?,?,?,?,?,?,?,?)`,
			id, username, email, string(hash), fullName, role, now, now)
		return id
	}
	_, _ = db.Exec(`UPDATE users SET password_hash=?, role=?, full_name=?, email=?, updated_at=? WHERE id=?`,
		string(hash), role, fullName, email, now, id)
	return id
}

func Demo(db *sql.DB) error {
	now := time.Now().UTC().Format(time.RFC3339)

	// Test login accounts (always reset password/role)
	_ = ensureUser(db, "admin", "admin@miaoda.com", "Admin User", "super_admin", "admin123")
	bizID := ensureUser(db, "biznes", "biznes@miaoda.com", "Biznes Egasi", "business_owner", "biznes123")
	_ = ensureUser(db, "superdemo", "superdemo@miaoda.com", "Super Demo", "super_admin", "password123")
	_ = ensureUser(db, "bizdemo", "bizdemo@miaoda.com", "Biz Demo", "business_owner", "password123")

	// Active membership + sample payment for biznes (dashboard UX)
	var memCount int
	_ = db.QueryRow(`SELECT COUNT(*) FROM memberships WHERE user_id=? AND status='active'`, bizID).Scan(&memCount)
	if memCount == 0 {
		mid := uuid.NewString()
		starts := time.Now().UTC().AddDate(0, -2, 0).Format(time.RFC3339)
		expires := time.Now().UTC().AddDate(0, 10, 0).Format(time.RFC3339) // ~10 months left
		_, _ = db.Exec(`INSERT INTO memberships (id, user_id, plan_slug, status, starts_at, expires_at, created_at, updated_at)
			VALUES (?,?,?,'active',?,?,?,?)`,
			mid, bizID, "business", starts, expires, now, now)
	}
	var ordCount int
	_ = db.QueryRow(`SELECT COUNT(*) FROM orders WHERE user_id=?`, bizID).Scan(&ordCount)
	if ordCount == 0 {
		oid := uuid.NewString()
		items := `[{"name":"Business A'zolik","price":249,"plan_slug":"business"}]`
		completed := time.Now().UTC().AddDate(0, -2, 0).Format(time.RFC3339)
		_, _ = db.Exec(`INSERT INTO orders (id, user_id, items, total_amount, currency, status, customer_email, customer_name, completed_at, created_at, updated_at)
			VALUES (?,?,?,?,?,'completed',?,?,?,?,?)`,
			oid, bizID, items, 249.0, "usd", "biznes@miaoda.com", "Biznes Egasi", completed, completed, now)
	}
	// Event registration for biznes
	var regCount int
	_ = db.QueryRow(`SELECT COUNT(*) FROM event_registrations WHERE user_id=? AND event_id='e_demo_1'`, bizID).Scan(&regCount)
	if regCount == 0 {
		_, _ = db.Exec(`INSERT INTO event_registrations (id, event_id, user_id, full_name, email, status, payment_status, created_at)
			VALUES (?,?,?,?,?,?,'free',?)`,
			uuid.NewString(), "e_demo_1", bizID, "Biznes Egasi", "biznes@miaoda.com", "confirmed", now)
	}

	// Events
	var n int
	_ = db.QueryRow(`SELECT COUNT(*) FROM events`).Scan(&n)
	if n < 6 {
		type ev struct {
			id, title, desc, cat, loc, date, t string
			price                              float64
			spots                              int
			featured                           bool
		}
		list := []ev{
			{"e_demo_1", "Biznes Forum 2026", "Yirik biznes forum va networking.", "Forum", "Toshkent", time.Now().AddDate(0, 0, 10).Format("2006-01-02"), "10:00", 0, 400, true},
			{"e_demo_2", "Export Workshop", "Eksport bozorlariga chiqish bo'yicha amaliy seminar.", "Workshop", "Samarqand", time.Now().AddDate(0, 0, 17).Format("2006-01-02"), "15:00", 29, 120, true},
			{"e_demo_3", "Investor Pitch Night", "Startaplar uchun pitch sessiya.", "Startaplar", "Toshkent", time.Now().AddDate(0, 0, 24).Format("2006-01-02"), "18:30", 49, 80, false},
			{"e_demo_4", "HR & Team Building", "Jamoa boshqaruvi va HR jarayonlari.", "Trening", "Farg'ona", time.Now().AddDate(0, 1, 2).Format("2006-01-02"), "11:00", 19, 60, false},
			{"e_demo_5", "E-commerce Growth", "Onlayn savdoda o'sish strategiyalari.", "Savdo", "Buxoro", time.Now().AddDate(0, 1, 9).Format("2006-01-02"), "14:00", 0, 200, false},
			{"e_demo_6", "VIP Networking Dinner", "VIP a'zolar uchun yopiq kechki ovqat.", "Networking", "Toshkent", time.Now().AddDate(0, 1, 15).Format("2006-01-02"), "19:00", 99, 40, true},
		}
		for _, e := range list {
			_, _ = db.Exec(`INSERT OR IGNORE INTO events (id, title, description, category, location, event_date, event_time, price_usd, spots_total, spots_remaining, is_featured, is_active, created_at, updated_at)
				VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
				e.id, e.title, e.desc, e.cat, e.loc, e.date, e.t, e.price, e.spots, e.spots, boolInt(e.featured), 1, now, now)
		}
	}

	// Businesses
	_ = db.QueryRow(`SELECT COUNT(*) FROM businesses`).Scan(&n)
	if n < 6 {
		type biz struct {
			id, name, cat, desc, phone, email, addr, region string
			vip                                                bool
		}
		list := []biz{
			{"b_demo_1", "Zafar Logistics", "Logistika", "Yuk tashish va logistika xizmatlari.", "+998712000000", "info@zafarlog.uz", "Toshkent", "Toshkent", true},
			{"b_demo_2", "Samarkand Textile", "Ishlab chiqarish", "Tekstil mahsulotlari va eksport.", "+998662000000", "hello@smtextile.uz", "Samarqand", "Samarqand", false},
			{"b_demo_3", "Fergana Agro", "Agro", "Qishloq xo'jaligi mahsulotlari.", "+998732000000", "sales@agro.uz", "Farg'ona", "Farg'ona", false},
			{"b_demo_4", "Bukhara Tours", "Turizm", "Ichki turizm va biznes turlar.", "+998652000000", "contact@tour.uz", "Buxoro", "Buxoro", true},
			{"b_demo_5", "Tashkent IT Lab", "IT", "Veb va mobil yechimlar.", "+998712111111", "team@itlab.uz", "Toshkent", "Toshkent", true},
			{"b_demo_6", "Qarshi Construction", "Qurilish", "Sanoat va uy-joy qurilishi.", "+998752000000", "office@qc.uz", "Qarshi", "Qashqadaryo", false},
		}
		for _, b := range list {
			_, _ = db.Exec(`INSERT OR IGNORE INTO businesses (id, name, category, description, phone, email, address, region, is_vip, is_active, created_at, updated_at)
				VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
				b.id, b.name, b.cat, b.desc, b.phone, b.email, b.addr, b.region, boolInt(b.vip), 1, now, now)
		}
	}

	// News (approved) – for NewsPage
	_ = db.QueryRow(`SELECT COUNT(*) FROM news_posts`).Scan(&n)
	if n < 6 {
		type post struct {
			title, excerpt, body, cat, img string
			featured                        bool
		}
		list := []post{
			{"Mintaqaviy Iqtisodiy Rivojlanish 2026", "Yil boshidan beri asosiy ko'rsatkichlar tahlili.", "2026 yil bo'yicha qisqa tahliliy maqola. Bozorlar, eksport, kreditlar va yangi imkoniyatlar.", "Iqtisodiyot", "", true},
			{"Google bilan hamkorlik dasturi", "A'zo bizneslar uchun bepul treninglar.", "Google bilan hamkorlik doirasida raqamli ko'nikmalar bo'yicha kurslar ishga tushdi.", "Hamkorlik", "", false},
			{"Export bozorlariga chiqish yo'l xaritasi", "Yangi bozorlar va talablar ro'yxati.", "Markaziy Osiyo va Yaqin Sharq bozorlariga kirish bo'yicha amaliy tavsiyalar.", "Savdo", "", false},
			{"Biznes Forum 2026 ro'yxatdan o'tish boshlandi", "Tadbirga qatnashish uchun joylar cheklangan.", "Forumda spikerlar, master-klasslar va networking bo'ladi. Ro'yxatdan o'ting!", "Tadbirlar", "", true},
			{"Kichik biznes uchun subsidiya", "200 ta kichik biznes qo'llab-quvvatlanadi.", "Davlat hamkorligida subsidiya dasturi e'lon qilindi. Ariza topshirish tartibi.", "Moliya", "", false},
			{"Startap ekotizimi: 2026 trendlar", "Sarmoya va jamoa qurish bo'yicha maslahatlar.", "Startaplar uchun trendlar, pitch deck va investor bilan ishlash bo'yicha qo'llanma.", "Startaplar", "", false},
		}
		for _, p := range list {
			id := uuid.NewString()
			publishedAt := now
			_, _ = db.Exec(`INSERT OR IGNORE INTO news_posts
				(id, author_id, title, excerpt, body, category, image_url, status, is_featured, published_at, approved_by, approved_at, created_at, updated_at)
				VALUES (?,?,?,?,?,?,?,'approved',?,?,NULL,NULL,?,?)`,
				id, nullIfEmpty(bizID), p.title, p.excerpt, p.body, p.cat, nullIfEmpty(p.img), boolInt(p.featured), publishedAt, now, now)
		}
	}

	// Business submissions – to test Admin approvals
	_ = db.QueryRow(`SELECT COUNT(*) FROM business_submissions`).Scan(&n)
	if n < 5 {
		type sub struct{ name, cat, desc, phone, email, addr string }
		list := []sub{
			{"Andijon Coffee", "Savdo", "Qahva va desertlar.", "+998742222222", "hello@coffee.uz", "Andijon"},
			{"Nukus Print", "Xizmatlar", "Poligrafiya va dizayn.", "+998612222222", "info@print.uz", "Nukus"},
			{"Jizzax Solar", "Energetika", "Quyosh panellari o'rnatish.", "+998722222222", "team@solar.uz", "Jizzax"},
			{"Namangan Plast", "Ishlab chiqarish", "Plastik mahsulotlar ishlab chiqarish.", "+998692222222", "sales@plast.uz", "Namangan"},
			{"Xiva Hotel Group", "Turizm", "Mehmonxona va servis.", "+998622222222", "contact@xiva.uz", "Xiva"},
		}
		for _, s := range list {
			id := uuid.NewString()
			_, _ = db.Exec(`INSERT OR IGNORE INTO business_submissions
				(id, owner_id, name, category, description, phone, email, address, status, created_at, updated_at)
				VALUES (?,?,?,?,?,?,?,?, 'pending', ?, ?)`,
				id, bizID, s.name, s.cat, s.desc, s.phone, s.email, s.addr, now, now)
		}
	}

	// Notifications – for bell UX
	userID := bizID
	if userID != "" {
		_ = db.QueryRow(`SELECT COUNT(*) FROM notifications WHERE user_id=?`, userID).Scan(&n)
		if n == 0 {
			type notif struct{ typ, title, body, link string }
			list := []notif{
				{"new_event", "Yangi tadbir", "Biznes Forum 2026 — ro'yxatdan o'tish boshlandi", "/tadbirlar"},
				{"general", "Profil", "Profilingizni to'ldiring va avataringizni yuklang", "/dashboard"},
				{"membership_expiring", "A'zolik", "A'zoligingizni yangilashni unutmang", "/azolik"},
			}
			for _, n := range list {
				_, _ = db.Exec(`INSERT OR IGNORE INTO notifications (id, user_id, type, title, body, link, is_read, created_at)
					VALUES (?,?,?,?,?,?,0,?)`,
					uuid.NewString(), userID, n.typ, n.title, n.body, nullIfEmpty(n.link), now)
			}
		}
	}

	// Membership plans already exist in Run(); ensure features are valid JSON arrays.
	// (Nothing else needed here.)

	return nil
}

func nullIfEmpty(s string) any {
	if s == "" {
		return nil
	}
	return s
}

func boolInt(b bool) int {
	if b {
		return 1
	}
	return 0
}

// Keep JSON import in use for future expansions.
var _ = json.RawMessage{}

