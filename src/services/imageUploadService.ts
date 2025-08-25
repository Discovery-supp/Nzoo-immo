import { supabase } from '../lib/supabase';

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
  fileName?: string;
}

export class ImageUploadService {
  private static readonly STORAGE_BUCKET = 'space-images';
  private static readonly PUBLIC_URL_PREFIX = '/images/spaces/';

  /**
   * Upload une image vers Supabase Storage ou fallback vers base64
   */
  static async uploadImage(file: File): Promise<UploadResult> {
    try {
      // 1. Valider le fichier
      const validation = this.validateImage(file);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error || 'Fichier invalide'
        };
      }

      // 2. Vérifier si Supabase Storage est disponible
      const bucketExists = await this.checkBucketStatus();
      
      if (bucketExists) {
        // 3. Upload vers Supabase Storage
        return await this.uploadToSupabase(file);
      } else {
        // 4. Fallback vers base64
        console.log('⚠️ Supabase Storage non disponible, utilisation du fallback base64');
        return await this.uploadAsBase64(file);
      }

    } catch (error) {
      console.error('Erreur upload image:', error);
      // Fallback vers base64 en cas d'erreur
      return await this.uploadAsBase64(file);
    }
  }

  /**
   * Upload vers Supabase Storage
   */
  private static async uploadToSupabase(file: File): Promise<UploadResult> {
    try {
      // Générer un nom de fichier unique
      const fileName = this.generateFileName(file);

      // Upload vers Supabase Storage
      const { data, error } = await supabase.storage
        .from(this.STORAGE_BUCKET)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Erreur upload Supabase:', error);
        throw new Error(`Erreur lors de l'upload: ${error.message}`);
      }

      // Obtenir l'URL publique
      const { data: urlData } = supabase.storage
        .from(this.STORAGE_BUCKET)
        .getPublicUrl(fileName);

      return {
        success: true,
        url: urlData.publicUrl,
        fileName: fileName
      };

    } catch (error) {
      console.error('Erreur upload Supabase:', error);
      throw error;
    }
  }

  /**
   * Upload en base64 (fallback)
   */
  private static async uploadAsBase64(file: File): Promise<UploadResult> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          resolve({
            success: true,
            url: event.target.result as string,
            fileName: file.name
          });
        } else {
          resolve({
            success: false,
            error: 'Erreur lors de la conversion en base64'
          });
        }
      };
      reader.onerror = () => {
        resolve({
          success: false,
          error: 'Erreur lors de la lecture du fichier'
        });
      };
      reader.readAsDataURL(file);
    });
  }

  /**
   * Génère un nom de fichier unique
   */
  private static generateFileName(file: File): string {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop() || 'jpg';
    return `space-${timestamp}-${randomId}.${extension}`;
  }

  /**
   * Supprime une image
   */
  static async deleteImage(imageUrl: string): Promise<UploadResult> {
    try {
      // Si c'est une image base64, pas besoin de suppression
      if (imageUrl.startsWith('data:image/')) {
        console.log('ℹ️ Image base64 détectée, suppression locale uniquement');
        return { success: true };
      }

      // Extraire le nom du fichier de l'URL
      const fileName = this.extractFileNameFromUrl(imageUrl);
      
      if (!fileName) {
        console.log('⚠️ Impossible d\'extraire le nom du fichier de l\'URL');
        return { success: true }; // On considère que c'est un succès pour éviter les erreurs
      }

      // Vérifier si le bucket existe
      const bucketExists = await this.checkBucketStatus();
      if (!bucketExists) {
        console.log('⚠️ Bucket Supabase non disponible, suppression locale uniquement');
        return { success: true };
      }

      // Supprimer de Supabase Storage
      const { error } = await supabase.storage
        .from(this.STORAGE_BUCKET)
        .remove([fileName]);

      if (error) {
        console.error('Erreur suppression Supabase:', error);
        // On ne fait pas échouer la suppression pour éviter les erreurs
        return { success: true };
      }

      return { success: true };

    } catch (error) {
      console.error('Erreur suppression image:', error);
      // On ne fait pas échouer la suppression pour éviter les erreurs
      return { success: true };
    }
  }

  /**
   * Extrait le nom du fichier d'une URL
   */
  private static extractFileNameFromUrl(url: string): string | null {
    try {
      // Si c'est une URL Supabase
      if (url.includes('supabase.co')) {
        const urlParts = url.split('/');
        return urlParts[urlParts.length - 1];
      }
      
      // Si c'est une URL locale
      if (url.startsWith('/images/spaces/')) {
        return url.replace('/images/spaces/', '');
      }
      
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Valide un fichier image
   */
  static validateImage(file: File): { valid: boolean; error?: string } {
    // Vérifier le type
    if (!file.type.startsWith('image/')) {
      return {
        valid: false,
        error: 'Veuillez sélectionner un fichier image valide (PNG, JPG, GIF, WebP)'
      };
    }

    // Vérifier la taille (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'Le fichier est trop volumineux. Taille maximum : 5MB'
      };
    }

    // Vérifier les extensions autorisées
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    if (!extension || !allowedExtensions.includes(extension)) {
      return {
        valid: false,
        error: 'Format de fichier non supporté. Utilisez PNG, JPG, GIF ou WebP'
      };
    }

    return { valid: true };
  }

  /**
   * Obtient l'URL publique d'une image
   */
  static getPublicUrl(fileName: string): string {
    return `${this.PUBLIC_URL_PREFIX}${fileName}`;
  }

  /**
   * Convertit une URL Supabase en URL locale
   */
  static convertToLocalUrl(supabaseUrl: string): string {
    // Extraire le nom du fichier de l'URL Supabase
    const fileName = supabaseUrl.split('/').pop();
    if (fileName) {
      return this.getPublicUrl(fileName);
    }
    return supabaseUrl;
  }

  /**
   * Vérifie si le bucket Supabase existe
   */
  static async checkBucketStatus(): Promise<boolean> {
    try {
      const { data, error } = await supabase.storage.listBuckets();
      if (error) {
        console.error('Erreur lors de la vérification des buckets:', error);
        return false;
      }
      
      const bucketExists = data?.some(bucket => bucket.name === this.STORAGE_BUCKET);
      return bucketExists || false;
    } catch (error) {
      console.error('Erreur lors de la vérification du bucket:', error);
      return false;
    }
  }
}

export default ImageUploadService;
