/// <reference path="../types/google-maps.d.ts" />
import { Loader } from '@googlemaps/js-api-loader';

// Configuración del loader de Google Maps
const apiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;

if (!apiKey) {
  console.warn('VITE_GOOGLE_PLACES_API_KEY no está configurada. El autocompletado de ubicaciones no funcionará.');
}

const loader = new Loader({
  apiKey: apiKey || '',
  version: 'weekly',
  libraries: ['places']
});

// Tipos para los resultados de Places
export interface PlaceResult {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
  latitude?: number;
  longitude?: number;
}

export interface NormalizedLocation {
  placeId: string;
  name: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
}

class PlacesService {
  private autocompleteService: google.maps.places.AutocompleteService | null = null;
  private placesService: google.maps.places.PlacesService | null = null;
  private geocoder: google.maps.Geocoder | null = null;
  private isLoaded = false;

  // Inicializar los servicios de Google Places
  async initialize(): Promise<void> {
    if (this.isLoaded) return;

    try {
      await loader.load();
      
      this.autocompleteService = new google.maps.places.AutocompleteService();
      this.geocoder = new google.maps.Geocoder();
      
      // Crear un div temporal para el PlacesService
      const mapDiv = document.createElement('div');
      const map = new google.maps.Map(mapDiv);
      this.placesService = new google.maps.places.PlacesService(map);
      
      this.isLoaded = true;
    } catch (error) {
      console.error('Error loading Google Places API:', error);
      throw new Error('Failed to load Google Places API');
    }
  }

  // Obtener sugerencias de autocompletado
  async getPlacePredictions(input: string): Promise<PlaceResult[]> {
    if (!apiKey) {
      console.warn('Google Places API key no configurada');
      return [];
    }

    try {
      await this.initialize();
    } catch (error) {
      console.error('Error inicializando Google Places API:', error);
      return [];
    }
    
    if (!this.autocompleteService || !input.trim()) {
      return [];
    }

    return new Promise((resolve, reject) => {
      this.autocompleteService!.getPlacePredictions(
        {
          input: input.trim(),
          types: ['(cities)'], // Filtrar solo ciudades
          componentRestrictions: { country: [] } // Sin restricciones de país
        },
        (predictions: any[], status: any) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            const results: PlaceResult[] = predictions.map((prediction: any) => ({
              placeId: prediction.place_id,
              description: prediction.description,
              mainText: prediction.structured_formatting.main_text,
              secondaryText: prediction.structured_formatting.secondary_text || ''
            }));
            resolve(results);
          } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
            resolve([]);
          } else {
            reject(new Error(`Places API error: ${status}`));
          }
        }
      );
    });
  }

  // Obtener detalles completos de un lugar por Place ID
  async getPlaceDetails(placeId: string): Promise<NormalizedLocation | null> {
    await this.initialize();
    
    if (!this.placesService) {
      throw new Error('Places service not initialized');
    }

    return new Promise((resolve, reject) => {
      this.placesService!.getDetails(
        {
          placeId,
          fields: ['place_id', 'name', 'formatted_address', 'geometry', 'address_components']
        },
        (place: any, status: any) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && place) {
            const location = place.geometry?.location;
            if (!location) {
              resolve(null);
              return;
            }

            // Extraer ciudad y país de los componentes de dirección
            let city = '';
            let country = '';
            
            if (place.address_components) {
              for (const component of place.address_components) {
                if (component.types.includes('locality')) {
                  city = component.long_name;
                }
                if (component.types.includes('country')) {
                  country = component.long_name;
                }
              }
            }

            const normalizedLocation: NormalizedLocation = {
              placeId: place.place_id!,
              name: place.name!,
              formattedAddress: place.formatted_address!,
              latitude: location.lat(),
              longitude: location.lng(),
              city: city || undefined,
              country: country || undefined
            };

            resolve(normalizedLocation);
          } else {
            reject(new Error(`Place details error: ${status}`));
          }
        }
      );
    });
  }

  // Normalizar una ubicación de texto libre usando geocoding
  async normalizeLocation(locationText: string): Promise<NormalizedLocation | null> {
    await this.initialize();
    
    if (!this.geocoder || !locationText.trim()) {
      return null;
    }

    return new Promise((resolve, reject) => {
      this.geocoder!.geocode(
        { address: locationText.trim() },
        (results: any[], status: any) => {
          if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
            const result = results[0];
            const location = result.geometry.location;
            
            // Extraer ciudad y país
            let city = '';
            let country = '';
            
            for (const component of result.address_components) {
              if (component.types.includes('locality')) {
                city = component.long_name;
              }
              if (component.types.includes('country')) {
                country = component.long_name;
              }
            }

            const normalizedLocation: NormalizedLocation = {
              placeId: result.place_id,
              name: city || result.formatted_address,
              formattedAddress: result.formatted_address,
              latitude: location.lat(),
              longitude: location.lng(),
              city: city || undefined,
              country: country || undefined
            };

            resolve(normalizedLocation);
          } else if (status === google.maps.GeocoderStatus.ZERO_RESULTS) {
            resolve(null);
          } else {
            reject(new Error(`Geocoding error: ${status}`));
          }
        }
      );
    });
  }

  // Buscar experiencias por ubicación normalizada
  searchByNormalizedLocation(experiences: any[], searchLocation: string): any[] {
    if (!searchLocation.trim()) {
      return experiences;
    }

    const searchTerm = searchLocation.toLowerCase();
    
    return experiences.filter(experience => {
      // Buscar en ubicación original
      const locationMatch = experience.location?.toLowerCase().includes(searchTerm);
      
      // Buscar en ubicación normalizada si existe
      const normalizedLocationMatch = 
        experience.normalizedLocation?.name?.toLowerCase().includes(searchTerm) ||
        experience.normalizedLocation?.city?.toLowerCase().includes(searchTerm) ||
        experience.normalizedLocation?.country?.toLowerCase().includes(searchTerm);
      
      // También buscar en título y descripción como fallback
      const titleMatch = experience.title?.toLowerCase().includes(searchTerm);
      const descriptionMatch = experience.description?.toLowerCase().includes(searchTerm);
      
      return locationMatch || normalizedLocationMatch || titleMatch || descriptionMatch;
    });
  }
}

// Exportar una instancia singleton
export const placesService = new PlacesService();
export default placesService;