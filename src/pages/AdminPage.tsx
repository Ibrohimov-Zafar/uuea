import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Building2, Calendar, LogOut, Menu, X,
  LayoutDashboard,
  Plus, Pencil, Trash2, Search, ChevronRight, TrendingUp,
  ShieldCheck, CheckCircle2, XCircle, RefreshCw, Save,
  BarChart2, CheckCircle, AlertCircle, Clock, Download, FileSpreadsheet,
  Bell, Send, MapPin, Filter, ChevronDown as ChevronDownIcon, Mail,
  Megaphone, UploadCloud, Eye, MousePointer, CalendarClock, Newspaper, CreditCard
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  adminStats,
  adminList,
  adminUpdateUser,
  adminDeleteUser,
  adminUpsertBusiness,
  adminDeleteBusiness,
  adminReviewSubmission,
  adminUpsertEvent,
  adminDeleteEvent,
  adminSendNotifications,
  adminHeroLeads,
  adminDeleteHeroLead,
  adminImportHeroLeads,
  adminCampaigns,
  adminCreateCampaign,
  adminCancelCampaign,
  adminMembershipsForUsers,
  adminListNews,
  adminReviewNews,
  adminDeleteNews,
  getMembershipPlans,
  adminUpsertPlan,
  adminDeletePlan,
  sendEmail,
} from '@/api/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLang } from '@/contexts/LangContext';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Profile, Business, Event, Membership, NewsPost, MembershipPlanRow } from '@/types/types';

type Section =
  | 'dashboard'
  | 'members'
  | 'businesses'
  | 'events'
  | 'submissions'
  | 'notifications'
  | 'leads'
  | 'campaigns'
  | 'news'
  | 'plans';

interface Stats {
  members: number;
  businesses: number;
  events: number;
  orders: number;
  revenue: number;
}

interface RevenueRow { month: string; revenue: number; orders: number }
interface MemberRow  { month: string; new_members: number }

interface BusinessSubmission {
  id: string;
  owner_id: string;
  name: string;
  category: string;
  description: string | null;
  website: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  industry: string | null;
  dba_name: string | null;
  status: 'pending' | 'approved' | 'rejected';
  admin_note: string | null;
  created_at: string;
  reviewed_at: string | null;
}

const planLabel: Record<string, string> = {
  starter: 'Starter', business: 'Business', corporate: 'Corporate', international: 'International'
};

/* ── EXPORT HELPERS ───────────────────────────────────────────── */
function exportToCSV(rows: Record<string, unknown>[], filename: string) {
  if (!rows.length) { return; }
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(','),
    ...rows.map(r => headers.map(h => {
      const v = String(r[h] ?? '').replace(/"/g, '""');
      return v.includes(',') || v.includes('"') || v.includes('\n') ? `"${v}"` : v;
    }).join(','))
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename;
  a.click(); URL.revokeObjectURL(url);
}

function exportToXLSX(rows: Record<string, unknown>[], filename: string) {
  if (!rows.length) { return; }
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Ma\'lumotlar');
  // Column auto-width
  const cols = Object.keys(rows[0]).map(k => ({ wch: Math.max(k.length, 14) }));
  ws['!cols'] = cols;
  XLSX.writeFile(wb, filename);
}
function exportMembersPDF(
  rows: { ism: string; email: string; telefon: string; reja: string; holat: string; sana: string }[],
  totalCount: number,
  filterDesc: string
) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const NAVY  = [6, 20, 35] as [number, number, number];
  const GOLD  = [212, 175, 55] as [number, number, number];
  const GOLD2 = [180, 145, 30] as [number, number, number];
  const GRAY  = [160, 160, 175] as [number, number, number];

  const drawPage = () => {
    doc.setFillColor(...NAVY); doc.rect(0, 0, W, H, "F");
    doc.setFillColor(...GOLD); doc.rect(0, 0, W, 1.5, "F");
    doc.setFillColor(...GOLD); doc.rect(0, H - 1.5, W, 1.5, "F");
    doc.setDrawColor(...GOLD2); doc.setLineWidth(0.3);
    doc.rect(4, 4, 18, 18); doc.rect(5.5, 5.5, 15, 15);
    doc.line(4, 13, 22, 13); doc.line(13, 4, 13, 22);
    doc.rect(W - 22, 4, 18, 18); doc.rect(W - 20.5, 5.5, 15, 15);
    doc.line(W - 22, 13, W - 4, 13); doc.line(W - 13, 4, W - 13, 22);
    doc.rect(4, H - 22, 18, 18); doc.rect(5.5, H - 20.5, 15, 15);
    doc.line(4, H - 13, 22, H - 13); doc.line(13, H - 22, 13, H - 4);
    doc.rect(W - 22, H - 22, 18, 18); doc.rect(W - 20.5, H - 20.5, 15, 15);
    doc.line(W - 22, H - 13, W - 4, H - 13); doc.line(W - 13, H - 22, W - 13, H - 4);
    doc.setDrawColor(...GOLD2); doc.setLineWidth(0.15);
    doc.circle(W / 2, H / 2, 40); doc.circle(W / 2, H / 2, 36); doc.circle(W / 2, H / 2, 32);
  };

  drawPage();
  doc.setTextColor(...GOLD);
  doc.setFontSize(16); doc.setFont("helvetica", "bold");
  doc.text("BIZNES CHAMBER", W / 2, 18, { align: "center" });
  doc.setFontSize(9); doc.setFont("helvetica", "normal");
  doc.setTextColor(...GRAY);
  doc.text("A\'ZOLAR RO\'YXATI", W / 2, 25, { align: "center" });
  const today = new Date().toLocaleDateString("uz-UZ");
  doc.setFontSize(7.5); doc.setTextColor(...GRAY);
  doc.text("Sana: " + today, 28, 32);
  doc.text("Jami: " + totalCount + " ta azolar", W / 2, 32, { align: "center" });
  doc.text(filterDesc, W - 28, 32, { align: "right" });
  doc.setDrawColor(...GOLD); doc.setLineWidth(0.4);
  doc.line(28, 35, W - 28, 35);

  autoTable(doc, {
    startY: 39,
    margin: { left: 28, right: 28 },
    head: [["Ism", "Email", "Telefon", "Azolik Rejasi", "Holat", "Qoshilgan Sana"]],
    body: rows.map(r => [r.ism, r.email, r.telefon, r.reja, r.holat, r.sana]),
    styles: {
      font: "helvetica",
      fontSize: 8,
      cellPadding: 3,
      textColor: [220, 220, 230] as [number, number, number],
      lineColor: [30, 50, 70] as [number, number, number],
      lineWidth: 0.2,
      fillColor: [10, 28, 48] as [number, number, number],
    },
    headStyles: {
      fillColor: GOLD,
      textColor: NAVY,
      fontStyle: "bold",
      fontSize: 8.5,
    },
    alternateRowStyles: { fillColor: [14, 34, 55] as [number, number, number] },
    columnStyles: {
      0: { cellWidth: 42 },
      1: { cellWidth: 55 },
      2: { cellWidth: 32 },
      3: { cellWidth: 32 },
      4: { cellWidth: 24 },
      5: { cellWidth: 32 },
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    didDrawPage: (_data: any) => { drawPage(); },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7); doc.setTextColor(...GRAY);
    doc.text(i + " / " + pageCount, W / 2, H - 5, { align: "center" });
    doc.text("Biznes Chamber " + new Date().getFullYear(), 28, H - 5);
  }
  const filename = "azolar-" + new Date().toISOString().slice(0, 10) + ".pdf";
  doc.save(filename);
}

const statusColor: Record<string, string> = {
  active: 'text-green-400 bg-green-400/10 border-green-400/20',
  inactive: 'text-muted-foreground bg-muted/30 border-border/30',
  pending: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  cancelled: 'text-destructive bg-destructive/10 border-destructive/20',
};

function fmtMonth(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('uz-UZ', { month: 'short', year: '2-digit' });
  } catch { return iso; }
}

