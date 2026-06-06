import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Calendar, CreditCard,
  Settings, MessageSquare, LogOut, Menu, X, ChevronRight,
  Star, CheckCircle, AlertCircle, Clock, Plus, Upload,
  User, Bell, Globe, ExternalLink, Send,
  BadgeCheck, ShieldOff, Building, Phone, Mail, Download, ShieldCheck,
  Megaphone, Eye, MousePointer, BarChart2, CalendarClock, RefreshCw, XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import Logo from '@/components/common/Logo';
import {
  getMyMembership,
  cancelMyMembership,
  getMyEventRegistrations,
  getMyBusinessSubmissions,
  createBusinessSubmission,
  getMyOrders,
  getMySavedCards,
  getMembershipPlans,
  adminStats,
  adminList,
  adminListNews,
  adminCampaigns,
  adminCreateCampaign,
  adminCancelCampaign,
  type BusinessSubmissionRow,
  type EventRegistrationWithEvent,
  updateProfile,
  changePassword,
} from '@/api/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLang, type Lang } from '@/contexts/LangContext';
import { formatDateLocale } from '@/i18n/locale';
import { toast } from 'sonner';
import NotificationBell from '@/components/NotificationBell';
import type { Membership, MembershipPlanRow } from '@/types/types';

type Section = 'overview' | 'membership' | 'events' | 'catalog' | 'messages' | 'billing' | 'settings' | 'business' | 'cards' | 'campaigns';

interface Order { id: string; total_amount: number; status: string; created_at: string; items: unknown; customer_name: string | null; customer_email: string | null; stripe_payment_intent_id: string | null }
type BusinessSubmission = BusinessSubmissionRow;

const LANGS: { code: Lang; label: string }[] = [
  { code: 'uz', label: "O'Z" },
  { code: 'ru', label: 'RU' },
  { code: 'en', label: 'EN' },
];

const NAV_ITEMS = [
  { id: 'overview',   icon: LayoutDashboard, key: 'overview' as const,           superOnly: false, adminOnly: false },
  { id: 'membership', icon: Star,            key: 'membershipLabel' as const,    superOnly: false, adminOnly: false },
  { id: 'events',     icon: Calendar,        key: 'eventsLabel' as const,        superOnly: false, adminOnly: false },
  { id: 'catalog',    icon: Building,        key: 'catalogProfile' as const,     superOnly: false, adminOnly: false },
  { id: 'business',   icon: Building2,       key: 'businessSubmission' as const, superOnly: false, adminOnly: false },
  { id: 'billing',    icon: CreditCard,      key: 'billing' as const,            superOnly: false, adminOnly: false },
  { id: 'cards',      icon: BadgeCheck,      key: 'savedCards' as const,         superOnly: false, adminOnly: false },
  { id: 'campaigns',  icon: Megaphone,       key: 'campaigns' as const,          superOnly: true,  adminOnly: true  },
  { id: 'messages',   icon: MessageSquare,   key: 'messages' as const,           superOnly: false, adminOnly: false },
  { id: 'settings',   icon: Settings,        key: 'settings' as const,           superOnly: false, adminOnly: false },
] as const;

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading, signOut, refreshProfile, isAdmin, isSuperAdmin } = useAuth();
  const { lang, setLang, t } = useLang();
  const [section, setSection] = useState<Section>('overview');
  const [membership, setMembership] = useState<Membership | null>(null);
  const [memberLoading, setMemberLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [ordersCount, setOrdersCount] = useState(0);
  const [eventsRegCount, setEventsRegCount] = useState(0);
  const [adminSummary, setAdminSummary] = useState<{
    counts: { profiles: number; businesses: number; events: number } | null;
    pendingSubmissions: number;
    pendingNews: number;
    revenueTotal?: number;
  } | null>(null);
  const [plans, setPlans] = useState<MembershipPlanRow[]>([]);

  useEffect(() => {
    if (!authLoading && !user) navigate('/kirish', { replace: true });
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setMemberLoading(true);
      const [mem, orders, regs, planList] = await Promise.all([
        getMyMembership(),
        getMyOrders(),
        getMyEventRegistrations(),
        getMembershipPlans(),
      ]);
      setMembership(mem);
      setOrdersCount(orders?.length ?? 0);
      setEventsRegCount(regs?.length ?? 0);
      setPlans(planList);
      setMemberLoading(false);
    })();
  }, [user]);

  useEffect(() => {
    if (!user || !isAdmin) return;
    (async () => {
      try {
        const [stats, subs, news] = await Promise.all([
          adminStats(),
          adminList<Record<string, unknown>>('business_submissions', 200),
          adminListNews(),
        ]);
        const counts = (stats.counts || {}) as { profiles?: number; businesses?: number; events?: number };
        const revenueTotal = Number((stats as any).revenue_total) || 0;
        const pendingSubmissions = (subs || []).filter(s => String((s as any).status || '') === 'pending').length;
        const pendingNews = (news || []).filter(n => n.status === 'pending').length;
        setAdminSummary({
          counts: {
            profiles: counts.profiles || 0,
            businesses: counts.businesses || 0,
            events: counts.events || 0,
          },
          pendingSubmissions,
          pendingNews,
          revenueTotal: isSuperAdmin ? revenueTotal : undefined,
        });
      } catch {
        setAdminSummary(null);
      }
    })();
  }, [user, isAdmin, isSuperAdmin]);

  const handleCancelMembership = async () => {
    if (!user || !membership) return;
    setCancelling(true);
    try {
      await cancelMyMembership();
    } catch {
      setCancelling(false);
      toast.error(t('membershipCancelError'));
      return;
    }
    setCancelling(false);
    setMembership(prev => prev ? { ...prev, status: 'cancelled' } : null);
    setCancelOpen(false);
    toast.success(t('membershipCancelled'));
  };

  const goTo = (s: Section) => { setSection(s); setMobileOpen(false); };

  if (authLoading) return (
    <div className="flex items-center justify-center min-h-screen bg-navy-dark">
      <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );
  if (!user) return null;
  if (!profile) {
    return (
      <div className="min-h-screen bg-navy-dark flex items-center justify-center px-4">
        <div className="w-full max-w-md glass-card border-ancient rounded-sm p-6 space-y-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
            <div className="space-y-1">
              <p className="font-jiang-cheng text-foreground text-lg font-bold">{t('profileLoading')}</p>
              <p className="text-sm text-muted-foreground">
                {t('profileLoadingHint')}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="default"
              onClick={async () => {
                await refreshProfile();
                toast.success(t('rechecked'));
              }}
              className="flex-1"
            >
              {t('reload')}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/", { replace: true })}
              className="flex-1"
            >
              {t('backHome')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const displayName = profile.full_name || profile.username || 'A\'zo';
  const initials = displayName.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 bg-sidebar border-r border-sidebar-border">
        {/* Logo */}
        <Link to="/" className="p-5 border-b border-sidebar-border flex items-center gap-2 hover:bg-sidebar-accent transition-colors">
          <Logo linkTo="/" size="sm" className="h-7" />
          <span className="font-jiang-cheng text-sidebar-foreground text-sm font-bold">UUEA</span>
        </Link>

        {/* User card */}
        <div className="p-4 border-b border-sidebar-border/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-sm bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0 font-jiang-cheng text-primary font-bold text-sm">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sidebar-foreground text-sm font-medium truncate">{displayName}</p>
              {membership?.status === 'active' && (
                <span className="text-primary text-[10px] font-semibold tracking-wider flex items-center gap-0.5">
                  <BadgeCheck className="w-2.5 h-2.5" /> {membership.plan_slug?.toUpperCase()}
                </span>
              )}
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.filter(item =>
            !item.adminOnly || (item.superOnly ? isSuperAdmin : isAdmin)
          ).map(item => (
            <button key={item.id} onClick={() => goTo(item.id as Section)}
              className={cn('w-full flex items-center gap-3 px-4 py-2.5 text-sm rounded-sm transition-all text-left',
                section === item.id
                  ? 'bg-sidebar-accent text-primary'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}>
              <item.icon className="w-4 h-4 shrink-0" />
              {t(item.key)}
              {item.superOnly && (
                <span className="ml-1 text-[9px] px-1 py-0.5 bg-primary/20 text-primary rounded-sm font-semibold">SA</span>
              )}
              {section === item.id && <ChevronRight className="w-3 h-3 ml-auto" />}
            </button>
          ))}
        </nav>

        {/* Language + Logout */}
        <div className="p-3 border-t border-sidebar-border space-y-2">
          <div className="flex items-center gap-1 px-2">
            <Globe className="w-3.5 h-3.5 text-muted-foreground mr-1" />
            {LANGS.map(l => (
              <button key={l.code} onClick={() => setLang(l.code)}
                className={cn('text-xs px-1.5 py-0.5 rounded-sm transition-colors font-semibold',
                  lang === l.code ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                )}>
                {l.label}
              </button>
            ))}
          </div>
          <button onClick={async () => { await signOut(); navigate('/'); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm rounded-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-destructive transition-all">
            <LogOut className="w-4 h-4" />{t('logout')}
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-navy-dark/80 backdrop-blur-sm" />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-sidebar border-r border-sidebar-border flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
              <span className="font-jiang-cheng text-sidebar-foreground text-sm font-bold">Dashboard</span>
              <button onClick={() => setMobileOpen(false)} className="text-muted-foreground"><X className="w-4 h-4" /></button>
            </div>
            <div className="flex items-center gap-1 px-4 py-2 border-b border-sidebar-border/40">
              <Globe className="w-3.5 h-3.5 text-muted-foreground mr-1" />
              {LANGS.map(l => (
                <button key={l.code} onClick={() => setLang(l.code)}
                  className={cn('text-xs px-1.5 py-0.5 rounded-sm font-semibold',
                    lang === l.code ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                  )}>
                  {l.label}
                </button>
              ))}
            </div>
            <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
              {NAV_ITEMS.filter(item =>
                !item.adminOnly || (item.superOnly ? isSuperAdmin : isAdmin)
              ).map(item => (
                <button key={item.id} onClick={() => goTo(item.id as Section)}
                  className={cn('w-full flex items-center gap-3 px-4 py-2.5 text-sm rounded-sm transition-all text-left',
                    section === item.id ? 'bg-sidebar-accent text-primary' : 'text-sidebar-foreground hover:bg-sidebar-accent'
                  )}>
                  <item.icon className="w-4 h-4" />{t(item.key)}
                  {item.superOnly && (
                    <span className="ml-1 text-[9px] px-1 py-0.5 bg-primary/20 text-primary rounded-sm font-semibold">SA</span>
                  )}
                </button>
              ))}
            </nav>
            <div className="p-3 border-t border-sidebar-border">
              <button onClick={async () => { await signOut(); navigate('/'); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm rounded-sm text-sidebar-foreground hover:text-destructive transition-all">
                <LogOut className="w-4 h-4" />{t('logout')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 min-w-0 overflow-x-hidden flex flex-col">
        {/* Desktop topbar */}
        <div className="hidden lg:flex items-center gap-3 px-6 py-3 border-b border-border/50 bg-card/80 backdrop-blur-md sticky top-0 z-40 shrink-0">
          <span className="font-jiang-cheng text-foreground text-base font-semibold flex-1 min-w-0 truncate">
            {t(NAV_ITEMS.find(n => n.id === section)?.key || 'overview')}
          </span>
          <NotificationBell />
          <Link to="/" className="text-muted-foreground hover:text-foreground">
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>

        {/* Mobile topbar */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-border/50 bg-card shrink-0">
          <button onClick={() => setMobileOpen(true)} className="text-muted-foreground hover:text-foreground">
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-jiang-cheng text-foreground text-sm font-semibold flex-1 min-w-0 truncate">
            {t(NAV_ITEMS.find(n => n.id === section)?.key || 'overview')}
          </span>
          <NotificationBell />
          <Link to="/" className="text-muted-foreground hover:text-foreground">
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>

        <div className="flex-1 p-4 md:p-8 space-y-6">
          {section === 'overview' && (
            <OverviewSection
              displayName={displayName}
              membership={membership}
              memberLoading={memberLoading}
              ordersCount={ordersCount}
              eventsRegCount={eventsRegCount}
              onCancelClick={() => setCancelOpen(true)}
              onNavigate={goTo}
              adminSummary={adminSummary}
              plans={plans}
            />
          )}
          {section === 'membership' && (
            <MembershipSection
              membership={membership}
              loading={memberLoading}
              onCancelClick={() => setCancelOpen(true)}
              plans={plans}
            />
          )}
          {section === 'events'    && <EventsSection userId={user.id} />}
          {section === 'catalog'   && <CatalogSection userId={user.id} />}
          {section === 'business'  && <BusinessSection userId={user.id} />}
          {section === 'billing'   && <BillingSection userId={user.id} />}
          {section === 'cards'     && <SavedCardsSection userId={user.id} />}
          {section === 'campaigns' && isSuperAdmin && <CampaignsDashSection />}
          {section === 'messages'  && <MessagesSection />}
          {section === 'settings'  && <SettingsSection profile={profile} onSaved={refreshProfile} />}
        </div>
      </div>

      {/* Cancel membership confirm */}
      <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg bg-navy border-ancient rounded-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-jiang-cheng text-foreground">{t('cancelMembership')}</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">{t('cancelConfirm')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border border-border/40 text-muted-foreground rounded-sm bg-transparent">{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelMembership} disabled={cancelling}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-sm">
              {cancelling ? t('cancelling') : t('cancelMembership')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ── OVERVIEW ── */
function OverviewSection({ displayName, membership, memberLoading, ordersCount, eventsRegCount, onCancelClick, onNavigate, adminSummary, plans }: {
  displayName: string; membership: Membership | null; memberLoading: boolean;
  ordersCount: number; eventsRegCount: number;
  onCancelClick: () => void; onNavigate: (s: Section) => void;
  plans: MembershipPlanRow[];
  adminSummary: {
    counts: { profiles: number; businesses: number; events: number } | null;
    pendingSubmissions: number;
    pendingNews: number;
    revenueTotal?: number;
  } | null;
}) {
  const { t } = useLang();
  const { isAdmin } = useAuth();
  const planColors: Record<string, string> = {
    starter: 'text-blue-400', business: 'text-primary', corporate: 'text-purple-400', international: 'text-red-400'
  };
  const currentPlan = plans.find(p => p.slug === membership?.plan_slug);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-jiang-cheng text-foreground text-2xl font-bold">{t('welcome')}, {displayName.split(' ')[0]}!</h1>
        <p className="text-muted-foreground text-sm mt-1">UUEA a'zolar boshqaruv paneli</p>
      </div>

      {isAdmin && (
        <div className="glass-card border-ancient rounded-sm p-5 card-ancient">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <div>
                <div className="font-jiang-cheng text-foreground font-bold">Admin ko‘rinishi</div>
                <div className="text-xs text-muted-foreground">Tezkor statistikalar va pending ishlar</div>
              </div>
            </div>
            <Link to="/admin">
              <Button variant="ghost" size="sm" className="border border-primary/30 text-primary hover:bg-primary/10 rounded-sm text-xs">
                Admin panelga o‘tish
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            {[
              { label: "A'zolar", value: adminSummary?.counts?.profiles ?? '—' },
              { label: 'Bizneslar', value: adminSummary?.counts?.businesses ?? '—' },
              { label: 'Tadbirlar', value: adminSummary?.counts?.events ?? '—' },
              ...(adminSummary?.revenueTotal != null ? [{ label: 'Daromad (USD)', value: `$${adminSummary.revenueTotal.toLocaleString()}` }] : []),
            ].map((c) => (
              <div key={c.label} className="bg-navy/40 border border-border/40 rounded-sm p-3">
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{c.label}</div>
                <div className="font-jiang-cheng text-foreground font-bold text-xl">{c.value}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            <div className="bg-navy/40 border border-border/40 rounded-sm p-3 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Pending biznes takliflari</div>
              <div className="font-jiang-cheng text-primary font-bold text-lg">{adminSummary?.pendingSubmissions ?? '—'}</div>
            </div>
            <div className="bg-navy/40 border border-border/40 rounded-sm p-3 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Pending yangiliklar</div>
              <div className="font-jiang-cheng text-primary font-bold text-lg">{adminSummary?.pendingNews ?? '—'}</div>
            </div>
          </div>
        </div>
      )}
      {membership?.status === 'active' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "A'zolik", value: currentPlan?.name || membership.plan_slug?.toUpperCase() || '—', accent: true },
            { label: "Narx", value: currentPlan ? `$${currentPlan.price_usd}/yil` : '—', accent: false },
            { label: "To'lovlar", value: String(ordersCount), accent: false },
            {
              label: 'Qolgan kun',
              value: membership.expires_at
                ? `${Math.max(0, Math.ceil((new Date(membership.expires_at).getTime() - Date.now()) / 86400000))}`
                : '—',
              accent: false,
            },
          ].map((s) => (
            <div key={s.label} className="glass-card border-ancient rounded-sm p-4 card-ancient text-center">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{s.label}</div>
              <div className={cn('font-jiang-cheng text-xl font-bold', s.accent ? 'text-primary' : 'text-foreground')}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Membership card */}
        <div className="glass-card border-ancient rounded-sm p-5 card-ancient flex flex-col h-full">
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">{t('membershipLabel')}</span>
          </div>
          {memberLoading ? <Skeleton className="h-8 bg-muted rounded-sm" /> : (
            membership?.status === 'active' ? (
              <div className="space-y-2 flex-1">
                <div className={cn('font-jiang-cheng font-bold text-xl', planColors[membership.plan_slug] || 'text-primary')}>
                  {membership.plan_slug?.toUpperCase()}
                </div>
                <div className="text-xs text-muted-foreground">
                  Muddati: {membership.expires_at ? new Date(membership.expires_at).toLocaleDateString('uz-UZ') : '—'}
                </div>
                <Button onClick={onCancelClick} variant="ghost"
                  className="mt-auto w-full border border-destructive/30 text-destructive hover:bg-destructive/10 rounded-sm text-xs h-8">
                  <ShieldOff className="w-3.5 h-3.5 mr-1.5" />{t('cancelMembership')}
                </Button>
              </div>
            ) : isAdmin ? (
              <div className="flex-1 flex flex-col justify-center gap-2">
                <p className="text-muted-foreground text-sm">
                  Admin akkaunti uchun a'zolik talab qilinmaydi.
                </p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col gap-2">
                <p className="text-muted-foreground text-sm">{t('noMembership')}</p>
                <Link to="/qoshilish">
                  <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm text-sm">
                    {t('join')}
                  </Button>
                </Link>
              </div>
            )
          )}
        </div>

        {/* Quick actions */}
        <div className="glass-card border-ancient rounded-sm p-5 card-ancient flex flex-col h-full">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Tezkor Harakatlar</span>
          </div>
          <div className="space-y-2 flex-1">
            {[
              { label: t('eventsLabel'), s: 'events' as Section, icon: Calendar },
              { label: t('businessSubmission'), s: 'business' as Section, icon: Building2 },
              { label: t('billing'), s: 'billing' as Section, icon: CreditCard },
            ].map(item => (
              <button key={item.s} onClick={() => onNavigate(item.s)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-sm transition-all text-left">
                <item.icon className="w-4 h-4 shrink-0" />{item.label}
                <ChevronRight className="w-3 h-3 ml-auto" />
              </button>
            ))}
          </div>
        </div>

        {/* Profile completion */}
        <div className="glass-card border-ancient rounded-sm p-5 card-ancient flex flex-col h-full">
          <div className="flex items-center gap-2 mb-3">
            <User className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Profil</span>
          </div>
          <button onClick={() => onNavigate('settings')}
            className="flex-1 flex flex-col justify-center items-center gap-2 hover:bg-primary/5 rounded-sm transition-all p-2">
            <Settings className="w-8 h-8 text-primary/40" />
            <span className="text-sm text-muted-foreground">{t('settings')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── MEMBERSHIP ── */
function MembershipSection({ membership, loading, onCancelClick, plans }: {
  membership: Membership | null; loading: boolean; onCancelClick: () => void;
  plans: MembershipPlanRow[];
}) {
  const { t } = useLang();
  const { isAdmin } = useAuth();
  const plan = plans.find(p => p.slug === membership?.plan_slug);

  if (loading) return <Skeleton className="h-48 bg-muted rounded-sm" />;

  if (isAdmin && (!membership || membership.status !== 'active')) {
    return (
      <div className="glass-card border-ancient rounded-sm p-8 card-ancient text-center space-y-4">
        <Star className="w-12 h-12 text-primary/30 mx-auto" />
        <h3 className="font-jiang-cheng text-foreground font-bold text-lg">Admin</h3>
        <p className="text-muted-foreground text-sm">Admin akkaunti uchun a&apos;zolik talab qilinmaydi.</p>
      </div>
    );
  }

  if (!membership || membership.status !== 'active') return (
    <div className="glass-card border-ancient rounded-sm p-8 card-ancient text-center space-y-4">
      <Star className="w-12 h-12 text-primary/30 mx-auto" />
      <div>
        <h3 className="font-jiang-cheng text-foreground font-bold text-lg">{t('noMembership')}</h3>
        <p className="text-muted-foreground text-sm mt-1">UUEA a&apos;zosi bo&apos;lib, ko&apos;proq imkoniyatlarga ega bo&apos;ling</p>
      </div>
      {plans.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left mt-4 max-w-lg mx-auto">
          {plans.map(p => (
            <div key={p.slug} className="border border-border/50 rounded-sm p-4 space-y-2 bg-card/50">
              <div className="flex items-center justify-between">
                <span className="font-jiang-cheng text-foreground font-bold text-sm">{p.name}</span>
                <span className="text-primary font-bold text-sm">${p.price_usd}<span className="text-[10px] text-muted-foreground">/yil</span></span>
              </div>
              <ul className="space-y-1">
                {(p.features || []).slice(0, 3).map(f => (
                  <li key={f} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CheckCircle className="w-3 h-3 text-primary shrink-0" />{f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
      <Link to="/qoshilish">
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm">{t('join')}</Button>
      </Link>
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className="font-jiang-cheng text-foreground text-xl font-bold">{t('membershipLabel')}</h2>

      {/* Active plan card */}
      <div className="glass-card border-ancient rounded-sm p-6 card-ancient space-y-5">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <div className="font-jiang-cheng text-primary text-2xl font-bold">{plan?.name || membership.plan_slug?.toUpperCase()}</div>
            <div className="text-muted-foreground text-sm mt-0.5">
              {plan ? `$${plan.price_usd} / yil` : "A'zolik rejasi"}
            </div>
          </div>
          <span className="text-xs px-3 py-1 rounded-sm border text-green-400 bg-green-400/10 border-green-400/20 self-start">
            {t('active')}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground text-xs mb-1">Boshlangan</div>
            <div className="text-foreground">{membership.starts_at ? new Date(membership.starts_at).toLocaleDateString('uz-UZ') : '—'}</div>
          </div>
          <div>
            <div className="text-muted-foreground text-xs mb-1">Tugaydi</div>
            <div className="text-foreground">{membership.expires_at ? new Date(membership.expires_at).toLocaleDateString('uz-UZ') : '—'}</div>
          </div>
        </div>

        {/* Plan features from API */}
        {plan && plan.features.length > 0 && (
          <div className="border-t border-border/40 pt-4">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Reja imtiyozlari</div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {plan.features.map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-3.5 h-3.5 text-primary shrink-0" />{f}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="pt-2 border-t border-border/40 flex items-center gap-3 flex-wrap">
          <Button onClick={onCancelClick} variant="ghost"
            className="border border-destructive/30 text-destructive hover:bg-destructive/10 rounded-sm text-sm">
            <ShieldOff className="w-4 h-4 mr-2" />{t('cancelMembership')}
          </Button>
          <Link to="/qoshilish">
            <Button variant="ghost" className="border border-primary/30 text-primary hover:bg-primary/10 rounded-sm text-sm">
              Rejani Yangilash
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ── EVENTS ── */
function EventsSection({ userId }: { userId: string }) {
  const [registrations, setRegistrations] = useState<EventRegistrationWithEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLang();

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await getMyEventRegistrations();
        setRegistrations(Array.isArray(data) ? data : []);
      } catch {
        setRegistrations([]);
      }
      setLoading(false);
    })();
  }, [userId]);

  const statusIcon = (s: string) => {
    if (s === 'confirmed') return <CheckCircle className="w-4 h-4 text-green-400" />;
    if (s === 'pending') return <Clock className="w-4 h-4 text-yellow-400" />;
    return <AlertCircle className="w-4 h-4 text-destructive" />;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-jiang-cheng text-foreground text-xl font-bold">{t('eventsLabel')}</h2>
        <Link to="/tadbirlar">
          <Button variant="ghost" size="sm" className="border border-primary/30 text-primary hover:bg-primary/10 rounded-sm text-xs">
            <Plus className="w-3.5 h-3.5 mr-1" />Yangi tadbir
          </Button>
        </Link>
      </div>
      {loading ? <Skeleton className="h-40 bg-muted rounded-sm" /> : (registrations ?? []).length === 0 ? (
        <div className="glass-card border-ancient rounded-sm p-10 text-center card-ancient space-y-3">
          <Calendar className="w-10 h-10 text-primary/30 mx-auto" />
          <p className="text-muted-foreground text-sm">Hali hech qanday tadbir yo'q</p>
          <Link to="/tadbirlar"><Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm text-sm">Tadbirlarga o'tish</Button></Link>
        </div>
      ) : (
        <div className="space-y-3">
          {registrations.map(r => (
            <div key={r.id} className="glass-card border-ancient rounded-sm p-4 card-ancient flex items-start justify-between gap-3">
              <div className="space-y-1 min-w-0 flex-1">
                <div className="font-jiang-cheng text-foreground font-bold text-sm">{(r as { event?: { title?: string } }).event?.title || 'Tadbir'}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
                  <span>{(r as { event?: { event_date?: string } }).event?.event_date}</span>
                  <span>·</span>
                  <span>{(r as { event?: { location?: string } }).event?.location}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {statusIcon(r.status)}
                  <span>{r.status}</span>
                  {r.payment_status === 'paid' && <span className="text-primary font-semibold">· To'langan</span>}
                  {r.payment_status === 'free' && <span className="text-green-400 font-semibold">· {t('free')}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── BUSINESS SUBMISSION ── */
function BusinessSection({ userId }: { userId: string }) {
  const [submissions, setSubmissions] = useState<BusinessSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { t } = useLang();
  const [form, setForm] = useState({
    name: '', category: '', description: '', website: '',
    phone: '', email: '', address: '', industry: '', dba_name: '',
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMyBusinessSubmissions();
      setSubmissions(Array.isArray(data) ? data : []);
    } catch {
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.category.trim()) { toast.error('Kompaniya nomi va kategoriya majburiy'); return; }
    setSubmitting(true);
    try {
      await createBusinessSubmission({ ...form });
    } catch (e) {
      setSubmitting(false);
      toast.error('Yuborishda xatolik: ' + (e instanceof Error ? e.message : 'xatolik'));
      return;
    }
    setSubmitting(false);
    toast.success('Biznes taklifi yuborildi! Admin tekshirgandan so\'ng katalogga qo\'shiladi.');
    setShowForm(false);
    setForm({ name: '', category: '', description: '', website: '', phone: '', email: '', address: '', industry: '', dba_name: '' });
    load();
  };

  const statusBadge = (s: string) => {
    const cls = s === 'approved' ? 'text-green-400 bg-green-400/10 border-green-400/20'
      : s === 'rejected' ? 'text-destructive bg-destructive/10 border-destructive/20'
      : 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
    const icon = s === 'approved' ? <CheckCircle className="w-3 h-3" />
      : s === 'rejected' ? <AlertCircle className="w-3 h-3" />
      : <Clock className="w-3 h-3" />;
    return <span className={cn('flex items-center gap-1 text-xs px-2 py-0.5 rounded-sm border', cls)}>{icon}{t(s as Parameters<typeof t>[0])}</span>;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-jiang-cheng text-foreground text-xl font-bold">{t('businessSubmission')}</h2>
        <Button onClick={() => setShowForm(v => !v)} className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm text-sm">
          <Plus className="w-4 h-4 mr-1.5" />Qo'shish
        </Button>
      </div>

      {showForm && (
        <div className="glass-card border-ancient rounded-sm p-6 card-ancient space-y-4">
          <h3 className="font-jiang-cheng text-foreground font-bold text-sm flex items-center gap-2">
            <Building className="w-4 h-4 text-primary" />Biznes Ma'lumotlari
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {([
              { label: `${t('company')} *`, field: 'name', ph: 'Kompaniya nomi', icon: Building2 },
              { label: t('category') + ' *', field: 'category', ph: 'IT, Qurilish, Savdo...', icon: Star },
              { label: t('industry'), field: 'industry', ph: 'Texnologiya, Moliya...', icon: Globe },
              { label: 'DBA Nomi', field: 'dba_name', ph: 'Savdo nomi (ixtiyoriy)', icon: Building },
              { label: t('website'), field: 'website', ph: 'example.uz', icon: ExternalLink },
              { label: t('phone'), field: 'phone', ph: '+998 71 ...', icon: Phone },
              { label: t('email'), field: 'email', ph: 'info@company.uz', icon: Mail },
              { label: t('address'), field: 'address', ph: "Toshkent, O'zbekiston", icon: Building2 },
            ] as { label: string; field: keyof typeof form; ph: string; icon: React.ElementType }[]).map(({ label, field, ph }) => (
              <div key={field} className="space-y-1.5">
                <Label className="text-xs font-normal text-muted-foreground">{label}</Label>
                <Input value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                  placeholder={ph} className="bg-background/60 border-border/60 rounded-sm text-sm" />
              </div>
            ))}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-normal text-muted-foreground">{t('description')}</Label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Kompaniyangiz haqida qisqa tavsif..."
              rows={3}
              className="w-full px-3 py-2 bg-background/60 border border-border/60 rounded-sm text-sm text-foreground placeholder-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary/50"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowForm(false)} className="border border-border/40 text-muted-foreground rounded-sm flex-1">
              {t('cancel')}
            </Button>
            <Button onClick={handleSubmit} disabled={submitting} className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm flex-1">
              {submitting ? <span className="flex items-center gap-2"><Upload className="w-3.5 h-3.5 animate-spin" />{t('submitting')}</span>
                : <span className="flex items-center gap-2"><Send className="w-3.5 h-3.5" />{t('submit')}</span>}
            </Button>
          </div>
        </div>
      )}

      {loading ? <Skeleton className="h-40 bg-muted rounded-sm" /> : (submissions ?? []).length === 0 ? (
        <div className="glass-card border-ancient rounded-sm p-10 text-center card-ancient space-y-3">
          <Building2 className="w-10 h-10 text-primary/30 mx-auto" />
          <p className="text-muted-foreground text-sm">Hali hech qanday taklif yo'q</p>
        </div>
      ) : (
        <div className="space-y-3">
          {(submissions ?? []).map(s => (
            <div key={s.id} className="glass-card border-ancient rounded-sm p-4 card-ancient flex items-start justify-between gap-3">
              <div className="space-y-1 min-w-0 flex-1">
                <div className="font-jiang-cheng text-foreground font-bold text-sm">{s.name}</div>
                <div className="text-xs text-muted-foreground">{s.category}</div>
                {s.admin_note && <div className="text-xs text-muted-foreground italic">"{s.admin_note}"</div>}
                <div className="text-[11px] text-muted-foreground/60">{new Date(s.created_at).toLocaleDateString('uz-UZ')}</div>
              </div>
              <div className="shrink-0">{statusBadge(s.status)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── CATALOG PROFILE ── */
function CatalogSection({ userId }: { userId: string }) {
  const [submissions, setSubmissions] = useState<BusinessSubmissionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLang();

  useEffect(() => {
    getMyBusinessSubmissions()
      .then(d => setSubmissions(Array.isArray(d) ? d : []))
      .catch(() => setSubmissions([]))
      .finally(() => setLoading(false));
  }, [userId]);

  const approved = submissions.filter(s => s.status === 'approved');
  const pending  = submissions.filter(s => s.status === 'pending');

  const statusColor = (s: string) =>
    s === 'approved' ? 'text-green-400 bg-green-400/10 border-green-400/20'
    : s === 'rejected' ? 'text-destructive bg-destructive/10 border-destructive/20'
    : 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-jiang-cheng text-foreground text-xl font-bold">{t('catalogProfile')}</h2>
        <Link to="/katalog">
          <Button variant="ghost" size="sm" className="border border-primary/30 text-primary hover:bg-primary/10 rounded-sm text-xs">
            Katalogni Ko&apos;rish
          </Button>
        </Link>
      </div>

      {/* Summary */}
      {!loading && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Jami", value: submissions.length },
            { label: "Tasdiqlangan", value: approved.length },
            { label: "Kutilmoqda", value: pending.length },
          ].map(s => (
            <div key={s.label} className="glass-card border-ancient rounded-sm p-4 card-ancient text-center">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{s.label}</div>
              <div className="font-jiang-cheng text-xl font-bold text-foreground">{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {loading ? <Skeleton className="h-40 bg-muted rounded-sm" /> : submissions.length === 0 ? (
        <div className="glass-card border-ancient rounded-sm p-10 text-center card-ancient space-y-3">
          <Building className="w-10 h-10 text-primary/30 mx-auto" />
          <p className="text-muted-foreground text-sm">Katalogga hali biznes qo&apos;shilmagan</p>
          <p className="text-xs text-muted-foreground/60">
            &quot;Biznes Qo&apos;shish&quot; bo&apos;limidan taklif yuboring — admin tasdiqlangach katalogda ko&apos;rinadi
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {submissions.map(s => (
            <div key={s.id} className="glass-card border-ancient rounded-sm p-4 card-ancient">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-jiang-cheng text-foreground font-bold text-sm">{s.name}</span>
                    <span className={cn('text-[10px] px-2 py-0.5 rounded-sm border', statusColor(s.status))}>
                      {s.status === 'approved' ? 'Tasdiqlangan' : s.status === 'rejected' ? 'Rad etilgan' : 'Kutilmoqda'}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">{s.category}</div>
                  {s.admin_note && (
                    <div className="text-xs text-muted-foreground italic border-l-2 border-primary/30 pl-2 mt-1">
                      Admin: &quot;{s.admin_note}&quot;
                    </div>
                  )}
                </div>
                {s.status === 'approved' && (
                  <Link to={`/katalog/${s.id}`}>
                    <Button variant="ghost" size="sm" className="border border-primary/25 text-primary hover:bg-primary/10 rounded-sm text-xs h-7 shrink-0">
                      Ko&apos;rish
                    </Button>
                  </Link>
                )}
              </div>
              <div className="text-[11px] text-muted-foreground/50 mt-2">
                {new Date(s.created_at).toLocaleDateString('uz-UZ')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── SAVED CARDS ── */
function SavedCardsSection({ userId }: { userId: string }) {
  const [cards, setCards] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMySavedCards()
      .then(d => setCards(Array.isArray(d) ? d : []))
      .catch(() => setCards([]))
      .finally(() => setLoading(false));
  }, [userId]);

  return (
    <div className="space-y-4">
      <h2 className="font-jiang-cheng text-foreground text-xl font-bold">Saqlangan Kartalar</h2>

      {loading ? <Skeleton className="h-40 bg-muted rounded-sm" /> : cards.length === 0 ? (
        <div className="glass-card border-ancient rounded-sm p-10 text-center card-ancient space-y-3">
          <CreditCard className="w-10 h-10 text-primary/30 mx-auto" />
          <p className="text-muted-foreground text-sm">Saqlangan karta yo&apos;q</p>
          <p className="text-xs text-muted-foreground/60">
            To&apos;lov jarayonida kartani saqlash imkoniyati mavjud
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {cards.map((card, i) => {
            const brand    = String(card.brand || 'card').toUpperCase();
            const last4    = String(card.last4 || '••••');
            const expMonth = String(card.exp_month || '').padStart(2, '0');
            const expYear  = String(card.exp_year || '').slice(-2);
            const isDef    = Boolean(card.is_default);
            return (
              <div key={String(card.id || i)} className="glass-card border-ancient rounded-sm p-4 card-ancient flex items-center gap-4">
                <div className="w-12 h-8 bg-primary/10 border border-primary/20 rounded flex items-center justify-center shrink-0">
                  <CreditCard className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-jiang-cheng text-foreground font-bold text-sm">{brand} •••• {last4}</span>
                    {isDef && (
                      <span className="text-[10px] px-2 py-0.5 rounded-sm border text-primary bg-primary/10 border-primary/20">
                        Asosiy
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">Muddati: {expMonth}/{expYear}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Campaign types ──────────────────────────────────────────────────────────
type Campaign = {
  id: string; subject: string; body: string;
  scheduled_at: string; status: 'scheduled' | 'sending' | 'sent' | 'failed' | 'cancelled';
  target_source: string; sent_count: number; fail_count: number; created_at: string;
  open_count?: number; click_count?: number;
};

const CAMP_STATUS_COLORS: Record<string, string> = {
  scheduled: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
  sending:   'bg-amber-500/10 border-amber-500/30 text-amber-400',
  sent:      'bg-primary/10 border-primary/30 text-primary',
  failed:    'bg-destructive/10 border-destructive/30 text-destructive',
  cancelled: 'bg-muted/30 border-border/30 text-muted-foreground',
};
const CAMP_STATUS_LABELS: Record<string, string> = {
  scheduled: 'Rejalashtirilgan', sending: 'Yuborilmoqda',
  sent: 'Yuborildi', failed: 'Xatolik', cancelled: 'Bekor qilindi',
};

/* ── CAMPAIGNS (admin only) ── */
function CampaignsDashSection() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [cancelId, setCancelId]   = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [selected, setSelected]   = useState<Campaign | null>(null);
  const [subject, setSubject]     = useState('');
  const [body, setBody]           = useState('');
  const [schedDate, setSchedDate] = useState('');
  const [schedTime, setSchedTime] = useState('');
  const [targetSrc, setTargetSrc] = useState('all');
  const [saving, setSaving]       = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminCampaigns();
      setCampaigns(data as Campaign[]);
    } catch {
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const id = window.setInterval(load, 30000);
    return () => window.clearInterval(id);
  }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !body.trim() || !schedDate || !schedTime) {
      toast.error("Barcha maydonlar to'ldirilishi shart"); return;
    }
    setSaving(true);
    try {
      await adminCreateCampaign({
        subject: subject.trim(), body: body.trim(),
        scheduled_at: new Date(`${schedDate}T${schedTime}`).toISOString(),
        target_source: targetSrc,
      });
      toast.success('Kampaniya rejalashtirildi');
      setShowForm(false);
      setSubject(''); setBody(''); setSchedDate(''); setSchedTime(''); setTargetSrc('all');
      load();
    } catch {
      toast.error('Xatolik yuz berdi');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelId) return;
    setCancelling(true);
    await adminCancelCampaign(cancelId);
    setCancelling(false);
    setCancelId(null);
    toast.success('Kampaniya bekor qilindi');
    load();
  };

  const totalSent   = campaigns.reduce((s, c) => s + (c.sent_count  || 0), 0);
  const totalOpens  = campaigns.reduce((s, c) => s + (c.open_count  || 0), 0);
  const totalClicks = campaigns.reduce((s, c) => s + (c.click_count || 0), 0);
  const openRate    = totalSent > 0 ? Math.round((totalOpens / totalSent) * 100) : 0;

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Yuborilgan',  value: totalSent,    icon: <Send className="w-4 h-4" /> },
          { label: 'Ochilgan',    value: totalOpens,   icon: <Eye className="w-4 h-4" /> },
          { label: 'Bosilgan',    value: totalClicks,  icon: <MousePointer className="w-4 h-4" /> },
          { label: 'Open Rate',   value: `${openRate}%`, icon: <BarChart2 className="w-4 h-4" /> },
        ].map(s => (
          <div key={s.label} className="glass-card border-ancient rounded-sm p-4 card-ancient">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</span>
              <span className="text-primary">{s.icon}</span>
            </div>
            <div className="font-jiang-cheng text-2xl font-bold text-foreground">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-jiang-cheng text-foreground text-xl font-bold flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-primary" />
          Email Kampaniyalar
          <span className="text-xs px-2 py-0.5 bg-primary/15 text-primary border border-primary/20 rounded-sm">
            {campaigns.length}
          </span>
        </h2>
        <div className="flex items-center gap-2">
          <Button onClick={load} variant="ghost" size="sm"
            className="border border-border/40 text-muted-foreground rounded-sm w-8 h-8 p-0">
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
          <Button onClick={() => setShowForm(v => !v)}
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm text-sm gap-1.5 h-8 px-3">
            <CalendarClock className="w-3.5 h-3.5" />
            Yangi Kampaniya
          </Button>
        </div>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="glass-card border-ancient rounded-sm p-5 card-ancient space-y-4">
          <h3 className="font-jiang-cheng text-foreground font-bold text-sm flex items-center gap-2">
            <CalendarClock className="w-4 h-4 text-primary" />
            Kampaniya Rejalashtirish
          </h3>
          <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Email mavzusi *</Label>
              <Input value={subject} onChange={e => setSubject(e.target.value)}
                placeholder="masalan: Iyun oyidagi yangiliklar..." required
                className="bg-background/60 border-border/60 rounded-sm text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Yuborish sanasi *</Label>
                <Input type="date" value={schedDate} onChange={e => setSchedDate(e.target.value)} required
                  className="bg-background/60 border-border/60 rounded-sm text-sm" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Yuborish vaqti *</Label>
                <Input type="time" value={schedTime} onChange={e => setSchedTime(e.target.value)} required
                  className="bg-background/60 border-border/60 rounded-sm text-sm" />
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Maqsadli guruh</Label>
              <select value={targetSrc} onChange={e => setTargetSrc(e.target.value)}
                className="w-full h-9 text-sm bg-background/60 border border-border/60 rounded-sm px-3 text-foreground">
                <option value="all">Barcha faol obunalar</option>
                <option value="hero_form">Faqat Hero Forma</option>
                <option value="import">Faqat Import</option>
                <option value="manual">Faqat Qo&apos;lda kiritilgan</option>
              </select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Email matni *</Label>
              <textarea value={body} onChange={e => setBody(e.target.value)} rows={5} required
                placeholder="Email mazmunini yozing..."
                className="w-full text-sm bg-background/60 border border-border/60 rounded-sm px-3 py-2 text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:ring-1 focus:ring-primary/40" />
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}
                className="border border-border/40 text-muted-foreground rounded-sm text-sm">Bekor</Button>
              <Button type="submit" disabled={saving}
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm text-sm gap-2">
                {saving
                  ? <><div className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />Saqlanmoqda...</>
                  : <><CalendarClock className="w-3.5 h-3.5" />Rejalashtirish</>
                }
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Campaigns list */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-sm" />)}
        </div>
      ) : campaigns.length === 0 ? (
        <div className="glass-card border-ancient rounded-sm p-10 text-center card-ancient space-y-3">
          <Megaphone className="w-10 h-10 text-primary/30 mx-auto" />
          <p className="text-muted-foreground text-sm">Hali kampaniya yo&apos;q</p>
        </div>
      ) : (
        <div className="space-y-2">
          {campaigns.map(c => {
            const openPct  = c.sent_count > 0 ? Math.round(((c.open_count  || 0) / c.sent_count) * 100) : 0;
            const clickPct = c.sent_count > 0 ? Math.round(((c.click_count || 0) / c.sent_count) * 100) : 0;
            return (
              <div key={c.id}
                onClick={() => setSelected(c)}
                className="glass-card border-ancient rounded-sm p-4 card-ancient cursor-pointer hover:border-primary/30 transition-all group">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-jiang-cheng text-foreground font-bold text-sm truncate">{c.subject}</span>
                      <span className={cn('text-[10px] px-2 py-0.5 rounded-sm border shrink-0', CAMP_STATUS_COLORS[c.status])}>
                        {CAMP_STATUS_LABELS[c.status]}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <CalendarClock className="w-3 h-3 text-primary" />
                        {new Date(c.scheduled_at).toLocaleString('uz-UZ', { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                      <span>{c.target_source === 'all' ? 'Barchasi' : c.target_source}</span>
                      {c.sent_count > 0 && (
                        <>
                          <span className="flex items-center gap-1"><Send className="w-3 h-3" />{c.sent_count}</span>
                          <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{c.open_count || 0} ({openPct}%)</span>
                          <span className="flex items-center gap-1"><MousePointer className="w-3 h-3" />{c.click_count || 0} ({clickPct}%)</span>
                        </>
                      )}
                    </div>
                  </div>
                  {c.status === 'scheduled' && (
                    <Button variant="ghost" size="sm"
                      onClick={e => { e.stopPropagation(); setCancelId(c.id); }}
                      className="shrink-0 h-7 px-2 text-[11px] opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-sm gap-1">
                      <XCircle className="w-3.5 h-3.5" />Bekor
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-dark/80 backdrop-blur-sm"
          onClick={() => setSelected(null)}>
          <div className="relative bg-card border border-primary/20 rounded-sm p-6 max-w-lg w-full space-y-4 shadow-2xl"
            onClick={e => e.stopPropagation()}>
            <div className="h-[3px] absolute top-0 left-0 right-0 bg-gradient-to-r from-transparent via-primary to-transparent rounded-t-sm" />
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Kampaniya tafsilotlari</div>
                <h3 className="font-jiang-cheng text-lg font-bold text-foreground text-balance">{selected.subject}</h3>
              </div>
              <span className={cn('shrink-0 text-[10px] px-2 py-1 rounded-sm border', CAMP_STATUS_COLORS[selected.status])}>
                {CAMP_STATUS_LABELS[selected.status]}
              </span>
            </div>
            <div className="h-px bg-primary/15" />
            <div className="grid grid-cols-3 gap-3">
              {[
                { l: 'Yuborilgan', v: selected.sent_count,       icon: <Send className="w-3.5 h-3.5" /> },
                { l: 'Ochilgan',   v: selected.open_count  || 0, icon: <Eye className="w-3.5 h-3.5" /> },
                { l: 'Bosilgan',   v: selected.click_count || 0, icon: <MousePointer className="w-3.5 h-3.5" /> },
              ].map(s => (
                <div key={s.l} className="bg-background/30 border border-border/30 rounded-sm p-3 text-center space-y-1">
                  <div className="flex justify-center text-primary">{s.icon}</div>
                  <div className="font-bold text-lg text-foreground">{s.v}</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.l}</div>
                  {selected.sent_count > 0 && s.l !== 'Yuborilgan' && (
                    <div className="text-[10px] text-primary/70">
                      {Math.round((s.v / selected.sent_count) * 100)}%
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="bg-background/20 border border-border/20 rounded-sm p-3">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Email matni</div>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line line-clamp-6">{selected.body}</p>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Reja: <span className="text-foreground">{new Date(selected.scheduled_at).toLocaleString('uz-UZ')}</span></span>
              <span>Guruh: <span className="text-foreground">{selected.target_source === 'all' ? 'Barchasi' : selected.target_source}</span></span>
            </div>
            <Button onClick={() => setSelected(null)} variant="ghost"
              className="w-full border border-primary/25 text-muted-foreground hover:bg-primary/10 rounded-sm text-sm">
              Yopish
            </Button>
          </div>
        </div>
      )}

      {/* Cancel confirm */}
      <AlertDialog open={!!cancelId} onOpenChange={o => !o && setCancelId(null)}>
        <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg bg-navy border-ancient rounded-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-jiang-cheng text-foreground">Kampaniyani Bekor Qilish</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Bu kampaniya boshqa yuborilmaydi. Tasdiqlaysizmi?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border border-border/40 text-muted-foreground rounded-sm bg-transparent">Yo&apos;q</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel} disabled={cancelling}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-sm">
              {cancelling ? 'Bekor qilinmoqda...' : 'Bekor Qilish'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ── MESSAGES ── */
function MessagesSection() {
  const { t } = useLang();
  return (
    <div className="glass-card border-ancient rounded-sm p-10 text-center card-ancient space-y-3">
      <MessageSquare className="w-12 h-12 text-primary/30 mx-auto" />
      <h3 className="font-jiang-cheng text-foreground font-bold">{t('messages')}</h3>
      <p className="text-muted-foreground text-sm">{t('messagesSoon')}</p>
    </div>
  );
}

/* ── BILLING ── */
function BillingSection({ userId }: { userId: string }) {
  const { t, lang } = useLang();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await getMyOrders();
        setOrders(Array.isArray(data) ? data : []);
      } catch {
        setOrders([]);
      }
      setLoading(false);
    })();
  }, [userId]);

  const downloadReceipt = async (order: Order) => {
    setDownloading(order.id);
    try {
      const { downloadPaymentReceipt } = await import('@/lib/receiptPdf');
      await downloadPaymentReceipt({
        id: order.id,
        total_amount: order.total_amount,
        status: order.status,
        created_at: order.created_at,
        items: order.items,
        customer_name: order.customer_name,
        customer_email: order.customer_email,
        stripe_payment_intent_id: order.stripe_payment_intent_id,
      }, lang);
      toast.success(t('receiptDownloaded'));
    } catch {
      toast.error(t('receiptError'));
    } finally {
      setDownloading(null);
    }
  };

  if (loading) return <Skeleton className="h-40 bg-muted rounded-sm" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-jiang-cheng text-foreground text-xl font-bold">{t('billing')}</h2>
        <span className="text-xs text-muted-foreground">{(orders ?? []).length} {t('paymentsCount')}</span>
      </div>
      {(orders ?? []).length === 0 ? (
        <div className="glass-card border-ancient rounded-sm p-10 text-center card-ancient space-y-3">
          <CreditCard className="w-10 h-10 text-primary/30 mx-auto" />
          <p className="text-muted-foreground text-sm">{t('noPayments')}</p>
        </div>
      ) : (
        <div className="glass-card border-ancient rounded-sm overflow-hidden card-ancient">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  {[t('colDescription'), t('colAmount'), t('colStatus'), t('colDate'), t('colReceipt')].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {orders.map(o => (
                  <tr key={o.id} className="hover:bg-accent/5 transition-colors">
                    <td className="px-4 py-3 text-sm text-foreground whitespace-nowrap">
                      {Array.isArray(o.items) && (o.items[0] as { name?: string })?.name
                        ? (o.items[0] as { name?: string }).name
                        : t('paymentLabel')}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-primary whitespace-nowrap">
                      ${Number(o.total_amount).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={cn('text-xs px-2 py-0.5 rounded-sm border',
                        o.status === 'completed' ? 'text-green-400 bg-green-400/10 border-green-400/20'
                        : o.status === 'pending' ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
                        : 'text-muted-foreground bg-muted/20 border-border/30'
                      )}>
                        {o.status === 'completed' ? t('confirmed') : o.status === 'pending' ? t('statusPending') : o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {formatDateLocale(o.created_at, lang)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => downloadReceipt(o)}
                        disabled={downloading === o.id}
                        className="h-7 px-2 border border-primary/25 text-primary hover:bg-primary/10 rounded-sm text-xs gap-1"
                      >
                        {downloading === o.id
                          ? <span className="w-3 h-3 border border-primary/40 border-t-primary rounded-full animate-spin inline-block" />
                          : <Download className="w-3 h-3" />}
                        PDF
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── SETTINGS ── */
function SettingsSection({ profile, onSaved }: { profile: { id: string; full_name?: string | null; phone?: string | null; username?: string | null }; onSaved: () => void }) {
  const { t } = useLang();
  const [form, setForm] = useState({ full_name: profile.full_name || '', phone: profile.phone || '' });
  const [saving, setSaving] = useState(false);
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [pwSaving, setPwSaving] = useState(false);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await updateProfile({ full_name: form.full_name, phone: form.phone });
    } catch {
      setSaving(false);
      toast.error(t('saveError'));
      return;
    }
    setSaving(false);
    toast.success(t('profileUpdated'));
    onSaved();
  };

  const handleChangePw = async () => {
    if (pwForm.newPw !== pwForm.confirm) { toast.error('Parollar mos emas'); return; }
    if (pwForm.newPw.length < 6) { toast.error('Parol kamida 6 ta belgi bo\'lishi kerak'); return; }
    setPwSaving(true);
    try {
      await changePassword(pwForm.newPw);
    } catch {
      setPwSaving(false);
      toast.error('Parol o\'zgartirishda xatolik');
      return;
    }
    setPwSaving(false);
    toast.success('Parol muvaffaqiyatli o\'zgartirildi');
    setPwForm({ current: '', newPw: '', confirm: '' });
  };

  return (
    <div className="space-y-6 max-w-lg">
      <h2 className="font-jiang-cheng text-foreground text-xl font-bold">{t('settings')}</h2>
      <div className="glass-card border-ancient rounded-sm p-6 card-ancient space-y-4">
        <h3 className="font-jiang-cheng text-foreground font-bold text-sm">Shaxsiy Ma'lumotlar</h3>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-normal text-muted-foreground">Foydalanuvchi nomi</Label>
            <Input value={profile.username || ''} disabled className="bg-background/40 border-border/40 rounded-sm text-sm text-muted-foreground" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-normal text-muted-foreground">{t('firstName')}</Label>
            <Input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} className="bg-background/60 border-border/60 rounded-sm text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-normal text-muted-foreground">{t('phone')}</Label>
            <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="bg-background/60 border-border/60 rounded-sm text-sm" />
          </div>
        </div>
        <Button onClick={handleSaveProfile} disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm text-sm">
          {saving ? t('saving') : t('save')}
        </Button>
      </div>

      <div className="glass-card border-ancient rounded-sm p-6 card-ancient space-y-4">
        <h3 className="font-jiang-cheng text-foreground font-bold text-sm">Parolni O'zgartirish</h3>
        <div className="space-y-3">
          {[
            { label: 'Yangi parol', field: 'newPw' as const, ph: '••••••••' },
            { label: 'Tasdiqlash', field: 'confirm' as const, ph: '••••••••' },
          ].map(({ label, field, ph }) => (
            <div key={field} className="space-y-1.5">
              <Label className="text-xs font-normal text-muted-foreground">{label}</Label>
              <Input type="password" value={pwForm[field]} onChange={e => setPwForm(f => ({ ...f, [field]: e.target.value }))}
                placeholder={ph} className="bg-background/60 border-border/60 rounded-sm text-sm" />
            </div>
          ))}
        </div>
        <Button onClick={handleChangePw} disabled={pwSaving} variant="ghost"
          className="border border-border/40 text-muted-foreground hover:text-foreground rounded-sm text-sm">
          {pwSaving ? 'Saqlanmoqda...' : 'Parolni O\'zgartirish'}
        </Button>
      </div>
    </div>
  );
}
