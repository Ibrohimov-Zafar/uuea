package seed

import (
	"database/sql"
	"time"
)

func Run(db *sql.DB) error {
	var n int
	_ = db.QueryRow(`SELECT COUNT(*) FROM membership_plans`).Scan(&n)
	if n == 0 {
		now := time.Now().UTC().Format(time.RFC3339)
		plans := []struct {
			slug, name string
			price      float64
			features   string
		}{
			{"starter", "Starter", 99, `["Biznes katalogi profili","2 ta tadbir chiptyasi","Oylik newsletter","A'zo forumi"]`},
			{"business", "Business", 249, `["Biznes katalogi profili","5 ta tadbir chiptyasi","Oylik newsletter","A'zo forumi","Reklama","Maslahat sessiyasi"]`},
			{"corporate", "Corporate", 599, `["Biznes katalogi profili","10 ta tadbir chiptyasi","Oylik newsletter","A'zo forumi","Reklama","Maslahat sessiyasi","VIP badge"]`},
			{"international", "International", 999, `["Biznes katalogi profili","Cheksiz tadbir chiptyalari","Oylik newsletter","A'zo forumi","Reklama","Maslahat sessiyasi","VIP badge","Xalqaro tarmoq"]`},
		}
		for _, p := range plans {
			_, _ = db.Exec(`INSERT INTO membership_plans (slug, name, price_usd, features, created_at) VALUES (?,?,?,?,?)`,
				p.slug, p.name, p.price, p.features, now)
		}
	}

	_ = db.QueryRow(`SELECT COUNT(*) FROM events`).Scan(&n)
	if n == 0 {
		now := time.Now().UTC().Format(time.RFC3339)
		_, _ = db.Exec(`INSERT INTO events (id, title, description, category, location, event_date, event_time, price_usd, spots_total, spots_remaining, is_featured, is_active, created_at, updated_at)
			VALUES ('e1','Biznes Networking Meetup','Tadbirkorlar uchun networking.','Networking','Toshkent',date('now','+14 days'),'18:30',0,120,120,1,1,?,?)`, now, now)
	}

	_ = db.QueryRow(`SELECT COUNT(*) FROM businesses`).Scan(&n)
	if n == 0 {
		now := time.Now().UTC().Format(time.RFC3339)
		_, _ = db.Exec(`INSERT INTO businesses (id, name, category, description, phone, email, address, is_vip, is_active, created_at, updated_at)
			VALUES ('b1','Zafar Logistics','Logistika','Yuk tashish xizmatlari.','+998712000000','info@example.com','Toshkent',1,1,?,?)`, now, now)
	}
	return nil
}
