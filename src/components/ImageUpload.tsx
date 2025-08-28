import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { useToastContext } from './ToastProvider';
import ImageUploadService from '../services/imageUploadService';

interface ImageUploadProps {
  onImageUploaded: (imageUrl: string) => void;
  currentImageUrl?: string;
  spaceKey?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ 
  onImageUploaded, 
  currentImageUrl,
  spaceKey 
}) => {
  const { success, error: showError, warning } = useToastContext();
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Valider le fichier
    const validation = ImageUploadService.validateImage(file);
    if (!validation.valid) {
      showError(validation.error || 'Fichier invalide');
      return;
    }

    setIsUploading(true);

    try {
      // Créer une prévisualisation temporaire
      const tempPreviewUrl = URL.createObjectURL(file);
      setPreviewUrl(tempPreviewUrl);

      // Upload l'image vers Supabase Storage
      const result = await ImageUploadService.uploadImage(file);
      
      if (result.success && result.url) {
        // Mettre à jour la prévisualisation avec l'URL finale
        setPreviewUrl(result.url);
        
        // Notifier le parent
        onImageUploaded(result.url);
        
        success('Image uploadée avec succès !');
        console.log('✅ Image sauvegardée:', result.url);
      } else {
        throw new Error(result.error || 'Erreur lors de l\'upload');
      }
      
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      showError('Erreur lors de l\'upload de l\'image');
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
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

  const handleUrlChange = (url: string) => {
    // Valider l'URL
    if (url && !url.startsWith('http') && !url.startsWith('/')) {
      warning('Veuillez entrer une URL valide (commençant par http:// ou /)');
      return;
    }
    
    onImageUploaded(url);
    setPreviewUrl(url || null);
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
                PNG, JPG, GIF, WebP jusqu'à 5MB
              </p>
              {spaceKey && (
                <p className="text-xs text-blue-500 mt-1">
                  Espace: {spaceKey}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="relative">
            <img
              src={previewUrl}
              alt="Aperçu"
              className="mx-auto max-h-48 rounded-lg shadow-md"
              onError={() => {
                warning('Impossible de charger l\'aperçu de l\'image');
              }}
            />
            <button
              onClick={handleRemoveImage}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              title="Supprimer l'image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        
        {isUploading && (
          <div className="mt-4">
            <div className="rounded-full h-6 w-6 border-b-2 border-nzoo-dark mx-auto"></div>
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
            placeholder="https://example.com/image.jpg ou /images/spaces/image.jpg"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onChange={(e) => handleUrlChange(e.target.value)}
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
        <p className="text-xs text-gray-500 mt-1">
          Les images uploadées seront sauvegardées dans /public/images/spaces/
        </p>
      </div>

      {/* Informations sur l'upload */}
      {previewUrl && (
        <div className="p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Image sélectionnée:</strong> {previewUrl}
          </p>
          {previewUrl.startsWith('/images/spaces/') && (
            <p className="text-xs text-blue-600 mt-1">
              ✅ Image sauvegardée localement dans le dossier public
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;

