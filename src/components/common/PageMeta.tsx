import { HelmetProvider, Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useLang } from '@/contexts/LangContext';
import { SITE } from '@/config/site';
import {
  SEO_DEFAULT_IMAGE,
  SEO_LANGS,
  SEO_LOCALE,
  SEO_SITE_NAME,
  SEO_TWITTER_HANDLE,
  getSeoForPath,
  getSiteOrigin,
  isDynamicDetailPath,
  langUrl,
  normalizePath,
  routeJsonLd,
  truncateMeta,
} from '@/config/seo';

export type PageSeoProps = {
  title: string;
  description: string;
  path?: string;
  image?: string;
  noindex?: boolean;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
};

function formatTitle(title: string): string {
  if (title.includes('UUEA') || title.includes(SITE.shortName)) return title;
  return `${title} | ${SEO_SITE_NAME}`;
}

function mergeJsonLd(
  base: Record<string, unknown>[] | undefined,
  extra: Record<string, unknown> | Record<string, unknown>[] | undefined,
): Record<string, unknown>[] {
  const a = base ?? [];
  if (!extra) return a;
  const b = Array.isArray(extra) ? extra : [extra];
  return [...a, ...b];
}

export function PageSeo({
  title,
  description,
  path,
  image = SEO_DEFAULT_IMAGE,
  noindex = false,
  type = 'website',
  publishedTime,
  modifiedTime,
  jsonLd,
}: PageSeoProps) {
  const { lang } = useLang();
  const fullTitle = formatTitle(title);
  const desc = truncateMeta(description);
  const origin = getSiteOrigin();
  const canonicalPath = path ?? (typeof window !== 'undefined' ? window.location.pathname : '/');
  const normalized = normalizePath(canonicalPath);
  const canonical = `${origin}${normalized}`;
  const imageUrl = image.startsWith('http') ? image : `${origin}${image}`;
  const robots = noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large';

  const allLd = mergeJsonLd(undefined, jsonLd);
  const ldScripts = allLd.length
    ? allLd.map((obj, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(obj)}
        </script>
      ))
    : null;

  return (
    <Helmet htmlAttributes={{ lang }} prioritizeSeoTags>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <meta name="author" content={SITE.name} />
      <meta name="robots" content={robots} />
      <link rel="canonical" href={canonical} />

      {SEO_LANGS.map((l) => (
        <link key={l} rel="alternate" hrefLang={l} href={langUrl(origin, normalized, l)} />
      ))}
      <link rel="alternate" hrefLang="x-default" href={canonical} />

      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE.name} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:alt" content={SITE.shortName} />
      <meta property="og:locale" content={SEO_LOCALE[lang]} />
      {SEO_LANGS.filter((l) => l !== lang).map((l) => (
        <meta key={l} property="og:locale:alternate" content={SEO_LOCALE[l]} />
      ))}

      {type === 'article' && publishedTime ? (
        <meta property="article:published_time" content={publishedTime} />
      ) : null}
      {type === 'article' && modifiedTime ? (
        <meta property="article:modified_time" content={modifiedTime} />
      ) : null}

      <meta name="twitter:card" content="summary_large_image" />
      {SEO_TWITTER_HANDLE ? <meta name="twitter:site" content={SEO_TWITTER_HANDLE} /> : null}
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={imageUrl} />

      {ldScripts}
    </Helmet>
  );
}

export function RouteSeo() {
  const { pathname } = useLocation();
  const { lang } = useLang();

  if (isDynamicDetailPath(pathname)) return null;

  const meta = getSeoForPath(pathname, lang);
  if (!meta) return null;

  const path = normalizePath(pathname);
  const origin = getSiteOrigin();

  return (
    <PageSeo
      title={meta.title}
      description={meta.description}
      path={path}
      noindex={meta.noindex}
      jsonLd={routeJsonLd(path, origin, lang)}
    />
  );
}

export const AppWrapper = ({ children }: { children: React.ReactNode }) => (
  <HelmetProvider>
    <TooltipProvider>{children}</TooltipProvider>
  </HelmetProvider>
);

/** @deprecated Use PageSeo */
const PageMeta = (props: { title: string; description: string }) => (
  <PageSeo title={props.title} description={props.description} />
);

export default PageMeta;
