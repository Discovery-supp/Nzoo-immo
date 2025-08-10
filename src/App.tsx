import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Lazy loading des composants pour améliorer les performances
const Header = React.lazy(() => import('./components/Header'));
const HomePage = React.lazy(() => import('./pages/HomePage'));
const SpacesPage = React.lazy(() => import('./pages/SpacesPage'));
const ReservationPage = React.lazy(() => import('./pages/ReservationPage'));
const LoginPageSimple = React.lazy(() => import('./pages/LoginPageSimple'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));

function App() {
  const [language, setLanguage] = React.useState<'fr' | 'en'>('fr');
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  // Vérifier l'authentification au chargement
  React.useEffect(() => {
    console.log('🔍 App - Vérification authentification...');
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      console.log('✅ App - Utilisateur connecté trouvé');
      setIsAuthenticated(true);
    } else {
      console.log('❌ App - Aucun utilisateur connecté');
    }
  }, []);
  return (
    <Router>
      <React.Suspense fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
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
            element={<LoginPageSimple setIsAuthenticated={setIsAuthenticated} />} 
          />
          <Route 
            path="/admin/dashboard" 
            element={
              isAuthenticated ? (
                <AdminDashboard language={language} />
              ) : (
                <LoginPageSimple setIsAuthenticated={setIsAuthenticated} />
              )
            } 
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