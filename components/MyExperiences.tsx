import React, { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Experience, AppView } from '../types';
import ExperienceCard from './ExperienceCard';

interface MyExperiencesProps {
  allExperiences: Experience[];
  onNavigate: (view: AppView) => void;
  onViewExperience: (experience: Experience) => void;
}

const MyExperiences: React.FC<MyExperiencesProps> = ({ allExperiences, onNavigate, onViewExperience }) => {
  const { currentUser } = useAuth();

  const myExperiences = useMemo(() => {
    if (!currentUser) return [];
    return allExperiences.filter(exp => exp.host.id === currentUser.id);
  }, [allExperiences, currentUser]);
  
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
            <ExperienceCard key={exp.id} experience={exp} onViewExperience={onViewExperience} />
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
    </div>
  );
};

export default MyExperiences;