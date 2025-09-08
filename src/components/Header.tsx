import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Globe, User, LogOut, LogIn, UserPlus, Menu, X, Settings, Home } from 'lucide-react';
import NotificationBell from './NotificationBell';

import { useAuth } from '../hooks/useAuth';

interface HeaderProps {
  language: 'fr' | 'en';
  setLanguage: (lang: 'fr' | 'en') => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ language, setLanguage, isAuthenticated, setIsAuthenticated }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth(); // Utiliser le hook useAuth
  const isHomePage = location.pathname === '/';
  const isLoginPage = location.pathname === '/login';
  const isSignupPage = location.pathname === '/signup';
  const isSpacesPage = location.pathname === '/spaces';
  const isReservationPage = location.pathname.includes('/reservation');
  const isPublicPage = isHomePage || isLoginPage || isSignupPage || isSpacesPage || isReservationPage;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);


  // Utiliser le hook useAuth pour une gestion cohérente de l'authentification
  const { logout: authLogout, user: authUser, isAuthenticated: authIsAuthenticated } = useAuth();
  
  // État local pour la compatibilité
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    const checkAuth = () => {
      // Utiliser les données du hook useAuth en priorité
      if (authUser && authIsAuthenticated) {
        setCurrentUser(authUser);
        setUserRole(authUser.role || 'clients');
        setIsAuthenticated(true);
      } else {
        // Fallback vers sessionStorage si le hook n'est pas encore initialisé
        const adminUser = sessionStorage.getItem('currentUser');
        const clientUser = sessionStorage.getItem('currentClient');
        
        if (adminUser) {
          const user = JSON.parse(adminUser);
          setCurrentUser(user);
          setUserRole(user.role || 'admin');
          setIsAuthenticated(true);
        } else if (clientUser) {
          const user = JSON.parse(clientUser);
          setCurrentUser(user);
          setUserRole(user.role || 'clients');
          setIsAuthenticated(true);
        } else {
          setCurrentUser(null);
          setUserRole('');
          setIsAuthenticated(false);
        }
      }
    };

    // Vérifier au chargement
    checkAuth();

    // Écouter les événements de changement d'authentification
    const handleAuthChange = () => {
      checkAuth();
    };

    // Écouter les événements de stockage (pour les changements de sessionStorage)
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
  }, [setIsAuthenticated]);

  const translations = {
    fr: {
      home: 'Accueil',
      reservation: 'Réservation',
      logout: 'Déconnexion',
      login: 'Se connecter',
      signup: 'Créer un compte',
      spaces: 'Espaces'
    },
    en: {
      home: 'Home',
      reservation: 'Reservation',
      logout: 'Logout',
      login: 'Login',
      signup: 'Sign up',
      spaces: 'Spaces'
    }
  };

  const t = translations[language];

  const handleLogout = () => {
    console.log('🚪 Déconnexion immédiate...');
    
    // Nettoyer IMMÉDIATEMENT le sessionStorage
    sessionStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentClient');
    
    // Fermer le menu mobile si ouvert
    setIsMobileMenuOpen(false);
    
    // Réinitialiser immédiatement l'état local du Header
    setCurrentUser(null);
    setUserRole('');
    setIsAuthenticated(false);
    
    // Rediriger IMMÉDIATEMENT vers la page d'accueil
    window.location.href = '/';
    
    // Utiliser la fonction logout centralisée du hook useAuth après la redirection
    authLogout();
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const isAdmin = userRole === 'admin';

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center group">
              <div className="relative">
                <img 
                  src="/logo-nzoo-immo-header.svg" 
                  alt="Nzoo Immo" 
                  className="h-14 w-auto object-contain transition-all duration-500 group-hover:scale-110 group-hover:drop-shadow-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
                             <Link 
                 to="/" 
                 className={`px-6 py-3 rounded-2xl font-medium transition-all duration-300 relative overflow-hidden group ${
                   location.pathname === '/' 
                     ? 'text-white bg-nzoo-dark shadow-lg' 
                     : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                 }`}
               >
                 <span className="relative z-10">{t.home}</span>
                 {location.pathname === '/' && (
                   <div className="absolute inset-0 bg-nzoo-dark animate-pulse"></div>
                 )}
               </Link>
              
                             <Link 
                 to="/spaces" 
                 className={`px-6 py-3 rounded-2xl font-medium transition-all duration-300 relative overflow-hidden group ${
                   location.pathname === '/spaces' 
                     ? 'text-white bg-nzoo-dark shadow-lg' 
                     : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                 }`}
               >
                 <span className="relative z-10">{t.spaces}</span>
                 {location.pathname === '/spaces' && (
                   <div className="absolute inset-0 bg-nzoo-dark animate-pulse"></div>
                 )}
               </Link>
              
                             <Link 
                 to="/reservation/coworking" 
                 className={`px-6 py-3 rounded-2xl font-medium transition-all duration-300 relative overflow-hidden group ${
                   location.pathname.includes('/reservation') 
                     ? 'text-white bg-nzoo-dark shadow-lg' 
                     : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                 }`}
               >
                 <span className="relative z-10">{t.reservation}</span>
                 {location.pathname.includes('/reservation') && (
                   <div className="absolute inset-0 bg-nzoo-dark animate-pulse"></div>
                 )}
               </Link>
              
              {isAuthenticated && !isLoginPage && !isSignupPage && (
                                 <Link 
                   to="/admin/dashboard" 
                   className={`px-6 py-3 rounded-2xl font-medium transition-all duration-300 relative overflow-hidden group ${
                     location.pathname.includes('/admin') 
                       ? 'text-white bg-nzoo-dark shadow-lg' 
                       : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                   }`}
                 >
                   <span className="relative z-10">Admin</span>
                   {location.pathname.includes('/admin') && (
                     <div className="absolute inset-0 bg-nzoo-dark animate-pulse"></div>
                   )}
                 </Link>
              )}
              
            </nav>

            {/* Right side controls */}
            <div className="flex items-center space-x-3">
              {/* Language switcher */}
              <div className="hidden sm:flex items-center space-x-2 bg-gray-50 hover:bg-gray-100 rounded-2xl px-4 py-2 transition-all duration-300 group">
                <Globe className="w-4 h-4 text-gray-600 group-hover:text-gray-800 transition-colors duration-300" />
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as 'fr' | 'en')}
                  className="bg-transparent border-none text-sm font-medium text-gray-700 focus:outline-none cursor-pointer transition-colors duration-300"
                >
                  <option value="fr">FR</option>
                  <option value="en">EN</option>
                </select>
              </div>

              {/* User controls */}
              {isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  {/* Notifications */}
                  {(currentUser?.email || authUser?.email) && (
                    <NotificationBell 
                      userRole={userRole || authUser?.role || 'clients'} 
                      userEmail={currentUser?.email || authUser?.email || ''} 
                    />
                  )}
                  
                                     {/* User info */}
                   <div className="hidden md:flex items-center space-x-3 bg-nzoo-dark/10 rounded-2xl px-4 py-2 border border-nzoo-dark/20">
                     <div className="w-8 h-8 bg-nzoo-dark rounded-full flex items-center justify-center">
                       <User className="w-4 h-4 text-white" />
                     </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-800">
                        {currentUser?.full_name || currentUser?.username || currentUser?.email || 'Utilisateur'}
                      </span>
                    </div>
                  </div>
                  

                  
                  {/* Logout button */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition-all duration-300 bg-gray-50 hover:bg-red-50 rounded-2xl px-4 py-2 font-medium border border-gray-200 hover:border-red-200"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">{t.logout}</span>
                  </button>
                </div>
              ) : isPublicPage ? (
                // Options de connexion/création de compte sur toutes les pages publiques
                <div className="flex items-center space-x-3">
                  <Link
                    to="/login"
                    className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-all duration-300 bg-gray-50 hover:bg-gray-100 rounded-2xl px-4 py-2 font-medium border border-gray-200 hover:border-gray-300"
                  >
                    <LogIn className="w-4 h-4" />
                    <span className="hidden sm:inline">{t.login}</span>
                  </Link>
                                     <Link
                     to="/signup"
                     className="flex items-center space-x-2 text-white bg-nzoo-dark hover:bg-nzoo-dark-light transition-all duration-300 rounded-2xl px-4 py-2 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                   >
                    <UserPlus className="w-4 h-4" />
                    <span className="hidden sm:inline">{t.signup}</span>
                  </Link>
                </div>
              ) : (
                // Sur les autres pages, seulement le lien admin
                <Link
                  to="/admin/login"
                  className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-all duration-300 bg-gray-50 hover:bg-gray-100 rounded-2xl px-4 py-2 font-medium border border-gray-200 hover:border-gray-300"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Admin</span>
                </Link>
              )}



              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden flex items-center justify-center w-10 h-10 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-all duration-300"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5 text-gray-700" />
                ) : (
                  <Menu className="w-5 h-5 text-gray-700" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm">
          <div className="fixed top-20 left-0 right-0 bg-white border-b border-gray-200 shadow-xl">
            <div className="px-4 py-6 space-y-4">
              {/* Mobile Navigation */}
              <nav className="space-y-2">
                                 <Link 
                   to="/" 
                   onClick={closeMobileMenu}
                   className={`block px-4 py-3 rounded-2xl font-medium transition-all duration-300 ${
                     location.pathname === '/' 
                       ? 'text-white bg-nzoo-dark' 
                       : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                   }`}
                 >
                   {t.home}
                 </Link>
                
                                 <Link 
                   to="/spaces" 
                   onClick={closeMobileMenu}
                   className={`block px-4 py-3 rounded-2xl font-medium transition-all duration-300 ${
                     location.pathname === '/spaces' 
                       ? 'text-white bg-nzoo-dark' 
                       : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                   }`}
                 >
                   {t.spaces}
                 </Link>
                
                                 <Link 
                   to="/reservation/coworking" 
                   onClick={closeMobileMenu}
                   className={`block px-4 py-3 rounded-2xl font-medium transition-all duration-300 ${
                     location.pathname.includes('/reservation') 
                       ? 'text-white bg-nzoo-dark' 
                       : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                   }`}
                 >
                   {t.reservation}
                 </Link>
                
                {isAuthenticated && !isLoginPage && !isSignupPage && (
                                     <Link 
                     to="/admin/dashboard" 
                     onClick={closeMobileMenu}
                     className={`block px-4 py-3 rounded-2xl font-medium transition-all duration-300 ${
                       location.pathname.includes('/admin') 
                         ? 'text-white bg-nzoo-dark' 
                         : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                     }`}
                   >
                     Admin
                   </Link>
                )}
                
              </nav>

              {/* Mobile Language Switcher */}
              <div className="flex items-center space-x-2 bg-gray-50 rounded-2xl px-4 py-3">
                <Globe className="w-4 h-4 text-gray-600" />
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as 'fr' | 'en')}
                  className="bg-transparent border-none text-sm font-medium text-gray-700 focus:outline-none cursor-pointer"
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                </select>
              </div>

              {/* Mobile User Controls */}
              {isAuthenticated ? (
                <div className="space-y-3">
                                     <div className="flex items-center space-x-3 bg-nzoo-dark/10 rounded-2xl px-4 py-3 border border-nzoo-dark/20">
                     <div className="w-10 h-10 bg-nzoo-dark rounded-full flex items-center justify-center">
                       <User className="w-5 h-5 text-white" />
                     </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-800">
                        {currentUser?.full_name || currentUser?.username || currentUser?.email || 'Utilisateur'}
                      </span>
                    </div>
                  </div>
                  

                  
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center space-x-2 text-gray-700 hover:text-red-600 transition-all duration-300 bg-gray-50 hover:bg-red-50 rounded-2xl px-4 py-3 font-medium border border-gray-200 hover:border-red-200"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t.logout}</span>
                  </button>
                </div>
              ) : isPublicPage ? (
                <div className="space-y-3">
                  <Link
                    to="/login"
                    onClick={closeMobileMenu}
                    className="block w-full text-center text-gray-700 hover:text-gray-900 transition-all duration-300 bg-gray-50 hover:bg-gray-100 rounded-2xl px-4 py-3 font-medium border border-gray-200 hover:border-gray-300"
                  >
                    {t.login}
                  </Link>
                                     <Link
                     to="/signup"
                     onClick={closeMobileMenu}
                     className="block w-full text-center text-white bg-nzoo-dark hover:bg-nzoo-dark-light transition-all duration-300 rounded-2xl px-4 py-3 font-medium shadow-lg"
                   >
                     {t.signup}
                   </Link>
                </div>
              ) : (
                <Link
                  to="/admin/login"
                  onClick={closeMobileMenu}
                  className="block w-full text-center text-gray-700 hover:text-gray-900 transition-all duration-300 bg-gray-50 hover:bg-gray-100 rounded-2xl px-4 py-3 font-medium border border-gray-200 hover:border-gray-300"
                >
                  Admin
                </Link>
              )}
            </div>
          </div>
        </div>
      )}


    </>
  );
};

export default Header;