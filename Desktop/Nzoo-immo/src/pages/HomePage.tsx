import React, { useState, useEffect } from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sun, Moon, Calendar, CreditCard, Shield, User } from 'lucide-react';

// Texte FR/EN simple ici
const texts = {
  fr: {
    hero: {
      title: 'Réservez votre espace de travail idéal',
      subtitle:
        'Des bureaux modernes, du coworking flexible et des salles de réunion professionnelles à Kinshasa',
      ctaPrimary: 'Réserver maintenant',
    },
    spacesTitle: 'Nos Espaces',
    featuresTitle: 'Pourquoi choisir Nzoo Immo ?',
    testimonialsTitle: 'Témoignages',
    features: [
      {
        icon: <Calendar className="w-8 h-8 text-nzoo-dark" />,
        title: 'Réservation Simple',
        desc: 'Système de réservation intuitif avec calendrier interactif',
      },
      {
        icon: <CreditCard className="w-8 h-8 text-green-600" />,
        title: 'Paiement Sécurisé',
        desc: 'Cartes VISA acceptées',
      },
      {
        icon: <Shield className="w-8 h-8 text-purple-600" />,
        title: 'Support 24/7',
        desc: 'Une équipe dédiée toujours disponible',
      },
    ],
    testimonials: [
      {
        name: 'Patrick Kamango',
        text: 'Excellent service, espaces très confortables et bien équipés',
      },
      {
        name: 'Trickson MABENGI',
        text: 'Réservation simple et rapide, je recommande vivement !',
      },
      {
        name: 'Myv KILOLO',
        text: 'Le support client est toujours disponible et efficace',
      },
    ],
    toggleLangLabel: 'Passer en anglais',
  },
  en: {
    hero: {
      title: 'Réservez votre espace de travail idéal',
      subtitle:
        'Des bureaux modernes, du coworking flexible et des salles de réunion professionnelles à Kinshasa',
      ctaPrimary: 'Réserver maintenant',
    },
    spacesTitle: 'Nos Espaces',
    featuresTitle: 'Pourquoi choisir Nzoo Immo ?',
    testimonialsTitle: 'Témoignages',
    features: [
      {
        icon: <Calendar className="w-8 h-8 text-nzoo-dark" />,
        title: 'Réservation Simple',
        desc: 'Système de réservation intuitif avec calendrier interactif',
      },
      {
        icon: <CreditCard className="w-8 h-8 text-green-600" />,
        title: 'Paiement Sécurisé',
        desc: 'Cartes VISA acceptées',
      },
      {
        icon: <Shield className="w-8 h-8 text-purple-600" />,
        title: 'Support 24/7',
        desc: 'Une équipe dédiée toujours disponible',
      },
    ],
    testimonials: [
      {
        name: 'Patrick Kamango',
        text: 'Excellent service, espaces très confortables et bien équipés',
      },
      {
        name: 'Trickson MABENGI',
        text: 'Réservation simple et rapide, je recommande vivement !',
      },
      {
        name: 'Myv KILOLO',
        text: 'Le support client est toujours disponible et efficace',
      },
    ],
    toggleLangLabel: 'Switch to English',
  },
};

// Images de bannière pour le carrousel - Optimisées pour mobile
const bannerImages = [
  'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
  'https://images.pexels.com/photos/3182773/pexels-photo-3182773.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
  'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
  'https://images.pexels.com/photos/3182834/pexels-photo-3182834.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
  'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
  'https://images.pexels.com/photos/3184639/pexels-photo-3184639.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
  'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
  'https://images.pexels.com/photos/1571461/pexels-photo-1571461.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
  'https://images.pexels.com/photos/1571462/pexels-photo-1571462.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
];

