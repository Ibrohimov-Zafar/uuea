import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Scale, Calendar, ArrowRight, FileText } from 'lucide-react';
import Layout from '@/components/layouts/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { legalCategories } from '@/data/legalResources';
import { getLegalResources } from '@/api/client';
import type { LegalResource } from '@/types/types';
import { useLang } from '@/contexts/LangContext';

type DisplayItem = {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  source: string;
  featured: boolean;
};

function toDisplay(row: LegalResource): DisplayItem {
  return {
    id: row.id,
    title: row.title,
    excerpt: row.excerpt,
    category: row.category,
    date: row.published_date,
    source: row.source,
    featured: Boolean(row.is_featured),
  };
}

export default function LawsPage() {
  const { t } = useLang();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('Hammasi');
  const [items, setItems] = useState<DisplayItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLegalResources()
      .then((data) => setItems(data.map(toDisplay)))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchQ =
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.excerpt.toLowerCase().includes(query.toLowerCase());
      const matchC = activeCategory === 'Hammasi' || item.category === activeCategory;
      return matchQ && matchC;
    });
  }, [items, query, activeCategory]);

  const featured = filtered.find((n) => n.featured);
  const rest = filtered.filter((n) => !n.featured);

  return (
    <Layout>
      <section className="relative py-20 sm:py-24 bg-navy-dark bg-sacred-geometry overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-navy/60 to-navy-dark" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-sm border border-primary/30 bg-primary/5 text-primary text-xs tracking-widest uppercase">
            <Scale className="w-3.5 h-3.5" />
            {t('lawsBadge')}
          </div>
          <h1 className="font-jiang-cheng text-3xl sm:text-4xl md:text-5xl font-bold text-foreground text-balance">
            {t('lawsTitle')}
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed text-sm sm:text-base">
            {t('lawsSub')}
          </p>
          <div className="max-w-lg mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t('lawsSearchPh')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 bg-card/80 border-border/60 rounded-sm focus-visible:ring-primary"
            />
          </div>
        </div>
      </section>

      <section className="py-8 border-b border-border/50 bg-navy-light/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap gap-2 justify-center">
            {legalCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  'px-3 py-1.5 text-xs rounded-sm border transition-all',
                  activeCategory === cat
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border/60 text-muted-foreground hover:border-primary/40 hover:text-primary'
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-background bg-sacred-geometry">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-sm" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="glass-card border-ancient rounded-sm py-20 text-center space-y-3">
              <Scale className="w-10 h-10 text-muted-foreground/30 mx-auto" />
              <p className="text-muted-foreground text-sm">
                {items.length === 0 ? "Huquqiy resurslar hali mavjud emas" : t('noResults')}
              </p>
            </div>
          ) : (
            <>
              {featured && (
                <Link to={`/qonunlar/${featured.id}`} className="block group">
                  <article className="glass-card border-ancient rounded-sm overflow-hidden hover-gold-glow card-ancient">
                    <div className="p-6 md:p-8 md:flex md:gap-8 md:items-start">
                      <div className="w-12 h-12 shrink-0 bg-primary/15 border border-primary/30 rounded-sm flex items-center justify-center mb-4 md:mb-0">
                        <FileText className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1 space-y-3 min-w-0">
                        <span className="inline-block px-2 py-0.5 text-[10px] uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 rounded-sm">
                          {featured.category}
                        </span>
                        <h2 className="font-jiang-cheng text-xl md:text-2xl font-bold text-foreground group-hover:text-primary transition-colors text-balance">
                          {featured.title}
                        </h2>
                        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">{featured.excerpt}</p>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-primary" />
                            {new Date(featured.date).toLocaleDateString('uz-UZ')}
                          </span>
                          <span>{featured.source}</span>
                        </div>
                      </div>
                      <ArrowRight className="hidden md:block w-5 h-5 text-primary shrink-0 mt-2" />
                    </div>
                  </article>
                </Link>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {rest.map((item) => (
                  <Link key={item.id} to={`/qonunlar/${item.id}`} className="group">
                    <article className="glass-card border-ancient rounded-sm p-5 h-full flex flex-col hover-gold-glow transition-all">
                      <span className="text-[10px] uppercase tracking-wider text-primary mb-2">{item.category}</span>
                      <h3 className="font-jiang-cheng text-foreground font-bold text-sm leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-muted-foreground text-xs leading-relaxed flex-1 line-clamp-3">{item.excerpt}</p>
                      <div className="text-[10px] text-muted-foreground mt-4 pt-3 border-t border-border/40">
                        {new Date(item.date).toLocaleDateString('uz-UZ')} · {item.source}
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </>
          )}

          <div className="text-center pt-4">
            <Link to="/aloqa">
              <Button variant="ghost" className="border border-primary/40 text-primary hover:bg-primary/10 rounded-sm">
                {t('lawsContactCta')}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