export default function AdminPage() {
  const navigate = useNavigate();
  const { profile, isAdmin, isSuperAdmin, loading: authLoading, signOut } = useAuth();
  const { t } = useLang();
  const [section, setSection] = useState<Section>('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && (!profile || !isAdmin)) navigate('/', { replace: true });
  }, [authLoading, profile, isAdmin, navigate]);

  if (authLoading) return (
    <div className="flex items-center justify-center min-h-screen bg-navy-dark">
      <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );
  if (!profile || !isAdmin) return null;

  const navItems: { id: Section; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard',   label: t('charts'),               icon: <BarChart2 className="w-4 h-4" /> },
    { id: 'members',     label: "A'zolar",                 icon: <Users className="w-4 h-4" /> },
    { id: 'businesses',  label: 'Bizneslar',               icon: <Building2 className="w-4 h-4" /> },
    { id: 'submissions', label: t('submissionsApproval'),  icon: <CheckCircle className="w-4 h-4" /> },
    { id: 'events',      label: t('eventsLabel'),          icon: <Calendar className="w-4 h-4" /> },
    { id: 'notifications', label: 'Bildirishnomalar',         icon: <Bell className="w-4 h-4" /> },
    { id: 'leads',          label: 'Email Obunalar',           icon: <Mail className="w-4 h-4" /> },
    { id: 'campaigns',      label: 'Kampaniyalar',             icon: <Megaphone className="w-4 h-4" /> },
  ];

  // Regular admin should also be able to manage news and events.
  navItems.push({ id: 'news', label: 'Yangiliklar', icon: <Newspaper className="w-4 h-4" /> });
  // Only super-admin can manage membership plans / payments-related configuration.
  if (isSuperAdmin) navItems.push({ id: 'plans', label: "A'zolik Rejalari", icon: <CreditCard className="w-4 h-4" /> });

  const goTo = (s: Section) => { setSection(s); setMobileOpen(false); };

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 bg-sidebar border-r border-sidebar-border">
        <div className="p-5 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <div>
              <div className="font-jiang-cheng text-sidebar-foreground text-sm font-bold">Admin Panel</div>
              <div className="text-primary text-[10px] tracking-wider">{profile.full_name || profile.username}</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <button key={item.id} onClick={() => goTo(item.id)}
              className={cn('w-full flex items-center gap-3 px-4 py-2.5 text-sm rounded-sm transition-all text-left',
                section === item.id
                  ? 'bg-sidebar-accent text-primary'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}>
              {item.icon}{item.label}
              {section === item.id && <ChevronRight className="w-3 h-3 ml-auto" />}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-sidebar-border space-y-1">
          {isSuperAdmin && (
            <button onClick={() => navigate('/dashboard')}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm rounded-sm text-sidebar-foreground hover:bg-sidebar-accent transition-all">
              <LayoutDashboard className="w-4 h-4" />Dashboard
            </button>
          )}
          <button onClick={async () => { await signOut(); navigate('/'); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm rounded-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-destructive transition-all">
            <LogOut className="w-4 h-4" />{t('logout')}
          </button>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-navy-dark/80 backdrop-blur-sm" />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-sidebar border-r border-sidebar-border flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span className="font-jiang-cheng text-sidebar-foreground text-sm font-bold">Admin Panel</span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {navItems.map(item => (
                <button key={item.id} onClick={() => goTo(item.id)}
                  className={cn('w-full flex items-center gap-3 px-4 py-2.5 text-sm rounded-sm transition-all text-left',
                    section === item.id ? 'bg-sidebar-accent text-primary' : 'text-sidebar-foreground hover:bg-sidebar-accent'
                  )}>
                  {item.icon}{item.label}
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
        {/* Mobile topbar */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-border/50 bg-card shrink-0">
          <button onClick={() => setMobileOpen(true)} className="text-muted-foreground hover:text-foreground">
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-jiang-cheng text-foreground text-sm font-semibold truncate flex-1 min-w-0">
            {navItems.find(n => n.id === section)?.label}
          </span>
        </div>

        <div className="flex-1 p-4 md:p-8 space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="font-jiang-cheng text-foreground text-xl font-bold text-balance">
              {navItems.find(n => n.id === section)?.label}
            </h1>
          </div>
          {section === 'dashboard'   && <DashboardSection />}
          {section === 'members'     && <MembersSection canManageUsers={isSuperAdmin} />}
          {section === 'businesses'  && <BusinessesSection />}
          {section === 'submissions' && <SubmissionsSection />}
          {section === 'events'      && <EventsSection />}
          {section === 'notifications' && <NotificationsSection />}
          {section === 'leads'         && <LeadsSection />}
          {section === 'campaigns'     && <CampaignsSection />}
          {section === 'news'          && <NewsAdminSection />}
          {section === 'plans'         && <PlansAdminSection />}
        </div>
      </div>
    </div>
  );
}

/* ── CUSTOM TOOLTIP ─ */
function ChartTooltip({ active, payload, label, prefix = '' }: {
  active?: boolean; payload?: { value: number; name: string }[]; label?: string; prefix?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card border-ancient rounded-sm p-3 text-xs shadow-deep">
      <p className="text-muted-foreground mb-1 font-semibold">{label}</p>
      {payload.map(p => (
        <p key={p.name} className="text-primary font-bold">{prefix}{p.value.toLocaleString()}</p>
      ))}
    </div>
  );
}

/* ══ DASHBOARD / CHARTS SECTION ═══════════════════════════════ */
function DashboardSection() {
  const { isSuperAdmin } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [revenue, setRevenue] = useState<RevenueRow[]>([]);
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const dash = await adminStats();
      const counts = (dash.counts || {}) as Record<string, number>;
      const revData = (dash.revenue_monthly || []) as Record<string, unknown>[];
      const memData = (dash.membership_monthly || []) as Record<string, unknown>[];

      setStats({
        members: counts.profiles || 0,
        businesses: counts.businesses || 0,
        events: counts.events || 0,
        orders: 0,
        revenue: Number(dash.revenue_total) || 0,
      });

      setRevenue(
        [...revData].reverse().map(r => ({
          month: fmtMonth(String(r.month)),
          revenue: Number(r.revenue) || 0,
          orders: Number(r.order_count) || 0,
        }))
      );

      setMembers(
        [...memData].reverse().map(r => ({
          month: fmtMonth(String(r.month)),
          new_members: Number(r.new_members) || 0,
        }))
      );

      setLoading(false);
    })();
  }, []);

  const cards = stats ? [
    { label: "Jami A'zolar",   value: stats.members,    icon: <Users className="w-5 h-5" />, color: 'text-blue-400' },
    { label: 'Jami Bizneslar', value: stats.businesses, icon: <Building2 className="w-5 h-5" />, color: 'text-green-400' },
    { label: 'Jami Tadbirlar', value: stats.events,     icon: <Calendar className="w-5 h-5" />, color: 'text-yellow-400' },
    ...(isSuperAdmin
      ? [{ label: 'Daromad (USD)', value: `$${stats.revenue.toLocaleString()}`, icon: <TrendingUp className="w-5 h-5" />, color: 'text-primary' }]
      : []),
  ] : [];

  return (
    <div className="space-y-8">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 bg-muted rounded-sm" />)
          : cards.map(c => (
            <div key={c.label} className="glass-card border-ancient rounded-sm p-5 card-ancient space-y-3 h-full flex flex-col">
              <div className={cn('w-10 h-10 flex items-center justify-center bg-current/10 rounded-sm', c.color)}>
                <span className={c.color}>{c.icon}</span>
              </div>
              <div>
                <div className="font-jiang-cheng text-foreground font-bold text-2xl">{c.value}</div>
                <div className="text-muted-foreground text-xs mt-0.5">{c.label}</div>
              </div>
            </div>
          ))
        }
      </div>

      {/* Revenue chart (super-admin only) */}
      {isSuperAdmin && (
        <div className="glass-card border-ancient rounded-sm p-6 card-ancient">
          <h3 className="font-jiang-cheng text-foreground font-bold text-sm mb-6">{
            'Oylik Daromad (USD)'
          }</h3>
          {loading
            ? <Skeleton className="h-64 bg-muted rounded-sm" />
            : revenue.length === 0
              ? <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">Ma'lumot yo'q (to'lovlar bajarilgandan so'ng ko'rsatiladi)</div>
              : (
                <div className="w-full min-w-0 overflow-hidden">
                  <ResponsiveContainer width="100%" height={240}>
                    <AreaChart data={revenue} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#d4af37" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#888' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#888' }} tickFormatter={v => `$${v}`} />
                      <Tooltip content={<ChartTooltip prefix="$" />} />
                      <Area type="monotone" dataKey="revenue" stroke="#d4af37" strokeWidth={2}
                        fill="url(#revGrad)" dot={{ fill: '#d4af37', r: 3 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )
          }
        </div>
      )}

      {/* Membership growth chart */}
      <div className="glass-card border-ancient rounded-sm p-6 card-ancient">
        <h3 className="font-jiang-cheng text-foreground font-bold text-sm mb-6">{"A'zolik O'sishi (Oylik yangi a'zolar)"}</h3>
        {loading
          ? <Skeleton className="h-64 bg-muted rounded-sm" />
          : members.length === 0
            ? <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">Ma'lumot yo'q</div>
            : (
              <div className="w-full min-w-0 overflow-hidden">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={members} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#888' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#888' }} allowDecimals={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="new_members" fill="#d4af37" opacity={0.8} radius={[2, 2, 0, 0]} name="Yangi a'zolar" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )
        }
      </div>
    </div>
  );
}

/* ══ MEMBERS SECTION ══════════════════════════════════════════ */
function MembersSection({ canManageUsers }: { canManageUsers: boolean }) {
  const [members, setMembers] = useState<(Profile & { membership?: Membership })[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [editMember, setEditMember] = useState<Profile | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ full_name: '', phone: '', role: 'user' as 'user' | 'admin' | 'super_admin' | 'business_owner' });
  const [saving, setSaving] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportFilter, setExportFilter] = useState({ dateFrom: '', dateTo: '', plan: 'all', status: 'all' });

  const load = useCallback(async () => {
    setLoading(true);
    const profileList = await adminList<Profile>('users', 100);
    if (profileList.length === 0) { setMembers([]); setLoading(false); return; }
    const mems = await adminMembershipsForUsers(profileList.map(p => p.id));
    const memMap = new Map(mems.map((m) => [m.user_id, m]));
    setMembers(profileList.map(p => ({ ...p, membership: memMap.get(p.id) })));
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = members.filter(m =>
    !query || (m.full_name || '').toLowerCase().includes(query.toLowerCase()) ||
    (m.username || '').toLowerCase().includes(query.toLowerCase()) ||
    (m.email || '').toLowerCase().includes(query.toLowerCase())
  );

  const getExportRows = () => {
    let data = [...filtered];
    if (exportFilter.dateFrom) data = data.filter(m => m.created_at >= exportFilter.dateFrom);
    if (exportFilter.dateTo) data = data.filter(m => m.created_at <= exportFilter.dateTo + 'T23:59:59');
    if (exportFilter.plan !== 'all') data = data.filter(m => m.membership?.plan_slug === exportFilter.plan);
    if (exportFilter.status !== 'all') data = data.filter(m => m.membership?.status === exportFilter.status);
    return data.map(m => ({
      "Ism": m.full_name || '',
      "Foydalanuvchi": m.username || '',
      "Email": m.email || '',
      "Telefon": m.phone || '',
      "Rol": m.role,
      "Azolik Rejasi": m.membership ? (planLabel[m.membership.plan_slug] || m.membership.plan_slug) : "Yoq",
      "Azolik Holati": m.membership?.status || "Yoq",
      "Royxatdan Otgan": new Date(m.created_at).toLocaleDateString('uz-UZ'),
    }));
  };
  const handleExport = (fmt: 'csv' | 'xlsx' | 'pdf') => {
    const exportData = getExportRows();
    const today = new Date().toISOString().slice(0,10);
    if (fmt === 'csv') { exportToCSV(exportData, 'azolar-' + today + '.csv'); }
    else if (fmt === 'xlsx') { exportToXLSX(exportData, 'azolar-' + today + '.xlsx'); }
    else {
      const planFilter = exportFilter.plan !== 'all' ? planLabel[exportFilter.plan] || exportFilter.plan : 'Hammasi';
      const statusFilter = exportFilter.status !== 'all' ? exportFilter.status : 'Hammasi';
      const filterDesc = 'Reja: ' + planFilter + ' | Holat: ' + statusFilter;
      const pdfRows = exportData.map(m => ({
        ism: (m['Ism'] as string) || '',
        email: (m['Email'] as string) || '',
        telefon: (m['Telefon'] as string) || '',
        reja: (m['Azolik Rejasi'] as string) || 'Yoq',
        holat: (m['Azolik Holati'] as string) || 'Yoq',
        sana: (m['Royxatdan Otgan'] as string) || '',
      }));
      exportMembersPDF(pdfRows, exportData.length, filterDesc);
    }
    setShowExportDialog(false);
  };

  const openEdit = (m: Profile) => {
    setEditMember(m);
    setForm({ full_name: m.full_name || '', phone: m.phone || '', role: (m.role as 'user' | 'admin' | 'super_admin' | 'business_owner') });
  };

  const handleSave = async () => {
    if (!editMember) return;
    setSaving(true);
    try {
      const payload: Record<string, unknown> = { id: editMember.id, full_name: form.full_name, phone: form.phone };
      if (canManageUsers) payload.role = form.role;
      await adminUpdateUser(payload);
    } catch {
      setSaving(false);
      toast.error('Saqlashda xatolik');
      return;
    }
    setSaving(false);
    toast.success("A'zo yangilandi");
    setEditMember(null);
    load();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    if (!canManageUsers) {
      toast.error("Bu amal faqat super-admin uchun");
      return;
    }
    try {
      await adminDeleteUser(deleteId);
    } catch {
      toast.error("O'chirishda xatolik");
      return;
    }
    toast.success("A'zo o'chirildi");
    setDeleteId(null);
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Qidirish..." value={query} onChange={e => setQuery(e.target.value)} className="pl-9 bg-background/60 border-border/60 rounded-sm" />
        </div>
        <Button onClick={load} variant="ghost" size="sm" className="border border-border/40 text-muted-foreground hover:text-foreground rounded-sm">
          <RefreshCw className="w-4 h-4" />
        </Button>
        <Button onClick={() => setShowExportDialog(true)} variant="ghost" size="sm" className="border border-primary/30 text-primary hover:bg-primary/10 rounded-sm gap-1.5 text-xs">
          <Filter className="w-3.5 h-3.5" />Eksport
        </Button>
      </div>

      {/* Export filter dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md bg-navy border-ancient rounded-sm">
          <DialogHeader>
            <DialogTitle className="font-jiang-cheng text-foreground flex items-center gap-2">
              <Download className="w-4 h-4 text-primary" />Eksport Filtri
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Date range */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sana Oralig&apos;i</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-normal text-muted-foreground">Dan</Label>
                  <Input type="date" value={exportFilter.dateFrom} onChange={e => setExportFilter(f => ({ ...f, dateFrom: e.target.value }))} className="bg-background/60 border-border/60 rounded-sm text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-normal text-muted-foreground">Gacha</Label>
                  <Input type="date" value={exportFilter.dateTo} onChange={e => setExportFilter(f => ({ ...f, dateTo: e.target.value }))} className="bg-background/60 border-border/60 rounded-sm text-sm" />
                </div>
              </div>
            </div>
            {/* Plan filter */}
            <div className="space-y-1.5">
              <Label className="text-xs font-normal text-muted-foreground">Azolik Rejasi</Label>
              <Select value={exportFilter.plan} onValueChange={v => setExportFilter(f => ({ ...f, plan: v }))}>
                <SelectTrigger className="bg-background/60 border-border/60 rounded-sm text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Hammasi</SelectItem>
                  <SelectItem value="starter">Starter</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="corporate">Corporate</SelectItem>
                  <SelectItem value="international">International</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Status filter */}
            <div className="space-y-1.5">
              <Label className="text-xs font-normal text-muted-foreground">Azolik Holati</Label>
              <Select value={exportFilter.status} onValueChange={v => setExportFilter(f => ({ ...f, status: v }))}>
                <SelectTrigger className="bg-background/60 border-border/60 rounded-sm text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Hammasi</SelectItem>
                  <SelectItem value="active">Faol</SelectItem>
                  <SelectItem value="inactive">Nofaol</SelectItem>
                  <SelectItem value="pending">Kutilmoqda</SelectItem>
                  <SelectItem value="cancelled">Bekor qilingan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Preview count */}
            <div className="flex items-center gap-2 p-3 rounded-sm bg-primary/5 border border-primary/20">
              <Download className="w-4 h-4 text-primary shrink-0" />
              <span className="text-xs text-muted-foreground">
                <span className="text-primary font-bold">{getExportRows().length}</span> ta a&apos;zo eksport qilinadi
              </span>
            </div>
          </div>
          <DialogFooter className="gap-2 flex-wrap">
            <Button variant="ghost" onClick={() => setShowExportDialog(false)} className="border border-border/40 text-muted-foreground rounded-sm">Bekor</Button>
            <Button onClick={() => handleExport('csv')} variant="ghost" className="border border-border/50 text-muted-foreground hover:text-foreground hover:bg-accent/10 rounded-sm gap-1.5 text-xs">
              <Download className="w-3.5 h-3.5" />CSV
            </Button>
            <Button onClick={() => handleExport('xlsx')} variant="ghost" className="border border-primary/30 text-primary hover:bg-primary/10 rounded-sm gap-1.5 text-xs">
              <FileSpreadsheet className="w-3.5 h-3.5" />Excel
            </Button>
            <Button onClick={() => handleExport('pdf')} className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm gap-1.5 text-xs">
              <Download className="w-3.5 h-3.5" />PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="glass-card border-ancient rounded-sm overflow-hidden card-ancient">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                {["Ism", "Foydalanuvchi", "Email", "A'zolik", "Rol", "Amallar"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 6 }).map((__, j) => <td key={j} className="px-4 py-3"><Skeleton className="h-4 bg-muted rounded-sm" /></td>)}</tr>
                ))
                : filtered.map(m => (
                  <tr key={m.id} className="hover:bg-accent/5 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-foreground text-sm font-medium">{m.full_name || '—'}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">@{m.username || '—'}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{m.email?.replace('@miaoda.com', '') || '—'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {m.membership
                        ? <span className={cn('text-xs px-2 py-0.5 rounded-sm border', statusColor[m.membership.status])}>{planLabel[m.membership.plan_slug] || m.membership.plan_slug}</span>
                        : <span className="text-xs text-muted-foreground/50">Yo'q</span>
                      }
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={cn('text-xs px-2 py-0.5 rounded-sm border',
                        m.role === 'admin' ? 'text-primary bg-primary/10 border-primary/30' : 'text-muted-foreground bg-muted/20 border-border/30'
                      )}>{m.role}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Button onClick={() => openEdit(m)} variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-sm"><Pencil className="w-3.5 h-3.5" /></Button>
                        {canManageUsers && (
                          <Button onClick={() => setDeleteId(m.id)} variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-sm"><Trash2 className="w-3.5 h-3.5" /></Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
          {!loading && filtered.length === 0 && <div className="py-12 text-center text-muted-foreground text-sm">Hech narsa topilmadi</div>}
        </div>
      </div>

      <Dialog open={!!editMember} onOpenChange={o => !o && setEditMember(null)}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg bg-navy border-ancient rounded-sm">
          <DialogHeader>
            <DialogTitle className="font-jiang-cheng text-foreground">A'zoni Tahrirlash</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-normal text-muted-foreground">To'liq Ism</Label>
              <Input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} className="bg-background/60 border-border/60 rounded-sm text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-normal text-muted-foreground">Telefon</Label>
              <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="bg-background/60 border-border/60 rounded-sm text-sm" />
            </div>
            {canManageUsers && (
              <div className="space-y-1.5">
                <Label className="text-xs font-normal text-muted-foreground">Rol</Label>
                <Select value={form.role} onValueChange={(v: 'user' | 'admin' | 'super_admin' | 'business_owner') => setForm(f => ({ ...f, role: v }))}>
                  <SelectTrigger className="bg-background/60 border-border/60 rounded-sm text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="business_owner">Business Owner</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditMember(null)} className="border border-border/40 text-muted-foreground rounded-sm">Bekor</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm">
              {saving ? 'Saqlanmoqda...' : <span className="flex items-center gap-2"><Save className="w-3.5 h-3.5" />Saqlash</span>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={o => !o && setDeleteId(null)}>
        <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg bg-navy border-ancient rounded-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-jiang-cheng text-foreground">A'zoni O'chirish</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">Bu amalni qaytarib bo'lmaydi.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border border-border/40 text-muted-foreground rounded-sm bg-transparent">Bekor</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-sm">O'chirish</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ══ BUSINESSES SECTION ═══════════════════════════════════════ */
function BusinessesSection() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editBiz, setEditBiz] = useState<Business | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', category: '', description: '', website: '', phone: '', email: '', is_vip: false, latitude: '', longitude: '' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await adminList<Business>('businesses', 100);
    setBusinesses(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = businesses.filter(b =>
    !query || b.name.toLowerCase().includes(query.toLowerCase()) || b.category.toLowerCase().includes(query.toLowerCase())
  );

  const resetForm = () => setForm({ name: '', category: '', description: '', website: '', phone: '', email: '', is_vip: false, latitude: '', longitude: '' });
  const openAdd = () => { resetForm(); setEditBiz(null); setShowForm(true); };
  const openEdit = (b: Business) => {
    setEditBiz(b);
    setForm({ name: b.name, category: b.category, description: b.description || '', website: b.website || '', phone: b.phone || '', email: b.email || '', is_vip: b.is_vip, latitude: b.latitude != null ? String(b.latitude) : '', longitude: b.longitude != null ? String(b.longitude) : '' });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.category.trim()) { toast.error('Ism va kategoriya majburiy'); return; }
    setSaving(true);
    try {
      await adminUpsertBusiness({
        id: editBiz?.id,
        ...form,
        latitude: form.latitude !== '' ? parseFloat(form.latitude) : null,
        longitude: form.longitude !== '' ? parseFloat(form.longitude) : null,
        is_active: true,
      });
      toast.success(editBiz ? 'Biznes yangilandi' : "Biznes qo'shildi");
    } catch {
      toast.error(editBiz ? 'Saqlashda xatolik' : "Qo'shishda xatolik");
      setSaving(false);
      return;
    }
    setSaving(false); setShowForm(false); load();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await adminDeleteBusiness(deleteId);
    } catch {
      toast.error("O'chirishda xatolik");
      return;
    }
    toast.success("Biznes o'chirildi");
    setDeleteId(null); load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Qidirish..." value={query} onChange={e => setQuery(e.target.value)} className="pl-9 bg-background/60 border-border/60 rounded-sm" />
        </div>
        <Button onClick={load} variant="ghost" size="sm" className="border border-border/40 text-muted-foreground hover:text-foreground rounded-sm"><RefreshCw className="w-4 h-4" /></Button>
        <Button onClick={openAdd} className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm text-sm"><Plus className="w-4 h-4 mr-1.5" />Qo'shish</Button>
      </div>

      <div className="glass-card border-ancient rounded-sm overflow-hidden card-ancient">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                {['Kompaniya', 'Kategoriya', 'Aloqa', 'VIP', 'Holat', 'Amallar'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 6 }).map((__, j) => <td key={j} className="px-4 py-3"><Skeleton className="h-4 bg-muted rounded-sm" /></td>)}</tr>
                ))
                : filtered.map(b => (
                  <tr key={b.id} className="hover:bg-accent/5 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap"><div className="text-foreground text-sm font-medium">{b.name}</div></td>
                    <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">{b.category}</td>
                    <td className="px-4 py-3 whitespace-nowrap"><div className="text-xs text-muted-foreground">{b.email || b.phone || '—'}</div></td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {b.is_vip ? <CheckCircle2 className="w-4 h-4 text-primary" /> : <XCircle className="w-4 h-4 text-muted-foreground/30" />}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={cn('text-xs px-2 py-0.5 rounded-sm border', b.is_active ? 'text-green-400 bg-green-400/10 border-green-400/20' : 'text-muted-foreground bg-muted/20 border-border/30')}>
                        {b.is_active ? 'Faol' : 'Nofaol'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Button onClick={() => openEdit(b)} variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-sm"><Pencil className="w-3.5 h-3.5" /></Button>
                        <Button onClick={() => setDeleteId(b.id)} variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-sm"><Trash2 className="w-3.5 h-3.5" /></Button>
                      </div>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
          {!loading && filtered.length === 0 && <div className="py-12 text-center text-muted-foreground text-sm">Hech narsa topilmadi</div>}
        </div>
      </div>

      <Dialog open={showForm} onOpenChange={o => !o && setShowForm(false)}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg bg-navy border-ancient rounded-sm">
          <DialogHeader>
            <DialogTitle className="font-jiang-cheng text-foreground">{editBiz ? 'Biznesni Tahrirlash' : "Yangi Biznes Qo'shish"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2 max-h-[60vh] overflow-y-auto pr-1">
            {[
              { label: 'Kompaniya Nomi *', field: 'name' as const, placeholder: 'Kompaniya nomi' },
              { label: 'Kategoriya *', field: 'category' as const, placeholder: 'IT, Qurilish...' },
              { label: 'Veb-sayt', field: 'website' as const, placeholder: 'example.uz' },
              { label: 'Telefon', field: 'phone' as const, placeholder: '+998 71 ...' },
              { label: 'Email', field: 'email' as const, placeholder: 'info@example.uz' },
              { label: 'Tavsif', field: 'description' as const, placeholder: 'Qisqa tavsif' },
            ].map(({ label, field, placeholder }) => (
              <div key={field} className="space-y-1.5">
                <Label className="text-xs font-normal text-muted-foreground">{label}</Label>
                <Input value={form[field] as string} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} placeholder={placeholder} className="bg-background/60 border-border/60 rounded-sm text-sm" />
              </div>
            ))}
            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Xarita Koordinatalari</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-normal text-muted-foreground">Kenglik (Latitude)</Label>
                  <Input type="number" step="0.000001" value={form.latitude} onChange={e => setForm(f => ({ ...f, latitude: e.target.value }))} placeholder="41.2995" className="bg-background/60 border-border/60 rounded-sm text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-normal text-muted-foreground">Uzunlik (Longitude)</Label>
                  <Input type="number" step="0.000001" value={form.longitude} onChange={e => setForm(f => ({ ...f, longitude: e.target.value }))} placeholder="69.2401" className="bg-background/60 border-border/60 rounded-sm text-sm" />
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground/60">Toshkent markazi: 41.2995, 69.2401</p>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <input type="checkbox" id="is_vip" checked={form.is_vip} onChange={e => setForm(f => ({ ...f, is_vip: e.target.checked }))} className="rounded-sm" />
              <Label htmlFor="is_vip" className="text-sm text-muted-foreground cursor-pointer">VIP A&apos;zo</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowForm(false)} className="border border-border/40 text-muted-foreground rounded-sm">Bekor</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm">
              {saving ? 'Saqlanmoqda...' : <span className="flex items-center gap-2"><Save className="w-3.5 h-3.5" />Saqlash</span>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={o => !o && setDeleteId(null)}>
        <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg bg-navy border-ancient rounded-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-jiang-cheng text-foreground">Biznesni O'chirish</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">Bu amalni qaytarib bo'lmaydi.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border border-border/40 text-muted-foreground rounded-sm bg-transparent">Bekor</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-sm">O'chirish</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ══ SUBMISSIONS SECTION ══════════════════════════════════════ */
function SubmissionsSection() {
  const [submissions, setSubmissions] = useState<BusinessSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [selected, setSelected] = useState<BusinessSubmission | null>(null);
  const [note, setNote] = useState('');
  const [processing, setProcessing] = useState(false);
  const { t } = useLang();

  const load = useCallback(async () => {
    setLoading(true);
    const data = await adminList<BusinessSubmission>('business_submissions', 100);
    const rows = filter === 'all' ? data : data.filter((s) => s.status === filter);
    setSubmissions(rows);
    setLoading(false);
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const handleReview = async (action: 'approved' | 'rejected') => {
    if (!selected) return;
    setProcessing(true);
    try {
      await adminReviewSubmission({
        id: selected.id,
        status: action,
        admin_note: note.trim() || null,
      });
    } catch {
      toast.error('Xatolik yuz berdi');
      setProcessing(false);
      return;
    }

    toast.success(action === 'approved' ? 'Biznes tasdiqlandi va katalogga qo\'shildi' : 'Rad etildi');
    setSelected(null);
    setNote('');
    setProcessing(false);
    load();
  };

  const statusBadge = (s: string) => {
    if (s === 'pending') return <span className="flex items-center gap-1 text-xs text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-2 py-0.5 rounded-sm"><Clock className="w-3 h-3" />Kutilmoqda</span>;
    if (s === 'approved') return <span className="flex items-center gap-1 text-xs text-green-400 bg-green-400/10 border border-green-400/20 px-2 py-0.5 rounded-sm"><CheckCircle className="w-3 h-3" />{t('approved')}</span>;
    return <span className="flex items-center gap-1 text-xs text-destructive bg-destructive/10 border border-destructive/20 px-2 py-0.5 rounded-sm"><AlertCircle className="w-3 h-3" />{t('rejected')}</span>;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn('text-xs px-3 py-1.5 rounded-sm border transition-all',
              filter === f ? 'bg-primary text-primary-foreground border-primary' : 'border-border/60 text-muted-foreground hover:border-primary/40 hover:text-primary'
            )}>
            {f === 'all' ? 'Hammasi' : f === 'pending' ? 'Kutilmoqda' : f === 'approved' ? t('approved') : t('rejected')}
          </button>
        ))}
        <Button onClick={load} variant="ghost" size="sm" className="border border-border/40 text-muted-foreground hover:text-foreground rounded-sm ml-auto"><RefreshCw className="w-4 h-4" /></Button>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 bg-muted rounded-sm" />)}</div>
      ) : submissions.length === 0 ? (
        <div className="glass-card border-ancient rounded-sm py-16 text-center card-ancient">
          <CheckCircle2 className="w-10 h-10 text-primary/30 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Takliflar yo'q</p>
        </div>
      ) : (
        <div className="space-y-3">
          {submissions.map(sub => (
            <div key={sub.id} className="glass-card border-ancient rounded-sm p-4 card-ancient flex items-start justify-between gap-4 hover:border-primary/30 transition-colors">
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-jiang-cheng text-foreground font-bold text-sm">{sub.name}</h4>
                  {statusBadge(sub.status)}
                </div>
                <div className="text-xs text-muted-foreground">{sub.category}{sub.industry ? ` · ${sub.industry}` : ''}</div>
                {sub.description && <p className="text-xs text-muted-foreground line-clamp-2">{sub.description}</p>}
                <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                  {sub.email && <span>{sub.email}</span>}
                  {sub.phone && <span>{sub.phone}</span>}
                  {sub.website && <span>{sub.website}</span>}
                </div>
                <div className="text-[11px] text-muted-foreground/60">{new Date(sub.created_at).toLocaleDateString('uz-UZ')}</div>
              </div>
              {sub.status === 'pending' && (
                <div className="flex items-center gap-1 shrink-0">
                  <Button onClick={() => { setSelected(sub); setNote(''); }} variant="ghost" size="sm"
                    className="border border-border/40 text-muted-foreground hover:text-foreground rounded-sm text-xs h-8 px-3">
                    Ko'rish
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Review modal */}
      <Dialog open={!!selected} onOpenChange={o => !o && setSelected(null)}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg bg-navy border-ancient rounded-sm">
          <DialogHeader>
            <DialogTitle className="font-jiang-cheng text-foreground">Biznes Taklifini Ko'rish</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 py-2 max-h-[70vh] overflow-y-auto pr-1">
              <div className="space-y-2 text-sm">
                {[
                  ['Kompaniya', selected.name],
                  ['Kategoriya', selected.category],
                  ['Soha', selected.industry],
                  ['DBA Nomi', selected.dba_name],
                  ['Email', selected.email],
                  ['Telefon', selected.phone],
                  ['Veb-sayt', selected.website],
                  ['Manzil', selected.address],
                ].filter(([, v]) => v).map(([k, v]) => (
                  <div key={k} className="flex gap-2">
                    <span className="text-muted-foreground text-xs w-24 shrink-0">{k}:</span>
                    <span className="text-foreground text-xs">{v}</span>
                  </div>
                ))}
                {selected.description && (
                  <div className="pt-2 border-t border-border/40">
                    <p className="text-muted-foreground text-xs mb-1">Tavsif:</p>
                    <p className="text-foreground text-xs leading-relaxed">{selected.description}</p>
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-normal text-muted-foreground">Admin izohi (ixtiyoriy)</Label>
                <Input value={note} onChange={e => setNote(e.target.value)} placeholder="Sabab yoki izoh..." className="bg-background/60 border-border/60 rounded-sm text-sm" />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setSelected(null)} className="border border-border/40 text-muted-foreground rounded-sm">Yopish</Button>
            <Button onClick={() => handleReview('rejected')} disabled={processing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-sm">
              {t('reject')}
            </Button>
            <Button onClick={() => handleReview('approved')} disabled={processing}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm">
              {t('approve')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ══ EVENTS SECTION ══════════════════════════════════════════ */
function EventsSection() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editEv, setEditEv] = useState<Event | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', category: 'Forum', location: '', event_date: '', event_time: '', price_usd: '0', spots_total: '100', description: '', is_featured: false });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await adminList<Event>('events', 100);
    setEvents(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = events.filter(ev =>
    !query || ev.title.toLowerCase().includes(query.toLowerCase()) || ev.location.toLowerCase().includes(query.toLowerCase())
  );

  const resetForm = () => setForm({ title: '', category: 'Forum', location: '', event_date: '', event_time: '', price_usd: '0', spots_total: '100', description: '', is_featured: false });
  const openAdd = () => { resetForm(); setEditEv(null); setShowForm(true); };
  const openEdit = (ev: Event) => {
    setEditEv(ev);
    setForm({ title: ev.title, category: ev.category, location: ev.location, event_date: ev.event_date, event_time: ev.event_time || '', price_usd: String(ev.price_usd), spots_total: String(ev.spots_total), description: ev.description || '', is_featured: ev.is_featured });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.event_date || !form.location.trim()) { toast.error('Sarlavha, sana va joylashuv majburiy'); return; }
    setSaving(true);
    const payload = { title: form.title, category: form.category, location: form.location, event_date: form.event_date, event_time: form.event_time || null, price_usd: Number(form.price_usd) || 0, spots_total: Number(form.spots_total) || 100, description: form.description || null, is_featured: form.is_featured };
    try {
      await adminUpsertEvent({
        id: editEv?.id,
        ...payload,
        spots_remaining: editEv ? editEv.spots_remaining : Number(form.spots_total) || 100,
        is_active: true,
      });
      toast.success(editEv ? 'Tadbir yangilandi' : "Tadbir qo'shildi");
    } catch {
      toast.error(editEv ? 'Saqlashda xatolik' : "Qo'shishda xatolik");
      setSaving(false);
      return;
    }
    setSaving(false); setShowForm(false); load();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await adminDeleteEvent(deleteId);
    toast.success("Tadbir o'chirildi");
    setDeleteId(null); load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Qidirish..." value={query} onChange={e => setQuery(e.target.value)} className="pl-9 bg-background/60 border-border/60 rounded-sm" />
        </div>
        <Button onClick={load} variant="ghost" size="sm" className="border border-border/40 text-muted-foreground rounded-sm"><RefreshCw className="w-4 h-4" /></Button>
        <Button onClick={() => { const rows = filtered.map(ev => ({ 'Sarlavha': ev.title, 'Kategoriya': ev.category, 'Sana': ev.event_date, 'Vaqt': ev.event_time || '', 'Joylashuv': ev.location, 'Narx ($)': ev.price_usd, 'Jami Joylar': ev.spots_total, "Bosh Joylar": ev.spots_remaining, 'Featured': ev.is_featured ? 'Ha' : "Yoq" })); exportToCSV(rows, 'tadbirlar.csv'); }} variant="ghost" size="sm" className="border border-primary/30 text-primary hover:bg-primary/10 rounded-sm gap-1.5 text-xs">
          <Download className="w-3.5 h-3.5" />CSV
        </Button>
        <Button onClick={() => { const rows = filtered.map(ev => ({ 'Sarlavha': ev.title, 'Kategoriya': ev.category, 'Sana': ev.event_date, 'Vaqt': ev.event_time || '', 'Joylashuv': ev.location, 'Narx ($)': ev.price_usd, 'Jami Joylar': ev.spots_total, "Bosh Joylar": ev.spots_remaining, 'Featured': ev.is_featured ? 'Ha' : "Yoq" })); exportToXLSX(rows, 'tadbirlar.xlsx'); }} variant="ghost" size="sm" className="border border-primary/30 text-primary hover:bg-primary/10 rounded-sm gap-1.5 text-xs">
          <FileSpreadsheet className="w-3.5 h-3.5" />Excel
        </Button>
        <Button onClick={openAdd} className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm text-sm"><Plus className="w-4 h-4 mr-1.5" />Qo'shish</Button>
      </div>

      <div className="glass-card border-ancient rounded-sm overflow-hidden card-ancient">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                {['Sarlavha', 'Sana', 'Joylashuv', 'Narx', 'Joylar', 'Amallar'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 6 }).map((__, j) => <td key={j} className="px-4 py-3"><Skeleton className="h-4 bg-muted rounded-sm" /></td>)}</tr>
                ))
                : filtered.map(ev => (
                  <tr key={ev.id} className="hover:bg-accent/5 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap max-w-48 truncate">
                      <div className="flex items-center gap-2">
                        <span className="text-foreground text-sm font-medium">{ev.title}</span>
                        {ev.is_featured && <span className="vip-badge text-[9px]">Featured</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">{ev.event_date}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap max-w-36 truncate">{ev.location}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={cn('text-sm font-semibold', ev.price_usd > 0 ? 'text-primary' : 'text-green-400')}>
                        {ev.price_usd > 0 ? `$${ev.price_usd}` : 'Bepul'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">{ev.spots_remaining}/{ev.spots_total}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Button onClick={() => openEdit(ev)} variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-sm"><Pencil className="w-3.5 h-3.5" /></Button>
                        <Button onClick={() => setDeleteId(ev.id)} variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-sm"><Trash2 className="w-3.5 h-3.5" /></Button>
                      </div>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
          {!loading && filtered.length === 0 && <div className="py-12 text-center text-muted-foreground text-sm">Hech narsa topilmadi</div>}
        </div>
      </div>

      <Dialog open={showForm} onOpenChange={o => !o && setShowForm(false)}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg bg-navy border-ancient rounded-sm">
          <DialogHeader>
            <DialogTitle className="font-jiang-cheng text-foreground">{editEv ? 'Tadbirni Tahrirlash' : "Yangi Tadbir Qo'shish"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2 max-h-[65vh] overflow-y-auto pr-1">
            {([
              { label: 'Sarlavha *', field: 'title', placeholder: 'Tadbir nomi' },
              { label: 'Joylashuv *', field: 'location', placeholder: 'Toshkent, ...' },
              { label: 'Sana *', field: 'event_date', placeholder: '', type: 'date' },
              { label: 'Vaqt', field: 'event_time', placeholder: '10:00', type: 'time' },
              { label: 'Narx ($)', field: 'price_usd', placeholder: '0', type: 'number' },
              { label: 'Joylar soni', field: 'spots_total', placeholder: '100', type: 'number' },
              { label: 'Tavsif', field: 'description', placeholder: 'Qisqa tavsif' },
            ] as { label: string; field: keyof typeof form; placeholder: string; type?: string }[]).map(({ label, field, placeholder, type }) => (
              <div key={field} className="space-y-1.5">
                <Label className="text-xs font-normal text-muted-foreground">{label}</Label>
                <Input
                  type={type || 'text'}
                  value={form[field] as string}
                  onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                  placeholder={placeholder}
                  className="bg-background/60 border-border/60 rounded-sm text-sm"
                />
              </div>
            ))}
            <div className="space-y-1.5">
              <Label className="text-xs font-normal text-muted-foreground">Kategoriya</Label>
              <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                <SelectTrigger className="bg-background/60 border-border/60 rounded-sm text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['Forum', 'Networking', 'Trening', 'Gala', 'Summit', 'Suhbat'].map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="is_featured" checked={form.is_featured} onChange={e => setForm(f => ({ ...f, is_featured: e.target.checked }))} />
              <Label htmlFor="is_featured" className="text-sm text-muted-foreground cursor-pointer">Featured</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowForm(false)} className="border border-border/40 text-muted-foreground rounded-sm">Bekor</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm">
              {saving ? 'Saqlanmoqda...' : <span className="flex items-center gap-2"><Save className="w-3.5 h-3.5" />Saqlash</span>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={o => !o && setDeleteId(null)}>
        <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg bg-navy border-ancient rounded-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-jiang-cheng text-foreground">Tadbirni O'chirish</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">Bu amalni qaytarib bo'lmaydi.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border border-border/40 text-muted-foreground rounded-sm bg-transparent">Bekor</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-sm">O'chirish</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ══ NOTIFICATIONS SECTION ════════════════════════════════════ */
function NotificationsSection() {
  const [members, setMembers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [query, setQuery] = useState('');
  const [form, setForm] = useState({
    title: '',
    body: '',
    link: '',
    type: 'info' as 'info' | 'success' | 'warning' | 'event' | 'membership',
  });
  const [history, setHistory] = useState<{ id: string; title: string; body: string; type: string; created_at: string; recipient_count: number }[]>([]);

  const loadMembers = useCallback(async () => {
    setLoading(true);
    const data = await adminList<Profile>('users', 200);
    setMembers(data);
    setLoading(false);
  }, []);

  const loadHistory = useCallback(async () => {
    const data = await adminList('notifications', 20);
    if (data) {
      const grouped = new Map<string, { title: string; body: string; type: string; created_at: string; count: number }>();
      for (const n of data as { id: string; title: string; body: string; type: string; created_at: string }[]) {
        const key = `${n.title}|${n.created_at.slice(0, 16)}`;
        if (grouped.has(key)) { grouped.get(key)!.count++; }
        else grouped.set(key, { title: n.title, body: n.body, type: n.type, created_at: n.created_at, count: 1 });
      }
      setHistory(Array.from(grouped.entries()).map(([, v], i) => ({
        id: String(i),
        title: v.title,
        body: v.body,
        type: v.type,
        created_at: v.created_at,
        recipient_count: v.count,
      })));
    }
  }, []);

  useEffect(() => { loadMembers(); loadHistory(); }, [loadMembers, loadHistory]);

  const filtered = members.filter(m =>
    !query ||
    (m.full_name || '').toLowerCase().includes(query.toLowerCase()) ||
    (m.email || '').toLowerCase().includes(query.toLowerCase())
  );

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectAll) { setSelectedIds(new Set()); setSelectAll(false); }
    else { setSelectedIds(new Set(filtered.map(m => m.id))); setSelectAll(true); }
  };

  const handleSend = async () => {
    if (!form.title.trim() || !form.body.trim()) { toast.error('Sarlavha va matn majburiy'); return; }
    const targets = selectedIds.size > 0 ? Array.from(selectedIds) : members.map(m => m.id);
    if (targets.length === 0) { toast.error("Hech qanday a'zo tanlanmagan"); return; }
    setSending(true);
    try {
      await adminSendNotifications({
        user_ids: targets,
        type: form.type,
        title: form.title.trim(),
        body: form.body.trim(),
        link: form.link.trim() || undefined,
      });
    } catch (e) {
      toast.error('Yuborishda xatolik: ' + (e instanceof Error ? e.message : 'xatolik'));
      setSending(false);
      return;
    }
    toast.success(`${targets.length} ta a'zoga bildirishnoma yuborildi`);
    setForm({ title: '', body: '', link: '', type: 'info' });
    setSelectedIds(new Set()); setSelectAll(false);
    setSending(false);
    loadHistory();
  };

  const TYPE_OPTIONS: { value: typeof form.type; label: string; color: string }[] = [
    { value: 'info',       label: 'Ma\'lumot',      color: 'text-blue-400' },
    { value: 'success',    label: 'Muvaffaqiyat',   color: 'text-green-400' },
    { value: 'warning',    label: 'Ogohlantirish',  color: 'text-amber-400' },
    { value: 'event',      label: 'Tadbir',         color: 'text-primary' },
    { value: 'membership', label: 'A\'zolik',       color: 'text-purple-400' },
  ];

  const typeColor = (t: string) => TYPE_OPTIONS.find(o => o.value === t)?.color || 'text-muted-foreground';

  const TEMPLATES = [
    {
      label: "Yangi Tadbir",
      icon: "Calendar",
      type: 'event' as typeof form.type,
      title: "Yangi Tadbir E'loni",
      body: "Biznes Chamber yangi tadbirga taklif qiladi. Batafsil ma'lumot va ro'yxatdan o'tish uchun tadbirlar sahifasiga tashrif buyuring.",
      link: "/tadbirlar",
    },
    {
      label: "To'lov Eslatmasi",
      icon: "CreditCard",
      type: 'warning' as typeof form.type,
      title: "A'zolik To'lovi Eslatmasi",
      body: "Hurmatli a'zo, a'zolik to'lov muddati yaqinlashmoqda. Uzluksiz xizmatdan foydalanish uchun o'z vaqtida to'lovni amalga oshiring.",
      link: "/dashboard",
    },
    {
      label: "Xush Kelibsiz",
      icon: "Star",
      type: 'success' as typeof form.type,
      title: "Biznes Chamber Oilasiga Xush Kelibsiz!",
      body: "Siz Biznes Chamber a'zoligiga muvaffaqiyatli qo'shildingiz. Dashboard orqali barcha imkoniyatlardan foydalanishingiz mumkin.",
      link: "/dashboard",
    },
  ];

  const applyTemplate = (tpl: typeof TEMPLATES[0]) => {
    setForm(f => ({ ...f, title: tpl.title, body: tpl.body, link: tpl.link, type: tpl.type }));
  };

  return (
    <div className="space-y-6">
      {/* Templates */}
      <div className="glass-card border-ancient rounded-sm p-4 card-ancient">
        <div className="flex items-center gap-2 mb-3">
          <ChevronDownIcon className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tayyor Shablonlar</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {TEMPLATES.map(tpl => (
            <button
              key={tpl.label}
              onClick={() => applyTemplate(tpl)}
              className="text-left p-3 rounded-sm border border-border/40 hover:border-primary/40 hover:bg-primary/5 transition-all group"
            >
              <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">{tpl.label}</p>
              <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">{tpl.body}</p>
              <span className={`text-[9px] mt-1.5 inline-block px-1.5 py-0.5 rounded-sm border font-semibold ${typeColor(tpl.type)} bg-current/5 border-current/20`}>
                {TYPE_OPTIONS.find(o => o.value === tpl.type)?.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Compose card */}
      <div className="glass-card border-ancient rounded-sm p-5 card-ancient space-y-4">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary" />
          <h3 className="font-jiang-cheng text-foreground font-bold text-sm">Yangi Bildirishnoma</h3>
        </div>

        {/* Type selector */}
        <div className="flex flex-wrap gap-2">
          {TYPE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setForm(f => ({ ...f, type: opt.value }))}
              className={cn(
                'px-3 py-1.5 text-xs rounded-sm border transition-all',
                form.type === opt.value
                  ? 'bg-primary/15 border-primary/50 text-primary'
                  : 'border-border/40 text-muted-foreground hover:border-border/60 hover:text-foreground'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-normal text-muted-foreground">Sarlavha *</Label>
            <Input
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Bildirishnoma sarlavhasi..."
              className="bg-background/60 border-border/60 rounded-sm text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-normal text-muted-foreground">Havola (ixtiyoriy)</Label>
            <Input
              value={form.link}
              onChange={e => setForm(f => ({ ...f, link: e.target.value }))}
              placeholder="/tadbirlar yoki https://..."
              className="bg-background/60 border-border/60 rounded-sm text-sm"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-normal text-muted-foreground">Xabar matni *</Label>
          <textarea
            value={form.body}
            onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
            placeholder="A'zolarga yuboriladigan xabar..."
            rows={3}
            className="w-full bg-background/60 border border-border/60 rounded-sm text-sm px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none"
          />
        </div>

        {/* Recipient summary + send */}
        <div className="flex items-center justify-between flex-wrap gap-3 pt-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Send className="w-3.5 h-3.5 text-primary" />
            {selectedIds.size > 0
              ? <span><span className="text-primary font-semibold">{selectedIds.size}</span> ta tanlangan a&apos;zoga yuboriladi</span>
              : <span>Tanlash bo&apos;lmasa <span className="text-primary font-semibold">barcha {members.length}</span> a&apos;zoga yuboriladi</span>
            }
          </div>
          <Button
            onClick={handleSend}
            disabled={sending || !form.title.trim() || !form.body.trim()}
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm gap-2"
          >
            {sending ? (
              <><div className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />Yuborilmoqda...</>
            ) : (
              <><Send className="w-3.5 h-3.5" />Yuborish</>
            )}
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Members list for targeting */}
        <div className="glass-card border-ancient rounded-sm card-ancient overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              A&apos;zolar ({selectedIds.size > 0 ? `${selectedIds.size} tanlangan` : `Hammasi — ${members.length}`})
            </span>
            <button
              onClick={handleSelectAll}
              className="text-xs text-primary hover:text-primary/80 underline underline-offset-2"
            >
              {selectAll ? 'Bekor qilish' : 'Hammasini tanlash'}
            </button>
          </div>
          <div className="px-3 py-2 border-b border-border/30">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="A'zo qidirish..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="pl-8 h-8 text-xs bg-background/60 border-border/60 rounded-sm"
              />
            </div>
          </div>
          <div className="overflow-y-auto max-h-72">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="px-4 py-2.5 flex items-center gap-3">
                  <Skeleton className="w-4 h-4 bg-muted rounded-sm shrink-0" />
                  <Skeleton className="h-3 bg-muted rounded-sm flex-1" />
                </div>
              ))
              : filtered.map(m => (
                <button
                  key={m.id}
                  onClick={() => toggleSelect(m.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-accent/5',
                    selectedIds.has(m.id) && 'bg-primary/5'
                  )}
                >
                  <div className={cn(
                    'w-4 h-4 rounded-sm border flex items-center justify-center shrink-0 transition-colors',
                    selectedIds.has(m.id)
                      ? 'bg-primary border-primary'
                      : 'border-border/50 bg-background/60'
                  )}>
                    {selectedIds.has(m.id) && <CheckCircle2 className="w-2.5 h-2.5 text-primary-foreground" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-foreground truncate">{m.full_name || m.username || 'Nomsiz'}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{m.email}</p>
                  </div>
                  {m.role === 'admin' && (
                    <span className="text-[9px] px-1 py-0.5 bg-primary/15 text-primary rounded-sm font-semibold shrink-0">ADMIN</span>
                  )}
                </button>
              ))
            }
          </div>
        </div>

        {/* Send history */}
        <div className="glass-card border-ancient rounded-sm card-ancient overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Yuborilgan Tarix</span>
            <button onClick={loadHistory} className="text-muted-foreground hover:text-foreground transition-colors">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="overflow-y-auto max-h-80">
            {history.length === 0
              ? <div className="py-12 text-center text-muted-foreground text-xs">Hali yuborilmagan</div>
              : history.map(h => (
                <div key={h.id} className="px-4 py-3 border-b border-border/20 last:border-0 hover:bg-accent/5 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className={cn('text-[10px] font-semibold', typeColor(h.type))}>
                          {TYPE_OPTIONS.find(o => o.value === h.type)?.label || h.type}
                        </span>
                        <span className="text-[10px] text-muted-foreground/60">
                          {new Date(h.created_at).toLocaleDateString('uz-UZ')}
                        </span>
                      </div>
                      <p className="text-xs text-foreground font-medium truncate">{h.title}</p>
                      <p className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5">{h.body}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="flex items-center gap-1 text-[10px] text-primary">
                        <Send className="w-2.5 h-2.5" />
                        <span>{h.recipient_count}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══ LEADS SECTION ═══════════════════════════════════════════ */
type Lead = {
  id: string;
  email: string;
  created_at: string;
  source: string;
  unsubscribed_at: string | null;
  unsubscribe_token: string;
};

const SOURCE_LABELS: Record<string, string> = {
  hero_form: 'Hero Forma',
  manual:    "Qo'lda",
  import:    'Import',
};

function LeadsSection() {
  const [leads, setLeads]         = useState<Lead[]>([]);
  const [loading, setLoading]     = useState(true);
  const [query, setQuery]         = useState('');
  const [dateFrom, setDateFrom]   = useState('');
  const [dateTo, setDateTo]       = useState('');
  const [sourceFilter, setSource] = useState('all');
  const [statusFilter, setStatus] = useState<'all'|'active'|'unsubscribed'>('all');
  const [deleteId, setDeleteId]   = useState<string | null>(null);
  const [deleting, setDeleting]   = useState(false);
  const [selected, setSelected]   = useState<Set<string>>(new Set());
  const [page, setPage]           = useState(0);
  const PAGE_SIZE = 20;

  // CSV import state
  const [importing, setImporting]         = useState(false);
  const [importResult, setImportResult]   = useState<{ok:number;dup:number;err:number}|null>(null);

  // Campaign panel state
  const [showCampaign, setShowCampaign]     = useState(false);
  const [campaignSubject, setCampaignSubj]  = useState('');
  const [campaignBody, setCampaignBody]     = useState('');
  const [sending, setSending]               = useState(false);
  const [sentCount, setSentCount]           = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const all = await adminHeroLeads();
    let data = all as Lead[];
    if (dateFrom) data = data.filter(l => l.created_at >= dateFrom);
    if (dateTo) data = data.filter(l => l.created_at <= dateTo + 'T23:59:59');
    if (sourceFilter !== 'all') data = data.filter(l => l.source === sourceFilter);
    if (query) data = data.filter(l => l.email.toLowerCase().includes(query.toLowerCase()));
    const slice = data.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
    setLeads(slice);
    setSelected(new Set());
    setLoading(false);
  }, [page, dateFrom, dateTo, sourceFilter]);

  useEffect(() => { load(); }, [load]);

  const filtered = leads.filter(l => {
    if (query && !l.email.toLowerCase().includes(query.toLowerCase())) return false;
    if (statusFilter === 'active'       && l.unsubscribed_at)  return false;
    if (statusFilter === 'unsubscribed' && !l.unsubscribed_at) return false;
    return true;
  });

  const allSelected = filtered.length > 0 && filtered.every(l => selected.has(l.id));

  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(filtered.map(l => l.id)));
  };

  const toggle = (id: string) => {
    const s = new Set(selected);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelected(s);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    await adminDeleteHeroLead(deleteId);
    setDeleting(false);
    setDeleteId(null);
    toast.success("Email o'chirildi");
    load();
  };

  const handleCsvImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportResult(null);
    const text = await file.text();
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    // Skip header row if it contains "email" (case-insensitive)
    const dataLines = lines[0]?.toLowerCase().includes('email') ? lines.slice(1) : lines;
    // Extract emails: first column if CSV, or whole line
    const emails = dataLines.map(l => {
      const col = l.split(',')[0].trim().replace(/"/g, '');
      return col.toLowerCase();
    }).filter(e => /^[^@]+@[^@]+\.[^@]+$/.test(e));

    let ok = 0, dup = 0, err = 0;
    try {
      await adminImportHeroLeads(emails.map(email => ({ email })));
      ok = emails.length;
    } catch {
      err = emails.length;
    }
    setImporting(false);
    setImportResult({ ok, dup, err });
    if (ok > 0) { toast.success(`${ok} ta email import qilindi`); load(); }
    else toast.error("Hech qanday yangi email topilmadi");
    e.target.value = '';
  };

  const handleExportCSV = () => exportToCSV(
    filtered.map(l => ({
      Email:    l.email,
      Manba:    SOURCE_LABELS[l.source] ?? l.source,
      Sana:     new Date(l.created_at).toLocaleDateString('uz-UZ'),
      Holat:    l.unsubscribed_at ? 'Chiqgan' : 'Faol',
    })),
    'email-obunalar.csv'
  );

  const handleExportXLSX = () => exportToXLSX(
    filtered.map(l => ({
      Email:    l.email,
      Manba:    SOURCE_LABELS[l.source] ?? l.source,
      Sana:     new Date(l.created_at).toLocaleDateString('uz-UZ'),
      Holat:    l.unsubscribed_at ? 'Chiqgan' : 'Faol',
    })),
    'email-obunalar.xlsx'
  );

  const handleSendCampaign = async () => {
    if (!campaignSubject.trim() || !campaignBody.trim()) {
      toast.error("Mavzu va matn majburiy");
      return;
    }
    const targets = filtered.filter(l =>
      !l.unsubscribed_at && (selected.size === 0 || selected.has(l.id))
    );
    if (targets.length === 0) { toast.error("Faol obunachi topilmadi"); return; }
    setSending(true);
    let ok = 0;
    for (const lead of targets) {
      await sendEmail({
        type: 'campaign',
        to: lead.email,
        name: lead.email.split('@')[0],
        campaignSubject,
        campaignBody,
        unsubscribeToken: lead.unsubscribe_token,
        siteUrl: window.location.origin,
      });
      ok++;
    }
    setSending(false);
    setSentCount(ok);
    setCampaignSubj('');
    setCampaignBody('');
    toast.success(`${ok} ta obunchiga email yuborildi`);
  };

  const sources = ['all', ...Array.from(new Set(leads.map(l => l.source)))];

  return (
    <div className="space-y-5">
      {/* ── Header / Filters ── */}
      <div className="glass-card border-ancient rounded-sm p-4 card-ancient space-y-3">
        <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
          <div className="flex items-center gap-2 shrink-0">
            <Mail className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email Obunalar</span>
            <span className="text-xs px-2 py-0.5 bg-primary/15 text-primary border border-primary/20 rounded-sm font-semibold">
              {leads.length}{leads.length === PAGE_SIZE ? '+' : ''}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button onClick={handleExportCSV} variant="ghost"
              className="h-8 px-3 text-xs border border-border/50 text-muted-foreground hover:text-foreground rounded-sm gap-1.5">
              <Download className="w-3.5 h-3.5" />CSV
            </Button>
            <Button onClick={handleExportXLSX}
              className="h-8 px-3 text-xs bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm gap-1.5">
              <FileSpreadsheet className="w-3.5 h-3.5" />Excel
            </Button>
            <Button onClick={() => { setShowCampaign(v => !v); setSentCount(null); }}
              variant="ghost"
              className="h-8 px-3 text-xs border border-primary/40 text-primary hover:bg-primary/10 rounded-sm gap-1.5">
              <Send className="w-3.5 h-3.5" />
              {selected.size > 0 ? `${selected.size} taga` : 'Kampaniya'}
            </Button>
            <label className="cursor-pointer">
              <input type="file" accept=".csv,.txt" className="hidden" onChange={handleCsvImport} disabled={importing} />
              <span className={cn("inline-flex items-center gap-1.5 h-8 px-3 text-xs rounded-sm border transition-colors", importing ? "opacity-50 cursor-not-allowed border-border/40 text-muted-foreground" : "border-border/50 text-muted-foreground hover:text-foreground cursor-pointer")}>
                <UploadCloud className="w-3.5 h-3.5" />
                {importing ? 'Import...' : 'CSV Import'}
              </span>
            </label>
            <Button onClick={load} variant="ghost"
              className="h-8 w-8 p-0 border border-border/40 text-muted-foreground hover:text-foreground rounded-sm">
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Import result */}
        {importResult && (
          <div className="flex items-center gap-3 text-xs mt-1">
            <span className="text-primary">✓ {importResult.ok} ta yangi</span>
            {importResult.dup > 0 && <span className="text-muted-foreground">{importResult.dup} ta takror</span>}
            {importResult.err > 0 && <span className="text-destructive">{importResult.err} ta xatolik</span>}
            <Button variant="ghost" onClick={() => setImportResult(null)} className="h-5 w-5 p-0 text-muted-foreground/50 hover:text-muted-foreground rounded-sm ml-auto">
              <XCircle className="w-3 h-3" />
            </Button>
          </div>
        )}

        {/* Filter row */}
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Email qidirish..."
              className="pl-8 h-8 text-xs bg-background/60 border-border/60 rounded-sm w-44" />
          </div>
          <Input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(0); }}
            className="h-8 text-xs bg-background/60 border-border/60 rounded-sm w-36 px-2" />
          <Input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(0); }}
            className="h-8 text-xs bg-background/60 border-border/60 rounded-sm w-36 px-2" />
          <select value={sourceFilter} onChange={e => { setSource(e.target.value); setPage(0); }}
            className="h-8 text-xs bg-background/60 border border-border/60 rounded-sm px-2 text-foreground">
            {sources.map(s => (
              <option key={s} value={s}>{s === 'all' ? 'Barcha manbalar' : (SOURCE_LABELS[s] ?? s)}</option>
            ))}
          </select>
          <select value={statusFilter} onChange={e => setStatus(e.target.value as typeof statusFilter)}
            className="h-8 text-xs bg-background/60 border border-border/60 rounded-sm px-2 text-foreground">
            <option value="all">Barcha holat</option>
            <option value="active">Faol</option>
            <option value="unsubscribed">Chiqgan</option>
          </select>
          {(dateFrom || dateTo || sourceFilter !== 'all' || statusFilter !== 'all' || query) && (
            <Button variant="ghost" onClick={() => { setDateFrom(''); setDateTo(''); setSource('all'); setStatus('all'); setQuery(''); setPage(0); }}
              className="h-8 px-2 text-xs border border-border/40 text-muted-foreground hover:text-destructive rounded-sm gap-1">
              <XCircle className="w-3.5 h-3.5" />Tozalash
            </Button>
          )}
        </div>
      </div>

      {/* ── Campaign Panel ── */}
      {showCampaign && (
        <div className="glass-card border-ancient rounded-sm p-5 card-ancient space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">
                Kampaniya Email
              </span>
              <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-sm">
                {selected.size > 0
                  ? `${selected.size} tanlangan`
                  : `${filtered.filter(l => !l.unsubscribed_at).length} faol obunachi`}
              </span>
            </div>
            {sentCount !== null && (
              <span className="flex items-center gap-1.5 text-xs text-primary">
                <CheckCircle className="w-3.5 h-3.5" />
                {sentCount} ta yuborildi
              </span>
            )}
          </div>
          <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Email mavzusi *</label>
              <Input value={campaignSubject} onChange={e => setCampaignSubj(e.target.value)}
                placeholder="masalan: Yangi tadbir e'loni..."
                className="h-9 text-sm bg-background/60 border-border/60 rounded-sm" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Email matni *</label>
              <textarea value={campaignBody} onChange={e => setCampaignBody(e.target.value)}
                rows={5}
                placeholder="Email mazmunini yozing..."
                className="w-full text-sm bg-background/60 border border-border/60 rounded-sm px-3 py-2 text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:ring-1 focus:ring-primary/40" />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setShowCampaign(false)}
              className="h-9 px-4 text-sm border border-border/40 text-muted-foreground rounded-sm">
              Bekor
            </Button>
            <Button onClick={handleSendCampaign} disabled={sending}
              className="h-9 px-5 text-sm bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm gap-2 shadow-gold">
              {sending
                ? <><div className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />Yuborilmoqda...</>
                : <><Send className="w-3.5 h-3.5" />Yuborish</>
              }
            </Button>
          </div>
        </div>
      )}

      {/* ── Table ── */}
      <div className="glass-card border-ancient rounded-sm card-ancient overflow-hidden min-w-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/40 bg-background/30">
                <th className="w-10 px-4 py-3">
                  <input type="checkbox" checked={allSelected} onChange={toggleAll}
                    className="accent-primary w-3.5 h-3.5 cursor-pointer" />
                </th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">#</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Email</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Manba</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Holat</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Sana</th>
                <th className="text-right px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Amal</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/20">
                    <td className="px-4 py-3"><Skeleton className="h-3 w-4 bg-muted rounded-sm" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-3 w-5 bg-muted rounded-sm" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-3 w-48 bg-muted rounded-sm" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-3 w-20 bg-muted rounded-sm" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-3 w-14 bg-muted rounded-sm" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-3 w-24 bg-muted rounded-sm" /></td>
                    <td className="px-4 py-3" />
                  </tr>
                ))
                : filtered.length === 0
                  ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-16 text-center text-muted-foreground text-xs">
                        Hech qanday obuna topilmadi
                      </td>
                    </tr>
                  )
                  : filtered.map((l, i) => (
                    <tr key={l.id}
                      className={`border-b border-border/20 hover:bg-accent/5 transition-colors group ${l.unsubscribed_at ? 'opacity-50' : ''}`}>
                      <td className="px-4 py-3">
                        <input type="checkbox" checked={selected.has(l.id)} onChange={() => toggle(l.id)}
                          className="accent-primary w-3.5 h-3.5 cursor-pointer" />
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                        {page * PAGE_SIZE + i + 1}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-sm bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                            <Mail className="w-3.5 h-3.5 text-primary" />
                          </div>
                          <span className="text-xs text-foreground font-medium">{l.email}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-[10px] px-2 py-0.5 bg-background/40 border border-border/30 rounded-sm text-muted-foreground">
                          {SOURCE_LABELS[l.source] ?? l.source}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {l.unsubscribed_at
                          ? <span className="text-[10px] px-2 py-0.5 bg-destructive/10 border border-destructive/20 rounded-sm text-destructive">Chiqgan</span>
                          : <span className="text-[10px] px-2 py-0.5 bg-primary/10 border border-primary/20 rounded-sm text-primary">Faol</span>
                        }
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(l.created_at).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <Button variant="ghost" onClick={() => setDeleteId(l.id)}
                          className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-sm">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {!loading && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border/30 bg-background/20">
            <span className="text-[11px] text-muted-foreground">
              {filtered.length} ta natija
              {selected.size > 0 && <> &nbsp;·&nbsp; <span className="text-primary">{selected.size} tanlangan</span></>}
            </span>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                className="h-7 px-3 text-xs border border-border/40 text-muted-foreground rounded-sm disabled:opacity-30">
                Oldingi
              </Button>
              <span className="text-xs text-muted-foreground px-1">{page + 1}</span>
              <Button variant="ghost" onClick={() => setPage(p => p + 1)} disabled={leads.length < PAGE_SIZE}
                className="h-7 px-3 text-xs border border-border/40 text-muted-foreground rounded-sm disabled:opacity-30">
                Keyingi
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={o => !o && setDeleteId(null)}>
        <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg bg-navy border-ancient rounded-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-jiang-cheng text-foreground">Emailni O&apos;chirish</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Bu email obunadan butunlay o&apos;chiriladi. Bu amalni qaytarib bo&apos;lmaydi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border border-border/40 text-muted-foreground rounded-sm bg-transparent">Bekor</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-sm">
              {deleting ? "O'chirilmoqda..." : "O'chirish"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ══ CAMPAIGNS SECTION ════════════════════════════════════════ */
type Campaign = {
  id: string;
  subject: string;
  body: string;
  scheduled_at: string;
  status: 'scheduled' | 'sending' | 'sent' | 'failed' | 'cancelled';
  target_source: string;
  sent_count: number;
  fail_count: number;
  created_at: string;
  open_count?: number;
  click_count?: number;
};

const STATUS_COLORS: Record<string, string> = {
  scheduled:  'bg-blue-500/10 border-blue-500/30 text-blue-400',
  sending:    'bg-amber-500/10 border-amber-500/30 text-amber-400',
  sent:       'bg-primary/10 border-primary/30 text-primary',
  failed:     'bg-destructive/10 border-destructive/30 text-destructive',
  cancelled:  'bg-muted/30 border-border/30 text-muted-foreground',
};
const STATUS_LABELS: Record<string, string> = {
  scheduled: 'Rejalashtirilgan',
  sending:   'Yuborilmoqda',
  sent:      'Yuborildi',
  failed:    'Xatolik',
  cancelled: "Bekor qilindi",
};

function CampaignsSection() {
  const [campaigns, setCampaigns]       = useState<Campaign[]>([]);
  const [loading, setLoading]           = useState(true);
  const [showForm, setShowForm]         = useState(false);
  const [cancelId, setCancelId]         = useState<string | null>(null);
  const [cancelling, setCancelling]     = useState(false);
  const [selected, setSelected]         = useState<Campaign | null>(null);

  // Form state
  const [subject, setSubject]     = useState('');
  const [body, setBody]           = useState('');
  const [schedDate, setSchedDate] = useState('');
  const [schedTime, setSchedTime] = useState('');
  const [targetSrc, setTargetSrc] = useState('all');
  const [saving, setSaving]       = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const camps = await adminCampaigns();
    setCampaigns(camps as Campaign[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const id = window.setInterval(load, 30000);
    return () => window.clearInterval(id);
  }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !body.trim() || !schedDate || !schedTime) {
      toast.error("Barcha maydonlar to'ldirilishi shart");
      return;
    }
    setSaving(true);
    const scheduledAt = new Date(`${schedDate}T${schedTime}`).toISOString();
    try {
      await adminCreateCampaign({
        subject: subject.trim(),
        body: body.trim(),
        scheduled_at: scheduledAt,
        target_source: targetSrc,
      });
    } catch (e) {
      setSaving(false);
      toast.error("Xatolik: " + (e instanceof Error ? e.message : 'xatolik'));
      return;
    }
    setSaving(false);
    toast.success("Kampaniya rejalashtirildi");
    setShowForm(false);
    setSubject(''); setBody(''); setSchedDate(''); setSchedTime(''); setTargetSrc('all');
    load();
  };

  const handleCancel = async () => {
    if (!cancelId) return;
    setCancelling(true);
    await adminCancelCampaign(cancelId);
    setCancelling(false);
    setCancelId(null);
    toast.success("Kampaniya bekor qilindi");
    load();
  };

  // Summary stats
  const totalSent   = campaigns.reduce((s, c) => s + (c.sent_count || 0), 0);
  const totalOpens  = campaigns.reduce((s, c) => s + (c.open_count  || 0), 0);
  const totalClicks = campaigns.reduce((s, c) => s + (c.click_count || 0), 0);
  const avgOpenRate = totalSent > 0 ? Math.round((totalOpens  / totalSent) * 100) : 0;
  // const avgClickRate= totalSent > 0 ? Math.round((totalClicks / totalSent) * 100) : 0;

  return (
    <div className="space-y-5">
      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Jami Yuborilgan', value: totalSent,    icon: <Send className="w-4 h-4" /> },
          { label: 'Ochilgan',        value: totalOpens,   icon: <Eye className="w-4 h-4" /> },
          { label: 'Bosilgan',        value: totalClicks,  icon: <MousePointer className="w-4 h-4" /> },
          { label: 'Open Rate',       value: `${avgOpenRate}%`, icon: <BarChart2 className="w-4 h-4" /> },
          // { label: 'Click Rate',      value: `${avgClickRate}%`, icon: <MousePointer className="w-4 h-4" /> },
        ].map(s => (
          <div key={s.label} className="glass-card border-ancient rounded-sm p-4 card-ancient space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{s.label}</span>
              <span className="text-primary">{s.icon}</span>
            </div>
            <div className="font-jiang-cheng text-2xl font-bold text-foreground">{s.value}</div>
          </div>
        ))}
      </div>

      {/* ── Header ── */}
      <div className="glass-card border-ancient rounded-sm p-4 card-ancient">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email Kampaniyalar</span>
            <span className="text-xs px-2 py-0.5 bg-primary/15 text-primary border border-primary/20 rounded-sm font-semibold">
              {campaigns.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={load} variant="ghost"
              className="h-8 w-8 p-0 border border-border/40 text-muted-foreground hover:text-foreground rounded-sm">
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
            <Button onClick={() => setShowForm(v => !v)}
              className="h-8 px-4 text-xs bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm gap-1.5">
              <CalendarClock className="w-3.5 h-3.5" />
              Yangi Kampaniya
            </Button>
          </div>
        </div>
      </div>

      {/* ── Create Form ── */}
      {showForm && (
        <div className="glass-card border-ancient rounded-sm p-5 card-ancient space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <CalendarClock className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Kampaniya Rejalashtirish</span>
          </div>
          <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label className="text-xs text-muted-foreground mb-1 block">Email mavzusi *</Label>
                <Input value={subject} onChange={e => setSubject(e.target.value)}
                  placeholder="masalan: Iyun oyidagi yangiliklar..." required
                  className="h-9 text-sm bg-background/60 border-border/60 rounded-sm" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Yuborish sanasi *</Label>
                <Input type="date" value={schedDate} onChange={e => setSchedDate(e.target.value)} required
                  className="h-9 text-sm bg-background/60 border-border/60 rounded-sm px-3" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Yuborish vaqti *</Label>
                <Input type="time" value={schedTime} onChange={e => setSchedTime(e.target.value)} required
                  className="h-9 text-sm bg-background/60 border-border/60 rounded-sm px-3" />
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
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Email matni *</Label>
              <textarea value={body} onChange={e => setBody(e.target.value)} rows={6} required
                placeholder="Email mazmunini yozing..."
                className="w-full text-sm bg-background/60 border border-border/60 rounded-sm px-3 py-2 text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:ring-1 focus:ring-primary/40" />
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}
                className="h-9 px-4 text-sm border border-border/40 text-muted-foreground rounded-sm">Bekor</Button>
              <Button type="submit" disabled={saving}
                className="h-9 px-5 text-sm bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm gap-2 shadow-gold">
                {saving
                  ? <><div className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />Saqlanmoqda...</>
                  : <><CalendarClock className="w-3.5 h-3.5" />Rejalashtirish</>
                }
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* ── Campaign Detail Modal ── */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-dark/80 backdrop-blur-sm"
          onClick={() => setSelected(null)}>
          <div className="relative bg-navy-card border border-primary/20 rounded-sm p-6 max-w-lg w-full space-y-4 shadow-2xl"
            onClick={e => e.stopPropagation()}>
            <div className="h-[3px] absolute top-0 left-0 right-0 bg-gradient-to-r from-transparent via-primary to-transparent rounded-t-sm" />
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Kampaniya Tafsilotlari</div>
                <h3 className="font-jiang-cheng text-lg font-bold text-foreground text-balance">{selected.subject}</h3>
              </div>
              <span className={`shrink-0 text-[10px] px-2 py-1 rounded-sm border ${STATUS_COLORS[selected.status]}`}>
                {STATUS_LABELS[selected.status]}
              </span>
            </div>
            <div className="h-px bg-primary/15" />
            <div className="grid grid-cols-3 gap-3">
              {[
                { l: 'Yuborilgan', v: selected.sent_count, icon: <Send className="w-3.5 h-3.5" /> },
                { l: 'Ochilgan',   v: selected.open_count  ?? 0, icon: <Eye className="w-3.5 h-3.5" /> },
                { l: 'Bosilgan',   v: selected.click_count ?? 0, icon: <MousePointer className="w-3.5 h-3.5" /> },
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
            <div className="bg-background/20 border border-border/20 rounded-sm p-3 space-y-1">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Email Matni</div>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line line-clamp-6">{selected.body}</p>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Rejasi: <span className="text-foreground">{new Date(selected.scheduled_at).toLocaleString('uz-UZ')}</span></span>
              <span>Guruh: <span className="text-foreground">{selected.target_source === 'all' ? 'Barchasi' : selected.target_source}</span></span>
            </div>
            <Button onClick={() => setSelected(null)}
              variant="ghost" className="w-full h-9 bg-primary/10 border border-primary/25 text-foreground/70 hover:bg-primary/20 rounded-sm text-sm">
              Yopish
            </Button>
          </div>
        </div>
      )}

      {/* ── Campaigns Table ── */}
      <div className="glass-card border-ancient rounded-sm card-ancient overflow-hidden min-w-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/40 bg-background/30">
                {['Mavzu', 'Holat', 'Rejasi', "Guruh", 'Yuborilgan', 'Ochilgan', 'Bosilgan', 'Amal'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/20">
                    {Array.from({ length: 8 }).map((__, j) => (
                      <td key={j} className="px-4 py-3"><Skeleton className="h-3 w-20 bg-muted rounded-sm" /></td>
                    ))}
                  </tr>
                ))
                : campaigns.length === 0
                  ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-16 text-center text-muted-foreground text-xs">
                        Hali hech qanday kampaniya yo&apos;q
                      </td>
                    </tr>
                  )
                  : campaigns.map(c => {
                    const openPct  = c.sent_count > 0 ? Math.round(((c.open_count  ?? 0) / c.sent_count) * 100) : 0;
                    const clickPct = c.sent_count > 0 ? Math.round(((c.click_count ?? 0) / c.sent_count) * 100) : 0;
                    return (
                      <tr key={c.id} className="border-b border-border/20 hover:bg-accent/5 transition-colors group cursor-pointer"
                        onClick={() => setSelected(c)}>
                        <td className="px-4 py-3 whitespace-nowrap max-w-[200px]">
                          <span className="text-xs text-foreground font-medium truncate block">{c.subject}</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`text-[10px] px-2 py-0.5 rounded-sm border ${STATUS_COLORS[c.status]}`}>
                            {STATUS_LABELS[c.status]}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground">
                          {new Date(c.scheduled_at).toLocaleString('uz-UZ', { dateStyle: 'short', timeStyle: 'short' })}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-[10px] px-2 py-0.5 bg-background/40 border border-border/30 rounded-sm text-muted-foreground">
                            {c.target_source === 'all' ? 'Barchasi' : c.target_source}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-xs text-foreground text-center">{c.sent_count}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-foreground">{c.open_count ?? 0}</span>
                            {c.sent_count > 0 && <span className="text-[10px] text-primary/70">{openPct}%</span>}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-foreground">{c.click_count ?? 0}</span>
                            {c.sent_count > 0 && <span className="text-[10px] text-primary/70">{clickPct}%</span>}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right" onClick={e => e.stopPropagation()}>
                          {c.status === 'scheduled' && (
                            <Button variant="ghost" onClick={() => setCancelId(c.id)}
                              className="h-7 px-2 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-sm gap-1">
                              <XCircle className="w-3.5 h-3.5" />Bekor
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })
              }
            </tbody>
          </table>
        </div>
      </div>

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
              {cancelling ? "Bekor qilinmoqda..." : "Ha, Bekor Qilish"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ── NEWS (SUPER ADMIN) ── */
function NewsAdminSection() {
  const [items, setItems] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminListNews();
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const review = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await adminReviewNews({ id, status });
      toast.success(status === 'approved' ? "Tasdiqlandi" : "Rad etildi");
      load();
    } catch {
      toast.error("Amal bajarilmadi");
    }
  };

  const del = async (id: string) => {
    try {
      await adminDeleteNews(id);
      toast.success("O'chirildi");
      load();
    } catch {
      toast.error("O'chirishda xatolik");
    }
  };

  if (loading) return <Skeleton className="h-40 bg-muted rounded-sm" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="text-sm text-muted-foreground">
          Jami: <span className="text-foreground font-semibold">{items.length}</span>
        </div>
        <Button onClick={load} variant="ghost" size="sm" className="border border-border/40 text-muted-foreground hover:text-foreground rounded-sm">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {(items ?? []).length === 0 ? (
        <div className="glass-card border-ancient rounded-sm p-10 text-center card-ancient space-y-2">
          <Newspaper className="w-10 h-10 text-primary/30 mx-auto" />
          <p className="text-muted-foreground text-sm">Yangiliklar yo'q</p>
        </div>
      ) : (
        <div className="glass-card border-ancient rounded-sm overflow-hidden card-ancient">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  {['Sarlavha', 'Kategoriya', 'Holat', 'Sana', 'Amal'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {items.map(n => (
                  <tr key={n.id} className="hover:bg-accent/5 transition-colors">
                    <td className="px-4 py-3 text-sm text-foreground min-w-[320px]">
                      <div className="font-semibold">{n.title}</div>
                      {n.excerpt && <div className="text-xs text-muted-foreground line-clamp-1">{n.excerpt}</div>}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{n.category}</td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap">
                      <span className={cn(
                        'px-2 py-0.5 rounded-sm border',
                        n.status === 'approved'
                          ? 'text-green-400 bg-green-400/10 border-green-400/20'
                          : n.status === 'rejected'
                            ? 'text-destructive bg-destructive/10 border-destructive/20'
                            : 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
                      )}>{n.status}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{new Date(n.created_at).toLocaleDateString('uz-UZ')}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        {n.status === 'pending' && (
                          <>
                            <Button onClick={() => review(n.id, 'approved')} variant="ghost" size="sm" className="h-7 px-2 text-green-400 hover:bg-green-400/10 rounded-sm text-xs">Approve</Button>
                            <Button onClick={() => review(n.id, 'rejected')} variant="ghost" size="sm" className="h-7 px-2 text-destructive hover:bg-destructive/10 rounded-sm text-xs">Reject</Button>
                          </>
                        )}
                        <Button onClick={() => del(n.id)} variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-sm"><Trash2 className="w-3.5 h-3.5" /></Button>
                      </div>
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

/* ── PLANS (SUPER ADMIN) ── */
function PlansAdminSection() {
  const [plans, setPlans] = useState<MembershipPlanRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ slug: 'starter', name: 'Starter', price_usd: '99', features: '[]' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMembershipPlans();
      setPlans(Array.isArray(data) ? data : []);
    } catch {
      setPlans([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const submit = async () => {
    setSaving(true);
    try {
      const feats = JSON.parse(form.features || '[]');
      await adminUpsertPlan({
        slug: form.slug.trim(),
        name: form.name.trim(),
        price_usd: Number(form.price_usd || 0),
        features: Array.isArray(feats) ? feats.map(String) : [],
      });
      toast.success("Reja saqlandi");
      await load();
    } catch {
      toast.error("Reja saqlanmadi (features JSON bo'lsin)");
    } finally {
      setSaving(false);
    }
  };

  const del = async (slug: string) => {
    try {
      await adminDeletePlan(slug);
      toast.success("O'chirildi");
      load();
    } catch {
      toast.error("O'chirishda xatolik");
    }
  };

  if (loading) return <Skeleton className="h-40 bg-muted rounded-sm" />;

  return (
    <div className="space-y-4">
      <div className="glass-card border-ancient rounded-sm p-4 card-ancient space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-normal text-muted-foreground">Slug</Label>
            <Input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} className="bg-background/60 border-border/60 rounded-sm text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-normal text-muted-foreground">Nomi</Label>
            <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="bg-background/60 border-border/60 rounded-sm text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-normal text-muted-foreground">Narx (USD)</Label>
            <Input value={form.price_usd} onChange={e => setForm(f => ({ ...f, price_usd: e.target.value }))} className="bg-background/60 border-border/60 rounded-sm text-sm" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-normal text-muted-foreground">Features (JSON array)</Label>
          <textarea
            value={form.features}
            onChange={e => setForm(f => ({ ...f, features: e.target.value }))}
            rows={4}
            className="w-full px-3 py-2 bg-background/60 border border-border/60 rounded-sm text-sm text-foreground placeholder-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button onClick={load} variant="ghost" size="sm" className="border border-border/40 text-muted-foreground hover:text-foreground rounded-sm">
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button onClick={submit} disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm">
            {saving ? 'Saqlanmoqda...' : "Saqlash"}
          </Button>
        </div>
      </div>

      {(plans ?? []).length === 0 ? (
        <div className="glass-card border-ancient rounded-sm p-10 text-center card-ancient space-y-2">
          <CreditCard className="w-10 h-10 text-primary/30 mx-auto" />
          <p className="text-muted-foreground text-sm">Rejalar yo'q</p>
        </div>
      ) : (
        <div className="glass-card border-ancient rounded-sm overflow-hidden card-ancient">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  {['Slug', 'Nomi', 'Narx', 'Amal'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {plans.map(p => (
                  <tr key={String(p.slug)} className="hover:bg-accent/5 transition-colors">
                    <td className="px-4 py-3 text-sm text-foreground whitespace-nowrap">{p.slug}</td>
                    <td className="px-4 py-3 text-sm text-foreground whitespace-nowrap">{p.name}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">${p.price_usd}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Button
                          onClick={() => setForm({ slug: String(p.slug), name: p.name, price_usd: String(p.price_usd), features: JSON.stringify(p.features ?? [], null, 2) })}
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-sm"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button onClick={() => del(String(p.slug))} variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-sm">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
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