const HomePage: React.FC = () => {
  const [lang, setLang] = useState<'fr' | 'en'>('fr');
  const [darkMode, setDarkMode] = useState(false);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const navigate = useNavigate();
  
  // État pour l'authentification
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>('');

  // États pour gérer l'affichage des fonctionnalités
  const [expandedServices, setExpandedServices] = useState<{[key: string]: boolean}>({
    coworking: false,
    formation: false,
    domiciliation: false,
    bureaux: false
  });

  // Fonction pour basculer l'affichage des fonctionnalités
  const toggleServiceExpansion = (serviceKey: string) => {
    setExpandedServices(prev => ({
      ...prev,
      [serviceKey]: !prev[serviceKey]
    }));
  };


  // Vérifier l'authentification au chargement
  useEffect(() => {
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
    }
  }, []);

  // Persist dark mode in localStorage
  useEffect(() => {
    const stored = localStorage.getItem('dark');
    setDarkMode(stored === 'true');
  }, []);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('dark', darkMode.toString());
  }, [darkMode]);

  // Carrousel automatique des bannières
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIndex((prevIndex) => 
        (prevIndex + 1) % bannerImages.length
      );
    }, 4000); // Change d'image toutes les 4 secondes

    return () => clearInterval(interval);
  }, []);

  const toggleDark = () => setDarkMode((d) => !d);
  const toggleLang = () => setLang((l) => (l === 'fr' ? 'en' : 'fr'));

  const t = texts[lang];

  // Fonction pour naviguer vers la page des espaces
  const goToSpaces = () => {
    navigate('/spaces');
  };


  return (
    <HelmetProvider>
      <div className="min-h-screen bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 transition-colors duration-700 font-poppins">
        <Helmet>
          <title>Nzoo Immo - {t.hero.title}</title>
        </Helmet>

        {/* Dark mode toggle avec design moderne */}
        <div className="fixed top-28 right-4 z-50">
          <button
            onClick={toggleDark}
            className="p-3 rounded-2xl bg-white/90 backdrop-blur-xl hover:bg-white shadow-soft hover:shadow-medium transition-all duration-300 hover:scale-105 border border-white/20"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun className="w-5 h-5 text-orange-500" /> : <Moon className="w-5 h-5 text-nzoo-dark" />}
          </button>
        </div>

        {/* Section Hero avec Carrousel - Design moderne et responsive */}
        <section className="relative h-[50vh] sm:h-[55vh] md:h-[60vh] min-h-[400px] sm:min-h-[450px] md:min-h-[500px] max-h-[600px] md:max-h-[700px] overflow-hidden bg-gradient-to-br from-slate-900 via-nzoo-dark to-nzoo-dark pt-20">
          {/* Éléments décoratifs de fond */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-nzoo-dark/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-green-500/20 to-nzoo-dark/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-nzoo-dark/10 to-transparent rounded-full blur-3xl"></div>
          </div>

          <div className="relative w-full h-full">
            {bannerImages.map((image, index) => (
              <motion.div
                key={index}
                className="absolute inset-0 w-full h-full flex items-center justify-center"
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ 
                  opacity: index === currentBannerIndex ? 1 : 0,
                  scale: index === currentBannerIndex ? 1 : 1.1
                }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
              >
                <img
                  src={image}
                  alt={`Bannière ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </motion.div>
            ))}
          
          {/* Overlay gradient moderne pour améliorer la lisibilité */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-black/60"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-nzoo-dark/20 to-nzoo-dark/40"></div>
          
          {/* Contenu centré avec design moderne et responsive */}
          <div className="relative z-10 flex items-center justify-center h-full">
            <div className="text-center text-white px-4 sm:px-6 lg:px-8 max-w-4xl lg:max-w-5xl">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="mb-4 sm:mb-6 lg:mb-8"
              >
                <div className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-4 sm:mb-6">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2 sm:mr-3 animate-pulse"></div>
                  <span className="text-white/90 font-medium text-sm sm:text-base">Nzoo Immo - Espaces de travail modernes</span>
                </div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.4 }}
                className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 sm:mb-6 lg:mb-8 font-montserrat drop-shadow-2xl leading-tight"
                style={{ 
                  background: 'linear-gradient(135deg, #FFFFFF 0%, #E2E8F0 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                {t.hero.title}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.6 }}
                className="text-base sm:text-lg md:text-xl text-white/90 mb-2 sm:mb-3 lg:mb-4 max-w-3xl lg:max-w-4xl mx-auto leading-relaxed font-poppins"
              >
                {t.hero.subtitle}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.8 }}
                className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center"
              >
                <button
                  onClick={goToSpaces}
                  className="group bg-gradient-to-r from-white to-gray-100 text-nzoo-dark hover:from-gray-100 hover:to-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-semibold text-sm sm:text-base w-full sm:w-auto font-montserrat border border-white/30 backdrop-blur-sm"
                >
                  <span className="flex items-center justify-center space-x-2">
                    <span>Réserver un espace</span>
                  </span>
                </button>
                <button
                  onClick={() => {
                    // TODO: Ajouter la navigation vers la page des appartements
                    console.log('Navigation vers les appartements');
                  }}
                  className="group bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-semibold text-sm sm:text-base w-full sm:w-auto font-montserrat border border-green-400/30 backdrop-blur-sm"
                >
                  <span className="flex items-center justify-center space-x-2">
                    <span>Réserver un appartement</span>
                  </span>
                </button>
                <button
                  onClick={() => {
                    const element = document.querySelector('#services') as HTMLElement;
                    if (element) {
                      window.scrollTo({ top: element.offsetTop, behavior: 'smooth' });
                    }
                  }}
                  className="group border border-white/60 text-white hover:bg-white/10 py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl sm:rounded-2xl transition-all duration-300 font-semibold text-sm sm:text-base w-full sm:w-auto font-montserrat backdrop-blur-sm hover:border-white hover:scale-105"
                >
                  <span className="flex items-center justify-center space-x-2">
                    <span>Découvrir nos services</span>
                  </span>
                </button>
              </motion.div>
            </div>
          </div>
          </div>
          
          {/* Indicateurs de pagination modernes et responsives */}
          <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 sm:space-x-3 z-10">
            {bannerImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentBannerIndex(index)}
                className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full transition-all duration-500 ${
                  index === currentBannerIndex 
                    ? 'bg-white shadow-lg scale-125' 
                    : 'bg-white/40 hover:bg-white/60 hover:scale-110'
                }`}
              />
            ))}
          </div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.5 }}
            className="absolute bottom-8 left-8 z-10"
          >
            <div className="flex flex-col items-center space-y-2 text-white/70">
              <span className="text-sm font-medium">Scroll</span>
              <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
                <motion.div
                  animate={{ y: [0, 12, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-1 h-3 bg-white/70 rounded-full mt-2"
                />
              </div>
            </div>
          </motion.div>
        </section>

        {/* Qui sommes-nous Section */}
        <section className="py-16 sm:py-20 md:py-24 lg:py-32 bg-gradient-to-br from-nzoo-dark via-nzoo-dark-light to-nzoo-dark-lighter relative overflow-hidden">
          {/* Éléments décoratifs de fond */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-white/5 to-transparent rounded-full blur-3xl"></div>
          
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12 sm:mb-16 lg:mb-20"
            >
              <div className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-4 sm:mb-6 lg:mb-8">
                <div className="w-2 h-2 bg-primary-400 rounded-full mr-2 sm:mr-3 animate-pulse"></div>
                <span className="text-white/90 font-semibold text-sm sm:text-base">À propos de nous</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6 lg:mb-8 font-montserrat">
                Qui sommes-nous ?
              </h2>
              <div className="w-24 sm:w-32 h-1 bg-gradient-to-r from-primary-400 to-primary-300 mx-auto rounded-full mb-4 sm:mb-6 lg:mb-8"></div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
              {/* Contenu texte */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="space-y-6 sm:space-y-8"
              >
                <div className="space-y-4 sm:space-y-6">
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white font-montserrat leading-tight">
                    N'zoo Immo
                  </h3>
                  <p className="text-white/80 font-poppins leading-relaxed">
                    Leader innovant dans l'immobilier commercial et les espaces de travail à Kinshasa, N'zoo Immo révolutionne l'expérience professionnelle en République Démocratique du Congo.
                  </p>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  <h4 className="text-xl sm:text-2xl font-semibold text-primary-300 font-montserrat">
                    Notre Mission
                  </h4>
                  <p className="text-white/80 font-poppins leading-relaxed">
                    Faciliter l'accès à des espaces de travail modernes, flexibles et professionnels pour tous les entrepreneurs, startups et entreprises qui souhaitent se développer dans un environnement stimulant et connecté.
                  </p>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  <h4 className="text-xl sm:text-2xl font-semibold text-primary-300 font-montserrat">
                    Notre Vision
                  </h4>
                  <p className="text-white/80 font-poppins leading-relaxed">
                    Devenir la référence incontournable en matière d'espaces de travail innovants en RDC, en contribuant activement au développement économique et à l'écosystème entrepreneurial de Kinshasa.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 pt-4 sm:pt-6">
                  <div className="text-center p-4 sm:p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                    <div className="text-2xl sm:text-3xl font-bold text-primary-300 mb-2">100+</div>
                    <div className="text-white/80 text-sm sm:text-base">Clients satisfaits</div>
                  </div>
                  <div className="text-center p-4 sm:p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                    <div className="text-2xl sm:text-3xl font-bold text-primary-300 mb-2">10+</div>
                    <div className="text-white/80 text-sm sm:text-base">Espaces disponibles</div>
                  </div>
                  <div className="text-center p-4 sm:p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                    <div className="text-2xl sm:text-3xl font-bold text-primary-300 mb-2">24/7</div>
                    <div className="text-white/80 text-sm sm:text-base">Support client</div>
                  </div>
                </div>
              </motion.div>

              {/* Image/Illustration */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="relative"
              >
                <div className="relative overflow-hidden rounded-3xl shadow-2xl">
                  <img
                    src="/WhatsApp Image 2025-07-11 à 10.17.27_3a034c36.jpg"
                    alt="N'zoo Immo - Espaces de travail modernes"
                    className="w-full h-64 sm:h-80 lg:h-96 object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-nzoo-dark/60 via-transparent to-transparent"></div>
                  
                  {/* Badge flottant */}
                  <div className="absolute top-6 right-6">
                    <div className="bg-gradient-to-r from-primary-500 to-primary-400 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                      Depuis 2020
                    </div>
                  </div>
                </div>

                {/* Éléments décoratifs */}
                <div className="absolute -top-4 -left-4 w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-300 rounded-full opacity-20 blur-xl"></div>
                <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-gradient-to-br from-white to-gray-300 rounded-full opacity-20 blur-xl"></div>
              </motion.div>
            </div>

            {/* Call to action */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-center mt-12 sm:mt-16 lg:mt-20"
            >
              <p className="text-white/80 text-lg sm:text-xl mb-6 sm:mb-8 font-poppins">
                Rejoignez notre communauté d'entrepreneurs innovants
              </p>
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
                <Link
                  to="/spaces"
                  className="group bg-gradient-to-r from-primary-500 to-primary-400 text-white hover:from-primary-600 hover:to-primary-500 py-3 sm:py-4 px-6 sm:px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-semibold text-base sm:text-lg font-montserrat"
                >
                  <span className="flex items-center justify-center space-x-2">
                    <span>Découvrir nos espaces</span>
                  </span>
                </Link>
                <button
                  onClick={() => {
                    const element = document.querySelector('#services') as HTMLElement;
                    if (element) {
                      window.scrollTo({ top: element.offsetTop, behavior: 'smooth' });
                    }
                  }}
                  className="group border-2 border-white/60 text-white hover:bg-white/10 py-3 sm:py-4 px-6 sm:px-8 rounded-2xl transition-all duration-300 font-semibold text-base sm:text-lg font-montserrat backdrop-blur-sm hover:border-white"
                >
                  <span className="flex items-center justify-center space-x-2">
                    <span>Nos services</span>
                  </span>
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Services Section avec design moderne et responsive */}
        <section id="services" className="py-16 sm:py-20 md:py-24 lg:py-32 bg-gradient-to-br from-white via-gray-50 to-nzoo-dark/5 relative overflow-hidden">
          {/* Éléments décoratifs de fond améliorés */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-nzoo-dark/5 to-primary-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-primary-500/5 to-nzoo-dark/5 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-primary-100/30 to-nzoo-dark/10 rounded-full blur-3xl"></div>
          
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12 sm:mb-16 lg:mb-20"
            >
              <div className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-nzoo-dark/10 to-primary-500/10 rounded-full border border-nzoo-dark/20 mb-4 sm:mb-6 lg:mb-8">
                <div className="w-2 h-2 bg-gradient-to-r from-nzoo-dark to-primary-500 rounded-full mr-2 sm:mr-3 animate-pulse"></div>
                <span className="text-nzoo-dark font-semibold text-sm sm:text-base">Nos Solutions</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-nzoo-dark via-primary-600 to-nzoo-dark bg-clip-text text-transparent mb-4 sm:mb-6 lg:mb-8 font-montserrat">
                Nos Services
              </h2>
              <div className="w-24 sm:w-32 h-1 bg-gradient-to-r from-nzoo-dark via-primary-500 to-nzoo-dark mx-auto rounded-full mb-4 sm:mb-6 lg:mb-8"></div>
              <p className="text-lg sm:text-xl text-gray-600 mb-8 sm:mb-10 lg:mb-12 max-w-3xl lg:max-w-4xl mx-auto font-poppins leading-relaxed">
                Découvrez nos services adaptés à tous vos besoins professionnels
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 lg:gap-16">
              {/* Service 1: Co-working */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="group relative bg-gradient-to-br from-white via-gray-50 to-white rounded-3xl shadow-soft border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-500"
              >
                {/* Background decoration amélioré */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full blur-3xl opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-nzoo-dark/20 to-primary-300/20 rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>
                
                <div className="relative z-10 p-8 sm:p-10">
                  {/* Header with image amélioré */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="relative w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-2xl overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-300">
                        <img
                          src="/coworking.jpg"
                          alt="Co-working"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                      <div>
                        <h3 className="text-2xl sm:text-3xl font-bold text-nzoo-dark font-montserrat group-hover:text-primary-600 transition-colors duration-300">
                          Co-working
                        </h3>
                        <p className="text-primary-600 font-medium text-sm">Espace de travail partagé</p>
                      </div>
                    </div>
                    {/* Badge de disponibilité */}
                    <div className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-semibold rounded-full">
                      Disponible
                    </div>
                  </div>
                  
                  {/* Description améliorée */}
                  <p className="text-gray-600 mb-8 font-poppins leading-relaxed text-lg">
                    Découvrez nos espaces de travail modernes et collaboratifs conçus pour stimuler la créativité et favoriser les échanges entre entrepreneurs. Un environnement professionnel où chaque détail a été pensé pour votre productivité.
                  </p>
                  
                  {/* Features avec design amélioré */}
                  <div className="space-y-4">
                    <div className="flex items-start space-x-4 group/feature">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-400 rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover/feature:scale-110 transition-transform duration-300">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-nzoo-dark mb-1 group-hover/feature:text-primary-600 transition-colors duration-300">Postes de travail ergonomiques</h4>
                        <p className="text-gray-600 text-sm">Bureaux confortables et chaises ergonomiques pour un travail optimal</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-4 group/feature">
                      <div className="w-8 h-8 bg-gradient-to-br from-nzoo-dark to-nzoo-dark-light rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover/feature:scale-110 transition-transform duration-300">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-nzoo-dark mb-1 group-hover/feature:text-primary-600 transition-colors duration-300">Internet haute vitesse</h4>
                        <p className="text-gray-600 text-sm">Connexion WiFi ultra-rapide et sécurisée pour tous vos besoins</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-4 group/feature">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-300 rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover/feature:scale-110 transition-transform duration-300">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-nzoo-dark mb-1 group-hover/feature:text-primary-600 transition-colors duration-300">Salles de réunion équipées</h4>
                        <p className="text-gray-600 text-sm">Espaces de réunion modernes avec projecteurs et équipements audio</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-4 group/feature">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-300 to-primary-200 rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover/feature:scale-110 transition-transform duration-300">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-nzoo-dark mb-1 group-hover/feature:text-primary-600 transition-colors duration-300">Espace détente et networking</h4>
                        <p className="text-gray-600 text-sm">Zone de détente pour les pauses et rencontres professionnelles</p>
                      </div>
                    </div>

                    {/* Fonctionnalités supplémentaires (affichées conditionnellement) */}
                    {expandedServices.coworking && (
                      <>
                        <div className="flex items-start space-x-4 group/feature">
                          <div className="w-8 h-8 bg-gradient-to-br from-primary-200 to-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover/feature:scale-110 transition-transform duration-300">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-semibold text-nzoo-dark mb-1 group-hover/feature:text-primary-600 transition-colors duration-300">Imprimante et scanner</h4>
                            <p className="text-gray-600 text-sm">Accès aux équipements d'impression et de numérisation</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-4 group/feature">
                          <div className="w-8 h-8 bg-gradient-to-br from-primary-100 to-primary-50 rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover/feature:scale-110 transition-transform duration-300">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-semibold text-nzoo-dark mb-1 group-hover/feature:text-primary-600 transition-colors duration-300">Café et boissons</h4>
                            <p className="text-gray-600 text-sm">Machine à café et boissons fraîches disponibles</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-4 group/feature">
                          <div className="w-8 h-8 bg-gradient-to-br from-primary-50 to-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover/feature:scale-110 transition-transform duration-300">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-semibold text-nzoo-dark mb-1 group-hover/feature:text-primary-600 transition-colors duration-300">Sécurité 24/7</h4>
                            <p className="text-gray-600 text-sm">Accès sécurisé et surveillance continue</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-4 group/feature">
                          <div className="w-8 h-8 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover/feature:scale-110 transition-transform duration-300">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-semibold text-nzoo-dark mb-1 group-hover/feature:text-primary-600 transition-colors duration-300">Événements networking</h4>
                            <p className="text-gray-600 text-sm">Organisation d'événements professionnels réguliers</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-4 group/feature">
                          <div className="w-8 h-8 bg-gradient-to-br from-primary-200 to-primary-300 rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover/feature:scale-110 transition-transform duration-300">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-semibold text-nzoo-dark mb-1 group-hover/feature:text-primary-600 transition-colors duration-300">Support technique</h4>
                            <p className="text-gray-600 text-sm">Assistance technique et support informatique</p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Bouton pour voir plus/moins de fonctionnalités */}
                  <div className="mt-6">
                    <button
                      onClick={() => toggleServiceExpansion('coworking')}
                      className="w-full bg-gradient-to-r from-primary-100 to-primary-200 hover:from-primary-200 hover:to-primary-300 text-primary-700 py-3 px-6 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 border border-primary-200"
                    >
                      <span className="flex items-center justify-center space-x-2">
                        <svg className={`w-5 h-5 transition-transform duration-300 ${expandedServices.coworking ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                        <span>{expandedServices.coworking ? 'Voir moins' : 'Voir +5 autres fonctionnalités'}</span>
                      </span>
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Service 2: Formation */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="group relative bg-gradient-to-br from-white via-gray-50 to-white rounded-3xl shadow-soft border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-500"
              >
                {/* Background decoration amélioré */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full blur-3xl opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-nzoo-dark/20 to-primary-300/20 rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>
                
                <div className="relative z-10 p-8 sm:p-10">
                  {/* Header with image amélioré */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="relative w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-2xl overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-300">
                        <img
                          src="/salle_reunion.jpg"
                          alt="Formation"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                      <div>
                        <h3 className="text-2xl sm:text-3xl font-bold text-nzoo-dark font-montserrat group-hover:text-primary-600 transition-colors duration-300">
                          Formation
                        </h3>
                        <p className="text-primary-600 font-medium text-sm">Salles de formation et conférences</p>
                      </div>
                    </div>
                    {/* Badge de disponibilité */}
                    <div className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-semibold rounded-full">
                      Disponible
                    </div>
                  </div>
                  
                  {/* Description améliorée */}
                  <p className="text-gray-600 mb-8 font-poppins leading-relaxed text-lg">
                    Nos salles de formation et de conférences offrent un cadre professionnel idéal pour vos événements, ateliers et sessions de formation. Équipements de pointe et ambiance propice à l'apprentissage.
                  </p>
                  
                  {/* Features avec design amélioré */}
                  <div className="space-y-4">
                    <div className="flex items-start space-x-4 group/feature">
                      <div className="w-8 h-8 bg-gradient-to-br from-nzoo-dark to-nzoo-dark-light rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover/feature:scale-110 transition-transform duration-300">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-nzoo-dark mb-1 group-hover/feature:text-primary-600 transition-colors duration-300">Projecteurs et écrans HD</h4>
                        <p className="text-gray-600 text-sm">Équipements audiovisuels de haute qualité pour des présentations parfaites</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-4 group/feature">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-400 rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover/feature:scale-110 transition-transform duration-300">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-nzoo-dark mb-1 group-hover/feature:text-primary-600 transition-colors duration-300">Système audio professionnel</h4>
                        <p className="text-gray-600 text-sm">Son de qualité professionnelle pour une expérience immersive</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-4 group/feature">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-300 rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover/feature:scale-110 transition-transform duration-300">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-nzoo-dark mb-1 group-hover/feature:text-primary-600 transition-colors duration-300">WiFi haute vitesse</h4>
                        <p className="text-gray-600 text-sm">Connexion internet ultra-rapide pour tous les participants</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-4 group/feature">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-300 to-primary-200 rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover/feature:scale-110 transition-transform duration-300">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-nzoo-dark mb-1 group-hover/feature:text-primary-600 transition-colors duration-300">Capacité jusqu'à 50 personnes</h4>
                        <p className="text-gray-600 text-sm">Salles modulables pour s'adapter à tous types d'événements</p>
                      </div>
                    </div>

                    {/* Fonctionnalités supplémentaires (affichées conditionnellement) */}
                    {expandedServices.formation && (
                      <>
                        <div className="flex items-start space-x-4 group/feature">
                          <div className="w-8 h-8 bg-gradient-to-br from-primary-200 to-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover/feature:scale-110 transition-transform duration-300">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-semibold text-nzoo-dark mb-1 group-hover/feature:text-primary-600 transition-colors duration-300">Tableaux interactifs</h4>
                            <p className="text-gray-600 text-sm">Écrans tactiles pour des présentations interactives</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-4 group/feature">
                          <div className="w-8 h-8 bg-gradient-to-br from-primary-100 to-primary-50 rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover/feature:scale-110 transition-transform duration-300">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-semibold text-nzoo-dark mb-1 group-hover/feature:text-primary-600 transition-colors duration-300">Climatisation</h4>
                            <p className="text-gray-600 text-sm">Contrôle de température pour un confort optimal</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-4 group/feature">
                          <div className="w-8 h-8 bg-gradient-to-br from-primary-50 to-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover/feature:scale-110 transition-transform duration-300">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-semibold text-nzoo-dark mb-1 group-hover/feature:text-primary-600 transition-colors duration-300">Éclairage adaptatif</h4>
                            <p className="text-gray-600 text-sm">Système d'éclairage ajustable selon les besoins</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-4 group/feature">
                          <div className="w-8 h-8 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover/feature:scale-110 transition-transform duration-300">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-semibold text-nzoo-dark mb-1 group-hover/feature:text-primary-600 transition-colors duration-300">Support technique</h4>
                            <p className="text-gray-600 text-sm">Assistance technique pendant vos événements</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-4 group/feature">
                          <div className="w-8 h-8 bg-gradient-to-br from-primary-200 to-primary-300 rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover/feature:scale-110 transition-transform duration-300">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-semibold text-nzoo-dark mb-1 group-hover/feature:text-primary-600 transition-colors duration-300">Catering disponible</h4>
                            <p className="text-gray-600 text-sm">Service de restauration pour vos événements</p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Bouton pour voir plus/moins de fonctionnalités */}
                  <div className="mt-6">
                    <button
                      onClick={() => toggleServiceExpansion('formation')}
                      className="w-full bg-gradient-to-r from-primary-100 to-primary-200 hover:from-primary-200 hover:to-primary-300 text-primary-700 py-3 px-6 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 border border-primary-200"
                    >
                      <span className="flex items-center justify-center space-x-2">
                        <svg className={`w-5 h-5 transition-transform duration-300 ${expandedServices.formation ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                        <span>{expandedServices.formation ? 'Voir moins' : 'Voir +5 autres fonctionnalités'}</span>
                      </span>
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Service 3: Domiciliation */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="group relative bg-gradient-to-br from-white via-gray-50 to-white rounded-3xl shadow-soft border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-500"
              >
                {/* Background decoration amélioré */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full blur-3xl opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-nzoo-dark/20 to-primary-300/20 rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>
                
                <div className="relative z-10 p-8 sm:p-10">
                  {/* Header with image amélioré */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="relative w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-2xl overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-300">
                        <img
                          src="/domiciliation.jpg"
                          alt="Domiciliation"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                      <div>
                        <h3 className="text-2xl sm:text-3xl font-bold text-nzoo-dark font-montserrat group-hover:text-primary-600 transition-colors duration-300">
                          Domiciliation
                        </h3>
                        <p className="text-primary-600 font-medium text-sm">Services administratifs et légaux</p>
                      </div>
                    </div>
                    {/* Badge de disponibilité */}
                    <div className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-semibold rounded-full">
                      Disponible
                    </div>
                  </div>
                  
                  {/* Description améliorée */}
                  <p className="text-gray-600 mb-8 font-poppins leading-relaxed text-lg">
                    Notre service de domiciliation commerciale vous offre une adresse professionnelle légale et un support administratif complet. Simplifiez votre gestion administrative et concentrez-vous sur votre activité.
                  </p>
                  
                  {/* Features avec design amélioré */}
                  <div className="space-y-4">
                    <div className="flex items-start space-x-4 group/feature">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-300 rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover/feature:scale-110 transition-transform duration-300">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-nzoo-dark mb-1 group-hover/feature:text-primary-600 transition-colors duration-300">Adresse professionnelle légale</h4>
                        <p className="text-gray-600 text-sm">Une adresse commerciale reconnue pour vos documents officiels</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-4 group/feature">
                      <div className="w-8 h-8 bg-gradient-to-br from-nzoo-dark to-nzoo-dark-light rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover/feature:scale-110 transition-transform duration-300">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-nzoo-dark mb-1 group-hover/feature:text-primary-600 transition-colors duration-300">Réception et tri du courrier</h4>
                        <p className="text-gray-600 text-sm">Gestion professionnelle de votre courrier administratif</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-4 group/feature">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-400 rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover/feature:scale-110 transition-transform duration-300">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-nzoo-dark mb-1 group-hover/feature:text-primary-600 transition-colors duration-300">Support administratif</h4>
                        <p className="text-gray-600 text-sm">Assistance pour vos démarches administratives</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-4 group/feature">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-300 to-primary-200 rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover/feature:scale-110 transition-transform duration-300">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-nzoo-dark mb-1 group-hover/feature:text-primary-600 transition-colors duration-300">Accompagnement légal</h4>
                        <p className="text-gray-600 text-sm">Conseils et support pour vos obligations légales</p>
                      </div>
                    </div>

                    {/* Fonctionnalités supplémentaires (affichées conditionnellement) */}
                    {expandedServices.domiciliation && (
                      <>
                        <div className="flex items-start space-x-4 group/feature">
                          <div className="w-8 h-8 bg-gradient-to-br from-primary-200 to-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover/feature:scale-110 transition-transform duration-300">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-semibold text-nzoo-dark mb-1 group-hover/feature:text-primary-600 transition-colors duration-300">Numérisation des documents</h4>
                            <p className="text-gray-600 text-sm">Scan et envoi électronique de vos documents</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-4 group/feature">
                          <div className="w-8 h-8 bg-gradient-to-br from-primary-100 to-primary-50 rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover/feature:scale-110 transition-transform duration-300">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-semibold text-nzoo-dark mb-1 group-hover/feature:text-primary-600 transition-colors duration-300">Gestion des appels</h4>
                            <p className="text-gray-600 text-sm">Réception et transfert de vos appels professionnels</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-4 group/feature">
                          <div className="w-8 h-8 bg-gradient-to-br from-primary-50 to-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover/feature:scale-110 transition-transform duration-300">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-semibold text-nzoo-dark mb-1 group-hover/feature:text-primary-600 transition-colors duration-300">Assistance comptable</h4>
                            <p className="text-gray-600 text-sm">Support pour vos obligations comptables</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-4 group/feature">
                          <div className="w-8 h-8 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover/feature:scale-110 transition-transform duration-300">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-semibold text-nzoo-dark mb-1 group-hover/feature:text-primary-600 transition-colors duration-300">Sécurité des données</h4>
                            <p className="text-gray-600 text-sm">Protection et confidentialité de vos informations</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-4 group/feature">
                          <div className="w-8 h-8 bg-gradient-to-br from-primary-200 to-primary-300 rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover/feature:scale-110 transition-transform duration-300">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-semibold text-nzoo-dark mb-1 group-hover/feature:text-primary-600 transition-colors duration-300">Service client dédié</h4>
                            <p className="text-gray-600 text-sm">Un interlocuteur unique pour tous vos besoins</p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Bouton pour voir plus/moins de fonctionnalités */}
                  <div className="mt-6">
                    <button
                      onClick={() => toggleServiceExpansion('domiciliation')}
                      className="w-full bg-gradient-to-r from-primary-100 to-primary-200 hover:from-primary-200 hover:to-primary-300 text-primary-700 py-3 px-6 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 border border-primary-200"
                    >
                      <span className="flex items-center justify-center space-x-2">
                        <svg className={`w-5 h-5 transition-transform duration-300 ${expandedServices.domiciliation ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                        <span>{expandedServices.domiciliation ? 'Voir moins' : 'Voir +5 autres fonctionnalités'}</span>
                      </span>
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Service 4: Accompagnement des jeunes entrepreneurs */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="group relative bg-gradient-to-br from-white via-gray-50 to-white rounded-3xl shadow-soft border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-500"
              >
                {/* Background decoration amélioré */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full blur-3xl opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-nzoo-dark/20 to-primary-300/20 rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>
                
                <div className="relative z-10 p-8 sm:p-10">
                  {/* Header with image amélioré */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="relative w-36 h-28 sm:w-40 sm:h-32 lg:w-44 lg:h-36 rounded-2xl overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-300">
                        <img
                          src="/salle_reunion1.jpg"
                          alt="Accompagnement des jeunes entrepreneurs"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                      <div>
                        <h3 className="text-2xl sm:text-3xl font-bold text-nzoo-dark font-montserrat group-hover:text-primary-600 transition-colors duration-300">
                          Accompagnement des jeunes entrepreneurs
                        </h3>
                        <p className="text-primary-600 font-medium text-sm">Support et mentorat personnalisé</p>
                      </div>
                    </div>
                    {/* Badge de disponibilité */}
                    <div className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-semibold rounded-full">
                      Disponible
                    </div>
                  </div>
                  
                  {/* Description améliorée */}
                  <p className="text-gray-600 mb-8 font-poppins leading-relaxed text-lg">
                    Notre programme d'accompagnement dédié aux jeunes entrepreneurs vous offre un soutien personnalisé, des conseils d'experts et un réseau professionnel pour faire décoller votre projet.
                  </p>
                  
                  {/* Features avec design amélioré */}
                  <div className="space-y-4">
                    <div className="flex items-start space-x-4 group/feature">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-400 rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover/feature:scale-110 transition-transform duration-300">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-nzoo-dark mb-1 group-hover/feature:text-primary-600 transition-colors duration-300">Mentorat personnalisé</h4>
                        <p className="text-gray-600 text-sm">Accompagnement individuel par des entrepreneurs expérimentés</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-4 group/feature">
                      <div className="w-8 h-8 bg-gradient-to-br from-nzoo-dark to-nzoo-dark-light rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover/feature:scale-110 transition-transform duration-300">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-nzoo-dark mb-1 group-hover/feature:text-primary-600 transition-colors duration-300">Formation continue</h4>
                        <p className="text-gray-600 text-sm">Ateliers et formations sur les aspects clés de l'entrepreneuriat</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-4 group/feature">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-300 rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover/feature:scale-110 transition-transform duration-300">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-nzoo-dark mb-1 group-hover/feature:text-primary-600 transition-colors duration-300">Réseau professionnel</h4>
                        <p className="text-gray-600 text-sm">Accès à notre communauté d'entrepreneurs et partenaires</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-4 group/feature">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-300 to-primary-200 rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover/feature:scale-110 transition-transform duration-300">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-nzoo-dark mb-1 group-hover/feature:text-primary-600 transition-colors duration-300">Support technique</h4>
                        <p className="text-gray-600 text-sm">Assistance pour les aspects techniques et administratifs</p>
                      </div>
                    </div>

                    {/* Fonctionnalités supplémentaires (affichées conditionnellement) */}
                    {expandedServices.bureaux && (
                      <>
                        <div className="flex items-start space-x-4 group/feature">
                          <div className="w-8 h-8 bg-gradient-to-br from-primary-200 to-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover/feature:scale-110 transition-transform duration-300">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-semibold text-nzoo-dark mb-1 group-hover/feature:text-primary-600 transition-colors duration-300">Accompagnement financier</h4>
                            <p className="text-gray-600 text-sm">Conseils sur la gestion financière et la levée de fonds</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-4 group/feature">
                          <div className="w-8 h-8 bg-gradient-to-br from-primary-100 to-primary-50 rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover/feature:scale-110 transition-transform duration-300">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-semibold text-nzoo-dark mb-1 group-hover/feature:text-primary-600 transition-colors duration-300">Stratégie marketing</h4>
                            <p className="text-gray-600 text-sm">Développement de votre stratégie de communication</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-4 group/feature">
                          <div className="w-8 h-8 bg-gradient-to-br from-primary-50 to-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover/feature:scale-110 transition-transform duration-300">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-semibold text-nzoo-dark mb-1 group-hover/feature:text-primary-600 transition-colors duration-300">Événements networking</h4>
                            <p className="text-gray-600 text-sm">Participation à des événements professionnels exclusifs</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-4 group/feature">
                          <div className="w-8 h-8 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover/feature:scale-110 transition-transform duration-300">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-semibold text-nzoo-dark mb-1 group-hover/feature:text-primary-600 transition-colors duration-300">Suivi personnalisé</h4>
                            <p className="text-gray-600 text-sm">Accompagnement sur mesure selon vos besoins spécifiques</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-4 group/feature">
                          <div className="w-8 h-8 bg-gradient-to-br from-primary-200 to-primary-300 rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover/feature:scale-110 transition-transform duration-300">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-semibold text-nzoo-dark mb-1 group-hover/feature:text-primary-600 transition-colors duration-300">Ressources exclusives</h4>
                            <p className="text-gray-600 text-sm">Accès à des outils et ressources entrepreneuriales</p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Bouton pour voir plus/moins de fonctionnalités */}
                  <div className="mt-6">
                    <button
                      onClick={() => toggleServiceExpansion('bureaux')}
                      className="w-full bg-gradient-to-r from-primary-100 to-primary-200 hover:from-primary-200 hover:to-primary-300 text-primary-700 py-3 px-6 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 border border-primary-200"
                    >
                      <span className="flex items-center justify-center space-x-2">
                        <svg className={`w-5 h-5 transition-transform duration-300 ${expandedServices.bureaux ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                        <span>{expandedServices.bureaux ? 'Voir moins' : 'Voir +5 autres fonctionnalités'}</span>
                      </span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Call to Action */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="text-center mt-16"
            >
              <p className="text-xl text-nzoo-dark/70 mb-8 font-poppins">
                Besoin d'un pack personnalisé ? Contactez-nous pour une solution sur mesure.
              </p>
              <button
                onClick={() => navigate('/spaces')}
                className="bg-nzoo-dark hover:bg-nzoo-dark-light text-nzoo-white py-4 px-10 rounded-2xl shadow-nzoo hover:shadow-nzoo-hover transition-all duration-300 transform hover:scale-105 font-bold text-lg font-montserrat"
              >
                Découvrir nos espaces
              </button>
            </motion.div>
          </div>
        </section>

        {/* Features Section avec design moderne et responsive */}
        <section className="py-16 sm:py-20 md:py-24 lg:py-32 bg-gradient-to-br from-nzoo-dark via-nzoo-dark to-nzoo-dark relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-white/5 to-transparent rounded-full blur-3xl"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-20"
            >
              <div className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-8">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-3 animate-pulse"></div>
                <span className="text-white/90 font-semibold">Pourquoi nous choisir</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 font-montserrat">
                {t.featuresTitle}
              </h2>
              <div className="w-32 h-1 bg-gradient-to-r from-green-400 to-nzoo-dark mx-auto rounded-full mb-8"></div>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12 relative z-10">
              {t.features.map(({ icon, title, desc }, index) => (
                <motion.article 
                  key={title} 
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -10 }}
                  className="group text-center bg-white/10 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 hover:bg-white/20 transition-all duration-500 border border-white/20 hover:border-white/40 hover:shadow-2xl"
                >
                  <div className="bg-gradient-to-br from-white/20 to-white/10 w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 lg:mb-8 shadow-soft group-hover:shadow-xl transition-all duration-500">
                    <div className="text-white">
                      {React.cloneElement(icon, { className: "w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10" })}
                    </div>
                  </div>
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-3 sm:mb-4 lg:mb-6 font-montserrat group-hover:text-green-300 transition-colors duration-300">{title}</h3>
                  <p className="text-white/80 text-sm sm:text-base lg:text-lg leading-relaxed font-poppins group-hover:text-white/90 transition-colors duration-300">{desc}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section avec design moderne et responsive */}
        <section className="py-16 sm:py-20 md:py-24 lg:py-32 bg-gradient-to-br from-white via-gray-50 to-nzoo-dark/5 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-nzoo-dark/5 to-nzoo-dark/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-green-500/5 to-nzoo-dark/5 rounded-full blur-3xl"></div>
          
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-20"
            >
              <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-nzoo-dark/10 to-nzoo-dark/10 rounded-full border border-nzoo-dark/20 mb-8">
                <div className="w-2 h-2 bg-nzoo-dark rounded-full mr-3"></div>
                <span className="text-nzoo-dark font-semibold">Avis clients</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-nzoo-dark to-nzoo-dark bg-clip-text text-transparent mb-8 font-montserrat">
                {t.testimonialsTitle}
              </h2>
              <div className="w-32 h-1 bg-gradient-to-r from-nzoo-dark to-nzoo-dark mx-auto rounded-full mb-8"></div>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 relative z-10">
              {t.testimonials.map(({ name, text }, index) => (
                <motion.div
                  key={name}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="group bg-gradient-to-br from-white to-gray-50 backdrop-blur-xl p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-soft hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-gray-200"
                >
                  <div className="relative">
                    <div className="absolute -top-3 sm:-top-4 -left-3 sm:-left-4 text-4xl sm:text-5xl lg:text-6xl text-nzoo-dark/10 font-serif group-hover:text-nzoo-dark/20 transition-colors duration-300">"</div>
                    <div className="mb-4 sm:mb-6">
                      <div className="flex items-center space-x-1 mb-3 sm:mb-4">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"></div>
                          </div>
                        ))}
                      </div>
                      <p className="text-sm sm:text-base lg:text-lg italic leading-relaxed text-gray-700 group-hover:text-gray-800 transition-colors duration-300 font-poppins relative z-10">{text}</p>
                    </div>
                    <footer className="font-bold text-nzoo-dark text-lg sm:text-xl font-montserrat group-hover:text-nzoo-dark transition-colors duration-300">— {name}</footer>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Section personnalisée pour les utilisateurs connectés */}
        {isAuthenticated && (
          <section className="py-16 sm:py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-indigo-200/20 to-pink-200/20 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
            
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              {isAuthenticated && currentUser ? (
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1 }}
                  className="text-center mb-12"
                >
                  <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm rounded-full border border-blue-200/20 mb-6">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 animate-pulse"></div>
                    <span className="text-blue-700 font-semibold">Bienvenue, {currentUser?.full_name || currentUser?.username} !</span>
                  </div>
                  
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-nzoo-dark mb-6 font-montserrat">
                    Que souhaitez-vous faire aujourd'hui ?
                  </h2>
                  
                  <p className="text-lg text-nzoo-dark/70 mb-12 max-w-3xl mx-auto font-poppins">
                    Accédez rapidement à vos fonctionnalités préférées
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1 }}
                  className="text-center mb-12"
                >
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-nzoo-dark mb-6 font-montserrat">
                    Découvrez nos espaces de travail
                  </h2>
                  
                  <p className="text-lg text-nzoo-dark/70 mb-12 max-w-3xl mx-auto font-poppins">
                    Trouvez l'espace parfait pour votre activité professionnelle
                  </p>
                </motion.div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {/* Carte Réservation */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="group bg-white backdrop-blur-xl p-6 sm:p-8 rounded-2xl shadow-soft hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-blue-200"
                >
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Calendar className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-nzoo-dark mb-4 font-montserrat">Réserver un espace</h3>
                    <p className="text-gray-600 mb-6 font-poppins">Accédez à notre système de réservation pour réserver votre espace de travail</p>
                    <Link
                      to="/reservation/coworking"
                      className="inline-flex items-center justify-center w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105"
                    >
                      Réserver maintenant
                    </Link>
                  </div>
                </motion.div>

                {/* Carte Espaces */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="group bg-white backdrop-blur-xl p-6 sm:p-8 rounded-2xl shadow-soft hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-green-200"
                >
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                        <div className="w-4 h-4 bg-green-500 rounded"></div>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-nzoo-dark mb-4 font-montserrat">Voir nos espaces</h3>
                    <p className="text-gray-600 mb-6 font-poppins">Découvrez notre gamme complète d'espaces de travail disponibles</p>
                    <Link
                      to="/spaces"
                      className="inline-flex items-center justify-center w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105"
                    >
                      Explorer les espaces
                    </Link>
                  </div>
                </motion.div>

                {/* Carte Administration (pour admin et user) */}
                {(userRole === 'admin' || userRole === 'user') && (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    whileHover={{ scale: 1.02, y: -5 }}
                    className="group bg-white backdrop-blur-xl p-6 sm:p-8 rounded-2xl shadow-soft hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-purple-200"
                  >
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                        <Shield className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-nzoo-dark mb-4 font-montserrat">Administration</h3>
                      <p className="text-gray-600 mb-6 font-poppins">Accédez au tableau de bord administrateur pour gérer les réservations et les utilisateurs</p>
                      <Link
                        to="/admin/dashboard"
                        className="inline-flex items-center justify-center w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-purple-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
                      >
                        Accéder à l'admin
                      </Link>
                    </div>
                  </motion.div>
                )}

                {/* Carte Profil Client (pour les clients) */}
                {userRole === 'clients' && (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    whileHover={{ scale: 1.02, y: -5 }}
                    className="group bg-white backdrop-blur-xl p-6 sm:p-8 rounded-2xl shadow-soft hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-orange-200"
                  >
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                        <User className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-nzoo-dark mb-4 font-montserrat">Mon Profil</h3>
                      <p className="text-gray-600 mb-6 font-poppins">Gérez vos informations personnelles et vos préférences</p>
                      <button
                        onClick={() => {
                          // Navigation vers la page de profil client
                          window.location.href = '/client-profile';
                        }}
                        className="inline-flex items-center justify-center w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-300 transform hover:scale-105"
                      >
                        Voir mon profil
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Quick Access to Spaces avec design moderne et responsive */}
        <section className="py-16 sm:py-20 md:py-24 lg:py-32 bg-gradient-to-br from-nzoo-dark via-nzoo-dark to-nzoo-dark relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-white/5 to-transparent rounded-full blur-3xl"></div>
          
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="relative z-10"
            >
              <div className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-8">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-3 animate-pulse"></div>
                <span className="text-white/90 font-semibold">Prêt à commencer ?</span>
              </div>
              
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 lg:mb-8 font-montserrat leading-tight">
                Découvrez nos espaces
              </h2>
              
              <p className="text-lg sm:text-xl md:text-2xl text-white/80 mb-8 sm:mb-10 lg:mb-12 max-w-3xl lg:max-w-4xl mx-auto leading-relaxed font-poppins">
                Explorez notre gamme complète d'espaces de travail modernes et équipés.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
                <Link
                  to="/spaces"
                  className="group bg-gradient-to-r from-white to-gray-100 text-nzoo-dark hover:from-gray-100 hover:to-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-semibold text-sm sm:text-base font-montserrat border border-white/30 backdrop-blur-sm"
                >
                  <span className="flex items-center justify-center space-x-2">
                    <span>Explorer nos espaces</span>
                  </span>
                </Link>
                
                <button
                  onClick={() => {
                    // TODO: Ajouter la navigation vers la page des appartements
                    console.log('Navigation vers les appartements');
                  }}
                  className="group bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-semibold text-sm sm:text-base font-montserrat border border-green-400/30 backdrop-blur-sm"
                >
                  <span className="flex items-center justify-center space-x-2">
                    <span>Réserver un appartement</span>
                  </span>
                </button>
                
                <button
                  onClick={() => {
                    const element = document.querySelector('#services') as HTMLElement;
                    if (element) {
                      window.scrollTo({ top: element.offsetTop, behavior: 'smooth' });
                    }
                  }}
                  className="group border border-white/60 text-white hover:bg-white/10 py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl sm:rounded-2xl transition-all duration-300 font-semibold text-sm sm:text-base font-montserrat backdrop-blur-sm hover:border-white hover:scale-105"
                >
                  <span className="flex items-center justify-center space-x-2">
                    <span>Nos services</span>
                  </span>
                </button>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </HelmetProvider>
  );
};

export default HomePage;