import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, LogIn, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useLang } from '@/contexts/LangContext';
import { toast } from 'sonner';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading, signInWithUsername, isAdmin } = useAuth();
  const { t } = useLang();
  const from = (location.state as { from?: string })?.from || '/dashboard';

  useEffect(() => {
    if (!authLoading && user) {
      if (isAdmin) navigate('/admin', { replace: true });
      else navigate(from, { replace: true });
    }
  }, [authLoading, user, isAdmin, from, navigate]);

  const [form, setForm] = useState({ identifier: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  if (authLoading || user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-navy-dark">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.identifier.trim() || !form.password) {
      toast.error(t('fillAllFields'));
      return;
    }
    setLoading(true);
    const { error } = await signInWithUsername(form.identifier.trim(), form.password);
    setLoading(false);
    if (error) {
      const code = (error as { code?: string })?.code;
      if (code === 'over_email_send_rate_limit') {
        toast.error(t('rateLimit'));
      } else {
        toast.error(t('loginError'));
      }
    } else {
      toast.success(t('loginSuccess'));
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-navy-dark bg-sacred-geometry flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-navy/80 via-navy-dark to-navy pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8 space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 border border-primary/30 rounded-sm mx-auto">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-jiang-cheng text-2xl md:text-3xl font-bold text-foreground text-balance">
            Biznes <span className="text-gold-gradient">Assotsiatsiya</span>
          </h1>
          <p className="text-muted-foreground text-sm">{t('authPortal')}</p>
        </div>

        <div className="glass-card border-ancient rounded-sm p-8 card-ancient space-y-6">
          <div className="space-y-1">
            <h2 className="font-jiang-cheng text-foreground text-xl font-bold text-balance">{t('signInTitle')}</h2>
            <p className="text-muted-foreground text-sm text-pretty">{t('signInSub')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="identifier" className="text-sm font-normal text-muted-foreground">{t('usernameOrEmail')}</Label>
              <Input
                id="identifier"
                placeholder={t('usernamePlaceholder')}
                value={form.identifier}
                onChange={e => setForm(f => ({ ...f, identifier: e.target.value }))}
                className="bg-background/60 border-border/60 rounded-sm"
                autoComplete="username"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-normal text-muted-foreground">{t('password')}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="bg-background/60 border-border/60 rounded-sm pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 hover-gold-glow rounded-sm"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  {t('signingIn')}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn className="w-4 h-4" />
                  {t('login')}
                </span>
              )}
            </Button>
          </form>

          <div className="glass-card border border-primary/20 rounded-sm p-3 bg-primary/5 text-xs text-muted-foreground space-y-1">
            <p className="font-semibold text-primary text-[10px] uppercase tracking-wider">{t('testAccounts')}</p>
            <p><span className="text-foreground">admin</span> / admin123 — Super Admin</p>
            <p><span className="text-foreground">biznes</span> / biznes123 — Business Owner</p>
          </div>

          <div className="section-divider" />

          <p className="text-center text-sm text-muted-foreground">
            {t('noAccount')}{' '}
            <Link to="/royxat" className="text-primary hover:text-primary/80 font-medium transition-colors">
              {t('register')}
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-muted-foreground/60 mt-4">
          {t('termsAccept')}{' '}
          <span className="underline cursor-pointer hover:text-muted-foreground transition-colors">{t('terms')}</span>
          {' '}{t('and')}{' '}
          <span className="underline cursor-pointer hover:text-muted-foreground transition-colors">{t('privacy')}</span>
          {t('termsAcceptEnd') ? ` ${t('termsAcceptEnd')}` : ''}
        </p>

        <div className="text-center mt-4">
          <Link to="/" className="text-sm text-muted-foreground/60 hover:text-muted-foreground transition-colors">
            {t('backHome')}
          </Link>
        </div>
      </div>
    </div>
  );
}
