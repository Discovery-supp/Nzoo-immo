import { supabase } from './supabaseClient';

export interface SocialAuthProvider {
  id: string;
  name: string;
  icon: string;
  color: string;
  logoComponent?: string; // Référence au composant logo
}

export interface SocialAuthResponse {
  success: boolean;
  user?: any;
  error?: string;
  message?: string;
}

// Configuration des fournisseurs d'authentification sociale
export const SOCIAL_PROVIDERS: SocialAuthProvider[] = [
  {
    id: 'google',
    name: 'Google',
    icon: 'google', // Référence au logo Google
    color: '#4285F4',
    logoComponent: 'GoogleLogo'
  },
  {
    id: 'apple',
    name: 'Apple',
    icon: 'apple', // Référence au logo Apple
    color: '#000000',
    logoComponent: 'AppleLogo'
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: 'facebook', // Référence au logo Facebook
    color: '#1877F2',
    logoComponent: 'FacebookLogo'
  }
];

// Service d'authentification Google
export const googleAuth = async (): Promise<SocialAuthResponse> => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      message: 'Redirection vers Google...'
    };
  } catch (error) {
    return {
      success: false,
      error: 'Erreur lors de l\'authentification Google'
    };
  }
};

// Service d'authentification Apple
export const appleAuth = async (): Promise<SocialAuthResponse> => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      message: 'Redirection vers Apple...'
    };
  } catch (error) {
    return {
      success: false,
      error: 'Erreur lors de l\'authentification Apple'
    };
  }
};

// Service d'authentification Facebook
export const facebookAuth = async (): Promise<SocialAuthResponse> => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      message: 'Redirection vers Facebook...'
    };
  } catch (error) {
    return {
      success: false,
      error: 'Erreur lors de l\'authentification Facebook'
    };
  }
};

// Fonction générique pour l'authentification sociale
export const socialAuth = async (provider: string): Promise<SocialAuthResponse> => {
  switch (provider) {
    case 'google':
      return await googleAuth();
    case 'apple':
      return await appleAuth();
    case 'facebook':
      return await facebookAuth();
    default:
      return {
        success: false,
        error: 'Fournisseur d\'authentification non supporté'
      };
  }
};

// Gestion du callback d'authentification
export const handleAuthCallback = async (): Promise<SocialAuthResponse> => {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    if (data.session) {
      // Récupérer les informations utilisateur
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        return {
          success: false,
          error: userError.message
        };
      }

      if (userData.user) {
        // Transformer les données utilisateur pour correspondre à notre interface
        const user = {
          id: userData.user.id,
          username: userData.user.email?.split('@')[0] || userData.user.id,
          email: userData.user.email || '',
          role: 'clients', // Par défaut, les utilisateurs sociaux sont des clients
          full_name: userData.user.user_metadata?.full_name || userData.user.email?.split('@')[0] || '',
          phone: userData.user.phone || '',
          company: userData.user.user_metadata?.company || '',
          address: userData.user.user_metadata?.address || '',
          activity: userData.user.user_metadata?.activity || '',
          avatar_url: userData.user.user_metadata?.avatar_url || '',
          created_at: userData.user.created_at,
          is_active: true
        };

        return {
          success: true,
          user
        };
      }
    }

    return {
      success: false,
      error: 'Aucune session trouvée'
    };
  } catch (error) {
    return {
      success: false,
      error: 'Erreur lors de la récupération de la session'
    };
  }
};

// Déconnexion
export const socialLogout = async (): Promise<SocialAuthResponse> => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      message: 'Déconnexion réussie'
    };
  } catch (error) {
    return {
      success: false,
      error: 'Erreur lors de la déconnexion'
    };
  }
};
