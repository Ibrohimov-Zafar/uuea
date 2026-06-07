import type { MouseEvent } from 'react';
import { ExternalLink, Link2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
  source: string;
  sourceUrl?: string | null;
  className?: string;
  onClick?: (e: MouseEvent) => void;
};

/** Manba nomi va ixtiyoriy havola — foydalanuvchiga manba belgisi bilan ko‘rsatiladi */
export default function LegalSourceMeta({ source, sourceUrl, className, onClick }: Props) {
  if (!source) return null;

  const icon = sourceUrl
    ? <ExternalLink className="w-3.5 h-3.5 text-primary shrink-0" />
    : <Link2 className="w-3.5 h-3.5 text-primary shrink-0" />;

  if (sourceUrl) {
    return (
      <a
        href={sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
        className={cn(
          'inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors underline-offset-2 hover:underline',
          className,
        )}
        title={sourceUrl}
      >
        {icon}
        <span>{source}</span>
      </a>
    );
  }

  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs text-muted-foreground', className)}>
      {icon}
      <span>{source}</span>
    </span>
  );
}
