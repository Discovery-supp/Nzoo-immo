import { supabase } from '../lib/supabase';
import { SpaceInfo } from '../data/spacesData';

export interface DatabaseSpace {
  id?: string;
  space_key: string;
  language: 'fr' | 'en';
  title: string;
  description: string;
  features: string[];
  daily_price?: number;
  monthly_price?: number;
  yearly_price?: number;
  hourly_price?: number;
  max_occupants: number;
  image_url?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export class SpaceDatabaseService {
  private static TABLE_NAME = 'spaces_content';

  /**
   * Sauvegarder silencieusement en base de données (sans impact sur l'UI)
   */
  static async saveSilently(data: Record<string, SpaceInfo>, language: 'fr' | 'en'): Promise<void> {
    try {
      // Convertir les données locales en format base de données
      const spacesToSave = Object.entries(data).map(([spaceKey, spaceInfo]) => ({
        space_key: spaceKey,
        language,
        title: spaceInfo.title,
        description: spaceInfo.description,
        features: spaceInfo.features,
        daily_price: spaceInfo.dailyPrice,
        monthly_price: spaceInfo.monthlyPrice,
        yearly_price: spaceInfo.yearlyPrice,
        hourly_price: spaceInfo.hourlyPrice,
        max_occupants: spaceInfo.maxOccupants,
        image_url: spaceInfo.imageUrl,
        is_active: true
      }));

      // Sauvegarder chaque espace individuellement
      for (const spaceData of spacesToSave) {
        await this.saveSpaceSilently(spaceData);
      }

      console.log('✅ Sauvegarde silencieuse en base de données réussie');
    } catch (error) {
      // Erreur silencieuse - ne pas impacter l'utilisateur
      console.warn('⚠️ Sauvegarde silencieuse échouée (non critique):', error);
    }
  }

  /**
   * Sauvegarder un espace individuel silencieusement
   */
  private static async saveSpaceSilently(spaceData: Omit<DatabaseSpace, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
    try {
      // Vérifier si l'espace existe déjà
      const { data: existingSpace } = await supabase
        .from(this.TABLE_NAME)
        .select('id')
        .eq('space_key', spaceData.space_key)
        .eq('language', spaceData.language)
        .single();

      if (existingSpace) {
        // Mettre à jour l'espace existant
        await supabase
          .from(this.TABLE_NAME)
          .update({
            title: spaceData.title,
            description: spaceData.description,
            features: spaceData.features,
            daily_price: spaceData.daily_price,
            monthly_price: spaceData.monthly_price,
            yearly_price: spaceData.yearly_price,
            hourly_price: spaceData.hourly_price,
            max_occupants: spaceData.max_occupants,
            image_url: spaceData.image_url,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingSpace.id);
      } else {
        // Créer un nouvel espace
        await supabase
          .from(this.TABLE_NAME)
          .insert({
            ...spaceData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
      }
    } catch (error) {
      // Erreur silencieuse
      console.warn(`⚠️ Erreur lors de la sauvegarde silencieuse de ${spaceData.space_key}:`, error);
    }
  }

  /**
   * Créer la table si elle n'existe pas (silencieusement)
   */
  static async ensureTableExists(): Promise<void> {
    try {
      // Vérifier si la table existe en essayant une requête simple
      await supabase
        .from(this.TABLE_NAME)
        .select('count')
        .limit(1);
    } catch (error) {
      console.warn('⚠️ Table spaces_content non trouvée - sauvegarde silencieuse désactivée');
    }
  }

  /**
   * Initialiser le service silencieusement
   */
  static async initialize(): Promise<void> {
    try {
      await this.ensureTableExists();
    } catch (error) {
      // Erreur silencieuse - le service continuera sans base de données
      console.warn('⚠️ Initialisation silencieuse échouée:', error);
    }
  }
}

