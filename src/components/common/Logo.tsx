import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { SITE } from '@/config/site';

/** White logo PNG — invert in light mode so it stays visible on pale backgrounds. */
export const logoImgClass = 'w-auto object-contain shrink-0 invert dark:invert-0';

type LogoProps = {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'header';
  linkTo?: string | false;
};

const sizes = { sm: 'h-8', md: 'h-10', lg: 'h-12', header: 'h-12' };

export default function Logo({ className, showText = false, size = 'md', linkTo = '/' }: LogoProps) {
  const inner = (
    <>
      <img
        src="/logo.png"
        alt={SITE.shortName}
        className={cn(sizes[size], logoImgClass, className)}
      />
      {showText && (
        <div className="hidden sm:block min-w-0">
          <div className="font-jiang-cheng text-foreground text-sm font-bold leading-tight tracking-wide truncate">
            {SITE.shortName}
          </div>
          <div className="text-primary text-[10px] tracking-widest uppercase leading-tight">
            USA · UZ
          </div>
        </div>
      )}
    </>
  );

  if (linkTo === false) {
    return <div className={cn('flex items-center shrink-0', showText && 'gap-3')}>{inner}</div>;
  }

  return (
    <Link to={linkTo} className={cn('flex items-center shrink-0', showText && 'gap-3')}>
      {inner}
    </Link>
  );
}
