import { http, API_BASE_URL } from './http';
import type {
  Profile,
  Membership,
  Business,
  Event,
  Notification,
  MembershipPlanRow,
  EventRegistration,
  Order,
  NewsPost,
  LegalResource,
  Partner,
  Testimonial,
  SiteStat,
  SiteService,
} from '@/types/types';

/** Dashboard business submission row */
export type BusinessSubmissionRow = {
  id: string;
  name: string;
  category: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  admin_note: string | null;
};

export type EventRegistrationWithEvent = EventRegistration & {
  event?: Pick<Event, 'title' | 'event_date' | 'location' | 'price_usd'>;
};

export { API_BASE_URL };

/** Go API sometimes returns `null` instead of `[]` for empty lists. */
function asArray<T>(data: T[] | null | undefined): T[] {
  return Array.isArray(data) ? data : [];
}

export async function getMembershipPlans(): Promise<MembershipPlanRow[]> {
  const { data } = await http.get<MembershipPlanRow[]>('/membership-plans');
  return asArray(data);
}

export async function getMyMembership(): Promise<Membership | null> {
  const { data } = await http.get<Membership | null>('/memberships/me');
  return data;
}

export async function cancelMyMembership(): Promise<Membership | null> {
  const { data } = await http.patch<Membership | null>('/memberships/me/cancel');
  return data;
}

export async function getBusiness(id: string): Promise<Business> {
  const { data } = await http.get<Business>('/businesses/detail', { params: { id } });
  return data;
}

export async function getNewsPost(id: string): Promise<NewsPost> {
  const { data } = await http.get<NewsPost>('/news/detail', { params: { id } });
  return data;
}

export async function getBusinesses(params?: {
  category?: string;
  region?: string;
  search?: string;
  sort?: string;
  limit?: number;
  offset?: number;
}): Promise<Business[]> {
  const { data } = await http.get<Business[]>('/businesses', { params });
  return asArray(data);
}

export async function getEvents(active = true): Promise<Event[]> {
  const { data } = await http.get<Event[]>('/events', { params: { active: active ? 'true' : 'false' } });
  return asArray(data);
}

// News
export async function getNews(): Promise<NewsPost[]> {
  const { data } = await http.get<NewsPost[]>('/news');
  return asArray(data);
}

export async function getLegalResources(): Promise<LegalResource[]> {
  const { data } = await http.get<LegalResource[]>('/legal-resources');
  return asArray(data);
}

export async function getLegalResource(id: string): Promise<LegalResource> {
  const { data } = await http.get<LegalResource>('/legal-resources/detail', { params: { id } });
  return data;
}

export async function adminListLegalResources(): Promise<LegalResource[]> {
  const { data } = await http.get<LegalResource[]>('/admin/legal-resources');
  return asArray(data);
}

export type LegalResourcePayload = {
  id?: string;
  title: string;
  excerpt: string;
  body: string;
  category: string;
  resource_type: string;
  source: string;
  published_date: string;
  is_featured?: boolean;
  status?: 'published' | 'draft';
};

export async function adminUpsertLegalResource(body: LegalResourcePayload): Promise<{ id: string }> {
  const { data } = await http.post<{ id: string }>('/admin/legal-resources', body);
  return data;
}

export async function adminDeleteLegalResource(id: string): Promise<void> {
  await http.delete('/admin/legal-resources', { params: { id } });
}

export async function createNews(body: Pick<NewsPost, 'title' | 'body'> & Partial<Pick<NewsPost, 'excerpt' | 'category' | 'image_url'>>): Promise<{ id: string }> {
  const { data } = await http.post<{ id: string }>('/news', body);
  return data;
}

export async function getEventSpots(id: string): Promise<{ spots_remaining: number } | null> {
  const { data } = await http.get<{ spots_remaining: number } | null>('/events/spots', { params: { id } });
  return data;
}

export async function getNotifications(): Promise<Notification[]> {
  const { data } = await http.get<Notification[]>('/notifications');
  return asArray(data);
}

export async function markNotificationRead(id: string): Promise<void> {
  await http.patch(`/notifications/${id}/read`);
}

export async function markAllNotificationsRead(): Promise<void> {
  await http.post('/notifications/read-all');
}

export async function deleteNotification(id: string): Promise<void> {
  await http.delete(`/notifications/${id}`);
}

export async function createHeroLead(email: string, source = 'hero_form'): Promise<{ id: string }> {
  const { data } = await http.post<{ id: string }>('/hero-leads', { email, source });
  return data;
}

export async function adminMembershipApplications(): Promise<Record<string, unknown>[]> {
  const { data } = await http.get<Record<string, unknown>[]>('/admin/list', {
    params: { table: 'membership_applications', limit: 500 },
  });
  return data;
}

export type ContactMessagePayload = {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  website?: string;
};

export async function createContactMessage(body: ContactMessagePayload): Promise<{ id: string }> {
  const { data } = await http.post<{ id: string; ok: boolean }>('/contact-messages', body);
  return { id: data.id };
}

export async function adminContactMessages(): Promise<Record<string, unknown>[]> {
  const { data } = await http.get<Record<string, unknown>[]>('/admin/list', { params: { table: 'contact_messages', limit: 500 } });
  return asArray(data);
}

export async function adminDeleteContactMessage(id: string): Promise<void> {
  await http.delete('/admin/contact-messages', { params: { id } });
}

export async function unsubscribeHeroLead(email: string): Promise<void> {
  await http.post('/hero-leads/unsubscribe', { email });
}

export async function unsubscribeByToken(token: string): Promise<{ already: boolean }> {
  const { data } = await http.get<{ ok: boolean; already?: boolean }>('/hero-leads/unsubscribe', { params: { token } });
  return { already: Boolean(data.already) };
}

export async function updateProfile(body: Partial<Pick<Profile, 'full_name' | 'phone' | 'avatar_url'>>): Promise<Profile> {
  const { data } = await http.patch<{ profile: Profile }>('/profiles/me', body);
  return data.profile;
}

export async function changePassword(password: string): Promise<void> {
  await http.post('/auth/change-password', { password });
}

export async function getMyBusinessSubmissions(): Promise<BusinessSubmissionRow[]> {
  const { data } = await http.get<BusinessSubmissionRow[]>('/business-submissions/me');
  return asArray(data);
}

export async function createBusinessSubmission(body: Record<string, unknown>): Promise<{ id: string }> {
  const { data } = await http.post<{ id: string }>('/business-submissions', body);
  return data;
}

export async function getMyEventRegistrations(): Promise<EventRegistrationWithEvent[]> {
  const { data } = await http.get<EventRegistrationWithEvent[]>('/event-registrations/me');
  return asArray(data);
}

export async function getMyOrders(): Promise<Order[]> {
  const { data } = await http.get<Order[]>('/orders/me');
  return asArray(data);
}

export async function getMySavedCards(): Promise<Record<string, unknown>[]> {
  const { data } = await http.get<Record<string, unknown>[]>('/saved-cards/me');
  return asArray(data);
}

export async function stripeCheckout(body: Record<string, unknown>): Promise<{ url: string }> {
  const { data } = await http.post<{ url: string; data?: { url: string } }>('/stripe/checkout', body);
  return { url: data.url || data.data?.url || '' };
}

export async function stripeVerifyPayment(sessionId: string): Promise<{
  verified: boolean;
  amount?: number;
  currency?: string;
  customerEmail?: string;
}> {
  const { data } = await http.post<{
    verified: boolean;
    amount?: number;
    currency?: string;
    customerEmail?: string;
  }>('/stripe/verify-payment', { session_id: sessionId });
  return data;
}

export async function eventCheckout(body: Record<string, unknown>): Promise<Record<string, unknown>> {
  const { data } = await http.post<Record<string, unknown>>('/stripe/event-checkout', body);
  return data;
}

export async function sendEmail(body: Record<string, unknown>): Promise<void> {
  await http.post('/email/send', body);
}

export async function uploadFile(file: File): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  const { data } = await http.post<{ url: string }>('/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  const path = data.url.startsWith('http') ? data.url : `${API_BASE_URL}${data.url}`;
  return path;
}

// Admin
export async function adminStats(): Promise<Record<string, unknown>> {
  const { data } = await http.get<Record<string, unknown>>('/admin/stats');
  return data;
}

export async function adminList<T>(table: string, limit = 100): Promise<T[]> {
  const { data } = await http.get<T[]>('/admin/list', { params: { table, limit } });
  return asArray(data);
}

export async function adminUpdateUser(body: Record<string, unknown>): Promise<void> {
  await http.patch('/admin/users', body);
}

export async function adminDeleteUser(id: string): Promise<void> {
  await http.delete('/admin/users', { params: { id } });
}

export async function adminUpsertBusiness(body: Record<string, unknown>): Promise<{ id: string }> {
  const { data } = await http.post<{ id: string }>('/admin/businesses', body);
  return data;
}

export async function adminDeleteBusiness(id: string): Promise<void> {
  await http.delete('/admin/businesses', { params: { id } });
}

export async function adminReviewSubmission(body: Record<string, unknown>): Promise<void> {
  await http.post('/admin/submissions/review', body);
}

export async function adminUpsertEvent(body: Record<string, unknown>): Promise<{ id: string }> {
  const { data } = await http.post<{ id: string }>('/admin/events', body);
  return data;
}

export async function adminDeleteEvent(id: string): Promise<void> {
  await http.delete('/admin/events', { params: { id } });
}

