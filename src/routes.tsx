import type { ReactNode } from 'react';
import HomePage from './pages/HomePage';
import WhoWeArePage from './pages/WhoWeArePage';
import ServicesPage from './pages/ServicesPage';
import MembershipPage from './pages/MembershipPage';
import CorporateMembershipPage from './pages/CorporateMembershipPage';
import LawsPage from './pages/LawsPage';
import LawDetailPage from './pages/LawDetailPage';
import DirectoryPage from './pages/DirectoryPage';
import BusinessDetailPage from './pages/BusinessDetailPage';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import NewsPage from './pages/NewsPage';
import NewsDetailPage from './pages/NewsDetailPage';
import ContactPage from './pages/ContactPage';
import JoinPage from './pages/JoinPage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminPage from './pages/AdminPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import EventPaymentSuccessPage from './pages/EventPaymentSuccessPage';
import UnsubscribePage from './pages/UnsubscribePage';
import NotFound from './pages/NotFound';

export interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
  public?: boolean;
}

export const routes: RouteConfig[] = [
  { name: 'Bosh Sahifa',            path: '/',              element: <HomePage />,          public: true },
  { name: 'Biz Haqimizda',          path: '/biz-haqimizda', element: <WhoWeArePage />,      public: true },
  { name: 'Xizmatlar',              path: '/xizmatlar',     element: <ServicesPage />,      public: true },
  { name: "A'zolik",                path: '/azolik',        element: <MembershipPage />,    public: true },
  { name: 'Korporativ A\'zolik',    path: '/korporativ',    element: <CorporateMembershipPage />, public: true },
  { name: 'Qonunlar va Qarorlar',   path: '/qonunlar',      element: <LawsPage />,          public: true },
  { name: 'Huquqiy ma\'lumot',      path: '/qonunlar/:id',  element: <LawDetailPage />,     public: true },
  { name: 'Katalog',                path: '/katalog',       element: <DirectoryPage />,     public: true },
  { name: 'Biznes',                 path: '/katalog/:id',   element: <BusinessDetailPage />, public: true },
  { name: 'Tadbirlar',              path: '/tadbirlar',     element: <EventsPage />,        public: true },
  { name: 'Tadbir',                 path: '/tadbirlar/:id', element: <EventDetailPage />,   public: true },
  { name: 'Yangiliklar',            path: '/yangiliklar',   element: <NewsPage />,          public: true },
  { name: 'Yangilik',               path: '/yangiliklar/:id', element: <NewsDetailPage />,  public: true },
  { name: 'Aloqa',                  path: '/aloqa',         element: <ContactPage />,       public: true },
  { name: "A'zolikga Qo'shilish",   path: '/qoshilish',     element: <JoinPage />,          public: true },
  { name: 'Dashboard',              path: '/dashboard',     element: <DashboardPage />,     public: false },
  { name: 'Kirish',                 path: '/kirish',        element: <LoginPage />,         public: true },
  { name: "Ro'yxatdan O'tish",      path: '/royxat',        element: <RegisterPage />,      public: true },
  { name: 'Admin Panel',            path: '/admin',         element: <AdminPage />,         public: false },
  { name: "To'lov Muvaffaqiyatli",  path: '/payment-success', element: <PaymentSuccessPage />, public: true },
  { name: "Tadbir to'lovi",         path: '/event-payment-success', element: <EventPaymentSuccessPage />, public: true },
  { name: "Obunadan Chiqish",       path: '/unsubscribe',     element: <UnsubscribePage />,    public: true },
  { name: '404',                    path: '*',                element: <NotFound />,           public: true },
];
