import { supabase } from '../lib/supabase';

export class ImageUploadService {
  private static BUCKET_NAME = 'space-images';

  /**
   * Upload une image vers Supabase Storage
   */
  static async uploadImage(file: File, spaceKey: string): Promise<string | null> {
    try {
      // Créer un nom de fichier unique
      const fileExt = file.name.split('.').pop();
      const fileName = `${spaceKey}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      console.log('🔄 Upload en cours...', fileName);

      // Upload vers Supabase Storage
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('❌ Erreur lors de l\'upload:', error);
        
        // Si c'est une erreur de bucket inexistant, essayer de le créer
        if (error.message.includes('bucket') || error.message.includes('not found')) {
          console.log('🔄 Tentative de création du bucket...');
          const bucketCreated = await this.ensureBucketExists();
          if (bucketCreated) {
            // Réessayer l'upload
            const { data: retryData, error: retryError } = await supabase.storage
              .from(this.BUCKET_NAME)
              .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
              });
            
            if (retryError) {
              console.error('❌ Erreur lors de la nouvelle tentative:', retryError);
              return null;
            }
          } else {
            return null;
          }
        } else {
          return null;
        }
      }

      // Obtenir l'URL publique
      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(filePath);

      console.log('✅ Image uploadée avec succès:', urlData.publicUrl);
      return urlData.publicUrl;

    } catch (error) {
      console.error('❌ Erreur lors de l\'upload d\'image:', error);
      return null;
    }
  }

  /**
   * Supprimer une image de Supabase Storage
   */
  static async deleteImage(imageUrl: string): Promise<boolean> {
    try {
      // Extraire le nom du fichier de l'URL
      const fileName = imageUrl.split('/').pop();
      if (!fileName) return false;

      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([fileName]);

      if (error) {
        console.error('Erreur lors de la suppression:', error);
        return false;
      }

      console.log('✅ Image supprimée avec succès');
      return true;

    } catch (error) {
      console.error('Erreur lors de la suppression d\'image:', error);
      return false;
    }
  }

  /**
   * Vérifier si le bucket existe, sinon le créer
   */
  static async ensureBucketExists(): Promise<boolean> {
    try {
      // Vérifier si le bucket existe
      const { data: buckets, error } = await supabase.storage.listBuckets();
      
      if (error) {
        console.error('Erreur lors de la vérification des buckets:', error);
        return false;
      }

      const bucketExists = buckets.some(bucket => bucket.name === this.BUCKET_NAME);
      
      if (!bucketExists) {
        // Créer le bucket
        const { error: createError } = await supabase.storage.createBucket(this.BUCKET_NAME, {
          public: true,
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
          fileSizeLimit: 5242880 // 5MB
        });

        if (createError) {
          console.error('Erreur lors de la création du bucket:', createError);
          return false;
        }

        console.log('✅ Bucket créé avec succès');
      }

      return true;

    } catch (error) {
      console.error('Erreur lors de la vérification du bucket:', error);
      return false;
    }
  }

  /**
   * Convertir une image en base64 (fallback si l'upload échoue)
   */
  static async imageToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Valider un fichier image
   */
  static validateImageFile(file: File): { valid: boolean; error?: string } {
    // Vérifier le type de fichier
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return { 
        valid: false, 
        error: 'Type de fichier non supporté. Utilisez JPEG, PNG, WebP ou GIF.' 
      };
    }

    // Vérifier la taille (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return { 
        valid: false, 
        error: 'Fichier trop volumineux. Taille maximum : 5MB.' 
      };
    }

    return { valid: true };
  }
}
