import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ArrowRight, CheckCircle, CreditCard, Lock, User,
  AlertCircle, Loader2, Globe, MapPin, Briefcase
} from 'lucide-react';
import Layout from '@/components/layouts/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { getMembershipPlans, getMyMembership, stripeCheckout } from '@/api/client';
import type { Membership } from '@/types/types';
import { toApiError } from '@/api/http';
import { useAuth } from '@/contexts/AuthContext';
import { useLang } from '@/contexts/LangContext';
import { toast } from 'sonner';
import type { MembershipPlanRow } from '@/types/types';

type Step = 1 | 2 | 3;

const INDUSTRIES = [
  'Texnologiya', 'Qurilish', 'Savdo va Chakana', 'Moliya va Banking',
  'Sog\'liqni Saqlash', 'Ta\'lim', 'Qishloq Xo\'jaligi', 'Turizm va Mehmonxona',
  'Transport va Logistika', 'Ishlab Chiqarish', 'Ko\'chmas Mulk', 'Konsalting',
  'Media va Reklama', 'Energetika', 'Boshqa',
];

const US_STATES = ['Toshkent', 'Samarqand', 'Buxoro', 'Andijon', 'Namangan', 'Farg\'ona', 'Qashqadaryo', 'Surxondaryo', 'Xorazm', 'Navoiy', 'Jizzax', 'Sirdaryo', 'Qoraqalpog\'iston'];

interface BizForm {
  first_name: string; last_name: string; email: string;
  phone: string; mobile: string; company_name: string; website: string;
  dba_name: string; industry: string;
  state: string; city: string; street: string; zip: string;
}

export default function JoinPage() {
  const [searchParams] = useSearchParams();
  const { user, profile } = useAuth();
  const { t } = useLang();
  const [step, setStep] = useState<Step>(1);
  const [plans, setPlans] = useState<MembershipPlanRow[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(searchParams.get('plan') || 'business');
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [loadingMembership, setLoadingMembership] = useState(true);
  const [form, setForm] = useState<BizForm>({
    first_name: '', last_name: '', email: '', phone: '', mobile: '',
    company_name: '', website: '', dba_name: '', industry: '',
    state: '', city: '', street: '', zip: '',
  });

  useEffect(() => {
    getMembershipPlans()
      .then((data) => { setPlans(data); setLoadingPlans(false); })
      .catch(() => setLoadingPlans(false));
  }, []);

  useEffect(() => {
    if (!user) {
      setMembership(null);
      setLoadingMembership(false);
      return;
    }
    setLoadingMembership(true);
    getMyMembership()
      .then((m) => setMembership(m))
      .catch(() => setMembership(null))
      .finally(() => setLoadingMembership(false));
  }, [user]);

  useEffect(() => {
    if (profile) {
      const parts = (profile.full_name || '').split(' ');
      setForm(f => ({
        ...f,
        first_name: f.first_name || parts[0] || '',
        last_name: f.last_name || parts.slice(1).join(' ') || '',
        email: f.email || profile.email || '',
        phone: f.phone || profile.phone || '',
        mobile: f.mobile || profile.phone || '',
      }));
    }
  }, [profile]);

  const plan = plans.find(p => p.slug === selectedPlan) || plans[0];

  const goToStep2 = () => {
    if (!plan) { toast.error('Iltimos, reja tanlang'); return; }
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToStep3 = () => {
    if (!form.first_name.trim() || !form.last_name.trim() || !form.email.trim()) {
      toast.error('Ism, familiya va email majburiy'); return;
    }
    if (!/\S+@\S+\.\S+/.test(form.email)) { toast.error("To'g'ri email kiriting"); return; }
    setStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCheckout = async () => {
    if (!plan) return;
    setCheckingOut(true);
    setCheckoutError(null);
    try {
      const origin = window.location.origin;
      const { url } = await stripeCheckout({
        plan_slug: plan.slug,
        user_id: user?.id || null,
        customer_email: form.email,
        customer_name: `${form.first_name} ${form.last_name}`.trim(),
        success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/qoshilish`,
      });
      if (!url) throw new Error('Stripe sessiyasi yaratilmadi');
      window.location.href = url;
    } catch (err) {
      const msg = toApiError(err).message;
      setCheckoutError(msg);
      toast.error(msg);
      setCheckingOut(false);
    }
  };

  const inp = (field: keyof BizForm, value: string) => setForm(f => ({ ...f, [field]: value }));

  const planColors: Record<string, string> = {
    starter: 'border-blue-400/40 bg-blue-400/5',
    business: 'border-primary/60 bg-primary/5',
    corporate: 'border-purple-400/40 bg-purple-400/5',
    international: 'border-red-400/40 bg-red-400/5',
  };
  const planTextColors: Record<string, string> = {
    starter: 'text-blue-400', business: 'text-primary', corporate: 'text-purple-400', international: 'text-red-400',
  };

  const stepLabels = ["Reja Tanlash", "Biznes Ma'lumotlari", "Hisob-kitob"];

  const activeMembership = membership?.status === 'active';
  const expiresAt = membership?.expires_at ? new Date(membership.expires_at) : null;
  const daysUntilRenewal = expiresAt
    ? Math.max(0, Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <Layout>
      <div className="min-h-screen bg-navy-dark pt-20 pb-16">
        <div className="max-w-3xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-10 pt-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-primary/30 bg-primary/5 rounded-sm mb-4">
              <CheckCircle className="w-3.5 h-3.5 text-primary" />
              <span className="text-primary text-xs font-semibold tracking-wider">A'ZOLIKKA QO'SHILISH</span>
            </div>
            <h1 className="font-jiang-cheng text-foreground text-3xl font-bold mb-2 text-balance">UUEA A'zosi Bo'ling</h1>
            <p className="text-muted-foreground text-sm">Mintaqaning yetakchi biznes ekotizimiga qo'shiling</p>
          </div>

          {/* Active member — renewal card */}
          {loadingMembership ? (
            <div className="space-y-4 mb-8">
              <Skeleton className="h-48 bg-muted rounded-sm" />
            </div>
          ) : activeMembership && membership ? (
            <div className="space-y-6 mb-8">
              <div className="glass-card border-ancient rounded-sm overflow-hidden card-ancient border-primary/40">
                <div className="bg-primary/10 border-b border-ancient px-6 py-4 flex items-center justify-between">
                  <h2 className="font-jiang-cheng text-foreground font-bold text-sm flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" /> Siz allaqachon a'zosiz
                  </h2>
                  <span className="text-xs px-2 py-0.5 rounded-sm border text-green-400 bg-green-400/10 border-green-400/20">Faol</span>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={cn('font-jiang-cheng font-bold text-2xl', planTextColors[membership.plan_slug] || 'text-primary')}>
                        {membership.plan_slug.toUpperCase()}
                      </div>
                      <div className="text-muted-foreground text-sm mt-1">Yillik a'zolik rejasi</div>
                    </div>
                    <div className="text-right">
                      <div className="text-muted-foreground text-xs">Keyingi to'lov</div>
                      <div className="font-jiang-cheng text-primary text-xl font-bold">
                        {expiresAt ? expiresAt.toLocaleDateString('uz-UZ') : '—'}
                      </div>
                    </div>
                  </div>
                  {daysUntilRenewal != null && (
                    <div className="glass-card border border-primary/20 rounded-sm p-4 bg-primary/5">
                      <p className="text-sm text-muted-foreground">
                        Yangilash uchun <span className="text-primary font-bold">{daysUntilRenewal} kun</span> qoldi
                        {daysUntilRenewal <= 30 && ' — tez orada to\'lovni yangilang'}
                      </p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                    <div>
                      <span className="block text-[10px] uppercase tracking-wider mb-1">Boshlangan</span>
                      {membership.starts_at ? new Date(membership.starts_at).toLocaleDateString('uz-UZ') : '—'}
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase tracking-wider mb-1">Tugaydi</span>
                      {expiresAt ? expiresAt.toLocaleDateString('uz-UZ') : '—'}
                    </div>
                  </div>
                  <Button asChild className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm h-11">
                    <a href="/dashboard">Dashboardga o'tish</a>
                  </Button>
                </div>
              </div>
            </div>
          ) : null}

          {!activeMembership && (
          <>
          {/* Steps indicator */}
          <div className="flex items-center justify-center gap-0 mb-10">
            {stepLabels.map((label, i) => {
              const num = i + 1;
              const isDone = step > num;
              const isActive = step === num;
              return (
                <div key={num} className="flex items-center">
                  <div className="flex flex-col items-center gap-1">
                    <div className={cn(
                      'w-8 h-8 rounded-sm flex items-center justify-center text-xs font-bold border transition-all',
                      isDone ? 'bg-primary border-primary text-primary-foreground'
                      : isActive ? 'bg-primary/20 border-primary text-primary'
                      : 'bg-muted/20 border-border/40 text-muted-foreground'
                    )}>
                      {isDone ? <CheckCircle className="w-4 h-4" /> : num}
                    </div>
                    <span className={cn('text-[10px] font-semibold tracking-wide hidden sm:block', isActive ? 'text-primary' : 'text-muted-foreground/50')}>
                      {label}
                    </span>
                  </div>
                  {i < 2 && <div className={cn('w-12 sm:w-24 h-px mx-1 mb-4', step > num ? 'bg-primary' : 'bg-border/40')} />}
                </div>
              );
            })}
          </div>

          {/* ── STEP 1: Plan Selection ── */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="glass-card border-ancient rounded-sm p-0 card-ancient overflow-hidden">
                <div className="bg-primary/10 border-b border-ancient px-6 py-4">
                  <h2 className="font-jiang-cheng text-foreground font-bold text-sm">A'zolik Xulasasi</h2>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between text-sm font-semibold text-muted-foreground pb-2 border-b border-border/30">
                    <span>A'zolik</span><span>Miqdor</span><span>Narx</span>
                  </div>
                  {loadingPlans ? (
                    <div className="space-y-3">{[1,2,3,4].map(i => <Skeleton key={i} className="h-12 bg-muted rounded-sm" />)}</div>
                  ) : (
                    plans.map(p => (
                      <button key={p.slug} onClick={() => setSelectedPlan(p.slug)}
                        className={cn(
                          'w-full flex items-center justify-between px-4 py-3 rounded-sm border transition-all text-left',
                          selectedPlan === p.slug ? (planColors[p.slug] || 'border-primary/60 bg-primary/5') : 'border-border/40 hover:border-primary/30 hover:bg-primary/5'
                        )}>
                        <div className="flex items-center gap-3">
                          <div className={cn('w-4 h-4 rounded-sm border-2 flex items-center justify-center shrink-0',
                            selectedPlan === p.slug ? 'border-primary' : 'border-border/60'
                          )}>
                            {selectedPlan === p.slug && <div className="w-2 h-2 bg-primary rounded-sm" />}
                          </div>
                          <div>
                            <div className={cn('font-jiang-cheng font-bold text-sm', planTextColors[p.slug] || 'text-primary')}>{p.name}</div>
                            <div className="text-muted-foreground text-[11px]">Yillik to'lov</div>
                          </div>
                        </div>
                        <div className="text-muted-foreground text-sm">1</div>
                        <div className={cn('font-bold text-lg', planTextColors[p.slug] || 'text-primary')}>${p.price_usd.toLocaleString()}.00</div>
                      </button>
                    ))
                  )}
                  {plan && (
                    <div className="flex items-center justify-between pt-3 border-t border-border/60">
                      <span className="font-jiang-cheng text-foreground font-bold">JAMI</span>
                      <span className={cn('font-jiang-cheng font-bold text-2xl', planTextColors[plan.slug] || 'text-primary')}>${plan.price_usd.toLocaleString()}.00</span>
                    </div>
                  )}
                </div>
              </div>
              <Button onClick={goToStep2} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm h-12 text-base font-semibold hover-gold-glow">
                Keyingisi <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {/* ── STEP 2: Business Info ── */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="glass-card border-ancient rounded-sm p-0 card-ancient overflow-hidden">
                {/* Personal */}
                <div className="bg-primary/10 border-b border-ancient px-6 py-4">
                  <h2 className="font-jiang-cheng text-foreground font-bold text-sm flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" />Biznes Ma'lumotlari
                  </h2>
                </div>
                <div className="p-6 space-y-5">
                  {/* Name row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-normal text-muted-foreground">Ism *</Label>
                      <Input value={form.first_name} onChange={e => inp('first_name', e.target.value)} placeholder="Ism" className="bg-background/60 border-border/60 rounded-sm" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-normal text-muted-foreground">Familiya *</Label>
                      <Input value={form.last_name} onChange={e => inp('last_name', e.target.value)} placeholder="Familiya" className="bg-background/60 border-border/60 rounded-sm" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-normal text-muted-foreground">Billing Email *</Label>
                    <Input type="email" value={form.email} onChange={e => inp('email', e.target.value)} placeholder="email@company.uz" className="bg-background/60 border-border/60 rounded-sm" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-normal text-muted-foreground">Mobil</Label>
                      <Input value={form.mobile} onChange={e => inp('mobile', e.target.value)} placeholder="+998 90 ..." className="bg-background/60 border-border/60 rounded-sm" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-normal text-muted-foreground">Telefon *</Label>
                      <Input value={form.phone} onChange={e => inp('phone', e.target.value)} placeholder="+998 71 ..." className="bg-background/60 border-border/60 rounded-sm" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-normal text-muted-foreground flex items-center gap-1.5">
                      <Globe className="w-3 h-3" />Veb-sayt
                    </Label>
                    <Input value={form.website} onChange={e => inp('website', e.target.value)} placeholder="example.uz" className="bg-background/60 border-border/60 rounded-sm" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-normal text-muted-foreground flex items-center gap-1.5">
                        <Briefcase className="w-3 h-3" />DBA Nomi
                      </Label>
                      <Input value={form.dba_name} onChange={e => inp('dba_name', e.target.value)} placeholder="Savdo nomi" className="bg-background/60 border-border/60 rounded-sm" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-normal text-muted-foreground">Soha</Label>
                      <Select value={form.industry} onValueChange={v => inp('industry', v)}>
                        <SelectTrigger className="bg-background/60 border-border/60 rounded-sm">
                          <SelectValue placeholder="Soha tanlang" />
                        </SelectTrigger>
                        <SelectContent>
                          {INDUSTRIES.map(ind => <SelectItem key={ind} value={ind}>{ind}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Billing Address */}
                  <div className="pt-3 border-t border-border/40">
                    <h3 className="font-jiang-cheng text-foreground text-sm font-bold mb-4 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />Manzil
                    </h3>
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-normal text-muted-foreground">Viloyat</Label>
                        <Select value={form.state} onValueChange={v => inp('state', v)}>
                          <SelectTrigger className="bg-background/60 border-border/60 rounded-sm">
                            <SelectValue placeholder="Viloyat tanlang" />
                          </SelectTrigger>
                          <SelectContent>
                            {US_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-normal text-muted-foreground">Shahar *</Label>
                          <Input value={form.city} onChange={e => inp('city', e.target.value)} placeholder="Shahar" className="bg-background/60 border-border/60 rounded-sm" />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-normal text-muted-foreground">Zip/Pochta kodi</Label>
                          <Input value={form.zip} onChange={e => inp('zip', e.target.value)} placeholder="100000" className="bg-background/60 border-border/60 rounded-sm" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-normal text-muted-foreground">Ko'cha manzili *</Label>
                        <Input value={form.street} onChange={e => inp('street', e.target.value)} placeholder="Ko'cha, uy raqami" className="bg-background/60 border-border/60 rounded-sm" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={() => setStep(1)} variant="ghost" className="border border-border/40 text-muted-foreground rounded-sm flex-1">
                  Orqaga
                </Button>
                <Button onClick={goToStep3} className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm flex-1 h-12 text-base font-semibold hover-gold-glow">
                  To'lovga O'tish <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Payment ── */}
          {step === 3 && (
            <div className="space-y-6">
              {/* Order summary */}
              <div className="glass-card border-ancient rounded-sm p-0 card-ancient overflow-hidden">
                <div className="bg-primary/10 border-b border-ancient px-6 py-4">
                  <h2 className="font-jiang-cheng text-foreground font-bold text-sm flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-primary" />To'lov Ma'lumotlari
                  </h2>
                </div>
                <div className="p-6 space-y-4">
                  {plan && (
                    <div className="glass-card border-ancient rounded-sm p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-jiang-cheng text-foreground font-bold">{plan.name}</div>
                          <div className="text-muted-foreground text-xs">Yillik a'zolik · {form.company_name || `${form.first_name} ${form.last_name}`}</div>
                        </div>
                        <div className={cn('font-jiang-cheng font-bold text-2xl', planTextColors[plan.slug] || 'text-primary')}>
                          ${plan.price_usd.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3 p-3 bg-blue-400/5 border border-blue-400/20 rounded-sm">
                    <Lock className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                    <div className="text-xs text-blue-400/80 leading-relaxed">
                      Siz Stripe xavfsiz to'lov sahifasiga yo'naltirilasiz. Karta ma'lumotlaringiz bizning serverlarimizda saqlanmaydi.
                    </div>
                  </div>

                  {checkoutError && (
                    <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-sm">
                      <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                      <p className="text-destructive text-xs">{checkoutError}</p>
                    </div>
                  )}

                  <Button onClick={handleCheckout} disabled={checkingOut || !plan}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm h-12 text-base font-semibold hover-gold-glow">
                    {checkingOut
                      ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />{t('paying')}</span>
                      : <span className="flex items-center gap-2"><Lock className="w-4 h-4" />{t('payNow')}</span>
                    }
                  </Button>

                  <p className="text-center text-muted-foreground/50 text-xs flex items-center justify-center gap-1">
                    <Lock className="w-3 h-3" /> Stripe orqali xavfsiz to'lov
                  </p>
                </div>
              </div>

              <Button onClick={() => setStep(2)} variant="ghost" className="w-full border border-border/40 text-muted-foreground rounded-sm">
                Orqaga
              </Button>
            </div>
          )}
          </>
          )}
        </div>
      </div>
    </Layout>
  );
}
