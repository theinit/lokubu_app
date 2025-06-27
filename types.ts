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

export type AppView = 'home' | 'create' | 'my-experiences' | 'detail' | 'edit' | 'edit-profile';