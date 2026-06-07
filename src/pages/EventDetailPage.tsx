import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft, Calendar, MapPin, Users, CreditCard,
  CheckCircle, AlertCircle, Loader2, Clock,
} from 'lucide-react';
import Layout from '@/components/layouts/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { getEventDetail, getEventSpots, getMyEventRegistrations, eventCheckout } from '@/api/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLang } from '@/contexts/LangContext';
import { toast } from 'sonner';
import type { Event } from '@/types/types';

interface RegForm { full_name: string; email: string; phone: string; company: string }

function lf(uz: string | null | undefined, ru: string | null | undefined, en: string | null | undefined, lang: string): string {
  if (lang === 'ru' && ru) return ru;
  if (lang === 'en' && en) return en;
  return uz || '';
}

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, profile } = useAuth();
  const { t, lang } = useLang();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [form, setForm] = useState<RegForm>({ full_name: '', email: '', phone: '', company: '' });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!id) return;
    getEventDetail(id)
      .then(setEvent)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!user || !id) return;
    getMyEventRegistrations()
      .then(rows => setRegistered(rows.some(r => r.event_id === id)))
      .catch(() => {});
  }, [user, id]);

  useEffect(() => {
    if (profile && showForm) {
      setForm(f => ({
        ...f,
        full_name: f.full_name || profile.full_name || '',
        email: f.email || profile.email || '',
        phone: f.phone || profile.phone || '',
      }));
    }
  }, [profile, showForm]);

  const handleRegister = async () => {
    if (!event) return;
    if (!form.full_name.trim() || !form.email.trim()) { toast.error(t('nameEmailRequired')); return; }
    if (!/\S+@\S+\.\S+/.test(form.email)) { toast.error(t('validEmail')); return; }
    setRegistering(true);
    setRegError(null);
    try {
      const result = await eventCheckout({
        event_id: event.id,
        user_id: user?.id || null,
        customer_email: form.email,
        customer_name: form.full_name,
        customer_phone: form.phone || null,
        company: form.company || null,
      }) as { free?: boolean; url?: string };

      if (result.free) {
        toast.success(t('registeredSuccessMsg'));
        setRegistered(true);
        setShowForm(false);
        const spots = await getEventSpots(event.id);
        if (spots) setEvent(ev => ev ? { ...ev, spots_remaining: spots.spots_remaining } : ev);
      } else if (result.url) {
        window.location.href = result.url;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('tryAgain');
      setRegError(msg);
      toast.error(msg);
    } finally {
      setRegistering(false);
    }
  };

  const price = event ? (event.price_usd > 0 ? `$${event.price_usd}` : t('free')) : '';
  const spotsLow = event ? (event.spots_remaining > 0 && event.spots_remaining <= 10) : false;
  const isUpcoming = event ? new Date(event.event_date) >= new Date() : false;

  return (
    <Layout>
      <div className="min-h-screen bg-background pt-20 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">

          <Link to="/tadbirlar" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> {t('backToEvents')}
          </Link>

          {loading && <Skeleton className="h-96 rounded-sm" />}

          {!loading && notFound && (
            <div className="glass-card border-ancient rounded-sm p-10 text-center card-ancient space-y-4">
              <AlertCircle className="w-12 h-12 text-muted-foreground/30 mx-auto" />
              <p className="text-muted-foreground">{t('eventNotFound')}</p>
              <Link to="/tadbirlar">
                <Button variant="ghost" className="border border-primary/40 text-primary rounded-sm">
                  {t('eventsLabel')}
                </Button>
              </Link>
            </div>
          )}

          {!loading && event && (
            <article className="space-y-6">
              {/* Cover image */}
              {event.image_url && (
                <div className="aspect-[21/9] rounded-sm overflow-hidden border border-border/40">
                  <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
                </div>
              )}

              <div className="glass-card border-ancient rounded-sm overflow-hidden card-ancient">
                {/* Header */}
                <div className="p-6 md:p-8 border-b border-border/40">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-sm">
                          {event.category}
                        </span>
                        {event.is_featured && (
                          <span className="vip-badge text-[9px]">Featured</span>
                        )}
                        {!isUpcoming && (
                          <span className="text-[10px] px-2 py-0.5 bg-muted/50 text-muted-foreground rounded-sm border border-border/40">
                            {t('eventEnded')}
                          </span>
                        )}
                      </div>
                      <h1 className="font-jiang-cheng text-foreground text-2xl md:text-3xl font-bold text-balance leading-tight">
                        {lf(event.title, event.title_ru, event.title_en, lang)}
                      </h1>
                    </div>
                    <div className={cn(
                      'text-xl font-bold font-jiang-cheng shrink-0',
                      event.price_usd > 0 ? 'text-primary' : 'text-green-400'
                    )}>
                      {price}
                    </div>
                  </div>
                </div>

                {/* Meta */}
                <div className="p-6 md:p-8 grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-border/40">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-primary/10 border border-primary/20 rounded-sm flex items-center justify-center shrink-0">
                      <Calendar className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{t('eventDate')}</div>
                      <div className="text-sm text-foreground font-medium">{event.event_date}</div>
                    </div>
                  </div>
                  {event.event_time && (
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-primary/10 border border-primary/20 rounded-sm flex items-center justify-center shrink-0">
                        <Clock className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{t('eventTime')}</div>
                        <div className="text-sm text-foreground font-medium">{event.event_time}</div>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-primary/10 border border-primary/20 rounded-sm flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{t('eventLocation')}</div>
                      <div className="text-sm text-foreground font-medium">{event.location}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-primary/10 border border-primary/20 rounded-sm flex items-center justify-center shrink-0">
                      <Users className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{t('eventSeats')}</div>
                      <div className={cn('text-sm font-medium', spotsLow ? 'text-yellow-400' : event.spots_remaining <= 0 ? 'text-destructive' : 'text-foreground')}>
                        {event.spots_remaining <= 0 ? t('noSpots') : spotsLow ? t('eventSpotsOnlyN', { n: event.spots_remaining }) : `${event.spots_remaining} ta`}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {lf(event.description, event.description_ru, event.description_en, lang) && (
                  <div className="p-6 md:p-8 border-b border-border/40">
                    <h2 className="font-jiang-cheng text-foreground font-bold text-sm mb-3 uppercase tracking-wider">{t('eventAbout')}</h2>
                    <p className="text-muted-foreground text-sm leading-relaxed text-pretty whitespace-pre-line">
                      {lf(event.description, event.description_ru, event.description_en, lang)}
                    </p>
                  </div>
                )}

                {/* CTA */}
                <div className="p-6 md:p-8">
                  {registered ? (
                    <div className="flex items-center gap-3 px-5 py-4 rounded-sm border border-green-400/30 bg-green-400/10">
                      <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
                      <div>
                        <p className="font-semibold text-green-400 text-sm">{t('eventRegisteredMsg')}</p>
                        <p className="text-muted-foreground text-xs mt-0.5">{t('eventReminderMsg')}</p>
                      </div>
                    </div>
                  ) : !isUpcoming ? (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground text-sm">{t('eventPastMsg')}</p>
                      <Link to="/tadbirlar" className="mt-3 inline-block">
                        <Button variant="ghost" className="border border-primary/30 text-primary hover:bg-primary/10 rounded-sm">
                          {t('upcomingEventsLink')}
                        </Button>
                      </Link>
                    </div>
                  ) : event.spots_remaining <= 0 ? (
                    <div className="flex items-center gap-3 px-5 py-4 rounded-sm border border-destructive/30 bg-destructive/10">
                      <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
                      <p className="text-destructive text-sm font-semibold">{t('noSpots')}</p>
                    </div>
                  ) : !showForm ? (
                    <Button
                      onClick={() => setShowForm(true)}
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm h-11 text-sm font-semibold gap-2"
                    >
                      {event.price_usd > 0
                        ? <><CreditCard className="w-4 h-4" /> {t('payWithRegisterBtn')}</>
                        : <><CheckCircle className="w-4 h-4" /> {t('registerEvent')}</>
                      }
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <h3 className="font-jiang-cheng text-foreground font-bold text-sm">{t('registerFormTitle')}</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {([
                          { label: t('fullNameRequired'), field: 'full_name' as const, ph: t('fullName'), type: 'text' },
                          { label: t('emailRequired'),    field: 'email' as const,     ph: 'email@example.com', type: 'email' },
                          { label: t('phone'),            field: 'phone' as const,     ph: '+998 90 ...', type: 'tel' },
                          { label: t('company'),          field: 'company' as const,   ph: t('companyOptionalPh'), type: 'text' },
                        ]).map(({ label, field, ph, type }) => (
                          <div key={field} className="space-y-1.5">
                            <Label className="text-xs font-normal text-muted-foreground">{label}</Label>
                            <Input
                              type={type}
                              value={form[field]}
                              onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
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

                      <div className="flex gap-3">
                        <Button variant="ghost" onClick={() => setShowForm(false)}
                          className="flex-1 border border-border/40 text-muted-foreground rounded-sm">
                          {t('cancel')}
                        </Button>
                        <Button onClick={handleRegister} disabled={registering}
                          className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm gap-2">
                          {registering
                            ? <><Loader2 className="w-4 h-4 animate-spin" /> {t('sending')}</>
                            : event.price_usd > 0
                              ? <><CreditCard className="w-4 h-4" /> {t('payAndRegister')}</>
                              : <><CheckCircle className="w-4 h-4" /> {t('registerEvent')}</>
                          }
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </article>
          )}
        </div>
      </div>
    </Layout>
  );
}
