import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle } from 'lucide-react';
import Layout from '@/components/layouts/Layout';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { useLang } from '@/contexts/LangContext';
import { getMembershipPlans } from '@/api/client';
import { faqItems } from '@/data/mockData';
import type { MembershipPlanRow } from '@/types/types';

export default function MembershipPage() {
  const { t } = useLang();
  const [selected, setSelected] = useState('business');
  const [plans, setPlans] = useState<MembershipPlanRow[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

  useEffect(() => {
    getMembershipPlans()
      .then((data) => {
        if (data.length > 0) setPlans(data);
        setLoadingPlans(false);
      })
      .catch(() => setLoadingPlans(false));
  }, []);

  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-24 bg-navy-dark bg-sacred-geometry overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-navy/60 to-navy-dark" />
        <div className="relative max-w-7xl mx-auto px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-sm border border-primary/30 bg-primary/5 text-primary text-xs tracking-widest uppercase">
            {t('membershipBadge')}
          </div>
          <h1 className="font-jiang-cheng text-4xl md:text-5xl font-bold text-foreground text-balance">
            {t('membershipTitle')}
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
            {t('membershipSub')}
          </p>
        </div>
      </section>

      {/* Plans */}
      <section className="py-20 bg-background bg-sacred-geometry">
        <div className="max-w-7xl mx-auto px-6">
          {loadingPlans ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-80 bg-muted rounded-sm" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {plans.map((plan) => (
                <div
                  key={plan.slug}
                  onClick={() => setSelected(plan.slug)}
                  className={cn(
                    "glass-card rounded-sm p-7 space-y-5 flex flex-col h-full cursor-pointer transition-all relative",
                    selected === plan.slug
                      ? "border border-primary shadow-gold"
                      : "border border-border/60 hover:border-primary/40"
                  )}
                >
                  {plan.slug === 'business' && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 vip-badge text-[10px] px-4">Mashhur</div>
                  )}
                  <div>
                    <h3 className="font-jiang-cheng text-foreground text-xl font-bold">{plan.name}</h3>
                    <div className="flex items-baseline gap-1 mt-3">
                      <span className="text-primary font-jiang-cheng text-4xl font-bold">${plan.price_usd}</span>
                      <span className="text-muted-foreground text-xs">/yil</span>
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
                  <Link to={`/qoshilish?plan=${plan.slug}`} className="mt-auto">
                    <Button
                      className={cn(
                        "w-full rounded-sm text-sm",
                        selected === plan.slug
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "bg-accent hover:bg-primary/10 text-foreground border border-border hover:border-primary/40 hover:text-primary"
                      )}
                    >
                      Tanlash
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-navy-light border-y border-border/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-4 mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-sm border border-primary/30 bg-primary/5 text-primary text-xs tracking-widest uppercase">
              Imtiyozlar
            </div>
            <h2 className="font-jiang-cheng text-2xl md:text-3xl font-bold text-foreground text-balance">
              A'zolik Imtiyozlari
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Biznes Katalogda VIP Ro'yxat", desc: "Kompaniyangizni premium pozitsiyada ko'rsating va yangi mijozlar jalb qiling." },
              { title: "Ekskluziv Tadbirlarga Kirish", rejaga: "A'zolik rejangizga mos tadbirlar va forumlar kirish imkoniyati." , desc: "A'zolik rejangizga mos tadbirlar va forumlar kirish imkoniyati." },
              { title: "Professional Maslahatlar", desc: "Huquqiy, moliyaviy va marketing bo'yicha ekspert maslahatlari." },
              { title: "Tarmoqlash Imkoniyatlari", desc: "Oylik biznes uchrashuvlari va networking tadbirlari." },
              { title: "Marketing Ko'magi", desc: "UUEA platformasida reklama va PR imkoniyatlari." },
              { title: "Hamkorlik Tarmog'i", desc: "2500+ a'zo bilan to'g'ridan-to'g'ri aloqa va hamkorlik." },
            ].map((item) => (
              <div key={item.title} className="glass-card border-ancient rounded-sm p-6 space-y-3 hover-gold-glow card-ancient">
                <div className="w-2 h-6 bg-primary rounded-sm" />
                <h4 className="font-jiang-cheng text-foreground font-bold text-sm text-balance">{item.title}</h4>
                <p className="text-muted-foreground text-xs leading-relaxed text-pretty">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-background bg-sacred-geometry">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center space-y-4 mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-sm border border-primary/30 bg-primary/5 text-primary text-xs tracking-widest uppercase">
              FAQ
            </div>
            <h2 className="font-jiang-cheng text-2xl md:text-3xl font-bold text-foreground text-balance">
              Tez-Tez So'raladigan Savollar
            </h2>
          </div>
          <Accordion type="single" collapsible className="space-y-3">
            {faqItems.map((item, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="glass-card border-ancient rounded-sm px-5 border border-border/60 hover:border-primary/40 transition-colors"
              >
                <AccordionTrigger className="font-jiang-cheng text-foreground text-sm font-semibold py-4 hover:no-underline hover:text-primary [&[data-state=open]]:text-primary">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4 text-pretty">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-navy-dark border-t border-border/50">
        <div className="max-w-3xl mx-auto px-6 text-center space-y-6">
          <h2 className="font-jiang-cheng text-2xl md:text-3xl font-bold text-foreground text-balance">
            Bugun A'zolikni Boshlang
          </h2>
          <p className="text-muted-foreground text-pretty">
            Savolaringiz bormi? Jamoamiz bilan bog'laning yoki to'g'ridan-to'g'ri a'zolikka qo'shiling.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/qoshilish">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 hover-gold-glow rounded-sm px-10">
                A'zolikga Qo'shilish
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to="/aloqa">
              <Button size="lg" variant="ghost" className="border border-primary/40 text-primary hover:bg-primary/10 rounded-sm px-10">
                Savol Berish
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
