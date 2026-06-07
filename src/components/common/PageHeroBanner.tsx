import { cn } from '@/lib/utils';

interface PageHeroBannerProps {
  image: string;
  imagePosition?: string;
  className?: string;
  children: React.ReactNode;
}

export default function PageHeroBanner({
  image,
  imagePosition = 'center',
  className,
  children,
}: PageHeroBannerProps) {
  return (
    <section className={cn('relative py-20 sm:py-24 overflow-hidden bg-black', className)}>
      <img
        src={image}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ objectPosition: imagePosition }}
      />
      <div className="absolute inset-0 bg-black/40" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-navy-dark/95" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/20 to-black/30" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 text-center space-y-6">
        {children}
      </div>
    </section>
  );
}

export function PageHeroBadge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn(
      'inline-flex items-center gap-2 px-4 py-1.5 rounded-sm border border-primary/50 bg-black/40 text-primary text-xs tracking-widest uppercase',
      className,
    )}>
      {children}
    </div>
  );
}

export function PageHeroTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h1 className={cn('font-jiang-cheng text-3xl sm:text-4xl md:text-5xl font-bold text-white text-balance drop-shadow-[0_2px_16px_rgba(0,0,0,0.75)]', className)}>
      {children}
    </h1>
  );
}

export function PageHeroSub({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn('text-white/90 max-w-2xl mx-auto text-pretty leading-relaxed text-sm sm:text-base drop-shadow-[0_1px_10px_rgba(0,0,0,0.6)]', className)}>
      {children}
    </p>
  );
}
