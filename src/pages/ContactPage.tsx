import { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle } from 'lucide-react';
import Layout from '@/components/layouts/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useLang } from '@/contexts/LangContext';

export default function ContactPage() {
  const { t } = useLang();
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <Layout>
      {/* Hero */}
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

      {/* Contact content */}
      <section className="py-20 bg-background bg-sacred-geometry">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
            {/* Contact info */}
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
                    value: "Toshkent sh., Amir Temur ko'chasi, 108\nO'zbekiston, 100000",
                  },
                  {
                    icon: <Phone className="w-5 h-5 text-primary shrink-0" />,
                    label: t('phone'),
                    value: "+998 71 200-00-00",
                  },
                  {
                    icon: <Mail className="w-5 h-5 text-primary shrink-0" />,
                    label: t('email'),
                    value: "info@chamber.uz",
                  },
                  {
                    icon: <Clock className="w-5 h-5 text-primary shrink-0" />,
                    label: t('contactHours'),
                    value: "Dushanba – Juma: 09:00 – 18:00\nShanba: 10:00 – 14:00",
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

              {/* Map placeholder */}
              <div className="rounded-sm overflow-hidden border border-border/60 aspect-[4/3] bg-muted flex items-center justify-center relative">
                <div className="absolute inset-0 bg-navy/60 flex flex-col items-center justify-center gap-2">
                  <MapPin className="w-10 h-10 text-primary opacity-60" />
                  <span className="text-muted-foreground text-xs tracking-wider">Amir Temur ko'chasi, 108</span>
                </div>
              </div>
            </div>

            {/* Form */}
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
                      Yangi Xabar Yuborish
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-sm text-muted-foreground">Ism *</label>
                        <Input required placeholder="Ismingiz" className="bg-background border-border/60 rounded-sm text-sm focus-visible:ring-primary" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm text-muted-foreground">Familiya *</label>
                        <Input required placeholder="Familiyangiz" className="bg-background border-border/60 rounded-sm text-sm focus-visible:ring-primary" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm text-muted-foreground">Email *</label>
                      <Input required type="email" placeholder="email@example.com" className="bg-background border-border/60 rounded-sm text-sm focus-visible:ring-primary" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm text-muted-foreground">Telefon</label>
                      <Input placeholder="+998 XX XXX-XX-XX" className="bg-background border-border/60 rounded-sm text-sm focus-visible:ring-primary" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm text-muted-foreground">Mavzu</label>
                      <Input placeholder="Xabar mavzusi" className="bg-background border-border/60 rounded-sm text-sm focus-visible:ring-primary" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm text-muted-foreground">Xabar *</label>
                      <Textarea
                        required
                        placeholder="Xabaringizni yozing..."
                        rows={5}
                        className="bg-background border-border/60 rounded-sm text-sm focus-visible:ring-primary resize-none"
                      />
                    </div>
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90 hover-gold-glow rounded-sm"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Xabar Yuborish
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
