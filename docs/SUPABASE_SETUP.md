# Supabase sozlash (Biznes Chamber)

## 1. API kalitlari (`.env`)

Loyiha ildizida `.env` fayl:

```env
VITE_SUPABASE_URL=https://vigvqqfeulaewtettmig.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...
```

Kalitlarni olish:

1. [Supabase Dashboard](https://supabase.com/dashboard/project/vigvqqfeulaewtettmig/settings/api-keys)
2. **API Keys** → **Publishable key** (`sb_publishable_...`) nusxalang
3. **Project URL** ni `VITE_SUPABASE_URL` ga qo'ying

> **Muhim:** `sb_secret_...` kalitini frontend `.env` ga qo'ymang — faqat Edge Functions uchun.

`.env` ni gitga commit qilmang (`.gitignore` da).

---

## 2. Ma'lumotlar bazasi (migratsiyalar)

Hozirgi loyihadagi SQL fayllar: `supabase/migrations/00001` … `00009`.

### Variant A — Supabase CLI (tavsiya)

```bash
# CLI o'rnatish (bir marta)
pnpm add -g supabase

# Loyihaga kirish
cd "/Users/zafaribragimov/Desktop/untitled folder"

# Akkauntga kirish
supabase login

# Remote loyihaga bog'lash
pnpm db:link

# Barcha migratsiyalarni yuklash
pnpm db:push
```

### Variant B — SQL Editor (brauzer)

1. Dashboard → **SQL** → **New query**
2. Har bir faylni **tartib bilan** ochib, butun matnini ishga tushiring:
   - `00001_initial_schema.sql`
   - `00002_full_schema_v2.sql`
   - `00003` … `00008` (qolganlari)
   - `00010_seed_demo_data.sql` — demo ma’lumotlar (agar sahifalarda bo‘sh array kelsa)
   - `00009` — faqat email kampaniya cron; oldin **Extensions** → `pg_cron` + `pg_net` yoqing, yoki o'tkazib yuboring

---

## 3. Tekshirish

```bash
pnpm supabase:check
```

`✅ Supabase sozlangan` chiqsa — jadvallar tayyor.

Keyin dev serverni qayta ishga tushiring:

```bash
pnpm dev
```

---

## 4. Edge Functions (to'lov, email)

Dashboard → **Edge Functions** → har bir funksiya uchun **Secrets**:

| Secret | Qayerda kerak |
|--------|----------------|
| `STRIPE_SECRET_KEY` | `create_stripe_checkout`, `create-event-checkout`, `verify-stripe-payment` |
| `RESEND_API_KEY` | `send-email`, `campaign-schedular` |
| `SITE_URL` | `http://localhost:5173` (dev) yoki production domen |

`SUPABASE_URL` va `SUPABASE_SERVICE_ROLE_KEY` odatda avtomatik beriladi; yo'q bo'lsa Settings → API dan `sb_secret_...` qo'shing.

Funksiyalarni deploy:

```bash
supabase functions deploy
```

---

## 5. Birinchi admin foydalanuvchi

1. Saytda **Ro'yxatdan o'tish** (`/royxat`) — login `username`, email avtomatik `username@miaoda.com`
2. Dashboard → **SQL Editor**:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'SIZNING_USERNAME@miaoda.com';
```

3. `/admin` sahifasiga kiring.

---

## 6. Auth eslatmalari

- Kirish: `username` + parol (email = `username@miaoda.com`)
- Email tasdiqlash o'chirilgan (`supabase/config.toml`)
- RLS: oddiy foydalanuvchi faqat o'z ma'lumotini, admin — ko'proq huquq

---

## Muammolar

| Belgisi | Yechim |
|---------|--------|
| `Could not find the table ...` | `pnpm db:push` yoki SQL migratsiyalar |
| `Invalid API key` | Dashboarddan yangi publishable key, `.env` yangilang |
| Login ishlamaydi | Migratsiya + `profiles` trigger; foydalanuvchi ro'yxatdan o'tganini tekshiring |
| To'lov ishlamaydi | `STRIPE_SECRET_KEY` + Edge Functions deploy |
