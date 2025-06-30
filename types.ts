export enum ExperienceCategory {
  ALL = "All Categories",
  GASTRONOMY = "Gastronomy",
  CULTURE = "Culture",
  ADVENTURE = "Adventure",
  NATURE = "Nature",
  HISTORY = "History",
}

export interface Host {
  id: string;
  name: string;
  avatarUrl: string;
  rating: number;
}

export interface Experience {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  location: string;
  latitude: number;
  longitude: number;
  host: Host;
  price: number;
  rating: number;
  category: ExperienceCategory;
  availability: { [date: string]: string[] }; // Map of YYYY-MM-DD -> ['HH:MM', 'HH:MM']
  duration: number; // Duration in minutes
  maxAttendees: number; // Número máximo de asistentes
  currentAttendees: number; // Número actual de asistentes registrados
  meetingPoint: string; // Lugar de encuentro (privado del anfitrión)
  // Campos para ubicación normalizada
  placeId?: string; // Google Places ID para normalización
  normalizedLocation?: {
    name: string;
    formattedAddress: string;
    city?: string;
    country?: string;
  };
}

export interface AITravelActivity {
  name: string;
  description: string;
}

export interface AITravelDay {
  day: number;
  title: string;
  description: string;
  activities: AITravelActivity[];
}

export interface AITravelPlan {
  title: string;
  itinerary: AITravelDay[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  lastName?: string;
  hobbies?: string[];
  age?: number;
  photoURL?: string;
}

export type AppView = 'main' | 'create' | 'my-experiences' | 'detail' | 'edit' | 'edit-profile' | 'bookings' | 'host-bookings';

export enum BookingStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  REJECTED = "rejected",
  CANCELLED = "cancelled",
  COMPLETED = "completed"
}

export interface Booking {
  id: string;
  experienceId: string;
  experienceTitle: string;
  experienceImageUrl: string;
  hostId: string;
  hostName: string;
  guestId: string;
  guestName: string;
  guestEmail: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  participants: number;
  totalPrice: number;
  status: BookingStatus;
  createdAt: Date;
  updatedAt: Date;
  message?: string; // Mensaje del huésped al hacer la reserva
  hostResponse?: string; // Respuesta del anfitrión
}

export interface BookingMessage {
  id: string;
  bookingId: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: Date;
  isFromHost: boolean;
}