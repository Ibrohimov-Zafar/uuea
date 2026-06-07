import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, BookOpen } from 'lucide-react';
import Layout from '@/components/layouts/Layout';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getNewsPost } from '@/api/client';
import type { NewsPost } from '@/types/types';
import { useLang } from '@/contexts/LangContext';
import { PageSeo } from '@/components/common/PageMeta';
import {
  buildArticleJsonLd,
  buildDetailBreadcrumbs,
  buildBreadcrumbJsonLd,
  getSiteOrigin,
  jsonLdBundle,
} from '@/config/seo';

function lf(uz: string | null | undefined, ru: string | null | undefined, en: string | null | undefined, lang: string): string {
  if (lang === 'ru' && ru) return ru;
  if (lang === 'en' && en) return en;
  return uz || '';
}

export default function NewsDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { lang, t } = useLang();
  const [post, setPost] = useState<NewsPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        const data = await getNewsPost(id);
        setPost(data);
      } catch {
        setPost(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const dateStr = post?.published_at || post?.created_at || '';
  const displayDate = dateStr ? new Date(dateStr).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' }) : '';

  const seoPath = id ? `/yangiliklar/${id}` : '/yangiliklar';
  const seoDesc = post?.excerpt || post?.body?.slice(0, 200) || '';
  const origin = getSiteOrigin();

  return (
    <Layout>
      {post && (
        <PageSeo
          title={post.title}
          description={seoDesc}
          path={seoPath}
          type="article"
          image={post.image_url || undefined}
          publishedTime={post.published_at || post.created_at}
          modifiedTime={post.updated_at || post.published_at || post.created_at}
          jsonLd={jsonLdBundle(
            buildArticleJsonLd({
              origin,
              path: seoPath,
              headline: post.title,
              description: seoDesc,
              datePublished: post.published_at || post.created_at,
              dateModified: post.updated_at || post.published_at || post.created_at,
              image: post.image_url || undefined,
            }),
            buildBreadcrumbJsonLd(origin, lang, buildDetailBreadcrumbs('yangiliklar', lang, post.title, seoPath)),
          )}
        />
      )}
      <div className="min-h-screen bg-navy-dark pt-20 pb-16">
        <div className="max-w-3xl mx-auto px-4">
          <Link to="/yangiliklar" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6">
            <ArrowLeft className="w-4 h-4" /> {t('backToNews')}
          </Link>

          {loading ? (
            <Skeleton className="h-96 bg-muted rounded-sm" />
          ) : !post ? (
            <div className="glass-card border-ancient rounded-sm p-10 text-center card-ancient">
              <p className="text-muted-foreground">{t('articleNotFound')}</p>
            </div>
          ) : (
            <article className="glass-card border-ancient rounded-sm overflow-hidden card-ancient">
              {post.image_url && (
                <div className="aspect-[21/9] bg-muted overflow-hidden">
                  <img src={post.image_url} alt={post.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-6 md:p-8 space-y-4">
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="px-2 py-1 bg-primary/10 border border-primary/20 text-primary rounded-sm">{post.category}</span>
                  {displayDate && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-primary" /> {displayDate}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-primary" /> {t('editorial')}
                  </span>
                </div>
                <h1 className="font-jiang-cheng text-foreground text-2xl md:text-3xl font-bold text-balance leading-tight">
                  {lf(post.title, post.title_ru, post.title_en, lang)}
                </h1>
                {lf(post.excerpt, post.excerpt_ru, post.excerpt_en, lang) && (
                  <p className="text-muted-foreground text-base leading-relaxed border-l-2 border-primary/40 pl-4">
                    {lf(post.excerpt, post.excerpt_ru, post.excerpt_en, lang)}
                  </p>
                )}
                <div className="prose prose-invert max-w-none text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {lf(post.body, post.body_ru, post.body_en, lang)}
                </div>
              </div>
            </article>
          )}
        </div>
      </div>
    </Layout>
  );
}
