import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, UserPlus, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading, signUpWithUsername } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [authLoading, user, navigate]);

  if (authLoading || user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-navy-dark">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const [form, setForm] = useState({
    username: '',
    email: '',
    fullName: '',
    password: '',
    confirmPassword: '',
  });
  const [showPw, setShowPw] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username.trim() || !form.password || !form.confirmPassword) {
      toast.error('Iltimos, barcha majburiy maydonlarni to\'ldiring');
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(form.username)) {
      toast.error('Foydalanuvchi nomida faqat harf, raqam va _ bo\'lishi mumkin');
      return;
    }
    if (form.email.trim() && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim())) {
      toast.error('Email noto\'g\'ri ko\'rinishda');
      return;
    }
    if (form.username.length < 3) {
      toast.error('Foydalanuvchi nomi kamida 3 belgidan iborat bo\'lishi kerak');
      return;
    }
    if (form.password.length < 8) {
      toast.error('Parol kamida 8 belgidan iborat bo\'lishi kerak');
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Parollar bir-biriga mos kelmaydi');
      return;
    }
    if (!agreed) {
      toast.error('Iltimos, foydalanish shartlarini qabul qiling');
      return;
    }

    setLoading(true);
    const { error } = await signUpWithUsername(
      form.username.trim(),
      form.password,
      form.fullName.trim() || form.username.trim(),
      form.email.trim() || undefined
    );
    setLoading(false);

    if (error) {
      const code = (error as Error & { code?: string }).code;
      if (code === 'already_exists') {
        toast.error('Bu foydalanuvchi nomi yoki email allaqachon band');
      } else {
        toast.error(error.message || 'Ro\'yxatdan o\'tishda xatolik yuz berdi');
      }
    } else {
      toast.success('Muvaffaqiyatli ro\'yxatdan o\'tdingiz!');
      navigate('/dashboard', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-navy-dark bg-sacred-geometry flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 bg-gradient-to-b from-navy/80 via-navy-dark to-navy" />

      <div className="relative w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8 space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 border border-primary/30 rounded-sm mx-auto">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-jiang-cheng text-2xl md:text-3xl font-bold text-foreground text-balance">
            Biznes <span className="text-gold-gradient">Assotsiatsiya</span>
          </h1>
          <p className="text-muted-foreground text-sm">Yangi hisob yaratish</p>
        </div>

        {/* Card */}
        <div className="glass-card border-ancient rounded-sm p-8 card-ancient space-y-6">
          <div className="space-y-1">
            <h2 className="font-jiang-cheng text-foreground text-xl font-bold text-balance">Ro'yxatdan O'tish</h2>
            <p className="text-muted-foreground text-sm text-pretty">Yangi hisob yaratish uchun ma'lumotlarni kiriting</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-sm font-normal text-muted-foreground">
                Foydalanuvchi Nomi <span className="text-destructive">*</span>
              </Label>
              <Input
                id="username"
                placeholder="foydalanuvchi_nomi"
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                className="bg-background/60 border-border/60 rounded-sm"
                autoComplete="username"
              />
              <p className="text-xs text-muted-foreground/60">Faqat harf, raqam va _ belgisi</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-normal text-muted-foreground">Email (ixtiyoriy)</Label>
              <Input
                id="email"
                placeholder="email@example.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="bg-background/60 border-border/60 rounded-sm"
                autoComplete="email"
              />
              <p className="text-xs text-muted-foreground/60">
                Email kiritmasangiz, avtomatik <span className="font-mono">{'{username}'}@miaoda.com</span> bo‘ladi
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="fullName" className="text-sm font-normal text-muted-foreground">To'liq Ism</Label>
              <Input
                id="fullName"
                placeholder="Ism Familiya"
                value={form.fullName}
                onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                className="bg-background/60 border-border/60 rounded-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reg-password" className="text-sm font-normal text-muted-foreground">
                Parol <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="reg-password"
                  type={showPw ? 'text' : 'password'}
                  placeholder="Kamida 8 belgi"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="bg-background/60 border-border/60 rounded-sm pr-10"
                  autoComplete="new-password"
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

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-sm font-normal text-muted-foreground">
                Parolni Tasdiqlash <span className="text-destructive">*</span>
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Parolni qayta kiriting"
                value={form.confirmPassword}
                onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                className="bg-background/60 border-border/60 rounded-sm"
                autoComplete="new-password"
              />
            </div>

            <div className="flex items-start gap-3 pt-1">
              <Checkbox
                id="agree"
                checked={agreed}
                onCheckedChange={v => setAgreed(!!v)}
                className="mt-0.5 rounded-sm"
              />
              <Label htmlFor="agree" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                Men{' '}
                <span className="text-primary underline">Foydalanish Shartlari</span>
                {' '}va{' '}
                <span className="text-primary underline">Maxfiylik Siyosatini</span>
                {' '}o'qib, qabul qilaman
              </Label>
            </div>

            <Button
              type="submit"
              disabled={loading || !agreed}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 hover-gold-glow rounded-sm"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Ro'yxatdan o'tilmoqda...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Ro'yxatdan O'tish
                </span>
              )}
            </Button>
          </form>

          <div className="section-divider" />

          <p className="text-center text-sm text-muted-foreground">
            Allaqachon hisobingiz bormi?{' '}
            <Link to="/kirish" className="text-primary hover:text-primary/80 font-medium transition-colors">
              Kirish
            </Link>
          </p>
        </div>

        <div className="text-center mt-4">
          <Link to="/" className="text-sm text-muted-foreground/60 hover:text-muted-foreground transition-colors">
            Bosh sahifaga qaytish
          </Link>
        </div>
      </div>
    </div>
  );
}
