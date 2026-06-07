import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Calendar, Clock, ArrowRight, BookOpen, Newspaper } from 'lucide-react';
import Layout from '@/components/layouts/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { getNews } from '@/api/client';
import type { NewsPost } from '@/types/types';
import { useLang } from '@/contexts/LangContext';
import PageHeroBanner, { PageHeroBadge, PageHeroSub, PageHeroTitle } from '@/components/common/PageHeroBanner';
import { PAGE_HERO_IMAGES } from '@/config/pageHeroImages';

const NEWS_CATEGORIES = ['Hammasi', 'Iqtisodiyot', 'Hamkorlik', 'Savdo', 'Tadbirlar', 'Moliya', 'Startaplar'];

function readTimeMin(body = '') {
  return Math.max(3, Math.ceil(body.length / 800));
}

function lf(uz: string | null | undefined, ru: string | null | undefined, en: string | null | undefined, lang: string): string {
  if (lang === 'ru' && ru) return ru;
  if (lang === 'en' && en) return en;
  return uz || '';
}

export default function NewsPage() {
  const { t, lang } = useLang();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Hammasi');
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNews()
      .then(setPosts)
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return posts.filter((n) => {
      const matchQ =
        n.title.toLowerCase().includes(query.toLowerCase()) ||
        (n.excerpt || '').toLowerCase().includes(query.toLowerCase());
      const matchC = activeCategory === 'Hammasi' || n.category === activeCategory;
      return matchQ && matchC;
    });
  }, [posts, query, activeCategory]);

  const featured = filtered.find((n) => n.is_featured);
  const rest = filtered.filter((n) => !n.is_featured);

  return (
    <Layout>
      <PageHeroBanner image={PAGE_HERO_IMAGES.news}>
        <PageHeroBadge>{t('news')}</PageHeroBadge>
        <PageHeroTitle>{t('newsTitle')}</PageHeroTitle>
        <PageHeroSub>{t('newsSub')}</PageHeroSub>
        <div className="max-w-lg mx-auto relative pt-2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t('newsSearchPh')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-11 h-12 bg-card/90 border-border/60 rounded-sm focus-visible:ring-primary text-sm"
          />
        </div>
      </PageHeroBanner>

      {/* Content */}
      <section className="py-16 bg-background bg-sacred-geometry">
        <div className="max-w-7xl mx-auto px-6">

          {/* Categories */}
          <div className="flex flex-wrap gap-2 mb-10">
            {NEWS_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  'px-4 py-1.5 text-xs rounded-sm border transition-all',
                  activeCategory === cat
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border/60 text-muted-foreground hover:border-primary/40 hover:text-primary bg-card/50'
                )}
              >
                {cat === 'Hammasi' ? t('all') : cat}
              </button>
            ))}
          </div>

          {/* Loading */}
          {loading && (
            <div className="space-y-6">
              <Skeleton className="h-64 rounded-sm" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-72 rounded-sm" />
                ))}
              </div>
            </div>
          )}

          {/* Empty */}
          {!loading && filtered.length === 0 && (
            <div className="glass-card border-ancient rounded-sm py-20 text-center space-y-4">
              <Newspaper className="w-12 h-12 text-muted-foreground/30 mx-auto" />
              <p className="text-muted-foreground text-sm">
                {posts.length === 0 ? t('newsEmpty') : t('noResults')}
              </p>
            </div>
          )}

          {/* Featured */}
          {!loading && featured && (
            <div className="mb-10 glass-card border-ancient rounded-sm overflow-hidden hover-gold-glow group card-ancient">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="aspect-[16/9] lg:aspect-auto min-h-[240px] bg-muted relative overflow-hidden">
                  {featured.image_url ? (
                    <img
                      src={featured.image_url}
                      alt={featured.title}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity group-hover:scale-105 duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                      <Newspaper className="w-16 h-16 text-primary/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-navy/50" />
                  <div className="absolute top-4 left-4 px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-sm tracking-wider uppercase">
                    {t('featuredBadge')}
                  </div>
                </div>
                <div className="p-8 space-y-4 flex flex-col justify-center">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="px-2 py-1 bg-primary/10 border border-primary/20 text-primary text-xs rounded-sm">{featured.category}</span>
                    <span className="text-muted-foreground text-xs">
                      {(featured.published_at || featured.created_at || '').slice(0, 10)}
                    </span>
                    <span className="text-muted-foreground text-xs">{t('readMinutes', { n: readTimeMin(featured.body) })}</span>
                  </div>
                  <h2 className="font-jiang-cheng text-foreground text-xl md:text-2xl font-bold text-balance leading-tight">
                    {lf(featured.title, featured.title_ru, featured.title_en, lang)}
                  </h2>
                  {lf(featured.excerpt, featured.excerpt_ru, featured.excerpt_en, lang) && (
                    <p className="text-muted-foreground text-sm leading-relaxed text-pretty">{lf(featured.excerpt, featured.excerpt_ru, featured.excerpt_en, lang)}</p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <BookOpen className="w-3.5 h-3.5 text-primary" />
                    <span>{t('editorial')}</span>
                  </div>
                  <Button asChild variant="ghost" className="border border-primary/40 text-primary hover:bg-primary/10 rounded-sm w-fit text-sm">
                    <Link to={`/yangiliklar/${featured.id}`}>
                      {t('readFull')}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Grid */}
          {!loading && rest.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rest.map((article) => {
                const date = (article.published_at || article.created_at || '').slice(0, 10);
                return (
                  <article
                    key={article.id}
                    className="glass-card border-ancient rounded-sm overflow-hidden hover-gold-glow group card-ancient flex flex-col h-full"
                  >
                    <div className="aspect-[16/9] bg-muted relative overflow-hidden shrink-0">
                      {article.image_url ? (
                        <img
                          src={article.image_url}
                          alt={article.title}
                          className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity group-hover:scale-105 duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-primary/8 flex items-center justify-center">
                          <Newspaper className="w-10 h-10 text-primary/25" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-navy/60 to-transparent" />
                      <div className="absolute top-3 left-3 px-2 py-1 bg-primary text-primary-foreground text-xs rounded-sm">
                        {article.category}
                      </div>
                    </div>
                    <div className="p-5 space-y-3 flex flex-col flex-1">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-primary" />
                          {date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-primary" />
                          {t('readMinutes', { n: readTimeMin(article.body) })}
                        </span>
                      </div>
                      <h3 className="font-jiang-cheng text-foreground font-bold text-sm leading-tight text-balance line-clamp-2">
                        {lf(article.title, article.title_ru, article.title_en, lang)}
                      </h3>
                      {lf(article.excerpt, article.excerpt_ru, article.excerpt_en, lang) && (
                        <p className="text-muted-foreground text-xs leading-relaxed text-pretty line-clamp-3 flex-1">
                          {lf(article.excerpt, article.excerpt_ru, article.excerpt_en, lang)}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-auto pt-2">
                        <span className="text-xs text-muted-foreground">{t('editorial')}</span>
                        <Button asChild variant="ghost" size="sm" className="text-primary hover:bg-primary/10 rounded-sm text-xs h-7 px-2">
                          <Link to={`/yangiliklar/${article.id}`}>
                            {t('readLabel')}
                            <ArrowRight className="w-3 h-3 ml-1" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

        </div>
      </section>
    </Layout>
  );
}
