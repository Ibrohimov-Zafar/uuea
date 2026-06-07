import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import IntersectObserver from '@/components/common/IntersectObserver';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { AuthGate } from '@/components/common/AuthGate';
import { LangProvider } from '@/contexts/LangContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { routes } from './routes';
import { RouteSeo } from '@/components/common/PageMeta';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <AuthGate>
            <LangProvider>
              <NotificationProvider>
                <RouteSeo />
                <IntersectObserver />
                <div className="flex flex-col min-h-screen">
                  <Routes>
                    {routes.map((route) => (
                      <Route
                        key={route.path}
                        path={route.path}
                        element={route.element}
                      />
                    ))}
                  </Routes>
                </div>
                <Toaster />
              </NotificationProvider>
            </LangProvider>
          </AuthGate>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
};

export default App;
