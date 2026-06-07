import { Link } from 'react-router-dom';
import { ArrowRight, Award, Target, Eye, Heart } from 'lucide-react';
import Layout from '@/components/layouts/Layout';
import { Button } from '@/components/ui/button';
import { teamMembers, timeline, partners } from '@/data/mockData';
import { useLang } from '@/contexts/LangContext';

function SectionHeading({ subtitle, title, description }: { subtitle: string; title: string; description?: string }) {
  return (
    <div className="text-center space-y-4 mb-12">
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-sm border border-primary/30 bg-primary/5 text-primary text-xs tracking-widest uppercase">
        {subtitle}
      </div>
      <h2 className="font-jiang-cheng text-2xl md:text-4xl font-bold text-foreground text-balance">{title}</h2>
      {description && <p className="text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">{description}</p>}
    </div>
  );
}

function lf(uz: string, ru: string, en: string, lang: string): string {
  if (lang === 'ru' && ru) return ru;
  if (lang === 'en' && en) return en;
  return uz || '';
}

export default function WhoWeArePage() {
  const { t, lang } = useLang();
  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-24 bg-navy-dark bg-sacred-geometry overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-navy/60 to-navy-dark" />
        <div className="relative max-w-7xl mx-auto px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-sm border border-primary/30 bg-primary/5 text-primary text-xs tracking-widest uppercase">
            {t('aboutBadge')}
          </div>
          <h1 className="font-jiang-cheng text-4xl md:text-5xl font-bold text-foreground text-balance">
            {t('aboutTitle')}
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
            {t('aboutSub')}
          </p>
        </div>
      </section>

      {/* About */}
      <section className="py-20 bg-background bg-sacred-geometry">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-sm border border-primary/30 bg-primary/5 text-primary text-xs tracking-widest uppercase">
                {t('aboutOrgBadge')}
              </div>
              <h2 className="font-jiang-cheng text-2xl md:text-3xl font-bold text-foreground text-balance">
                {t('aboutOrgTitle')}
              </h2>
              <p className="text-muted-foreground leading-relaxed text-pretty">
                {t('aboutOrgPara1')}
              </p>
              <p className="text-muted-foreground leading-relaxed text-pretty">
                {t('aboutOrgPara2')}
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { n: "2500+", l: t('aboutStatMemberBiz') },
                  { n: "50+",   l: t('aboutStatAnnualEvents') },
                  { n: "15+",   l: t('aboutStatYearsExp') },
                  { n: "10+",   l: t('aboutStatPartners') },
                ].map((s) => (
                  <div key={s.l} className="glass-card border-ancient rounded-sm p-4 text-center">
                    <div className="font-jiang-cheng text-2xl font-bold text-gold-gradient">{s.n}</div>
                    <div className="text-muted-foreground text-xs mt-1">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] rounded-sm overflow-hidden border border-primary/20 shadow-deep">
                <img src="/h.png" alt="Assotsiatsiya jamoasi" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/50 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-navy-light border-y border-border/50">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeading subtitle={t('missionBadge')} title={t('missionTitle')} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <Target className="w-7 h-7" />,
                title: t('missionLabel'),
                text: t('missionText'),
              },
              {
                icon: <Eye className="w-7 h-7" />,
                title: t('visionLabel'),
                text: t('visionText'),
              },
              {
                icon: <Heart className="w-7 h-7" />,
                title: t('valuesLabel'),
                text: t('valuesText'),
              },
            ].map((item) => (
              <div key={item.title} className="glass-card border-ancient rounded-sm p-8 space-y-4 hover-gold-glow card-ancient">
                <div className="w-14 h-14 bg-primary/10 border border-primary/20 rounded-sm flex items-center justify-center text-primary">
                  {item.icon}
                </div>
                <h3 className="font-jiang-cheng text-foreground font-bold text-base">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed text-pretty">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="py-20 bg-background bg-sacred-geometry">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeading subtitle={t('leadershipBadge')} title={t('leadershipTitle')} description={t('leadershipDesc')} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamMembers.map((member) => (
              <div key={member.id} className="glass-card border-ancient rounded-sm p-6 space-y-4 hover-gold-glow card-ancient">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-primary/15 border border-primary/25 rounded-sm flex items-center justify-center font-jiang-cheng text-primary font-bold text-lg shrink-0">
                    {member.avatar}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-jiang-cheng text-foreground font-bold text-sm truncate">{member.name}</h4>
                    <div className="text-primary text-xs">{member.role}</div>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed text-pretty">{member.bio}</p>
                <a href={member.linkedin} className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline">
                  <Award className="w-3 h-3" />
                  LinkedIn
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-navy-light border-y border-border/50">
        <div className="max-w-4xl mx-auto px-6">
          <SectionHeading subtitle={t('historyBadge')} title={t('historyTitle')} />
          <div className="relative">
            <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/10 via-primary/40 to-primary/10" />
            <div className="space-y-10">
              {timeline.map((item, i) => (
                <div key={item.year} className={`flex items-center gap-8 ${i % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className={`flex-1 ${i % 2 === 0 ? 'text-right' : 'text-left'}`}>
                    <div className="glass-card border-ancient rounded-sm p-5 hover-gold-glow inline-block max-w-xs">
                      <h4 className="font-jiang-cheng text-foreground font-bold text-sm">{lf(item.title, item.title_ru ?? '', item.title_en ?? '', lang)}</h4>
                      <p className="text-muted-foreground text-xs mt-1 leading-relaxed">{lf(item.description, item.description_ru ?? '', item.description_en ?? '', lang)}</p>
                    </div>
                  </div>
                  <div className="shrink-0 w-12 h-12 bg-primary/15 border-2 border-primary/50 rounded-sm flex items-center justify-center font-jiang-cheng text-primary text-xs font-bold z-10">
                    {item.year}
                  </div>
                  <div className="flex-1" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="py-20 bg-background bg-sacred-geometry">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeading subtitle={t('partnersBadge')} title={t('partnersTitle')} />
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {partners.map((p) => (
              <div key={p.name} className="glass-card border-ancient rounded-sm h-14 flex items-center justify-center text-sm text-muted-foreground hover:text-primary hover:border-primary/40 transition-all font-semibold tracking-wide">
                {p.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-navy-dark border-t border-border/50">
        <div className="max-w-3xl mx-auto px-6 text-center space-y-6">
          <h2 className="font-jiang-cheng text-2xl md:text-3xl font-bold text-foreground text-balance">
            {t('joinTeamTitle')}
          </h2>
          <p className="text-muted-foreground text-pretty leading-relaxed">
            {t('joinTeamDesc')}
          </p>
          <Link to="/qoshilish">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 hover-gold-glow rounded-sm px-10">
              {t('joinMembershipBtn')}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
}
