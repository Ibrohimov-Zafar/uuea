export type UserRole = 'user' | 'admin' | 'super_admin' | 'business_owner';

export interface Partner {
  id: string;
  name: string;
  logo_url: string | null;
  website: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Testimonial {
  id: string;
  name: string;
  company: string;
  role: string;
  review: string;
  avatar: string;
  rating: number;
  sort_order: number;
  created_at: string;
}

export interface SiteStat {
  id: string;
  label: string;
  value: number;
  suffix: string;
  sort_order: number;
  updated_at: string;
}

export interface SiteService {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  sort_order: number;
  created_at: string;
}
export type MembershipPlan = 'starter' | 'business' | 'corporate' | 'international';
export type MembershipStatus = 'active' | 'inactive' | 'pending' | 'cancelled';
export type OrderStatus = 'pending' | 'completed' | 'cancelled' | 'refunded';
export type EventRegistrationStatus = 'confirmed' | 'pending' | 'cancelled';
export type NotificationType = 'new_event' | 'membership_expiring' | 'membership_expired' | 'new_message' | 'general';
export type NewsStatus = 'pending' | 'approved' | 'rejected';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export type LegalResourceStatus = 'published' | 'draft';
export type LegalResourceType = 'law' | 'decree' | 'business_news' | 'legal_info';

export interface LegalResource {
  id: string;
  title: string;
  title_ru?: string | null;
  title_en?: string | null;
  excerpt: string;
  excerpt_ru?: string | null;
  excerpt_en?: string | null;
  body: string;
  body_ru?: string | null;
  body_en?: string | null;
  category: string;
  resource_type: LegalResourceType;
  source: string;
  published_date: string;
  is_featured: boolean | number;
  status: LegalResourceStatus;
  created_at: string;
  updated_at: string;
}

export interface NewsPost {
  id: string;
  author_id: string | null;
  title: string;
  title_ru?: string | null;
  title_en?: string | null;
  excerpt: string | null;
  excerpt_ru?: string | null;
  excerpt_en?: string | null;
  body: string;
  body_ru?: string | null;
  body_en?: string | null;
  category: string;
  image_url: string | null;
  status: NewsStatus;
  is_featured: boolean;
  published_at: string | null;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  username: string | null;
  email: string | null;
  phone: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface MembershipPlanRow {
  id: number;
  slug: MembershipPlan;
  name: string;
  price_usd: number;
  features: string[];
  created_at: string;
}

export interface Membership {
  id: string;
  user_id: string;
  plan_slug: MembershipPlan;
  status: MembershipStatus;
  starts_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Business {
  id: string;
  owner_id: string | null;
  name: string;
  category: string;
  description: string | null;
  website: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  logo_url: string | null;
  region: string | null;
  latitude: number | null;
  longitude: number | null;
  is_vip: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  title: string;
  title_ru?: string | null;
  title_en?: string | null;
  description: string | null;
  description_ru?: string | null;
  description_en?: string | null;
  category: string;
  location: string;
  event_date: string;
  event_time: string | null;
  price_usd: number;
  spots_total: number;
  spots_remaining: number;
  image_url: string | null;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EventRegistration {
  id: string;
  event_id: string;
  user_id: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  company: string | null;
  status: EventRegistrationStatus;
  payment_status: 'free' | 'pending' | 'paid' | null;
  order_id: string | null;
  amount_paid: number | null;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string | null;
  items: unknown;
  total_amount: number;
  currency: string;
  status: OrderStatus;
  stripe_session_id: string | null;
  stripe_payment_intent_id: string | null;
  customer_email: string | null;
  customer_name: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}
