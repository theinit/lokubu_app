import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AppView } from '../types';

interface ProfileDropdownProps {
  onNavigate: (view: AppView) => void;
  onOpenEditProfile: () => void; // Nueva prop para abrir el modal de edición
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ onNavigate, onOpenEditProfile }) => {
  const { currentUser, logout, deleteAccount } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowDeleteConfirm(false); // También cierra el modal de confirmación si está abierto
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
    onNavigate('home');
  };

  const handleNavigation = (view: AppView) => {
    onNavigate(view);
    setIsOpen(false);
  };

  const handleOpenEditProfileModal = () => {
    onOpenEditProfile();
    setIsOpen(false);
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword.trim()) {
      alert('Por favor, ingresa tu contraseña para confirmar.');
      return;
    }
    
    try {
      await deleteAccount(deletePassword);
      onNavigate('home');
    } catch (error) {
      console.error('Error al eliminar cuenta:', error);
      if (error instanceof Error) {
        if (error.message.includes('auth/wrong-password') || error.message.includes('auth/invalid-credential')) {
          alert('Contraseña incorrecta. Por favor, verifica tu contraseña.');
        } else {
          alert('Error al eliminar la cuenta: ' + error.message);
        }
      } else {
        alert('Error al eliminar la cuenta. Por favor, intenta de nuevo.');
      }
      return;
    }
    setShowDeleteConfirm(false);
    setDeletePassword('');
    setIsOpen(false);
  };

  const handleDeleteClick = () => {
    // setIsOpen(false); // Cierra el dropdown principal
    setShowDeleteConfirm(true);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeletePassword('');
  };

  if (!currentUser) return null;

  const displayName = currentUser.name || currentUser.email?.split('@')[0] || "Usuario";
  const displayPhoto = currentUser.photoURL;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 p-1.5 rounded-full transition-colors"
      >
        {displayPhoto ? (
          <img src={displayPhoto} alt={displayName} className="h-8 w-8 rounded-full object-cover border-2 border-gray-500" />
        ) : (
          <span className="h-8 w-8 rounded-full bg-gray-600 flex items-center justify-center text-gray-300 font-semibold text-sm">
            {displayName.charAt(0).toUpperCase()}
          </span>
        )}
        <span className="font-medium text-sm text-gray-200 hidden md:block pr-1">{displayName}</span>
        <svg className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} md:hidden`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
      {isOpen && !showDeleteConfirm && (
        <div className="absolute right-0 mt-2 w-60 bg-gray-800 rounded-md shadow-xl z-[1000] ring-1 ring-white ring-opacity-10 animate-fade-in overflow-hidden">
          <div className="py-1">
            <div className="px-4 py-3 border-b border-gray-700 flex items-center space-x-3">
              {displayPhoto ? (
                <img src={displayPhoto} alt={displayName} className="h-10 w-10 rounded-full object-cover" />
              ) : (
                <span className="h-10 w-10 rounded-full bg-gray-600 flex items-center justify-center text-gray-300 font-semibold">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              )}
              <div>
                <p className="text-sm font-semibold text-white truncate" title={displayName}>{displayName}</p>
                <p className="text-xs text-gray-400 truncate" title={currentUser.email || ''}>{currentUser.email}</p>
              </div>
            </div>
            <button
              onClick={handleOpenEditProfileModal}
              className="w-full text-left block px-4 py-2.5 text-sm text-gray-200 hover:bg-gray-700 transition-colors"
            >
              Editar Perfil
            </button>
            <button
              onClick={() => handleNavigation('create')}
              className="w-full text-left block px-4 py-2.5 text-sm text-gray-200 hover:bg-gray-700 transition-colors"
            >
              Crear Experiencia
            </button>
            <button
               onClick={() => handleNavigation('my-experiences')}
              className="w-full text-left block px-4 py-2.5 text-sm text-gray-200 hover:bg-gray-700 transition-colors"
            >
              Mis Experiencias
            </button>
            <div className="border-t border-gray-700 my-1"></div>
            <button
              onClick={handleLogout}
              className="w-full text-left block px-4 py-2.5 text-sm text-gray-200 hover:bg-gray-700 transition-colors"
            >
              Cerrar Sesión
            </button>
            <button
              onClick={handleDeleteClick}
              className="w-full text-left block px-4 py-2.5 text-sm text-red-400 hover:bg-red-900/30 hover:text-red-300 transition-colors"
            >
              Eliminar Cuenta
            </button>
          </div>
        </div>
      )}
      
      {/* Modal de confirmación para eliminar cuenta */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[2000]">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">¿Eliminar cuenta?</h3>
            <p className="text-gray-300 mb-4">
              Esta acción no se puede deshacer. Se eliminarán permanentemente todos tus datos, 
              incluyendo tu perfil y experiencias creadas.
            </p>
            <div className="mb-6">
              <label htmlFor="deletePassword" className="block text-sm font-medium text-gray-300 mb-2">
                Confirma tu contraseña:
              </label>
              <input
                type="password"
                id="deletePassword"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Ingresa tu contraseña"
                autoFocus
              />
            </div>
            <div className="flex space-x-4">
              <button
                onClick={handleCancelDelete}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;