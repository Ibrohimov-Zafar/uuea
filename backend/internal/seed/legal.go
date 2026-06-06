package seed

import (
	"database/sql"
	"time"
)

func seedLegalResources(db *sql.DB) error {
	var n int
	_ = db.QueryRow(`SELECT COUNT(*) FROM legal_resources`).Scan(&n)
	if n > 0 {
		return nil
	}
	now := time.Now().UTC().Format(time.RFC3339)
	items := []struct {
		id, title, excerpt, body, category, rtype, source, pubDate string
		featured                                                     int
	}{
		{
			"lr-1", "O'zbekiston Respublikasida tadbirkorlik faoliyati to'g'risida",
			"Tadbirkorlik subyektlarining huquq va majburiyatlari, davlat kafolatlari va ro'yxatdan o'tish tartibi.",
			"Ushbu qonun tadbirkorlik erkinligini ta'minlaydi, davlat va xususiy sektor o'rtasidagi hamkorlikni tartibga soladi.\n\nAsosiy yo'nalishlar:\n• Tadbirkorlik subyektlarini tashkil etish\n• Litsenziyalash va ruxsatnomalar\n• Xo'jalik yurituvchi subyektlarning huquqlari",
			"Qonunlar", "law", "O'zR Qonunchilik ma'lumotlari milliy bazasi", "2024-03-15", 1,
		},
		{
			"lr-2", "Kichik biznes va xususiy tadbirkorlikni qo'llab-quvvatlash chora-tadbirlari",
			"Prezident qarori: subsidiyalar, imtiyozli kreditlar va administrativ yengilliklar haqida.",
			"Qaror kichik biznes va XTJ uchun qo'llab-quvvatlash mexanizmlarini belgilaydi. UUEA a'zolari monitoring va konsultatsiya orqali yangi imkoniyatlardan xabardor qilinadi.",
			"Qarorlar", "decree", "O'zbekiston Respublikasi Prezidenti huzuridagi Axborot portali", "2025-01-20", 1,
		},
		{
			"lr-3", "AQSh–O'zbekiston savdo va investitsiya hamkorligi yangilanishi",
			"Ikki mamlakat o'rtasida yangi savdo imtiyozlari va investitsiya forumi e'lon qilindi.",
			"So'nggi kelishuvlar eksport-import jarayonlarini soddalashtirish va qo'shma loyihalarni rag'batlantirishga qaratilgan.",
			"Biznes yangiliklari", "business_news", "UUEA / Rasmiy e'lonlar", "2025-02-10", 0,
		},
		{
			"lr-4", "Xorijiy investorlar uchun qisqa huquqiy yo'riqnoma",
			"O'zbekistonda biznes ochish, soliq va mehnat qonunchiligi bo'yicha asosiy punktlar.",
			"Ushbu ma'lumotnoma umumiy maqsadda tayyorlangan. Aniq holatlar uchun litsenziyalangan yurist bilan maslahatlashish tavsiya etiladi.",
			"Huquqiy ma'lumotlar", "legal_info", "UUEA Huquqiy resurslar", "2025-01-05", 0,
		},
		{
			"lr-5", "Soliq kodeksining tadbirkorlar uchun muhim moddalari",
			"Yakka tartibdagi soliq to'lovi, QQSing va aksizlar bo'yicha asosiy o'zgarishlar.",
			"Soliq rejimini tanlash, deklaratsiya topshirish muddatlari va imtiyozlar haqida qisqa sharh.",
			"Qonunlar", "law", "Soliq qo'mitasi rasmiy ma'lumotlari", "2024-11-01", 0,
		},
		{
			"lr-6", "Vazirlar Mahkamasi: eksportni rag'batlantirish bo'yicha qo'shimcha chora-tadbirlar",
			"Eksportchilar uchun bojxona va logistika jarayonlarini soddalashtirish.",
			"Qaror eksport operatsiyalarini tezlashtirish va hujjatlar aylanishini raqamlashtirishni nazarda tutadi.",
			"Qarorlar", "decree", "O'zR Vazirlar Mahkamasi", "2024-09-18", 0,
		},
		{
			"lr-7", "Raqamli iqtisodiyot va startap ekotizimi rivojlanishi",
			"IT-parklar, venchur fondlar va startap grantlari bo'yicha so'nggi yangiliklar.",
			"Startaplar va texnologik kompaniyalar uchun yangi dasturlar e'lon qilindi.",
			"Biznes yangiliklari", "business_news", "UUEA Yangiliklar", "2025-03-01", 0,
		},
		{
			"lr-8", "Mehnat shartnomalari va xodimlarni jalb qilish tartibi",
			"Ish beruvchi va xodim o'rtasidagi asosiy huquqiy talablar, shartnoma turlari.",
			"Mehnat munosabatlarini rasmiylashtirish, ish vaqti va ish haqi bo'yicha minimal talablar.",
			"Huquqiy ma'lumotlar", "legal_info", "UUEA Huquqiy resurslar", "2024-12-12", 0,
		},
	}
	for _, it := range items {
		_, err := db.Exec(`INSERT INTO legal_resources (id, title, excerpt, body, category, resource_type, source, published_date, is_featured, status, created_at, updated_at)
			VALUES (?,?,?,?,?,?,?,?,?,'published',?,?)`,
			it.id, it.title, it.excerpt, it.body, it.category, it.rtype, it.source, it.pubDate, it.featured, now, now)
		if err != nil {
			return err
		}
	}
	return nil
}
