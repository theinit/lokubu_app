import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../contexts/I18nContext';
import ProfileDropdown from './ProfileDropdown';
import LanguageSelector from './LanguageSelector';
import { AppView } from '../types';

interface HeaderProps {
    onLoginClick: () => void;
    onRegisterClick: () => void;
    onNavigate: (view: AppView) => void;
    onOpenEditProfile: () => void;
}


const Header: React.FC<HeaderProps> = ({ onLoginClick, onRegisterClick, onNavigate, onOpenEditProfile }) => {
  const { currentUser } = useAuth();
  const { t } = useI18n();
  
  return (
    <header className="bg-gray-800 shadow-lg sticky top-0 z-30 border-b border-gray-700">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <button onClick={() => onNavigate('home')} className="flex items-center space-x-2">
              <svg className="h-8 w-8 text-teal-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span className="text-2xl font-bold text-white">LOKUBU</span>
            </button>
          </div>
          <nav className="flex items-center space-x-4">
            <LanguageSelector />
             {currentUser ? (
               <ProfileDropdown onNavigate={onNavigate} onOpenEditProfile={onOpenEditProfile} />
             ) : (
                <div className="hidden md:flex items-center space-x-4">
                    <button onClick={onLoginClick} className="text-gray-300 hover:text-white font-medium">
                        {t('header.login')}
                    </button>
                    <button onClick={onRegisterClick} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700">
                        {t('header.register')}
                    </button>
                </div>
             )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;