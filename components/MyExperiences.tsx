import React, { useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Experience, AppView } from '../types';
import MyExperienceCard from './MyExperienceCard';

interface MyExperiencesProps {
  allExperiences: Experience[];
  onNavigate: (view: AppView) => void;
  onViewExperience: (experience: Experience) => void;
  onEditExperience: (experience: Experience) => void;
  onDeleteExperience: (experienceId: string) => void;
}

const MyExperiences: React.FC<MyExperiencesProps> = ({ 
  allExperiences, 
  onNavigate, 
  onViewExperience, 
  onEditExperience, 
  onDeleteExperience 
}) => {
  const { currentUser } = useAuth();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [experienceToDelete, setExperienceToDelete] = useState<Experience | null>(null);

  const myExperiences = useMemo(() => {
    if (!currentUser) return [];
    return allExperiences.filter(exp => exp.host.id === currentUser.id);
  }, [allExperiences, currentUser]);

  const handleDeleteClick = (experience: Experience) => {
    setExperienceToDelete(experience);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (experienceToDelete) {
      onDeleteExperience(experienceToDelete.id);
      setShowDeleteModal(false);
      setExperienceToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setExperienceToDelete(null);
  };
  
  return (
    <div className="animate-fade-in">
       <button onClick={() => onNavigate('home')} className="mb-6 inline-flex items-center text-sm font-medium text-gray-400 hover:text-white">
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        Volver a Explorar
      </button>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Mis Experiencias</h2>
          <p className="text-xl text-gray-300 mt-2">Gestiona las aventuras que ofreces.</p>
        </div>
        <button
          onClick={() => onNavigate('create')}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700"
        >
          Crear Nueva Experiencia
        </button>
      </div>

      {myExperiences.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {myExperiences.map(exp => (
            <MyExperienceCard 
              key={exp.id} 
              experience={exp} 
              onViewExperience={onViewExperience}
              onEditExperience={onEditExperience}
              onDeleteExperience={handleDeleteClick}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-800 rounded-lg shadow-md border border-gray-700">
          <svg className="mx-auto h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
          <h3 className="mt-2 text-xl font-semibold text-white">Aún no has creado ninguna experiencia</h3>
          <p className="mt-1 text-sm text-gray-400">¡Comparte tu pasión local! Crea tu primera experiencia para que los viajeros la descubran.</p>
          <div className="mt-6">
            <button
              onClick={() => onNavigate('create')}
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Crear Experiencia
            </button>
          </div>
        </div>
      )}
      
      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Confirmar Eliminación</h3>
            <p className="text-gray-300 mb-6">
              ¿Estás seguro de que quieres eliminar la experiencia "{experienceToDelete?.title}"? 
              Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
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

export default MyExperiences;