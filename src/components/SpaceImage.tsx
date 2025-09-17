import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, AlertCircle } from 'lucide-react';
import ImageUtils from '../utils/imageUtils';

interface SpaceImageProps {
  imageUrl?: string;
  alt?: string;
  className?: string;
  fallbackImage?: string;
  showError?: boolean;
  onError?: () => void;
  onLoad?: () => void;
}

const SpaceImage: React.FC<SpaceImageProps> = ({
  imageUrl,
  alt = 'Image d\'espace',
  className = 'w-full h-48 object-cover rounded-lg',
  fallbackImage = '/images/default-space.jpg',
  showError = true,
  onError,
  onLoad
}) => {
  const [currentImage, setCurrentImage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const loadImage = async () => {
      setIsLoading(true);
      setHasError(false);

      try {
        if (!imageUrl) {
          setCurrentImage(fallbackImage);
          return;
        }

        // Obtenir l'URL complète de l'image
        const fullImageUrl = ImageUtils.getSpaceImageUrl(imageUrl);
        
        // Vérifier si l'image existe
        const exists = await ImageUtils.imageExists(fullImageUrl);
        
        if (exists) {
          setCurrentImage(fullImageUrl);
        } else {
          setCurrentImage(fallbackImage);
          setHasError(true);
          onError?.();
        }
      } catch (error) {
        console.error('Erreur lors du chargement de l\'image:', error);
        setCurrentImage(fallbackImage);
        setHasError(true);
        onError?.();
      } finally {
        setIsLoading(false);
      }
    };

    loadImage();
  }, [imageUrl, fallbackImage, onError]);

  const handleImageLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
    setCurrentImage(fallbackImage);
    onError?.();
  };

  return (
    <div className="relative">
      {/* Image */}
      <img
        src={currentImage}
        alt={alt}
        className={className}
        onLoad={handleImageLoad}
        onError={handleImageError}
      />

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Error indicator */}
      {hasError && showError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">Image non disponible</p>
          </div>
        </div>
      )}

      {/* Debug info (en développement) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
          {imageUrl ? 'URL: ' + imageUrl : 'Aucune image'}
        </div>
      )}
    </div>
  );
};

export default SpaceImage;



