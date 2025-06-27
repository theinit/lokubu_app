import React from 'react';
import { Experience } from '../types';

interface MyExperienceCardProps {
  experience: Experience;
  onViewExperience: (experience: Experience) => void;
  onEditExperience: (experience: Experience) => void;
  onDeleteExperience: (experience: Experience) => void;
}

const StarIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const EditIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const DeleteIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const MyExperienceCard: React.FC<MyExperienceCardProps> = ({ 
  experience, 
  onViewExperience, 
  onEditExperience, 
  onDeleteExperience 
}) => {
  const availablePlaces = experience.maxAttendees - experience.currentAttendees;
  const isFullyBooked = availablePlaces === 0;
  const isAlmostFull = availablePlaces <= 3 && !isFullyBooked;

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-700 hover:border-gray-600 transition-all duration-300 group">
      <div className="relative">
        <img 
          src={experience.imageUrl} 
          alt={experience.title} 
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" 
        />
        <div className="absolute top-3 right-3 flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEditExperience(experience);
            }}
            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-colors"
            title="Editar experiencia"
          >
            <EditIcon className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteExperience(experience);
            }}
            className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg transition-colors"
            title="Eliminar experiencia"
          >
            <DeleteIcon className="w-4 h-4" />
          </button>
        </div>
        <span className="absolute top-3 left-3 inline-block bg-teal-900 text-teal-300 text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider">
          {experience.category}
        </span>
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">{experience.title}</h3>
        <p className="text-gray-400 text-sm mb-3">{experience.location}</p>
        
        <div className="flex items-center mb-3">
          <StarIcon className="w-5 h-5 text-yellow-400" />
          <span className="ml-1 text-gray-300 font-semibold">{experience.rating.toFixed(1)}</span>
          <span className="ml-2 text-gray-500 text-sm">({Math.floor(Math.random() * 50) + 10} reseñas)</span>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-400 text-sm">Capacidad:</span>
            <span className={`text-sm font-semibold ${
              isFullyBooked ? 'text-red-400' : isAlmostFull ? 'text-yellow-400' : 'text-green-400'
            }`}>
              {availablePlaces} de {experience.maxAttendees} disponibles
            </span>
          </div>
          {isFullyBooked && (
            <p className="text-red-400 text-xs">Experiencia completa</p>
          )}
          {isAlmostFull && (
            <p className="text-yellow-400 text-xs">¡Últimas plazas!</p>
          )}
        </div>
        
        <div className="flex justify-between items-center">
          <div>
            <span className="text-2xl font-bold text-white">${experience.price}</span>
            <span className="text-gray-400 text-sm"> / persona</span>
          </div>
          <button
            onClick={() => onViewExperience(experience)}
            className="px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-md hover:bg-teal-700 transition-colors"
          >
            Ver Detalles
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyExperienceCard;