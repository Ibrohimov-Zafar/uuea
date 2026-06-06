import type { Lang } from '@/i18n/types';
import { SITE } from '@/config/site';
import { faqItems } from '@/data/mockData';

export const SEO_LANGS: Lang[] = ['uz', 'ru', 'en'];

export const SEO_LOCALE: Record<Lang, string> = {
  uz: 'uz_UZ',
  ru: 'ru_RU',
  en: 'en_US',
};

export function getSiteOrigin(): string {
  const env = (import.meta.env.VITE_SITE_URL as string | undefined)?.trim();
  if (env) return env.replace(/\/$/, '');
  if (typeof window !== 'undefined') return window.location.origin;
  return SITE.websiteUrl;
}

export const SEO_DEFAULT_IMAGE = '/logo.png';
export const SEO_SITE_NAME = SITE.shortName;
export const SEO_TWITTER_HANDLE = '';

type SeoCopy = { title: Record<Lang, string>; description: Record<Lang, string>; noindex?: boolean };

/** Static public routes — detail pages set meta in-component */
export const PAGE_SEO: Record<string, SeoCopy> = {
  '/': {
    title: {
      uz: "UUEA — AQSh va O'zbekiston tadbirkorlari assotsiatsiyasi",
      ru: 'UUEA — Ассоциация предпринимателей США и Узбекистана',
      en: 'UUEA — USA–Uzbekistan Entrepreneurs Association',
    },
    description: {
      uz: "USA–Uzbekistan Entrepreneurs Association (UUEA): investorlar, tadbirkorlar va biznes yetakchilarni AQSh va O'zbekiston o'rtasida bog'laydi. A'zolik, tadbirlar, katalog va huquqiy resurslar.",
      ru: 'UUEA объединяет предпринимателей, инвесторов и бизнес-лидеров США и Узбекистана. Членство, мероприятия, каталог и правовые материалы.',
      en: 'UUEA connects entrepreneurs, investors, and business leaders across the United States and Uzbekistan. Membership, events, directory, and legal resources.',
    },
  },
  '/biz-haqimizda': {
    title: { uz: 'Biz Haqimizda | UUEA', ru: 'О нас | UUEA', en: 'About Us | UUEA' },
    description: {
      uz: "UUEA missiyasi, jamoa va tarix — AQSh–O'zbekiston biznes hamkorligini rivojlantirish.",
      ru: 'Миссия UUEA, команда и история развития делового сотрудничества США и Узбекистана.',
      en: 'UUEA mission, team, and history building USA–Uzbekistan business cooperation.',
    },
  },
  '/xizmatlar': {
    title: { uz: 'Xizmatlar | UUEA', ru: 'Услуги | UUEA', en: 'Services | UUEA' },
    description: {
      uz: "A'zolik, biznes qo'llab-quvvatlash, tarmoq va katalog xizmatlari — UUEA ekotizimi.",
      ru: 'Членство, поддержка бизнеса, нетворкинг и каталог — экосистема UUEA.',
      en: 'Membership, business support, networking, and directory services in the UUEA ecosystem.',
    },
  },
  '/azolik': {
    title: { uz: "Individual A'zolik | UUEA", ru: 'Индивидуальное членство | UUEA', en: 'Individual Membership | UUEA' },
    description: {
      uz: "UUEA individual a'zolik rejalari: Starter va Business — yillik imtiyozlar va tadbirlar.",
      ru: 'Индивидуальные планы UUEA: Starter и Business — годовые преимущества и мероприятия.',
      en: 'UUEA individual membership plans: Starter and Business with annual benefits and events.',
    },
  },
  '/korporativ': {
    title: { uz: "Korporativ A'zolik | UUEA", ru: 'Корпоративное членство | UUEA', en: 'Corporate Membership | UUEA' },
    description: {
      uz: 'Korporativ va xalqaro a\'zolik — kompaniyalar uchun UUEA imkoniyatlari.',
      ru: 'Корпоративное и международное членство UUEA для компаний.',
      en: 'Corporate and international UUEA membership for companies.',
    },
  },
  '/qonunlar': {
    title: { uz: 'Qonunlar va Qarorlar | UUEA', ru: 'Законы и постановления | UUEA', en: 'Laws & Regulations | UUEA' },
    description: {
      uz: "AQSh va O'zbekiston biznesi uchun qonunlar, qarorlar va huquqiy qo'llanmalar.",
      ru: 'Законы, постановления и правовые материалы для бизнеса США и Узбекистана.',
      en: 'Laws, regulations, and legal guides for USA–Uzbekistan business.',
    },
  },
  '/katalog': {
    title: { uz: 'Biznes Katalog | UUEA', ru: 'Бизнес-каталог | UUEA', en: 'Business Directory | UUEA' },
    description: {
      uz: "UUEA a'zolari va hamkorlar biznes katalogi — soha va mintaqa bo'yicha qidiruv.",
      ru: 'Каталог бизнесов участников и партнёров UUEA с поиском по отрасли и региону.',
      en: 'Directory of UUEA members and partners — search by industry and region.',
    },
  },
  '/tadbirlar': {
    title: { uz: 'Tadbirlar | UUEA', ru: 'Мероприятия | UUEA', en: 'Events | UUEA' },
    description: {
      uz: 'UUEA tadbirlari, forumlar va networking uchrashuvlari — ro\'yxatdan o\'tish onlayn.',
      ru: 'Мероприятия UUEA: форумы и нетворкинг — онлайн-регистрация.',
      en: 'UUEA events, forums, and networking — register online.',
    },
  },
  '/yangiliklar': {
    title: { uz: 'Yangiliklar | UUEA', ru: 'Новости | UUEA', en: 'News | UUEA' },
    description: {
      uz: "UUEA yangiliklari: iqtisodiyot, savdo, hamkorlik va tadbirlar haqida maqolalar.",
      ru: 'Новости UUEA: экономика, торговля, партнёрство и мероприятия.',
      en: 'UUEA news on economy, trade, partnerships, and events.',
    },
  },
  '/aloqa': {
    title: { uz: 'Aloqa | UUEA', ru: 'Контакты | UUEA', en: 'Contact | UUEA' },
    description: {
      uz: `UUEA bilan bog'laning: ${SITE.email}, ${SITE.phone}, ${SITE.phoneUz}.`,
      ru: `Связаться с UUEA: ${SITE.email}, ${SITE.phone}.`,
      en: `Contact UUEA: ${SITE.email}, ${SITE.phone}, ${SITE.phoneUz}.`,
    },
  },
  '/qoshilish': {
    title: { uz: "A'zolikka Qo'shilish | UUEA", ru: 'Вступить в UUEA', en: 'Join UUEA Membership' },
    description: {
      uz: "UUEA a'zoligiga onlayn ariza va xavfsiz to'lov — O'zbekiston va xalqaro rezidentlar uchun.",
      ru: 'Онлайн-заявка и оплата членства UUEA для резидентов Узбекистана и других стран.',
      en: 'Apply for UUEA membership online — Uzbekistan and international residents.',
    },
  },
  '/kirish': {
    title: { uz: 'Kirish | UUEA', ru: 'Вход | UUEA', en: 'Sign In | UUEA' },
    description: { uz: 'UUEA a\'zolar kabinetiga kirish.', ru: 'Вход в кабинет участника UUEA.', en: 'Sign in to your UUEA member account.' },
    noindex: true,
  },
  '/royxat': {
    title: { uz: "Ro'yxatdan O'tish | UUEA", ru: 'Регистрация | UUEA', en: 'Register | UUEA' },
    description: { uz: 'UUEA platformasida yangi hisob yarating.', ru: 'Создайте аккаунт UUEA.', en: 'Create your UUEA account.' },
    noindex: true,
  },
  '/payment-success': {
    title: { uz: "To'lov muvaffaqiyatli | UUEA", ru: 'Оплата успешна | UUEA', en: 'Payment Successful | UUEA' },
    description: { uz: "UUEA a'zolik to'lovi tasdiqlandi.", ru: 'Оплата членства UUEA подтверждена.', en: 'Your UUEA membership payment was confirmed.' },
    noindex: true,
  },
  '/event-payment-success': {
    title: { uz: "Tadbir to'lovi | UUEA", ru: 'Оплата мероприятия | UUEA', en: 'Event Payment | UUEA' },
    description: { uz: 'Tadbir to\'lovi tasdiqlandi.', ru: 'Оплата мероприятия подтверждена.', en: 'Event payment confirmed.' },
    noindex: true,
  },
  '/unsubscribe': {
    title: { uz: 'Obunadan chiqish | UUEA', ru: 'Отписка | UUEA', en: 'Unsubscribe | UUEA' },
    description: { uz: 'Email obunasini bekor qilish.', ru: 'Отмена email-подписки.', en: 'Unsubscribe from UUEA emails.' },
    noindex: true,
  },
  '/dashboard': {
    title: { uz: 'Kabinet | UUEA', ru: 'Кабинет | UUEA', en: 'Dashboard | UUEA' },
    description: { uz: 'Shaxsiy kabinet.', ru: 'Личный кабинет.', en: 'Member dashboard.' },
    noindex: true,
  },
  '/admin': {
    title: { uz: 'Admin | UUEA', ru: 'Админ | UUEA', en: 'Admin | UUEA' },
    description: { uz: 'Admin panel.', ru: 'Панель администратора.', en: 'Admin panel.' },
    noindex: true,
  },
};

const BREADCRUMB_HOME: Record<Lang, string> = {
  uz: 'Bosh sahifa',
  ru: 'Главная',
  en: 'Home',
};

const BREADCRUMB_SEGMENTS: Record<string, Record<Lang, string>> = {
  'biz-haqimizda': { uz: 'Biz Haqimizda', ru: 'О нас', en: 'About' },
  xizmatlar: { uz: 'Xizmatlar', ru: 'Услуги', en: 'Services' },
  azolik: { uz: "A'zolik", ru: 'Членство', en: 'Membership' },
  korporativ: { uz: 'Korporativ', ru: 'Корпоративное', en: 'Corporate' },
  qonunlar: { uz: 'Qonunlar', ru: 'Законы', en: 'Laws' },
  katalog: { uz: 'Katalog', ru: 'Каталог', en: 'Directory' },
  tadbirlar: { uz: 'Tadbirlar', ru: 'Мероприятия', en: 'Events' },
  yangiliklar: { uz: 'Yangiliklar', ru: 'Новости', en: 'News' },
  aloqa: { uz: 'Aloqa', ru: 'Контакты', en: 'Contact' },
  qoshilish: { uz: "Qo'shilish", ru: 'Вступление', en: 'Join' },
};

export function normalizePath(pathname: string): string {
  if (!pathname || pathname === '/') return '/';
  return pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
}

