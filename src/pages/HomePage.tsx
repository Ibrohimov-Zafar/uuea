import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search, ChevronLeft, ChevronRight, Star,  Play, TrendingUp, Shield, Network, Megaphone, LifeBuoy, User, Building2 } from 'lucide-react';
import Layout from '@/components/layouts/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useLang } from '@/contexts/LangContext';
import { localizedField } from '@/i18n/locale';
import {
  createHeroLead, sendEmail,
  getPartners, getTestimonials, getSiteStats, getSiteServices,
  getBusinesses, getEvents,
} from '@/api/client';
import type { Partner, Testimonial, SiteStat, SiteService, Business, Event } from '@/types/types';
import { toast } from 'sonner';

// ---- Animated counter ----
function useCounter(target: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    const steps = 60;
    const inc = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += inc;
      if (current >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, duration / steps);
    return () => clearInterval(timer);
  }, [started, target, duration]);

  return { count, ref };
}

// ---- Service icon map ----
const iconMap: Record<string, React.ReactNode> = {
  Megaphone: <Megaphone className="w-7 h-7" />,
  LifeBuoy: <LifeBuoy className="w-7 h-7" />,
  Shield: <Shield className="w-7 h-7" />,
  Network: <Network className="w-7 h-7" />,
  TrendingUp: <TrendingUp className="w-7 h-7" />,
  Users: <Network className="w-7 h-7" />,
};

// ---- Stat Item ----
function StatItem({ value, label, suffix }: { value: number; label: string; suffix: string }) {
  const { count, ref } = useCounter(value);
  return (
    <div ref={ref} className="text-center space-y-2 animate-counter-up">
      <div className="font-jiang-cheng text-4xl md:text-5xl font-bold text-gold-gradient">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-muted-foreground text-sm tracking-wider uppercase">{label}</div>
    </div>
  );
}

// ---- Section Heading ----
function SectionHeading({ subtitle, title, description }: { subtitle: string; title: string; description?: string }) {
  return (
    <div className="text-center space-y-4 mb-12">
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-sm border border-primary/30 bg-primary/5 text-primary text-xs tracking-widest uppercase">
        {subtitle}
      </div>
      <h2 className="font-jiang-cheng text-2xl md:text-4xl font-bold text-foreground text-balance">{title}</h2>
      {description && (
        <p className="text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">{description}</p>
      )}
    </div>
  );
}

// ---- Hero Section ----
function HeroSection() {
  const { t } = useLang();
  // const [email, setEmail] = useState('');
  // const [submitting, setSubmitting] = useState(false);
  // const [submitted, setSubmitted] = useState(false);

  // Parallax + fade-in state
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY]   = useState(0);
  const [visible, setVisible]   = useState(false);

  useEffect(() => {
    // Trigger fade-in on mount
    const tid = setTimeout(() => setVisible(true), 80);
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { clearTimeout(tid); window.removeEventListener('scroll', onScroll); };
  }, []);

  // Parallax: video moves at 40% scroll speed (slower = deeper depth)
  const videoParallax  = scrollY * 0.4;
  // Content floats up a little (20% speed)
  const contentParallax = scrollY * 0.18;

  // const handleEmailSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (!email.trim() || !/^[^@]+@[^@]+[.][^@]+$/.test(email)) {
  //     toast.error(t('validEmail'));
  //     return;
  //   }
  //   setSubmitting(true);
  //   try {
  //     await createHeroLead(email.trim());
  //   } catch {
  //     toast.error(t('tryAgain'));
  //     setSubmitting(false);
  //     return;
  //   }
  //   sendEmail({
  //     type: 'hero_lead_confirmation',
  //     to: email.trim(),
  //     name: email.trim().split('@')[0],
  //     siteUrl: window.location.origin,
  //   }).catch(() => { /* silent */ });
  //   setSubmitting(false);
  //   setSubmitted(true);
  //   setEmail('');
  //   toast.success(t('heroLeadSuccess'));
  // };

  return (
    <section ref={sectionRef} className="relative min-h-[95vh] flex items-center overflow-hidden bg-black">
      {/* ── Hero background with parallax ── */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src="/new.jpeg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover object-center"
          style={{ transform: `translateY(${videoParallax}px) scale(1.08)`, willChange: 'transform' }}
        />
      </div>

      {/* Overlays — light tint for text contrast (background stays sharp) */}
      <div className="absolute inset-0 bg-black/20" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/20 to-black/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/15" />

  
      {/* Gold glow */}
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-primary/6 rounded-full blur-3xl z-0 pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-primary/4 rounded-full blur-3xl z-0 pointer-events-none" />

      {/* ── Content with parallax ── */}
      <div
        ref={contentRef}
        className="relative max-w-7xl mx-auto px-6 w-full py-28 z-10"
        style={{ transform: `translateY(${-contentParallax}px)`, willChange: 'transform' }}
      >
        <div className="flex flex-col items-center text-center max-w-5xl mx-auto">

          {/* Tag — fade delay 0ms */}
          <div
            className="inline-flex items-center gap-2.5 px-4 py-2 border border-primary/50 bg-black/40 rounded-sm mx-auto mb-6 sm:mb-8 transition-all duration-700"
            style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(24px)' }}
          >
            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
            <span className="text-primary tracking-widest uppercase font-semibold text-[clamp(0.6875rem,1.6vw,0.9375rem)]">{t('heroTag')}</span>
          </div>

          {/* Headline — 2 lines, fluid size */}
          <h1
            className="font-jiang-cheng font-bold text-white leading-[1.06] tracking-tight mb-6 sm:mb-8 max-w-5xl mx-auto transition-all duration-700 drop-shadow-[0_2px_24px_rgba(0,0,0,0.8)] text-[clamp(1.75rem,7vw,6rem)]"
            style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(32px)', transitionDelay: '100ms' }}
          >
            <span className="block whitespace-nowrap">{t('heroTitleLine1')}</span>
            <span className="block mt-1.5 sm:mt-2 whitespace-nowrap">
              {t('heroTitleLine2Start') ? <>{t('heroTitleLine2Start')}{'\u00A0'}</> : null}
              <span className="text-gold-gradient">{t('heroTitleAccent')}</span>
              {'\u00A0'}{t('heroTitleLine2')}
            </span>
          </h1>

          {/* Sub — fluid size */}
          <p
            className="text-white/95 leading-relaxed sm:leading-[1.6] max-w-3xl text-pretty mx-auto mb-8 sm:mb-10 transition-all duration-700 drop-shadow-[0_2px_16px_rgba(0,0,0,0.7)] text-[clamp(1.0625rem,2.8vw,1.875rem)]"
            style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(28px)', transitionDelay: '200ms' }}
          >
            {t('heroSub')}
          </p>

          {/* CTA Buttons — fade delay 300ms */}
          <div
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 transition-all duration-700"
            style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(24px)', transitionDelay: '300ms' }}
          >
            <Link to="/qoshilish">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 hover-gold-glow rounded-sm px-8 text-[clamp(0.8125rem,1.8vw,1rem)] font-semibold w-full sm:w-auto shadow-gold h-11 sm:h-12">
                {t('heroCta')} <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to="/katalog">
              <Button size="lg" variant="ghost" className="border border-primary/50 text-primary bg-black/40 hover:bg-black/55 hover:border-primary/70 rounded-sm px-8 text-[clamp(0.8125rem,1.8vw,1rem)] w-full sm:w-auto h-11 sm:h-12">
                <Play className="w-3.5 h-3.5 mr-2" />{t('heroCtaAlt')}
              </Button>
            </Link>
          </div>

        </div>
      </div>

      {/* Bottom fade */}
      {/* <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-navy-dark/90 to-transparent z-10" /> */}
    </section>
  );
}

