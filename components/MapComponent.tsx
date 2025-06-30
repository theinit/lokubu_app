import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Experience } from '../types';
import { MapPin, Star, DollarSign, Users } from 'lucide-react';

// Fix for default icon issue with webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface MapComponentProps {
    experiences: Experience[];
    onViewExperience: (experience: Experience) => void;
}

const MapResizer: React.FC = () => {
    const map = useMap();
    
    useEffect(() => {
        // Forzar invalidateSize después del montaje para corregir problemas de renderizado
        const timer = setTimeout(() => {
            map.invalidateSize();
        }, 100);
        
        // También invalidar en resize de ventana
        const handleResize = () => {
            map.invalidateSize();
        };
        
        window.addEventListener('resize', handleResize);
        
        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', handleResize);
        };
    }, [map]);
    
    return null;
};

const LocationMarker: React.FC<{ setPosition: (pos: L.LatLng) => void }> = ({ setPosition }) => {
    const map = useMap();
    
    useEffect(() => {
        let isLocationFound = false;
        
        const onLocationFound = (e: L.LocationEvent) => {
            if (!isLocationFound) {
                isLocationFound = true;
                setPosition(e.latlng);
                // Usar setView en lugar de flyTo para un posicionamiento más preciso
                map.setView(e.latlng, 13);
                // Invalidar tamaño después de cambiar la vista
                setTimeout(() => map.invalidateSize(), 100);
            }
        };
        
        const onLocationError = () => {
            console.log('No se pudo obtener la ubicación del usuario');
        };
        
        // Configurar opciones de geolocalización
        map.locate({ 
            setView: false, // No permitir que locate() cambie la vista automáticamente
            maxZoom: 13,
            timeout: 10000,
            enableHighAccuracy: true
        });
        
        map.on('locationfound', onLocationFound);
        map.on('locationerror', onLocationError);
        
        // Cleanup
        return () => {
            map.off('locationfound', onLocationFound);
            map.off('locationerror', onLocationError);
        };
    }, [map, setPosition]);
    
    return null;
};

const MapComponent: React.FC<MapComponentProps> = ({ experiences, onViewExperience }) => {
    const initialPosition: L.LatLngExpression = [40.4168, -3.7038]; // Madrid como posición por defecto
    
    const setPosition = (pos: L.LatLng) => {
        // Función para manejar la posición del usuario
        console.log('User position:', pos);
    };

    return (
        <MapContainer 
            center={initialPosition} 
            zoom={6} 
            style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }} 
            scrollWheelZoom={true}
            zoomControl={true}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapResizer />
            <LocationMarker setPosition={setPosition} />
            {experiences.map(exp => (
                <Marker key={exp.id} position={[exp.latitude, exp.longitude]}>
                    <Popup maxWidth={280} className="custom-popup">
                        <div className="bg-white rounded-lg shadow-lg overflow-hidden min-w-[260px] w-[260px]">
                            {/* Contenido */}
                            <div className="p-3">
                                <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-2">{exp.title}</h3>
                                
                                <div className="flex items-center gap-1 text-gray-600 mb-2">
                                    <MapPin className="w-3 h-3" />
                                    <span className="text-sm truncate">{exp.location}</span>
                                </div>
                                
                                <div className="flex items-center gap-4 mb-3">
                                    <div className="flex items-center gap-1">
                                        <DollarSign className="w-4 h-4 text-green-600" />
                                        <span className="font-bold text-lg text-green-600">{exp.price}</span>
                                        <span className="text-xs text-gray-500">por persona</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-gray-500">
                                        <Users className="w-3 h-3" />
                                        <span className="text-xs">{exp.maxAttendees || 8} max</span>
                                    </div>
                                </div>
                                
                                {/* Categoría */}
                                <div className="mb-3">
                                    <span className="inline-block bg-teal-100 text-teal-800 text-xs font-medium px-2 py-1 rounded-full">
                                        {exp.category}
                                    </span>
                                </div>
                                
                                {/* Host info */}
                                <div className="flex items-center gap-2 mb-3 p-2 bg-gray-50 rounded-lg">
                                    <img 
                                        src={exp.host.avatarUrl} 
                                        alt={exp.host.name}
                                        className="w-8 h-8 rounded-full object-cover"
                                    />
                                    <div>
                                        <p className="text-xs font-medium text-gray-900">Anfitrión: {exp.host.name}</p>
                                        <div className="flex items-center gap-1">
                                            <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                            <span className="text-xs text-gray-600">{exp.host.rating || '4.8'}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <button 
                                    onClick={() => onViewExperience(exp)} 
                                    className="w-full bg-gradient-to-r from-teal-600 to-teal-700 text-white font-semibold py-2 px-4 rounded-lg hover:from-teal-700 hover:to-teal-800 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                                >
                                    Ver Detalles
                                </button>
                            </div>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
};

export default MapComponent;