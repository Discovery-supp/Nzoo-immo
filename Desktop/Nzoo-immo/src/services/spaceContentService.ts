import { SpaceInfo } from '../data/spacesData';
import { SpaceDatabaseService } from './spaceDatabaseService';

const STORAGE_KEY = 'nzoo_immo_space_content';

export interface SpaceContentData {
  [key: string]: SpaceInfo & {
    imageUrl?: string;
    lastModified?: string;
  };
}

export class SpaceContentService {
  // Récupérer les données sauvegardées
  static getSavedContent(): SpaceContentData | null {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
      return null;
    }
  }

  // Sauvegarder les données
  static saveContent(data: SpaceContentData, language: 'fr' | 'en' = 'fr'): void {
    try {
      // Ajouter la date de modification
      const dataWithTimestamp = Object.keys(data).reduce((acc, key) => {
        acc[key] = {
          ...data[key],
          lastModified: new Date().toISOString()
        };
        return acc;
      }, {} as SpaceContentData);

      // Sauvegarder dans le localStorage (comme avant)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataWithTimestamp));
      console.log('✅ Données des espaces sauvegardées dans le localStorage');

      // Sauvegarder silencieusement en base de données (en arrière-plan)
      SpaceDatabaseService.saveSilently(data, language).catch(error => {
        // Erreur silencieuse - ne pas impacter l'utilisateur
        console.warn('⚠️ Sauvegarde silencieuse échouée (non critique):', error);
      });
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde:', error);
    }
  }

  // Fusionner les données sauvegardées avec les données par défaut
  static mergeWithDefault(defaultData: { [key: string]: SpaceInfo }, language: 'fr' | 'en'): { [key: string]: SpaceInfo } {
    const savedData = this.getSavedContent();
    
    if (!savedData) {
      return defaultData;
    }

    // Fusionner les données sauvegardées avec les données par défaut
    const mergedData = { ...defaultData };
    
    Object.keys(savedData).forEach(key => {
      if (mergedData[key]) {
        // Espace existant - fusionner avec les données par défaut
        mergedData[key] = {
          ...mergedData[key],
          ...savedData[key],
          // Conserver les propriétés par défaut si elles ne sont pas dans les données sauvegardées
          features: savedData[key].features || mergedData[key].features,
          dailyPrice: savedData[key].dailyPrice ?? mergedData[key].dailyPrice,
          monthlyPrice: savedData[key].monthlyPrice ?? mergedData[key].monthlyPrice,
          yearlyPrice: savedData[key].yearlyPrice ?? mergedData[key].yearlyPrice,
          hourlyPrice: savedData[key].hourlyPrice ?? mergedData[key].hourlyPrice,
          maxOccupants: savedData[key].maxOccupants ?? mergedData[key].maxOccupants,
        };
      } else {
        // Nouvel espace ajouté - l'ajouter directement
        mergedData[key] = {
          title: savedData[key].title,
          description: savedData[key].description,
          features: savedData[key].features,
          dailyPrice: savedData[key].dailyPrice,
          monthlyPrice: savedData[key].monthlyPrice,
          yearlyPrice: savedData[key].yearlyPrice,
          hourlyPrice: savedData[key].hourlyPrice,
          maxOccupants: savedData[key].maxOccupants,
        };
      }
    });

    return mergedData;
  }

  // Vérifier s'il y a des données sauvegardées
  static hasSavedContent(): boolean {
    return this.getSavedContent() !== null;
  }

  // Obtenir la date de dernière modification
  static getLastModified(): string | null {
    const savedData = this.getSavedContent();
    if (!savedData) return null;

    const dates = Object.values(savedData)
      .map(space => space.lastModified)
      .filter(Boolean)
      .sort()
      .reverse();

    return dates[0] || null;
  }

  // Réinitialiser les données (supprimer les modifications)
  static resetContent(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
      console.log('✅ Données des espaces réinitialisées');
    } catch (error) {
      console.error('❌ Erreur lors de la réinitialisation:', error);
    }
  }
}
