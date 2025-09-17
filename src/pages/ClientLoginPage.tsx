import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, ArrowLeft, User } from 'lucide-react';
import { loginClient } from '../services/clientService';
import { useAuth } from '../hooks/useAuth';
import SocialAuthButtons from '../components/SocialAuthButtons';

const ClientLoginPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Appeler le service de connexion
      const clientData = await loginClient({
        email: formData.email,
        password: formData.password
      });

      console.log('Utilisateur connecté avec succès:', clientData);
      
      // Utiliser le hook d'authentification
      const loginType = clientData.role === 'admin' || clientData.role === 'user' ? 'admin' : 'client';
      login(clientData, loginType);
      
      setLoading(false);
      
      // Rediriger vers la page d'accueil pour tous les utilisateurs
      navigate('/');
      
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : 'Erreur de connexion. Veuillez réessayer.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Gestion de l'authentification sociale réussie
  const handleSocialAuthSuccess = (user: any) => {
    console.log('Authentification sociale réussie:', user);
    login(user, 'client');
    navigate('/');
  };

  // Gestion des erreurs d'authentification sociale
  const handleSocialAuthError = (error: string) => {
    setError(error);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-nzoo-white via-blue-50 to-purple-50 flex items-center justify-center pt-32 pb-4 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center space-x-2 text-nzoo-dark/70 hover:text-nzoo-dark transition-colors duration-300 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour à l'accueil</span>
          </Link>
          
          <div className="mb-4">
            <img 
              src="/logo_nzooimmo.svg" 
              alt="Nzoo Immo" 
              className="h-12 mx-auto"
            />
          </div>
          
          <h1 className="text-3xl font-bold text-nzoo-dark mb-2">
            Connexion Utilisateur
          </h1>
          <p className="text-nzoo-dark/60">
            Accédez à votre espace personnel
          </p>
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl p-8 border border-nzoo-gray/20"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-nzoo-dark mb-2">
                Adresse email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-nzoo-dark/40" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-nzoo-gray/30 rounded-xl focus:ring-2 focus:ring-nzoo-dark/20 focus:border-nzoo-dark transition-colors duration-300 bg-white"
                  placeholder="votre@email.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-nzoo-dark mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-nzoo-dark/40" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-12 py-3 border border-nzoo-gray/30 rounded-xl focus:ring-2 focus:ring-nzoo-dark/20 focus:border-nzoo-dark transition-colors duration-300 bg-white"
                  placeholder="Votre mot de passe"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-nzoo-dark/40 hover:text-nzoo-dark transition-colors duration-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-nzoo-dark text-white py-3 px-6 rounded-xl font-medium hover:bg-nzoo-dark/90 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"></div>
                  <span>Connexion en cours...</span>
                </>
              ) : (
                <>
                  <User className="w-5 h-5" />
                  <span>Se connecter</span>
                </>
              )}
            </button>
          </form>

          {/* Authentification sociale */}
          <SocialAuthButtons
            onSuccess={handleSocialAuthSuccess}
            onError={handleSocialAuthError}
            language="fr"
            className="mt-6"
          />

          {/* Links */}
          <div className="mt-6 text-center space-y-3">
            <Link 
              to="/forgot-password" 
              className="text-sm text-nzoo-dark/60 hover:text-nzoo-dark transition-colors duration-300 block"
            >
              Mot de passe oublié ?
            </Link>
            
            <div className="text-sm text-nzoo-dark/60">
              Pas encore de compte ?{' '}
              <Link 
                to="/signup" 
                className="text-nzoo-dark font-medium hover:underline transition-colors duration-300"
              >
                Créer un compte
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-nzoo-dark/40">
          <p>© 2024 N'zoo Immo. Tous droits réservés.</p>
        </div>
      </motion.div>
    </div>
  );
};

export default ClientLoginPage;

