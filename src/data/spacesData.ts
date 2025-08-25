import { SpaceContentService } from '../services/spaceContentService';

export interface SpaceInfo {
  title: string;
  description: string;
  features: string[];
  dailyPrice: number;
  monthlyPrice: number;
  yearlyPrice: number;
  hourlyPrice: number;
  maxOccupants: number;
  imageUrl?: string;
  lastModified?: string;
  isAvailable?: boolean;
}

// Données par défaut des espaces
const defaultSpaces: Record<string, Record<'fr' | 'en', SpaceInfo>> = {
  coworking: {
    fr: {
      title: 'Espace de Coworking',
      description: 'Un espace de travail collaboratif moderne avec toutes les commodités nécessaires pour votre productivité.',
      features: [
        'Wi-Fi haute vitesse',
        'Bureau ergonomique',
        'Chaise confortable',
        'Éclairage naturel',
        'Salle de réunion',
        'Café et thé gratuits',
        'Imprimante/scanner',
        'Casiers sécurisés'
      ],
      dailyPrice: 25,
      monthlyPrice: 450,
      yearlyPrice: 4800,
      hourlyPrice: 5,
      maxOccupants: 20,
      imageUrl: '/images/spaces/coworking.jpg',
      isAvailable: true,

    },
    en: {
      title: 'Coworking Space',
      description: 'A modern collaborative workspace with all the amenities you need for your productivity.',
      features: [
        'High-speed Wi-Fi',
        'Ergonomic desk',
        'Comfortable chair',
        'Natural lighting',
        'Meeting room',
        'Free coffee and tea',
        'Printer/scanner',
        'Secure lockers'
      ],
      dailyPrice: 25,
      monthlyPrice: 450,
      yearlyPrice: 4800,
      hourlyPrice: 5,
      maxOccupants: 20,
      imageUrl: '/images/spaces/coworking.jpg',
      isAvailable: true,

    }
  },
  'bureau-prive': {
    fr: {
      title: 'Bureau Privé',
      description: 'Un bureau privé et confortable pour votre équipe ou votre activité professionnelle.',
      features: [
        'Bureau privé fermé',
        'Wi-Fi dédié',
        'Mobilier de qualité',
        'Climatisation',
        'Sécurité 24/7',
        'Réception téléphonique',
        'Adresse postale',
        'Parking privé'
      ],
      dailyPrice: 50,
      monthlyPrice: 900,
      yearlyPrice: 9600,
      hourlyPrice: 10,
      maxOccupants: 4,
      imageUrl: '/images/spaces/bureau_prive.jpg',
      isAvailable: true,

    },
    en: {
      title: 'Private Office',
      description: 'A private and comfortable office for your team or professional activity.',
      features: [
        'Closed private office',
        'Dedicated Wi-Fi',
        'Quality furniture',
        'Air conditioning',
        '24/7 security',
        'Phone reception',
        'Postal address',
        'Private parking'
      ],
      dailyPrice: 50,
      monthlyPrice: 900,
      yearlyPrice: 9600,
      hourlyPrice: 10,
      maxOccupants: 4,
      imageUrl: '/images/spaces/bureau_prive.jpg',
      isAvailable: true,

    }
  },

  domiciliation: {
    fr: {
      title: 'Service de Domiciliation',
      description: 'Service complet de domiciliation d\'entreprise avec gestion administrative.',
      features: [
        'Adresse postale professionnelle',
        'Réception du courrier',
        'Numéro de téléphone',
        'Gestion administrative',
        'Support juridique',
        'Sécurité des données',
        'Accès aux bureaux',
        'Services sur mesure'
      ],
      dailyPrice: 0,
      monthlyPrice: 150,
      yearlyPrice: 1600,
      hourlyPrice: 0,
      maxOccupants: 1,
      imageUrl: '/images/spaces/domiciliation.jpg',
      isAvailable: true,

    },
    en: {
      title: 'Business Address Service',
      description: 'Complete business address service with administrative management.',
      features: [
        'Professional postal address',
        'Mail reception',
        'Phone number',
        'Administrative management',
        'Legal support',
        'Data security',
        'Office access',
        'Custom services'
      ],
      dailyPrice: 0,
      monthlyPrice: 150,
      yearlyPrice: 1600,
      hourlyPrice: 0,
      maxOccupants: 1,
      imageUrl: '/images/spaces/domiciliation.jpg',
      isAvailable: true,

    }
  },

};

// Obtenir les informations d'un espace spécifique
export const getSpaceInfo = async (spaceKey: string, language: 'fr' | 'en' = 'fr'): Promise<SpaceInfo> => {
  try {
    // Essayer de charger depuis le service (base de données + localStorage)
    const savedData = await SpaceContentService.getSavedContent(language);
    
    if (savedData && savedData[spaceKey]) {
      return savedData[spaceKey];
    }
    
    // Fallback vers les données par défaut
    return defaultSpaces[spaceKey]?.[language] || defaultSpaces[spaceKey]?.['fr'] || {
      title: 'Espace non trouvé',
      description: 'Cet espace n\'existe pas.',
      features: [],
      dailyPrice: 0,
      monthlyPrice: 0,
      yearlyPrice: 0,
      hourlyPrice: 0,
      maxOccupants: 0
    };
  } catch (error) {
    console.error('❌ Erreur lors du chargement de l\'espace:', error);
    // Fallback vers les données par défaut
    return defaultSpaces[spaceKey]?.[language] || defaultSpaces[spaceKey]?.['fr'] || {
      title: 'Espace non trouvé',
      description: 'Cet espace n\'existe pas.',
      features: [],
      dailyPrice: 0,
      monthlyPrice: 0,
      yearlyPrice: 0,
      hourlyPrice: 0,
      maxOccupants: 0
    };
  }
};

// Obtenir tous les espaces
export const getAllSpaces = async (language: 'fr' | 'en' = 'fr'): Promise<Record<string, SpaceInfo>> => {
  try {
    // Utiliser le service pour fusionner les données sauvegardées avec les données par défaut
    const mergedData = await SpaceContentService.mergeWithDefault(
      Object.keys(defaultSpaces).reduce((acc, key) => {
        acc[key] = defaultSpaces[key][language] || defaultSpaces[key]['fr'];
        return acc;
      }, {} as Record<string, SpaceInfo>),
      language
    );
    
    return mergedData;
  } catch (error) {
    console.error('❌ Erreur lors du chargement des espaces:', error);
    // Fallback vers les données par défaut
    return Object.keys(defaultSpaces).reduce((acc, key) => {
      acc[key] = defaultSpaces[key][language] || defaultSpaces[key]['fr'];
      return acc;
    }, {} as Record<string, SpaceInfo>);
  }
};

// Obtenir les données par défaut (sans sauvegarde)
export const getDefaultSpaces = (language: 'fr' | 'en' = 'fr'): Record<string, SpaceInfo> => {
  return Object.keys(defaultSpaces).reduce((acc, key) => {
    acc[key] = defaultSpaces[key][language] || defaultSpaces[key]['fr'];
    return acc;
  }, {} as Record<string, SpaceInfo>);
};