import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, DollarSign, MessageCircle, Check, X, User, Mail, Phone } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getHostBookings, updateBookingStatus, sendBookingMessage, getBookingMessages } from '../services/firestoreService';
import { Booking, BookingStatus, BookingMessage } from '../types';

const HostBookings: React.FC = () => {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messages, setMessages] = useState<BookingMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [processingAction, setProcessingAction] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      loadBookings();
    }
  }, [currentUser]);

  const loadBookings = async () => {
    if (!currentUser) {
      console.log('❌ No hay usuario autenticado');
      return;
    }
    
    try {
      console.log('🔄 Cargando reservas para host:', currentUser.id);
      setLoading(true);
      setError(null);
      const hostBookings = await getHostBookings(currentUser.id);
      console.log('✅ Reservas cargadas:', hostBookings.length);
      setBookings(hostBookings);
    } catch (err) {
      console.error('❌ Error loading bookings:', err);
      setError('No se pudieron cargar las reservas. Error: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingAction = async (bookingId: string, status: BookingStatus, response?: string) => {
    try {
      setProcessingAction(bookingId);
      await updateBookingStatus(bookingId, status, response);
      
      setBookings(bookings.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status, hostResponse: response }
          : booking
      ));
      
      setResponseMessage('');
    } catch (err) {
      console.error('Error updating booking:', err);
      setError('No se pudo actualizar la reserva');
    } finally {
      setProcessingAction(null);
    }
  };

  const loadMessages = async (bookingId: string) => {
    try {
      const bookingMessages = await getBookingMessages(bookingId);
      setMessages(bookingMessages);
    } catch (err) {
      console.error('Error loading messages:', err);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedBooking || !newMessage.trim() || !currentUser) return;
    
    // Validaciones de limitación
    const messageText = newMessage.trim();
    
    // Límite de longitud del mensaje (500 caracteres)
    if (messageText.length > 500) {
      alert('El mensaje no puede exceder 500 caracteres.');
      return;
    }
    
    // Verificar cooldown (30 segundos entre mensajes)
    const now = Date.now();
    const lastMessageTime = localStorage.getItem(`lastMessage_${currentUser.id}_${selectedBooking.id}`);
    if (lastMessageTime && (now - parseInt(lastMessageTime)) < 30000) {
      const remainingTime = Math.ceil((30000 - (now - parseInt(lastMessageTime))) / 1000);
      alert(`Debes esperar ${remainingTime} segundos antes de enviar otro mensaje.`);
      return;
    }
    
    // Verificar límite diario (10 mensajes por día por reserva)
    const today = new Date().toDateString();
    const dailyCountKey = `dailyMessages_${currentUser.id}_${selectedBooking.id}_${today}`;
    const dailyCount = parseInt(localStorage.getItem(dailyCountKey) || '0');
    if (dailyCount >= 10) {
      alert('Has alcanzado el límite de 10 mensajes por día para esta reserva.');
      return;
    }
    
    try {
      setSendingMessage(true);
      await sendBookingMessage({
        bookingId: selectedBooking.id,
        senderId: currentUser.id,
        senderName: currentUser.name || 'Anfitrión',
        message: messageText,
        isFromHost: true
      });
      
      // Actualizar contadores
      localStorage.setItem(`lastMessage_${currentUser.id}_${selectedBooking.id}`, now.toString());
      localStorage.setItem(dailyCountKey, (dailyCount + 1).toString());
      
      setNewMessage('');
      await loadMessages(selectedBooking.id);
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Error al enviar el mensaje. Por favor, inténtalo de nuevo.');
    } finally {
      setSendingMessage(false);
    }
  };

  const openMessageModal = async (booking: Booking) => {
    setSelectedBooking(booking);
    await loadMessages(booking.id);
    setShowMessageModal(true);
  };

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case BookingStatus.CONFIRMED:
        return 'bg-green-100 text-green-800';
      case BookingStatus.REJECTED:
        return 'bg-red-100 text-red-800';
      case BookingStatus.CANCELLED:
        return 'bg-gray-100 text-gray-800';
      case BookingStatus.COMPLETED:
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.PENDING:
        return 'Pendiente';
      case BookingStatus.CONFIRMED:
        return 'Confirmada';
      case BookingStatus.REJECTED:
        return 'Rechazada';
      case BookingStatus.CANCELLED:
        return 'Cancelada';
      case BookingStatus.COMPLETED:
        return 'Completada';
      default:
        return status;
    }
  };

  const pendingBookings = bookings.filter(b => b.status === BookingStatus.PENDING);
  const confirmedBookings = bookings.filter(b => b.status === BookingStatus.CONFIRMED);
  const otherBookings = bookings.filter(b => b.status !== BookingStatus.PENDING && b.status !== BookingStatus.CONFIRMED);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={loadBookings}
          className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const BookingCard: React.FC<{ booking: Booking; showActions?: boolean }> = ({ booking, showActions = false }) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="md:flex">
        <div className="md:w-1/3">
          <img 
            src={booking.experienceImageUrl} 
            alt={booking.experienceTitle}
            className="w-full h-48 md:h-full object-cover"
          />
        </div>
        <div className="md:w-2/3 p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-semibold text-gray-900">
              {booking.experienceTitle}
            </h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
              {getStatusText(booking.status)}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center text-gray-600">
              <Calendar className="w-4 h-4 mr-2" />
              <span>{new Date(booking.date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Clock className="w-4 h-4 mr-2" />
              <span>{booking.time}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Users className="w-4 h-4 mr-2" />
              <span>{booking.participants} participantes</span>
            </div>
            <div className="flex items-center text-gray-600">
              <DollarSign className="w-4 h-4 mr-2" />
              <span>${booking.totalPrice}</span>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
              <User className="w-4 h-4 mr-2" />
              Información del Cliente
            </h4>
            <p className="text-gray-700"><strong>Nombre:</strong> {booking.guestName}</p>
            <p className="text-gray-700"><strong>Email:</strong> {booking.guestEmail}</p>
            {booking.message && (
              <p className="text-gray-700 mt-2"><strong>Mensaje:</strong> {booking.message}</p>
            )}
          </div>
          
          {booking.hostResponse && (
            <div className="bg-teal-50 p-3 rounded-lg mb-4">
              <p className="text-sm text-teal-700">
                <strong>Tu respuesta:</strong> {booking.hostResponse}
              </p>
            </div>
          )}
          
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => openMessageModal(booking)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Mensajes
            </button>
            
            {showActions && booking.status === BookingStatus.PENDING && (
              <>
                <button
                  onClick={() => handleBookingAction(booking.id, BookingStatus.CONFIRMED, responseMessage)}
                  disabled={processingAction === booking.id}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <Check className="w-4 h-4 mr-2" />
                  {processingAction === booking.id ? 'Procesando...' : 'Confirmar'}
                </button>
                <button
                  onClick={() => handleBookingAction(booking.id, BookingStatus.REJECTED, responseMessage)}
                  disabled={processingAction === booking.id}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  <X className="w-4 h-4 mr-2" />
                  {processingAction === booking.id ? 'Procesando...' : 'Rechazar'}
                </button>
              </>
            )}
          </div>
          
          {showActions && booking.status === BookingStatus.PENDING && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mensaje de respuesta (opcional)
              </label>
              <textarea
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                placeholder="Añade un mensaje personalizado para el cliente..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                rows={3}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Gestión de Reservas</h1>
      
      {bookings.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No tienes reservas</h3>
          <p className="text-gray-600">Cuando recibas reservas, aparecerán aquí.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Reservas pendientes */}
          {pendingBookings.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                Reservas Pendientes ({pendingBookings.length})
              </h2>
              <div className="space-y-6">
                {pendingBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} showActions={true} />
                ))}
              </div>
            </section>
          )}
          
          {/* Reservas confirmadas */}
          {confirmedBookings.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                Reservas Confirmadas ({confirmedBookings.length})
              </h2>
              <div className="space-y-6">
                {confirmedBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            </section>
          )}
          
          {/* Otras reservas */}
          {otherBookings.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <div className="w-3 h-3 bg-gray-500 rounded-full mr-3"></div>
                Historial ({otherBookings.length})
              </h2>
              <div className="space-y-6">
                {otherBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
      
      {/* Modal de mensajes */}
      {showMessageModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-[1000] flex items-center justify-center">
          <div className="bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col border border-gray-700">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">Mensajes - {selectedBooking.experienceTitle}</h3>
              <button
                onClick={() => setShowMessageModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 bg-gray-900">
              {messages.length === 0 ? (
                <p className="text-gray-400 text-center">No hay mensajes aún</p>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isFromHost ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.isFromHost
                            ? 'bg-teal-600 text-white'
                            : 'bg-gray-700 text-gray-100 border border-gray-600'
                        }`}
                      >
                        <p className="text-sm font-medium mb-1 text-teal-300">{message.senderName}</p>
                        <p className="text-white">{message.message}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {message.timestamp.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-700 bg-gray-800">
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Escribe un mensaje..."
                    maxLength={500}
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 placeholder-gray-400"
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sendingMessage}
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {sendingMessage ? 'Enviando...' : 'Enviar'}
                  </button>
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>{newMessage.length}/500 caracteres</span>
                  <span>Límite: 10 mensajes por día</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HostBookings;