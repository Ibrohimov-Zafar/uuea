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
	if err := seedLegalResources(db); err != nil {
		return err
	}
	_ = seedHomepageData(db)
	return nil
}

func seedHomepageData(db *sql.DB) error {
	now := time.Now().UTC().Format(time.RFC3339)

	var n int
	_ = db.QueryRow(`SELECT COUNT(*) FROM partners`).Scan(&n)
	if n == 0 {
		partners := []struct{ id, name, website string; order int }{
			{"p1", "Google", "https://google.com", 1},
			{"p2", "Amazon", "https://amazon.com", 2},
			{"p3", "Meta", "https://meta.com", 3},
			{"p4", "JPMorgan", "https://jpmorgan.com", 4},
			{"p5", "Microsoft", "https://microsoft.com", 5},
			{"p6", "IBM", "https://ibm.com", 6},
			{"p7", "Cisco", "https://cisco.com", 7},
			{"p8", "Oracle", "https://oracle.com", 8},
			{"p9", "SAP", "https://sap.com", 9},
			{"p10", "Siemens", "https://siemens.com", 10},
		}
		for _, p := range partners {
			db.Exec(`INSERT INTO partners (id, name, logo_url, website, sort_order, is_active, created_at, updated_at) VALUES (?,?,?,?,?,1,?,?)`,
				p.id, p.name, "", p.website, p.order, now, now)
		}
	}

	_ = db.QueryRow(`SELECT COUNT(*) FROM testimonials`).Scan(&n)
	if n == 0 {
		testimonials := []struct{ id, name, company, role, review, avatar string; rating, order int }{
			{"t1", "Jasur Karimov", "TechVenture UZ", "Asoschisi va CEO",
				"Ushbu assotsiatsiya biznesingiz uchun haqiqiy ko'tarilish platformasi. Tarmoqlash tadbirlarida ko'plab foydali hamkorlarni topdim. A'zolik investitsiyam o'zini bir yil ichida to'liq qopladi.",
				"JK", 5, 1},
			{"t2", "Malika Yusupova", "Green Solutions LLC", "Bosh Direktori",
				"Assotsiatsiyaning himoya bo'limi bizga davlat tuzilmalari bilan muloqolda juda katta yordam berdi. Professional xizmat va haqiqiy natijalar.",
				"MY", 5, 2},
			{"t3", "Bobur Toshmatov", "Export Trade Co.", "Savdo Direktori",
				"Xalqaro a'zolik orqali yangi bozorlarga kirdik. Eksport yo'nalishida professional maslahatlar va aloqalar orqali biznesimiz 40% o'sdi.",
				"BT", 5, 3},
			{"t4", "Nilufar Razzaqova", "Fashion House Tashkent", "Kreativ Direktori",
				"Marketing va brendlash bo'yicha ko'mak ajoyib bo'ldi. Katalogdagi VIP ro'yxat orqali mijozlar soni ikki barobarga oshdi.",
				"NR", 5, 4},
		}
		for _, t := range testimonials {
			db.Exec(`INSERT INTO testimonials (id, name, company, role, review, avatar, rating, sort_order, is_active, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,1,?,?)`,
				t.id, t.name, t.company, t.role, t.review, t.avatar, t.rating, t.order, now, now)
		}
	}

	_ = db.QueryRow(`SELECT COUNT(*) FROM site_stats`).Scan(&n)
	if n == 0 {
		stats := []struct{ id, label, suffix string; value, order int }{
			{"ss1", "Bizneslar", "+", 2500, 1},
			{"ss2", "Tadbirkorlar", "+", 850, 2},
			{"ss3", "A'zolar", "+", 1200, 3},
			{"ss4", "Iste'molchilar", "+", 50000, 4},
		}
		for _, s := range stats {
			db.Exec(`INSERT INTO site_stats (id, label, value, suffix, sort_order, updated_at) VALUES (?,?,?,?,?,?)`,
				s.id, s.label, s.value, s.suffix, s.order, now)
		}
	}

	_ = db.QueryRow(`SELECT COUNT(*) FROM site_services`).Scan(&n)
	if n == 0 {
		services := []struct{ id, icon, title, subtitle, description, features string; order int }{
			{"sv1", "Megaphone", "Ko'tarilish", "Promotion",
				"Biznesingizni keng auditoriyaga taniting. Marketing strategiyalari va raqamli platformalar orqali brendingizni mustahkamlang.",
				`["Raqamli marketing","Media hamkorlik","Brendlash strategiyasi","PR xizmatlari"]`, 1},
			{"sv2", "LifeBuoy", "Qo'llab-quvvatlash", "Support",
				"Biznes rivojlantirishda ekspert maslahatlari va resurslar. Har bir bosqichda professional yordam.",
				`["Biznes maslahat","Yuridik yordam","Moliyaviy maslahat","Resurslar bazasi"]`, 2},
			{"sv3", "Shield", "Himoya", "Advocacy",
				"Biznes huquqlarini himoya qilish va davlat tuzilmalari bilan muloqot.",
				`["Siyosiy ta'sir","Huquqiy himoya","Sanoat vakili","Iste'molchi himoyasi"]`, 3},
			{"sv4", "Network", "Tarmoqlash", "Networking",
				"Professional aloqalar o'rnatish va hamkorlik imkoniyatlari. Kuchli biznes ekotizimiga qo'shiling.",
				`["Biznes uchrashuvlari","Sanoat forumlar","Hamkorlik platformasi","Mentoringlar"]`, 4},
			{"sv5", "TrendingUp", "Iqtisodiy Rivojlantirish", "Economic Dev",
				"Mintaqa iqtisodiyotini rivojlantirish dasturlari va sarmoya jalb qilish bo'yicha ko'mak.",
				`["Sarmoya jalb qilish","Mahalliy rivojlantirish","Export yordam","Grant dasturlari"]`, 5},
			{"sv6", "Users", "Ish Kuchi Rivojlantirish", "Workforce Dev",
				"Xodimlar malakasini oshirish va ish bilan ta'minlash dasturlari.",
				`["Treninglar","Malaka oshirish","Ish joylari yarmarkalari","Sertifikatlar"]`, 6},
		}
		for _, s := range services {
			db.Exec(`INSERT INTO site_services (id, icon, title, subtitle, description, features, sort_order, is_active, created_at, updated_at) VALUES (?,?,?,?,?,?,?,1,?,?)`,
				s.id, s.icon, s.title, s.subtitle, s.description, s.features, s.order, now, now)
		}
	}

	return nil
}
