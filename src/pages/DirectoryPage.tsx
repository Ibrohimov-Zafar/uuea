import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { Search, Globe, Phone, ExternalLink, SlidersHorizontal, X, MapPin, Briefcase, ChevronDown, LayoutGrid, Map } from 'lucide-react';
import { Link } from 'react-router-dom';
import Layout from '@/components/layouts/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useLang } from '@/contexts/LangContext';
import { getBusinesses } from '@/api/client';
import type { Business } from '@/types/types';
const BusinessMap = lazy(() => import('@/components/BusinessMap'));

const ALL = 'Hammasi';

const CATEGORIES = [
  ALL, 'IT va Texnologiya', 'Qurilish', 'Moliya', 'Sog\'liqni Saqlash',
  'Ta\'lim', 'Savdo', 'Ekologiya', 'Import/Export', 'Ishlab Chiqarish',
  'Qishloq Xo\'jaligi', 'Transport va Logistika', 'Turizm', 'Energetika',
];

const REGIONS = [
  ALL, 'Toshkent', 'Samarqand', 'Buxoro', 'Namangan', 'Andijon',
  "Farg'ona", 'Qashqadaryo', 'Surxondaryo', 'Jizzax', 'Sirdaryo',
  'Navoiy', 'Xorazm', "Qoraqalpog'iston",
];

const SORT_OPTIONS = [
  { value: 'vip', label: 'VIP birinchi' },
  { value: 'name_asc', label: 'A → Z' },
  { value: 'name_desc', label: 'Z → A' },
  { value: 'newest', label: 'Eng yangi' },
];

export default function DirectoryPage() {
  const { t } = useLang();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(ALL);
  const [activeRegion, setActiveRegion] = useState(ALL);
  const [sortBy, setSortBy] = useState('vip');
  const [showFilters, setShowFilters] = useState(false);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const PAGE_SIZE = 12;

  const fetchBusinesses = useCallback(async (resetPage = false) => {
    const currentPage = resetPage ? 0 : page;
    setLoading(true);
    const rows = await getBusinesses({
      category: activeCategory !== ALL ? activeCategory : undefined,
      region: activeRegion !== ALL ? activeRegion : undefined,
      search: query.trim() || undefined,
      sort: sortBy,
      limit: PAGE_SIZE,
      offset: currentPage * PAGE_SIZE,
    });
    if (resetPage) { setBusinesses(rows); setPage(0); }
    else setBusinesses(prev => [...prev, ...rows]);
    setHasMore(rows.length === PAGE_SIZE);
    setLoading(false);
  }, [activeCategory, activeRegion, query, sortBy, page]);

  useEffect(() => { fetchBusinesses(true); }, [activeCategory, activeRegion, query, sortBy]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadMore = () => {
    setPage(p => {
      const next = p + 1;
      (async () => {
        setLoading(true);
        const rows = await getBusinesses({
          category: activeCategory !== ALL ? activeCategory : undefined,
          region: activeRegion !== ALL ? activeRegion : undefined,
          search: query.trim() || undefined,
          sort: sortBy,
          limit: PAGE_SIZE,
          offset: next * PAGE_SIZE,
        });
        setBusinesses(prev => [...prev, ...rows]);
        setHasMore(rows.length === PAGE_SIZE);
        setLoading(false);
      })();
      return next;
    });
  };

  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const activeFiltersCount = (activeCategory !== ALL ? 1 : 0) + (activeRegion !== ALL ? 1 : 0) + (sortBy !== 'vip' ? 1 : 0);

  const clearFilters = () => {
    setActiveCategory(ALL);
    setActiveRegion(ALL);
    setSortBy('vip');
    setQuery('');
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-24 bg-navy-dark bg-sacred-geometry overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-navy/60 to-navy-dark" />
        {/* Constellation dots */}
        <div className="absolute inset-0 pointer-events-none z-0">
          {[...Array(18)].map((_, i) => (
            <div key={i} className="absolute w-0.5 h-0.5 rounded-full bg-primary/40"
              style={{ top: `${10 + (i * 17) % 80}%`, left: `${5 + (i * 23) % 90}%`, opacity: 0.3 + (i % 5) * 0.1 }} />
          ))}
        </div>
        <div className="relative max-w-7xl mx-auto px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-sm border border-primary/30 bg-primary/5 text-primary text-xs tracking-widest uppercase">
            {t('directory')}
          </div>
          <h1 className="font-jiang-cheng text-4xl md:text-5xl font-bold text-foreground text-balance">
            {t('directoryTitle')}
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
            {t('directorySub')}
          </p>
          {/* Search bar */}
          <div className="max-w-2xl mx-auto flex gap-2">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t('directorySearchPh')}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-11 h-12 bg-card border-border/60 rounded-sm focus-visible:ring-primary text-sm"
              />
              {query && (
                <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <Button
              onClick={() => setShowFilters(f => !f)}
              className={cn(
                'h-12 px-4 rounded-sm border shrink-0 gap-2',
                showFilters || activeFiltersCount > 0
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/40'
              )}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden md:inline text-sm">Filtrlar</span>
              {activeFiltersCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-primary-foreground/20 text-[10px] font-bold flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      </section>

      {/* Advanced Filter Panel */}
      <div className={cn(
        'overflow-hidden transition-all duration-300 bg-navy-light border-b border-border/50',
        showFilters ? 'max-h-[500px]' : 'max-h-0'
      )}>
        <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Soha Filter */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
                <Briefcase className="w-3.5 h-3.5" />
                Soha (Kategoriya)
              </div>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => setActiveCategory(cat)}
                    className={cn(
                      'px-3 py-1 text-xs rounded-sm border transition-all',
                      activeCategory === cat
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-border/50 text-muted-foreground hover:border-primary/40 hover:text-primary bg-card/40'
                    )}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Mintaqa Filter */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5" />
                Mintaqa (Viloyat)
              </div>
              <div className="flex flex-wrap gap-1.5">
                {REGIONS.map(reg => (
                  <button key={reg} onClick={() => setActiveRegion(reg)}
                    className={cn(
                      'px-3 py-1 text-xs rounded-sm border transition-all',
                      activeRegion === reg
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-border/50 text-muted-foreground hover:border-primary/40 hover:text-primary bg-card/40'
                    )}>
                    {reg}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
                <ChevronDown className="w-3.5 h-3.5" />
                Saralash
              </div>
              <div className="flex flex-wrap gap-1.5">
                {SORT_OPTIONS.map(opt => (
                  <button key={opt.value} onClick={() => setSortBy(opt.value)}
                    className={cn(
                      'px-3 py-1 text-xs rounded-sm border transition-all',
                      sortBy === opt.value
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-border/50 text-muted-foreground hover:border-primary/40 hover:text-primary bg-card/40'
                    )}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {activeFiltersCount > 0 && (
            <div className="flex items-center gap-3 pt-2 border-t border-border/30">
              <span className="text-xs text-muted-foreground">Faol filtrlar:</span>
              {activeCategory !== ALL && (
                <Badge className="bg-primary/15 text-primary border-primary/30 rounded-sm text-xs gap-1">
                  <Briefcase className="w-2.5 h-2.5" />{activeCategory}
                  <button onClick={() => setActiveCategory(ALL)}><X className="w-2.5 h-2.5 ml-0.5" /></button>
                </Badge>
              )}
              {activeRegion !== ALL && (
                <Badge className="bg-primary/15 text-primary border-primary/30 rounded-sm text-xs gap-1">
                  <MapPin className="w-2.5 h-2.5" />{activeRegion}
                  <button onClick={() => setActiveRegion(ALL)}><X className="w-2.5 h-2.5 ml-0.5" /></button>
                </Badge>
              )}
              {sortBy !== 'vip' && (
                <Badge className="bg-primary/15 text-primary border-primary/30 rounded-sm text-xs gap-1">
                  {SORT_OPTIONS.find(s => s.value === sortBy)?.label}
                  <button onClick={() => setSortBy('vip')}><X className="w-2.5 h-2.5 ml-0.5" /></button>
                </Badge>
              )}
              <button onClick={clearFilters} className="ml-auto text-xs text-muted-foreground hover:text-foreground underline underline-offset-2">
                Hammasini tozalash
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <section className="py-16 bg-background bg-sacred-geometry">
        <div className="max-w-7xl mx-auto px-6">
          {/* Stats row + view toggle */}
          <div className="flex items-center justify-between mb-8">
            <p className="text-sm text-muted-foreground">
              <span className="text-primary font-semibold">{businesses.length}</span> ta kompaniya topildi
              {activeCategory !== ALL && <span className="ml-2 text-xs">• {activeCategory}</span>}
              {activeRegion !== ALL && <span className="ml-1 text-xs">• {activeRegion}</span>}
            </p>
            <div className="flex items-center gap-2">
              {activeFiltersCount > 0 && (
                <button onClick={clearFilters} className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1">
                  <X className="w-3 h-3" /> Filtrlarni tozalash
                </button>
              )}
              {/* View mode toggle */}
              <div className="flex items-center border border-border/40 rounded-sm overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn('px-2.5 py-1.5 transition-colors', viewMode === 'grid' ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-accent/5')}
                  title="Jadval ko'rinishi"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={cn('px-2.5 py-1.5 transition-colors', viewMode === 'map' ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-accent/5')}
                  title="Xarita ko'rinishi"
                >
                  <Map className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Map view */}
          {viewMode === 'map' && (
            <div className="mb-8">
              <Suspense fallback={<Skeleton className="h-[480px] bg-muted rounded-sm" />}>
                <BusinessMap businesses={businesses} />
              </Suspense>
            </div>
          )}

          {/* Grid */}
          {viewMode === 'grid' && loading && page === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-56 bg-muted rounded-sm" />
              ))}
            </div>
          ) : viewMode === 'grid' && businesses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {businesses.map((biz) => (
                <div key={biz.id}
                  className="glass-card border-ancient rounded-sm p-5 space-y-4 hover-gold-glow relative group card-ancient flex flex-col h-full">
                  {biz.is_vip && (
                    <div className="absolute top-3 right-3 vip-badge">VIP</div>
                  )}
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/15 border border-primary/25 rounded-sm flex items-center justify-center font-jiang-cheng text-primary font-bold text-lg shrink-0">
                      {biz.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-jiang-cheng text-foreground font-bold text-sm truncate">{biz.name}</h4>
                      <div className="text-primary text-xs mt-0.5">{biz.category}</div>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-xs leading-relaxed text-pretty line-clamp-3 flex-1">
                    {biz.description || 'Tavsif mavjud emas'}
                  </p>
                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    {biz.region && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-primary/60 shrink-0" />
                        <span className="truncate text-muted-foreground/70">{biz.region}</span>
                      </div>
                    )}
                    {biz.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-primary shrink-0" />
                        <span className="truncate">{biz.phone}</span>
                      </div>
                    )}
                    {biz.website && (
                      <div className="flex items-center gap-1.5">
                        <Globe className="w-3 h-3 text-primary shrink-0" />
                        <span className="truncate">{biz.website}</span>
                      </div>
                    )}
                  </div>
                  <Button size="sm" variant="ghost" asChild
                    className="w-full border border-primary/30 text-primary hover:bg-primary/10 rounded-sm text-xs mt-auto">
                    <Link to={`/katalog/${biz.id}`}>
                      Batafsil Ko'rish
                      <ExternalLink className="w-3 h-3 ml-1.5" />
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-card border-ancient rounded-sm py-20 text-center space-y-3 card-ancient">
              <Search className="w-12 h-12 text-muted-foreground mx-auto opacity-30" />
              <p className="text-muted-foreground text-sm">Hech narsa topilmadi</p>
              <p className="text-muted-foreground text-xs">Boshqa kalit so'z yoki kategoriya bilan qayta urinib ko'ring</p>
              <Button variant="ghost" onClick={clearFilters}
                className="border border-primary/30 text-primary hover:bg-primary/10 rounded-sm text-xs mt-2">
                Filtrlarni tozalash
              </Button>
            </div>
          )}

          {/* Load more */}
          {hasMore && !loading && (
            <div className="text-center mt-12">
              <Button variant="ghost" onClick={loadMore}
                className="border border-primary/40 text-primary hover:bg-primary/10 rounded-sm px-10">
                Ko'proq Yuklash
              </Button>
            </div>
          )}
          {loading && page > 0 && (
            <div className="flex justify-center mt-8">
              <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-navy-light border-t border-border/50">
        <div className="max-w-3xl mx-auto px-6 text-center space-y-5">
          <h2 className="font-jiang-cheng text-2xl md:text-3xl font-bold text-foreground text-balance">
            Kompaniyangizni Katalogga Qo'shing
          </h2>
          <p className="text-muted-foreground text-pretty">
            A'zolik orqali kompaniyangizni katalogda ko'rsating va yangi mijozlar jalb qiling.
          </p>
          <Link to="/qoshilish">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 hover-gold-glow rounded-sm px-10">
              A'zolikka Qo'shilish
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
}

