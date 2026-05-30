# UUEA Website — Full Tasklist

User selects task IDs before implementation.

| ID | Status |
|----|--------|
| T01 | ✅ Done |
| T02 | ✅ Done |
| T03 | 🟡 Partial (demo team/stats remain) |
| T11 | ✅ Done |
| T12 | ✅ Done |

---

## T01 — Brand identity (P0)

Replace all Biznes Chamber / chamber.uz branding with UUEA.

**Files:** `Header.tsx`, `Footer.tsx`, `translations.ts`, `ContactPage.tsx`, `DashboardPage.tsx`, `AdminPage.tsx`, `index.html` title/meta

**Checklist:**
- [ ] Logo → `public/logo.png` (UUEA)
- [ ] Name: USA–Uzbekistan Entrepreneurs Association / UUEA
- [ ] Remove info@chamber.uz, www.chamber.uz
- [ ] Replace placeholder phone (+998 71 200-00-00) with user-provided number
- [ ] Replace Toshkent placeholder address with user-provided address
- [ ] Social media links (user provides URLs)
- [ ] Copyright line updated
- [ ] Admin PDF/receipt branding updated

**Blocked until user provides:** email, phone, address, social URLs

---

## T02 — Homepage hero & first-screen clarity (P0)

First screen must answer: who is UUEA and what does it do?

**Files:** `translations.ts` (heroTag, heroTitle, heroSub), `HomePage.tsx`

**Required messaging (adapt per language):**
- UUEA connects US and Uzbekistan entrepreneurs, investors, business reps, partners
- Delegations, events, networking, membership, business development
- Not generic "business chamber"

**Checklist:**
- [ ] heroTag → UUEA / full org name
- [ ] heroTitle → mission-focused headline
- [ ] heroSub → USA–Uzbekistan bridge, entrepreneurs, investors, delegations
- [ ] Stats copy aligned (remove fake "2500+ companies" unless verified)
- [ ] CTA buttons clear: Join vs Browse Directory

---

## T03 — Remove template/demo placeholder content (P0)

**Files:** `mockData.ts`, `HomePage.tsx`, `WhoWeArePage.tsx`, `ServicesPage.tsx`, `MembershipPage.tsx`

**Checklist:**
- [ ] Remove or replace "Chamber ekotizimi" copy
- [ ] Remove fake partner logos (Google, Amazon, etc.) unless real
- [ ] Remove or mark demo stats
- [ ] Align homepage membership section with API prices (not mockData $199–$2499)
- [ ] Services subtitles (English Promotion/Support) → UUEA services

---

## T04 — Navigation & page structure audit (P1)

All main nav items are **separate pages** (not hash sections). Fix gaps.

**Checklist:**
- [ ] Footer: add Katalog, Yangiliklar, Aloqa links
- [ ] Footer: Privacy / Terms / Accessibility → real pages or remove
- [ ] Footer social icons → real URLs
- [ ] 404: register `NotFound` or keep redirect to `/` (user decision)
- [ ] Document URL map for client (already: `/biz-haqimizda`, `/xizmatlar`, etc.)

---

## T05 — Fix broken buttons & links (P1)

| Location | Button | Fix |
|----------|--------|-----|
| HomePage | Ro'yxatdan O'tish (event card) | Link to `/tadbirlar` or open registration |
| HomePage | Obuna Bo'lish (newsletter) | Wire to API or hero-leads |
| HomePage | Directory preview cards | Wrap in `Link` to `/katalog/:id` |
| NewsPage | Ko'proq Yuklash | Pagination or remove button |
| ServicesPage | Batafsil Ma'lumot | Keep `/aloqa` or add service detail pages |
| Footer | Privacy, Terms, Accessibility | Real routes or remove |

---

## T06 — Full trilingual i18n (P1)

**Current gap:** Only nav/hero/dashboard partially translated; body stays Uzbek.

**Checklist:**
- [ ] Move HomePage section headings to `translations.ts`
- [ ] WhoWeArePage full translation
- [ ] ServicesPage full translation
- [ ] MembershipPage benefits, FAQ, CTAs
- [ ] Plan feature lists (DB JSON per lang or frontend map)
- [ ] `index.html` lang attribute sync with default
- [ ] API error messages localized
- [ ] No mixed-language on single page

---

## T07 — Membership plans (P2 — needs business approval)

**Do not finalize without user sign-off.**

Current API seed prices: Starter $99, Business $249, Corporate $599, International $999.

**Checklist:**
- [ ] User confirms plan names, prices, benefits
- [ ] Update `backend/internal/seed/seed.go` and admin plans
- [ ] Remove homepage mockData price mismatch
- [ ] Hide or "Coming Soon" checkout until approved

---

## T08 — Payment / Stripe (P2 — needs config)

**Current:** Stripe only. PayPal/Square not built.

**Checklist:**
- [ ] Confirm STRIPE_SECRET_KEY in production
- [ ] Document: auto-activates membership after payment (if logged in)
- [ ] Guest checkout behavior explained to client
- [ ] Email receipts (currently stub) — implement or disable
- [ ] Hide payment CTAs until plans + Stripe confirmed

