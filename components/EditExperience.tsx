import React, { useState } from 'react';
import { ExperienceCategory, Experience } from '../types';
import Calendar from './Calendar';
import { generateExperienceImage } from '../services/geminiService';

type ExperienceData = Omit<Experience, 'id' | 'host' | 'rating'>;

interface EditExperienceProps {
  experience: Experience;
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
                    onChange={(e) => setNewTime(e.target.value)}
                    className="bg-gray-600 border border-gray-500 text-white rounded px-2 py-1 text-sm"
                />
                <button
                    type="button"
                    onClick={handleAddClick}
                    className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-1 rounded text-sm"
                >
                    Añadir
                </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
                {times.map(time => (
                    <span key={time} className="inline-flex items-center bg-teal-800 text-teal-200 px-2 py-1 rounded text-sm">
                        {time}
                        <button
                            type="button"
                            onClick={() => onTimeRemove(date, time)}
                            className="ml-2 text-teal-300 hover:text-white"
                        >
                            ×
                        </button>
                    </span>
                ))}
            </div>
        </div>
    );
};

const EditExperience: React.FC<EditExperienceProps> = ({ experience, onSubmit, onBack }) => {
  const [formData, setFormData] = useState<ExperienceData>({
    title: experience.title,
    description: experience.description,
    location: experience.location,
    latitude: experience.latitude,
    longitude: experience.longitude,
    price: experience.price,
    category: experience.category,
    duration: experience.duration,
    availability: experience.availability,
    maxAttendees: experience.maxAttendees,
    currentAttendees: experience.currentAttendees,
    imageUrl: experience.imageUrl,
  });
  
  const [selectedDates, setSelectedDates] = useState<string[]>(Object.keys(experience.availability));
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'duration' || name === 'latitude' || name === 'longitude' || name === 'maxAttendees' || name === 'currentAttendees' 
        ? parseFloat(value) || 0 
        : value
    }));
  };

  const handleDatesChange = (dates: string[]) => {
    setSelectedDates(dates);
    setFormData(prev => {
      const newAvailability = { ...prev.availability };
      
      // Remove dates that are no longer selected
      Object.keys(newAvailability).forEach(date => {
        if (!dates.includes(date)) {
          delete newAvailability[date];
        }
      });
      
      // Add new dates with empty time arrays
      dates.forEach(date => {
        if (!newAvailability[date]) {
          newAvailability[date] = [];
        }
      });
      
      return { ...prev, availability: newAvailability };
    });
  };

  const handleTimeAdd = (date: string, time: string) => {
    setFormData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [date]: [...(prev.availability[date] || []), time].sort()
      }
    }));
  };

  const handleTimeRemove = (date: string, time: string) => {
    setFormData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [date]: (prev.availability[date] || []).filter(t => t !== time)
      }
    }));
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('La geolocalización no está soportada por este navegador.');
      return;
    }

    setIsGettingLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData(prev => ({
          ...prev,
          latitude: parseFloat(latitude.toFixed(6)),
          longitude: parseFloat(longitude.toFixed(6))
        }));
        setIsGettingLocation(false);
      },
      (error) => {
        console.error('Error obteniendo la ubicación:', error);
        let errorMessage = 'No se pudo obtener tu ubicación. ';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Permiso denegado. Por favor, permite el acceso a la ubicación en tu navegador.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Información de ubicación no disponible.';
            break;
          case error.TIMEOUT:
            errorMessage += 'La solicitud de ubicación ha expirado.';
            break;
          default:
            errorMessage += 'Error desconocido.';
            break;
        }
        
        alert(errorMessage);
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const hasAtLeastOneSlot = Object.values(formData.availability).some(times => times.length > 0);

    if (!formData.title || !formData.description || !formData.location || formData.price <= 0 || !hasAtLeastOneSlot) {
      alert('Por favor, rellena todos los campos obligatorios y añade al menos un horario en un día disponible.');
      return;
    }
    
    if (formData.currentAttendees > formData.maxAttendees) {
      alert('El número de asistentes actuales no puede ser mayor que el máximo de asistentes.');
      return;
    }
    
    try {
      setIsGeneratingImage(true);
      // Generar nueva imagen si el título, descripción o ubicación han cambiado
      const hasContentChanged = formData.title !== experience.title || 
                                formData.description !== experience.description || 
                                formData.location !== experience.location;
      
      let imageUrl = formData.imageUrl;
      if (hasContentChanged) {
        imageUrl = await generateExperienceImage(formData.title, formData.description, formData.location);
      }
      
      const experienceWithImage = {
        ...formData,
        imageUrl
      };
      
      onSubmit(experienceWithImage);
    } catch (error) {
      console.error('Error generando imagen:', error);
      // Si falla la generación de imagen, mantener la imagen actual
      onSubmit(formData);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
       <button onClick={onBack} className="mb-6 inline-flex items-center text-sm font-medium text-gray-400 hover:text-white">
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        Volver a Mis Experiencias
      </button>
      
      <div className="bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-700">
        <h2 className="text-3xl font-bold text-white mb-2">Editar Experiencia</h2>
        <p className="text-gray-300 mb-8">Actualiza los detalles de tu experiencia.</p>

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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-300">Categoría</label>
              <select name="category" id="category" value={formData.category} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border border-gray-600 text-white rounded-md shadow-sm py-2 px-3 focus:ring-teal-500 focus:border-teal-500">
                {Object.values(ExperienceCategory).filter(c => c !== ExperienceCategory.ALL).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="maxAttendees" className="block text-sm font-medium text-gray-300">Máximo de Asistentes</label>
              <input type="number" name="maxAttendees" id="maxAttendees" value={formData.maxAttendees} onChange={handleChange} required min="1" max="100" className="mt-1 block w-full bg-gray-700 border border-gray-600 text-white rounded-md shadow-sm py-2 px-3 focus:ring-teal-500 focus:border-teal-500" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-300">Precio por persona ($)</label>
              <input type="number" name="price" id="price" value={formData.price} onChange={handleChange} required min="0" className="mt-1 block w-full bg-gray-700 border border-gray-600 text-white rounded-md shadow-sm py-2 px-3 focus:ring-teal-500 focus:border-teal-500" />
            </div>
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-300">Duración (minutos)</label>
              <input type="number" name="duration" id="duration" value={formData.duration} onChange={handleChange} required min="1" className="mt-1 block w-full bg-gray-700 border border-gray-600 text-white rounded-md shadow-sm py-2 px-3 focus:ring-teal-500 focus:border-teal-500" />
            </div>
            <div>
              <label htmlFor="currentAttendees" className="block text-sm font-medium text-gray-300">Asistentes Actuales</label>
              <input type="number" name="currentAttendees" id="currentAttendees" value={formData.currentAttendees} onChange={handleChange} required min="0" max={formData.maxAttendees} className="mt-1 block w-full bg-gray-700 border border-gray-600 text-white rounded-md shadow-sm py-2 px-3 focus:ring-teal-500 focus:border-teal-500" />
            </div>
          </div>
          
          <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
             <h4 className="text-lg font-semibold text-gray-100 mb-2">Geolocalización</h4>
             <p className="text-sm text-gray-400 mb-4">Proporciona las coordenadas para que tu experiencia aparezca en el mapa. Puedes usar Google Maps para encontrar la latitud y longitud, o usar tu ubicación actual.</p>
             
             <div className="mb-4">
               <button
                 type="button"
                 onClick={handleGetCurrentLocation}
                 disabled={isGettingLocation}
                 className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 {isGettingLocation ? (
                   <>
                     <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                     </svg>
                     Obteniendo ubicación...
                   </>
                 ) : (
                   <>
                     <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                     </svg>
                     Usar mi ubicación actual
                   </>
                 )}
               </button>
             </div>
             
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
             
             {selectedDates.length > 0 && (
                <div className="mt-4 space-y-3">
                    <h5 className="text-md font-semibold text-gray-200">Gestionar horarios:</h5>
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
          </div>

          <div className="flex gap-4">
            <button 
              type="submit" 
              disabled={isGeneratingImage}
              className="flex-1 bg-teal-600 text-white font-bold py-3 px-4 rounded-md hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isGeneratingImage ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generando imagen...
                </>
              ) : (
                'Actualizar Experiencia'
              )}
            </button>
            <button type="button" onClick={onBack} className="px-6 py-3 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-700 transition-colors">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditExperience;