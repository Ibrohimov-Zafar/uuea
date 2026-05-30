import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import { useLang } from '@/contexts/LangContext';
import Logo from '@/components/common/Logo';
import { SITE } from '@/config/site';

export default function Footer() {
  const { t } = useLang();

  const quickLinks = [
    { label: t('home'), href: '/' },
    { label: t('about'), href: '/biz-haqimizda' },
    { label: t('services'), href: '/xizmatlar' },
    { label: t('membership'), href: '/azolik' },
    { label: t('directory'), href: '/katalog' },
    { label: t('events'), href: '/tadbirlar' },
    { label: t('news'), href: '/yangiliklar' },
    { label: t('contact'), href: '/aloqa' },
  ];

  const serviceLinks = [
    { label: t('svcGrowth'), href: '/xizmatlar' },
    { label: t('svcSupport'), href: '/xizmatlar' },
    { label: t('svcProtection'), href: '/xizmatlar' },
    { label: t('svcNetwork'), href: '/xizmatlar' },
    { label: t('svcCatalog'), href: '/katalog' },
  ];

  const socialLinks = [
    { icon: <Facebook className="w-4 h-4" />, href: SITE.social.facebook },
    { icon: <Twitter className="w-4 h-4" />, href: SITE.social.twitter },
    { icon: <Linkedin className="w-4 h-4" />, href: SITE.social.linkedin },
    { icon: <Instagram className="w-4 h-4" />, href: SITE.social.instagram },
  ].filter(s => s.href);

  return (
    <footer className="bg-navy-dark border-t border-border/50">
      <div className="section-divider" />

      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="space-y-5">
            <Logo linkTo="/" showText={false} size="lg" />
            <p className="text-muted-foreground text-sm leading-relaxed text-pretty">
              {t('footerDesc')}
            </p>
            {socialLinks.length > 0 && (
              <div className="flex items-center gap-3">
                {socialLinks.map((s, i) => (
                  <a
                    key={i}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-sm border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-all"
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-5">
            <h4 className="font-jiang-cheng text-foreground text-sm font-semibold tracking-wider uppercase after:block after:w-8 after:h-0.5 after:bg-primary after:mt-2">
              {t('quickLinks')}
            </h4>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-5">
            <h4 className="font-jiang-cheng text-foreground text-sm font-semibold tracking-wider uppercase after:block after:w-8 after:h-0.5 after:bg-primary after:mt-2">
              {t('footerServices')}
            </h4>
            <ul className="space-y-2.5">
              {serviceLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-5">
            <h4 className="font-jiang-cheng text-foreground text-sm font-semibold tracking-wider uppercase after:block after:w-8 after:h-0.5 after:bg-primary after:mt-2">
              {t('footerContact')}
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span className="text-sm text-muted-foreground leading-relaxed">
                  {t('footerAddress')}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <a href={`tel:${SITE.phoneTel}`} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {SITE.phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <a href={`tel:${SITE.phoneUzTel}`} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {SITE.phoneUz}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <a href={`mailto:${SITE.email}`} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {SITE.email}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-border/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            {t('copyright', { year: new Date().getFullYear() })}
          </p>
          <div className="flex items-center gap-4">
            <Link to="#" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              {t('privacy')}
            </Link>
            <span className="text-border">|</span>
            <Link to="#" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              {t('terms')}
            </Link>
            <span className="text-border">|</span>
            <Link to="#" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              {t('accessibility')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
