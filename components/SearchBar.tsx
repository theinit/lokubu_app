import React, { useRef, useEffect } from 'react';
import { ExperienceCategory } from '../types';
import { useI18n } from '../contexts/I18nContext';

interface SearchBarProps {
  onLocationChange: (location: string) => void;
  onCategoryChange: (category: ExperienceCategory) => void;
  locationFilter: string;
  categoryFilter: ExperienceCategory;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onLocationChange,
  onCategoryChange,
  locationFilter,
  categoryFilter,
}) => {
  const { t } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const input = inputRef.current;
    if (input) {
      const handleKeyDown = (e: KeyboardEvent) => {
        console.log('🔍 SearchBar KeyDown:', {
          key: e.key,
          inputValue: input.value,
          inputLength: input.value.length,
          activeElement: document.activeElement?.id,
          target: e.target
        });
        
        if (e.key === 'Backspace' || e.key === 'Delete') {
          console.log(`⬅️ ${e.key} detectado en SearchBar`);
          
          // Si el campo está vacío, prevenir cualquier acción
          if (input.value.length === 0) {
            console.log('🛑 Campo vacío - previniendo acción');
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            return false;
          }
          
          // Si la acción dejaría el campo vacío, prevenir completamente
          if ((e.key === 'Backspace' && input.value.length === 1) || 
              (e.key === 'Delete' && input.selectionStart === 0 && input.value.length === 1)) {
            console.log('🛑 Previniendo eliminación del último carácter para evitar pérdida de foco');
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            // Limpiar el campo manualmente pero mantener el foco
            input.value = '';
            // Disparar el evento onChange manualmente
            const changeEvent = new Event('input', { bubbles: true });
            input.dispatchEvent(changeEvent);
            return false;
          }
        }
      };
      
      const handleFocus = (e: FocusEvent) => {
        console.log('🎯 SearchBar Focus:', {
          target: e.target,
          activeElement: document.activeElement?.id
        });
      };
      
      const handleBlur = (e: FocusEvent) => {
        console.log('👋 SearchBar Blur:', {
          target: e.target,
          relatedTarget: (e.relatedTarget as HTMLElement)?.id || 'unknown',
          activeElement: document.activeElement?.id,
          inputValue: input.value
        });
        
        // Si el campo está vacío, prevenir completamente la pérdida de foco
        if (input.value.length === 0) {
          console.log('🚫 Previniendo blur en campo vacío');
          e.preventDefault();
          e.stopPropagation();
          setTimeout(() => {
            if (document.activeElement !== input) {
              console.log('🔄 Forzando foco de vuelta al SearchBar');
              input.focus();
            }
          }, 0);
        }
      };
      
      input.addEventListener('keydown', handleKeyDown);
      input.addEventListener('focus', handleFocus);
      input.addEventListener('blur', handleBlur);
      
      return () => {
        input.removeEventListener('keydown', handleKeyDown);
        input.removeEventListener('focus', handleFocus);
        input.removeEventListener('blur', handleBlur);
      };
    }
  }, []);

  const getCategoryLabel = (category: ExperienceCategory) => {
    const categoryMap: Record<ExperienceCategory, string> = {
      [ExperienceCategory.ALL]: t('category.all'),
      [ExperienceCategory.GASTRONOMY]: t('category.food'),
      [ExperienceCategory.CULTURE]: t('category.culture'),
      [ExperienceCategory.ADVENTURE]: t('category.adventure'),
      [ExperienceCategory.NATURE]: t('category.nature'),
      [ExperienceCategory.HISTORY]: t('category.history'),
    };
    return categoryMap[category] || category;
  };
  return (
    <div className="bg-gray-800 p-4 rounded-xl shadow-lg mb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        <div className="md:col-span-2">
          <label htmlFor="location-search" className="sr-only">Search by location</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>
            <input
              ref={inputRef}
              id="location-search"
              type="text"
              placeholder={t('search.placeholder')}
              value={locationFilter}
              onChange={(e) => onLocationChange(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-md focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
        </div>
        <div>
          <label htmlFor="category-select" className="sr-only">Filter by category</label>
          <select
            id="category-select"
            value={categoryFilter}
            onChange={(e) => onCategoryChange(e.target.value as ExperienceCategory)}
            className="w-full py-3 px-4 border border-gray-600 bg-gray-700 text-white rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
          >
            {Object.values(ExperienceCategory).map((cat) => (
              <option key={cat} value={cat}>{getCategoryLabel(cat)}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;