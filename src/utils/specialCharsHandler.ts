/**
 * Utilitaire pour gérer les caractères spéciaux dans l'éditeur de contenu
 */

export interface SpecialChar {
  symbol: string;
  name: string;
  description: string;
  category: 'accent' | 'currency' | 'math' | 'symbol' | 'arrow' | 'quotes';
}

export const SPECIAL_CHARS: SpecialChar[] = [
  // Accents français
  { symbol: 'à', name: 'a grave', description: 'a avec accent grave', category: 'accent' },
  { symbol: 'á', name: 'a aigu', description: 'a avec accent aigu', category: 'accent' },
  { symbol: 'â', name: 'a circonflexe', description: 'a avec accent circonflexe', category: 'accent' },
  { symbol: 'ä', name: 'a tréma', description: 'a avec tréma', category: 'accent' },
  { symbol: 'è', name: 'e grave', description: 'e avec accent grave', category: 'accent' },
  { symbol: 'é', name: 'e aigu', description: 'e avec accent aigu', category: 'accent' },
  { symbol: 'ê', name: 'e circonflexe', description: 'e avec accent circonflexe', category: 'accent' },
  { symbol: 'ë', name: 'e tréma', description: 'e avec tréma', category: 'accent' },
  { symbol: 'ì', name: 'i grave', description: 'i avec accent grave', category: 'accent' },
  { symbol: 'í', name: 'i aigu', description: 'i avec accent aigu', category: 'accent' },
  { symbol: 'î', name: 'i circonflexe', description: 'i avec accent circonflexe', category: 'accent' },
  { symbol: 'ï', name: 'i tréma', description: 'i avec tréma', category: 'accent' },
  { symbol: 'ò', name: 'o grave', description: 'o avec accent grave', category: 'accent' },
  { symbol: 'ó', name: 'o aigu', description: 'o avec accent aigu', category: 'accent' },
  { symbol: 'ô', name: 'o circonflexe', description: 'o avec accent circonflexe', category: 'accent' },
  { symbol: 'ö', name: 'o tréma', description: 'o avec tréma', category: 'accent' },
  { symbol: 'ù', name: 'u grave', description: 'u avec accent grave', category: 'accent' },
  { symbol: 'ú', name: 'u aigu', description: 'u avec accent aigu', category: 'accent' },
  { symbol: 'û', name: 'u circonflexe', description: 'u avec accent circonflexe', category: 'accent' },
  { symbol: 'ü', name: 'u tréma', description: 'u avec tréma', category: 'accent' },
  { symbol: 'ç', name: 'c cédille', description: 'c avec cédille', category: 'accent' },
  { symbol: 'ñ', name: 'n tilde', description: 'n avec tilde', category: 'accent' },
  
  // Majuscules avec accents
  { symbol: 'À', name: 'A grave', description: 'A avec accent grave', category: 'accent' },
  { symbol: 'Á', name: 'A aigu', description: 'A avec accent aigu', category: 'accent' },
  { symbol: 'Â', name: 'A circonflexe', description: 'A avec accent circonflexe', category: 'accent' },
  { symbol: 'Ä', name: 'A tréma', description: 'A avec tréma', category: 'accent' },
  { symbol: 'È', name: 'E grave', description: 'E avec accent grave', category: 'accent' },
  { symbol: 'É', name: 'E aigu', description: 'E avec accent aigu', category: 'accent' },
  { symbol: 'Ê', name: 'E circonflexe', description: 'E avec accent circonflexe', category: 'accent' },
  { symbol: 'Ë', name: 'E tréma', description: 'E avec tréma', category: 'accent' },
  { symbol: 'Ì', name: 'I grave', description: 'I avec accent grave', category: 'accent' },
  { symbol: 'Í', name: 'I aigu', description: 'I avec accent aigu', category: 'accent' },
  { symbol: 'Î', name: 'I circonflexe', description: 'I avec accent circonflexe', category: 'accent' },
  { symbol: 'Ï', name: 'I tréma', description: 'I avec tréma', category: 'accent' },
  { symbol: 'Ò', name: 'O grave', description: 'O avec accent grave', category: 'accent' },
  { symbol: 'Ó', name: 'O aigu', description: 'O avec accent aigu', category: 'accent' },
  { symbol: 'Ô', name: 'O circonflexe', description: 'O avec accent circonflexe', category: 'accent' },
  { symbol: 'Ö', name: 'O tréma', description: 'O avec tréma', category: 'accent' },
  { symbol: 'Ù', name: 'U grave', description: 'U avec accent grave', category: 'accent' },
  { symbol: 'Ú', name: 'U aigu', description: 'U avec accent aigu', category: 'accent' },
  { symbol: 'Û', name: 'U circonflexe', description: 'U avec accent circonflexe', category: 'accent' },
  { symbol: 'Ü', name: 'U tréma', description: 'U avec tréma', category: 'accent' },
  { symbol: 'Ç', name: 'C cédille', description: 'C avec cédille', category: 'accent' },
  { symbol: 'Ñ', name: 'N tilde', description: 'N avec tilde', category: 'accent' },

  // Devises
  { symbol: '€', name: 'Euro', description: 'Symbole Euro', category: 'currency' },
  { symbol: '$', name: 'Dollar', description: 'Symbole Dollar', category: 'currency' },
  { symbol: '£', name: 'Livre', description: 'Symbole Livre Sterling', category: 'currency' },
  { symbol: '¥', name: 'Yen', description: 'Symbole Yen', category: 'currency' },
  { symbol: '¢', name: 'Cent', description: 'Symbole Cent', category: 'currency' },
  { symbol: '₹', name: 'Roupie', description: 'Symbole Roupie Indienne', category: 'currency' },

  // Symboles mathématiques
  { symbol: '×', name: 'Multiplier', description: 'Signe de multiplication', category: 'math' },
  { symbol: '÷', name: 'Diviser', description: 'Signe de division', category: 'math' },
  { symbol: '±', name: 'Plus/Moins', description: 'Signe plus ou moins', category: 'math' },
  { symbol: '≈', name: 'Approximativement', description: 'Signe approximativement égal', category: 'math' },
  { symbol: '≠', name: 'Différent', description: 'Signe différent de', category: 'math' },
  { symbol: '≤', name: 'Inférieur ou égal', description: 'Signe inférieur ou égal', category: 'math' },
  { symbol: '≥', name: 'Supérieur ou égal', description: 'Signe supérieur ou égal', category: 'math' },
  { symbol: '∞', name: 'Infini', description: 'Symbole infini', category: 'math' },
  { symbol: '√', name: 'Racine', description: 'Signe racine carrée', category: 'math' },
  { symbol: '∑', name: 'Somme', description: 'Signe somme', category: 'math' },
  { symbol: 'π', name: 'Pi', description: 'Symbole Pi', category: 'math' },

  // Symboles généraux
  { symbol: '©', name: 'Copyright', description: 'Symbole copyright', category: 'symbol' },
  { symbol: '®', name: 'Marque déposée', description: 'Symbole marque déposée', category: 'symbol' },
  { symbol: '™', name: 'Marque commerciale', description: 'Symbole marque commerciale', category: 'symbol' },
  { symbol: '°', name: 'Degré', description: 'Symbole degré', category: 'symbol' },
  { symbol: '§', name: 'Paragraphe', description: 'Symbole paragraphe', category: 'symbol' },
  { symbol: '¶', name: 'Pilcrow', description: 'Symbole pilcrow', category: 'symbol' },
  { symbol: '†', name: 'Dagger', description: 'Symbole obèle', category: 'symbol' },
  { symbol: '‡', name: 'Double dagger', description: 'Symbole double obèle', category: 'symbol' },
  { symbol: '•', name: 'Bullet', description: 'Puce', category: 'symbol' },
  { symbol: '◦', name: 'White bullet', description: 'Puce blanche', category: 'symbol' },
  { symbol: '▪', name: 'Black square', description: 'Carré noir', category: 'symbol' },
  { symbol: '▫', name: 'White square', description: 'Carré blanc', category: 'symbol' },

  // Guillemets
  { symbol: '\u0022', name: 'Guillemets droits', description: 'Guillemets droits', category: 'quotes' },
  { symbol: '\u201C', name: 'Guillemets courbes', description: 'Guillemets courbes', category: 'quotes' },
  { symbol: '\u2019', name: 'Apostrophe courbe', description: 'Apostrophe courbe', category: 'quotes' },
  { symbol: '\u0027', name: 'Apostrophe droite', description: 'Apostrophe droite', category: 'quotes' },
  { symbol: '«', name: 'Guillemets français', description: 'Guillemets français ouvrants', category: 'quotes' },
  { symbol: '»', name: 'Guillemets français', description: 'Guillemets français fermants', category: 'quotes' },
  { symbol: '‹', name: 'Guillemets simples', description: 'Guillemets simples ouvrants', category: 'quotes' },
  { symbol: '›', name: 'Guillemets simples', description: 'Guillemets simples fermants', category: 'quotes' },

  // Flèches
  { symbol: '←', name: 'Flèche gauche', description: 'Flèche vers la gauche', category: 'arrow' },
  { symbol: '→', name: 'Flèche droite', description: 'Flèche vers la droite', category: 'arrow' },
  { symbol: '↑', name: 'Flèche haut', description: 'Flèche vers le haut', category: 'arrow' },
  { symbol: '↓', name: 'Flèche bas', description: 'Flèche vers le bas', category: 'arrow' },
  { symbol: '↔', name: 'Flèche bidirectionnelle', description: 'Flèche bidirectionnelle', category: 'arrow' },
  { symbol: '↕', name: 'Flèche verticale', description: 'Flèche verticale', category: 'arrow' },
  { symbol: '↖', name: 'Flèche diagonale', description: 'Flèche diagonale haut-gauche', category: 'arrow' },
  { symbol: '↗', name: 'Flèche diagonale', description: 'Flèche diagonale haut-droite', category: 'arrow' },
  { symbol: '↙', name: 'Flèche diagonale', description: 'Flèche diagonale bas-gauche', category: 'arrow' },
  { symbol: '↘', name: 'Flèche diagonale', description: 'Flèche diagonale bas-droite', category: 'arrow' },
];