// ---- Statistics Section ----
function StatsSection({ stats }: { stats: SiteStat[] }) {
  return (
    <section className="py-16 border-y border-border/30 relative">
      <div className="absolute inset-0 bg-sacred-geometry opacity-30" />
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((s) => (
            <StatItem key={s.id} value={s.value} label={s.label} suffix={s.suffix} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ---- Core Services Section ----
function ServicesSection({ services }: { services: SiteService[] }) {
  const { t } = useLang();
  return (
    <section className="py-20 relative">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeading
          subtitle={t('homeServicesBadge')}
          title={t('homeServicesTitle')}
          description={t('homeServicesSub')}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.slice(0, 4).map((svc) => (
            <div
              key={svc.id}
              className="glass-card border-ancient rounded-sm p-6 space-y-4 hover-gold-glow group card-ancient"
            >
              <div className="w-14 h-14 bg-primary/10 border border-primary/20 rounded-sm flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
                {iconMap[svc.icon] ?? <TrendingUp className="w-7 h-7" />}
              </div>
              <div>
                <div className="text-primary text-xs tracking-widest uppercase mb-1">{svc.subtitle}</div>
                <h3 className="font-jiang-cheng text-foreground text-base font-bold text-balance">{svc.title}</h3>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed text-pretty">{svc.description}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link to="/xizmatlar">
            <Button variant="ghost" className="border border-primary/40 text-primary hover:bg-primary/10 rounded-sm">
              {t('homeServicesBtn')}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

// ---- Partners Section ----
function PartnersSection({ partners }: { partners: Partner[] }) {
  const { t, lang } = useLang();
  if (partners.length === 0) return null;
  const doubled = [...partners, ...partners];
  return (
    <section className="py-16 border-y border-border/30 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-10">
        <SectionHeading subtitle={t('partnersBadge')} title={t('homePartnersTitle')} />
      </div>
      <div className="relative">
        <div className="flex gap-16 animate-marquee whitespace-nowrap">
          {doubled.map((p, i) => {
            const name = localizedField(p.name, p.name_ru, p.name_en, lang);
            return (
            <a
              key={`${p.id}-${i}`}
              href={p.website || '#'}
              target={p.website ? '_blank' : undefined}
              rel={p.website ? 'noopener noreferrer' : undefined}
              className="inline-flex items-center justify-center min-w-[120px] h-12 px-6 border border-border/60 rounded-sm bg-card/50 text-muted-foreground hover:text-primary hover:border-primary/40 transition-all text-sm font-semibold tracking-wide"
            >
              {p.logo_url
                ? <img src={p.logo_url} alt={name} className="h-6 object-contain" />
                : name
              }
            </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}

type HomeEvent = Event;

function useCarouselVisible() {
  const [visible, setVisible] = useState(1);

  useEffect(() => {
    const mqLg = window.matchMedia('(min-width: 1024px)');
    const mqMd = window.matchMedia('(min-width: 768px)');
    const update = () => {
      if (mqLg.matches) setVisible(3);
      else if (mqMd.matches) setVisible(2);
      else setVisible(1);
    };
    update();
    mqLg.addEventListener('change', update);
    mqMd.addEventListener('change', update);
    return () => {
      mqLg.removeEventListener('change', update);
      mqMd.removeEventListener('change', update);
    };
  }, []);

  return visible;
}

function EventCard({ ev, registerLabel, freeLabel }: { ev: HomeEvent; registerLabel: string; freeLabel: string }) {
  const price = ev.price_usd === 0 ? freeLabel : `$${ev.price_usd}`;
  return (
    <Link to={`/tadbirlar/${ev.id}`} className="glass-card border-ancient rounded-sm overflow-hidden hover-gold-glow group flex flex-col h-full block transition-colors cursor-pointer">
      <div className="aspect-[16/9] bg-muted relative overflow-hidden shrink-0">
        {ev.image_url
          ? <img src={ev.image_url} alt={ev.title} className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity" />
          : <div className="w-full h-full bg-primary/10 flex items-center justify-center"><span className="text-primary/40 text-4xl font-bold">{ev.category[0]}</span></div>
        }
        <div className="absolute top-3 left-3 px-2 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-sm max-w-[70%] truncate">
          {ev.category}
        </div>
        <div className="absolute bottom-3 right-3 glass-card border-ancient rounded-sm px-3 py-1.5 text-xs text-primary font-semibold max-w-[45%] truncate text-right">
          {price}
        </div>
      </div>
      <div className="p-4 sm:p-5 space-y-2 sm:space-y-3 flex flex-col flex-1">
        <div className="text-primary text-xs tracking-wider">{ev.event_date} — {ev.event_time}</div>
        <h3 className="font-jiang-cheng text-foreground font-bold text-base sm:text-sm leading-snug text-balance group-hover:text-primary transition-colors">{ev.title}</h3>
        <p className="text-muted-foreground text-sm sm:text-xs leading-relaxed text-pretty line-clamp-3 sm:line-clamp-2 flex-1">{ev.description}</p>
        <div className="text-xs text-muted-foreground flex items-start gap-1.5">
          <span className="w-1 h-1 bg-primary rounded-full shrink-0 mt-1.5" />
          <span className="min-w-0">{ev.location}</span>
        </div>
        <div className="pt-1">
          <span className="flex w-full h-10 sm:h-9 items-center justify-center bg-primary/10 group-hover:bg-primary text-primary group-hover:text-primary-foreground border border-primary/30 group-hover:border-primary rounded-sm text-sm sm:text-xs transition-all">
            {registerLabel}
          </span>
        </div>
      </div>
    </Link>
  );
}

// ---- Events Section ----
function EventsSection({ events }: { events: Event[] }) {
  const { t } = useLang();
  const [active, setActive] = useState(0);
  const visible = useCarouselVisible();
  const maxIndex = Math.max(0, events.length - visible);
  const gapRem = 1.5;

  useEffect(() => {
    setActive((a) => Math.min(a, maxIndex));
  }, [maxIndex]);

  const slideWidth =
    visible === 1
      ? '100%'
      : `calc((100% - ${(visible - 1) * gapRem}rem) / ${visible})`;

  return (
    <section className="py-16 sm:py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col gap-6 mb-8 md:flex-row md:items-end md:justify-between md:mb-12">
          <SectionHeading subtitle={t('homeEventsBadge')} title={t('homeEventsTitle')} />
          <div className="hidden md:flex gap-2 shrink-0 self-end">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setActive(Math.max(0, active - 1))}
              disabled={active === 0}
              className="border border-border rounded-sm w-9 h-9 text-muted-foreground hover:text-primary hover:border-primary/50"
              aria-label="Previous events"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setActive(Math.min(maxIndex, active + 1))}
              disabled={active >= maxIndex}
              className="border border-border rounded-sm w-9 h-9 text-muted-foreground hover:text-primary hover:border-primary/50"
              aria-label="Next events"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Mobile: full-width stacked cards */}
        <div className="flex flex-col gap-4 md:hidden">
          {events.slice(0, 4).map((ev) => (
            <EventCard key={ev.id} ev={ev} registerLabel={t('registerEvent')} freeLabel={t('freeForMembers')} />
          ))}
        </div>

        {/* Tablet+: horizontal carousel */}
        <div className="hidden md:block overflow-hidden">
          <div
            className="flex gap-6 transition-transform duration-500 ease-out"
            style={{ transform: `translateX(calc(-${active} * (${slideWidth} + ${gapRem}rem)))` }}
          >
            {events.map((ev) => (
              <div key={ev.id} className="shrink-0" style={{ width: slideWidth }}>
                <EventCard ev={ev} registerLabel={t('registerEvent')} freeLabel={t('freeForMembers')} />
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-8 sm:mt-10">
          <Link to="/tadbirlar">
            <Button variant="ghost" className="w-full sm:w-auto border border-primary/40 text-primary hover:bg-primary/10 rounded-sm">
              {t('homeEventsBtn')}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

// ---- Directory Preview ----
function DirectoryPreview({ businesses }: { businesses: Business[] }) {
  const { lang, t } = useLang();
  const [query, setQuery] = useState('');
  const filtered = businesses.filter(b => {
    const name = localizedField(b.name, b.name_ru, b.name_en, lang);
    const category = localizedField(b.category, b.category_ru, b.category_en, lang);
    return name.toLowerCase().includes(query.toLowerCase()) ||
      category.toLowerCase().includes(query.toLowerCase());
  }).slice(0, 4);

  return (
    <section className="py-20 border-y border-border/30">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeading
          subtitle={t('homeCatalogBadge')}
          title={t('homeCatalogTitle')}
          description={t('homeCatalogSub')}
        />
        <div className="max-w-lg mx-auto mb-10 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t('homeCatalogSearchPh')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 bg-card border-border/60 rounded-sm focus-visible:ring-primary text-sm"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {filtered.map((biz) => {
            const name = localizedField(biz.name, biz.name_ru, biz.name_en, lang);
            const category = localizedField(biz.category, biz.category_ru, biz.category_en, lang);
            const description = localizedField(biz.description, biz.description_ru, biz.description_en, lang);
            return (
            <Link
              key={biz.id}
              to={`/katalog/${biz.id}`}
              className="glass-card border-ancient rounded-sm p-5 space-y-3 hover-gold-glow relative group block transition-colors cursor-pointer"
            >
              {biz.is_vip && (
                <div className="absolute top-3 right-3 vip-badge">VIP</div>
              )}
              <div className="w-12 h-12 bg-primary/15 border border-primary/20 rounded-sm flex items-center justify-center font-jiang-cheng text-primary font-bold text-lg overflow-hidden">
                {biz.logo_url
                  ? <img src={biz.logo_url} alt={name} className="w-full h-full object-cover" />
                  : name.slice(0, 2).toUpperCase()
                }
              </div>
              <div>
                <h4 className="font-jiang-cheng text-foreground font-bold text-sm text-balance group-hover:text-primary transition-colors">{name}</h4>
                <div className="text-primary text-xs mt-0.5">{category}</div>
              </div>
              <p className="text-muted-foreground text-xs leading-relaxed text-pretty line-clamp-2">{description}</p>
            </Link>
          );})}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">{t('homeCatalogEmpty')}</div>
        )}
        <div className="text-center mt-10">
          <Link to="/katalog">
            <Button variant="ghost" className="border border-primary/40 text-primary hover:bg-primary/10 rounded-sm">
              {t('homeCatalogBtn')}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

// ---- Membership Plans ----
function MembershipSection() {
  const { t } = useLang();
  const tiers = [
    {
      href: '/azolik',
      icon: <User className="w-8 h-8 text-primary" />,
      title: t('homeMembershipIndividual'),
      desc: t('homeMembershipIndividualDesc'),
      plans: 'Starter · Business',
    },
    {
      href: '/korporativ',
      icon: <Building2 className="w-8 h-8 text-primary" />,
      title: t('homeMembershipCorporate'),
      desc: t('homeMembershipCorporateDesc'),
      plans: 'Corporate · International',
    },
  ];

  return (
    <section className="py-16 sm:py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeading
          subtitle={t('membershipBadge')}
          title={t('homeMembershipSplitTitle')}
          description={t('homeMembershipSplitSub')}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {tiers.map((tier) => (
            <Link
              key={tier.href}
              to={tier.href}
              className="glass-card border-ancient rounded-sm p-6 sm:p-8 space-y-5 hover-gold-glow group flex flex-col h-full"
            >
              <div className="w-14 h-14 bg-primary/10 border border-primary/30 rounded-sm flex items-center justify-center">
                {tier.icon}
              </div>
              <div className="space-y-2 flex-1">
                <h3 className="font-jiang-cheng text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                  {tier.title}
                </h3>
                <p className="text-primary text-xs font-semibold tracking-wider">{tier.plans}</p>
                <p className="text-muted-foreground text-sm leading-relaxed">{tier.desc}</p>
              </div>
              <Button
                variant="ghost"
                className="w-full border border-primary/40 text-primary hover:bg-primary/10 rounded-sm mt-auto pointer-events-none"
              >
                {t('learnMore')}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---- Testimonials ----
function TestimonialsSection({ testimonials }: { testimonials: Testimonial[] }) {
  const { t } = useLang();
  const [active, setActive] = useState(0);

  if (testimonials.length === 0) return null;
  const cur = testimonials[Math.min(active, testimonials.length - 1)];

  return (
    <section className="py-20 border-y border-border/30 relative">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeading subtitle={t('testimonialsBadge')} title={t('testimonialsTitle')} />
        <div className="max-w-3xl mx-auto">
          <div className="glass-card border-ancient rounded-sm p-8 md:p-12 text-center relative card-ancient">
            <div className="flex justify-center mb-2">
              {[...Array(cur.rating)].map((_, i) => (
                <Star key={i} className="w-4 h-4 text-primary fill-primary" />
              ))}
            </div>
            <blockquote className="text-foreground text-base md:text-lg leading-relaxed mb-8 text-pretty">
              "{cur.review}"
            </blockquote>
            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 bg-primary/20 border border-primary/30 rounded-sm flex items-center justify-center font-jiang-cheng text-primary font-bold">
                {cur.avatar || cur.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="text-left">
                <div className="font-jiang-cheng text-foreground font-bold text-sm">{cur.name}</div>
                <div className="text-primary text-xs">{cur.role}</div>
                <div className="text-muted-foreground text-xs">{cur.company}</div>
              </div>
            </div>
          </div>
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((t, i) => (
              <button
                key={t.id}
                onClick={() => setActive(i)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  i === active ? "bg-primary w-6" : "bg-border hover:bg-muted-foreground"
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ---- Newsletter ----
function NewsletterSection() {
  const { t } = useLang();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubscribe = async () => {
    if (!email.trim() || !/^[^@]+@[^@]+[.][^@]+$/.test(email)) {
      toast.error(t('validEmail'));
      return;
    }
    setSubmitting(true);
    try {
      await createHeroLead(email.trim(), 'newsletter_footer');
      sendEmail({
        type: 'hero_lead_confirmation',
        to: email.trim(),
        name: email.trim().split('@')[0],
        siteUrl: window.location.origin,
      }).catch(() => { /* silent */ });
      toast.success(t('heroLeadSuccess'));
      setEmail('');
    } catch {
      toast.error(t('tryAgain'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-20 bg-navy-dark/75 backdrop-blur-sm relative overflow-hidden border-t border-border/30">
      <div className="absolute inset-0 bg-sacred-geometry opacity-40" />
      <div className="absolute inset-0 bg-gradient-to-r from-navy-dark via-navy to-navy-dark" />
      <div className="relative max-w-3xl mx-auto px-6 text-center">
        <SectionHeading
          subtitle={t('homeNewsletterBadge')}
          title={t('homeNewsletterTitle')}
          description={t('homeNewsletterSub')}
        />
        <div className="max-w-md mx-auto">
          <Input
            placeholder={t('homeNewsletterEmailPh')}
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubscribe()}
            className="bg-card border-border/60 rounded-sm text-sm"
          />
        </div>
        <Button
          type="button"
          disabled={submitting}
          onClick={handleSubscribe}
          className="mt-5 bg-primary text-primary-foreground hover:bg-primary/90 hover-gold-glow rounded-sm px-10 text-sm"
        >
          {submitting ? '...' : t('homeNewsletterBtn')}
        </Button>
      </div>
    </section>
  );
}

// ---- Main Page ----
export default function HomePage() {
  const [stats, setStats] = useState<SiteStat[]>([]);
  const [services, setServices] = useState<SiteService[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    getSiteStats().then(setStats).catch(() => {});
    getSiteServices().then(setServices).catch(() => {});
    getPartners().then(setPartners).catch(() => {});
    getEvents(true).then(setEvents).catch(() => {});
    getBusinesses({ limit: 8, sort: 'vip' }).then(setBusinesses).catch(() => {});
    getTestimonials().then(setTestimonials).catch(() => {});
  }, []);

  return (
    <Layout>
      <div className="relative">
        <div className="pointer-events-none fixed inset-0 -z-10 bg-home-page" aria-hidden="true" />
        <div className="pointer-events-none fixed inset-0 -z-10 bg-navy-dark/65" aria-hidden="true" />
        <HeroSection />
        <StatsSection stats={stats} />
        <ServicesSection services={services} />
        <PartnersSection partners={partners} />
        <EventsSection events={events} />
        <DirectoryPreview businesses={businesses} />
        <MembershipSection />
        <TestimonialsSection testimonials={testimonials} />
        <NewsletterSection />
      </div>
    </Layout>
  );
}
