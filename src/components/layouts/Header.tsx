import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Phone, Mail, User, LayoutDashboard, LogOut, Shield, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useLang, type Lang } from '@/contexts/LangContext';
import Logo from '@/components/common/Logo';
import { SITE } from '@/config/site';

const NAV_HREFS = [
  { key: 'home', href: '/' },
  { key: 'about', href: '/biz-haqimizda' },
  { key: 'services', href: '/xizmatlar' },
  { key: 'membership', href: '/azolik' },
  { key: 'directory', href: '/katalog' },
  { key: 'events', href: '/tadbirlar' },
  { key: 'news', href: '/yangiliklar' },
  { key: 'contact', href: '/aloqa' },
] as const;

const LANGS: { code: Lang; label: string }[] = [
  { code: 'uz', label: "O'Z" },
  { code: 'ru', label: 'RU' },
  { code: 'en', label: 'EN' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, isAdmin, isSuperAdmin, signOut } = useAuth();
  const { lang, setLang, t } = useLang();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const isActive = (href: string) =>
    href === '/' ? location.pathname === '/' : location.pathname.startsWith(href);

  const handleSignOut = async () => {
    setUserMenuOpen(false);
    setMobileOpen(false);
    await signOut();
    navigate('/');
  };

  const displayName = profile?.full_name || profile?.username || profile?.email?.split('@')[0] || t('member');

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full">
      {/* Top bar */}
      <div className="bg-navy-dark border-b border-border/50 h-10 hidden md:flex items-center">
        <div className="max-w-7xl mx-auto w-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <a href={`tel:${SITE.phoneTel}`} className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors text-xs">
              <Phone className="w-3 h-3 text-primary" />
              <span>{SITE.phone}</span>
            </a>
            <a href={`mailto:${SITE.email}`} className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors text-xs">
              <Mail className="w-3 h-3 text-primary" />
              <span>{SITE.email}</span>
            </a>
          </div>
          <div className="flex items-center gap-3">
            {/* Language switcher */}
            <div className="flex items-center gap-1 border border-border/40 rounded-sm px-1 py-0.5">
              <Globe className="w-3 h-3 text-primary mr-0.5" />
              {LANGS.map(l => (
                <button
                  key={l.code}
                  onClick={() => setLang(l.code)}
                  className={cn(
                    'text-[10px] px-1.5 py-0.5 rounded-sm transition-colors font-semibold tracking-wider',
                    lang === l.code
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main navbar */}
      <div className={cn(
        'transition-all duration-300',
        scrolled
          ? 'bg-navy/95 backdrop-blur-md shadow-deep border-b border-border/50'
          : 'bg-navy/80 backdrop-blur-sm'
      )}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Logo showText={false} size="header" />

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_HREFS.map(({ key, href }) => (
              <Link
                key={href}
                to={href}
                className={cn(
                  'px-3 py-2 text-sm rounded-sm transition-all duration-200',
                  'hover:text-primary hover:bg-accent/50',
                  isActive(href)
                    ? 'text-primary bg-accent/30'
                    : 'text-muted-foreground'
                )}
              >
                {t(key as Parameters<typeof t>[0])}
              </Link>
            ))}
          </nav>

          {/* Auth + CTA + Mobile */}
          <div className="flex items-center gap-2">
            {user ? (
              <div className="relative hidden md:block" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(v => !v)}
                  className="flex items-center gap-2 h-9 px-3 rounded-sm border border-border/50 text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-accent/30 transition-colors"
                >
                  <div className="w-6 h-6 rounded-sm bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                    <User className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="max-w-[100px] truncate">{displayName}</span>
                  {isAdmin && (
                    <span className="px-1 py-0.5 bg-primary/20 text-primary text-[9px] rounded-sm font-semibold shrink-0">
                      {isSuperAdmin ? 'SUPER' : 'ADMIN'}
                    </span>
                  )}
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-44 glass-card border border-border/60 rounded-sm shadow-deep z-50 overflow-hidden">
                    <Link to="/dashboard" onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2.5 text-xs text-muted-foreground hover:text-primary hover:bg-accent/30 transition-colors">
                      <LayoutDashboard className="w-3.5 h-3.5" /> {t('dashboard')}
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2.5 text-xs text-primary hover:bg-primary/10 transition-colors border-t border-border/40">
                        <Shield className="w-3.5 h-3.5" /> {t('admin')}
                      </Link>
                    )}
                    <button type="button" onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors border-t border-border/40">
                      <LogOut className="w-3.5 h-3.5" /> {t('logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/kirish" className="text-sm text-muted-foreground hover:text-foreground transition-colors px-2">
                  {t('login')}
                </Link>
                <Link to="/qoshilish">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90 hover-gold-glow text-sm px-5 rounded-sm h-9">
                    {t('join')}
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon"
                  className="lg:hidden border border-border/60 text-foreground hover:bg-accent">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" showCloseButton={false} className="bg-sidebar w-72 border-l border-border p-0">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between p-5 border-b border-border">
                    <Logo linkTo={false} showText={false} size="header" />
                    <SheetClose asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-foreground shrink-0"
                        aria-label="Menyuni yopish"
                      >
                        <X className="w-5 h-5" />
                      </Button>
                    </SheetClose>
                  </div>

                  {/* Mobile language switcher */}
                  <div className="px-4 py-2 border-b border-border/40 flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-primary" />
                    <div className="flex gap-1">
                      {LANGS.map(l => (
                        <button
                          key={l.code}
                          onClick={() => setLang(l.code)}
                          className={cn(
                            'text-xs px-2 py-1 rounded-sm transition-colors font-semibold',
                            lang === l.code
                              ? 'bg-primary text-primary-foreground'
                              : 'text-muted-foreground hover:text-foreground'
                          )}
                        >
                          {l.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {user && (
                    <div className="px-4 py-3 border-b border-border/50 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-sm bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-foreground font-medium truncate">{displayName}</p>
                        {isAdmin && (
                          <span className="text-[10px] text-primary font-semibold tracking-wider">ADMIN</span>
                        )}
                      </div>
                    </div>
                  )}

                  <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {NAV_HREFS.map(({ key, href }) => (
                      <Link
                        key={href}
                        to={href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          'flex items-center px-4 py-3 text-sm rounded-sm transition-all',
                          'hover:text-primary hover:bg-sidebar-accent',
                          isActive(href)
                            ? 'text-primary bg-sidebar-accent'
                            : 'text-sidebar-foreground'
                        )}
                      >
                        {t(key as Parameters<typeof t>[0])}
                      </Link>
                    ))}
                    {user && (
                      <>
                        <div className="h-px bg-border/40 my-2" />
                        <Link to="/dashboard" onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-2 px-4 py-3 text-sm rounded-sm text-sidebar-foreground hover:text-primary hover:bg-sidebar-accent transition-all">
                          <LayoutDashboard className="w-4 h-4" /> {t('dashboard')}
                        </Link>
                        {isAdmin && (
                          <Link to="/admin" onClick={() => setMobileOpen(false)}
                            className="flex items-center gap-2 px-4 py-3 text-sm rounded-sm text-primary hover:bg-sidebar-accent transition-all">
                            <Shield className="w-4 h-4" /> {t('admin')}
                          </Link>
                        )}
                      </>
                    )}
                  </nav>

                  <div className="p-4 border-t border-border space-y-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Phone className="w-3 h-3 text-primary" />
                      <span>{SITE.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Mail className="w-3 h-3 text-primary" />
                      <span>{SITE.email}</span>
                    </div>
                    {user ? (
                      <Button onClick={handleSignOut} variant="ghost"
                        className="w-full border border-destructive/30 text-destructive hover:bg-destructive/10 rounded-sm text-sm">
                        <LogOut className="w-4 h-4 mr-2" /> {t('logout')}
                      </Button>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <Link to="/kirish" onClick={() => setMobileOpen(false)}>
                          <Button variant="ghost"
                            className="w-full border border-border text-muted-foreground rounded-sm text-sm">
                            {t('login')}
                          </Button>
                        </Link>
                        <Link to="/qoshilish" onClick={() => setMobileOpen(false)}>
                          <Button className="w-full bg-primary text-primary-foreground rounded-sm text-sm">
                            {t('join').toUpperCase()}
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