export async function adminSendNotifications(body: {
  user_ids: string[];
  type: string;
  title: string;
  body: string;
  link?: string;
}): Promise<void> {
  await http.post('/admin/notifications', body);
}

export async function adminListNews(): Promise<NewsPost[]> {
  const { data } = await http.get<NewsPost[]>('/admin/news');
  return asArray(data);
}

export async function adminReviewNews(body: { id: string; status: 'approved' | 'rejected'; is_featured?: boolean }): Promise<void> {
  await http.post('/admin/news/review', body);
}

export async function adminDeleteNews(id: string): Promise<void> {
  await http.delete('/admin/news', { params: { id } });
}

// Super admin: membership plans
export async function adminUpsertPlan(body: { slug: string; name: string; price_usd: number; features: string[] }): Promise<void> {
  await http.post('/admin/plans', body);
}

export async function adminDeletePlan(slug: string): Promise<void> {
  await http.delete('/admin/plans', { params: { slug } });
}

export async function adminHeroLeads(): Promise<Record<string, unknown>[]> {
  const { data } = await http.get<Record<string, unknown>[]>('/admin/hero-leads');
  return asArray(data);
}

export async function adminDeleteHeroLead(id: string): Promise<void> {
  await http.delete('/admin/hero-leads', { params: { id } });
}

export async function adminImportHeroLeads(leads: { email: string }[]): Promise<void> {
  await http.post('/admin/hero-leads/import', { leads });
}

// ─── Homepage public data ─────────────────────────────────────────────────────

export async function getPartners(): Promise<Partner[]> {
  const { data } = await http.get<Partner[]>('/partners');
  return asArray(data);
}

export async function getTestimonials(): Promise<Testimonial[]> {
  const { data } = await http.get<Testimonial[]>('/testimonials');
  return asArray(data);
}

export async function getSiteStats(): Promise<SiteStat[]> {
  const { data } = await http.get<SiteStat[]>('/site-stats');
  return asArray(data);
}

export async function getSiteServices(): Promise<SiteService[]> {
  const { data } = await http.get<SiteService[]>('/site-services');
  return asArray(data);
}

// ─── Homepage admin ───────────────────────────────────────────────────────────

export type PartnerPayload = { id?: string; name: string; logo_url?: string; website?: string; sort_order?: number; is_active?: boolean };
export async function adminUpsertPartner(body: PartnerPayload): Promise<{ id: string }> {
  const { data } = await http.post<{ id: string }>('/admin/partners', body);
  return data;
}
export async function adminDeletePartner(id: string): Promise<void> {
  await http.delete('/admin/partners', { params: { id } });
}

export type TestimonialPayload = { id?: string; name: string; company: string; role: string; review: string; avatar?: string; rating?: number; sort_order?: number; is_active?: boolean };
export async function adminUpsertTestimonial(body: TestimonialPayload): Promise<{ id: string }> {
  const { data } = await http.post<{ id: string }>('/admin/testimonials', body);
  return data;
}
export async function adminDeleteTestimonial(id: string): Promise<void> {
  await http.delete('/admin/testimonials', { params: { id } });
}

export type SiteStatPayload = { id?: string; label: string; value: number; suffix?: string; sort_order?: number };
export async function adminUpsertSiteStat(body: SiteStatPayload): Promise<{ id: string }> {
  const { data } = await http.post<{ id: string }>('/admin/site-stats', body);
  return data;
}
export async function adminDeleteSiteStat(id: string): Promise<void> {
  await http.delete('/admin/site-stats', { params: { id } });
}

export type SiteServicePayload = { id?: string; icon?: string; title: string; subtitle: string; description: string; features?: string[]; sort_order?: number; is_active?: boolean };
export async function adminUpsertSiteService(body: SiteServicePayload): Promise<{ id: string }> {
  const { data } = await http.post<{ id: string }>('/admin/site-services', body);
  return data;
}
export async function adminDeleteSiteService(id: string): Promise<void> {
  await http.delete('/admin/site-services', { params: { id } });
}

export async function adminCampaigns(): Promise<Record<string, unknown>[]> {
  const { data } = await http.get<Record<string, unknown>[]>('/admin/campaigns');
  return asArray(data);
}

export async function adminCreateCampaign(body: Record<string, unknown>): Promise<{ id: string }> {
  const { data } = await http.post<{ id: string }>('/admin/campaigns', body);
  return data;
}

export async function adminCancelCampaign(id: string): Promise<void> {
  await http.post('/admin/campaigns/cancel', null, { params: { id } });
}

export async function adminMembershipsForUsers(userIds: string[]): Promise<Membership[]> {
  const { data } = await http.get<Membership[]>('/admin/memberships', {
    params: { user_ids: userIds.join(',') },
  });
  return asArray(data);
}

export async function adminGenericUpdate(table: string, id: string, values: Record<string, unknown>): Promise<void> {
  await http.post('/admin/update', { table, id, values });
}
