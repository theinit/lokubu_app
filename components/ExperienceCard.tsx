import React from 'react';
import { Experience } from '../types';

interface ExperienceCardProps {
  experience: Experience;
  onViewExperience: (experience: Experience) => void;
}

const StarIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const ExperienceCard: React.FC<ExperienceCardProps> = ({ experience, onViewExperience }) => {
  return (
    <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden transform hover:-translate-y-1 transition-all duration-300 ease-in-out group border border-gray-700 flex flex-col">
      <div className="relative">
        <img className="w-full h-56 object-cover" src={experience.imageUrl} alt={experience.title} />
        <div className="absolute top-0 right-0 bg-teal-500 text-white px-3 py-1 m-2 rounded-full text-sm font-semibold">
          ${experience.price}
        </div>
        <div className="absolute bottom-0 left-0 bg-black bg-opacity-60 text-white p-2 w-full">
            <h3 className="text-lg font-bold truncate">{experience.title}</h3>
            <p className="text-sm text-gray-200">{experience.location}</p>
        </div>
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
                 <img className="w-10 h-10 rounded-full mr-3 object-cover" src={experience.host.avatarUrl} alt={experience.host.name} />
                 <div>
                    <p className="text-sm font-medium text-gray-100">{experience.host.name}</p>
                    <p className="text-xs text-gray-400">Host</p>
                </div>
            </div>
            <div className="flex items-center">
              <StarIcon className="w-5 h-5 text-yellow-400" />
              <span className="ml-1 text-gray-300 font-bold">{experience.rating.toFixed(1)}</span>
            </div>
        </div>
        <p className="text-sm text-gray-300 mb-4 h-10 overflow-hidden flex-grow">{experience.description.substring(0, 90)}...</p>
        <button onClick={() => onViewExperience(experience)} className="w-full mt-auto text-center bg-gray-700 text-teal-400 font-semibold py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200">
          View Experience
        </button>
      </div>
    </div>
  );
};

export default ExperienceCard;