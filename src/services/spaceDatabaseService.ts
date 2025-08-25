import { supabase } from './supabaseClient';
import { SpaceInfo } from '../data/spacesData';

export interface DatabaseSpace {
  id?: string;
  space_key: string;
  language: 'fr' | 'en';
  title: string;
  description: string;
  features: string[];
  daily_price: number;
  monthly_price: number;
  yearly_price: number;
  hourly_price: number;
  max_occupants: number;
  image_url?: string;
  is_available?: boolean;
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
      console.log('🔄 Début de la sauvegarde silencieuse en base de données...');
      
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
        is_available: spaceInfo.isAvailable !== false,
        updated_at: new Date().toISOString()
      }));

      // Sauvegarder chaque espace individuellement avec retry
      for (const spaceData of spacesToSave) {
        await this.saveSpaceSilently(spaceData);
      }

      console.log('✅ Sauvegarde silencieuse en base de données réussie pour', spacesToSave.length, 'espaces');
    } catch (error) {
      // Erreur silencieuse - ne pas impacter l'utilisateur
      console.warn('⚠️ Sauvegarde silencieuse échouée (non critique):', error);
    }
  }

  /**
   * Sauvegarder un espace individuel silencieusement avec retry
   */
  private static async saveSpaceSilently(spaceData: Omit<DatabaseSpace, 'id' | 'created_at'>): Promise<void> {
    const maxRetries = 3;
    let retryCount = 0;

    while (retryCount < maxRetries) {
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
          const { error: updateError } = await supabase
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
              is_available: spaceData.is_available,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingSpace.id);

          if (updateError) throw updateError;
          console.log(`✅ Espace ${spaceData.space_key} mis à jour en base de données`);
        } else {
          // Créer un nouvel espace
          const { error: insertError } = await supabase
            .from(this.TABLE_NAME)
            .insert({
              ...spaceData,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (insertError) throw insertError;
          console.log(`✅ Nouvel espace ${spaceData.space_key} créé en base de données`);
        }

        // Succès - sortir de la boucle de retry
        break;

      } catch (error) {
        retryCount++;
        console.warn(`⚠️ Tentative ${retryCount}/${maxRetries} échouée pour ${spaceData.space_key}:`, error);
        
        if (retryCount >= maxRetries) {
          console.error(`❌ Échec définitif de sauvegarde pour ${spaceData.space_key} après ${maxRetries} tentatives`);
          throw error;
        }
        
        // Attendre avant de réessayer (backoff exponentiel)
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount - 1)));
      }
    }
  }

  /**
   * Charger les données depuis la base de données
   */
  static async loadFromDatabase(language: 'fr' | 'en'): Promise<Record<string, SpaceInfo> | null> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .eq('language', language)
        .eq('is_active', true);

      if (error) {
        console.error('❌ Erreur lors du chargement depuis la base de données:', error);
        return null;
      }

      if (!data || data.length === 0) {
        console.log('ℹ️ Aucune donnée trouvée en base de données');
        return null;
      }

      // Convertir les données de la base vers le format local
      const convertedData = data.reduce((acc, dbSpace) => {
        acc[dbSpace.space_key] = {
          title: dbSpace.title,
          description: dbSpace.description,
          features: dbSpace.features,
          dailyPrice: dbSpace.daily_price,
          monthlyPrice: dbSpace.monthly_price,
          yearlyPrice: dbSpace.yearly_price,
          hourlyPrice: dbSpace.hourly_price,
          maxOccupants: dbSpace.max_occupants,
          imageUrl: dbSpace.image_url,
          isAvailable: dbSpace.is_available !== false,
          lastModified: dbSpace.updated_at
        };
        return acc;
      }, {} as Record<string, SpaceInfo>);

      console.log('✅ Données chargées depuis la base de données:', Object.keys(convertedData).length, 'espaces');
      return convertedData;

    } catch (error) {
      console.error('❌ Erreur inattendue lors du chargement:', error);
      return null;
    }
  }

  /**
   * Créer la table si elle n'existe pas (silencieusement)
   */
  static async ensureTableExists(): Promise<void> {
    try {
      // Vérifier si la table existe en essayant une requête simple
      const { error } = await supabase
        .from(this.TABLE_NAME)
        .select('id')
        .limit(1);

      if (error && error.code === '42P01') {
        // Table n'existe pas - la créer
        console.log('🔄 Table spaces_content non trouvée, création en cours...');
        
        // Note: La création de table doit être faite via les migrations Supabase
        // Cette fonction sert juste à vérifier l'existence
        console.warn('⚠️ La table spaces_content doit être créée via les migrations Supabase');
      } else if (error) {
        console.warn('⚠️ Erreur lors de la vérification de la table:', error);
      } else {
        console.log('✅ Table spaces_content existe et est accessible');
      }
    } catch (error) {
      console.warn('⚠️ Erreur lors de la vérification de la table:', error);
    }
  }

  /**
   * Vérifier la santé de la base de données
   */
  static async checkDatabaseHealth(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('count')
        .limit(1);

      if (error) {
        console.error('❌ Problème de santé de la base de données:', error);
        return false;
      }

      console.log('✅ Base de données en bonne santé');
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de la vérification de santé:', error);
      return false;
    }
  }

  /**
   * Supprimer un espace de la base de données
   */
  static async deleteSpace(spaceKey: string, language: 'fr' | 'en'): Promise<void> {
    try {
      console.log(`🗑️ Suppression de l'espace ${spaceKey} de la base de données...`);
      console.log(`🗑️ Langue: ${language}`);
      
      // Vérifier la connexion Supabase
      const { data: testData, error: testError } = await supabase
        .from(this.TABLE_NAME)
        .select('id')
        .limit(1);
      
      if (testError) {
        console.error('❌ Problème de connexion à la base de données:', testError);
        throw new Error(`Connexion à la base de données échouée: ${testError.message}`);
      }
      
      // Effectuer la suppression
      const { error } = await supabase
        .from(this.TABLE_NAME)
        .delete()
        .eq('space_key', spaceKey)
        .eq('language', language);

      if (error) {
        console.error(`❌ Erreur lors de la suppression de l'espace ${spaceKey}:`, error);
        throw new Error(`Erreur de suppression: ${error.message}`);
      } else {
        console.log(`✅ Espace ${spaceKey} supprimé de la base de données`);
      }
    } catch (error) {
      console.error(`❌ Erreur lors de la suppression de l'espace ${spaceKey}:`, error);
      throw error; // Propager l'erreur pour la gestion en amont
    }
  }

  /**
   * Supprimer plusieurs espaces de la base de données
   */
  static async deleteSpaces(spaceKeys: string[], language: 'fr' | 'en'): Promise<void> {
    try {
      console.log(`🗑️ Suppression de ${spaceKeys.length} espaces de la base de données...`);
      
      for (const spaceKey of spaceKeys) {
        await this.deleteSpace(spaceKey, language);
      }
      
      console.log(`✅ Suppression terminée pour ${spaceKeys.length} espaces`);
    } catch (error) {
      console.warn('⚠️ Erreur lors de la suppression des espaces:', error);
      // Ne pas faire échouer la suppression locale
    }
  }
}
