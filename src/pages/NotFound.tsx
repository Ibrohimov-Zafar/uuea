import { Link } from 'react-router-dom';
import PageMeta from '@/components/common/PageMeta';
import { useLang } from '@/contexts/LangContext';

export default function NotFound() {
  const { t } = useLang();

  return (
    <>
      <PageMeta title={t('notFoundTitle')} description={t('notFoundSub')} />
      <div className="relative flex flex-col items-center justify-center min-h-screen p-6 overflow-hidden z-1 bg-navy-dark">
        <div className="mx-auto w-full max-w-[242px] text-center sm:max-w-[472px]">
          <h1 className="mb-8 font-jiang-cheng font-bold text-foreground text-title-md xl:text-title-2xl">
            404
          </h1>

          <img src="/images/error/404.svg" alt="404" className="dark:hidden mx-auto" />
          <img
            src="/images/error/404-dark.svg"
            alt="404"
            className="hidden dark:block mx-auto"
          />

          <p className="mt-10 mb-2 text-lg font-jiang-cheng text-foreground font-bold">
            {t('notFoundTitle')}
          </p>
          <p className="mb-6 text-base text-muted-foreground sm:text-lg">
            {t('notFoundSub')}
          </p>

          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-sm border border-primary/40 bg-primary/10 px-5 py-3.5 text-sm font-medium text-primary hover:bg-primary/20 transition-colors"
          >
            {t('goHome')}
          </Link>
        </div>
        <p className="absolute text-sm text-center text-muted-foreground -translate-x-1/2 bottom-6 left-1/2">
          {t('copyright', { year: new Date().getFullYear() })}
        </p>
      </div>
    </>
  );
}
