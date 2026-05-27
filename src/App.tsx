import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import IntersectObserver from '@/components/common/IntersectObserver';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { AuthGate } from '@/components/common/AuthGate';
import { LangProvider } from '@/contexts/LangContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { routes } from './routes';

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <AuthGate>
          <LangProvider>
            <NotificationProvider>
              <IntersectObserver />
              <div className="flex flex-col min-h-screen">
                <main className="flex-grow">
                  <Routes>
                    {routes.map((route, index) => (
                      <Route
                        key={index}
                        path={route.path}
                        element={route.element}
                      />
                    ))}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </main>
              </div>
              <Toaster />
            </NotificationProvider>
          </LangProvider>
        </AuthGate>
      </AuthProvider>
    </Router>
  );
};

export default App;
