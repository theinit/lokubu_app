import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

const LoadingSpinner: React.FC = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
);

const RegisterModal: React.FC<RegisterModalProps> = ({ isOpen, onClose, onSwitchToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();

  // Función para validar los requisitos de contraseña
  const validatePassword = (password: string) => {
    const requirements = {
      hasUpperCase: /[A-Z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[^A-Za-z0-9]/.test(password),
      hasMinLength: password.length >= 6
    };
    return requirements;
  };

  const passwordRequirements = validatePassword(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validar requisitos de contraseña antes de enviar
    const allRequirementsMet = Object.values(passwordRequirements).every(req => req);
    if (!allRequirementsMet) {
      setError('La contraseña no cumple con todos los requisitos. Por favor, revisa los criterios mostrados.');
      return;
    }
    
    setIsLoading(true);
    try {
      await register(name, email, password);
      onClose();
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes('password-does-not-meet-requirements')) {
          setError('La contraseña no cumple con los requisitos de seguridad. Asegúrate de incluir mayúsculas, números y caracteres especiales.');
        } else if (err.message.includes('weak-password')) {
          setError('La contraseña es muy débil. Debe tener al menos 8 caracteres.');
        } else if (err.message.includes('email-already-in-use')) {
          setError('Este email ya está registrado. Intenta con otro email o inicia sesión.');
        } else {
          setError(err.message);
        }
      } else {
        setError('Ocurrió un error desconocido. Por favor, intenta de nuevo.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-[1000] flex justify-center items-center">
      <div className="bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md m-4 animate-fade-in border border-gray-700">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Crear Cuenta</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-white">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>
        
        {error && <div className="bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="register-name">
              Nombre
            </label>
            <input
              id="register-name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:ring-teal-500 focus:border-teal-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="register-email">
              Email
            </label>
            <input
              id="register-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:ring-teal-500 focus:border-teal-500"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="register-password">
              Contraseña
            </label>
            <input
              id="register-password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:ring-teal-500 focus:border-teal-500"
              required
            />
            
            {/* Requisitos de contraseña */}
            <div className="mt-3 text-xs">
              <p className="text-gray-400 mb-2">La contraseña debe cumplir los siguientes requisitos:</p>
              <ul className="space-y-1">
                <li className={`flex items-center ${
                  passwordRequirements.hasMinLength ? 'text-green-400' : 'text-gray-400'
                }`}>
                  <span className="mr-2">{passwordRequirements.hasMinLength ? '✓' : '○'}</span>
                  Mínimo 8 caracteres
                </li>
                <li className={`flex items-center ${
                  passwordRequirements.hasUpperCase ? 'text-green-400' : 'text-gray-400'
                }`}>
                  <span className="mr-2">{passwordRequirements.hasUpperCase ? '✓' : '○'}</span>
                  Al menos una letra mayúscula
                </li>
                <li className={`flex items-center ${
                  passwordRequirements.hasNumber ? 'text-green-400' : 'text-gray-400'
                }`}>
                  <span className="mr-2">{passwordRequirements.hasNumber ? '✓' : '○'}</span>
                  Al menos un número
                </li>
                <li className={`flex items-center ${
                  passwordRequirements.hasSpecialChar ? 'text-green-400' : 'text-gray-400'
                }`}>
                  <span className="mr-2">{passwordRequirements.hasSpecialChar ? '✓' : '○'}</span>
                  Al menos un carácter especial (!@#$%^&*)
                </li>
              </ul>
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading || !Object.values(passwordRequirements).every(req => req) || !name.trim() || !email.trim()}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline flex justify-center items-center disabled:bg-gray-500 disabled:cursor-not-allowed"
          >
            {isLoading ? <LoadingSpinner /> : 'Crear Cuenta'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          ¿Ya tienes una cuenta?{' '}
          <button onClick={onSwitchToLogin} className="font-medium text-teal-400 hover:text-teal-300">
            Inicia Sesión
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterModal;