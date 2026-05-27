import { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Search, CreditCard, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import Layout from '@/components/layouts/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { getEvents, getEventSpots, getMyEventRegistrations, eventCheckout } from '@/api/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLang } from '@/contexts/LangContext';
import { toast } from 'sonner';
import type { Event } from '@/types/types';

const EVENT_CATEGORIES = ['Hammasi', 'Forum', 'Networking', 'Trening', 'Gala', 'Summit', 'Suhbat'];

interface RegForm { full_name: string; email: string; phone: string; company: string }

export default function EventsPage() {
  const { user, profile } = useAuth();
  const { t } = useLang();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Hammasi');
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [regForm, setRegForm] = useState<RegForm>({ full_name: '', email: '', phone: '', company: '' });
  const [registering, setRegistering] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [registeredIds, setRegisteredIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await getEvents(true);
      setEvents(data);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!user) {
      setRegisteredIds(new Set());
      return;
    }
    getMyEventRegistrations()
      .then((rows) => setRegisteredIds(new Set(rows.map((r) => r.event_id))))
      .catch(() => setRegisteredIds(new Set()));
  }, [user]);

  useEffect(() => {
    if (selectedEvent && profile) {
      setRegForm(f => ({
        ...f,
        full_name: f.full_name || profile.full_name || '',
        email: f.email || profile.email || '',
        phone: f.phone || profile.phone || '',
      }));
    }
    setRegError(null);
  }, [selectedEvent, profile]);

  const filtered = events.filter(ev => {
    const matchQ = !query || ev.title.toLowerCase().includes(query.toLowerCase()) || ev.location.toLowerCase().includes(query.toLowerCase());
    const matchC = activeCategory === 'Hammasi' || ev.category === activeCategory;
    return matchQ && matchC;
  });

  const handleRegister = async () => {
    if (!selectedEvent) return;
    if (!regForm.full_name.trim() || !regForm.email.trim()) { toast.error('Ism va email majburiy'); return; }
    if (!/\S+@\S+\.\S+/.test(regForm.email)) { toast.error("To'g'ri email kiriting"); return; }
    setRegistering(true);
    setRegError(null);
    try {
      const result = await eventCheckout({
        event_id: selectedEvent.id,
        user_id: user?.id || null,
        customer_email: regForm.email,
        customer_name: regForm.full_name,
        customer_phone: regForm.phone || null,
        company: regForm.company || null,
      }) as { free?: boolean; url?: string };

      if (!result) throw new Error('Server javobi yo\'q');

      if (result.free) {
        toast.success('Muvaffaqiyatli ro\'yxatdan o\'tdingiz!');
        setRegisteredIds((prev) => new Set(prev).add(selectedEvent.id));
        setSelectedEvent(null);
        const updated = await getEventSpots(selectedEvent.id);
        if (updated) {
          setEvents(prev => prev.map(ev => ev.id === selectedEvent.id ? { ...ev, spots_remaining: updated.spots_remaining } : ev));
        }
      } else if (result.url) {
        // Paid event - redirect to Stripe
        window.location.href = result.url;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Xatolik yuz berdi';
      setRegError(msg);
      toast.error(msg);
    } finally {
      setRegistering(false);
    }
  };

  const openEvent = (ev: Event) => {
    setSelectedEvent(ev);
    setRegForm({ full_name: '', email: '', phone: '', company: '' });
  };

  const featured = events.filter(e => e.is_featured);
  const upcomingCount = events.filter(e => new Date(e.event_date) >= new Date()).length;

  return (
    <Layout>
      <div className="min-h-screen bg-navy-dark pt-20">
        {/* Hero */}
        <div className="relative py-16 md:py-24 overflow-hidden">
          <div className="sacred-geometry-bg" />
          <div className="absolute inset-0 constellation-bg opacity-20" />
          <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-primary/30 bg-primary/5 rounded-sm mb-4">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              <span className="text-primary text-xs font-semibold tracking-wider">TADBIRLAR TAQVIMI</span>
            </div>
            <h1 className="font-jiang-cheng text-foreground text-3xl md:text-5xl font-bold mb-4 text-balance">
              Biznes <span className="gradient-text">Tadbirlari</span>
            </h1>
            <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto text-pretty">
              Tarmoqlash, o'rganish va biznes imkoniyatlarini kengaytirish uchun tadbirlarimizga qo'shiling
            </p>
            <div className="flex items-center justify-center gap-8 mt-8 flex-wrap">
              {[
                { label: "Yillik Tadbirlar", value: `${events.length}+` },
                { label: "Kelayotgan Tadbirlar", value: upcomingCount },
                { label: "Ishtirokchilar", value: "2500+" },
              ].map(stat => (
                <div key={stat.label} className="text-center">
                  <div className="font-jiang-cheng text-primary text-3xl font-bold">{stat.value}</div>
                  <div className="text-muted-foreground text-xs mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Featured */}
        {featured.length > 0 && (
          <div className="max-w-7xl mx-auto px-6 pb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px bg-primary/30 flex-1" />
              <span className="font-jiang-cheng text-primary text-xs tracking-widest uppercase">Tanlangan Tadbirlar</span>
              <div className="h-px bg-primary/30 flex-1" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featured.slice(0, 2).map(ev => (
                <EventCard key={ev.id} event={ev} featured registered={registeredIds.has(ev.id)} onClick={() => openEvent(ev)} />
              ))}
            </div>
          </div>
        )}

        {/* Filters + All events */}
        <div className="max-w-7xl mx-auto px-6 pb-20">
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tadbirlarni qidirish..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="pl-9 bg-background/60 border-border/60 rounded-sm"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap">
              {EVENT_CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  className={cn('text-xs px-3 py-1.5 rounded-sm border transition-all shrink-0',
                    activeCategory === cat
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border/60 text-muted-foreground hover:border-primary/40 hover:text-primary'
                  )}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64 bg-muted rounded-sm" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-24 text-center">
              <Calendar className="w-12 h-12 text-primary/20 mx-auto mb-4" />
              <p className="text-muted-foreground">Tadbirlar topilmadi</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(ev => (
                <EventCard key={ev.id} event={ev} registered={registeredIds.has(ev.id)} onClick={() => openEvent(ev)} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Registration modal */}
      <Dialog open={!!selectedEvent} onOpenChange={o => !o && setSelectedEvent(null)}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg bg-navy border-ancient rounded-sm">
          <DialogHeader>
            <DialogTitle className="font-jiang-cheng text-foreground pr-6 text-balance">
              {selectedEvent?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedEvent && registeredIds.has(selectedEvent.id) ? (
            <div className="py-6 text-center space-y-3">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto" />
              <p className="font-jiang-cheng text-foreground font-bold">Siz bu tadbirga ro'yxatdan o'tgansiz</p>
              <p className="text-muted-foreground text-sm">Tadbir kuni email orqali eslatma olasiz</p>
            </div>
          ) : selectedEvent && (
            <div className="space-y-4 py-2">
              {/* Event details */}
              <div className="glass-card border-ancient rounded-sm p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>{selectedEvent.event_date}{selectedEvent.event_time ? ` · ${selectedEvent.event_time}` : ''}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>{selectedEvent.location}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <CreditCard className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span className={cn('font-bold', selectedEvent.price_usd > 0 ? 'text-primary' : 'text-green-400')}>
                    {selectedEvent.price_usd > 0 ? `$${selectedEvent.price_usd}` : t('free')}
                  </span>
                  {selectedEvent.spots_remaining > 0 && selectedEvent.spots_remaining <= 10 && (
                    <span className="text-yellow-400 text-[10px]">· Faqat {selectedEvent.spots_remaining} ta joy!</span>
                  )}
                </div>
              </div>

              {/* Registration form */}
              <div className="space-y-3">
                {([
                  { label: 'Ism Familiya *', field: 'full_name' as const, ph: 'Ism Familiya', type: 'text' },
                  { label: 'Email *', field: 'email' as const, ph: 'email@example.com', type: 'email' },
                  { label: 'Telefon', field: 'phone' as const, ph: '+998 90 ...', type: 'tel' },
                  { label: 'Kompaniya', field: 'company' as const, ph: 'Kompaniya nomi (ixtiyoriy)', type: 'text' },
                ] as { label: string; field: keyof RegForm; ph: string; type: string }[]).map(({ label, field, ph, type }) => (
                  <div key={field} className="space-y-1.5">
                    <Label className="text-xs font-normal text-muted-foreground">{label}</Label>
                    <Input
                      type={type}
                      value={regForm[field]}
                      onChange={e => setRegForm(f => ({ ...f, [field]: e.target.value }))}
                      placeholder={ph}
                      className="bg-background/60 border-border/60 rounded-sm text-sm"
                    />
                  </div>
                ))}
              </div>

              {regError && (
                <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-sm">
                  <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                  <p className="text-destructive text-xs">{regError}</p>
                </div>
              )}

              {selectedEvent.spots_remaining <= 0 && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-sm">
                  <AlertCircle className="w-4 h-4 text-destructive" />
                  <span className="text-destructive text-xs font-semibold">{t('noSpots')}</span>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            {selectedEvent && registeredIds.has(selectedEvent.id) ? (
              <Button onClick={() => setSelectedEvent(null)} className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm w-full">
                Yopish
              </Button>
            ) : (
              <>
                <Button variant="ghost" onClick={() => setSelectedEvent(null)} className="border border-border/40 text-muted-foreground rounded-sm">
                  {t('cancel')}
                </Button>
                <Button
                  onClick={handleRegister}
                  disabled={registering || (selectedEvent?.spots_remaining ?? 1) <= 0}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm"
                >
                  {registering
                    ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />{t('registering')}</span>
                    : selectedEvent && selectedEvent.price_usd > 0
                      ? <span className="flex items-center gap-2"><CreditCard className="w-4 h-4" />{t('payAndRegister')}</span>
                      : <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4" />{t('registerEvent')}</span>
                  }
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

/* Event Card Component */
function EventCard({ event, onClick, featured = false, registered = false }: {
  event: Event; onClick: () => void; featured?: boolean; registered?: boolean;
}) {
  const { t } = useLang();
  const isUpcoming = new Date(event.event_date) >= new Date();
  const spotsLow = event.spots_remaining > 0 && event.spots_remaining <= 10;
  return (
    <div
      onClick={onClick}
      className={cn(
        'glass-card border-ancient rounded-sm overflow-hidden card-ancient cursor-pointer',
        'hover:border-primary/40 hover:-translate-y-0.5 transition-all duration-300',
        'flex flex-col h-full',
        featured && 'border-primary/30'
      )}
    >
      {/* Category banner */}
      <div className="bg-primary/10 border-b border-border/30 px-4 py-2 flex items-center justify-between">
        <span className="text-primary text-[10px] font-semibold tracking-wider uppercase">{event.category}</span>
        <div className="flex items-center gap-2">
          {featured && <span className="vip-badge text-[9px]">Featured</span>}
          {event.price_usd > 0
            ? <span className="text-primary font-bold text-xs">${event.price_usd}</span>
            : <span className="text-green-400 text-xs font-bold">{t('free')}</span>
          }
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-jiang-cheng text-foreground font-bold text-sm mb-3 leading-snug line-clamp-2 text-balance">{event.title}</h3>
        <div className="space-y-1.5 mb-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
            <span>{event.event_date}{event.event_time ? ` · ${event.event_time}` : ''}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Users className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className={cn(spotsLow ? 'text-yellow-400' : 'text-muted-foreground')}>
              {event.spots_remaining <= 0 ? t('noSpots') : spotsLow ? t('spotsLeftOnly', { n: event.spots_remaining }) : `${event.spots_remaining} ${t('spots')}`}
            </span>
          </div>
        </div>
        {event.description && (
          <p className="text-muted-foreground text-xs leading-relaxed mb-4 line-clamp-2 flex-1 text-pretty">{event.description}</p>
        )}
        {registered ? (
          <div className="w-full flex items-center justify-center gap-2 py-2.5 rounded-sm border border-green-400/30 bg-green-400/10 text-green-400 text-sm font-semibold mt-auto">
            <CheckCircle className="w-4 h-4" /> Ro'yxatdan o'tilgan
          </div>
        ) : (
          <Button className={cn(
            'w-full rounded-sm text-sm mt-auto shrink-0',
            event.spots_remaining <= 0
              ? 'bg-muted text-muted-foreground cursor-not-allowed'
              : 'bg-primary text-primary-foreground hover:bg-primary/90'
          )} onClick={event.spots_remaining > 0 ? onClick : undefined} disabled={event.spots_remaining <= 0}>
            {event.spots_remaining <= 0 ? t('noSpots')
              : event.price_usd > 0 ? t('payAndRegister') : t('registerEvent')}
          </Button>
        )}
        {!isUpcoming && (
          <div className="mt-2 text-center">
            <span className="text-muted-foreground/50 text-[10px]">Tadbir tugagan</span>
          </div>
        )}
      </div>
    </div>
  );
}
