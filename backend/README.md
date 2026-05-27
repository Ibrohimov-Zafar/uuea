# Go API backend

SQLite + JWT auth. Supabase o'rniga ishlatiladi.

## Ishga tushirish

```bash
# Loyiha ildizidan
pnpm dev:api

# yoki frontend + API birga
pnpm dev:full
```

API: `http://127.0.0.1:8787`

## Muhit o'zgaruvchilari

Backend `backend/.env` dan o'qiladi (`pnpm dev:api` shu papkadan ishga tushadi):

```bash
cp backend/.env.example backend/.env
# STRIPE_SECRET_KEY=sk_test_... qo'shing
```

| O'zgaruvchi | Default |
|-------------|---------|
| `API_PORT` | 8787 |
| `JWT_SECRET` | (majburiy productionda) |
| `DB_PATH` | `./data/app.db` |
| `STRIPE_SECRET_KEY` | Stripe checkout (faqat backend) |

Loyiha ildizidagi `.env` faqat `VITE_*` uchun (frontend).

## Asosiy endpointlar

- `POST /auth/signup`, `POST /auth/login`, `GET /me`
- `GET /membership-plans`, `GET /businesses`, `GET /events`
- `GET /notifications` (auth)
- `GET /admin/*` (admin auth)