/**
 * Groupe les caractères spéciaux par catégorie
 */
export const getSpecialCharsByCategory = (): Record<string, SpecialChar[]> => {
  return SPECIAL_CHARS.reduce((acc, char) => {
    if (!acc[char.category]) {
      acc[char.category] = [];
    }
    acc[char.category].push(char);
    return acc;
  }, {} as Record<string, SpecialChar[]>);
};

/**
 * Filtre les caractères spéciaux par catégorie
 */
export const filterSpecialCharsByCategory = (category: SpecialChar['category']): SpecialChar[] => {
  return SPECIAL_CHARS.filter(char => char.category === category);
};

/**
 * Recherche des caractères spéciaux par nom ou description
 */
export const searchSpecialChars = (query: string): SpecialChar[] => {
  const lowerQuery = query.toLowerCase();
  return SPECIAL_CHARS.filter(char => 
    char.name.toLowerCase().includes(lowerQuery) ||
    char.description.toLowerCase().includes(lowerQuery) ||
    char.symbol.toLowerCase().includes(lowerQuery)
  );
};

/**
 * Insère un caractère spécial dans un champ de texte
 */
export const insertSpecialChar = (
  text: string, 
  char: string, 
  cursorPosition: number
): { newText: string; newCursorPosition: number } => {
  const beforeCursor = text.slice(0, cursorPosition);
  const afterCursor = text.slice(cursorPosition);
  const newText = beforeCursor + char + afterCursor;
  const newCursorPosition = cursorPosition + char.length;
  
  return { newText, newCursorPosition };
};

/**
 * Nettoie le texte des caractères spéciaux problématiques
 */
export const cleanSpecialChars = (text: string): string => {
  return text
    .replace(/[\u201C\u201D]/g, '"') // Guillemets courbes vers droits
    .replace(/[\u2018\u2019]/g, "'") // Apostrophes courbes vers droites
    .replace(/[\u2013\u2014]/g, '-') // Tiret cadratin vers tiret
    .replace(/\u2026/g, '...') // Points de suspension vers trois points
    .replace(/\u00A0/g, ' '); // Espace insécable vers espace normal
};

/**
 * Valide si un caractère est un caractère spécial supporté
 */
export const isSpecialChar = (char: string): boolean => {
  return SPECIAL_CHARS.some(specialChar => specialChar.symbol === char);
};

/**
 * Obtient les informations d'un caractère spécial
 */
export const getSpecialCharInfo = (char: string): SpecialChar | undefined => {
  return SPECIAL_CHARS.find(specialChar => specialChar.symbol === char);
};
