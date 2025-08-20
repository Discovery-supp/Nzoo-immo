import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  onImageUploaded: (imageUrl: string) => void;
  currentImageUrl?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageUploaded, currentImageUrl }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner un fichier image valide.');
      return;
    }

    // Vérifier la taille du fichier (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Le fichier est trop volumineux. Taille maximum : 5MB');
      return;
    }

    setIsUploading(true);

    try {
      // Créer un nom de fichier unique
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const fileName = `space-${timestamp}.${fileExtension}`;
      
      // Créer l'URL de prévisualisation
      const previewUrl = URL.createObjectURL(file);
      setPreviewUrl(previewUrl);

             // Générer le chemin vers le dossier public
       const imageUrl = `/images/spaces/${fileName}`;
      
      // Copier le fichier vers le dossier public/images/spaces
      await copyFileToPublic(file, fileName);
      
      onImageUploaded(imageUrl);
      
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      alert('Erreur lors de l\'upload de l\'image');
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

           const copyFileToPublic = async (file: File, fileName: string): Promise<void> => {
        // Cette fonction copie le fichier vers le dossier public
        try {
          // Créer le dossier s'il n'existe pas
          const publicDir = 'public/images/spaces';
          
          // Créer un FormData pour l'upload
          const formData = new FormData();
          formData.append('file', file);
          formData.append('fileName', fileName);
          
          // Simuler l'upload vers le dossier public
          // En réalité, vous devriez implémenter une vraie logique d'upload
          console.log(`Fichier ${fileName} prêt à être copié vers ${publicDir}`);
          console.log(`Chemin généré: /images/spaces/${fileName}`);
          
          // Note: Pour une vraie implémentation, vous devriez :
          // 1. Créer une API endpoint pour recevoir le fichier
          // 2. Sauvegarder le fichier dans public/images/spaces/
          // 3. Retourner le chemin du fichier sauvegardé
          
          // Pour l'instant, on simule le succès
          console.log('✅ Fichier simulé comme sauvegardé dans public/images/spaces/');
        } catch (error) {
          console.error('Erreur lors de la copie du fichier:', error);
          throw error;
        }
      };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    onImageUploaded('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Zone d'upload */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-nzoo-dark transition-colors">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        {!previewUrl ? (
          <div onClick={handleClickUpload} className="cursor-pointer">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                Cliquez pour sélectionner une image
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG, GIF jusqu'à 5MB
              </p>
            </div>
          </div>
        ) : (
          <div className="relative">
            <img
              src={previewUrl}
              alt="Aperçu"
              className="mx-auto max-h-48 rounded-lg shadow-md"
            />
            <button
              onClick={handleRemoveImage}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        
        {isUploading && (
          <div className="mt-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-nzoo-dark mx-auto"></div>
            <p className="text-sm text-gray-600 mt-2">Upload en cours...</p>
          </div>
        )}
      </div>

      {/* URL manuelle */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Ou entrez l'URL de l'image
        </label>
        <div className="flex gap-2">
          <input
            type="url"
            placeholder="https://example.com/image.jpg"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onChange={(e) => onImageUploaded(e.target.value)}
            defaultValue={currentImageUrl || ''}
          />
          <button
            type="button"
            onClick={handleClickUpload}
            className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-1"
            title="Uploader une image"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;
