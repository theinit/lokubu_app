import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AppView } from '../types';

interface ProfileDropdownProps {
  onNavigate: (view: AppView) => void;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ onNavigate }) => {
  const { currentUser, logout, deleteAccount } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
    onNavigate('home');
  }

  const handleNavigation = (view: AppView) => {
    onNavigate(view);
    setIsOpen(false);
  }

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
  }

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  }

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeletePassword('');
  }

  if (!currentUser) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 p-2 rounded-full transition-colors"
      >
        <span className="font-medium text-sm text-gray-200">{currentUser.name}</span>
         <svg className="h-6 w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-gray-800 rounded-md shadow-lg z-[1000] ring-1 ring-white ring-opacity-10 animate-fade-in">
          <div className="py-1">
             <div className="px-4 py-2 border-b border-gray-700">
                <p className="text-sm font-semibold text-white">{currentUser.name}</p>
                <p className="text-xs text-gray-400 truncate">{currentUser.email}</p>
            </div>
            <button
              onClick={() => handleNavigation('create')}
              className="w-full text-left block px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
            >
              Crear una Experiencia
            </button>
            <button
               onClick={() => handleNavigation('my-experiences')}
              className="w-full text-left block px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
            >
              Mis Experiencias
            </button>
            <button
              onClick={handleLogout}
              className="w-full text-left block px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 border-t border-gray-700"
            >
              Cerrar Sesión
            </button>
            <button
              onClick={handleDeleteClick}
              className="w-full text-left block px-4 py-2 text-sm text-red-400 hover:bg-red-900 hover:bg-opacity-20"
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