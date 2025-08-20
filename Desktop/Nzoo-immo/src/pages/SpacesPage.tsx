import React, { useState, useEffect } from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useSpaceContent } from '../hooks/useSpaceContent';
import SpaceContentIndicator from '../components/SpaceContentIndicator';

interface SpacesPageProps {
  language: 'fr' | 'en';
}

const SpacesPage: React.FC<SpacesPageProps> = ({ language }) => {
  const [darkMode, setDarkMode] = useState(false);
  const { spaces, hasModifications, lastModified, resetToDefault } = useSpaceContent(language);

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

  const toggleDark = () => setDarkMode((d) => !d);

  const translations = {
    fr: {
      title: 'Nos Espaces de Travail',
      subtitle: 'Découvrez nos espaces modernes et équipés pour tous vos besoins professionnels',
      bookButton: 'Réserver',
      backHome: 'Retour à l\'accueil'
    },
    en: {
      title: 'Our Workspaces',
      subtitle: 'Discover our modern and equipped spaces for all your professional needs',
      bookButton: 'Book',
      backHome: 'Back to home'
    }
  };

  const t = translations[language];

  // Obtenir les espaces depuis le fichier de données
  // const spaces = getAllSpaces(language); // This line is now redundant as spaces state is managed

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
      coworking: 'blue',
      'bureau-prive': 'green',
      'domiciliation': 'purple'
    };
    
    // Si c'est un espace connu, utiliser sa couleur
    if (colorMap[spaceKey]) {
      return colorMap[spaceKey];
    }
    
    // Pour les nouveaux espaces, utiliser une couleur basée sur la clé
    const colors = ['blue', 'green', 'purple', 'orange', 'pink', 'indigo'];
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
    
    // Pour les nouveaux espaces, générer un type basé sur la clé
    return spaceKey.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <HelmetProvider>
      <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-700 font-sans">
        <Helmet>
          <title>Nzoo Immo - {t.title}</title>
        </Helmet>

        {/* Dark mode toggle avec design moderne */}
        <div className="fixed top-28 right-4 z-50">
          <button
            onClick={toggleDark}
            className="p-3 rounded-2xl bg-white/90 backdrop-blur-xl hover:bg-white shadow-soft hover:shadow-medium transition-all duration-300 hover:scale-105 border border-white/20"
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-orange-500" />
            ) : (
              <Moon className="w-5 h-5 text-nzoo-dark" />
            )}
          </button>
        </div>

        {/* Header Section avec design moderne */}
        <section className="relative pt-40 pb-32 bg-gradient-to-br from-slate-900 via-nzoo-dark to-nzoo-dark overflow-hidden">
                    {/* Background Image - Espaces de travail modernes */}
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
            {/* Overlay gradient pour améliorer la lisibilité */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-nzoo-dark/60 via-transparent to-nzoo-dark/60"></div>
          </div>

          {/* Éléments décoratifs de fond */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-nzoo-dark/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-green-500/20 to-nzoo-dark/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-nzoo-dark/10 to-transparent rounded-full blur-3xl"></div>
          </div>

          {/* Contenu centré avec design moderne */}
          <div className="relative z-10 flex items-center justify-center h-full">
            <div className="text-center text-white px-4 max-w-5xl">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="mb-8"
              >
                <div className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3 animate-pulse"></div>
                  <span className="text-white/90 font-medium">Nos Espaces</span>
                </div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.4 }}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-8 font-montserrat drop-shadow-2xl leading-tight"
                style={{ 
                  background: 'linear-gradient(135deg, #FFFFFF 0%, #E2E8F0 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                {t.title}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.6 }}
                className="text-xl sm:text-2xl text-white/90 mb-12 max-w-4xl mx-auto leading-relaxed font-poppins"
              >
                {t.subtitle}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.8 }}
                className="flex flex-col sm:flex-row gap-6 justify-center items-center"
              >
                <Link
                  to="/"
                  className="group bg-gradient-to-r from-white to-gray-100 text-nzoo-dark hover:from-gray-100 hover:to-white py-4 px-8 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-105 font-bold text-lg font-montserrat border-2 border-white/20 backdrop-blur-sm"
                >
                  <span className="flex items-center justify-center space-x-3">
                    <span>{t.backHome}</span>
                    <div className="w-4 h-4 border-2 border-nzoo-dark border-t-transparent rounded-full animate-spin group-hover:border-white group-hover:border-t-transparent"></div>
                  </span>
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Spaces Section avec design moderne */}
        <section className="py-32 bg-gradient-to-br from-white via-gray-50 to-nzoo-dark/5 relative overflow-hidden">
          {/* Éléments décoratifs de fond */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-nzoo-dark/5 to-nzoo-dark/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-green-500/5 to-nzoo-dark/5 rounded-full blur-3xl"></div>
          
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-20"
            >
              <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-nzoo-dark/10 to-nzoo-dark/10 rounded-full border border-nzoo-dark/20 mb-8">
                <div className="w-2 h-2 bg-nzoo-dark rounded-full mr-3"></div>
                <span className="text-nzoo-dark font-semibold">Nos Solutions</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-nzoo-dark to-nzoo-dark bg-clip-text text-transparent mb-8 font-montserrat">
                Choisissez votre espace
              </h2>
              <div className="w-32 h-1 bg-gradient-to-r from-nzoo-dark to-nzoo-dark mx-auto rounded-full mb-8"></div>
              <p className="text-xl text-gray-600 mb-12 max-w-4xl mx-auto font-poppins leading-relaxed">
                Découvrez nos espaces modernes et équipés pour tous vos besoins professionnels
              </p>
            </motion.div>
            
            <div className="grid md:grid-cols-3 gap-12">
              {Object.entries(spaces).map(([spaceKey, space], index) => {
                const color = getSpaceColor(spaceKey);
                const price = getSpacePrice(spaceKey);
                const capacity = getSpaceCapacity(spaceKey);
                const link = `/reservation/${spaceKey}`;
                
                const colorMap: Record<string, string> = {
                  blue: 'text-nzoo-dark dark:text-nzoo-dark',
                  green: 'text-green-600 dark:text-green-400',
                  purple: 'text-purple-600 dark:text-purple-400',
                };
                const buttonMap: Record<string, string> = {
                  blue: 'bg-nzoo-dark hover:bg-nzoo-dark/80',
                  green: 'bg-green-600 hover:bg-green-700',
                  purple: 'bg-purple-600 hover:bg-purple-700',
                };
                
                return (
                  <motion.article
                    key={spaceKey}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -10 }}
                    className="group bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-soft border border-gray-100 overflow-hidden flex flex-col hover:shadow-2xl transition-all duration-500"
                  >
                    <div className="relative overflow-hidden">
                      {/* Galerie d'images */}
                      <div className="relative h-48 bg-gray-200">
                        <img
                          src={space.imageUrl || `/${spaceKey.replace('-', '_')}.jpg`}
                          alt={space.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          loading="lazy"
                          decoding="async"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            // Fallback vers une image par défaut si l'image spécifique n'existe pas
                            target.src = 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop';
                          }}
                        />
                        
                        {/* Overlay gradient moderne */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent" />
                        
                        {/* Badge de type d'espace */}
                        <div className="absolute top-6 left-6">
                          <div className={`px-4 py-2 rounded-full text-sm font-semibold text-white ${
                            color === 'blue' ? 'bg-gradient-to-r from-nzoo-dark to-nzoo-dark' :
                            color === 'green' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                            'bg-gradient-to-r from-purple-500 to-pink-500'
                          }`}>
                            {getSpaceType(spaceKey)}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-8 flex flex-col flex-grow">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-2xl font-bold text-gray-800 font-montserrat">
                          {space.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
                            color === 'blue' ? 'bg-gradient-to-br from-nzoo-dark to-nzoo-dark' :
                            color === 'green' ? 'bg-gradient-to-br from-green-500 to-emerald-500' :
                            'bg-gradient-to-br from-purple-500 to-pink-500'
                          }`}>
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mb-6 flex-grow font-poppins leading-relaxed text-lg">
                        {space.description}
                      </p>
                      
                      {/* Features */}
                      <div className="mb-8">
                        <h4 className="font-semibold text-gray-800 mb-4 font-montserrat text-lg">
                          Équipements inclus :
                        </h4>
                        <ul className="space-y-3">
                          {space.features.slice(0, 3).map((feature, idx) => (
                            <li key={idx} className="text-gray-600 flex items-center font-poppins group">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-4 shadow-sm group-hover:shadow-md transition-all duration-300 ${
                                idx === 0 ? 'bg-gradient-to-br from-green-500 to-emerald-500' :
                                idx === 1 ? 'bg-gradient-to-br from-nzoo-dark to-nzoo-dark' :
                                'bg-gradient-to-br from-purple-500 to-pink-500'
                              }`}>
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              </div>
                              <span className="group-hover:text-gray-800 transition-colors duration-300">{feature}</span>
                            </li>
                          ))}
                          {space.features.length > 3 && (
                            <li className="text-gray-500 italic font-poppins flex items-center">
                              <div className="w-6 h-6 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center mr-4">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              </div>
                              <span>+{space.features.length - 3} autres...</span>
                            </li>
                          )}
                        </ul>
                      </div>
                      
                      {/* Price and Capacity */}
                      <div className={`rounded-2xl p-6 border mb-8 ${
                        color === 'blue' ? 'bg-gradient-to-r from-nzoo-dark/10 to-nzoo-dark/5 border-nzoo-dark/20' :
                        color === 'green' ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' :
                        'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200'
                      }`}>
                        <div className="flex justify-between items-center">
                          <div>
                            <span className={`text-2xl font-bold font-montserrat ${
                              color === 'blue' ? 'text-nzoo-dark' :
                              color === 'green' ? 'text-green-600' :
                              'text-purple-600'
                            }`}>{price}</span>
                            <div className={`text-sm font-medium ${
                              color === 'blue' ? 'text-nzoo-dark' :
                              color === 'green' ? 'text-green-600' :
                              'text-purple-600'
                            }`}>{capacity}</div>
                          </div>
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
                            color === 'blue' ? 'bg-gradient-to-br from-nzoo-dark to-nzoo-dark' :
                            color === 'green' ? 'bg-gradient-to-br from-green-500 to-emerald-500' :
                            'bg-gradient-to-br from-purple-500 to-pink-500'
                          }`}>
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Book Button */}
                      <Link
                        to={link}
                        className={`group block text-white text-center py-4 rounded-2xl transition-all duration-500 font-bold text-lg hover:shadow-2xl transform hover:scale-105 ${
                          color === 'blue' ? 'bg-gradient-to-r from-nzoo-dark to-nzoo-dark hover:from-nzoo-dark/90 hover:to-nzoo-dark/90' :
                          color === 'green' ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600' :
                          'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                        }`}
                      >
                        <span className="flex items-center justify-center space-x-3">
                          <span>{t.bookButton}</span>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin group-hover:border-white group-hover:border-t-transparent"></div>
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
                <div className="w-2 h-2 bg-green-400 rounded-full mr-3 animate-pulse"></div>
                <span className="text-white/90 font-semibold">Prêt à commencer ?</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 font-montserrat leading-tight">
                Prêt à réserver votre espace ?
              </h2>
              
              <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-4xl mx-auto leading-relaxed font-poppins">
                Choisissez l'espace qui correspond le mieux à vos besoins et réservez en quelques clics.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Link
                  to="/reservation/coworking"
                  className="group bg-gradient-to-r from-white to-gray-100 text-nzoo-dark hover:from-gray-100 hover:to-white py-5 px-12 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-105 font-bold text-xl font-montserrat border-2 border-white/20 backdrop-blur-sm"
                >
                  <span className="flex items-center justify-center space-x-3">
                    <span>Commencer ma réservation</span>
                    <div className="w-5 h-5 border-2 border-nzoo-dark border-t-transparent rounded-full animate-spin group-hover:border-white group-hover:border-t-transparent"></div>
                  </span>
                </Link>
                
                <Link
                  to="/"
                  className="group border-3 border-white/80 text-white hover:bg-white/10 py-5 px-12 rounded-3xl transition-all duration-500 font-bold text-xl font-montserrat backdrop-blur-sm hover:border-white hover:scale-105"
                >
                  <span className="flex items-center justify-center space-x-3">
                    <span>Retour à l'accueil</span>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin group-hover:border-nzoo-dark group-hover:border-t-transparent"></div>
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