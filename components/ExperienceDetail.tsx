import React, { useState } from 'react';
import { Experience } from '../types';
import { useAuth } from '../contexts/AuthContext';
import Calendar from './Calendar';

interface ExperienceDetailProps {
  experience: Experience;
  onBack: () => void;
}

const StarIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const ClockIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
);


const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} minutos`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) return `${hours} hora${hours > 1 ? 's' : ''}`;
    return `${hours}h ${mins}min`;
}

const ExperienceDetail: React.FC<ExperienceDetailProps> = ({ experience, onBack }) => {
  const { currentUser } = useAuth();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [bookingMessage, setBookingMessage] = useState<string | null>(null);

  const handleDateSelection = (dates: string[]) => {
      const newDate = dates[0] || null;
      setSelectedDate(newDate);
      setSelectedTime(null); // Reset time when date changes
  };

  const handleBooking = () => {
      if(!selectedDate || !selectedTime) {
          setBookingMessage("Por favor, selecciona primero una fecha y hora disponibles.");
          return;
      }
      
      // Check if experience is at capacity
      if (experience.currentAttendees >= experience.maxAttendees) {
          setBookingMessage("Lo sentimos, esta experiencia ya está completa. No hay plazas disponibles.");
          setTimeout(() => setBookingMessage(null), 5000);
          return;
      }
      
      // Simulate booking
      setBookingMessage(`¡Reserva confirmada para el ${selectedDate} a las ${selectedTime}! Se ha enviado una confirmación.`);
      setTimeout(() => setBookingMessage(null), 5000);
  }

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <button onClick={onBack} className="mb-6 inline-flex items-center text-sm font-medium text-gray-400 hover:text-white">
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        Volver a Explorar
      </button>

      <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-700">
        <img src={`${experience.imageUrl.replace('/400/300', '/1024/400')}`} alt={experience.title} className="w-full h-64 md:h-96 object-cover" />
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <span className="inline-block bg-teal-900 text-teal-300 text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider mb-2">{experience.category}</span>
              <h1 className="text-4xl font-extrabold text-white mb-2">{experience.title}</h1>
              <p className="text-lg text-gray-400 mb-6">{experience.location}</p>
              <p className="text-gray-300 leading-relaxed">{experience.description}</p>
            </div>

            <div className="md:col-span-1">
              <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-700 sticky top-24">
                 <div className="flex items-center mb-4">
                     <img className="w-16 h-16 rounded-full mr-4 object-cover" src={experience.host.avatarUrl} alt={experience.host.name} />
                     <div>
                        <p className="text-lg font-bold text-gray-100">{experience.host.name}</p>
                        <div className="flex items-center mt-1">
                            <StarIcon className="w-5 h-5 text-yellow-400" />
                            <span className="ml-1 text-gray-300 font-bold">{experience.host.rating.toFixed(1)}</span>
                             <span className="ml-2 text-gray-400 text-sm">Host Rating</span>
                        </div>
                    </div>
                 </div>
                 <div className="flex justify-between items-baseline my-4">
                    <p className="text-4xl font-bold text-white">${experience.price} <span className="text-base font-normal text-gray-400">/ persona</span></p>
                    <div className="flex items-center text-teal-400">
                        <ClockIcon className="w-6 h-6 mr-1" />
                        <span className="font-semibold">{formatDuration(experience.duration)}</span>
                    </div>
                 </div>
                 
                 <div className="bg-gray-700/50 p-3 rounded-lg mb-4">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-300 text-sm">Plazas disponibles:</span>
                        <span className={`font-semibold ${
                            experience.currentAttendees >= experience.maxAttendees 
                                ? 'text-red-400' 
                                : experience.maxAttendees - experience.currentAttendees <= 3 
                                    ? 'text-yellow-400' 
                                    : 'text-green-400'
                        }`}>
                            {experience.maxAttendees - experience.currentAttendees} de {experience.maxAttendees}
                        </span>
                    </div>
                    {experience.currentAttendees >= experience.maxAttendees && (
                        <p className="text-red-400 text-xs mt-1">Experiencia completa</p>
                    )}
                    {experience.maxAttendees - experience.currentAttendees <= 3 && experience.currentAttendees < experience.maxAttendees && (
                        <p className="text-yellow-400 text-xs mt-1">¡Últimas plazas!</p>
                    )}
                 </div>
                
                 {currentUser ? (
                    currentUser.id === experience.host.id ? (
                        <div className="text-center bg-gray-700 p-4 rounded-lg">
                            <p className="text-white font-semibold">No puedes reservar tu propia experiencia.</p>
                            <p className="text-gray-300 text-sm mt-1">Estás viendo esta página como el anfitrión.</p>
                        </div>
                    ) : (
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-2">Reserva tu fecha y hora</h3>
                            <Calendar mode="booking" availableDates={Object.keys(experience.availability)} onSelectionChange={handleDateSelection} />
                            
                            {selectedDate && (
                                <div className="mt-4 animate-fade-in">
                                    <h4 className="text-md font-semibold text-white mb-2">Selecciona una hora:</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {experience.availability[selectedDate] && experience.availability[selectedDate].length > 0 ? (
                                            experience.availability[selectedDate].map(time => (
                                                <button 
                                                    key={time}
                                                    onClick={() => setSelectedTime(time)}
                                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${selectedTime === time ? 'bg-teal-500 text-white shadow-lg' : 'bg-gray-700 text-gray-200 hover:bg-gray-600'}`}
                                                >
                                                    {time}
                                                </button>
                                            ))
                                        ) : (
                                            <p className="text-sm text-gray-400">No hay horas disponibles para este día.</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            <button 
                                onClick={handleBooking} 
                                disabled={!selectedDate || !selectedTime || experience.currentAttendees >= experience.maxAttendees} 
                                className="w-full mt-4 bg-teal-600 text-white font-bold py-3 px-4 rounded-md hover:bg-teal-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                            >
                                {experience.currentAttendees >= experience.maxAttendees ? 'Experiencia Completa' : 'Reservar Ahora'}
                            </button>
                            {bookingMessage && <p className={`mt-3 text-sm text-center ${bookingMessage.includes("confirmada") ? 'text-green-400' : 'text-yellow-400'}`}>{bookingMessage}</p>}
                        </div>
                    )
                 ) : (
                    <div className="text-center bg-gray-700 p-4 rounded-lg">
                        <p className="text-white font-semibold">Inicia sesión para reservar</p>
                        <p className="text-gray-300 text-sm mt-1">Debes tener una cuenta para poder realizar una reserva.</p>
                    </div>
                 )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExperienceDetail;