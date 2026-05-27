import type { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export function AuthGate({ children }: { children: ReactNode }) {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-navy-dark">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
