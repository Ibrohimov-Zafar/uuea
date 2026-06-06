import { useState, useEffect, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { adminMembershipApplications } from '@/api/client';
import { cn } from '@/lib/utils';

type App = {
  id: string;
  order_id: string;
  plan_slug: string;
  resident_type: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  mobile?: string | null;
  company_name?: string | null;
  country?: string | null;
  state?: string | null;
  city: string;
  street: string;
  zip?: string | null;
  status: string;
  created_at: string;
};

export default function MembershipApplicationsSection() {
  const [rows, setRows] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await adminMembershipApplications();
    setRows(data as unknown as App[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          A&apos;zolik arizalari (to&apos;lov oldi ma&apos;lumotlar)
        </span>
        <Button onClick={load} variant="ghost" size="sm" className="text-muted-foreground hover:text-primary rounded-sm">
          <RefreshCw className="w-3.5 h-3.5 mr-1" /> Yangilash
        </Button>
      </div>
      {loading ? (
        <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full rounded-sm" />)}</div>
      ) : rows.length === 0 ? (
        <div className="glass-card border-ancient rounded-sm p-10 text-center text-muted-foreground text-sm">
          Hali arizalar yo&apos;q
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map(a => (
            <div key={a.id} className="glass-card border-ancient rounded-sm p-4">
              <button
                type="button"
                className="w-full text-left"
                onClick={() => setExpanded(expanded === a.id ? null : a.id)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground font-medium">
                      {a.first_name} {a.last_name}
                      <span className="text-muted-foreground font-normal"> · {a.email}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {a.plan_slug.toUpperCase()} · {a.resident_type === 'uz' ? 'UZ rezident' : 'Xalqaro'}
                      {' · '}{new Date(a.created_at).toLocaleString('uz-UZ')}
                    </p>
                  </div>
                  <span className={cn(
                    'text-[10px] px-2 py-0.5 rounded-sm border shrink-0',
                    a.status === 'paid'
                      ? 'text-green-400 bg-green-400/10 border-green-400/20'
                      : 'text-amber-400 bg-amber-400/10 border-amber-400/20'
                  )}>
                    {a.status === 'paid' ? "To'langan" : 'Kutilmoqda'}
                  </span>
                </div>
              </button>
              {expanded === a.id && (
                <div className="mt-3 pt-3 border-t border-border/40 text-xs text-muted-foreground space-y-1">
                  <p><span className="text-foreground/80">Telefon:</span> {a.phone}{a.mobile ? ` / ${a.mobile}` : ''}</p>
                  {a.company_name && <p><span className="text-foreground/80">Kompaniya:</span> {a.company_name}</p>}
                  <p>
                    <span className="text-foreground/80">Manzil:</span>{' '}
                    {[a.street, a.city, a.state, a.country, a.zip].filter(Boolean).join(', ')}
                  </p>
                  <p className="text-[10px] opacity-70">Order: {a.order_id}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
