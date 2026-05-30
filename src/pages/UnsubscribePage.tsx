import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, Mail, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { unsubscribeByToken } from '@/api/client';

type State = 'loading' | 'success' | 'already' | 'error';

export default function UnsubscribePage() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const [state, setState] = useState<State>('loading');

  useEffect(() => {
    if (!token) { setState('error'); return; }

    (async () => {
      try {
        const { already } = await unsubscribeByToken(token);
        setState(already ? 'already' : 'success');
      } catch {
        setState('error');
      }
    })();
  }, [token]);

  return (
    <div className="min-h-screen bg-navy-dark flex items-center justify-center px-4 relative overflow-hidden">
      {/* Mystical background layers */}
      <div className="absolute inset-0 sacred-geometry-bg opacity-20 pointer-events-none" />
      <div className="absolute inset-0 constellation-bg opacity-10 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/4 rounded-full blur-3xl pointer-events-none" />

      {/* Runic decorations */}
      <div className="absolute top-16 right-16 w-48 h-48 border border-primary/10 rounded-full animate-spin-slow pointer-events-none hidden lg:block" />
      <div className="absolute bottom-16 left-16 w-32 h-32 border border-primary/8 rotate-45 pointer-events-none hidden lg:block" />

      {/* Card */}
      <div className="relative w-full max-w-md">
        {/* Gold top bar */}
        <div className="h-[3px] w-full bg-gradient-to-r from-transparent via-primary to-transparent rounded-t-sm" />

        <div className="bg-navy-card border border-primary/20 rounded-b-sm px-8 py-10 text-center space-y-6 shadow-2xl">
          {/* Icon */}
          <div className="flex justify-center">
            {state === 'loading' && (
              <div className="w-16 h-16 rounded-sm bg-primary/10 border border-primary/25 flex items-center justify-center">
                <Loader2 className="w-7 h-7 text-primary animate-spin" />
              </div>
            )}
            {state === 'success' && (
              <div className="w-16 h-16 rounded-sm bg-primary/10 border border-primary/25 flex items-center justify-center">
                <CheckCircle className="w-7 h-7 text-primary" />
              </div>
            )}
            {state === 'already' && (
              <div className="w-16 h-16 rounded-sm bg-muted/20 border border-border/30 flex items-center justify-center">
                <Mail className="w-7 h-7 text-muted-foreground" />
              </div>
            )}
            {state === 'error' && (
              <div className="w-16 h-16 rounded-sm bg-destructive/10 border border-destructive/25 flex items-center justify-center">
                <XCircle className="w-7 h-7 text-destructive" />
              </div>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <div className="text-[10px] text-primary/70 tracking-[3px] uppercase">UUEA</div>
            <h1 className="font-jiang-cheng text-xl font-bold text-foreground text-balance">
              {state === 'loading' && 'Tekshirilmoqda...'}
              {state === 'success' && "Obunadan Chiqildi"}
              {state === 'already' && "Allaqachon Chiqilgan"}
              {state === 'error'   && "Havola Topilmadi"}
            </h1>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent" />

          {/* Body */}
          <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
            {state === 'loading' && 'Obuna holati tekshirilmoqda, iltimos kuting...'}
            {state === 'success' && "Emailingiz muvaffaqiyatli obuna ro'yxatidan chiqarildi. Siz endi marketing xatlarini olmaysiz."}
            {state === 'already' && "Bu email allaqachon obunadan chiqarilgan edi."}
            {state === 'error'   && "Havola noto'g'ri yoki muddati o'tgan. Iltimos, oxirgi emaildagi havolani ishlating."}
          </p>

          {/* CTA */}
          {state !== 'loading' && (
            <Link to="/">
              <Button
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm font-semibold gap-2 shadow-gold"
              >
                <ArrowLeft className="w-4 h-4" />
                Bosh Sahifaga Qaytish
              </Button>
            </Link>
          )}

          {/* Footer note */}
          {state === 'success' && (
            <p className="text-[11px] text-muted-foreground/50">
              Agar xohlasangiz,{' '}
              <Link to="/" className="text-primary/70 hover:text-primary underline underline-offset-2">
                qayta obuna bo&apos;lishingiz
              </Link>
              {' '}mumkin.
            </p>
          )}
        </div>

        {/* Gold bottom line */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      </div>
    </div>
  );
}
