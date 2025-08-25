import React from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Shield, ExternalLink } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import SocialLogo from './SocialLogos';

interface SocialUserInfoProps {
  language?: 'fr' | 'en';
  className?: string;
}

const SocialUserInfo: React.FC<SocialUserInfoProps> = ({ 
  language = 'fr',
  className = ''
}) => {
  const { user, isSocialUser } = useAuth();

  const translations = {
    fr: {
      socialUser: 'Utilisateur connecté via',
      connectedVia: 'Connecté via',
      provider: {
        google: 'Google',
        apple: 'Apple',
        facebook: 'Facebook'
      },
      security: 'Compte sécurisé',
      verified: 'Email vérifié'
    },
    en: {
      socialUser: 'User connected via',
      connectedVia: 'Connected via',
      provider: {
        google: 'Google',
        apple: 'Apple',
        facebook: 'Facebook'
      },
      security: 'Secure account',
      verified: 'Email verified'
    }
  };

  const t = translations[language];

  // Si l'utilisateur n'est pas connecté via un réseau social, ne rien afficher
  if (!isSocialUser() || !user) {
    return null;
  }

  const getProviderName = (provider?: string) => {
    if (!provider) return '';
    
    switch (provider) {
      case 'google':
        return t.provider.google;
      case 'apple':
        return t.provider.apple;
      case 'facebook':
        return t.provider.facebook;
      default:
        return provider;
    }
  };

  const getProviderColor = (provider?: string) => {
    switch (provider) {
      case 'google':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'apple':
        return 'bg-gray-50 border-gray-200 text-gray-700';
      case 'facebook':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-white rounded-xl border border-gray-200 p-4 ${className}`}
    >
      <div className="flex items-start space-x-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.full_name}
              className="w-12 h-12 rounded-full border-2 border-gray-200"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
          )}
        </div>

        {/* Informations utilisateur */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="text-sm font-semibold text-gray-900 truncate">
              {user.full_name}
            </h3>
            
            {/* Badge du fournisseur avec logo officiel */}
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getProviderColor(user.provider)}`}>
              {user.provider && (
                <div className="mr-1">
                  <SocialLogo 
                    provider={user.provider as 'google' | 'apple' | 'facebook'} 
                    size={12}
                  />
                </div>
              )}
              {getProviderName(user.provider)}
            </span>
          </div>

          <div className="space-y-1">
            {/* Email */}
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Mail className="w-4 h-4" />
              <span className="truncate">{user.email}</span>
            </div>

            {/* Statut de sécurité */}
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <Shield className="w-3 h-3 text-green-500" />
                <span>{t.security}</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <ExternalLink className="w-3 h-3 text-blue-500" />
                <span>{t.verified}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Informations supplémentaires */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="text-xs text-gray-500">
          {t.connectedVia} {getProviderName(user.provider)} • {user.created_at ? new Date(user.created_at).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US') : ''}
        </div>
      </div>
    </motion.div>
  );
};

export default SocialUserInfo;
