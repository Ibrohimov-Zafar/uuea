ilovTalablar hujjati
1. Ilova haqida umumiy ma'lumot
1.1 Ilova nomi
Chamber of Commerce Platform

1.2 Ilova tavsifi
Brooklyn Chamber of Commerce uslubida yaratilgan, lekin zamonaviyroq va premium ko'rinishli Chamber of Commerce veb-sayt platformasi. Platforma bizneslar, tadbirkorlar va a'zolar uchun networking, xizmatlar, tadbirlar va biznes katalog imkoniyatlarini taqdim etadi. Navy Blue dominant dizayn (#061423), glassmorphism elementlar va mystical uslub bilan qurilgan. Ko'p tilli qo'llab-quvvatlash (O'zbek, Rus, English) bilan.

1.3 Maqsad
Chamber ecosystem, Business networking platform, Economic community hub va Membership platform sifatida ishlaydigan to'liq funksional veb-sayt yaratish.

2. Foydalanuvchilar va foydalanish stsenariylari
2.1 Maqsadli foydalanuvchilar
Biznes egalari va tadbirkorlar
Chamber a'zolari
Iste'molchilar va potensial mijozlar
Tashkilot administratorlari
2.2 Asosiy foydalanish stsenariylari
Bizneslar Chamber a'zosi bo'lish uchun ro'yxatdan o'tadi
A'zolar biznes katalogda o'z profillarini boshqaradi
Foydalanuvchilar tadbirlarga ro'yxatdan o'tadi
Bizneslar networking imkoniyatlaridan foydalanida
Foydalanuvchilar yangiliklar va bloglarni o'qiydi
Administratorlar platformani boshqaradi
Administratorlar email tizimini sinab ko'radi
Foydalanuvchilar dashboard orqali a'zolik va to'lov tarixini ko'radi
Foydalanuvchilar saqlangan karta ma'lumotlarini boshqaradi
Foydalanuvchilar obunani bekor qiladi
Foydalanuvchilar interfeys tilini o'zgartiradi
3. Sahifa tuzilmasi va funksional tavsif
3.1 Sahifa ierarxiyasi
Chamber of Commerce Platform
├── Home
├── Who We Are
├── Services
├── Membership
├── Business Directory
├── Events
├── News/Blog
├── Contact
├── Join Membership
├── Member Dashboard
│   ├── Overview
│   ├── Membership
│   ├── Events
│   ├── Directory Profile
│   ├── Messages
│   ├── Billing
│   └── Settings
└── Admin Panel
    ├── Foydalanuvchi boshqaruvi
    ├── A'zolik boshqaruvi
    ├── Events CRUD
    ├── Blog CRUD
    ├── Directory CRUD
    ├── Newsletter boshqaruvi
    ├── Email sinov funksiyasi
    ├── Stripe Webhook Secret yo'riqnomasi
    └── Analitika
3.2 Umumiy komponentlar
3.2.1 Header
Top Header (40px balandlik, Dark Navy fon)

Chap tomon: Telefon raqami va Email manzili ko'rsatiladi
O'ng tomon: Login havolasi va Join Membership tugmasi
Main Navbar

Chap tomon: Logo (oq versiya)
Markazda: Navigatsiya menyusi (Home, Who We Are, Services, Membership, Directory, Events, News, Contact)
O'ng tomon: Til almashtirish tugmasi va JOIN NOW tugmasi
Til almashtirish tugmasi

Joylashuv: Navbar o'ng tomonida, JOIN NOW tugmasi yonida
Tillar: O'zbek (UZ), Rus (RU), English (EN)
Dizayn: Navy Blue fon, glassmorphism effekt, mystical uslub
Bosilganda: Dropdown menu ochiladi, foydalanuvchi tilni tanlaydi
Tanlangan til localStorage'da saqlanadi
Butun sayt interfeysi tanlangan tilda ko'rsatiladi
3.2.2 Footer
Asosiy Footer (4 ustun)

1-ustun: Logo va qisqa tavsif
2-ustun: Tez havolalar
3-ustun: Xizmatlar ro'yxati
4-ustun: Aloqa ma'lumotlari
Pastki Footer

Privacy Policy, Accessibility, Copyright ma'lumotlari
Fon rangi: #061423
3.3 Home sahifasi
3.3.1 Hero bo'limi
Chap tomon: Katta sarlavha ("Empowering Businesses & Entrepreneurs"), subtitle matn
Chap tomon: Ikki CTA tugma ("Join Membership" primary, "Explore Directory" secondary)
O'ng tomon: Premium biznes/jamiyat tasviri
Fon: Navy gradient, oq matn, fade-in animatsiya
3.3.2 Statistikalar bo'limi
4 ustunli grid: Businesses, Entrepreneurs, Members, Consumers
Har bir ustunda raqam va tavsif
Animatsiyali hisoblagichlar
3.3.3 Asosiy xizmatlar bo'limi
4 karta: Promotion, Support, Advocacy, Networking
Har bir karta: Ikon, sarlavha, qisqa tavsif
Glassmorphism kartalar, minimal line ikonlar, Navy overlay
3.3.4 Sheriklar/Investorlar bo'limi
Gorizontal logo slider
Sheriklar: Google, Amazon, Meta, JPMorgan va boshqalar
3.3.5 Yaqindagi tadbirlar bo'limi
Slider formatida tadbirlar
Har bir tadbir: Rasm, Sana, Sarlavha, Joylashuv, Register tugmasi
3.3.6 Biznes katalog preview bo'limi
Biznes kartalar: Logo, Nom, Kategoriya, Qisqa tavsif
Qidiruv input maydoni
3.3.7 A'zolik rejalari bo'limi
Narxlash kartalar: Starter, Business, Corporate, International
Har bir reja: Narx, xususiyatlar ro'yxati (Networking, Events, Promotion, Directory listing)
CTA: "Become Member" tugmasi
3.3.8 Fikrlar bo'limi
Slider formatida mijoz sharhlari
Har bir sharh: Avatar, Ism, Kompaniya nomi, Sharh matni
3.3.9 Newsletter bo'limi
Ro'yxatdan o'tish formasi: Ism, Familiya, Email maydonlari
Submit tugmasi
Quyuq navy fon
3.4 Who We Are sahifasi
3.4.1 Tashkilot haqida bo'limi
Tashkilot tarixi va maqsadi haqida matn
3.4.2 Rahbariyat va jamoa bo'limi
Jamoa a'zolari kartalar: Rasm, Ism, Lavozim, Qisqa biografiya
3.4.3 Missiya va Vizyon bo'limi
Missiya bayonoti
Viziya bayonoti
3.4.4 Asosiy sheriklar bo'limi
Sheriklar ro'yxati va logolar
3.4.5 Vaqt chizig'i (Timeline) bo'limi
Tashkilot tarixidagi muhim voqealar
Yil, tavsif
3.5 Services sahifasi
3.5.1 Xizmatlar ro'yxati
Kartalar/Grid formatida xizmatlar
Xizmatlar: Business Promotion, Advocacy, Economic Development, Workforce Development, Consulting, Networking
Har bir karta: Ikon, sarlavha, tavsif
3.5.2 CTA bo'limi
Contact Us tugmasi
3.6 Membership sahifasi
3.6.1 A'zolik rejalari va narxlar bo'limi
Narxlash kartalar: Starter, Business, Corporate, International
Har bir reja: Narx, xususiyatlar ro'yxati
Har bir karta uchun "To'lov qilish" tugmasi
3.6.2 Foyda va imtiyozlar bo'limi
A'zolik imtiyozlari ro'yxati
3.6.3 Qo'shilish formasi bo'limi
Forma maydonlari: Ism, Email, Telefon, Kompaniya nomi, A'zolik turi
Submit tugmasi
3.6.4 FAQ bo'limi
Tez-tez so'raladigan savollar va javoblar
3.6.5 To'lov integratsiyasi
"To'lov qilish" tugmasi bosilganda Stripe Checkout Session yaratiladi
Foydalanuvchi Stripe to'lov sahifasiga yo'naltiriladi
To'lov muvaffaqiyatli bo'lganda foydalanuvchi a'zoligi yangilanadi
3.7 Business Directory sahifasi
3.7.1 Qidiruv va filterlar bo'limi
Qidiruv input maydoni
Filterlar: Kategoriya, Joylashuv, A'zolik turi
3.7.2 Kategoriyalar bo'limi
Biznes kategoriyalari ro'yxati
3.7.3 Kompaniya profillari bo'limi
Biznes kartalar: Logo, Nom, Tarmoq, Tavsif, Veb-sayt havolasi, Ijtimoiy tarmoq havolalari
VIP badge premium ro'yxatlar uchun
3.8 Events sahifasi
3.8.1 Yaqindagi tadbirlar bo'limi
Tadbir kartalar: Banner rasm, Sana, Vaqt, Joylashuv, CTA tugma
3.8.2 Tadbir tafsilotlari sahifasi
Tadbir haqida to'liq ma'lumot
Ro'yxatdan o'tish formasi
Ro'yxatdan o'tgandan keyin tadbir tafsilotlari bilan tasdiqlash emaili yuboriladi
3.9 News/Blog sahifasi
3.9.1 Kategoriyalar va qidiruv bo'limi
Kategoriyalar ro'yxati
Qidiruv input maydoni
3.9.2 Asosiy maqola bo'limi
Eng so'nggi yoki muhim maqola
3.9.3 So'nggi yangiliklar bo'limi
Yangilik kartalar: Thumbnail rasm, Sarlavha, Sana, Qisqa matn
3.9.4 Maqola tafsilotlari sahifasi
To'liq maqola matni
Muallif ma'lumotlari
Sana
3.10 Contact sahifasi
3.10.1 Aloqa formasi bo'limi
Forma maydonlari: Ism, Email, Telefon, Xabar
Submit tugmasi
3.10.2 Google Maps bo'limi
Tashkilot manzili xaritada ko'rsatiladi
3.10.3 Aloqa ma'lumotlari bo'limi
Manzil, Email, Telefon
3.11 Join Membership sahifasi
3.11.1 A'zolik formasi
Forma maydonlari: Ism, Familiya, Email, Telefon, Kompaniya nomi, Kompaniya manzili, A'zolik turi
"To'lov qilish" tugmasi
Tugma bosilganda Stripe Checkout Session yaratiladi va foydalanuvchi to'lov sahifasiga yo'naltiriladi
3.12 Member Dashboard
3.12.1 Sidebar navigatsiya
Overview, Membership, Events, Directory Profile, Messages, Billing, Settings
3.12.2 Overview sahifasi
A'zolik holati kartasi: Joriy a'zolik holati ko'rsatiladi (Faol/Kutilmoqda/Muddati tugagan), Navy Blue fon, glassmorphism effekt
To'lov tarixi kartasi: Orders jadvalidagi to'lovlar ro'yxati ko'rsatiladi
Har bir to'lov: Sana, Summa, Reja nomi, Holat
Mystical dizayn uslubida (Navy Blue + glassmorphism)
Widgetlar: Yaqindagi tadbirlar, Analitika, Bildirishnomalar
3.12.3 Membership sahifasi
Joriy a'zolik ma'lumotlari
A'zolik yangilash imkoniyati
"To'lov qilish" tugmasi a'zolikni yangilash uchun
3.12.4 Events sahifasi
Ro'yxatdan o'tgan tadbirlar
Yangi tadbirlarga ro'yxatdan o'tish
3.12.5 Directory Profile sahifasi
Biznes profili tahrirlash
Logo yuklash
Aloqa ma'lumotlari yangilash
3.12.6 Messages sahifasi
Ichki xabarlar tizimi
Yangi xabar yozish
3.12.7 Billing sahifasi
To'lov tarixi: Barcha to'lovlar ro'yxati
Keyingi to'lov sanasi: Kelgusi to'lov muddati
Saqlangan karta ma'lumotlari: Oxirgi 4 raqam, karta turi, muddati ko'rsatiladi
Stripe Customer Portal havolasi: Karta yangilash va o'chirish uchun
Obunani bekor qilish tugmasi: Bosilganda tasdiq so'raladi, keyin obuna bekor qilinadi
3.12.8 Settings sahifasi
Profil ma'lumotlarini tahrirlash
Parol o'zgartirish
Bildirishnoma sozlamalari
3.13 Admin Panel
3.13.1 Foydalanuvchi boshqaruvi
Foydalanuvchilar ro'yxati
Foydalanuvchi qo'shish, tahrirlash, o'chirish
3.13.2 A'zolik boshqaruvi
A'zolar ro'yxati
A'zolik holati yangilash
A'zolik rejalari boshqaruvi
3.13.3 Events CRUD
Tadbirlar ro'yxati
Tadbir qo'shish, tahrirlash, o'chirish
3.13.4 Blog CRUD
Maqolalar ro'yxati
Maqola qo'shish, tahrirlash, o'chirish
3.13.5 Directory CRUD
Biznes ro'yxati
Biznes qo'shish, tahrirlash, o'chirish
3.13.6 Newsletter boshqaruvi
Obunachi ro'yxati
Newsletter yuborish
3.13.7 Email sinov funksiyasi
"Sinov email yuborish" tugmasi
Tugma bosilganda admin o'z emailiga sinov xabar yuboriladi
Resend integratsiyasi orqali email yuboriladi
Muvaffaqiyatli yuborilganda tasdiqlash xabari ko'rsatiladi
3.13.8 Stripe Webhook Secret yo'riqnomasi
Yo'riqnoma bo'limi: STRIPE_WEBHOOK_SECRET ni qanday olish va o'rnatish kerakligi haqida aniq ko'rsatma
Qadamlar:
Stripe Dashboard ga kirish
Developers bo'limiga o'tish
Webhooks bo'limini ochish
Yangi webhook endpoint yaratish
Signing secret ni nusxalash
Muhit o'zgaruvchisiga qo'shish
3.13.9 Analitika
Sayt statistikasi
Foydalanuvchi faolligi
A'zolik o'sishi
4. Biznes qoidalari va mantiq
4.1 Ro'yxatdan o'tish va kirish
Foydalanuvchilar email va parol orqali ro'yxatdan o'tadilar
Ro'yxatdan o'tgandan keyin email tasdiqlash kerak
Ro'yxatdan o'tgandan keyin xush kelibsiz email yuboriladi (Supabase Edge Function orqali)
Foydalanuvchilar email va parol orqali tizimga kiradilar
4.2 A'zolik tizimi
To'rt xil a'zolik turi: Starter, Business, Corporate, International
Har bir a'zolik turi o'z narxi va imtiyozlariga ega
A'zolik to'lovi Stripe orqali amalga oshiriladi
Foydalanuvchi "To'lov qilish" tugmasini bosganda Supabase Edge Function Stripe Checkout Session yaratadi
To'lov muvaffaqiyatli bo'lganda Stripe Webhook orqali to'lov holati tekshiriladi
To'lov tasdiqlangandan keyin foydalanuvchi a'zoligi yangilanadi
A'zolik muddati tugaganda foydalanuvchiga bildirishnoma yuboriladi
4.3 Biznes katalog
Faqat a'zolar biznes katalogda profil yarata oladi
Premium a'zolar VIP badge oladi
Biznes profillari qidiruv va filterlar orqali topiladi
4.4 Tadbirlar
Barcha foydalanuvchilar tadbirlarni ko'ra oladi
Tadbirlarga ro'yxatdan o'tish uchun tizimga kirish kerak
Ro'yxatdan o'tgandan keyin foydalanuvchiga tadbir tafsilotlari bilan tasdiqlash emaili yuboriladi (Supabase Edge Function orqali)
4.5 Newsletter
Foydalanuvchilar newsletter uchun ro'yxatdan o'tishlari mumkin
Newsletter obunasini bekor qilish imkoniyati mavjud
4.6 Admin huquqlari
Administratorlar barcha ma'lumotlarni boshqara oladi
Administratorlar foydalanuvchi rollarini o'zgartira oladi
Administratorlar email tizimini sinab ko'rish uchun sinov email yuborishi mumkin
Administratorlar Stripe Webhook Secret sozlash yo'riqnomasini ko'rishi mumkin
4.7 Email bildirishnomalar tizimi
Email yuborish uchun Supabase Edge Function ishlatiladi
Email provayderidan foydalaniladi (Resend yoki SMTP)
Xush kelibsiz email: Foydalanuvchi ro'yxatdan o'tganda yuboriladi
Tadbir tasdiqlash emaili: Tadbirga ro'yxatdan o'tganda tadbir tafsilotlari bilan yuboriladi
To'lov muvaffaqiyatsiz email: To'lov muvaffaqiyatsiz bo'lganda foydalanuvchiga yuboriladi, bank ma'lumotlarini yangilash uchun Stripe Customer Portal havolasi qo'shiladi
A'zolik muddati tugash eslatmasi: A'zolik muddati tugashidan 7 kun oldin yuboriladi, a'zolik muddati tugash sanasi va yangilash havolasi qo'shiladi
Sinov email: Admin panel orqali Resend integratsiyasini sinab ko'rish uchun yuboriladi
4.8 Stripe to'lov integratsiyasi
Membership sahifasida har bir reja uchun "To'lov qilish" tugmasi mavjud
JoinPage va MembershipPage sahifalarida to'lov oqimi amalga oshiriladi
Supabase Edge Function Stripe Checkout Session yaratadi
To'lov muvaffaqiyatli bo'lganda Webhook orqali to'lov holati tekshiriladi va foydalanuvchi a'zoligi yangilanadi
Karta ma'lumotlarini saqlash: To'lov muvaffaqiyatli bo'lganda karta ma'lumotlari (oxirgi 4 raqam, karta turi, muddati) saqlanadi
Saqlangan kartadan to'lov: Keyingi to'lovda foydalanuvchi saqlangan kartani tanlashi mumkin
4.9 Stripe Webhook integratsiyasi
Stripe webhook endpoint Supabase Edge Function orqali yaratiladi
payment_intent.payment_failed event qabul qilinadi
To'lov muvaffaqiyatsiz bo'lganda foydalanuvchiga avtomatik email bildirishnoma yuboriladi
Email bildirishnomada to'lov muvaffaqiyatsiz bo'lganligi, qayta urinish kerakligi va Stripe Customer Portal havolasi qo'shiladi
4.10 Dashboard a'zolik va to'lov tarixi
DashboardPage Overview sahifasida foydalanuvchi o'z a'zolik holatini ko'radi
A'zolik holati: Faol, Kutilmoqda, Muddati tugagan
To'lov tarixi orders jadvalidan olinadi
Har bir to'lov: Sana, Summa, Reja nomi, Holat
Dizayn: Navy Blue fon, glassmorphism effekt, mystical uslub
4.11 Saqlangan karta va obunani boshqarish
Karta ma'lumotlari: Billing sahifasida saqlangan karta ko'rsatiladi (oxirgi 4 raqam, karta turi, muddati)
Stripe Customer Portal: Karta yangilash va o'chirish uchun havola taqdim etiladi
Obunani bekor qilish: Billing sahifasida "Obunani bekor qilish" tugmasi mavjud
Bekor qilish jarayoni: Tugma bosilganda tasdiq so'raladi, tasdiqlangandan keyin obuna bekor qilinadi va member_subscriptions statusu 'cancelled' ga o'zgartiriladi
4.12 A'zolik muddati tugash eslatmasi (Scheduled Edge Function)
Rejalashtirilgan vazifa: Supabase Scheduled Edge Function har kuni bir marta ishga tushadi
Tekshirish: A'zolik muddati tugashiga 7 kun qolgan foydalanuvchilar aniqlanadi
Email yuborish: Foydalanuvchiga avtomatik eslatma emaili yuboriladi
Email tarkibi: A'zolik muddati tugash sanasi va yangilash havolasi qo'shiladi
4.13 Ko'p tilli qo'llab-quvvatlash
Qo'llab-quvvatlanadigan tillar: O'zbek (UZ), Rus (RU), English (EN)
Til tanlash: Navbar o'ng tomonidagi til almashtirish tugmasi orqali
Til saqlash: Tanlangan til localStorage'da saqlanadi
Interfeys o'zgarishi: Til tanlanganda butun sayt interfeysi (barcha sahifalar, tugmalar, labellar, xabarlar) tanlangan tilda ko'rsatiladi
Tarjima fayllari: Har bir til uchun alohida tarjima fayllari
Tarjima tizimi: React Context yoki oddiy Context + hook orqali amalga oshiriladi
5. Istisno va chegara holatlari
Holat	Xatti-harakat
Foydalanuvchi noto'g'ri email yoki parol kiritsa	Xato xabari ko'rsatiladi
Email tasdiqlash havolasi muddati tugasa	Yangi havola yuborish imkoniyati taklif qilinadi
To'lov muvaffaqiyatsiz bo'lsa	Xato xabari ko'rsatiladi, qayta urinish taklif qilinadi, foydalanuvchiga Stripe Customer Portal havolasi bilan email bildirishnoma yuboriladi
Stripe Checkout Session yaratishda xatolik yuz bersa	Xato xabari ko'rsatiladi
Stripe Webhook to'lov holatini tasdiqlamasa	To'lov qayta tekshiriladi
Stripe Webhook payment_intent.payment_failed event qabul qilsa	Foydalanuvchiga to'lov muvaffaqiyatsiz email yuboriladi, Stripe Customer Portal havolasi qo'shiladi
Email yuborishda xatolik yuz bersa	Xato loglarda qayd etiladi, foydalanuvchiga umumiy xato xabari ko'rsatiladi
Sinov email yuborishda xatolik yuz bersa	Admin panelida xato xabari ko'rsatiladi
A'zolik muddati tugasa	Foydalanuvchiga bildirishnoma yuboriladi, yangilash taklif qilinadi
A'zolik muddati tugashiga 7 kun qolganda	Scheduled Edge Function avtomatik eslatma emaili yuboradi
Scheduled Edge Function ishga tushmasa	Xato loglarda qayd etiladi
Obunani bekor qilishda xatolik yuz bersa	Xato xabari ko'rsatiladi, qayta urinish taklif qilinadi
Stripe Customer Portal havolasi ishlamasa	Xato xabari ko'rsatiladi
Saqlangan karta ma'lumotlari topilmasa	"Karta ma'lumotlari mavjud emas" xabari ko'rsatiladi
Tadbir o'rnlari tugasa	Ro'yxatdan o'tish tugmasi o'chiriladi, kutish ro'yxati taklif qilinadi
Qidiruv natijasi topilmasa	"Natija topilmadi" xabari ko'rsatiladi
Forma maydonlari to'ldirilmasa	Majburiy maydonlar uchun xato xabari ko'rsatiladi
Foydalanuvchi ruxsatsiz sahifaga kirmoqchi bo'lsa	Login sahifasiga yo'naltiriladi
Orders jadvalida ma'lumot bo'lmasa	"To'lov tarixi mavjud emas" xabari ko'rsatiladi
Til tanlashda xatolik yuz bersa	Default til (English) ishlatiladi
localStorage mavjud bo'lmasa	Default til (English) ishlatiladi
Tarjima fayli topilmasa	Default til (English) ishlatiladi
6. Qabul qilish mezonlari
Foydalanuvchi Home sahifasini ochadi va asosiy ma'lumotlarni ko'radi
Foydalanuvchi navbar o'ng tomonidagi til tugmasini bosadi va tilni o'zgartiradi
Butun sayt interfeysi tanlangan tilda ko'rsatiladi
Foydalanuvchi "Join Membership" tugmasini bosadi va a'zolik formasini to'ldiradi
Foydalanuvchi "To'lov qilish" tugmasini bosadi va Stripe to'lov sahifasiga yo'naltiriladi
Foydalanuvchi to'lovni amalga oshiradi va a'zo bo'ladi
Foydalanuvchi xush kelibsiz email oladi
Foydalanuvchi tizimga kiradi va Member Dashboard sahifasiga o'tadi
Foydalanuvchi Overview sahifasida o'z a'zolik holati va to'lov tarixini ko'radi
Foydalanuvchi Billing sahifasida saqlangan karta ma'lumotlarini ko'radi
Foydalanuvchi Directory Profile sahifasida biznes profilini yaratadi
Foydalanuvchi Events sahifasida tadbirga ro'yxatdan o'tadi va tasdiqlash emaili oladi
Administrator Admin Panel orqali sinov email yuboradi va o'z emailida qabul qiladi
Administrator Stripe Webhook Secret sozlash yo'riqnomasini ko'radi
Foydalanuvchi a'zolik muddati tugashidan 7 kun oldin avtomatik eslatma emaili oladi
Foydalanuvchi Billing sahifasida obunani bekor qiladi
7. Ushbu bosqichda amalga oshirilmaydigan funksiyalar
Brooklyn Made bo'limi
VisitBrooklyn.NYC bo'limi
Donate funksiyasi
Mobil ilova
Real-time chat tizimi
Video konferensiya integratsiyasi
CRM integratsiyasi
Email marketing avtomatlashtirish
Advanced analitika va hisobotlar
API ochiq interfeys
White-label yechim
Franchise boshqaruvi
Multi-chamber platforma