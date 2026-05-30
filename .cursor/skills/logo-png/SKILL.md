---
name: logo-png
description: >-
  UUEA (USA–Uzbekistan Entrepreneurs Association) website rebuild tasklist and
  branding guide. Uses public/logo.png as the official logo. Use when the user
  invokes /logo.png, asks to implement UUEA website fixes, rebrand from Biznes
  Chamber/chamber.uz, or selects tasks from the UUEA audit tasklist.
disable-model-invocation: true
---

# UUEA Website Rebuild (`/logo.png`)

## Brand assets

| Asset | Path | Usage |
|-------|------|-------|
| Official logo | `public/logo.png` | Header, Footer, Login, Dashboard, Admin PDF, favicon source |
| Org name | USA–Uzbekistan Entrepreneurs Association | Full name in hero, footer, meta, receipts |
| Short name | UUEA | Logo alt text, compact UI, PDF headers |

**Replace everywhere:** `BIZNES CHAMBER`, `Biznes Chamber`, `chamber.uz`, `info@chamber.uz`, `+998 71 200-00-00`, Amir Temur 108 placeholder.

Real contact info comes from the user — never invent phone/email/address.

## Workflow

1. **Read** [tasklist.md](tasklist.md) for the full audit backlog.
2. **Ask user** which task IDs to implement (e.g. `T01, T03, T11` or "Phase 1 only").
3. **Implement only selected tasks** — minimal diff, match existing code style.
4. **After each batch**, summarize what changed and what remains.

Do not start payment/membership pricing (T07–T08) unless user explicitly confirms final plans and Stripe keys.

## Priority phases

| Phase | IDs | Focus |
|-------|-----|-------|
| 🔴 P0 | T01–T04, T11, T12 | Brand, hero, placeholders, security, contact |
| 🟡 P1 | T05–T06, T09, T13–T16 | Buttons, i18n, portal clarity, demo content |
| 🟢 P2 | T07–T08, T17–T20 | Membership/pricing, copywriting, design polish, mobile QA |

## Key file map

```
src/components/layouts/Header.tsx, Footer.tsx   — nav, logo, contact
src/i18n/translations.ts                        — uz/ru/en strings
src/pages/HomePage.tsx                          — hero + mock sections
src/pages/WhoWeArePage.tsx                      — team, timeline
src/pages/ContactPage.tsx                       — form (currently mock)
src/pages/LoginPage.tsx                         — test accounts block
src/data/mockData.ts                            — demo content
backend/internal/seed/seed.go, demo.go          — DB seed plans/events
public/logo.png                                 — UUEA logo
```

## Implementation rules

- Logo: `<img src="/logo.png" alt="UUEA" />` or existing logo component pattern.
- Hero must state USA–Uzbekistan mission in first screen (delegations, investors, networking, membership).
- Remove `LoginPage.tsx` test-account block before any production deploy.
- Contact form: wire to backend or email — never leave client-only `setSent(true)`.
- Fix dead buttons: `onClick={() => {}}` in HomePage (events, newsletter), NewsPage (load more).
- Homepage membership prices must match API (`/azolik`) — single source of truth.
- i18n: new user-facing strings go in `translations.ts` for all three langs.

## Verification checklist (per task)

- [ ] No `chamber.uz` / `Biznes Chamber` left in changed files
- [ ] Logo renders in header/footer
- [ ] Selected buttons navigate or call API correctly
- [ ] EN/RU/UZ strings added for new copy
- [ ] No test credentials visible on public pages

## Full task reference

See [tasklist.md](tasklist.md).