export function isDynamicDetailPath(pathname: string): boolean {
  const parts = normalizePath(pathname).split('/').filter(Boolean);
  if (parts.length !== 2) return false;
  return parts[0] === 'yangiliklar' || parts[0] === 'qonunlar' || parts[0] === 'katalog';
}

export function getSeoForPath(pathname: string, lang: Lang): { title: string; description: string; noindex?: boolean } | null {
  const path = normalizePath(pathname);
  const entry = PAGE_SEO[path];
  if (!entry) return null;
  return {
    title: entry.title[lang],
    description: entry.description[lang],
    noindex: entry.noindex,
  };
}

export function truncateMeta(text: string, max = 160): string {
  const t = text.replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

export function langUrl(origin: string, path: string, lang: Lang): string {
  const base = `${origin}${normalizePath(path)}`;
  const sep = base.includes('?') ? '&' : '?';
  return `${base}${sep}lang=${lang}`;
}

export function buildOrganizationJsonLd(origin: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE.name,
    alternateName: SITE.shortName,
    url: origin,
    logo: `${origin}${SEO_DEFAULT_IMAGE}`,
    email: SITE.email,
    telephone: [SITE.phoneTel, SITE.phoneAltTel].filter(Boolean),
    sameAs: [SITE.social.linkedin, SITE.social.facebook, SITE.social.instagram].filter(Boolean),
  };
}

export function buildWebSiteJsonLd(origin: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE.name,
    alternateName: SITE.shortName,
    url: origin,
    inLanguage: ['uz-UZ', 'ru-RU', 'en-US'],
    publisher: { '@type': 'Organization', name: SITE.name, logo: `${origin}${SEO_DEFAULT_IMAGE}` },
  };
}

