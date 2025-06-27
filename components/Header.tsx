import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import ProfileDropdown from './ProfileDropdown';
import { AppView } from '../types';

interface HeaderProps {
    onLoginClick: () => void;
    onRegisterClick: () => void;
    onNavigate: (view: AppView) => void;
}


const Header: React.FC<HeaderProps> = ({ onLoginClick, onRegisterClick, onNavigate }) => {
  const { currentUser } = useAuth();
  
  return (
    <header className="bg-gray-800 shadow-lg sticky top-0 z-30 border-b border-gray-700">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <button onClick={() => onNavigate('home')} className="flex items-center space-x-2">
              <svg className="h-8 w-8 text-teal-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              <span className="text-2xl font-bold text-white">LocalConnect</span>
            </button>
          </div>
          <nav className="flex items-center space-x-4">
             {currentUser ? (
               <ProfileDropdown onNavigate={onNavigate} />
             ) : (
                <div className="hidden md:flex items-center space-x-4">
                    <button onClick={onLoginClick} className="text-gray-300 hover:text-white font-medium">
                        Iniciar Sesión
                    </button>
                    <button onClick={onRegisterClick} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700">
                        Registrarse
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