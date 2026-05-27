import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2, LayoutDashboard, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { stripeVerifyPayment } from '@/api/client';
import { useLang } from '@/contexts/LangContext';

type Status = 'loading' | 'success' | 'failed' | 'error';

export default function PaymentSuccessPage() {
  const { t } = useLang();
  const [params] = useSearchParams();
  const sessionId = params.get('session_id');
  const [status, setStatus] = useState<Status>('loading');
  const [details, setDetails] = useState<{ amount?: number; currency?: string; email?: string } | null>(null);

  useEffect(() => {
    if (!sessionId) { setStatus('error'); return; }
    (async () => {
      try {
        const data = await stripeVerifyPayment(sessionId);
        if (data.verified) {
          setStatus('success');
          setDetails({
            amount: data.amount,
            currency: data.currency,
            email: data.customerEmail,
          });
        } else {
          setStatus('failed');
        }
      } catch (e) {
        console.error('Payment verify exception:', e);
        setStatus('error');
      }
    })();
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-navy-dark bg-sacred-geometry flex items-center justify-center px-4 py-16">
      <div className="absolute inset-0 bg-gradient-to-b from-navy/80 via-navy-dark to-navy" />

      <div className="relative w-full max-w-md text-center space-y-6">
        {status === 'loading' && (
          <div className="glass-card border-ancient rounded-sm p-10 card-ancient space-y-4">
            <Loader2 className="w-14 h-14 text-primary animate-spin mx-auto" />
            <h2 className="font-jiang-cheng text-foreground text-xl font-bold text-balance">
              {t('paymentVerifying')}
            </h2>
            <p className="text-muted-foreground text-sm text-pretty">{t('pleaseWait')}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="glass-card border-ancient rounded-sm p-10 card-ancient space-y-5">
            <div className="w-16 h-16 bg-green-500/10 border border-green-500/30 rounded-sm mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-400" />
            </div>
            <div className="space-y-2">
              <h2 className="font-jiang-cheng text-foreground text-xl font-bold text-balance">
                {t('paymentSuccess')}
              </h2>
              <p className="text-muted-foreground text-sm text-pretty">
                {t('membershipActivated')}
              </p>
            </div>
            {details && (
              <div className="bg-green-500/5 border border-green-500/20 rounded-sm p-4 space-y-2 text-sm">
                {details.amount != null && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('colAmount')}</span>
                    <span className="text-foreground font-semibold">
                      ${(details.amount / 100).toFixed(2)} {(details.currency || 'usd').toUpperCase()}
                    </span>
                  </div>
                )}
                {details.email && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('email')}</span>
                    <span className="text-foreground text-xs">{details.email}</span>
                  </div>
                )}
              </div>
            )}
            <div className="flex flex-col gap-2 pt-2">
              <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm hover-gold-glow">
                <Link to="/dashboard">
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  {t('goDashboard')}
                </Link>
              </Button>
              <Button asChild variant="ghost" className="border border-border/40 text-muted-foreground hover:text-foreground rounded-sm">
                <Link to="/"><Home className="w-4 h-4 mr-2" />{t('home')}</Link>
              </Button>
            </div>
          </div>
        )}

        {(status === 'failed' || status === 'error') && (
          <div className="glass-card border-ancient rounded-sm p-10 card-ancient space-y-5">
            <div className="w-16 h-16 bg-destructive/10 border border-destructive/30 rounded-sm mx-auto flex items-center justify-center">
              <XCircle className="w-8 h-8 text-destructive" />
            </div>
            <div className="space-y-2">
              <h2 className="font-jiang-cheng text-foreground text-xl font-bold text-balance">
                {status === 'error' ? t('paymentError') : t('paymentFailed')}
              </h2>
              <p className="text-muted-foreground text-sm text-pretty">
                {status === 'error' ? t('paymentNotFound') : t('paymentRetryFailed')}
              </p>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm hover-gold-glow">
                <Link to="/qoshilish">{t('retryPayment')}</Link>
              </Button>
              <Button asChild variant="ghost" className="border border-border/40 text-muted-foreground hover:text-foreground rounded-sm">
                <Link to="/"><Home className="w-4 h-4 mr-2" />{t('home')}</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
