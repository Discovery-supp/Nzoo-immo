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
        desc: 'Cartes VISA et Mobile Money acceptés',
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
        desc: 'Cartes VISA et Mobile Money acceptés',
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
                    <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-nzoo-dark border-t-transparent rounded-full animate-spin group-hover:border-white group-hover:border-t-transparent"></div>
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
                    <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin group-hover:border-green-100 group-hover:border-t-transparent"></div>
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
                    <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin group-hover:border-nzoo-dark group-hover:border-t-transparent"></div>
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


        {/* Services Section avec design moderne et responsive */}
        <section id="services" className="py-16 sm:py-20 md:py-24 lg:py-32 bg-gradient-to-br from-white via-gray-50 to-nzoo-dark/5 relative overflow-hidden">
          {/* Éléments décoratifs de fond */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-nzoo-dark/5 to-nzoo-dark/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-green-500/5 to-nzoo-dark/5 rounded-full blur-3xl"></div>
          
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12 sm:mb-16 lg:mb-20"
            >
              <div className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-nzoo-dark/10 to-nzoo-dark/10 rounded-full border border-nzoo-dark/20 mb-4 sm:mb-6 lg:mb-8">
                <div className="w-2 h-2 bg-nzoo-dark rounded-full mr-2 sm:mr-3"></div>
                <span className="text-nzoo-dark font-semibold text-sm sm:text-base">Nos Solutions</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-nzoo-dark to-nzoo-dark bg-clip-text text-transparent mb-4 sm:mb-6 lg:mb-8 font-montserrat">
                Nos Services
              </h2>
              <div className="w-24 sm:w-32 h-1 bg-gradient-to-r from-nzoo-dark to-nzoo-dark mx-auto rounded-full mb-4 sm:mb-6 lg:mb-8"></div>
              <p className="text-lg sm:text-xl text-gray-600 mb-8 sm:mb-10 lg:mb-12 max-w-3xl lg:max-w-4xl mx-auto font-poppins leading-relaxed">
                Découvrez nos packs adaptés à tous vos besoins professionnels
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
              {/* Pack Startup & Freelance */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                whileHover={{ scale: 1.02, y: -10 }}
                className="group bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-soft border border-gray-100 overflow-hidden flex flex-col hover:shadow-2xl transition-all duration-500"
              >
                <div className="relative overflow-hidden">
                  <img
                    src="/Vignette_1.png"
                    alt="Pack Startup & Freelance"
                    className="w-full h-32 sm:h-40 md:h-48 object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent" />
                  <div className="absolute top-4 sm:top-6 left-4 sm:left-6">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-semibold">
                      Populaire
                    </div>
                  </div>
                </div>
                
                <div className="p-4 sm:p-6 lg:p-8 flex flex-col flex-grow">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 font-montserrat">
                      PACK STARTUP & FREE-LANCE
                    </h3>
                    <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                      <div className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4 sm:mb-6 flex-grow font-poppins leading-relaxed text-sm sm:text-base lg:text-lg">
                    Destiné aux startups, freelances, télétravailleurs et professionnels à la recherche d'un espace flexible, accessible et stimulant.
                  </p>
                  
                  {/* Features */}
                  <div className="mb-6 sm:mb-8">
                    <h4 className="font-semibold text-gray-800 mb-3 sm:mb-4 font-montserrat text-base sm:text-lg">
                      Équipements inclus :
                    </h4>
                    <ul className="space-y-3">
                      <li className="text-gray-600 flex items-center font-poppins group">
                        <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mr-4 shadow-sm group-hover:shadow-md transition-all duration-300">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                        <span className="group-hover:text-gray-800 transition-colors duration-300">Accès à un poste de travail en open space</span>
                      </li>
                      <li className="text-gray-600 flex items-center font-poppins group">
                        <div className="w-6 h-6 bg-gradient-to-br from-nzoo-dark to-nzoo-dark rounded-full flex items-center justify-center mr-4 shadow-sm group-hover:shadow-md transition-all duration-300">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                        <span className="group-hover:text-gray-800 transition-colors duration-300">Connexion Internet haut débit</span>
                      </li>
                      <li className="text-gray-600 flex items-center font-poppins group">
                        <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-4 shadow-sm group-hover:shadow-md transition-all duration-300">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                        <span className="group-hover:text-gray-800 transition-colors duration-300">Accès à l'espace détente (café/thé en option)</span>
                      </li>
                      <li className="text-gray-500 italic font-poppins flex items-center">
                        <div className="w-6 h-6 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center mr-4">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                        <span>+2 autres...</span>
                      </li>
                    </ul>
                  </div>
                  
                  {/* Price and Capacity */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200 mb-8">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-2xl font-bold text-green-600 font-montserrat">À partir de $300/mois</span>
                        <div className="text-sm text-green-600 font-medium">ou $15/jour</div>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Book Button */}
                </div>
              </motion.div>

              {/* Pack Welcome to Kin */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                whileHover={{ scale: 1.05 }}
                className="bg-nzoo-white rounded-2xl shadow-nzoo border border-nzoo-gray/30 overflow-hidden flex flex-col hover:shadow-nzoo-hover transition-all duration-300"
              >
                <div className="relative overflow-hidden">
                  <img
                    src="/Vignette_2.png"
                    alt="Pack Welcome to Kin"
                    className="w-full h-32 sm:h-40 md:h-48 object-cover transition-transform duration-300 hover:scale-110"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
                
                <div className="p-4 sm:p-6 flex flex-col flex-grow">
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2 sm:mb-3 text-nzoo-dark font-montserrat">
                    PACK WELCOME TO KIN
                  </h3>
                  
                  <p className="text-nzoo-dark/70 mb-4 flex-grow font-poppins leading-relaxed">
                    Destiné aux entrepreneurs étrangers, membres de la diaspora et professionnels internationaux souhaitant s'implanter à Kinshasa.
                  </p>
                  
                  {/* Features */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-nzoo-dark mb-3 font-montserrat">
                      Équipements inclus :
                    </h4>
                    <ul className="space-y-1">
                      <li className="text-sm text-nzoo-dark/60 flex items-center font-poppins">
                        <span className="w-2 h-2 bg-nzoo-dark rounded-full mr-3"></span>
                        Accès à un poste de travail en open space
                      </li>
                      <li className="text-sm text-nzoo-dark/60 flex items-center font-poppins">
                        <span className="w-2 h-2 bg-nzoo-dark rounded-full mr-3"></span>
                        Hébergement studio meublé à proximité
                      </li>
                      <li className="text-sm text-nzoo-dark/60 flex items-center font-poppins">
                        <span className="w-2 h-2 bg-nzoo-dark rounded-full mr-3"></span>
                        Accompagnement personnalisé à l'installation
                      </li>
                      <li className="text-sm text-nzoo-dark/50 italic font-poppins">
                        +2 autres...
                      </li>
                    </ul>
                  </div>
                  
                  {/* Price and Capacity */}
                  <div className="flex justify-between items-center text-sm text-nzoo-dark/70 mb-6 p-4 bg-nzoo-gray/20 rounded-xl border border-nzoo-gray/40 font-poppins">
                    <span className="font-bold text-nzoo-dark">À partir de $1000/mois</span>
                    <span>Pack complet</span>
                  </div>
                  
                  {/* Book Button */}
                </div>
              </motion.div>

              {/* Pack Invest Lounge */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                whileHover={{ scale: 1.05 }}
                className="bg-nzoo-white rounded-2xl shadow-nzoo border border-nzoo-gray/30 overflow-hidden flex flex-col hover:shadow-nzoo-hover transition-all duration-300"
              >
                <div className="relative overflow-hidden">
                  <img
                    src="/Vignette_3.png"
                    alt="Pack Invest Lounge"
                    className="w-full h-32 sm:h-40 md:h-48 object-cover transition-transform duration-300 hover:scale-110"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
                
                <div className="p-4 sm:p-6 flex flex-col flex-grow">
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2 sm:mb-3 text-nzoo-dark font-montserrat">
                    PACK INVEST LOUNGE
                  </h3>
                  
                  <p className="text-nzoo-dark/70 mb-4 flex-grow font-poppins leading-relaxed">
                    Destiné aux investisseurs et Business Angels souhaitant s'implanter ou développer une activité à Kinshasa.
                  </p>
                  
                  {/* Features */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-nzoo-dark mb-3 font-montserrat">
                      Équipements inclus :
                    </h4>
                    <ul className="space-y-1">
                      <li className="text-sm text-nzoo-dark/60 flex items-center font-poppins">
                        <span className="w-2 h-2 bg-nzoo-dark rounded-full mr-3"></span>
                        Recherche de partenariats fiables
                      </li>
                      <li className="text-sm text-nzoo-dark/60 flex items-center font-poppins">
                        <span className="w-2 h-2 bg-nzoo-dark rounded-full mr-3"></span>
                        Facilitation des échanges locaux
                      </li>
                      <li className="text-sm text-nzoo-dark/60 flex items-center font-poppins">
                        <span className="w-2 h-2 bg-nzoo-dark rounded-full mr-3"></span>
                        Visibilité aux projets
                      </li>
                      <li className="text-sm text-nzoo-dark/50 italic font-poppins">
                        +2 autres...
                      </li>
                    </ul>
                  </div>
                  
                  {/* Price and Capacity */}
                  <div className="flex justify-between items-center text-sm text-nzoo-dark/70 mb-6 p-4 bg-nzoo-gray/20 rounded-xl border border-nzoo-gray/40 font-poppins">
                    <span className="font-bold text-nzoo-dark">Sur mesure</span>
                    <span>Personnalisé</span>
                  </div>
                  
                  {/* Book Button */}
                </div>
              </motion.div>

              {/* Domiciliation Commerciale */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                whileHover={{ scale: 1.05 }}
                className="bg-nzoo-white rounded-2xl shadow-nzoo border border-nzoo-gray/30 overflow-hidden flex flex-col hover:shadow-nzoo-hover transition-all duration-300"
              >
                <div className="relative overflow-hidden">
                  <img
                    src="/Vignette_4.png"
                    alt="Domiciliation Commerciale"
                    className="w-full h-32 sm:h-40 md:h-48 object-cover transition-transform duration-300 hover:scale-110"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
                
                <div className="p-4 sm:p-6 flex flex-col flex-grow">
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2 sm:mb-3 text-nzoo-dark font-montserrat">
                    DOMICILIATION COMMERCIALE
                  </h3>
                  
                  <p className="text-nzoo-dark/70 mb-4 flex-grow font-poppins leading-relaxed">
                    Services de domiciliation commerciale destinée aux Startups, PME, Freelances et porteurs de projets.
                  </p>
                  
                  {/* Features */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-nzoo-dark mb-3 font-montserrat">
                      Équipements inclus :
                    </h4>
                    <ul className="space-y-1">
                      <li className="text-sm text-nzoo-dark/60 flex items-center font-poppins">
                        <span className="w-2 h-2 bg-nzoo-dark rounded-full mr-3"></span>
                        Adresse légale à Kinshasa
                      </li>
                      <li className="text-sm text-nzoo-dark/60 flex items-center font-poppins">
                        <span className="w-2 h-2 bg-nzoo-dark rounded-full mr-3"></span>
                        Gestion du courrier administratif
                      </li>
                      <li className="text-sm text-nzoo-dark/60 flex items-center font-poppins">
                        <span className="w-2 h-2 bg-nzoo-dark rounded-full mr-3"></span>
                        Attestation de domiciliation
                      </li>
                      <li className="text-sm text-nzoo-dark/50 italic font-poppins">
                        +2 autres...
                      </li>
                    </ul>
                  </div>
                  
                  {/* Price and Capacity */}
                  <div className="flex justify-between items-center text-sm text-nzoo-dark/70 mb-6 p-4 bg-nzoo-gray/20 rounded-xl border border-nzoo-gray/40 font-poppins">
                    <span className="font-bold text-nzoo-dark">À partir de $800/an</span>
                    <span>ou $100/mois</span>
                  </div>
                  
                  {/* Book Button */}
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
                          // TODO: Ajouter la navigation vers le profil client
                          console.log('Navigation vers le profil client');
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
                    <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-nzoo-dark border-t-transparent rounded-full animate-spin group-hover:border-white group-hover:border-t-transparent"></div>
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
                    <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin group-hover:border-green-100 group-hover:border-t-transparent"></div>
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
                    <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin group-hover:border-nzoo-dark group-hover:border-t-transparent"></div>
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