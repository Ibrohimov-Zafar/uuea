import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Calendar, Clock, ArrowRight, BookOpen } from 'lucide-react';
import Layout from '@/components/layouts/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { news } from '@/data/mockData';
import { getNews } from '@/api/client';
import type { NewsPost } from '@/types/types';
import { useLang } from '@/contexts/LangContext';

const newsCategories = ['Hammasi', 'Iqtisodiyot', 'Hamkorlik', 'Savdo', 'Tadbirlar', 'Moliya', 'Startaplar'];

export default function NewsPage() {
  const { t } = useLang();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Hammasi');
  const [apiNews, setApiNews] = useState<NewsPost[] | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getNews();
        setApiNews(data);
      } catch {
        setApiNews([]);
      }
    })();
  }, []);

  const normalized = useMemo(() => {
    // If API has data, prefer it. Otherwise fall back to mock content.
    if (apiNews && apiNews.length > 0) {
      return apiNews.map((n) => ({
        id: n.id,
        title: n.title,
        excerpt: n.excerpt || '',
        category: n.category,
        date: (n.published_at || n.created_at || '').slice(0, 10),
        readTime: `${Math.max(3, Math.ceil((n.body?.length || 0) / 800))} daqiqa`,
        image: n.image_url || '',
        featured: Boolean(n.is_featured),
        author: 'Tahririyat',
      }));
    }
    return news.map((n) => ({ ...n, id: String(n.id) }));
  }, [apiNews]);

  const filtered = normalized.filter((n) => {
    const matchQ =
      n.title.toLowerCase().includes(query.toLowerCase()) ||
      n.excerpt.toLowerCase().includes(query.toLowerCase());
    const matchC = activeCategory === 'Hammasi' || n.category === activeCategory;
    return matchQ && matchC;
  });

  const featured = filtered.find((n) => n.featured);
  const rest = filtered.filter((n) => !n.featured);

  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-24 bg-navy-dark bg-sacred-geometry overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-navy/60 to-navy-dark" />
        <div className="relative max-w-7xl mx-auto px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-sm border border-primary/30 bg-primary/5 text-primary text-xs tracking-widest uppercase">
            {t('news')}
          </div>
          <h1 className="font-jiang-cheng text-4xl md:text-5xl font-bold text-foreground text-balance">
            {t('newsTitle')}
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
            {t('newsSub')}
          </p>
          <div className="max-w-lg mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t('newsSearchPh')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-11 h-12 bg-card border-border/60 rounded-sm focus-visible:ring-primary text-sm"
            />
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 bg-background bg-sacred-geometry">
        <div className="max-w-7xl mx-auto px-6">
          {/* Categories */}
          <div className="flex flex-wrap gap-2 mb-10">
            {newsCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-4 py-1.5 text-xs rounded-sm border transition-all",
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border/60 text-muted-foreground hover:border-primary/40 hover:text-primary bg-card/50"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Featured */}
          {featured && (
            <div className="mb-10 glass-card border-ancient rounded-sm overflow-hidden hover-gold-glow group card-ancient">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="aspect-[16/9] lg:aspect-auto min-h-[240px] bg-muted relative overflow-hidden">
                  <img
                    src={featured.image}
                    alt={featured.title}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity group-hover:scale-105 duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-navy/50" />
                  <div className="absolute top-4 left-4 px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-sm tracking-wider uppercase">
                    Featured
                  </div>
                </div>
                <div className="p-8 space-y-4 flex flex-col justify-center">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-1 bg-primary/10 border border-primary/20 text-primary text-xs rounded-sm">{featured.category}</span>
                    <span className="text-muted-foreground text-xs">{featured.date}</span>
                    <span className="text-muted-foreground text-xs">{featured.readTime}</span>
                  </div>
                  <h2 className="font-jiang-cheng text-foreground text-xl md:text-2xl font-bold text-balance leading-tight">
                    {featured.title}
                  </h2>
                  <p className="text-muted-foreground text-sm leading-relaxed text-pretty">{featured.excerpt}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <BookOpen className="w-3.5 h-3.5 text-primary" />
                    <span>{featured.author}</span>
                  </div>
                  <Button asChild variant="ghost" className="border border-primary/40 text-primary hover:bg-primary/10 rounded-sm w-fit text-sm">
                    <Link to={`/yangiliklar/${featured.id}`}>
                      To'liq O'qish
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Grid */}
          {rest.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rest.map((article) => (
                <div
                  key={article.id}
                  className="glass-card border-ancient rounded-sm overflow-hidden hover-gold-glow group card-ancient flex flex-col h-full"
                >
                  <div className="aspect-[16/9] bg-muted relative overflow-hidden">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity group-hover:scale-105 duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy/60 to-transparent" />
                    <div className="absolute top-3 left-3 px-2 py-1 bg-primary text-primary-foreground text-xs rounded-sm">
                      {article.category}
                    </div>
                  </div>
                  <div className="p-5 space-y-3 flex flex-col flex-1">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-primary" />
                        {article.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-primary" />
                        {article.readTime}
                      </span>
                    </div>
                    <h3 className="font-jiang-cheng text-foreground font-bold text-sm leading-tight text-balance">{article.title}</h3>
                    <p className="text-muted-foreground text-xs leading-relaxed text-pretty line-clamp-3 flex-1">{article.excerpt}</p>
                    <div className="flex items-center justify-between mt-auto pt-2">
                      <span className="text-xs text-muted-foreground">{article.author}</span>
                      <Button asChild variant="ghost" size="sm" className="text-primary hover:bg-primary/10 rounded-sm text-xs h-7 px-2">
                        <Link to={`/yangiliklar/${article.id}`}>
                          O'qish
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {filtered.length === 0 && (
            <div className="glass-card border-ancient rounded-sm py-20 text-center">
              <Search className="w-12 h-12 text-muted-foreground mx-auto opacity-30 mb-4" />
              <p className="text-muted-foreground text-sm">Hech narsa topilmadi</p>
            </div>
          )}

          {filtered.length > 0 && (
            <div className="text-center mt-12">
              <Button onClick={() => {}} variant="ghost" className="border border-primary/40 text-primary hover:bg-primary/10 rounded-sm px-10">
                Ko'proq Yuklash
              </Button>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
