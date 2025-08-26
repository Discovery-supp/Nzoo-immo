import React from 'react';
import { MapPin, Users, DollarSign, Star } from 'lucide-react';
import SpaceImage from './SpaceImage';

interface SpaceCardProps {
  space: {
    key: string;
    title: string;
    description: string;
    imageUrl?: string;
    dailyPrice?: number;
    monthlyPrice?: number;
    maxOccupants: number;
    features: string[];
    location?: string;
    rating?: number;
  };
  onClick?: () => void;
  showDetails?: boolean;
}

const SpaceCard: React.FC<SpaceCardProps> = ({
  space,
  onClick,
  showDetails = true
}) => {
  const formatPrice = (price?: number) => {
    if (!price) return 'Prix sur demande';
    return `$${price.toLocaleString()}`;
  };

  const getPriceDisplay = () => {
    if (space.dailyPrice) return `${formatPrice(space.dailyPrice)}/jour`;
    if (space.monthlyPrice) return `${formatPrice(space.monthlyPrice)}/mois`;
    return 'Prix sur demande';
  };

  return (
    <div 
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer"
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative h-48">
        <SpaceImage
          imageUrl={space.imageUrl}
          alt={space.title}
          className="w-full h-full object-cover"
          fallbackImage="/images/default-space.jpg"
        />
        
        {/* Price badge */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
          <span className="text-sm font-semibold text-gray-800">
            {getPriceDisplay()}
          </span>
        </div>

        {/* Rating badge */}
        {space.rating && (
          <div className="absolute top-3 left-3 bg-yellow-400/90 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm flex items-center gap-1">
            <Star className="w-3 h-3 text-yellow-600 fill-current" />
            <span className="text-xs font-semibold text-yellow-800">
              {space.rating.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
          {space.title}
        </h3>

        {/* Location */}
        {space.location && (
          <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
            <MapPin className="w-4 h-4" />
            <span>{space.location}</span>
          </div>
        )}

        {/* Description */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {space.description}
        </p>

        {/* Details */}
        {showDetails && (
          <div className="space-y-2">
            {/* Occupants */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              <span>Jusqu'à {space.maxOccupants} personne{space.maxOccupants > 1 ? 's' : ''}</span>
            </div>

            {/* Features */}
            {space.features.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {space.features.slice(0, 3).map((feature, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                  >
                    {feature}
                  </span>
                ))}
                {space.features.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                    +{space.features.length - 3} autres
                  </span>
                )}
              </div>
            )}

            {/* Pricing details */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <DollarSign className="w-4 h-4" />
                <span>Prix journalier</span>
              </div>
              <span className="font-semibold text-gray-900">
                {formatPrice(space.dailyPrice)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpaceCard;


