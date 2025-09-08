import React, { useState, useRef, useEffect } from 'react';
import { Type, Search, X, ChevronDown, ChevronUp } from 'lucide-react';
import { SPECIAL_CHARS, getSpecialCharsByCategory, searchSpecialChars, SpecialChar } from '../utils/specialCharsHandler';

interface SpecialCharsPickerProps {
  onCharSelect: (char: string) => void;
  language: 'fr' | 'en';
  isOpen: boolean;
  onClose: () => void;
  position?: { top: number; left: number };
}

const SpecialCharsPicker: React.FC<SpecialCharsPickerProps> = ({
  onCharSelect,
  language,
  isOpen,
  onClose,
  position = { top: 0, left: 0 }
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('accent');
  const [showCategories, setShowCategories] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  const translations = {
    fr: {
      title: 'Caractères spéciaux',
      search: 'Rechercher...',
      categories: 'Catégories',
      noResults: 'Aucun résultat trouvé',
      close: 'Fermer',
      insert: 'Insérer',
      categoryNames: {
        accent: 'Accents',
        currency: 'Devises',
        math: 'Mathématiques',
        symbol: 'Symboles',
        arrow: 'Flèches',
        quotes: 'Guillemets'
      }
    },
    en: {
      title: 'Special characters',
      search: 'Search...',
      categories: 'Categories',
      noResults: 'No results found',
      close: 'Close',
      insert: 'Insert',
      categoryNames: {
        accent: 'Accents',
        currency: 'Currency',
        math: 'Mathematics',
        symbol: 'Symbols',
        arrow: 'Arrows',
        quotes: 'Quotes'
      }
    }
  };

  const t = translations[language];
  const charsByCategory = getSpecialCharsByCategory();

  // Filtrer les caractères selon la recherche et la catégorie
  const filteredChars = searchQuery 
    ? searchSpecialChars(searchQuery)
    : charsByCategory[selectedCategory] || [];

  // Gérer la fermeture en cliquant à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Gérer la fermeture avec Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const handleCharClick = (char: string) => {
    onCharSelect(char);
    onClose();
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setShowCategories(false);
    setSearchQuery(''); // Réinitialiser la recherche
  };

  if (!isOpen) return null;

  return (
    <div
      ref={pickerRef}
      className="fixed z-50 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 max-w-md w-full max-h-96 overflow-hidden"
      style={{
        top: position.top,
        left: position.left,
        transform: 'translate(-50%, -100%)'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Type className="w-5 h-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-800 font-heading">
            {t.title}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t.search}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
        />
      </div>

      {/* Categories */}
      <div className="relative mb-4">
        <button
          onClick={() => setShowCategories(!showCategories)}
          className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
        >
          <span className="font-medium text-gray-700">
            {t.categories}: {t.categoryNames[selectedCategory as keyof typeof t.categoryNames]}
          </span>
          {showCategories ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </button>

        {showCategories && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
            {Object.entries(charsByCategory).map(([category, chars]) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors text-sm ${
                  selectedCategory === category ? 'bg-primary-50 text-primary-700' : 'text-gray-700'
                }`}
              >
                {t.categoryNames[category as keyof typeof t.categoryNames]} ({chars.length})
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Characters Grid */}
      <div className="max-h-48 overflow-y-auto">
        {filteredChars.length > 0 ? (
          <div className="grid grid-cols-8 gap-2">
            {filteredChars.map((char, index) => (
              <button
                key={index}
                onClick={() => handleCharClick(char.symbol)}
                className="p-2 text-center hover:bg-primary-50 rounded-lg transition-colors group relative"
                title={`${char.name} - ${char.description}`}
              >
                <span className="text-lg font-medium text-gray-700 group-hover:text-primary-700">
                  {char.symbol}
                </span>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                  {char.name}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Type className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">{t.noResults}</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>
            {searchQuery ? `${filteredChars.length} résultats` : `${filteredChars.length} caractères`}
          </span>
          <span>Cliquez pour insérer</span>
        </div>
      </div>
    </div>
  );
};

export default SpecialCharsPicker;



