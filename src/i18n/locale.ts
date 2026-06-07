import type { Lang } from '@/i18n/types';

const MONTHS_UZ = [
  'yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun',
  'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr',
];
const MONTHS_RU = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
];

/** Format ISO date for UI and PDF in the selected language */
export function formatDateLocale(iso: string, lang: Lang): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  if (lang === 'en') {
    return new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(d);
  }
  if (lang === 'ru') {
    return `${d.getDate()} ${MONTHS_RU[d.getMonth()]} ${d.getFullYear()} г.`;
  }
  return `${d.getDate()} ${MONTHS_UZ[d.getMonth()]} ${d.getFullYear()}`;
}

export function localeTag(lang: Lang): string {
  return lang === 'uz' ? 'uz-UZ' : lang === 'ru' ? 'ru-RU' : 'en-US';
}

/** Pick localized text: preferred lang → uz fallback */
export function localizedField(
  uz: string | null | undefined,
  ru: string | null | undefined,
  en: string | null | undefined,
  lang: Lang,
): string {
  if (lang === 'ru' && ru) return ru;
  if (lang === 'en' && en) return en;
  return uz || ru || en || '';
}
