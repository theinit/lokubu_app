import React, { useState } from 'react';
import { MapPin, Search } from 'lucide-react';
import { useI18n } from '../contexts/I18nContext';
import { useAuth } from '../contexts/AuthContext';
import { Experience, ExperienceCategory } from '../types';
import SearchBar from './SearchBar';
import MapComponent from './MapComponent';
import ExperienceCard from './ExperienceCard';

interface MainPageProps {
  experiences: Experience[];
  isLoadingExperiences: boolean;
  errorExperiences: string | null;
  locationFilter: string;
  categoryFilter: ExperienceCategory;
  onLocationChange: (location: string) => void;
  onCategoryChange: (category: ExperienceCategory) => void;
  onViewExperience: (experience: Experience) => void;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
}

const MainPage: React.FC<MainPageProps> = ({
  experiences,
  isLoadingExperiences,
  errorExperiences,
  locationFilter,
  categoryFilter,
  onLocationChange,
  onCategoryChange,
  onViewExperience,
  onOpenLogin,
  onOpenRegister
}) => {
  const { t } = useI18n();
  const { currentUser } = useAuth();
  const [heroSearchLocation, setHeroSearchLocation] = useState('');

  // Filtrar experiencias
  const filteredExperiences = experiences.filter(exp => {
    const matchesLocation = !locationFilter || 
      exp.location.toLowerCase().includes(locationFilter.toLowerCase()) ||
      exp.title.toLowerCase().includes(locationFilter.toLowerCase()) ||
      exp.description.toLowerCase().includes(locationFilter.toLowerCase());
    
    const matchesCategory = categoryFilter === ExperienceCategory.ALL || exp.category === categoryFilter;
    
    return matchesLocation && matchesCategory;
  });

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearchLocation.trim()) {
      onLocationChange(heroSearchLocation.trim());
      setHeroSearchLocation('');
    }
  };

  // Determinar si mostrar la sección hero prominente
  const showProminentHero = !locationFilter && !currentUser;
  const hasActiveFilters = locationFilter || categoryFilter !== ExperienceCategory.ALL;
  const shouldShowHeaderFooter = currentUser || hasActiveFilters;

  // Array de imágenes de fondo
  const backgroundImages = [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
  ];

  const [backgroundImage] = useState(() => 
    backgroundImages[Math.floor(Math.random() * backgroundImages.length)]
  );

  return (
    <div className={shouldShowHeaderFooter ? '' : 'min-h-screen'}>
      {/* Sección Hero - Prominente cuando no hay filtros y no está logueado */}
      {showProminentHero && (
        <div className="relative min-h-screen overflow-hidden">
          {/* Imagen de fondo */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          </div>

          {/* Contenido del hero */}
          <div className="relative z-10 min-h-screen flex flex-col">
            {/* Header para usuarios no logueados */}
            <header className="flex justify-between items-center p-6">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">⭐</span>
                </div>
                <span className="text-white text-2xl font-bold">LOKUBU</span>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={onOpenLogin}
                  className="px-6 py-2 text-white border border-white rounded-lg hover:bg-white hover:text-gray-900 transition-colors duration-200"
                >
                  {t('header.login')}
                </button>
                <button
                  onClick={onOpenRegister}
                  className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors duration-200"
                >
                  {t('header.register')}
                </button>
              </div>
            </header>

            {/* Contenido central del hero */}
            <div className="flex-1 flex items-center justify-center px-6">
              <div className="max-w-2xl w-full text-center">
                <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                  {t('home.title')}
                </h1>
                
                <p className="text-xl md:text-2xl text-gray-200 mb-12 leading-relaxed">
                  {t('home.subtitle')}
                </p>

                {/* Formulario de búsqueda del hero */}
                <form onSubmit={handleHeroSearch} className="relative">
                  <div className="flex items-center bg-white rounded-full shadow-2xl overflow-hidden">
                    <div className="flex items-center pl-6 pr-4">
                      <MapPin className="w-6 h-6 text-gray-400" />
                    </div>
                    
                    <input
                      type="text"
                      value={heroSearchLocation}
                      onChange={(e) => setHeroSearchLocation(e.target.value)}
                      placeholder={t('home.searchPlaceholder')}
                      onFocus={(e) => {
                        console.log('🏠 Hero Input Focus:', {
                          target: e.target,
                          activeElement: document.activeElement?.id,
                          heroValue: heroSearchLocation
                        });
                      }}
                      onKeyDown={(e) => {
                        console.log('🏠 Hero Input KeyDown:', {
                          key: e.key,
                          heroValue: heroSearchLocation,
                          activeElement: document.activeElement?.id
                        });
                      }}
                      className="flex-1 py-6 px-2 text-lg text-gray-900 placeholder-gray-500 focus:outline-none"
                    />
                    
                    <button
                      type="submit"
                      className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-6 transition-colors duration-200 flex items-center space-x-2"
                    >
                      <Search className="w-6 h-6" />
                      <span className="font-semibold text-lg">{t('search.button')}</span>
                    </button>
                  </div>
                </form>

                <p className="text-gray-300 mt-8 text-lg">
                  Más de <span className="font-bold text-teal-400">10,000</span> experiencias te esperan
                </p>
              </div>
            </div>

            {/* Footer del hero */}
            <footer className="p-6 text-center">
              <p className="text-gray-400 text-sm">
                © 2024 Lokubu. Conectando viajeros con experiencias auténticas.
              </p>
            </footer>
          </div>
        </div>
      )}

      {/* Sección de contenido principal */}
      <div className={`${showProminentHero ? '' : shouldShowHeaderFooter ? '' : 'min-h-screen'} ${shouldShowHeaderFooter ? '' : 'bg-gray-900'}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero compacto para usuarios logueados o con filtros */}
          {!showProminentHero && (
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {hasActiveFilters ? t('home.mapTitle') : t('home.title')}
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                {hasActiveFilters ? t('home.mapSubtitle') : t('home.subtitle')}
              </p>
            </div>
          )}

          {/* Barra de búsqueda */}
          <div className="mb-12">
            <SearchBar 
              locationFilter={locationFilter}
              categoryFilter={categoryFilter}
              onLocationChange={onLocationChange}
              onCategoryChange={onCategoryChange}
            />
          </div>

          {/* Mapa */}
          <div className="mb-12">
            <div className="h-[500px] w-full bg-gray-800 rounded-lg shadow-lg border border-gray-700 relative z-0">
              <MapComponent experiences={filteredExperiences} onViewExperience={onViewExperience} />
            </div>
          </div>

          {/* Resultados */}
          <div>
            {isLoadingExperiences ? (
              <div className="text-center py-16">
                <h3 className="text-xl font-semibold text-gray-200">{t('common.loading')}</h3>
              </div>
            ) : errorExperiences ? (
              <div className="text-center py-16 bg-red-900/20 border border-red-500 rounded-lg">
                <h3 className="text-xl font-semibold text-red-300">{t('home.errorTitle')}</h3>
                <p className="text-red-400 mt-2">{errorExperiences}</p>
              </div>
            ) : filteredExperiences.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredExperiences.map(exp => (
                  <ExperienceCard key={exp.id} experience={exp} onViewExperience={onViewExperience}/>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <h3 className="text-xl font-semibold text-gray-200">{t('home.noExperiences')}</h3>
                <p className="text-gray-400 mt-2">{t('home.noExperiencesSubtitle')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainPage;