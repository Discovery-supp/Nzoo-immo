import { SpaceInfo } from '../data/spacesData';
import { SpaceDatabaseService } from './spaceDatabaseService';

const STORAGE_KEY = 'nzoo_spaces_content';

export interface SpaceContentData {
  [key: string]: SpaceInfo & {
    lastModified?: string;
  };
}

export class SpaceContentService {
  // Récupérer les données sauvegardées (priorité à la base de données)
  static async getSavedContent(language: 'fr' | 'en' = 'fr'): Promise<SpaceContentData | null> {
    try {
      // 1. Essayer de charger depuis la base de données en premier
      const dbData = await SpaceDatabaseService.loadFromDatabase(language);
      if (dbData) {
        console.log('✅ Données chargées depuis la base de données');
        return dbData;
      }

      // 2. Fallback vers le localStorage
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        console.log('✅ Données chargées depuis le localStorage');
        return parsedData;
      }

      return null;
    } catch (error) {
      console.error('❌ Erreur lors du chargement des données:', error);
      return null;
    }
  }

  // Sauvegarder les données (double sauvegarde)
  static async saveContent(data: SpaceContentData, language: 'fr' | 'en' = 'fr'): Promise<void> {
    try {
      // Ajouter la date de modification
      const dataWithTimestamp = Object.keys(data).reduce((acc, key) => {
        acc[key] = {
          ...data[key],
          lastModified: new Date().toISOString()
        };
        return acc;
      }, {} as SpaceContentData);

      // 1. Sauvegarder dans le localStorage (immédiat)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataWithTimestamp));
      console.log('✅ Données des espaces sauvegardées dans le localStorage');

      // 2. Sauvegarder en base de données (en arrière-plan)
      try {
        await SpaceDatabaseService.saveSilently(data, language);
        console.log('✅ Données des espaces sauvegardées en base de données');
      } catch (dbError) {
        console.warn('⚠️ Sauvegarde en base de données échouée (localStorage conservé):', dbError);
      }

    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde:', error);
      throw error;
    }
  }

  // Vérifier s'il y a des modifications sauvegardées
  static hasSavedContent(): boolean {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      return storedData !== null;
    } catch (error) {
      console.error('❌ Erreur lors de la vérification des données sauvegardées:', error);
      return false;
    }
  }

  // Obtenir la date de dernière modification
  static getLastModified(): string | null {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        // Trouver la date de modification la plus récente
        const dates = Object.values(parsedData)
          .map((space: any) => space.lastModified)
          .filter(Boolean);
        
        if (dates.length > 0) {
          return new Date(Math.max(...dates.map(d => new Date(d).getTime()))).toISOString();
        }
      }
      return null;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de la date de modification:', error);
      return null;
    }
  }

  // Réinitialiser le contenu
  static resetContent(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
      console.log('✅ Contenu réinitialisé');
    } catch (error) {
      console.error('❌ Erreur lors de la réinitialisation:', error);
    }
  }

  // Supprimer un espace spécifique
  static async deleteSpace(spaceKey: string, language: 'fr' | 'en' = 'fr'): Promise<void> {
    try {
      console.log(`🗑️ Suppression de l'espace ${spaceKey}...`);
      
      // 1. Supprimer de la base de données
      await SpaceDatabaseService.deleteSpace(spaceKey, language);
      
      // 2. Supprimer du localStorage
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        delete parsedData[spaceKey];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsedData));
        console.log(`✅ Espace ${spaceKey} supprimé du localStorage`);
      }
      
      console.log(`✅ Espace ${spaceKey} supprimé avec succès`);
    } catch (error) {
      console.error(`❌ Erreur lors de la suppression de l'espace ${spaceKey}:`, error);
      throw error;
    }
  }

  // Fusionner avec les données par défaut
  static async mergeWithDefault(defaultData: Record<string, SpaceInfo>, language: 'fr' | 'en' = 'fr'): Promise<Record<string, SpaceInfo>> {
    try {
      const savedData = await this.getSavedContent(language);
      
      if (!savedData) {
        return defaultData;
      }

      // Fusionner les données sauvegardées avec les données par défaut
      const mergedData = { ...defaultData };
      
      Object.entries(savedData).forEach(([key, space]) => {
        mergedData[key] = {
          ...space,
          // S'assurer que toutes les propriétés requises sont présentes
          dailyPrice: space.dailyPrice || 0,
          monthlyPrice: space.monthlyPrice || 0,
          yearlyPrice: space.yearlyPrice || 0,
          hourlyPrice: space.hourlyPrice || 0,
          maxOccupants: space.maxOccupants || 1,
          features: space.features || [],
          isAvailable: space.isAvailable !== undefined ? space.isAvailable : true
        };
      });

      return mergedData;
    } catch (error) {
      console.error('❌ Erreur lors de la fusion des données:', error);
      return defaultData;
    }
  }

  // Synchroniser avec la base de données
  static async syncWithDatabase(language: 'fr' | 'en'): Promise<void> {
    try {
      console.log('🔄 Synchronisation avec la base de données...');
      
      // Vérifier la santé de la base de données
      const isHealthy = await SpaceDatabaseService.checkDatabaseHealth();
      if (!isHealthy) {
        console.warn('⚠️ Base de données non disponible, synchronisation ignorée');
        return;
      }

      // Charger les données locales
      const localData = localStorage.getItem(STORAGE_KEY);
      if (localData) {
        const parsedData = JSON.parse(localData);
        await SpaceDatabaseService.saveSilently(parsedData, language);
        console.log('✅ Synchronisation avec la base de données terminée');
      }
    } catch (error) {
      console.error('❌ Erreur lors de la synchronisation:', error);
    }
  }

  // Vérifier la cohérence des données
  static async validateData(language: 'fr' | 'en'): Promise<boolean> {
    try {
      const localData = localStorage.getItem(STORAGE_KEY);
      const dbData = await SpaceDatabaseService.loadFromDatabase(language);

      if (!localData && !dbData) {
        return true; // Aucune donnée = cohérent
      }

      if (localData && !dbData) {
        console.warn('⚠️ Données locales sans correspondance en base de données');
        return false;
      }

      if (!localData && dbData) {
        console.warn('⚠️ Données en base sans correspondance locale');
        return false;
      }

      // Comparer les données (simplifié)
      const localKeys = Object.keys(JSON.parse(localData));
      const dbKeys = Object.keys(dbData || {});
      
      const isConsistent = localKeys.length === dbKeys.length;
      
      if (!isConsistent) {
        console.warn('⚠️ Incohérence détectée entre données locales et base de données');
      }

      return isConsistent;
    } catch (error) {
      console.error('❌ Erreur lors de la validation des données:', error);
      return false;
    }
  }
}
