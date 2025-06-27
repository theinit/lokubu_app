import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { updateUserProfile } from '../services/firestoreService';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: (); => void;
  onProfileUpdate: (updatedUser: User) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, onProfileUpdate }) => {
  const { currentUser } = useAuth();
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [hobbies, setHobbies] = useState(''); // Comma-separated string
  const [age, setAge] = useState<number | ''>('');
  const [photoURL, setPhotoURL] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // Para la nueva imagen
  const [imagePreview, setImagePreview] = useState<string | null>(null); // Para previsualizar la nueva imagen
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setLastName(currentUser.lastName || '');
      setHobbies(currentUser.hobbies?.join(', ') || '');
      setAge(currentUser.age || '');
      setPhotoURL(currentUser.photoURL || '');
      setImagePreview(currentUser.photoURL || null); // Mostrar foto actual al inicio
      setSelectedFile(null); // Resetear archivo seleccionado
    }
  }, [currentUser, isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Validaciones básicas del archivo (opcional pero recomendado)
      if (file.size > 5 * 1024 * 1024) { // Max 5MB
        setError("El archivo es demasiado grande. Máximo 5MB.");
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
        setError("Tipo de archivo no permitido. Sube JPG, PNG, WEBP o GIF.");
        return;
      }
      setError(null); // Limpiar error si pasa validaciones
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setSelectedFile(null);
      // Si se deselecciona un archivo, volver a la photoURL actual o ninguna si no hay
      setImagePreview(currentUser?.photoURL || null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsLoading(true);
    setError(null);

    let finalPhotoURL = currentUser.photoURL || '';

    try {
      if (selectedFile) {
        // Subir la nueva imagen y obtener su URL
        finalPhotoURL = await uploadProfileImage(currentUser.id, selectedFile, currentUser.photoURL);
      } else if (photoURL !== currentUser.photoURL && !selectedFile) {
        // Si el campo de texto photoURL se modificó manualmente y no hay archivo seleccionado,
        // se asume que el usuario quiere usar esa URL directamente (o borrarla si está vacía).
        // Potencialmente, si se borra la URL y antes había una en Storage, esa imagen de Storage quedaría huérfana.
        // Para una gestión más robusta, se podría añadir lógica para borrar la imagen de Storage si finalPhotoURL se vacía.
        finalPhotoURL = photoURL || '';
      }


      const hobbiesArray = hobbies.split(',').map(h => h.trim()).filter(h => h);
      const updatedProfileData: Partial<User> = {
        name,
        lastName: lastName || undefined,
        hobbies: hobbiesArray.length > 0 ? hobbiesArray : undefined,
        age: age ? Number(age) : undefined,
        photoURL: finalPhotoURL || undefined, // Usar la URL de la imagen subida o la manual
      };

      await updateUserProfile(currentUser.id, updatedProfileData);
      const updatedUser = { ...currentUser, ...updatedProfileData } as User;
      onProfileUpdate(updatedUser);
      onClose();
    } catch (err: any) {
      console.error("Error updating profile:", err);
      setError(err.message || "Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[1500] p-4">
      <div className="bg-gray-800 p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-in-up">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-white">Editar Perfil</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 transition-colors"
            aria-label="Cerrar modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Nombre</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-1">Apellidos</label>
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="age" className="block text-sm font-medium text-gray-300 mb-1">Edad</label>
            <input
              type="number"
              id="age"
              value={age}
              onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              min="0"
            />
          </div>

          <div>
            <label htmlFor="hobbies" className="block text-sm font-medium text-gray-300 mb-1">Hobbies (separados por comas)</label>
            <input
              type="text"
              id="hobbies"
              value={hobbies}
              onChange={(e) => setHobbies(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Ej: Leer, Viajar, Programar"
            />
          </div>

          {/* Sección de carga de imagen y previsualización */}
          <div className="space-y-2">
            <label htmlFor="photoFile" className="block text-sm font-medium text-gray-300">
              Foto de Perfil (JPG, PNG, GIF, WEBP - Máx 5MB)
            </label>
            <div className="flex items-center space-x-4">
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Previsualización de perfil"
                  className="h-20 w-20 rounded-full object-cover border-2 border-gray-600"
                />
              )}
              {!imagePreview && (
                 <div className="h-20 w-20 rounded-full bg-gray-700 flex items-center justify-center text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                 </div>
              )}
              <input
                type="file"
                id="photoFile"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-400
                           file:mr-4 file:py-2 file:px-4
                           file:rounded-md file:border-0
                           file:text-sm file:font-semibold
                           file:bg-indigo-500 file:text-indigo-50
                           hover:file:bg-indigo-600
                           focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500
                           file:transition-colors file:cursor-pointer"
              />
            </div>
            {/* Campo de texto para URL manual (opcional o como fallback) */}
            <details className="pt-2">
              <summary className="text-xs text-gray-400 hover:text-gray-200 cursor-pointer">Usar URL externa para foto</summary>
              <input
                type="url"
                id="photoURL"
                value={photoURL}
                onChange={(e) => {
                  setPhotoURL(e.target.value);
                  if (!selectedFile) { // Si no hay un archivo seleccionado, actualiza la preview con la URL
                    setImagePreview(e.target.value || (currentUser?.photoURL || null) );
                  }
                }}
                className="mt-2 w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-md text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="https://ejemplo.com/imagen.jpg"
                disabled={!!selectedFile} // Deshabilitar si se ha seleccionado un archivo
              />
               {selectedFile && <p className="text-xs text-yellow-400 mt-1">La URL externa se ignora si se selecciona un archivo para subir.</p>}
            </details>
          </div>

          {error && <p className="text-sm text-red-400 bg-red-900/30 p-3 rounded-md border border-red-500/50">{error}</p>}

          <div className="flex flex-col sm:flex-row-reverse sm:items-center sm:space-x-4 sm:space-x-reverse pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-2.5 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Guardando...
                </>
              ) : 'Guardar Cambios'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="w-full sm:w-auto mt-3 sm:mt-0 inline-flex justify-center items-center px-6 py-2.5 border border-gray-600 text-base font-medium rounded-md text-gray-200 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 disabled:opacity-70 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
