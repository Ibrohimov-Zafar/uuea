import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search, ChevronLeft, ChevronRight, Star, CheckCircle, Play, TrendingUp, Shield, Network, Megaphone, LifeBuoy } from 'lucide-react';
import Layout from '@/components/layouts/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { stats, services, membershipPlans, testimonials, events, businesses, partners } from '@/data/mockData';
import { useLang } from '@/contexts/LangContext';
import { createHeroLead, sendEmail } from '@/api/client';
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
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Parallax + fade-in state
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const videoRef   = useRef<HTMLVideoElement>(null);
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

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !/^[^@]+@[^@]+[.][^@]+$/.test(email)) {
      toast.error(t('validEmail'));
      return;
    }
    setSubmitting(true);
    try {
      await createHeroLead(email.trim());
    } catch {
      toast.error(t('tryAgain'));
      setSubmitting(false);
      return;
    }
    sendEmail({
      type: 'hero_lead_confirmation',
      to: email.trim(),
      name: email.trim().split('@')[0],
      siteUrl: window.location.origin,
    }).catch(() => { /* silent */ });
    setSubmitting(false);
    setSubmitted(true);
    setEmail('');
    toast.success(t('heroLeadSuccess'));
  };

  return (
    <section ref={sectionRef} className="relative min-h-[95vh] flex items-center overflow-hidden bg-navy-dark">
      {/* ── Video Background with parallax ── */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        poster="https://miaoda-site-img.s3cdn.medo.dev/images/KLing_e96d7921-c5e4-4732-b341-2cbb2a84383f.jpg"
        style={{ transform: `translateY(${videoParallax}px) scale(1.12)`, willChange: 'transform' }}
      >
        <source src="https://cdn.pixabay.com/video/2023/07/22/172549-848786925_large.mp4" type="video/mp4" />
        <source src="https://cdn.pixabay.com/video/2021/09/04/87009-600857783_large.mp4" type="video/mp4" />
      </video>

      {/* Dark mystical overlays */}
      <div className="absolute inset-0 bg-navy-dark/75" />
      <div className="absolute inset-0 bg-gradient-to-r from-navy-dark/95 via-navy-dark/65 to-navy-dark/35" />
      <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/90 via-transparent to-navy-dark/40" />
      <div className="absolute inset-0 sacred-geometry-bg opacity-25" />
      <div className="absolute inset-0 constellation-bg opacity-15" />

      {/* Runic circle overlay */}
      <div className="absolute top-16 right-10 w-[420px] h-[420px] z-0 pointer-events-none hidden xl:block">
        <div className="absolute inset-0 rounded-full border border-primary/10 animate-spin-slow" />
        <div className="absolute inset-8 rounded-full border border-primary/15" />
        <div className="absolute inset-16 rounded-full border border-primary/25 animate-spin-slow" style={{ animationDuration: '30s' }} />
        <div className="absolute inset-1/3 rounded-full bg-primary/8 blur-3xl" />
      </div>
      <div className="absolute bottom-10 left-0 w-72 h-72 border border-primary/8 rotate-12 z-0 pointer-events-none hidden lg:block" />
      <div className="absolute bottom-32 left-16 w-48 h-48 border border-primary/5 rotate-45 z-0 pointer-events-none hidden lg:block" />

      {/* Gold glow */}
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-primary/6 rounded-full blur-3xl z-0 pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-primary/4 rounded-full blur-3xl z-0 pointer-events-none" />

      {/* ── Content with parallax ── */}
      <div
        ref={contentRef}
        className="relative max-w-7xl mx-auto px-6 w-full py-28 z-10"
        style={{ transform: `translateY(${-contentParallax}px)`, willChange: 'transform' }}
      >
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">

          {/* Tag — fade delay 0ms */}
          <div
            className="inline-flex items-center gap-2.5 px-4 py-2 border border-primary/40 bg-primary/8 rounded-sm mx-auto mb-8 transition-all duration-700"
            style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(24px)' }}
          >
            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
            <span className="text-primary text-xs tracking-widest uppercase font-semibold">{t('heroTag')}</span>
          </div>

          {/* Headline — fade delay 100ms */}
          <h1
            className="font-jiang-cheng text-4xl md:text-6xl xl:text-7xl font-bold text-foreground leading-tight text-balance mb-6 transition-all duration-700"
            style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(32px)', transitionDelay: '100ms' }}
          >
            {t('heroTitle').split(' ').slice(0, 2).join(' ')}{' '}
            <span className="relative inline-block">
              <span className="gradient-text">{t('heroTitle').split(' ').slice(2, 3).join(' ')}</span>
            </span>{' '}
            {t('heroTitle').split(' ').slice(3).join(' ')}
          </h1>

          {/* Sub — fade delay 200ms */}
          <p
            className="text-muted-foreground text-base md:text-xl leading-relaxed max-w-2xl text-pretty mx-auto mb-8 transition-all duration-700"
            style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(28px)', transitionDelay: '200ms' }}
          >
            {t('heroSub')}
          </p>

          {/* CTA Buttons — fade delay 300ms */}
          <div
            className="flex flex-col sm:flex-row gap-4 justify-center mb-8 transition-all duration-700"
            style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(24px)', transitionDelay: '300ms' }}
          >
            <Link to="/qoshilish">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 hover-gold-glow rounded-sm px-8 text-sm font-semibold w-full sm:w-auto shadow-gold">
                {t('heroCta')} <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to="/katalog">
              <Button size="lg" variant="ghost" className="border border-primary/40 text-primary hover:bg-primary/10 hover:border-primary/60 rounded-sm px-8 text-sm w-full sm:w-auto">
                <Play className="w-3.5 h-3.5 mr-2" />{t('heroCtaAlt')}
              </Button>
            </Link>
          </div>

          {/* Stats — fade delay 400ms */}
          <div
            className="flex items-center gap-8 flex-wrap justify-center mb-6 transition-all duration-700"
            style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)', transitionDelay: '400ms' }}
          >
            {[
              { n: "2500+", l: t('statMembers') },
              { n: "15+",   l: t('statYears') },
              { n: "50+",   l: t('statEvents') },
            ].map(s => (
              <div key={s.l} className="space-y-0.5">
                <div className="font-jiang-cheng text-2xl font-bold text-primary">{s.n}</div>
                <div className="text-[11px] text-muted-foreground uppercase tracking-wider">{s.l}</div>
              </div>
            ))}
          </div>

          {/* Trust badges — fade delay 500ms */}
          <div
            className="flex items-center gap-3 flex-wrap justify-center mb-8 transition-all duration-700"
            style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(16px)', transitionDelay: '500ms' }}
          >
            {[
              { icon: <Shield className="w-3.5 h-3.5" />,      label: t('statCert') },
              { icon: <CheckCircle className="w-3.5 h-3.5" />, label: t('statVerified') },
              { icon: <Star className="w-3.5 h-3.5" />,        label: t('statPremium') },
            ].map(b => (
              <div key={b.label} className="flex items-center gap-1.5 px-3 py-1.5 border border-border/40 bg-background/20 rounded-sm text-xs text-muted-foreground backdrop-blur-sm">
                <span className="text-primary">{b.icon}</span>
                {b.label}
              </div>
            ))}
          </div>

          {/* Email form — fade delay 600ms */}
          <div
            className="w-full max-w-xl mx-auto transition-all duration-700"
            style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(16px)', transitionDelay: '600ms' }}
          >
            {submitted ? (
              <div className="flex items-center justify-center gap-3 px-6 py-4 border border-primary/40 bg-primary/10 rounded-sm backdrop-blur-sm">
                <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                <div className="text-left">
                  <p className="text-sm font-semibold text-primary">Muvaffaqiyatli yuborildi!</p>
                  <p className="text-xs text-muted-foreground">Tez orada siz bilan bog&apos;lanamiz.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleEmailSubmit} className="space-y-2">
                <p className="text-xs text-muted-foreground/80 uppercase tracking-widest text-center">
                  A&apos;zolikka qo&apos;shilish uchun emailingizni qoldiring
                </p>
                <div className="flex gap-2 p-1.5 bg-navy-dark/60 border border-primary/25 rounded-sm backdrop-blur-sm">
                  <Input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="email@kompaniya.uz"
                    className="flex-1 min-w-0 bg-transparent border-0 text-foreground placeholder:text-muted-foreground/60 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 h-10 px-3"
                  />
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm px-5 shrink-0 gap-2 text-sm font-semibold shadow-gold"
                  >
                    {submitting
                      ? <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      : <ArrowRight className="w-4 h-4" />
                    }
                    {submitting ? "Yuborilmoqda..." : "Qo'shilish"}
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground/50 text-center">
                  Spam yo&apos;q. Istalgan vaqt obunani bekor qilish mumkin.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent z-10" />
    </section>
  );
}

