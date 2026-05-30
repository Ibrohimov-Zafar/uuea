import { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle } from 'lucide-react';
import Layout from '@/components/layouts/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useLang } from '@/contexts/LangContext';
import { SITE } from '@/config/site';
import { createContactMessage } from '@/api/client';
import { toast } from 'sonner';

type FormState = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  website: string;
};

const emptyForm: FormState = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
  website: '',
};

export default function ContactPage() {
  const { t } = useLang();
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.website) return;
    setLoading(true);
    try {
      await createContactMessage({
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        subject: form.subject.trim() || undefined,
        message: form.message.trim(),
      });
      setSent(true);
      setForm(emptyForm);
    } catch {
      toast.error(t('contactError'));
    } finally {
      setLoading(false);
    }
  };

  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }));

  return (
    <Layout>
      <section className="relative py-24 bg-navy-dark bg-sacred-geometry overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-navy/60 to-navy-dark" />
        <div className="relative max-w-7xl mx-auto px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-sm border border-primary/30 bg-primary/5 text-primary text-xs tracking-widest uppercase">
            {t('contactBadge')}
          </div>
          <h1 className="font-jiang-cheng text-4xl md:text-5xl font-bold text-foreground text-balance">
            {t('contactTitle')}
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
            {t('contactSub')}
          </p>
        </div>
      </section>

      <section className="py-20 bg-background bg-sacred-geometry">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h2 className="font-jiang-cheng text-foreground text-xl font-bold mb-2 text-balance">
                  {t('contactInfo')}
                </h2>
                <div className="w-12 h-0.5 bg-primary" />
              </div>
              <div className="space-y-4">
                {[
                  {
                    icon: <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />,
                    label: t('address'),
                    value: t('footerAddress'),
                  },
                  {
                    icon: <Phone className="w-5 h-5 text-primary shrink-0" />,
                    label: t('phone'),
                    value: `${SITE.phone}\n${SITE.phoneUz}`,
                  },
                  {
                    icon: <Mail className="w-5 h-5 text-primary shrink-0" />,
                    label: t('email'),
                    value: SITE.email,
                  },
                  {
                    icon: <Clock className="w-5 h-5 text-primary shrink-0" />,
                    label: t('contactHours'),
                    value: t('contactHoursValue'),
                  },
                ].map((item) => (
                  <div key={item.label} className="glass-card border-ancient rounded-sm p-4 flex items-start gap-4 hover-gold-glow">
                    <div className="w-10 h-10 bg-primary/10 border border-primary/20 rounded-sm flex items-center justify-center shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <div className="text-primary text-xs tracking-wider uppercase mb-1">{item.label}</div>
                      <div className="text-foreground text-sm leading-relaxed whitespace-pre-line">{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-3">
              <div className="glass-card border-ancient rounded-sm p-8 card-ancient">
                {sent ? (
                  <div className="flex flex-col items-center justify-center py-16 space-y-5 text-center">
                    <div className="w-16 h-16 bg-primary/15 border border-primary/30 rounded-sm flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="font-jiang-cheng text-foreground text-xl font-bold text-balance">
                      {t('contactSent')}
                    </h3>
                    <p className="text-muted-foreground text-sm text-pretty leading-relaxed max-w-sm">
                      {t('contactSentSub')}
                    </p>
                    <Button
                      variant="ghost"
                      className="border border-primary/40 text-primary hover:bg-primary/10 rounded-sm"
                      onClick={() => setSent(false)}
                    >
                      {t('sendAnother')}
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <h2 className="font-jiang-cheng text-foreground text-xl font-bold mb-1 text-balance">
                        {t('contactFormTitle')}
                      </h2>
                      <div className="w-12 h-0.5 bg-primary mb-5" />
                    </div>
                    <input
                      type="text"
                      name="website"
                      value={form.website}
                      onChange={set('website')}
                      className="hidden"
                      tabIndex={-1}
                      autoComplete="off"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-sm text-muted-foreground">{t('firstName')} *</label>
                        <Input required value={form.first_name} onChange={set('first_name')} className="bg-background border-border/60 rounded-sm text-sm focus-visible:ring-primary" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm text-muted-foreground">{t('lastName')} *</label>
                        <Input required value={form.last_name} onChange={set('last_name')} className="bg-background border-border/60 rounded-sm text-sm focus-visible:ring-primary" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm text-muted-foreground">{t('email')} *</label>
                      <Input required type="email" value={form.email} onChange={set('email')} className="bg-background border-border/60 rounded-sm text-sm focus-visible:ring-primary" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm text-muted-foreground">{t('phone')}</label>
                      <Input value={form.phone} onChange={set('phone')} className="bg-background border-border/60 rounded-sm text-sm focus-visible:ring-primary" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm text-muted-foreground">{t('subject')}</label>
                      <Input value={form.subject} onChange={set('subject')} className="bg-background border-border/60 rounded-sm text-sm focus-visible:ring-primary" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm text-muted-foreground">{t('message')} *</label>
                      <Textarea
                        required
                        value={form.message}
                        onChange={set('message')}
                        rows={5}
                        className="bg-background border-border/60 rounded-sm text-sm focus-visible:ring-primary resize-none"
                      />
                    </div>
                    <Button
                      type="submit"
                      size="lg"
                      disabled={loading}
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90 hover-gold-glow rounded-sm"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {loading ? t('submitting') : t('sendMessage')}
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
