import { useState, useEffect } from 'react';

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: string;
  full_name: string;
  phone?: string;
  company?: string;
  address?: string;
  activity?: string;
  avatar_url?: string;
  created_at: string;
  is_active: boolean;
}

export interface SessionData {
  user: AuthUser;
  type: 'admin' | 'client';
}

// Configuration de la session
const SESSION_CONFIG = {
  // Clés de stockage
  STORAGE_KEYS: {
    ADMIN: 'currentUser',
    CLIENT: 'currentClient'
  }
};

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fonction pour nettoyer une session
  const clearSession = (storageKey: string) => {
    sessionStorage.removeItem(storageKey);
    console.log(`🔒 Session nettoyée: ${storageKey}`);
  };

  // Fonction pour créer une nouvelle session
  const createSession = (userData: AuthUser, type: 'admin' | 'client'): SessionData => {
    return {
      user: userData,
      type
    };
  };

  // Fonction pour sauvegarder une session
  const saveSession = (sessionData: SessionData) => {
    const storageKey = sessionData.type === 'admin' 
      ? SESSION_CONFIG.STORAGE_KEYS.ADMIN 
      : SESSION_CONFIG.STORAGE_KEYS.CLIENT;
    
    sessionStorage.setItem(storageKey, JSON.stringify(sessionData));
  };

  // Fonction pour charger une session depuis le sessionStorage
  const loadSession = (): SessionData | null => {
    const adminSession = sessionStorage.getItem(SESSION_CONFIG.STORAGE_KEYS.ADMIN);
    const clientSession = sessionStorage.getItem(SESSION_CONFIG.STORAGE_KEYS.CLIENT);

    if (adminSession) {
      try {
        const sessionData: SessionData = JSON.parse(adminSession);
        return sessionData;
      } catch (error) {
        console.error('Erreur lors du parsing de la session admin:', error);
        clearSession(SESSION_CONFIG.STORAGE_KEYS.ADMIN);
      }
    }

    if (clientSession) {
      try {
        const sessionData: SessionData = JSON.parse(clientSession);
        return sessionData;
      } catch (error) {
        console.error('Erreur lors du parsing de la session client:', error);
        clearSession(SESSION_CONFIG.STORAGE_KEYS.CLIENT);
      }
    }

    return null;
  };

  // Fonction pour vérifier l'authentification
  const checkAuth = () => {
    const sessionData = loadSession();
    
    if (sessionData) {
      setUser(sessionData.user);
      setIsAuthenticated(true);
      console.log(`🔐 Session active pour ${sessionData.user.username}`);
    } else {
      setUser(null);
      setIsAuthenticated(false);
      console.log('❌ Aucune session trouvée');
    }
  };

  useEffect(() => {
    // Vérifier l'authentification au chargement
    checkAuth();
    setLoading(false);

    // Écouter les événements de changement d'authentification
    const handleAuthChange = () => {
      checkAuth();
    };

    // Écouter les changements de sessionStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === SESSION_CONFIG.STORAGE_KEYS.ADMIN || e.key === SESSION_CONFIG.STORAGE_KEYS.CLIENT) {
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

  const login = (userData: AuthUser, type: 'admin' | 'client' = 'client') => {
    const sessionData = createSession(userData, type);
    saveSession(sessionData);
    
    setUser(userData);
    setIsAuthenticated(true);
    
    console.log(`✅ Connexion réussie pour ${userData.username}`);
    
    // Émettre un événement pour notifier les autres composants
    window.dispatchEvent(new CustomEvent('authStateChanged', { 
      detail: { user: userData, type } 
    }));
  };

  const logout = () => {
    sessionStorage.removeItem(SESSION_CONFIG.STORAGE_KEYS.ADMIN);
    sessionStorage.removeItem(SESSION_CONFIG.STORAGE_KEYS.CLIENT);
    setUser(null);
    setIsAuthenticated(false);
    
    console.log('🚪 Déconnexion effectuée');
    
    // Émettre un événement pour notifier les autres composants
    window.dispatchEvent(new CustomEvent('authStateChanged', { 
      detail: { user: null, type: 'logout' } 
    }));
  };

  const isAdmin = () => user?.role === 'admin';
  const isUser = () => user?.role === 'user';
  const isClient = () => user?.role === 'clients';
  const hasPermission = (permission: string) => {
    if (isAdmin()) return true;
    if (permission === 'dashboard' && (isAdmin() || isUser())) return true;
    return false;
  };

  return {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    isAdmin,
    isUser,
    isClient,
    hasPermission,
    // Configuration de session pour les composants qui en ont besoin
    sessionConfig: SESSION_CONFIG
  };
};