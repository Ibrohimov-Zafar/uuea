import { Link } from 'react-router-dom';
import { ArrowRight, Megaphone, LifeBuoy, Shield, Network, TrendingUp, Users, CheckCircle } from 'lucide-react';
import Layout from '@/components/layouts/Layout';
import { Button } from '@/components/ui/button';
import { services } from '@/data/mockData';
import { useLang } from '@/contexts/LangContext';

const iconMap: Record<string, React.ReactNode> = {
  Megaphone: <Megaphone className="w-8 h-8" />,
  LifeBuoy: <LifeBuoy className="w-8 h-8" />,
  Shield: <Shield className="w-8 h-8" />,
  Network: <Network className="w-8 h-8" />,
  TrendingUp: <TrendingUp className="w-8 h-8" />,
  Users: <Users className="w-8 h-8" />,
};

export default function ServicesPage() {
  const { t } = useLang();
  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-24 bg-navy-dark bg-sacred-geometry overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-navy/60 to-navy-dark" />
        <div className="relative max-w-7xl mx-auto px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-sm border border-primary/30 bg-primary/5 text-primary text-xs tracking-widest uppercase">
            {t('servicesBadge')}
          </div>
          <h1 className="font-jiang-cheng text-4xl md:text-5xl font-bold text-foreground text-balance">
            {t('servicesTitle')}
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
            {t('servicesSub')}
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-background bg-sacred-geometry">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((svc) => (
              <div key={svc.id} className="glass-card border-ancient rounded-sm p-8 space-y-5 hover-gold-glow group card-ancient flex flex-col h-full">
                <div className="w-16 h-16 bg-primary/10 border border-primary/20 rounded-sm flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
                  {iconMap[svc.icon] ?? <TrendingUp className="w-8 h-8" />}
                </div>
                <div>
                  <div className="text-primary text-xs tracking-widest uppercase mb-1">{svc.subtitle}</div>
                  <h3 className="font-jiang-cheng text-foreground text-xl font-bold text-balance">{svc.title}</h3>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed text-pretty">{svc.description}</p>
                <ul className="space-y-2.5 flex-1">
                  {svc.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                      <CheckCircle className="w-3.5 h-3.5 text-primary shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/aloqa" className="mt-auto">
                  <Button variant="ghost" className="border border-primary/30 text-primary hover:bg-primary/10 rounded-sm text-xs w-full">
                    Batafsil Ma'lumot
                    <ArrowRight className="w-3 h-3 ml-1.5" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 bg-navy-light border-y border-border/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-4 mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-sm border border-primary/30 bg-primary/5 text-primary text-xs tracking-widest uppercase">
              Jarayon
            </div>
            <h2 className="font-jiang-cheng text-2xl md:text-3xl font-bold text-foreground text-balance">
              Qanday Ishlaydi?
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: "01", title: "A'zolikka Qo'shiling", desc: "Biznesingizga mos reja tanlang va ro'yxatdan o'ting." },
              { step: "02", title: "Ehtiyojlarni Aniqlang", desc: "Mutaxassislarimiz bilan maslahat o'tkazing va rejalashtiring." },
              { step: "03", title: "Xizmatlardan Foydalaning", desc: "Tanlagan xizmatlaringizni to'liq qo'llang va natija oling." },
              { step: "04", title: "O'sishni Kuzating", desc: "Analitika va hisobotlar orqali samaradorlikni baholang." },
            ].map((item) => (
              <div key={item.step} className="glass-card border-ancient rounded-sm p-6 space-y-4 text-center card-ancient">
                <div className="font-jiang-cheng text-5xl font-bold text-gold-gradient opacity-40">{item.step}</div>
                <h3 className="font-jiang-cheng text-foreground font-bold text-sm">{item.title}</h3>
                <p className="text-muted-foreground text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-background bg-sacred-geometry">
        <div className="max-w-3xl mx-auto px-6 text-center space-y-6">
          <h2 className="font-jiang-cheng text-2xl md:text-3xl font-bold text-foreground text-balance">
            Qaysi Xizmat Sizga Kerak?
          </h2>
          <p className="text-muted-foreground text-pretty leading-relaxed">
            Mutaxassislarimiz bilan bog'laning va biznesingizga mos xizmatlar to'plamini tuzing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/aloqa">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 hover-gold-glow rounded-sm px-10">
                Biz Bilan Bog'laning
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to="/qoshilish">
              <Button size="lg" variant="ghost" className="border border-primary/40 text-primary hover:bg-primary/10 rounded-sm px-10">
                A'zolikga Qo'shilish
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
