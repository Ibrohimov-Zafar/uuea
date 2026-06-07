package db

import (
	"database/sql"
	"embed"
	"fmt"
	"os"
	"path/filepath"
	"time"

	"github.com/google/uuid"
	_ "modernc.org/sqlite"
)

//go:embed schema.sql
var schemaFS embed.FS

func Open(path string) (*sql.DB, error) {
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		return nil, err
	}
	dsn := fmt.Sprintf("file:%s?_pragma=foreign_keys(1)&_pragma=journal_mode(WAL)", path)
	conn, err := sql.Open("sqlite", dsn)
	if err != nil {
		return nil, err
	}
	if err := conn.Ping(); err != nil {
		return nil, err
	}
	schema, err := schemaFS.ReadFile("schema.sql")
	if err != nil {
		return nil, err
	}
	if _, err := conn.Exec(string(schema)); err != nil {
		return nil, err
	}
	runMigrations(conn)
	seedTeamMembers(conn)
	seedTimelineEvents(conn)
	seedPartners(conn)
	seedSiteAbout(conn)
	seedSiteMission(conn)
	return conn, nil
}

func runMigrations(db *sql.DB) {
	alters := []string{
		`ALTER TABLE news_posts ADD COLUMN title_ru TEXT`,
		`ALTER TABLE news_posts ADD COLUMN title_en TEXT`,
		`ALTER TABLE news_posts ADD COLUMN excerpt_ru TEXT`,
		`ALTER TABLE news_posts ADD COLUMN excerpt_en TEXT`,
		`ALTER TABLE news_posts ADD COLUMN body_ru TEXT`,
		`ALTER TABLE news_posts ADD COLUMN body_en TEXT`,
		`ALTER TABLE events ADD COLUMN title_ru TEXT`,
		`ALTER TABLE events ADD COLUMN title_en TEXT`,
		`ALTER TABLE events ADD COLUMN description_ru TEXT`,
		`ALTER TABLE events ADD COLUMN description_en TEXT`,
		`ALTER TABLE legal_resources ADD COLUMN title_ru TEXT`,
		`ALTER TABLE legal_resources ADD COLUMN title_en TEXT`,
		`ALTER TABLE legal_resources ADD COLUMN excerpt_ru TEXT`,
		`ALTER TABLE legal_resources ADD COLUMN excerpt_en TEXT`,
		`ALTER TABLE legal_resources ADD COLUMN body_ru TEXT`,
		`ALTER TABLE legal_resources ADD COLUMN body_en TEXT`,
		`ALTER TABLE legal_resources ADD COLUMN source_url TEXT`,
		`ALTER TABLE email_campaigns ADD COLUMN logo_url TEXT`,
		`ALTER TABLE businesses ADD COLUMN name_ru TEXT`,
		`ALTER TABLE businesses ADD COLUMN name_en TEXT`,
		`ALTER TABLE businesses ADD COLUMN category_ru TEXT`,
		`ALTER TABLE businesses ADD COLUMN category_en TEXT`,
		`ALTER TABLE businesses ADD COLUMN description_ru TEXT`,
		`ALTER TABLE businesses ADD COLUMN description_en TEXT`,
		`ALTER TABLE email_campaigns ADD COLUMN subject_ru TEXT`,
		`ALTER TABLE email_campaigns ADD COLUMN subject_en TEXT`,
		`ALTER TABLE email_campaigns ADD COLUMN body_ru TEXT`,
		`ALTER TABLE email_campaigns ADD COLUMN body_en TEXT`,
		`ALTER TABLE partners ADD COLUMN name_ru TEXT`,
		`ALTER TABLE partners ADD COLUMN name_en TEXT`,
		`ALTER TABLE partners ADD COLUMN description TEXT NOT NULL DEFAULT ''`,
		`ALTER TABLE partners ADD COLUMN description_ru TEXT`,
		`ALTER TABLE partners ADD COLUMN description_en TEXT`,
	}
	for _, q := range alters {
		db.Exec(q) //nolint: errcheck — duplicate column errors are expected on re-runs
	}
}

