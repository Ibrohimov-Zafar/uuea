/**
 * UUEA official site config — contact, web, and social.
 */
export const SITE = {
  name: 'USA–Uzbekistan Entrepreneurs Association',
  shortName: 'UUEA',
  email: 'info@uuea.org',
  phone: '+1 (347) 944-9190',
  phoneTel: '+13479449190',
  /** Second US line (display); user-provided as alternate contact */
  phoneAlt: '+1 (915) 799-5555',
  phoneAltTel: '+19157995555',
  phoneUz: '+998 99-999-99-73',
  /** Empty = show UZ number as text only (no tel: link) */
  phoneUzTel: '',
  website: 'www.usa-entrepreneurs.com',
  websiteUrl: 'https://www.usa-entrepreneurs.com',
  social: {
    linkedin: 'https://www.linkedin.com/company/uuea',
    facebook: 'https://www.facebook.com/uueacom',
    twitter: '',
    instagram: 'https://www.instagram.com/uueacom',
  },
} as const;

export function siteReceiptFooter(): string {
  return `${SITE.email}  ·  ${SITE.website}`;
}
