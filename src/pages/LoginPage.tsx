import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, Eye, EyeOff, Shield, Building2, Sparkles, ArrowRight, CheckCircle, Zap, Users, Key, Globe } from 'lucide-react';

import { supabase } from '../lib/supabase';

interface LoginPageProps {
  setIsAuthenticated: (auth: boolean) => void;
  language: 'fr' | 'en';
}

const LoginPage: React.FC<LoginPageProps> = ({ setIsAuthenticated, language }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isFocused, setIsFocused] = useState('');
  const [animateSuccess, setAnimateSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const navigate = useNavigate();

  const translations = {
    fr: {
      title: 'N\'zoo Immo',
      subtitle: 'Plateforme de Gestion Immobilière Intelligente',
      login: {
        title: 'Connexion',
        subtitle: 'Accédez Ã  votre espace d\'administration',
        username: 'Nom d\'utilisateur',
        password: 'Mot de passe',
        button: 'Se connecter',
        loading: 'Connexion en cours...',
        error: 'Nom d\'utilisateur ou mot de passe incorrect',
        demo: {
          title: 'Compte de démonstration',
          username: 'admin',
          password: 'admin123',
          button: 'Utiliser les identifiants de démo'
        }
      },
      register: {
        title: 'Créer un compte',
        subtitle: 'Rejoignez notre plateforme',
        fullName: 'Nom complet',
        email: 'Adresse email',
        username: 'Nom d\'utilisateur',
        password: 'Mot de passe',
        confirmPassword: 'Confirmer le mot de passe',
        button: 'Créer le compte',
        loading: 'Création en cours...',
        error: 'Erreur lors de la création du compte',
        success: 'Compte créé avec succès'
      },
      features: [
        'Gestion des réservations en temps réel',
        'Tableau de bord analytique avancé',
        'Interface moderne et intuitive',
        'Sécurité de niveau entreprise'
      ],
      security: 'Connexion sécurisée SSL/TLS',
      switchToLogin: 'DéjÃ  un compte ? Se connecter',
      switchToRegister: 'Nouveau ? Créer un compte'
    },
    en: {
      title: 'N\'zoo Immo',
      subtitle: 'Smart Real Estate Management Platform',
      login: {
        title: 'Sign In',
        subtitle: 'Access your admin dashboard',
        username: 'Username',
        password: 'Password',
        button: 'Sign In',
        loading: 'Signing in...',
        error: 'Invalid username or password',
        demo: {
          title: 'Demo Account',
          username: 'admin',
          password: 'admin123',
          button: 'Use Demo Credentials'
        }
      },
      register: {
        title: 'Create Account',
        subtitle: 'Join our platform',
        fullName: 'Full Name',
        email: 'Email Address',
        username: 'Username',
        password: 'Password',
        confirmPassword: 'Confirm Password',
        button: 'Create Account',
        loading: 'Creating account...',
        error: 'Error creating account',
        success: 'Account created successfully'
      },
      features: [
        'Real-time reservation management',
        'Advanced analytics dashboard',
        'Modern & intuitive interface',
        'Enterprise-level security'
      ],
      security: 'Secure SSL/TLS Connection',
      switchToLogin: 'Already have an account? Sign In',
      switchToRegister: 'New? Create an account'
    }
  };

  const t = translations[language];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Vérifier les identifiants dans la base de données
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('username', credentials.username)
        .eq('is_active', true)
        .limit(1);

      if (error || !data || data.length === 0) {
        setError(t.login.error);
        setIsLoading(false);
        return;
      }

      const user = data[0];

      // Vérifier le mot de passe (temporaire pour le développement)
      const isPasswordValid = 
        user.password_hash === `temp_${credentials.password}` || // Nouveaux utilisateurs
        (user.username === 'admin' && credentials.password === 'admin123'); // Utilisateur par défaut

      if (isPasswordValid) {
        // Animation de succès
        setAnimateSuccess(true);
        
        // Stocker les informations utilisateur dans le localStorage
        localStorage.setItem('currentUser', JSON.stringify({
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          full_name: user.full_name
        }));
        
        // Attendre l'animation avant la redirection
        setTimeout(() => {
          setIsAuthenticated(true);
          navigate('/');
        }, 1500);
      } else {
        setError(t.login.error);
      }
    } catch (err) {
      console.error('Erreur de connexion:', err);
      setError('Erreur de connexion Ã  la base de données');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setCredentials({
      username: t.login.demo.username,
      password: t.login.demo.password
    });
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-nzoo relative overflow-hidden font-poppins">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 to-primary-700/20"></div>
        <div className="absolute top-0 -left-4 w-96 h-96 bg-primary-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-secondary-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-accent-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-nzoo-white/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center pt-32 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Side - Branding & Features */}
          <div className="text-nzoo-white space-y-10">
            <div className="space-y-8">
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 bg-gradient-nzoo rounded-3xl flex items-center justify-center shadow-nzoo transform rotate-12 hover:rotate-0 transition-transform duration-500">
                  <Building2 className="w-10 h-10 text-nzoo-white" />
                </div>
                <div>
                  <h1 className="text-5xl font-bold font-montserrat bg-gradient-to-r from-nzoo-white to-primary-100 bg-clip-text text-transparent">
                    {t.title}
                  </h1>
                  <p className="text-primary-100 text-xl font-medium">{t.subtitle}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-4xl font-bold font-montserrat bg-gradient-to-r from-nzoo-white to-primary-200 bg-clip-text text-transparent">
                  Gestion Immobilière
                </h2>
                <p className="text-xl text-primary-100 leading-relaxed">
                  Plateforme moderne pour la gestion intelligente de vos espaces immobiliers
                </p>
              </div>
            </div>

            {/* Features List */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-primary-100 flex items-center font-montserrat">
                <Zap className="w-6 h-6 mr-3 text-primary-300" />
                Fonctionnalités principales
              </h3>
              <div className="space-y-4">
                {t.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-4 text-primary-50 group">
                    <div className="w-3 h-3 bg-gradient-to-r from-primary-400 to-primary-500 rounded-full group-hover:scale-125 transition-transform duration-300"></div>
                    <span className="text-lg">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Security Badge */}
            <div className="flex items-center space-x-4 bg-nzoo-white/10 backdrop-blur-sm rounded-2xl p-6 border border-nzoo-white/20 hover:bg-nzoo-white/15 transition-colors duration-300">
              <div className="w-12 h-12 bg-gradient-nzoo rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-nzoo-white" />
              </div>
              <div>
                <p className="text-lg font-medium text-nzoo-white font-montserrat">{t.security}</p>
                <p className="text-sm text-primary-100">Protection de niveau entreprise</p>
              </div>
            </div>
          </div>

          {/* Right Side - Login/Register Form */}
          <div className="relative">
            <div className="bg-nzoo-white/10 backdrop-blur-xl rounded-3xl shadow-nzoo border border-nzoo-white/20 p-8 lg:p-12">
              
              {/* Success Animation Overlay */}
              {animateSuccess && (
                <div className="absolute inset-0 bg-gradient-nzoo backdrop-blur-sm rounded-3xl flex items-center justify-center z-50 animate-fadeIn">
                  <div className="text-center text-nzoo-white">
                    <CheckCircle className="w-20 h-20 mx-auto mb-6 animate-bounce" />
                    <h3 className="text-3xl font-bold mb-3 font-montserrat">Connexion réussie !</h3>
                    <p className="text-primary-100 text-lg">Redirection en cours...</p>
                  </div>
                </div>
              )}

              <div className="space-y-8">
                {/* Tab Navigation */}
                <div className="flex space-x-1 bg-nzoo-white/10 rounded-2xl p-1">
                  <button
                    onClick={() => setActiveTab('login')}
                    className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all duration-300 ${
                      activeTab === 'login'
                        ? 'bg-gradient-nzoo text-nzoo-white shadow-nzoo'
                        : 'text-primary-100 hover:text-nzoo-white hover:bg-nzoo-white/10'
                    }`}
                  >
                    <Users className="w-5 h-5 inline mr-2" />
                    {t.login.title}
                  </button>
                  <button
                    onClick={() => setActiveTab('register')}
                    className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all duration-300 ${
                      activeTab === 'register'
                        ? 'bg-gradient-nzoo text-nzoo-white shadow-nzoo'
                        : 'text-primary-100 hover:text-nzoo-white hover:bg-nzoo-white/10'
                    }`}
                  >
                    <Key className="w-5 h-5 inline mr-2" />
                    {t.register.title}
                  </button>
                </div>

                {/* Form Header */}
                <div className="text-center space-y-3">
                  <div className="w-20 h-20 bg-gradient-nzoo rounded-2xl flex items-center justify-center mx-auto shadow-nzoo">
                    {activeTab === 'login' ? (
                      <Lock className="w-10 h-10 text-nzoo-white" />
                    ) : (
                      <Users className="w-10 h-10 text-nzoo-white" />
                    )}
                  </div>
                  <h2 className="text-3xl font-bold text-nzoo-white font-montserrat">
                    {activeTab === 'login' ? t.login.title : t.register.title}
                  </h2>
                  <p className="text-primary-100 text-lg">
                    {activeTab === 'login' ? t.login.subtitle : t.register.subtitle}
                  </p>
                </div>

                {/* Demo Account - Only for Login */}
                {activeTab === 'login' && (
                  <div className="bg-gradient-to-r from-primary-600/20 to-primary-700/20 rounded-2xl p-6 border border-primary-400/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-medium text-nzoo-white font-montserrat">{t.login.demo.title}</h4>
                        <p className="text-sm text-primary-100 mt-1">
                          {t.login.username}: <span className="font-mono bg-nzoo-white/20 px-2 py-1 rounded">{t.login.demo.username}</span> | 
                          {t.login.password}: <span className="font-mono bg-nzoo-white/20 px-2 py-1 rounded">{t.login.demo.password}</span>
                        </p>
                      </div>
                      <button
                        onClick={fillDemoCredentials}
                        className="px-6 py-3 bg-gradient-nzoo text-nzoo-white text-sm rounded-xl hover:shadow-nzoo-hover transition-all duration-300 transform hover:scale-105 shadow-nzoo"
                      >
                        {t.login.demo.button}
                      </button>
                    </div>
                  </div>
                )}

                {/* Login Form */}
                {activeTab === 'login' && (
                  <form className="space-y-6" onSubmit={handleSubmit}>
                    {error && (
                      <div className="bg-red-500/20 border border-red-400/50 text-red-200 px-6 py-4 rounded-2xl text-sm backdrop-blur-sm">
                        {error}
                      </div>
                    )}

                    <div className="space-y-3">
                      <label htmlFor="username" className="block text-lg font-medium text-primary-100">
                        {t.login.username}
                      </label>
                      <div className="relative group">
                        <div className={`absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none transition-colors ${
                          isFocused === 'username' ? 'text-primary-300' : 'text-primary-200'
                        }`}>
                          <User className="h-6 w-6" />
                        </div>
                        <input
                          id="username"
                          name="username"
                          type="text"
                          required
                          value={credentials.username}
                          onChange={handleInputChange}
                          onFocus={() => setIsFocused('username')}
                          onBlur={() => setIsFocused('')}
                          className="block w-full pl-14 pr-5 py-5 bg-nzoo-white/10 border border-nzoo-white/20 rounded-2xl text-nzoo-white placeholder-primary-200 focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm text-lg"
                          placeholder={t.login.username}
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label htmlFor="password" className="block text-lg font-medium text-primary-100">
                        {t.login.password}
                      </label>
                      <div className="relative group">
                        <div className={`absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none transition-colors ${
                          isFocused === 'password' ? 'text-primary-300' : 'text-primary-200'
                        }`}>
                          <Lock className="h-6 w-6" />
                        </div>
                        <input
                          id="password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={credentials.password}
                          onChange={handleInputChange}
                          onFocus={() => setIsFocused('password')}
                          onBlur={() => setIsFocused('')}
                          className="block w-full pl-14 pr-14 py-5 bg-nzoo-white/10 border border-nzoo-white/20 rounded-2xl text-nzoo-white placeholder-primary-200 focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm text-lg"
                          placeholder={t.login.password}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-5 flex items-center text-primary-200 hover:text-primary-100 transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff className="h-6 w-6" />
                          ) : (
                            <Eye className="h-6 w-6" />
                          )}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full flex justify-center items-center py-5 px-8 bg-gradient-nzoo hover:shadow-nzoo-hover text-nzoo-white font-semibold rounded-2xl shadow-nzoo transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-lg"
                    >
                      {isLoading ? (
                        <>
                          <div className="-ml-1 mr-3 h-6 w-6 border-2 border-nzoo-white border-t-transparent rounded-full"></div>
                          {t.login.loading}
                        </>
                      ) : (
                        <>
                          {t.login.button}
                          <ArrowRight className="ml-3 w-6 h-6" />
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* Register Form - Placeholder */}
                {activeTab === 'register' && (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-primary-600/20 to-primary-700/20 rounded-2xl p-8 border border-primary-400/30 text-center">
                      <Globe className="w-16 h-16 mx-auto mb-4 text-primary-300" />
                      <h3 className="text-2xl font-bold text-nzoo-white mb-2 font-montserrat">Fonctionnalité Ã  venir</h3>
                      <p className="text-primary-100 text-lg">
                        La création de compte sera bientôt disponible. Contactez votre administrateur pour obtenir un compte.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
};

export default LoginPage;