func seedTeamMembers(db *sql.DB) {
	var count int
	if err := db.QueryRow(`SELECT COUNT(*) FROM team_members`).Scan(&count); err != nil || count > 0 {
		return
	}
	now := time.Now().UTC().Format(time.RFC3339)
	members := []struct {
		name, role, bio, avatar string
		sort                    int
	}{
		{"Akbar Mirzayev", "Prezident", "20 yildan ortiq biznes rivojlantirishda tajriba. Mintaqaviy iqtisodiyot mutaxassisi.", "AM", 1},
		{"Sarvinoz Hasanova", "Bosh Direktor", "Xalqaro tijorat va investitsiyalar bo'yicha ekspert. 3 ta yirik savdo bitimini muvaffaqiyatli amalga oshirgan.", "SH", 2},
		{"Rustam Normatov", "Xizmatlar Direktori", "Biznes maslahat va iqtisodiy rivojlanish bo'yicha 15 yillik tajriba.", "RN", 3},
		{"Dilorom Umarova", "A'zolik Menejer", "A'zolik tizimini rivojlantirishda yetakchi. 500+ kompaniya bilan muloqot tajribasi.", "DU", 4},
		{"Jamshid Tursunov", "Tadbirlar Koordinatori", "Korporativ tadbirlarni rejalashtirish va o'tkazishda mutaxassis.", "JT", 5},
		{"Gulnora Yuldasheva", "Marketing Direktori", "Raqamli marketing va brend strategiyasi bo'yicha ekspert.", "GY", 6},
	}
	for _, m := range members {
		id := uuid.NewString()
		db.Exec(`INSERT INTO team_members (id, name, role, bio, avatar, linkedin, sort_order, is_active, created_at, updated_at)
			VALUES (?,?,?,?,?,?,?,1,?,?)`, id, m.name, m.role, m.bio, m.avatar, "#", m.sort, now, now) //nolint: errcheck
	}
}

func seedTimelineEvents(db *sql.DB) {
	var count int
	if err := db.QueryRow(`SELECT COUNT(*) FROM timeline_events`).Scan(&count); err != nil || count > 0 {
		return
	}
	now := time.Now().UTC().Format(time.RFC3339)
	events := []struct {
		year, title, titleRu, titleEn, desc, descRu, descEn string
		sort                                                   int
	}{
		{"2005", "Tashkil Etildi", "Основано", "Founded", "Biznes assotsiatsiya 25 ta asos a'zo bilan tashkil etildi.", "Бизнес-ассоциация основана 25 учредителями.", "The business association was founded with 25 founding members.", 1},
		{"2008", "100 A'zo", "100 Участников", "100 Members", "A'zolar soni 100 taga yetdi. Birinchi yillik forum o'tkazildi.", "Число членов достигло 100. Проведён первый ежегодный форум.", "Membership reached 100. The first annual forum was held.", 2},
		{"2012", "Xalqaro Hamkorlik", "Международное Партнёрство", "International Partnership", "Yevropa va Osiyo savdo palatalarining a'zosiga aylandi.", "Вступили в европейские и азиатские торговые палаты.", "Joined European and Asian chambers of commerce.", 3},
		{"2016", "Raqamli Platforma", "Цифровая Платформа", "Digital Platform", "Online biznes katalog va a'zolik platformasi ishga tushirildi.", "Запущен онлайн бизнес-каталог и платформа членства.", "Online business directory and membership platform launched.", 4},
		{"2020", "500 A'zo", "500 Участников", "500 Members", "Koronavirus qiyinchiligiga qaramay, a'zolar soni 500 dan oshdi.", "Несмотря на пандемию, число членов превысило 500.", "Despite the pandemic, membership exceeded 500.", 5},
		{"2023", "Yangi Bino", "Новое Здание", "New Building", "Zamonaviy conference center va co-working maydon ochildi.", "Открыт современный конференц-центр и коворкинг.", "A modern conference center and co-working space opened.", 6},
		{"2025", "Kelajak", "Будущее", "The Future", "2500+ biznes bilan mintaqaning yetakchi savdo uyushmasi.", "Ведущая торговая ассоциация региона с 2500+ компаниями.", "The region's leading trade association with 2500+ businesses.", 7},
	}
	for _, e := range events {
		id := uuid.NewString()
		db.Exec(`INSERT INTO timeline_events (id, year, title, title_ru, title_en, description, description_ru, description_en, sort_order, is_active, created_at, updated_at)
			VALUES (?,?,?,?,?,?,?,?,?,1,?,?)`, id, e.year, e.title, e.titleRu, e.titleEn, e.desc, e.descRu, e.descEn, e.sort, now, now) //nolint: errcheck
	}
}

func seedPartners(db *sql.DB) {
	var count int
	if err := db.QueryRow(`SELECT COUNT(*) FROM partners`).Scan(&count); err != nil || count > 0 {
		return
	}
	now := time.Now().UTC().Format(time.RFC3339)
	names := []string{"Google", "Amazon", "Meta", "JPMorgan", "Microsoft", "IBM", "Cisco", "Oracle", "SAP", "Siemens"}
	for i, name := range names {
		id := uuid.NewString()
		db.Exec(`INSERT INTO partners (id, name, logo_url, website, sort_order, is_active, created_at, updated_at)
			VALUES (?,?,?,?,?,1,?,?)`, id, name, "", "", i+1, now, now) //nolint: errcheck
	}
}