---

## T09 — Login & member portal documentation (P1)

Portal is **real** (not demo). Optional UX improvements:

**Checklist:**
- [ ] Remove Messages "coming soon" or implement
- [ ] Catalog section in dashboard nav (type exists, UI missing)
- [ ] Register flow: remove `@miaoda.com` auto-email note for production
- [ ] Post-login onboarding copy for UUEA members

**Existing features (no code needed unless UX polish):**
- Dashboard: overview, membership, events, business submit, billing, profile, notifications

---

## T10 — Admin panel (P1 — mostly done)

Admin at `/admin` works. Gaps:

**Checklist:**
- [ ] Contact form submissions → new admin section (depends on T12)
- [ ] Rebrand admin UI strings (Biznes Chamber → UUEA)
- [ ] `SEED_DEMO=false` in production docker-compose
- [ ] Document admin credentials setup (not public)

---

## T11 — Remove public test accounts (P0)

**File:** `LoginPage.tsx` lines 134–137

**Checklist:**
- [ ] Delete test-account display block
- [ ] Remove `t('testAccounts')` or repurpose
- [ ] Production: `SEED_DEMO=false`, rotate admin password

---

## T12 — Contact form (P0)

**Current:** Client-only mock — submissions go nowhere.

**Checklist:**
- [ ] Backend: `POST /contact-messages` table + handler
- [ ] Admin: list/reply/delete messages
- [ ] Email notification to UUEA inbox (optional)
- [ ] Spam protection (rate limit / honeypot / captcha — user choice)
- [ ] Replace placeholder contact info with real UUEA data

---

## T13 — Business catalog (P1)

**Current:** API works; demo seed data; member submit → admin approve.

**Checklist:**
- [ ] Replace demo businesses with real or empty state
- [ ] Fix category filter mismatch (seed vs UI labels)
- [ ] VIP badge rules documented in admin
- [ ] Home preview uses API or clearly labeled "featured members"
- [ ] Empty state copy for new launch

---

## T14 — Events (P1)

**Checklist:**
- [ ] HomePage events → API instead of mockData
- [ ] Remove demo events or replace with real
- [ ] Fix home event register button (T05)
- [ ] Document free vs paid registration flow for client
- [ ] Admin: event CRUD training note

---

## T15 — News / blog (P1)

**Checklist:**
- [ ] Fix broken images (mock CDN URLs)
- [ ] Implement "Load more" or remove
- [ ] Empty state when no approved posts
- [ ] News detail fallback if API fails
- [ ] Admin workflow: create → approve → publish

---

## T16 — Leadership / team (P1)

**Current:** Demo people in mockData (Akbar Mirzayev, etc.)

**Checklist:**
- [ ] User provides real leadership bios + photos
- [ ] OR hide section / "Coming Soon"
- [ ] Remove fake timeline (2005–2025) unless verified
- [ ] Remove placeholder partner logos

---

## T17 — Professional copywriting (P2)

Rewrite all pages for UUEA mission: US–Uzbekistan business ties, entrepreneurs, investors, delegations, partnerships, networking.

**Pages:** Home, About, Services, Membership, Contact, Join, Dashboard welcome

**Languages:** uz, ru, en — professional tone, not template filler

---

## T18 — Design & readability (P2)

**Checklist:**
- [ ] Increase contrast on `text-muted-foreground` sections
- [ ] Section spacing consistency
- [ ] Button/card hover states
- [ ] Gold accent used consistently with UUEA logo (white on dark)
- [ ] Readable font sizes on mobile

---

## T19 — Mobile QA (P2)

**Checklist:**
- [ ] Header sheet menu — all links work
- [ ] Hero + CTAs on 375px width
- [ ] Membership plan cards stack correctly
- [ ] Catalog filters usable on touch
- [ ] Event registration dialog
- [ ] Login/register forms
- [ ] Dashboard sidebar on mobile

---

## T20 — Production hardening (P2)

**Checklist:**
- [ ] `SEED_DEMO=false`
- [ ] Strong JWT_SECRET
- [ ] Stripe live keys
- [ ] CORS / API URL for production domain
- [ ] Remove miaoda.com email defaults
- [ ] favicon from logo.png
- [ ] OG meta tags with UUEA branding

---

## Quick reference — what's real vs mock

| Feature | Status |
|---------|--------|
| Auth / JWT | ✅ Real |
| Dashboard | ✅ Real (messages stub) |
| Admin panel | ✅ Real |
| Stripe checkout | ✅ Real (if key set) |
| Catalog API | ✅ Real |
| Events API | ✅ Real |
| News API | ✅ Real (+ mock fallback) |
| Contact form | ❌ Mock |
| Home stats/services/events | ❌ mockData |
| Team/partners | ❌ Demo |
| Email send | ❌ Stub |
| PayPal/Square | ❌ Not built |
