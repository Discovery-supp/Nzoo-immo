import React, { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  isAuthenticated: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, isAuthenticated }) => {
  useEffect(() => {
    // Vérification immédiate de l'authentification
    const adminUser = sessionStorage.getItem('currentUser');
    const clientUser = sessionStorage.getItem('currentClient');
    const hasValidSession = adminUser || clientUser;
    
    if (!hasValidSession || !isAuthenticated) {
      // Rediriger immédiatement vers la page d'accueil
      window.location.href = '/';
      return;
    }
  }, [isAuthenticated]);

  // Vérification synchrone avant le rendu
  const adminUser = sessionStorage.getItem('currentUser');
  const clientUser = sessionStorage.getItem('currentClient');
  const hasValidSession = adminUser || clientUser;
  
  if (!hasValidSession || !isAuthenticated) {
    // Ne rien afficher et rediriger immédiatement
    window.location.href = '/';
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
