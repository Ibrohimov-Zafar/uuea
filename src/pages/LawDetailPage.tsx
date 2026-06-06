import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Scale, FileText } from 'lucide-react';
import Layout from '@/components/layouts/Layout';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getLegalResource } from '@/api/client';
import type { LegalResource } from '@/types/types';
import { useLang } from '@/contexts/LangContext';
import { PageSeo } from '@/components/common/PageMeta';
import {
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
  buildDetailBreadcrumbs,
  getSiteOrigin,
  jsonLdBundle,
} from '@/config/seo';

export default function LawDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t, lang } = useLang();
  const [item, setItem] = useState<LegalResource | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getLegalResource(id)
      .then(setItem)
      .catch(() => setItem(null))
      .finally(() => setLoading(false));
  }, [id]);

  const displayDate = item?.published_date
    ? new Date(item.published_date).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  const seoPath = id ? `/qonunlar/${id}` : '/qonunlar';
  const origin = getSiteOrigin();

  return (
    <Layout>
      {item && (
        <PageSeo
          title={item.title}
          description={item.excerpt}
          path={seoPath}
          type="article"
          publishedTime={item.published_date}
          modifiedTime={item.updated_at || item.published_date}
          jsonLd={jsonLdBundle(
            buildArticleJsonLd({
              origin,
              path: seoPath,
              headline: item.title,
              description: item.excerpt,
              datePublished: item.published_date,
              dateModified: item.updated_at || item.published_date,
            }),
            buildBreadcrumbJsonLd(origin, lang, buildDetailBreadcrumbs('qonunlar', lang, item.title, seoPath)),
          )}
        />
      )}
      <div className="min-h-screen bg-navy-dark pt-20 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <Link
            to="/qonunlar"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> {t('lawsBack')}
          </Link>

          {loading ? (
            <Skeleton className="h-96 bg-muted rounded-sm" />
          ) : !item ? (
            <div className="glass-card border-ancient rounded-sm p-10 text-center">
              <p className="text-muted-foreground">{t('lawsNotFound')}</p>
              <Link to="/qonunlar" className="mt-4 inline-block">
                <Button variant="ghost" className="border border-primary/40 text-primary rounded-sm mt-4">
                  {t('lawsBack')}
                </Button>
              </Link>
            </div>
          ) : (
            <article className="glass-card border-ancient rounded-sm overflow-hidden card-ancient">
              <div className="p-6 md:p-8 space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 shrink-0 bg-primary/15 border border-primary/30 rounded-sm flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0 space-y-2">
                    <span className="inline-block px-2 py-0.5 text-[10px] uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 rounded-sm">
                      {item.category}
                    </span>
                    <h1 className="font-jiang-cheng text-2xl md:text-3xl font-bold text-foreground text-balance">
                      {item.title}
                    </h1>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                  {displayDate && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-primary" /> {displayDate}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Scale className="w-3.5 h-3.5 text-primary" /> {item.source}
                  </span>
                </div>

                <div className="section-divider" />

                <div>
                  {item.body.split('\n\n').map((para, i) => (
                    <p key={i} className="text-muted-foreground text-sm leading-relaxed mb-4 text-pretty">
                      {para}
                    </p>
                  ))}
                </div>

                <p className="text-xs text-muted-foreground/80 border-t border-border/40 pt-4 italic">
                  {t('lawsDisclaimer')}
                </p>
              </div>
            </article>
          )}
        </div>
      </div>
    </Layout>
  );
}
