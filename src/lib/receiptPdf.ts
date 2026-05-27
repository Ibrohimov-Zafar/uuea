import { translate } from '@/i18n/translations';
import { formatDateLocale } from '@/i18n/locale';
import type { Lang } from '@/i18n/types';

export type ReceiptOrder = {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  items?: unknown;
  customer_name?: string | null;
  customer_email?: string | null;
  stripe_payment_intent_id?: string | null;
  currency?: string;
};

const GOLD: [number, number, number] = [212, 175, 55];
const NAVY: [number, number, number] = [6, 20, 35];
const NAVY_CARD: [number, number, number] = [13, 31, 51];
const NAVY_ROW: [number, number, number] = [10, 28, 48];
const MUTED: [number, number, number] = [148, 163, 184];
const TEXT: [number, number, number] = [226, 232, 240];
const GREEN: [number, number, number] = [52, 211, 153];

type OrderItem = { name?: string; price?: number; plan_slug?: string; quantity?: number };

function parseItems(order: ReceiptOrder, lang: Lang): OrderItem[] {
  const fallback = [{ name: translate(lang, 'receiptMembership'), price: order.total_amount }];
  if (Array.isArray(order.items)) return order.items as OrderItem[];
  if (typeof order.items === 'string') {
    try {
      const p = JSON.parse(order.items);
      return Array.isArray(p) ? p : fallback;
    } catch {
      return fallback;
    }
  }
  return fallback;
}

function formatMoney(amount: number, currency = 'usd'): string {
  if (currency.toLowerCase() === 'usd') {
    return `$${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `${Number(amount).toLocaleString()} ${currency.toUpperCase()}`;
}

function statusLabel(order: ReceiptOrder, lang: Lang): { text: string; color: [number, number, number] } {
  if (order.status === 'completed') {
    return { text: translate(lang, 'confirmed').toUpperCase(), color: GREEN };
  }
  if (order.status === 'pending') {
    return { text: translate(lang, 'statusPending').toUpperCase(), color: [251, 191, 36] };
  }
  if (order.status === 'cancelled') {
    return { text: translate(lang, 'statusCancelled').toUpperCase(), color: [248, 113, 113] };
  }
  return { text: order.status.toUpperCase(), color: MUTED };
}

function drawCornerBrackets(doc: import('jspdf').jsPDF, W: number, H: number, margin: number, size: number) {
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.35);
  const m = margin;
  const s = size;
  doc.line(m, m, m + s, m);
  doc.line(m, m, m, m + s);
  doc.line(W - m, m, W - m - s, m);
  doc.line(W - m, m, W - m, m + s);
  doc.line(m, H - m, m + s, H - m);
  doc.line(m, H - m, m, H - m - s);
  doc.line(W - m, H - m, W - m - s, H - m);
  doc.line(W - m, H - m, W - m, H - m - s);
}

function drawGoldDivider(doc: import('jspdf').jsPDF, y: number, x1: number, x2: number) {
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.25);
  doc.line(x1, y, x2, y);
  doc.setFillColor(...GOLD);
  doc.circle(x1, y, 0.6, 'F');
  doc.circle(x2, y, 0.6, 'F');
}

/** Generate and download a branded payment receipt PDF in the selected language */
export async function downloadPaymentReceipt(order: ReceiptOrder, lang: Lang = 'uz'): Promise<void> {
  const { default: jsPDF } = await import('jspdf');
  const tr = (key: Parameters<typeof translate>[1], vars?: Record<string, string | number>) =>
    translate(lang, key, vars);

  const W = 210;
  const margin = 12;
  const items = parseItems(order, lang);
  const itemRows = items.length;
  const H = 168 + itemRows * 14 + (order.customer_name || order.customer_email ? 18 : 0) + (order.stripe_payment_intent_id ? 14 : 0);

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [W, H] });
  const contentW = W - margin * 2;

  doc.setFillColor(...NAVY);
  doc.rect(0, 0, W, H, 'F');

  doc.setFillColor(8, 26, 44);
  doc.rect(0, 0, W, 52, 'F');

  drawCornerBrackets(doc, W, H, 8, 10);

  const headerY = 14;
  doc.setFillColor(...GOLD);
  doc.roundedRect(margin, headerY, 11, 11, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...NAVY);
  doc.text('BC', margin + 5.5, headerY + 7.2, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...GOLD);
  doc.text('BIZNES CHAMBER', margin + 15, headerY + 5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...MUTED);
  doc.text(tr('receiptTagline'), margin + 15, headerY + 11);

  doc.setFillColor(...NAVY_CARD);
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.3);
  doc.roundedRect(W - margin - 38, headerY - 1, 38, 14, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...GOLD);
  doc.text(tr('receiptTitle'), W - margin - 19, headerY + 8, { align: 'center' });

  let y = 32;
  drawGoldDivider(doc, y, margin, W - margin);
  y += 8;

  const cardH = 28;
  doc.setFillColor(...NAVY_CARD);
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.35);
  doc.roundedRect(margin, y, contentW, cardH, 2, 2, 'FD');

  const colMid = margin + contentW / 2;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(...MUTED);
  doc.text(tr('receiptOrderId'), margin + 6, y + 8);
  doc.text(tr('receiptDate'), colMid + 6, y + 8);
  doc.text(tr('receiptStatus'), W - margin - 6, y + 8, { align: 'right' });

  doc.setFont('courier', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...TEXT);
  const shortId = `${order.id.slice(0, 8)}…${order.id.slice(-6)}`;
  doc.text(shortId, margin + 6, y + 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(formatDateLocale(order.created_at, lang), colMid + 6, y + 15);

  const st = statusLabel(order, lang);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...st.color);
  doc.text(st.text, W - margin - 6, y + 15, { align: 'right' });

  if (order.customer_name || order.customer_email) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...MUTED);
    const who = [order.customer_name, order.customer_email].filter(Boolean).join(' · ');
    doc.text(who.length > 72 ? who.slice(0, 72) + '…' : who, margin + 6, y + 23);
  }

  y += cardH + 10;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(...MUTED);
  doc.text(tr('receiptDesc'), margin + 4, y);
  doc.text(tr('receiptAmount'), W - margin - 4, y, { align: 'right' });
  y += 4;
  drawGoldDivider(doc, y, margin, W - margin);
  y += 6;

  const currency = order.currency || 'usd';
  items.forEach((item, idx) => {
    if (idx % 2 === 0) {
      doc.setFillColor(...NAVY_ROW);
      doc.rect(margin, y - 5, contentW, 11, 'F');
    }
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...TEXT);
    const label = item.name
      || (item.plan_slug ? tr('receiptMembershipPlan', { plan: item.plan_slug }) : tr('receiptPaymentDefault'));
    doc.text(label, margin + 4, y + 2);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...GOLD);
    const lineTotal = Number(item.price ?? order.total_amount) * (item.quantity ?? 1);
    doc.text(formatMoney(lineTotal, currency), W - margin - 4, y + 2, { align: 'right' });
    y += 12;
  });

  y += 4;

  doc.setFillColor(...NAVY_CARD);
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, y, contentW, 18, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text(tr('receiptTotal'), margin + 6, y + 11);
  doc.setFontSize(15);
  doc.setTextColor(...GOLD);
  doc.text(formatMoney(order.total_amount, currency), W - margin - 6, y + 12, { align: 'right' });

  y += 26;

  if (order.stripe_payment_intent_id) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.setTextColor(...MUTED);
    doc.text(tr('receiptPaymentRef'), margin, y);
    doc.setFont('courier', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 120, 140);
    doc.text(order.stripe_payment_intent_id, margin, y + 5);
    y += 12;
  }

  const footerY = H - 14;
  drawGoldDivider(doc, footerY - 4, margin + 20, W - margin - 20);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(...MUTED);
  doc.text(tr('receiptFooter'), W / 2, footerY + 2, { align: 'center' });
  doc.setFontSize(5.5);
  doc.setTextColor(90, 110, 130);
  doc.text(tr('receiptLegal', { year: new Date().getFullYear() }), W / 2, footerY + 7, { align: 'center' });

  doc.save(`chek-${order.id.slice(0, 8)}.pdf`);
}
