import { Link } from 'react-router-dom';
import { ArrowRight, Building2 } from 'lucide-react';
import Layout from '@/components/layouts/Layout';
import { Button } from '@/components/ui/button';
import PlanGrid from '@/components/membership/PlanGrid';
import { CORPORATE_PLAN_SLUGS } from '@/config/membership';
import { useLang } from '@/contexts/LangContext';

export default function CorporateMembershipPage() {
  const { t } = useLang();

  return (
    <Layout>
      <section className="relative py-24 bg-navy-dark bg-sacred-geometry overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-navy/60 to-navy-dark" />
        <div className="relative max-w-7xl mx-auto px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-sm border border-primary/30 bg-primary/5 text-primary text-xs tracking-widest uppercase">
            <Building2 className="w-3.5 h-3.5" />
            {t('corporateBadge')}
          </div>
          <h1 className="font-jiang-cheng text-4xl md:text-5xl font-bold text-foreground text-balance">
            {t('corporateTitle')}
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
            {t('corporateSub')}
          </p>
        </div>
      </section>

      <section className="py-20 bg-background bg-sacred-geometry">
        <div className="max-w-7xl mx-auto px-6">
          <PlanGrid
            slugs={CORPORATE_PLAN_SLUGS}
            defaultSelected="corporate"
            popularSlug="corporate"
            columns="two"
          />
        </div>
      </section>

      <section className="py-16 bg-navy-light border-y border-border/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {([
              { title: t('corpBenefit1Title'), desc: t('corpBenefit1Desc') },
              { title: t('corpBenefit2Title'), desc: t('corpBenefit2Desc') },
              { title: t('corpBenefit3Title'), desc: t('corpBenefit3Desc') },
            ] as { title: string; desc: string }[]).map((item) => (
              <div key={item.title} className="glass-card border-ancient rounded-sm p-6 space-y-2 hover-gold-glow">
                <div className="w-2 h-6 bg-primary rounded-sm" />
                <h4 className="font-jiang-cheng text-foreground font-bold text-sm">{item.title}</h4>
                <p className="text-muted-foreground text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 bg-background">
        <div className="max-w-3xl mx-auto px-6 text-center space-y-4">
          <p className="text-muted-foreground text-sm">{t('membershipSwitchHint')}</p>
          <Link to="/azolik">
            <Button variant="ghost" className="border border-primary/40 text-primary hover:bg-primary/10 rounded-sm">
              {t('membershipIndividualLink')}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <section className="py-16 bg-navy-dark border-t border-border/50">
        <div className="max-w-3xl mx-auto px-6 text-center space-y-6">
          <h2 className="font-jiang-cheng text-2xl md:text-3xl font-bold text-foreground text-balance">
            {t('corporateCtaTitle')}
          </h2>
          <p className="text-muted-foreground text-pretty">{t('corporateCtaSub')}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/qoshilish?plan=corporate">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 hover-gold-glow rounded-sm px-10">
                {t('corporateCtaJoin')}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to="/aloqa">
              <Button size="lg" variant="ghost" className="border border-primary/40 text-primary hover:bg-primary/10 rounded-sm px-10">
                {t('corporateCtaContact')}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
