import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import { useLang } from '@/contexts/LangContext';

export default function Footer() {
  const { t } = useLang();

  const quickLinks = [
    { label: t('home'), href: '/' },
    { label: t('about'), href: '/biz-haqimizda' },
    { label: t('services'), href: '/xizmatlar' },
    { label: t('membership'), href: '/azolik' },
    { label: t('events'), href: '/tadbirlar' },
  ];

  const serviceLinks = [
    { label: t('svcGrowth'), href: '/xizmatlar' },
    { label: t('svcSupport'), href: '/xizmatlar' },
    { label: t('svcProtection'), href: '/xizmatlar' },
    { label: t('svcNetwork'), href: '/xizmatlar' },
    { label: t('svcCatalog'), href: '/katalog' },
  ];

  return (
    <footer className="bg-navy-dark border-t border-border/50">
      <div className="section-divider" />

      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-sm border border-primary/50 flex items-center justify-center bg-primary/10">
                <span className="text-primary font-jiang-cheng text-sm font-bold">BC</span>
              </div>
              <div>
                <div className="font-jiang-cheng text-foreground text-sm font-bold leading-tight tracking-wide">BIZNES CHAMBER</div>
                <div className="text-primary text-[10px] tracking-widest uppercase">{t('footerTagline')}</div>
              </div>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed text-pretty">
              {t('footerDesc')}
            </p>
            <div className="flex items-center gap-3">
              {[
                { icon: <Facebook className="w-4 h-4" />, href: '#' },
                { icon: <Twitter className="w-4 h-4" />, href: '#' },
                { icon: <Linkedin className="w-4 h-4" />, href: '#' },
                { icon: <Instagram className="w-4 h-4" />, href: '#' },
              ].map((s, i) => (
                <a
                  key={i}
                  href={s.href}
                  className="w-8 h-8 rounded-sm border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-all"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <h4 className="font-jiang-cheng text-foreground text-sm font-semibold tracking-wider uppercase after:block after:w-8 after:h-0.5 after:bg-primary after:mt-2">
              {t('quickLinks')}
            </h4>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
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
                <a href="tel:+998712000000" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  +998 71 200-00-00
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <a href="mailto:info@chamber.uz" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  info@chamber.uz
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
