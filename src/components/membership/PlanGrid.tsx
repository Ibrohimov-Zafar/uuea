import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { getMembershipPlans } from '@/api/client';
import type { MembershipPlanRow } from '@/types/types';
import { useLang } from '@/contexts/LangContext';

type PlanGridProps = {
  slugs: readonly string[];
  defaultSelected?: string;
  popularSlug?: string;
  columns?: 'two' | 'four';
};

export default function PlanGrid({
  slugs,
  defaultSelected,
  popularSlug = 'business',
  columns = 'four',
}: PlanGridProps) {
  const { t } = useLang();
  const [selected, setSelected] = useState(defaultSelected ?? slugs[0] ?? '');
  const [plans, setPlans] = useState<MembershipPlanRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMembershipPlans()
      .then((data) => {
        const filtered = data.filter((p) => slugs.includes(p.slug));
        setPlans(filtered);
        if (filtered.length > 0 && !filtered.some((p) => p.slug === selected)) {
          setSelected(filtered[0].slug);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slugs, selected]);

  const colClass =
    columns === 'two'
      ? 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto'
      : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';

  if (loading) {
    return (
      <div className={cn('grid gap-6', colClass)}>
        {Array.from({ length: slugs.length }).map((_, i) => (
          <Skeleton key={i} className="h-80 bg-muted rounded-sm" />
        ))}
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <p className="text-center text-muted-foreground text-sm py-12">
        {t('plansSoon')}
      </p>
    );
  }

  return (
    <div className={cn('grid gap-6', colClass)}>
      {plans.map((plan) => (
        <div
          key={plan.slug}
          onClick={() => setSelected(plan.slug)}
          className={cn(
            'glass-card rounded-sm p-7 space-y-5 flex flex-col h-full cursor-pointer transition-all relative',
            selected === plan.slug
              ? 'border border-primary shadow-gold'
              : 'border border-border/60 hover:border-primary/40'
          )}
        >
          {plan.slug === popularSlug && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 vip-badge text-[10px] px-4">
              {t('popularPlan')}
            </div>
          )}
          <div>
            <h3 className="font-jiang-cheng text-foreground text-xl font-bold">{plan.name}</h3>
            <div className="flex items-baseline gap-1 mt-3">
              <span className="text-primary font-jiang-cheng text-4xl font-bold">${plan.price_usd}</span>
              <span className="text-muted-foreground text-xs">{t('perYear')}</span>
            </div>
          </div>
          <div className="section-divider" />
          <ul className="space-y-3 flex-1">
            {(Array.isArray(plan.features) ? plan.features : []).map((f: string) => (
              <li key={f} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <Link to={`/qoshilish?plan=${plan.slug}`} className="mt-auto" onClick={(e) => e.stopPropagation()}>
            <Button
              className={cn(
                'w-full rounded-sm text-sm',
                selected === plan.slug
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'bg-accent hover:bg-primary/10 text-foreground border border-border hover:border-primary/40 hover:text-primary'
              )}
            >
              {t('selectPlan')}
            </Button>
          </Link>
        </div>
      ))}
    </div>
  );
}