export function buildContactPageJsonLd(origin: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    url: `${origin}/aloqa`,
    mainEntity: {
      '@type': 'Organization',
      name: SITE.name,
      url: origin,
      email: SITE.email,
      contactPoint: [
        { '@type': 'ContactPoint', telephone: SITE.phone, contactType: 'customer service', areaServed: 'US', availableLanguage: SEO_LANGS },
        { '@type': 'ContactPoint', telephone: SITE.phoneAlt, contactType: 'customer service', areaServed: 'US', availableLanguage: SEO_LANGS },
        { '@type': 'ContactPoint', telephone: SITE.phoneUz, contactType: 'customer service', areaServed: 'UZ', availableLanguage: ['uz', 'ru'] },
      ],
    },
  };
}

export function buildFaqJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}

export function buildBreadcrumbJsonLd(
  origin: string,
  lang: Lang,
  crumbs: { name: string; path: string }[],
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: `${origin}${normalizePath(c.path)}`,
    })),
  };
}

export function buildStaticBreadcrumbs(path: string, lang: Lang): { name: string; path: string }[] {
  const crumbs: { name: string; path: string }[] = [
    { name: BREADCRUMB_HOME[lang], path: '/' },
  ];
  const parts = normalizePath(path).split('/').filter(Boolean);
  if (parts.length === 0) return crumbs;
  let acc = '';
  for (const seg of parts) {
    acc += `/${seg}`;
    const label = BREADCRUMB_SEGMENTS[seg]?.[lang] ?? seg;
    crumbs.push({ name: label, path: acc });
  }
  return crumbs;
}

export function buildDetailBreadcrumbs(
  section: 'yangiliklar' | 'qonunlar' | 'katalog',
  lang: Lang,
  title: string,
  path: string,
) {
  const sectionLabels: Record<typeof section, Record<Lang, string>> = {
    yangiliklar: { uz: 'Yangiliklar', ru: 'Новости', en: 'News' },
    qonunlar: { uz: 'Qonunlar', ru: 'Законы', en: 'Laws' },
    katalog: { uz: 'Katalog', ru: 'Каталог', en: 'Directory' },
  };
  return [
    { name: BREADCRUMB_HOME[lang], path: '/' },
    { name: sectionLabels[section][lang], path: `/${section}` },
    { name: truncateMeta(title, 80), path },
  ];
}

export function buildArticleJsonLd(opts: {
  origin: string;
  path: string;
  headline: string;
  description: string;
  datePublished?: string;
  dateModified?: string;
  image?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: opts.headline,
    description: truncateMeta(opts.description, 200),
    datePublished: opts.datePublished,
    dateModified: opts.dateModified || opts.datePublished,
    image: opts.image ? (opts.image.startsWith('http') ? opts.image : `${opts.origin}${opts.image}`) : `${opts.origin}${SEO_DEFAULT_IMAGE}`,
    author: { '@type': 'Organization', name: SITE.shortName },
    publisher: {
      '@type': 'Organization',
      name: SITE.name,
      logo: { '@type': 'ImageObject', url: `${opts.origin}${SEO_DEFAULT_IMAGE}` },
    },
    mainEntityOfPage: `${opts.origin}${opts.path}`,
  };
}

export function jsonLdBundle(...items: (Record<string, unknown> | undefined)[]): Record<string, unknown>[] {
  return items.filter(Boolean) as Record<string, unknown>[];
}

export function routeJsonLd(path: string, origin: string, lang: Lang): Record<string, unknown>[] {
  if (path === '/') {
    return jsonLdBundle(buildOrganizationJsonLd(origin), buildWebSiteJsonLd(origin));
  }
  if (path === '/aloqa') {
    return jsonLdBundle(buildContactPageJsonLd(origin), buildBreadcrumbJsonLd(origin, lang, buildStaticBreadcrumbs(path, lang)));
  }
  if (path === '/azolik' || path === '/korporativ') {
    return jsonLdBundle(
      buildFaqJsonLd(),
      buildBreadcrumbJsonLd(origin, lang, buildStaticBreadcrumbs(path, lang)),
    );
  }
  if (PAGE_SEO[path] && !PAGE_SEO[path].noindex) {
    return jsonLdBundle(buildBreadcrumbJsonLd(origin, lang, buildStaticBreadcrumbs(path, lang)));
  }
  return [];
}

export const SITEMAP_PATHS = [
  '/',
  '/biz-haqimizda',
  '/xizmatlar',
  '/azolik',
  '/korporativ',
  '/qonunlar',
  '/katalog',
  '/tadbirlar',
  '/yangiliklar',
  '/aloqa',
  '/qoshilish',
] as const;
