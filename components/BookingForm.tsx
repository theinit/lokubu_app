import React, { useState } from 'react';
import { Calendar, Clock, Users, DollarSign, MessageCircle, X, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { createBooking } from '../services/firestoreService';
import { Experience, BookingStatus } from '../types';

interface BookingFormProps {
  experience: Experience;
  selectedDate?: string;
  selectedTime?: string;
  onClose: () => void;
  onBookingCreated: () => void;
}

const BookingForm: React.FC<BookingFormProps> = ({ experience, selectedDate = '', selectedTime = '', onClose, onBookingCreated }) => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    date: selectedDate,
    time: selectedTime,
    participants: 1,
    specialRequests: '',
    guestPhone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      setError('Debes iniciar sesión para hacer una reserva');
      return;
    }

    if (!formData.date || !formData.time) {
      setError('Por favor, selecciona fecha y hora');
      return;
    }

    if (formData.participants > experience.maxAttendees) {
      setError(`El número máximo de participantes es ${experience.maxAttendees}`);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const totalPrice = experience.price * formData.participants;
      
      await createBooking({
        experienceId: experience.id,
        experienceTitle: experience.title,
        experienceImageUrl: experience.imageUrl,
        hostId: experience.host.id,
        hostName: experience.host.name,
        guestId: currentUser.id,
        guestName: currentUser.name || 'Usuario',
        guestEmail: currentUser.email || '',
        date: formData.date,
        time: formData.time,
        participants: formData.participants,
        totalPrice,
        message: formData.specialRequests,
        status: BookingStatus.PENDING
      });
      
      onBookingCreated();
      onClose();
    } catch (err) {
      console.error('Error creating booking:', err);
      setError('No se pudo crear la reserva. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const totalPrice = experience.price * formData.participants;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-[1000] flex items-center justify-center">
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-gray-700">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-semibold text-white">Reservar Experiencia</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6">
          {/* Información de la experiencia */}
          <div className="mb-6">
            <div className="flex gap-4">
              <img 
                src={experience.imageUrl} 
                alt={experience.title}
                className="w-24 h-24 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white mb-2">{experience.title}</h3>
                <p className="text-gray-300 mb-2">{experience.description}</p>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    Máx. {experience.maxAttendees} personas
                  </span>
                  <span className="flex items-center">
                    <DollarSign className="w-4 h-4 mr-1" />
                    ${experience.price} por persona
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {error && (
            <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-lg flex items-center">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
              <span className="text-red-300">{error}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Fecha y hora */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Fecha
                </label>
                <input
                  type="date"
                  value={formData.date}
                  readOnly
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-300 rounded-lg cursor-not-allowed"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Hora
                </label>
                <input
                  type="time"
                  value={formData.time}
                  readOnly
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-300 rounded-lg cursor-not-allowed"
                  required
                />
              </div>
            </div>
            
            {/* Número de participantes */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Users className="w-4 h-4 inline mr-1" />
                Número de participantes
              </label>
              <select
                value={formData.participants}
                onChange={(e) => setFormData({ ...formData, participants: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-teal-500 focus:border-teal-500"
                required
              >
                {Array.from({ length: experience.maxAttendees }, (_, i) => i + 1).map(num => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? 'persona' : 'personas'}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Teléfono de contacto */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Teléfono de contacto (opcional)
              </label>
              <input
                type="tel"
                value={formData.guestPhone}
                onChange={(e) => setFormData({ ...formData, guestPhone: e.target.value })}
                placeholder="Ej: +34 123 456 789"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-teal-500 focus:border-teal-500 placeholder-gray-400"
              />
            </div>
            
            {/* Solicitudes especiales */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <MessageCircle className="w-4 h-4 inline mr-1" />
                Solicitudes especiales (opcional)
              </label>
              <textarea
                value={formData.specialRequests}
                onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                placeholder="Alergias, preferencias dietéticas, necesidades especiales, etc."
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-teal-500 focus:border-teal-500 placeholder-gray-400"
                rows={3}
              />
            </div>
            
            {/* Resumen del precio */}
            <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-300">Precio por persona:</span>
                <span className="font-medium text-white">${experience.price}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-300">Participantes:</span>
                <span className="font-medium text-white">{formData.participants}</span>
              </div>
              <hr className="my-2 border-gray-600" />
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-white">Total:</span>
                <span className="text-lg font-semibold text-teal-400">${totalPrice}</span>
              </div>
            </div>
            
            {/* Información adicional */}
            <div className="bg-teal-900/30 p-4 rounded-lg border border-teal-700">
              <h4 className="font-medium text-teal-300 mb-2">Información importante:</h4>
              <ul className="text-sm text-teal-200 space-y-1">
                <li>• Tu reserva estará pendiente hasta que el anfitrión la confirme</li>
                <li>• Recibirás una notificación cuando el anfitrión responda</li>
                <li>• Puedes cancelar tu reserva desde "Mis Reservas"</li>
                <li>• El pago se realizará una vez confirmada la reserva</li>
              </ul>
            </div>
            
            {/* Botones */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Creando reserva...' : 'Confirmar Reserva'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;