func seedSiteAbout(db *sql.DB) {
	var count int
	if err := db.QueryRow(`SELECT COUNT(*) FROM site_about`).Scan(&count); err != nil || count > 0 {
		return
	}
	now := time.Now().UTC().Format(time.RFC3339)
	stats := `[{"value":"2500+","label":"A'zo Biznes","label_ru":"Компаний-членов","label_en":"Member Businesses","sort_order":1},{"value":"50+","label":"Yillik Tadbir","label_ru":"Ежегодных событий","label_en":"Annual Events","sort_order":2},{"value":"15+","label":"Yil Tajriba","label_ru":"Лет опыта","label_en":"Years Experience","sort_order":3},{"value":"10+","label":"Xalqaro Hamkor","label_ru":"Международных партнёров","label_en":"International Partners","sort_order":4}]`
	db.Exec(`INSERT INTO site_about (id, badge, badge_ru, badge_en, title, title_ru, title_en, para1, para1_ru, para1_en, para2, para2_ru, para2_en, image_url, stats, updated_at)
		VALUES ('default',?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
		"Tashkilot Haqida", "Об организации", "About the Organization",
		"20 Yillik Ishonch va Tajriba", "20 лет доверия и опыта", "20 Years of Trust & Experience",
		"USA–Uzbekistan Entrepreneurs Association (UUEA) — AQSh va O'zbekiston o'rtasida tadbirkorlar, investorlar va biznes vakillarini birlashtiruvchi rasmiy assotsiatsiya. Delegatsiyalar, tadbirlar va a'zolik orqali transatlantik hamkorlikni rivojlantiramiz.",
		"USA–Uzbekistan Entrepreneurs Association (UUEA) — официальная ассоциация, объединяющая предпринимателей, инвесторов и деловых партнёров США и Узбекистана. Мы развиваем трансатлантическое партнёрство через делегации, мероприятия и членство.",
		"USA–Uzbekistan Entrepreneurs Association (UUEA) is the official association connecting entrepreneurs, investors, and business partners across the United States and Uzbekistan. We foster transatlantic partnership through delegations, events, and membership.",
		"Assotsiatsiyamiz a'zolari mintaqadagi barcha asosiy sohalarda faoliyat yuritadi: IT va texnologiya, qurilish, sog'liqni saqlash, ta'lim, savdo va ko'plab boshqa sohalarda. Biz ularning ovozi va kuchi bo'lib xizmat qilamiz.",
		"Члены нашей ассоциации работают во всех ключевых отраслях региона: ИТ и технологии, строительство, здравоохранение, образование, торговля и многих других. Мы — их голос и сила.",
		"Our members operate across all major sectors in the region: IT & technology, construction, healthcare, education, trade, and many more. We serve as their voice and strength.",
		"/h.png", stats, now) //nolint: errcheck
}

func seedSiteMission(db *sql.DB) {
	var count int
	if err := db.QueryRow(`SELECT COUNT(*) FROM site_mission`).Scan(&count); err != nil || count > 0 {
		return
	}
	now := time.Now().UTC().Format(time.RFC3339)
	cards := `[{"icon":"Target","title":"Missiyamiz","title_ru":"Наша миссия","title_en":"Our Mission","text":"Bizneslarni kuchaytirish, tadbirkorlarni qo'llab-quvvatlash va mintaqa iqtisodiyotini rivojlantirishga xizmat qilish. A'zolarimiz uchun real natijalar yaratish.","text_ru":"Усиление бизнеса, поддержка предпринимателей и развитие региональной экономики. Создание реальных результатов для наших членов.","text_en":"Empowering businesses, supporting entrepreneurs, and contributing to regional economic development. Creating real results for our members.","sort_order":1},{"icon":"Eye","title":"Vizyonimiz","title_ru":"Наше видение","title_en":"Our Vision","text":"O'zbekistonning eng ta'sirli va ishonchli biznes assotsiatsiyasi bo'lish. Mintaqamizni investitsiya va biznes uchun qulay markazga aylantirish.","text_ru":"Стать самой влиятельной и надёжной бизнес-ассоциацией Узбекистана. Превратить регион в привлекательный центр для инвестиций и бизнеса.","text_en":"To become the most influential and trusted business association in Uzbekistan. To transform the region into an attractive center for investment and business.","sort_order":2},{"icon":"Heart","title":"Qadriyatlarimiz","title_ru":"Наши ценности","title_en":"Our Values","text":"Halollik, shaffoflik, professionallik va innovatsiya. Har bir qarorimizda a'zolarimizning manfaati birinchi o'rinda turadi.","text_ru":"Честность, прозрачность, профессионализм и инновации. Интересы наших членов — всегда на первом месте.","text_en":"Integrity, transparency, professionalism, and innovation. The interests of our members always come first.","sort_order":3}]`
	db.Exec(`INSERT INTO site_mission (id, badge, badge_ru, badge_en, title, title_ru, title_en, cards, updated_at)
		VALUES ('default',?,?,?,?,?,?,?,?)`,
		"Maqsadimiz", "Наша цель", "Our Purpose",
		"Missiya va Vizyon", "Миссия и Видение", "Mission & Vision",
		cards, now) //nolint: errcheck
}
