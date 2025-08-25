/**
 * Utilitaires pour la gestion des images d'espaces
 */

export class ImageUtils {
  private static readonly IMAGES_PATH = '/images/spaces/';
  private static readonly DEFAULT_IMAGE = '/images/default-space.jpg';

  /**
   * Obtient l'URL complète d'une image d'espace
   */
  static getSpaceImageUrl(imageUrl?: string): string {
    if (!imageUrl) {
      return this.DEFAULT_IMAGE;
    }

    // Si c'est déjà une URL complète, la retourner
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }

    // Si c'est un chemin relatif, ajouter le préfixe
    if (imageUrl.startsWith('/')) {
      return imageUrl;
    }

    // Sinon, construire le chemin complet
    return `${this.IMAGES_PATH}${imageUrl}`;
  }

  /**
   * Vérifie si une image existe
   */
  static async imageExists(imageUrl: string): Promise<boolean> {
    try {
      const response = await fetch(imageUrl, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Obtient une image par défaut si l'image principale n'existe pas
   */
  static async getImageWithFallback(imageUrl?: string): Promise<string> {
    if (!imageUrl) {
      return this.DEFAULT_IMAGE;
    }

    const fullUrl = this.getSpaceImageUrl(imageUrl);
    const exists = await this.imageExists(fullUrl);
    
    return exists ? fullUrl : this.DEFAULT_IMAGE;
  }

  /**
   * Génère un nom de fichier unique pour une image
   */
  static generateImageName(originalName: string, spaceKey: string): string {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const extension = originalName.split('.').pop() || 'jpg';
    return `space-${spaceKey}-${timestamp}-${randomId}.${extension}`;
  }

  /**
   * Extrait le nom du fichier d'une URL d'image
   */
  static extractFileName(imageUrl: string): string | null {
    if (!imageUrl) return null;
    
    // Extraire le nom du fichier de l'URL
    const parts = imageUrl.split('/');
    return parts[parts.length - 1] || null;
  }

  /**
   * Valide une URL d'image
   */
  static isValidImageUrl(url: string): boolean {
    if (!url) return false;
    
    // Vérifier si c'est une URL valide
    try {
      new URL(url, window.location.origin);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Obtient les dimensions d'une image
   */
  static getImageDimensions(imageUrl: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = () => {
        reject(new Error('Impossible de charger l\'image'));
      };
      img.src = imageUrl;
    });
  }

  /**
   * Optimise une URL d'image pour l'affichage
   */
  static optimizeImageUrl(imageUrl: string, options: {
    width?: number;
    height?: number;
    quality?: number;
  } = {}): string {
    // Pour l'instant, retourner l'URL telle quelle
    // En production, vous pourriez ajouter des paramètres d'optimisation
    return imageUrl;
  }

  /**
   * Obtient une liste d'images d'espace
   */
  static async getSpaceImages(spaceKey: string): Promise<string[]> {
    try {
      // En production, vous pourriez faire un appel API
      // pour récupérer toutes les images d'un espace
      const response = await fetch(`/api/spaces/${spaceKey}/images`);
      const images = await response.json();
      return images.map((img: any) => this.getSpaceImageUrl(img.url));
    } catch {
      return [];
    }
  }

  /**
   * Supprime une image d'espace
   */
  static async deleteSpaceImage(imageUrl: string): Promise<boolean> {
    try {
      const fileName = this.extractFileName(imageUrl);
      if (!fileName) return false;

      // Appel API pour supprimer l'image
      const response = await fetch(`/api/images/${fileName}`, {
        method: 'DELETE'
      });

      return response.ok;
    } catch {
      return false;
    }
  }
}

export default ImageUtils;


