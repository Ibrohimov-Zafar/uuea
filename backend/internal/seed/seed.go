package seed

import (
	"database/sql"
	"time"
)

func Run(db *sql.DB) error {
	// Faqat a'zolik rejalari — tizim ishlashi uchun minimal zarur
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
	return nil
}
