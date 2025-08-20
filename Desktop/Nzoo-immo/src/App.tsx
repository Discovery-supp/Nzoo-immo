import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Lazy loading des composants pour améliorer les performances
const Header = React.lazy(() => import('./components/Header'));
const HomePage = React.lazy(() => import('./pages/HomePage'));
const SpacesPage = React.lazy(() => import('./pages/SpacesPage'));
const ReservationPage = React.lazy(() => import('./pages/ReservationPage'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const ClientLoginPage = React.lazy(() => import('./pages/ClientLoginPage'));
const ClientSignupPage = React.lazy(() => import('./pages/ClientSignupPage'));
const ProtectedRoute = React.lazy(() => import('./components/ProtectedRoute'));

function App() {
  const [language, setLanguage] = React.useState<'fr' | 'en'>('fr');
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  // Vérifier l'authentification au chargement et écouter les changements
  React.useEffect(() => {
    const checkAuth = () => {
      const currentUser = sessionStorage.getItem('currentUser');
      const currentClient = sessionStorage.getItem('currentClient');
      
      if (currentUser || currentClient) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    };

    // Vérifier au chargement
    checkAuth();

    // Écouter les événements de changement d'authentification
    const handleAuthChange = () => {
      checkAuth();
    };

    // Écouter les changements de localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'currentUser' || e.key === 'currentClient') {
        checkAuth();
      }
    };

    // Ajouter les écouteurs d'événements
    window.addEventListener('authStateChanged', handleAuthChange);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('authStateChanged', handleAuthChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  return (
    <Router>
      <React.Suspense fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nzoo-dark mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement...</p>
          </div>
        </div>
      }>
        <Header 
          language={language}
          setLanguage={setLanguage}
          isAuthenticated={isAuthenticated}
          setIsAuthenticated={setIsAuthenticated}
        />
        <Routes>
          {/* Page d'accueil */}
          <Route 
            path="/" 
            element={<HomePage />} 
          />
          
          {/* Page des espaces */}
          <Route 
            path="/spaces" 
            element={<SpacesPage language={language} />} 
          />
          
          {/* Routes d'administration */}
          <Route 
            path="/admin/login" 
            element={<LoginPage setIsAuthenticated={setIsAuthenticated} language={language} />} 
          />
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <AdminDashboard language={language} />
              </ProtectedRoute>
            } 
          />
          
          {/* Routes client */}
          <Route 
            path="/login" 
            element={<ClientLoginPage />} 
          />
          <Route 
            path="/signup" 
            element={<ClientSignupPage />} 
          />
          
          {/* Routes pour les différents types d'espaces */}
          <Route 
            path="/reservation/coworking" 
            element={<ReservationPage language={language} spaceType="coworking" />} 
          />
          <Route 
            path="/reservation/bureau-prive" 
            element={<ReservationPage language={language} spaceType="bureau-prive" />} 
          />
          <Route 
            path="/reservation/domiciliation" 
            element={<ReservationPage language={language} spaceType="domiciliation" />} 
          />
          
          {/* Routes en anglais */}
          <Route 
            path="/en" 
            element={<HomePage />} 
          />
          <Route 
            path="/en/spaces" 
            element={<SpacesPage language={language} />} 
          />
          <Route 
            path="/en/reservation/coworking" 
            element={<ReservationPage language={language} spaceType="coworking" />} 
          />
          <Route 
            path="/en/reservation/bureau-prive" 
            element={<ReservationPage language={language} spaceType="bureau-prive" />} 
          />
          <Route 
            path="/en/reservation/domiciliation" 
            element={<ReservationPage language={language} spaceType="domiciliation" />} 
          />
        </Routes>
      </React.Suspense>
    </Router>
  );
}

export default App;