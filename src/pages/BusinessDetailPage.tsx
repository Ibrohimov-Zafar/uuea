import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Globe, Mail, MapPin, Phone, ExternalLink, Building2 } from 'lucide-react';
import Layout from '@/components/layouts/Layout';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getBusiness } from '@/api/client';
import type { Business } from '@/types/types';

export default function BusinessDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [biz, setBiz] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      setError(false);
      try {
        const data = await getBusiness(id);
        setBiz(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const websiteUrl = biz?.website
    ? (biz.website.startsWith('http') ? biz.website : `https://${biz.website}`)
    : null;

  return (
    <Layout>
      <div className="min-h-screen bg-navy-dark pt-20 pb-16">
        <div className="max-w-3xl mx-auto px-4">
          <Link to="/katalog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6">
            <ArrowLeft className="w-4 h-4" /> Katalogga qaytish
          </Link>

          {loading ? (
            <Skeleton className="h-80 bg-muted rounded-sm" />
          ) : error || !biz ? (
            <div className="glass-card border-ancient rounded-sm p-10 text-center card-ancient">
              <p className="text-muted-foreground">Biznes topilmadi</p>
              <Link to="/katalog"><Button className="mt-4">Katalog</Button></Link>
            </div>
          ) : (
            <div className="glass-card border-ancient rounded-sm overflow-hidden card-ancient">
              <div className="bg-primary/10 border-b border-ancient px-6 py-5 flex items-start gap-4">
                <div className="w-16 h-16 bg-primary/15 border border-primary/30 rounded-sm flex items-center justify-center font-jiang-cheng text-primary font-bold text-2xl shrink-0">
                  {biz.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="font-jiang-cheng text-foreground text-2xl font-bold">{biz.name}</h1>
                    {biz.is_vip && <span className="vip-badge">VIP</span>}
                  </div>
                  <p className="text-primary text-sm mt-1">{biz.category}</p>
                  {biz.region && <p className="text-muted-foreground text-xs mt-0.5">{biz.region}</p>}
                </div>
              </div>

              <div className="p-6 space-y-6">
                {biz.description && (
                  <div>
                    <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Tavsif</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">{biz.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {biz.address && (
                    <div className="flex items-start gap-3 text-sm">
                      <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{biz.address}</span>
                    </div>
                  )}
                  {biz.phone && (
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="w-4 h-4 text-primary shrink-0" />
                      <a href={`tel:${biz.phone}`} className="text-foreground hover:text-primary">{biz.phone}</a>
                    </div>
                  )}
                  {biz.email && (
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="w-4 h-4 text-primary shrink-0" />
                      <a href={`mailto:${biz.email}`} className="text-foreground hover:text-primary truncate">{biz.email}</a>
                    </div>
                  )}
                  {websiteUrl && (
                    <div className="flex items-center gap-3 text-sm">
                      <Globe className="w-4 h-4 text-primary shrink-0" />
                      <a href={websiteUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">
                        {biz.website}
                      </a>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  {websiteUrl && (
                    <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm">
                      <a href={websiteUrl} target="_blank" rel="noopener noreferrer">
                        Veb-sayt <ExternalLink className="w-4 h-4 ml-2" />
                      </a>
                    </Button>
                  )}
                  <Button asChild variant="ghost" className="border border-border/40 rounded-sm">
                    <Link to="/katalog"><Building2 className="w-4 h-4 mr-2" /> Boshqa bizneslar</Link>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
