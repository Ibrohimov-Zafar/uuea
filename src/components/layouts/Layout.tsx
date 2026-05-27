import type { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1 pt-[calc(40px+64px)] md:pt-[calc(40px+64px)]">
        {children}
      </main>
      <Footer />
    </div>
  );
}
