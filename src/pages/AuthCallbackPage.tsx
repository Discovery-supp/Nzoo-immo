import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import { handleAuthCallback } from '../services/socialAuthService';
import { useAuth } from '../hooks/useAuth';

const AuthCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const processAuthCallback = async () => {
      try {
        setStatus('loading');
        setMessage('Vérification de votre authentification...');

        // Attendre un peu pour que Supabase traite le callback
        await new Promise(resolve => setTimeout(resolve, 1000));

        const result = await handleAuthCallback();

        if (result.success && result.user) {
          setStatus('success');
          setMessage('Authentification réussie ! Redirection...');

          // Connecter l'utilisateur
          login(result.user, 'client');

          // Rediriger vers la page d'accueil après un délai
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 2000);
        } else {
          setStatus('error');
          setMessage(result.error || 'Erreur lors de l\'authentification');
        }
      } catch (error) {
        setStatus('error');
        setMessage('Erreur inattendue lors de l\'authentification');
        console.error('Erreur callback auth:', error);
      }
    };

    processAuthCallback();
  }, [navigate, login]);

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader className="w-12 h-12 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-12 h-12 text-green-500" />;
      case 'error':
        return <XCircle className="w-12 h-12 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'loading':
        return 'text-blue-600';
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <img 
            src="/logo_nzooimmo.svg" 
            alt="Nzoo Immo" 
            className="h-12 mx-auto mb-4"
          />
        </div>

        {/* Card de statut */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          <div className="text-center space-y-4">
            {/* Icône de statut */}
            <div className="flex justify-center">
              {getStatusIcon()}
            </div>

            {/* Titre */}
            <h1 className={`text-2xl font-bold ${getStatusColor()}`}>
              {status === 'loading' && 'Authentification en cours...'}
              {status === 'success' && 'Authentification réussie !'}
              {status === 'error' && 'Erreur d\'authentification'}
            </h1>

            {/* Message */}
            <p className="text-gray-600 text-sm">
              {message}
            </p>

            {/* Bouton de retour en cas d'erreur */}
            {status === 'error' && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                onClick={() => navigate('/login', { replace: true })}
                className="mt-4 px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Retour à la connexion
              </motion.button>
            )}

            {/* Indicateur de progression */}
            {status === 'loading' && (
              <div className="mt-6">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    className="bg-blue-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 2, ease: 'easeInOut' }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>© 2024 N'zoo Immo. Tous droits réservés.</p>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthCallbackPage;
