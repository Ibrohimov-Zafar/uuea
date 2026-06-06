export type LegalResourceType = 'law' | 'decree' | 'business_news' | 'legal_info';

export type LegalResource = {
  id: string;
  title: string;
  excerpt: string;
  body: string;
  category: string;
  type: LegalResourceType;
  source: string;
  date: string;
  featured?: boolean;
};

export const legalCategories = [
  'Hammasi',
  'Qonunlar',
  'Qarorlar',
  "Biznes yangiliklari",
  'Huquqiy ma\'lumotlar',
] as const;

export const legalResources: LegalResource[] = [
  {
    id: 'lr-1',
    type: 'law',
    category: 'Qonunlar',
    title: "O'zbekiston Respublikasida tadbirkorlik faoliyati to'g'risida",
    excerpt: "Tadbirkorlik subyektlarining huquq va majburiyatlari, davlat kafolatlari va ro'yxatdan o'tish tartibi.",
    body: "Ushbu qonun tadbirkorlik erkinligini ta'minlaydi, davlat va xususiy sektor o'rtasidagi hamkorlikni tartibga soladi. UUEA a'zolari uchun qisqacha sharh va amaliy tavsiyalar tez orada qo'shiladi.\n\nAsosiy yo'nalishlar:\n• Tadbirkorlik subyektlarini tashkil etish\n• Litsenziyalash va ruxsatnomalar\n• Xo'jalik yurituvchi subyektlarning huquqlari\n\nTo'liq matn va yangilanishlar uchun rasmiy manbalarga murojaat qiling.",
    source: "O'zR Qonunchilik ma'lumotlari milliy bazasi",
    date: '2024-03-15',
    featured: true,
  },
  {
    id: 'lr-2',
    type: 'decree',
    category: 'Qarorlar',
    title: 'Kichik biznes va xususiy tadbirkorlikni qo\'llab-quvvatlash chora-tadbirlari',
    excerpt: "Prezident qarori: subsidiyalar, imtiyozli kreditlar va administrativ yengilliklar haqida.",
    body: "Qaror kichik biznes va XTJ uchun qo'llab-quvvatlash mexanizmlarini belgilaydi. UUEA a'zolari monitoring va konsultatsiya orqali yangi imkoniyatlardan xabardor qilinadi.",
    source: "O'zbekiston Respublikasi Prezidenti huzuridagi Axborot portali",
    date: '2025-01-20',
    featured: true,
  },
  {
    id: 'lr-3',
    type: 'business_news',
    category: "Biznes yangiliklari",
    title: 'AQSh–O\'zbekiston savdo va investitsiya hamkorligi yangilanishi',
    excerpt: 'Ikki mamlakat o\'rtasida yangi savdo imtiyozlari va investitsiya forumi e\'lon qilindi.',
    body: "So'nggi kelishuvlar eksport-import jarayonlarini soddalashtirish va qo'shma loyihalarni rag'batlantirishga qaratilgan. UUEA delegatsiyalari va a'zolar uchun networking tadbirlari rejalashtirilgan.",
    source: 'UUEA / Rasmiy e\'lonlar',
    date: '2025-02-10',
  },
  {
    id: 'lr-4',
    type: 'legal_info',
    category: "Huquqiy ma'lumotlar",
    title: 'Xorijiy investorlar uchun qisqa huquqiy yo\'riqnoma',
    excerpt: "O'zbekistonda biznes ochish, soliq va mehnat qonunchiligi bo'yicha asosiy punktlar.",
    body: "Ushbu ma'lumotnoma umumiy maqsadda tayyorlangan. Aniq holatlar uchun litsenziyalangan yurist bilan maslahatlashish tavsiya etiladi. UUEA korporativ a'zolar uchun huquqiy yo'naltirish xizmatlari rejalashtirilmoqda.",
    source: 'UUEA Huquqiy resurslar',
    date: '2025-01-05',
  },
  {
    id: 'lr-5',
    type: 'law',
    category: 'Qonunlar',
    title: 'Soliq kodeksining tadbirkorlar uchun muhim moddalari',
    excerpt: 'Yakka tartibdagi soliq to\'lovi, QQSing va aksizlar bo\'yicha asosiy o\'zgarishlar.',
    body: "Soliq rejimini tanlash, deklaratsiya topshirish muddatlari va imtiyozlar haqida qisqa sharh. Yangi o'zgarishlar kiritilganda ushbu bo'lim yangilanadi.",
    source: "Soliq qo'mitasi rasmiy ma'lumotlari",
    date: '2024-11-01',
  },
  {
    id: 'lr-6',
    type: 'decree',
    category: 'Qarorlar',
    title: 'Vazirlar Mahkamasi: eksportni rag\'batlantirish bo\'yicha qo\'shimcha chora-tadbirlar',
    excerpt: 'Eksportchilar uchun bojxona va logistika jarayonlarini soddalashtirish.',
    body: "Qaror eksport operatsiyalarini tezlashtirish va hujjatlar aylanishini raqamlashtirishni nazarda tutadi. Tegishli a'zolar uchun UUEA amaliy seminarlar o'tkazadi.",
    source: "O'zR Vazirlar Mahkamasi",
    date: '2024-09-18',
  },
  {
    id: 'lr-7',
    type: 'business_news',
    category: "Biznes yangiliklari",
    title: 'Raqamli iqtisodiyot va startap ekotizimi rivojlanishi',
    excerpt: "IT-parklar, venchur fondlar va startap grantlari bo'yicha so'nggi yangiliklar.",
    body: "Startaplar va texnologik kompaniyalar uchun yangi dasturlar e'lon qilindi. UUEA networking va investor uchrashuvlari orqali loyihalarni targ'ib qiladi.",
    source: 'UUEA Yangiliklar',
    date: '2025-03-01',
  },
  {
    id: 'lr-8',
    type: 'legal_info',
    category: "Huquqiy ma'lumotlar",
    title: 'Mehnat shartnomalari va xodimlarni jalb qilish tartibi',
    excerpt: "Ish beruvchi va xodim o'rtasidagi asosiy huquqiy talablar, shartnoma turlari.",
    body: "Mehnat munosabatlarini rasmiylashtirish, ish vaqti va ish haqi bo'yicha minimal talablar. Korporativ a'zolar uchun HR bo'yicha qo'shimcha materiallar tez orada.",
    source: 'UUEA Huquqiy resurslar',
    date: '2024-12-12',
  },
];
