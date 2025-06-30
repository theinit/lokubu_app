import React, { useState } from 'react';
import { ExperienceCategory, Experience } from '../types';
import Calendar from './Calendar';
import LocationAutocomplete from './LocationAutocomplete';
import { generateExperienceImage } from '../services/geminiService';
import { NormalizedLocation } from '../services/placesService';

type ExperienceData = Omit<Experience, 'id' | 'host' | 'rating'>;

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
    maxAttendees: 10,
    currentAttendees: 0,
    imageUrl: '',
    meetingPoint: '',
  });
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: (type === 'number') ? parseFloat(value) || 0 : value,
    }));
  };

  const handleLocationChange = (location: string, normalizedData?: NormalizedLocation) => {
    setFormData(prev => ({
      ...prev,
      location,
      latitude: normalizedData?.latitude || 0,
      longitude: normalizedData?.longitude || 0,
      placeId: normalizedData?.placeId,
      normalizedLocation: normalizedData ? {
        name: normalizedData.name,
        formattedAddress: normalizedData.formattedAddress,
        city: normalizedData.city,
        country: normalizedData.country
      } : undefined
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

    if (!formData.title || !formData.description || !formData.location || !formData.meetingPoint || formData.price <= 0 || !hasAtLeastOneSlot) {
      alert('Por favor, rellena todos los campos obligatorios y añade al menos un horario en un día disponible.');
      return;
    }

    try {
      setIsGeneratingImage(true);
      const imageUrl = await generateExperienceImage(formData.title, formData.description, formData.location);
      
      const experienceWithImage = {
        ...formData,
        imageUrl
      };
      
      onSubmit(experienceWithImage);
    } catch (error) {
      console.error('Error generando imagen:', error);
      // Si falla la generación de imagen, usar una imagen por defecto
      const experienceWithImage = {
        ...formData,
        imageUrl: 'https://picsum.photos/400/300?random=default'
      };
      onSubmit(experienceWithImage);
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
              <LocationAutocomplete
                value={formData.location}
                onChange={handleLocationChange}
                placeholder="Ej: Barcelona, Spain"
                className="mt-1"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="meetingPoint" className="block text-sm font-medium text-gray-300">Lugar de Encuentro *</label>
            <input type="text" name="meetingPoint" id="meetingPoint" value={formData.meetingPoint} onChange={handleChange} required placeholder="Ej: Entrada principal del Parque Güell" className="mt-1 block w-full bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-md shadow-sm py-2 px-3 focus:ring-teal-500 focus:border-teal-500" />
            <p className="mt-1 text-xs text-gray-400">Información privada para coordinar el encuentro con los participantes</p>
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <button 
              type="submit" 
              disabled={isGeneratingImage}
              className="inline-flex justify-center items-center py-2 px-6 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
                'Crear Experiencia'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateExperience;