import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Award, Target, Eye, Heart } from 'lucide-react';
import Layout from '@/components/layouts/Layout';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getTeamMembers, getTimelineEvents, getPartners, getSiteAbout, getSiteMission } from '@/api/client';
import { useLang } from '@/contexts/LangContext';
import { localizedField } from '@/i18n/locale';
import PageHeroBanner, { PageHeroBadge, PageHeroSub, PageHeroTitle } from '@/components/common/PageHeroBanner';
import { PAGE_HERO_IMAGES } from '@/config/pageHeroImages';
import type { TeamMember, TimelineEvent, Partner, SiteAbout, SiteMission } from '@/types/types';

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

const MISSION_ICON_MAP = {
  Target,
  Eye,
  Heart,
} as const;

function missionIcon(name: string) {
  const Icon = MISSION_ICON_MAP[name as keyof typeof MISSION_ICON_MAP] ?? Target;
  return <Icon className="w-7 h-7" />;
}

export default function WhoWeArePage() {
  const { t, lang } = useLang();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamLoading, setTeamLoading] = useState(true);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [timelineLoading, setTimelineLoading] = useState(true);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [partnersLoading, setPartnersLoading] = useState(true);
  const [about, setAbout] = useState<SiteAbout | null>(null);
  const [aboutLoading, setAboutLoading] = useState(true);
  const [mission, setMission] = useState<SiteMission | null>(null);
  const [missionLoading, setMissionLoading] = useState(true);

  useEffect(() => {
    getTeamMembers()
      .then(setTeamMembers)
      .catch(() => setTeamMembers([]))
      .finally(() => setTeamLoading(false));
  }, []);

  useEffect(() => {
    getTimelineEvents()
      .then(setTimeline)
      .catch(() => setTimeline([]))
      .finally(() => setTimelineLoading(false));
  }, []);

  useEffect(() => {
    getPartners()
      .then(setPartners)
      .catch(() => setPartners([]))
      .finally(() => setPartnersLoading(false));
  }, []);

  useEffect(() => {
    getSiteAbout()
      .then(setAbout)
      .catch(() => setAbout(null))
      .finally(() => setAboutLoading(false));
  }, []);

  useEffect(() => {
    getSiteMission()
      .then(setMission)
      .catch(() => setMission(null))
      .finally(() => setMissionLoading(false));
  }, []);

  const aboutStats = about?.stats?.length
    ? [...about.stats].sort((a, b) => a.sort_order - b.sort_order).map((s) => ({
        n: s.value,
        l: localizedField(s.label, s.label_ru, s.label_en, lang),
      }))
    : [
        { n: '2500+', l: t('aboutStatMemberBiz') },
        { n: '50+', l: t('aboutStatAnnualEvents') },
        { n: '15+', l: t('aboutStatYearsExp') },
        { n: '10+', l: t('aboutStatPartners') },
      ];

  return (
    <Layout>
      <PageHeroBanner image={PAGE_HERO_IMAGES.about}>
        <PageHeroBadge>{t('aboutBadge')}</PageHeroBadge>
        <PageHeroTitle>{t('aboutTitle')}</PageHeroTitle>
        <PageHeroSub>{t('aboutSub')}</PageHeroSub>
      </PageHeroBanner>

      {/* About */}
      <section className="py-20 bg-background bg-sacred-geometry">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              {aboutLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-10 w-full max-w-md" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <div className="grid grid-cols-2 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-sm" />)}
                  </div>
                </div>
              ) : (
              <>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-sm border border-primary/30 bg-primary/5 text-primary text-xs tracking-widest uppercase">
                {about ? localizedField(about.badge, about.badge_ru, about.badge_en, lang) : t('aboutOrgBadge')}
              </div>
              <h2 className="font-jiang-cheng text-2xl md:text-3xl font-bold text-foreground text-balance">
                {about ? localizedField(about.title, about.title_ru, about.title_en, lang) : t('aboutOrgTitle')}
              </h2>
              <p className="text-muted-foreground leading-relaxed text-pretty">
                {about ? localizedField(about.para1, about.para1_ru, about.para1_en, lang) : t('aboutOrgPara1')}
              </p>
              <p className="text-muted-foreground leading-relaxed text-pretty">
                {about ? localizedField(about.para2, about.para2_ru, about.para2_en, lang) : t('aboutOrgPara2')}
              </p>
              <div className="grid grid-cols-2 gap-4">
                {aboutStats.map((s) => (
                  <div key={s.l} className="glass-card border-ancient rounded-sm p-4 text-center">
                    <div className="font-jiang-cheng text-2xl font-bold text-gold-gradient">{s.n}</div>
                    <div className="text-muted-foreground text-xs mt-1">{s.l}</div>
                  </div>
                ))}
              </div>
              </>
              )}
            </div>
            <div className="relative">
              <div className="aspect-[4/3] rounded-sm overflow-hidden border border-primary/20 shadow-deep">
                {aboutLoading ? (
                  <Skeleton className="w-full h-full" />
                ) : (
                <>
                <img
                  src={about?.image_url || '/h.png'}
                  alt={about ? localizedField(about.title, about.title_ru, about.title_en, lang) : t('aboutOrgTitle')}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/50 to-transparent" />
                </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      {(missionLoading || mission) && (
      <section className="py-20 bg-navy-light border-y border-border/50">
        <div className="max-w-7xl mx-auto px-6">
          {missionLoading ? (
            <div className="space-y-8">
              <Skeleton className="h-10 w-64 mx-auto" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-56 rounded-sm" />
                ))}
              </div>
            </div>
          ) : mission && (
          <>
          <SectionHeading
            subtitle={localizedField(mission.badge, mission.badge_ru, mission.badge_en, lang)}
            title={localizedField(mission.title, mission.title_ru, mission.title_en, lang)}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...mission.cards].sort((a, b) => a.sort_order - b.sort_order).map((card) => (
              <div key={card.sort_order} className="glass-card border-ancient rounded-sm p-8 space-y-4 hover-gold-glow card-ancient">
                <div className="w-14 h-14 bg-primary/10 border border-primary/20 rounded-sm flex items-center justify-center text-primary">
                  {missionIcon(card.icon)}
                </div>
                <h3 className="font-jiang-cheng text-foreground font-bold text-lg md:text-xl">
                  {localizedField(card.title, card.title_ru, card.title_en, lang)}
                </h3>
                <p className="text-muted-foreground text-base md:text-lg leading-relaxed text-pretty">
                  {localizedField(card.text, card.text_ru, card.text_en, lang)}
                </p>
              </div>
            ))}
          </div>
          </>
          )}
        </div>
      </section>
      )}

      {/* Leadership */}
      <section className="py-20 bg-background bg-sacred-geometry">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeading subtitle={t('leadershipBadge')} title={t('leadershipTitle')} description={t('leadershipDesc')} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="glass-card border-ancient rounded-sm p-6 space-y-4">
                  <div className="flex items-center gap-4">
                    <Skeleton className="w-14 h-14 rounded-sm" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                  <Skeleton className="h-12 w-full" />
                </div>
              ))
              : teamMembers.map((member) => (
              <div key={member.id} className="glass-card border-ancient rounded-sm p-6 space-y-4 hover-gold-glow card-ancient">
                <div className="flex items-center gap-4">
                  {member.photo_url ? (
                    <img src={member.photo_url} alt={member.name} className="w-14 h-14 rounded-sm object-cover border border-primary/25 shrink-0" />
                  ) : (
                    <div className="w-14 h-14 bg-primary/15 border border-primary/25 rounded-sm flex items-center justify-center font-jiang-cheng text-primary font-bold text-lg shrink-0">
                      {member.avatar || member.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h4 className="font-jiang-cheng text-foreground font-bold text-sm truncate">{member.name}</h4>
                    <div className="text-primary text-xs">{localizedField(member.role, member.role_ru, member.role_en, lang)}</div>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed text-pretty">{localizedField(member.bio, member.bio_ru, member.bio_en, lang)}</p>
                {member.linkedin && member.linkedin !== '#' && (
                  <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline">
                    <Award className="w-3 h-3" />
                    LinkedIn
                  </a>
                )}
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
              {timelineLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className={`flex items-center gap-8 ${i % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                    <div className={`flex-1 ${i % 2 === 0 ? 'text-right' : 'text-left'}`}>
                      <Skeleton className="h-20 w-64 inline-block rounded-sm" />
                    </div>
                    <Skeleton className="shrink-0 w-12 h-12 rounded-sm" />
                    <div className="flex-1" />
                  </div>
                ))
                : timeline.map((item, i) => (
                <div key={item.id} className={`flex items-center gap-8 ${i % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className={`flex-1 ${i % 2 === 0 ? 'text-right' : 'text-left'}`}>
                    <div className="glass-card border-ancient rounded-sm p-5 hover-gold-glow inline-block max-w-xs">
                      <h4 className="font-jiang-cheng text-foreground font-bold text-sm">{localizedField(item.title, item.title_ru, item.title_en, lang)}</h4>
                      <p className="text-muted-foreground text-xs mt-1 leading-relaxed">{localizedField(item.description, item.description_ru, item.description_en, lang)}</p>
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {partnersLoading
              ? Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-sm" />
              ))
              : partners.map((p) => {
                const name = localizedField(p.name, p.name_ru, p.name_en, lang);
                const desc = localizedField(p.description, p.description_ru, p.description_en, lang);
                const CardInner = (
                  <>
                    <div className="h-10 flex items-center justify-center mb-2">
                      {p.logo_url
                        ? <img src={p.logo_url} alt={name} className="max-h-8 max-w-full object-contain" />
                        : <span className="font-semibold tracking-wide">{name}</span>
                      }
                    </div>
                    {p.logo_url && <div className="text-sm font-semibold text-foreground truncate">{name}</div>}
                    {desc && <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{desc}</p>}
                  </>
                );
                return p.website ? (
                  <a key={p.id} href={p.website} target="_blank" rel="noopener noreferrer"
                    className="glass-card border-ancient rounded-sm p-4 text-center hover-gold-glow hover:border-primary/40 transition-all card-ancient">
                    {CardInner}
                  </a>
                ) : (
                  <div key={p.id} className="glass-card border-ancient rounded-sm p-4 text-center card-ancient">
                    {CardInner}
                  </div>
                );
              })}
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
