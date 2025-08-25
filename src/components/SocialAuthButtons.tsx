import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SOCIAL_PROVIDERS, socialAuth, SocialAuthProvider } from '../services/socialAuthService';
import SocialLogo from './SocialLogos';

interface SocialAuthButtonsProps {
  onSuccess?: (user: any) => void;
  onError?: (error: string) => void;
  language?: 'fr' | 'en';
  className?: string;
}

const SocialAuthButtons: React.FC<SocialAuthButtonsProps> = ({ 
  onSuccess, 
  onError, 
  language = 'fr',
  className = ''
}) => {
  const [loading, setLoading] = useState<string | null>(null);

  const translations = {
    fr: {
      or: 'ou',
      continueWith: 'Continuer avec',
      loading: 'Connexion en cours...'
    },
    en: {
      or: 'or',
      continueWith: 'Continue with',
      loading: 'Connecting...'
    }
  };

  const t = translations[language];

  const handleSocialAuth = async (provider: SocialAuthProvider) => {
    setLoading(provider.id);
    
    try {
      const result = await socialAuth(provider.id);
      
      if (result.success) {
        if (result.user && onSuccess) {
          onSuccess(result.user);
        }
        if (result.message) {
          console.log(result.message);
        }
      } else {
        if (onError && result.error) {
          onError(result.error);
        }
      }
    } catch (error) {
      if (onError) {
        onError('Erreur lors de l\'authentification');
      }
    } finally {
      setLoading(null);
    }
  };

  const getButtonStyle = (provider: SocialAuthProvider) => {
    const baseStyle = "w-full flex items-center justify-center space-x-3 px-4 py-3 rounded-xl border-2 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed";
    
    switch (provider.id) {
      case 'google':
        return `${baseStyle} border-gray-200 hover:border-gray-300 text-gray-700 bg-white ${loading === provider.id ? 'cursor-wait' : 'cursor-pointer'}`;
      case 'apple':
        return `${baseStyle} border-gray-800 hover:border-gray-900 text-white bg-black ${loading === provider.id ? 'cursor-wait' : 'cursor-pointer'}`;
      case 'facebook':
        return `${baseStyle} border-[#1877F2] hover:border-[#166FE5] text-white bg-[#1877F2] hover:bg-[#166FE5] ${loading === provider.id ? 'cursor-wait' : 'cursor-pointer'}`;
      default:
        return `${baseStyle} border-gray-200 hover:border-gray-300 text-gray-700 bg-white ${loading === provider.id ? 'cursor-wait' : 'cursor-pointer'}`;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Séparateur */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">{t.or}</span>
        </div>
      </div>

      {/* Boutons d'authentification sociale */}
      <div className="space-y-3">
        {SOCIAL_PROVIDERS.map((provider) => (
          <motion.button
            key={provider.id}
            onClick={() => handleSocialAuth(provider)}
            disabled={loading !== null}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={getButtonStyle(provider)}
          >
            {/* Logo officiel */}
            <div className="flex-shrink-0">
              <SocialLogo 
                provider={provider.id as 'google' | 'apple' | 'facebook'} 
                size={20}
                className={provider.id === 'apple' ? 'text-white' : ''}
              />
            </div>
            
            {/* Texte */}
            <span>
              {loading === provider.id 
                ? t.loading 
                : `${t.continueWith} ${provider.name}`
              }
            </span>

            {/* Indicateur de chargement */}
            {loading === provider.id && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
              />
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default SocialAuthButtons;
