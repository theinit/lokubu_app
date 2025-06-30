import React, { useState } from 'react';
import { MapPin, Search } from 'lucide-react';
import { useI18n } from '../contexts/I18nContext';

interface HomePageProps {
  onSearch: (location: string) => void;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onSearch, onOpenLogin, onOpenRegister }) => {
  const { t } = useI18n();
  const [searchLocation, setSearchLocation] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchLocation.trim()) {
      onSearch(searchLocation.trim());
    }
  };

  // Array de imágenes de fondo con lugares emblemáticos
  const backgroundImages = [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80', // Santorini
    'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80', // Machu Picchu
    'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80', // Londres
    'https://images.unsplash.com/photo-1502602898536-47ad22581b52?ixlib=rb-4.0.3&auto=format&fit=crop&w=2073&q=80', // París
    'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80', // Tokio
    'https://images.unsplash.com/photo-1518684079-3c830dcef090?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80', // Dubái
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80', // Bali
    'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80', // Islandia
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80', // Nueva York
    'https://images.unsplash.com/photo-1528543606781-2f6e6857f318?ixlib=rb-4.0.3&auto=format&fit=crop&w=2065&q=80', // Roma
  ];

  // Seleccionar imagen aleatoria solo una vez al montar el componente
  const [backgroundImage] = useState(() => 
    backgroundImages[Math.floor(Math.random() * backgroundImages.length)]
  );

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Imagen de fondo */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        {/* Overlay oscuro para mejorar legibilidad */}
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="flex justify-between items-center p-6">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">⭐</span>
            </div>
            <span className="text-white text-2xl font-bold">LOKUBU</span>
          </div>

          {/* Botones de autenticación */}
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

        {/* Contenido central */}
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-2xl w-full text-center">
            {/* Título principal */}
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              {t('home.title')}
            </h1>
            
            {/* Subtítulo */}
            <p className="text-xl md:text-2xl text-gray-200 mb-12 leading-relaxed">
              {t('home.subtitle')}
            </p>

            {/* Formulario de búsqueda */}
            <form onSubmit={handleSubmit} className="relative">
              <div className="flex items-center bg-white rounded-full shadow-2xl overflow-hidden">
                <div className="flex items-center pl-6 pr-4">
                  <MapPin className="w-6 h-6 text-gray-400" />
                </div>
                
                <input
                  type="text"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  placeholder={t('home.searchPlaceholder')}
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

            {/* Texto adicional */}
            <p className="text-gray-300 mt-8 text-lg">
              Más de <span className="font-bold text-teal-400">10,000</span> experiencias te esperan
            </p>
          </div>
        </div>

        {/* Footer minimalista */}
        <footer className="p-6 text-center">
          <p className="text-gray-400 text-sm">
            © 2024 Lokubu. Conectando viajeros con experiencias auténticas.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default HomePage;