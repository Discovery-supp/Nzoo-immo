import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { getAllSpaces } from '../data/spacesData';
import SpaceContentIndicator from '../components/SpaceContentIndicator';

interface SpacesPageProps {
  language: 'fr' | 'en';
}

const SpacesPage: React.FC<SpacesPageProps> = ({ language }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [spaces, setSpaces] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('dark');
    setDarkMode(stored === 'true');
  }, []);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('dark', darkMode.toString());
  }, [darkMode]);

  // Charger les espaces
  useEffect(() => {
    const loadSpaces = async () => {
      try {
        setLoading(true);
        
        // Charger les espaces
        const spacesData = await getAllSpaces(language);
        setSpaces(spacesData);
        
      } catch (error) {
        console.error('Erreur lors du chargement des espaces:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSpaces();
  }, [language]);

  const toggleDark = () => setDarkMode((d) => !d);

  const translations = {
          fr: {
        title: 'Nos Espaces de Travail',
        subtitle: 'Découvrez nos espaces modernes et équipés pour tous vos besoins professionnels',
        backHome: 'Retour à l\'accueil',
        loading: 'Chargement...',
        includedEquipment: 'Équipements inclus',
        viewDetails: 'Voir les détails',
        readyToStart: 'Prêt à commencer ?',
        readyToReserve: 'Prêt à réserver votre espace ?',
        chooseSpace: 'Choisissez l\'espace qui correspond le mieux à vos besoins et réservez en quelques clics.',
        startReservation: 'Commencer ma réservation',
        backToHome: 'Retour à l\'accueil'
      },
          en: {
        title: 'Our Workspaces',
        subtitle: 'Discover our modern and equipped spaces for all your professional needs',
        backHome: 'Back to home',
        loading: 'Loading...',
        includedEquipment: 'Included equipment',
        viewDetails: 'View details',
        readyToStart: 'Ready to start?',
        readyToReserve: 'Ready to reserve your space?',
        chooseSpace: 'Choose the space that best suits your needs and book in just a few clicks.',
        startReservation: 'Start my reservation',
        backToHome: 'Back to home'
      }
  };

  const t = translations[language];

  // Fonction pour obtenir le prix formaté d'un espace
  const getSpacePrice = (spaceKey: string) => {
    const space = spaces[spaceKey];
    if (!space) return '';
    
    if (space.dailyPrice) {
      return language === 'fr' ? `À partir de $${space.dailyPrice}/jour` : `From $${space.dailyPrice}/day`;
    }
    if (space.monthlyPrice) {
      return language === 'fr' ? `À partir de $${space.monthlyPrice}/mois` : `From $${space.monthlyPrice}/month`;
    }
    if (space.hourlyPrice) {
      return language === 'fr' ? `À partir de $${space.hourlyPrice}/heure` : `From $${space.hourlyPrice}/hour`;
    }
    return '';
  };

  // Fonction pour obtenir la capacité formatée
  const getSpaceCapacity = (spaceKey: string) => {
    const space = spaces[spaceKey];
    if (!space) return '';
    
    if (spaceKey === 'coworking') {
      return language === 'fr' ? `Max ${space.maxOccupants} personnes` : `Max ${space.maxOccupants} people`;
    }
    if (spaceKey === 'bureau-prive') {
      return language === 'fr' ? 'Équipe complète' : 'Full team';
    }
    if (spaceKey === 'domiciliation') {
      return language === 'fr' ? 'Service professionnel' : 'Professional service';
    }
    // Pour les nouveaux espaces ajoutés
    return language === 'fr' ? `Max ${space.maxOccupants} personnes` : `Max ${space.maxOccupants} people`;
  };

  // Fonction pour obtenir la couleur d'un espace
  const getSpaceColor = (spaceKey: string) => {
    const colorMap: Record<string, string> = {
      coworking: 'primary',
      'bureau-prive': 'nzoo-dark',
      'domiciliation': 'primary-light'
    };
    
    // Si c'est un espace connu, utiliser sa couleur
    if (colorMap[spaceKey]) {
      return colorMap[spaceKey];
    }
    
    // Pour les nouveaux espaces, utiliser une couleur basée sur la clé
    const colors = ['primary', 'nzoo-dark', 'primary-light', 'primary-400', 'primary-300', 'primary-200'];
    const hash = spaceKey.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return colors[Math.abs(hash) % colors.length];
  };

  // Fonction pour obtenir le type d'espace affiché
  const getSpaceType = (spaceKey: string) => {
    const typeMap: Record<string, string> = {
      coworking: 'Coworking',
      'bureau-prive': 'Bureau Privé',
      'domiciliation': 'Domiciliation'
    };
    
    // Si c'est un espace connu, utiliser son type
    if (typeMap[spaceKey]) {
      return typeMap[spaceKey];
    }
    
    // Pour les nouveaux espaces, utiliser la clé avec première lettre majuscule
    return spaceKey.charAt(0).toUpperCase() + spaceKey.slice(1);
  };

  const resetToDefault = () => {
    // Fonction pour réinitialiser à la configuration par défaut
    console.log('Reset to default spaces configuration');
  };

  // Affichage de chargement
  if (loading) {
    return (
      <HelmetProvider>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nzoo-dark mx-auto mb-4"></div>
              <h1 className="text-xl font-semibold text-gray-700">{t.loading}</h1>
            </div>
          </div>
        </div>
      </HelmetProvider>
    );
  }

  return (
    <HelmetProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <Helmet>
          <title>{t.title} - Nzoo Immo</title>
          <meta name="description" content={t.subtitle} />
        </Helmet>

        {/* Header Section */}
        <section className="relative bg-gradient-nzoo pt-24 pb-16 overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0 overflow-hidden">
            <img
              src="https://images.pexels.com/photos/3182773/pexels-photo-3182773.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop"
              alt="Espaces de travail modernes"
              className="w-full h-full object-cover object-center scale-110 opacity-40 transition-transform duration-700"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-nzoo-dark/60 via-transparent to-nzoo-dark/60"></div>
          </div>

          {/* Background decorations */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-nzoo-dark/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-green-500/20 to-nzoo-dark/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-nzoo-dark/10 to-transparent rounded-full blur-3xl"></div>
          </div>

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 mb-8"
              >
                <span className="text-white/90 font-semibold font-poppins">{getSpaceType('coworking')}</span>
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 font-montserrat leading-tight"
              >
                {t.title}
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.4 }}
                className="text-xl md:text-2xl text-white/80 mb-8 max-w-4xl mx-auto leading-relaxed font-poppins"
              >
                {t.subtitle}
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              >
                <Link
                  to="/"
                  className="group bg-gradient-to-r from-white to-gray-100 text-nzoo-dark hover:from-gray-100 hover:to-white py-3 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-semibold font-montserrat border border-white/30 backdrop-blur-sm"
                >
                  <span className="flex items-center justify-center space-x-2">
                    <span>{t.backHome}</span>
                  </span>
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Spaces Grid Section */}
        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="text-3xl md:text-4xl font-bold text-nzoo-dark mb-4 font-montserrat"
              >
                {t.title}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-lg text-primary-600 max-w-3xl mx-auto font-poppins"
              >
                {t.subtitle}
              </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Object.entries(spaces).map(([spaceKey, space], index) => {
                const color = getSpaceColor(spaceKey);

                return (
                  <motion.article
                    key={spaceKey}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    className="group bg-white rounded-3xl shadow-soft border-2 border-primary-200 hover:border-nzoo-dark transition-all duration-500 hover:shadow-medium overflow-hidden"
                  >
                    {/* Image */}
                    <div className="relative h-48 bg-gradient-to-br from-primary-100 to-primary-50 overflow-hidden">
                      <img
                        src={space.imageUrl || `/images/spaces/${spaceKey}.jpg`}
                        alt={space.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>

                    {/* Content */}
                    <div className="p-8">
                      <h3 className="text-2xl font-bold text-nzoo-dark mb-4 font-montserrat">
                        {space.title}
                      </h3>
                      
                      <p className="text-primary-600 mb-6 leading-relaxed font-poppins">
                        {space.description}
                      </p>

                      {/* Features */}
                      <div className="mb-6">
                        <h4 className="font-semibold text-nzoo-dark mb-3 font-montserrat">
                          {t.includedEquipment}
                        </h4>
                        <ul className="space-y-2">
                          {space.features.slice(0, 4).map((feature: string, featureIndex: number) => (
                            <li key={featureIndex} className="flex items-center text-sm text-primary-600 font-poppins">
                              <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Price and Capacity */}
                      <div className="mb-6">
                        <p className="text-lg font-bold text-nzoo-dark font-montserrat">
                          {getSpacePrice(spaceKey)}
                        </p>
                        <p className="text-sm text-primary-600 font-poppins">
                          {getSpaceCapacity(spaceKey)}
                        </p>
                      </div>
                      
                                              {/* View Details Button - Redirige vers la page de réservation spécifique */}
                       <Link
                         to={`/reservation/${spaceKey}`}
                         className={`group block text-white text-center py-4 rounded-2xl transition-all duration-500 font-bold text-lg hover:shadow-2xl transform hover:scale-105 ${
                           color === 'primary' ? 'bg-gradient-to-r from-primary-500 to-primary-400 hover:from-primary-600 hover:to-primary-500' :
                           color === 'nzoo-dark' ? 'bg-gradient-to-r from-nzoo-dark to-nzoo-dark-light hover:from-nzoo-dark-light hover:to-nzoo-dark-lighter' :
                           color === 'primary-light' ? 'bg-gradient-to-r from-primary-400 to-primary-300 hover:from-primary-500 hover:to-primary-400' :
                           color === 'primary-400' ? 'bg-gradient-to-r from-primary-400 to-primary-300 hover:from-primary-500 hover:to-primary-400' :
                           color === 'primary-300' ? 'bg-gradient-to-r from-primary-300 to-primary-200 hover:from-primary-400 hover:to-primary-300' :
                           'bg-gradient-to-r from-primary-200 to-primary-100 hover:from-primary-300 hover:to-primary-200'
                         }`}
                       >
                         <span className="flex items-center justify-center space-x-3">
                           <span>{t.viewDetails}</span>
                         </span>
                       </Link>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </section>

        {/* Call to Action Section avec design moderne */}
        <section className="py-32 bg-gradient-to-br from-nzoo-dark via-nzoo-dark to-nzoo-dark relative overflow-hidden">
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
                <span className="text-white/90 font-semibold">{t.readyToStart}</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 font-montserrat leading-tight">
                {t.readyToReserve}
              </h2>
              
              <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-4xl mx-auto leading-relaxed font-poppins">
                {t.chooseSpace}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Link
                  to="/reservation/coworking"
                  className="group bg-gradient-to-r from-white to-gray-100 text-nzoo-dark hover:from-gray-100 hover:to-white py-5 px-12 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-105 font-bold text-xl font-montserrat border-2 border-white/20 backdrop-blur-sm"
                >
                  <span className="flex items-center justify-center space-x-3">
                    <span>{t.startReservation}</span>
                  </span>
                </Link>
                
                <Link
                  to="/"
                  className="group border-3 border-white/80 text-white hover:bg-white/10 py-5 px-12 rounded-3xl transition-all duration-500 font-bold text-xl font-montserrat backdrop-blur-sm hover:border-white hover:scale-105"
                >
                  <span className="flex items-center justify-center space-x-3">
                    <span>{t.backToHome}</span>
                  </span>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
        <SpaceContentIndicator language={language} onReset={resetToDefault} />
      </div>
    </HelmetProvider>
  );
};

export default SpacesPage;
