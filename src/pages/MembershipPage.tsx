import { Link } from 'react-router-dom';
import { ArrowRight, User } from 'lucide-react';
import Layout from '@/components/layouts/Layout';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import PlanGrid from '@/components/membership/PlanGrid';
import { INDIVIDUAL_PLAN_SLUGS } from '@/config/membership';
import { useLang } from '@/contexts/LangContext';
import { faqItems } from '@/data/mockData';

export default function MembershipPage() {
  const { t } = useLang();

  return (
    <Layout>
      <section className="relative py-24 bg-navy-dark bg-sacred-geometry overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-navy/60 to-navy-dark" />
        <div className="relative max-w-7xl mx-auto px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-sm border border-primary/30 bg-primary/5 text-primary text-xs tracking-widest uppercase">
            <User className="w-3.5 h-3.5" />
            {t('membershipIndividualBadge')}
          </div>
          <h1 className="font-jiang-cheng text-4xl md:text-5xl font-bold text-foreground text-balance">
            {t('membershipIndividualTitle')}
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
            {t('membershipIndividualSub')}
          </p>
        </div>
      </section>

      <section className="py-20 bg-background bg-sacred-geometry">
        <div className="max-w-7xl mx-auto px-6">
          <PlanGrid
            slugs={INDIVIDUAL_PLAN_SLUGS}
            defaultSelected="business"
            popularSlug="business"
            columns="two"
          />
        </div>
      </section>

      <section className="py-20 bg-navy-light border-y border-border/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-4 mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-sm border border-primary/30 bg-primary/5 text-primary text-xs tracking-widest uppercase">
              Imtiyozlar
            </div>
            <h2 className="font-jiang-cheng text-2xl md:text-3xl font-bold text-foreground text-balance">
              {t('membershipBenefitsTitle')}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Biznes Katalogda Ro'yxat", desc: "Kompaniyangizni katalogda ko'rsating va yangi hamkorlar toping." },
              { title: 'Tadbirlar va Networking', desc: "A'zolik rejangizga mos tadbirlar va forumlar kirish imkoniyati." },
              { title: 'Professional Maslahatlar', desc: "Huquqiy, moliyaviy va marketing bo'yicha yo'naltirish." },
              { title: 'Tarmoqlash', desc: 'Oylik uchrashuvlar va AQSh–O\'zbekiston biznes aloqalari.' },
              { title: 'Newsletter va Yangiliklar', desc: 'Sohaviy yangiliklar va imkoniyatlar haqida xabarnoma.' },
              { title: "A'zo Forumi", desc: "Tadbirkorlar bilan onlayn va oflayn muloqot." },
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

      <section className="py-14 bg-background">
        <div className="max-w-3xl mx-auto px-6 text-center space-y-4">
          <p className="text-muted-foreground text-sm">{t('corporateSwitchHint')}</p>
          <Link to="/korporativ">
            <Button variant="ghost" className="border border-primary/40 text-primary hover:bg-primary/10 rounded-sm">
              {t('corporateMembershipLink')}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <section className="py-20 bg-background bg-sacred-geometry">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center space-y-4 mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-sm border border-primary/30 bg-primary/5 text-primary text-xs tracking-widest uppercase">
              FAQ
            </div>
            <h2 className="font-jiang-cheng text-2xl md:text-3xl font-bold text-foreground text-balance">
              Tez-Tez So&apos;raladigan Savollar
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

      <section className="py-16 bg-navy-dark border-t border-border/50">
        <div className="max-w-3xl mx-auto px-6 text-center space-y-6">
          <h2 className="font-jiang-cheng text-2xl md:text-3xl font-bold text-foreground text-balance">
            {t('membershipCtaTitle')}
          </h2>
          <p className="text-muted-foreground text-pretty">{t('membershipCtaSub')}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/qoshilish">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 hover-gold-glow rounded-sm px-10">
                {t('heroCta')}
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
