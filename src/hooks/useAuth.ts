import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { AuditService } from '../services/auditService';

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
  provider?: string; // Fournisseur d'authentification sociale
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

  // Fonction pour vérifier l'authentification Supabase
  const checkSupabaseAuth = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Erreur lors de la vérification de la session Supabase:', error);
        return null;
      }

      if (session && session.user) {
        // Transformer les données utilisateur Supabase
        const user: AuthUser = {
          id: session.user.id,
          username: session.user.email?.split('@')[0] || session.user.id,
          email: session.user.email || '',
          role: 'clients', // Par défaut, les utilisateurs sociaux sont des clients
          full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || '',
          phone: session.user.phone || '',
          company: session.user.user_metadata?.company || '',
          address: session.user.user_metadata?.address || '',
          activity: session.user.user_metadata?.activity || '',
          avatar_url: session.user.user_metadata?.avatar_url || '',
          created_at: session.user.created_at,
          is_active: true,
          provider: session.user.app_metadata?.provider
        };

        return user;
      }

      return null;
    } catch (error) {
      console.error('Erreur lors de la vérification Supabase:', error);
      return null;
    }
  };

  // Fonction pour vérifier l'authentification
  const checkAuth = async () => {
    // Vérifier d'abord la session locale
    const sessionData = loadSession();
    
    if (sessionData) {
      setUser(sessionData.user);
      setIsAuthenticated(true);
      console.log(`🔐 Session locale active pour ${sessionData.user.username}`);
      return;
    }

    // Vérifier la session Supabase
    const supabaseUser = await checkSupabaseAuth();
    
    if (supabaseUser) {
      setUser(supabaseUser);
      setIsAuthenticated(true);
      console.log(`🔐 Session Supabase active pour ${supabaseUser.username}`);
      
      // Sauvegarder la session locale
      const sessionData = createSession(supabaseUser, 'client');
      saveSession(sessionData);
      return;
    }

    // Aucune session trouvée
    setUser(null);
    setIsAuthenticated(false);
    console.log('❌ Aucune session trouvée');
  };

  useEffect(() => {
    // Vérifier l'authentification au chargement
    checkAuth().finally(() => {
      setLoading(false);
    });

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

    // Écouter les changements d'authentification Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Changement d\'état d\'authentification Supabase:', event);
      
      if (event === 'SIGNED_IN' && session) {
        await checkAuth();
      } else if (event === 'SIGNED_OUT') {
        logout();
      }
    });

    // Ajouter les écouteurs d'événements
    window.addEventListener('authStateChanged', handleAuthChange);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('authStateChanged', handleAuthChange);
      window.removeEventListener('storage', handleStorageChange);
      subscription.unsubscribe();
    };
  }, []);

  const login = (userData: AuthUser, type: 'admin' | 'client' = 'client') => {
    const sessionData = createSession(userData, type);
    saveSession(sessionData);
    
    setUser(userData);
    setIsAuthenticated(true);
    
    console.log(`✅ Connexion réussie pour ${userData.username}`);
    try {
      AuditService.record({
        actorId: userData.id,
        actorRole: type === 'admin' ? 'admin' : 'staff',
        action: 'LOGIN',
        metadata: { username: userData.username, email: userData.email },
        ip: undefined,
        userAgent: navigator.userAgent,
      });
    } catch {}
    
    // Émettre un événement pour notifier les autres composants
    window.dispatchEvent(new CustomEvent('authStateChanged', { 
      detail: { user: userData, type } 
    }));
  };

  const logout = async () => {
    // Déconnexion de Supabase si nécessaire
    if (user?.provider) {
      try {
        await supabase.auth.signOut();
      } catch (error) {
        console.error('Erreur lors de la déconnexion Supabase:', error);
      }
    }

    // Nettoyer les sessions locales
    sessionStorage.removeItem(SESSION_CONFIG.STORAGE_KEYS.ADMIN);
    sessionStorage.removeItem(SESSION_CONFIG.STORAGE_KEYS.CLIENT);
    
    setUser(null);
    setIsAuthenticated(false);
    
    console.log('🚪 Déconnexion effectuée');
    try {
      AuditService.record({
        actorId: user?.id || 'unknown',
        actorRole: user?.role === 'admin' ? 'admin' : 'staff',
        action: 'LOGOUT',
        metadata: { username: user?.username, email: user?.email },
        ip: undefined,
        userAgent: navigator.userAgent,
      });
    } catch {}
    
    // Émettre un événement pour notifier les autres composants
    window.dispatchEvent(new CustomEvent('authStateChanged', { 
      detail: { user: null, type: 'logout' } 
    }));
  };

  const isAdmin = () => user?.role === 'admin';
  const isUser = () => user?.role === 'user';
  const isClient = () => user?.role === 'clients';
  const isSocialUser = () => !!user?.provider;
  
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
    isSocialUser,
    hasPermission,
    // Configuration de session pour les composants qui en ont besoin
    sessionConfig: SESSION_CONFIG
  };
};