// ---- Statistics Section ----
function StatsSection() {
  return (
    <section className="py-16 bg-navy-light border-y border-border/50 relative">
      <div className="absolute inset-0 bg-sacred-geometry opacity-30" />
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((s) => (
            <StatItem key={s.label} value={s.value} label={s.label} suffix={s.suffix} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ---- Core Services Section ----
function ServicesSection() {
  return (
    <section className="py-20 bg-background relative bg-sacred-geometry">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeading
          subtitle="Xizmatlarimiz"
          title="Biznesingizni Kuchaytiruvchi Xizmatlar"
          description="Chamber ekotizimining asosiy ustunlari — biznesingiz rivojlanishida har bir qadamda yoningizda."
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
              Barcha Xizmatlar
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

// ---- Partners Section ----
function PartnersSection() {
  return (
    <section className="py-16 bg-navy-light border-y border-border/50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-10">
        <SectionHeading subtitle="Hamkorlar" title="Yirik Hamkorlar va Investorlar" />
      </div>
      <div className="relative">
        <div className="flex gap-16 animate-marquee whitespace-nowrap">
          {[...partners, ...partners].map((p, i) => (
            <div
              key={i}
              className="inline-flex items-center justify-center min-w-[120px] h-12 px-6 border border-border/60 rounded-sm bg-card/50 text-muted-foreground hover:text-primary hover:border-primary/40 transition-all text-sm font-semibold tracking-wide"
            >
              {p.name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---- Events Section ----
function EventsSection() {
  const [active, setActive] = useState(0);
  const visible = 3;
  const maxIndex = events.length - visible;

  return (
    <section className="py-20 bg-background bg-sacred-geometry">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-end justify-between mb-12">
          <SectionHeading
            subtitle="Tadbirlar"
            title="Kelgusi Tadbirlar"
          />
          <div className="flex gap-2 shrink-0">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setActive(Math.max(0, active - 1))}
              disabled={active === 0}
              className="border border-border rounded-sm w-9 h-9 text-muted-foreground hover:text-primary hover:border-primary/50"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setActive(Math.min(maxIndex, active + 1))}
              disabled={active >= maxIndex}
              className="border border-border rounded-sm w-9 h-9 text-muted-foreground hover:text-primary hover:border-primary/50"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="overflow-hidden">
          <div
            className="flex gap-6 transition-transform duration-500"
            style={{ transform: `translateX(-${active * (100 / visible)}%)` }}
          >
            {events.map((ev) => (
              <div
                key={ev.id}
                className="min-w-[calc(33.333%-1rem)] glass-card border-ancient rounded-sm overflow-hidden hover-gold-glow group"
              >
                <div className="aspect-[16/9] bg-muted relative overflow-hidden">
                  <img src={ev.image} alt={ev.title} className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity" />
                  <div className="absolute top-3 left-3 px-2 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-sm">
                    {ev.category}
                  </div>
                  <div className="absolute bottom-3 right-3 glass-card border-ancient rounded-sm px-3 py-1.5 text-xs text-primary font-semibold">
                    {ev.price}
                  </div>
                </div>
                <div className="p-5 space-y-3">
                  <div className="text-primary text-xs tracking-wider">{ev.date} — {ev.time}</div>
                  <h3 className="font-jiang-cheng text-foreground font-bold text-sm leading-tight text-balance">{ev.title}</h3>
                  <p className="text-muted-foreground text-xs leading-relaxed text-pretty line-clamp-2">{ev.description}</p>
                  <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <span className="w-1 h-1 bg-primary rounded-full" />
                    {ev.location}
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => {}} className="w-full bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground border border-primary/30 hover:border-primary rounded-sm text-xs transition-all">
                    Ro'yxatdan O'tish
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="text-center mt-10">
          <Link to="/tadbirlar">
            <Button variant="ghost" className="border border-primary/40 text-primary hover:bg-primary/10 rounded-sm">
              Barcha Tadbirlar
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

// ---- Directory Preview ----
function DirectoryPreview() {
  const [query, setQuery] = useState('');
  const filtered = businesses.filter(b =>
    b.name.toLowerCase().includes(query.toLowerCase()) ||
    b.category.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 4);

  return (
    <section className="py-20 bg-navy-light border-y border-border/50">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeading
          subtitle="Biznes Katalog"
          title="Biznes Katalogini Ko'ring"
          description="Mintaqaning eng yirik biznes ma'lumotlar bazasida qidiring va hamkor toping."
        />
        <div className="max-w-lg mx-auto mb-10 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Kompaniya nomi yoki kategoriya..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 bg-card border-border/60 rounded-sm focus-visible:ring-primary text-sm"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {filtered.map((biz) => (
            <div key={biz.id} className="glass-card border-ancient rounded-sm p-5 space-y-3 hover-gold-glow relative group">
              {biz.vip && (
                <div className="absolute top-3 right-3 vip-badge">VIP</div>
              )}
              <div className="w-12 h-12 bg-primary/15 border border-primary/20 rounded-sm flex items-center justify-center font-jiang-cheng text-primary font-bold text-lg">
                {biz.logo}
              </div>
              <div>
                <h4 className="font-jiang-cheng text-foreground font-bold text-sm text-balance">{biz.name}</h4>
                <div className="text-primary text-xs mt-0.5">{biz.category}</div>
              </div>
              <p className="text-muted-foreground text-xs leading-relaxed text-pretty line-clamp-2">{biz.description}</p>
            </div>
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">Hech narsa topilmadi</div>
        )}
        <div className="text-center mt-10">
          <Link to="/katalog">
            <Button variant="ghost" className="border border-primary/40 text-primary hover:bg-primary/10 rounded-sm">
              Barcha Bizneslar
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
  return (
    <section className="py-20 bg-background bg-sacred-geometry">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeading
          subtitle="A'zolik"
          title="A'zolik Rejalari"
          description="Biznesingiz hajmiga mos reja tanlang va chamber imtiyozlaridan to'liq foydalaning."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {membershipPlans.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                "glass-card rounded-sm p-6 space-y-5 flex flex-col h-full border-ancient hover-gold-glow",
                plan.popular ? "border border-primary/60 shadow-gold relative" : "border border-border/60"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 vip-badge text-[10px] px-4">Mashhur</div>
              )}
              <div>
                <h3 className="font-jiang-cheng text-foreground text-base font-bold">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-primary font-jiang-cheng text-3xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground text-xs">/{plan.period}</span>
                </div>
              </div>
              <ul className="space-y-2.5 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link to="/qoshilish" className="mt-auto">
                <Button
                  className={cn(
                    "w-full rounded-sm text-sm",
                    plan.popular
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-accent hover:bg-accent/80 text-foreground border border-border"
                  )}
                >
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---- Testimonials ----
function TestimonialsSection() {
  const [active, setActive] = useState(0);

  return (
    <section className="py-20 bg-navy-light border-y border-border/50 bg-sacred-geometry">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeading subtitle="Sharhlar" title="A'zolarimiz Nima Deydi" />
        <div className="max-w-3xl mx-auto">
          <div className="glass-card border-ancient rounded-sm p-8 md:p-12 text-center relative card-ancient">
            <div className="flex justify-center mb-2">
              {[...Array(testimonials[active].rating)].map((_, i) => (
                <Star key={i} className="w-4 h-4 text-primary fill-primary" />
              ))}
            </div>
            <blockquote className="text-foreground text-base md:text-lg leading-relaxed mb-8 text-pretty">
              "{testimonials[active].review}"
            </blockquote>
            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 bg-primary/20 border border-primary/30 rounded-sm flex items-center justify-center font-jiang-cheng text-primary font-bold">
                {testimonials[active].avatar}
              </div>
              <div className="text-left">
                <div className="font-jiang-cheng text-foreground font-bold text-sm">{testimonials[active].name}</div>
                <div className="text-primary text-xs">{testimonials[active].role}</div>
                <div className="text-muted-foreground text-xs">{testimonials[active].company}</div>
              </div>
            </div>
          </div>
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, i) => (
              <button
                key={i}
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
  return (
    <section className="py-20 bg-navy-dark relative overflow-hidden">
      <div className="absolute inset-0 bg-sacred-geometry opacity-40" />
      <div className="absolute inset-0 bg-gradient-to-r from-navy-dark via-navy to-navy-dark" />
      <div className="relative max-w-3xl mx-auto px-6 text-center">
        <SectionHeading
          subtitle="Xabarnoma"
          title="Yangiliklar va Tadbirlardan Xabardor Bo'ling"
          description="Haftalik yangiliklar, biznes maslahatlar va tadbirlar haqida birinchi bo'lib xabar oling."
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input placeholder="Ismingiz" className="bg-card border-border/60 rounded-sm text-sm" />
          <Input placeholder="Familiyangiz" className="bg-card border-border/60 rounded-sm text-sm" />
          <Input placeholder="Email manzilingiz" type="email" className="bg-card border-border/60 rounded-sm text-sm" />
        </div>
        <Button type="button" onClick={() => {}} className="mt-5 bg-primary text-primary-foreground hover:bg-primary/90 hover-gold-glow rounded-sm px-10 text-sm">
          Obuna Bo'lish
        </Button>
      </div>
    </section>
  );
}

// ---- Main Page ----
export default function HomePage() {
  return (
    <Layout>
      <HeroSection />
      <StatsSection />
      <ServicesSection />
      <PartnersSection />
      <EventsSection />
      <DirectoryPreview />
      <MembershipSection />
      <TestimonialsSection />
      <NewsletterSection />
    </Layout>
  );
}
