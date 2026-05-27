import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, BookOpen } from 'lucide-react';
import Layout from '@/components/layouts/Layout';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getNewsPost } from '@/api/client';
import type { NewsPost } from '@/types/types';

export default function NewsDetailPage() {
  const { id } = useParams<{ id: string }>();
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

  return (
    <Layout>
      <div className="min-h-screen bg-navy-dark pt-20 pb-16">
        <div className="max-w-3xl mx-auto px-4">
          <Link to="/yangiliklar" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6">
            <ArrowLeft className="w-4 h-4" /> Yangiliklarga qaytish
          </Link>

          {loading ? (
            <Skeleton className="h-96 bg-muted rounded-sm" />
          ) : !post ? (
            <div className="glass-card border-ancient rounded-sm p-10 text-center card-ancient">
              <p className="text-muted-foreground">Maqola topilmadi</p>
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
                    <BookOpen className="w-3.5 h-3.5 text-primary" /> Tahririyat
                  </span>
                </div>
                <h1 className="font-jiang-cheng text-foreground text-2xl md:text-3xl font-bold text-balance leading-tight">
                  {post.title}
                </h1>
                {post.excerpt && (
                  <p className="text-muted-foreground text-base leading-relaxed border-l-2 border-primary/40 pl-4">
                    {post.excerpt}
                  </p>
                )}
                <div className="prose prose-invert max-w-none text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {post.body}
                </div>
              </div>
            </article>
          )}
        </div>
      </div>
    </Layout>
  );
}
