import React, { useState, useRef, useEffect } from 'react';
import { Type, X } from 'lucide-react';
import SpecialCharsPicker from './SpecialCharsPicker';

interface EnhancedTextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  rows?: number;
  label?: string;
  language: 'fr' | 'en';
  showSpecialChars?: boolean;
  multiline?: boolean;
}

const EnhancedTextInput: React.FC<EnhancedTextInputProps> = ({
  value,
  onChange,
  placeholder,
  className = '',
  rows = 1,
  label,
  language,
  showSpecialChars = true,
  multiline = false
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [pickerPosition, setPickerPosition] = useState({ top: 0, left: 0 });
  const [cursorPosition, setCursorPosition] = useState(0);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const translations = {
    fr: {
      specialChars: 'Caractères spéciaux',
      insertChar: 'Insérer un caractère spécial'
    },
    en: {
      specialChars: 'Special characters',
      insertChar: 'Insert special character'
    }
  };

  const t = translations[language];

  // Gérer le clic sur le bouton de caractères spéciaux
  const handleSpecialCharsClick = () => {
    if (inputRef.current && buttonRef.current) {
      const inputRect = inputRef.current.getBoundingClientRect();
      const buttonRect = buttonRef.current.getBoundingClientRect();
      
      setPickerPosition({
        top: inputRect.top - 10,
        left: buttonRect.left + buttonRect.width / 2
      });
      setShowPicker(true);
    }
  };

  // Gérer la sélection d'un caractère spécial
  const handleCharSelect = (char: string) => {
    const { newText, newCursorPosition } = insertSpecialChar(value, char, cursorPosition);
    onChange(newText);
    setCursorPosition(newCursorPosition);
    
    // Focus sur l'input et positionner le curseur
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        if (multiline) {
          (inputRef.current as HTMLTextAreaElement).setSelectionRange(newCursorPosition, newCursorPosition);
        } else {
          (inputRef.current as HTMLInputElement).setSelectionRange(newCursorPosition, newCursorPosition);
        }
      }
    }, 0);
  };

  // Fonction utilitaire pour insérer un caractère à une position donnée
  const insertSpecialChar = (text: string, char: string, position: number) => {
    const beforeCursor = text.slice(0, position);
    const afterCursor = text.slice(position);
    const newText = beforeCursor + char + afterCursor;
    const newCursorPosition = position + char.length;
    
    return { newText, newCursorPosition };
  };

  // Gérer les changements de valeur
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange(e.target.value);
    setCursorPosition(e.target.selectionStart || 0);
  };

  // Gérer les clics dans l'input pour mettre à jour la position du curseur
  const handleClick = (e: React.MouseEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement;
    setCursorPosition(target.selectionStart || 0);
  };

  // Gérer les touches pour mettre à jour la position du curseur
  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement;
    setCursorPosition(target.selectionStart || 0);
  };

  // Gérer la fermeture du picker
  const handleClosePicker = () => {
    setShowPicker(false);
  };

  const inputClasses = `w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base ${className}`;

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          {label}
        </label>
      )}
      
      <div className="relative">
        {multiline ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={value}
            onChange={handleChange}
            onClick={handleClick}
            onKeyUp={handleKeyUp}
            placeholder={placeholder}
            rows={rows}
            className={`${inputClasses} pr-12 resize-none`}
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={value}
            onChange={handleChange}
            onClick={handleClick}
            onKeyUp={handleKeyUp}
            placeholder={placeholder}
            className={`${inputClasses} pr-12`}
          />
        )}
        
        {showSpecialChars && (
          <button
            ref={buttonRef}
            type="button"
            onClick={handleSpecialCharsClick}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-lg transition-colors"
            title={t.insertChar}
          >
            <Type className="w-4 h-4 text-gray-500 hover:text-primary-600" />
          </button>
        )}
      </div>

      {/* Picker de caractères spéciaux */}
      <SpecialCharsPicker
        isOpen={showPicker}
        onClose={handleClosePicker}
        onCharSelect={handleCharSelect}
        language={language}
        position={pickerPosition}
      />
    </div>
  );
};

export default EnhancedTextInput;
