import React, { useState } from 'react';
import { ExperienceCategory, Experience } from '../types';
import Calendar from './Calendar';

type ExperienceData = Omit<Experience, 'id' | 'host' | 'rating' | 'imageUrl'>;

interface CreateExperienceProps {
  onSubmit: (data: ExperienceData) => void;
  onBack: () => void;
}

const TimeSlotManager: React.FC<{
  date: string;
  times: string[];
  onTimeAdd: (date: string, time: string) => void;
  onTimeRemove: (date: string, time: string) => void;
}> = ({ date, times, onTimeAdd, onTimeRemove }) => {
    const [newTime, setNewTime] = useState('');
    
    const handleAddClick = () => {
        if (newTime) {
            onTimeAdd(date, newTime);
            setNewTime('');
        }
    };

    return (
        <div className="p-3 bg-gray-700 rounded-md border border-gray-600">
            <p className="font-semibold text-white">{new Date(date + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <div className="flex items-center gap-2 mt-2">
                <input 
                    type="time" 
                    value={newTime} 
                    onChange={e => setNewTime(e.target.value)} 
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 text-white rounded-md focus:ring-teal-500 focus:border-teal-500"
                />
                <button type="button" onClick={handleAddClick} className="px-4 py-2 bg-teal-600 text-white font-semibold rounded-md hover:bg-teal-700 transition-colors">Añadir</button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
                {times.length === 0 ? (
                    <p className="text-xs text-gray-400">No hay horarios para este día.</p>
                ) : (
                    times.map(time => (
                        <span key={time} className="bg-teal-500 text-white text-sm font-medium pl-3 pr-2 py-1 rounded-full flex items-center">
                            {time}
                            <button type="button" onClick={() => onTimeRemove(date, time)} className="ml-2 text-teal-100 hover:text-white text-lg leading-none">&times;</button>
                        </span>
                    ))
                )}
            </div>
        </div>
    );
};

const CreateExperience: React.FC<CreateExperienceProps> = ({ onSubmit, onBack }) => {
  const [formData, setFormData] = useState<ExperienceData>({
    title: '',
    description: '',
    location: '',
    latitude: 0,
    longitude: 0,
    price: 0,
    category: ExperienceCategory.CULTURE,
    duration: 60,
    availability: {},
  });
  const [selectedDates, setSelectedDates] = useState<string[]>([]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: (type === 'number') ? parseFloat(value) || 0 : value,
    }));
  };
  
  const handleDatesChange = (newlySelectedDates: string[]) => {
      const sortedDates = newlySelectedDates.sort();
      setSelectedDates(sortedDates);
      
      setFormData(prev => {
          const newAvailability = { ...prev.availability };
          
          Object.keys(newAvailability).forEach(date => {
              if (!sortedDates.includes(date)) {
                  delete newAvailability[date];
              }
          });
          
          sortedDates.forEach(date => {
              if (!newAvailability[date]) {
                  newAvailability[date] = [];
              }
          });

          return { ...prev, availability: newAvailability };
      });
  };

  const handleTimeAdd = (date: string, time: string) => {
    if (!time) return;
    setFormData(prev => {
        const newAvailability = { ...prev.availability };
        const timesForDate = newAvailability[date] || [];
        if (!timesForDate.includes(time)) {
            newAvailability[date] = [...timesForDate, time].sort();
        }
        return { ...prev, availability: newAvailability };
    });
  };

  const handleTimeRemove = (date: string, timeToRemove: string) => {
      setFormData(prev => {
          const newAvailability = { ...prev.availability };
          const timesForDate = newAvailability[date] || [];
          newAvailability[date] = timesForDate.filter(t => t !== timeToRemove);
          return { ...prev, availability: newAvailability };
      });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const hasAtLeastOneSlot = Object.values(formData.availability).some(times => times.length > 0);

    if (!formData.title || !formData.description || !formData.location || formData.price <= 0 || !hasAtLeastOneSlot) {
      alert('Por favor, rellena todos los campos obligatorios y añade al menos un horario en un día disponible.');
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
       <button onClick={onBack} className="mb-6 inline-flex items-center text-sm font-medium text-gray-400 hover:text-white">
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        Volver a Mis Experiencias
      </button>
      
      <div className="bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-700">
        <h2 className="text-3xl font-bold text-white mb-2">Crea una Nueva Experiencia</h2>
        <p className="text-gray-300 mb-8">Comparte tu pasión y conocimiento local con viajeros de todo el mundo.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-300">Título de la Experiencia</label>
              <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} required className="mt-1 block w-full bg-gray-700 border border-gray-600 text-white rounded-md shadow-sm py-2 px-3 focus:ring-teal-500 focus:border-teal-500" />
            </div>
             <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-300">Ubicación (Ciudad, País)</label>
              <input type="text" name="location" id="location" value={formData.location} onChange={handleChange} required placeholder="Ej: Barcelona, Spain" className="mt-1 block w-full bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-md shadow-sm py-2 px-3 focus:ring-teal-500 focus:border-teal-500" />
            </div>
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300">Descripción</label>
            <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows={4} required className="mt-1 block w-full bg-gray-700 border border-gray-600 text-white rounded-md shadow-sm py-2 px-3 focus:ring-teal-500 focus:border-teal-500"></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <label htmlFor="category" className="block text-sm font-medium text-gray-300">Categoría</label>
              <select name="category" id="category" value={formData.category} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border border-gray-600 text-white rounded-md shadow-sm py-2 px-3 focus:ring-teal-500 focus:border-teal-500">
                {Object.values(ExperienceCategory).filter(c => c !== ExperienceCategory.ALL).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
             <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-300">Precio por persona ($)</label>
              <input type="number" name="price" id="price" value={formData.price} onChange={handleChange} required min="0" className="mt-1 block w-full bg-gray-700 border border-gray-600 text-white rounded-md shadow-sm py-2 px-3 focus:ring-teal-500 focus:border-teal-500" />
            </div>
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-300">Duración (minutos)</label>
              <input type="number" name="duration" id="duration" value={formData.duration} onChange={handleChange} required min="1" className="mt-1 block w-full bg-gray-700 border border-gray-600 text-white rounded-md shadow-sm py-2 px-3 focus:ring-teal-500 focus:border-teal-500" />
            </div>
          </div>
          
          <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
             <h4 className="text-lg font-semibold text-gray-100 mb-2">Geolocalización</h4>
             <p className="text-sm text-gray-400 mb-4">Proporciona las coordenadas para que tu experiencia aparezca en el mapa. Puedes usar Google Maps para encontrar la latitud y longitud.</p>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="latitude" className="block text-sm font-medium text-gray-300">Latitud</label>
                  <input type="number" step="any" name="latitude" id="latitude" value={formData.latitude} onChange={handleChange} required className="mt-1 block w-full bg-gray-700 border border-gray-600 text-white rounded-md shadow-sm py-2 px-3 focus:ring-teal-500 focus:border-teal-500" />
                </div>
                <div>
                  <label htmlFor="longitude" className="block text-sm font-medium text-gray-300">Longitud</label>
                  <input type="number" step="any" name="longitude" id="longitude" value={formData.longitude} onChange={handleChange} required className="mt-1 block w-full bg-gray-700 border border-gray-600 text-white rounded-md shadow-sm py-2 px-3 focus:ring-teal-500 focus:border-teal-500" />
                </div>
             </div>
          </div>

          <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
             <h4 className="text-lg font-semibold text-gray-100 mb-2">Disponibilidad y Horarios</h4>
             <p className="text-sm text-gray-400 mb-4">1. Selecciona los días en el calendario. 2. Añade los horarios para cada día seleccionado.</p>
             <Calendar mode="availability" onSelectionChange={handleDatesChange} initialSelectedDates={selectedDates} />
          </div>

            {selectedDates.length > 0 && (
                <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 space-y-4">
                    <h4 className="text-lg font-semibold text-gray-100">Gestionar Horarios</h4>
                    <p className="text-sm text-gray-400">Añade las horas de inicio disponibles para cada día seleccionado.</p>
                    {selectedDates.map(date => (
                        <TimeSlotManager 
                            key={date} 
                            date={date}
                            times={formData.availability[date] || []}
                            onTimeAdd={handleTimeAdd}
                            onTimeRemove={handleTimeRemove}
                        />
                    ))}
                </div>
            )}

          <div className="text-right">
            <button type="submit" className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
              Crear Experiencia
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateExperience;