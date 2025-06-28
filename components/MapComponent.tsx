import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Experience } from '../types';

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
    const [position, setPosition] = useState<L.LatLng | null>(null);
    const initialPosition: L.LatLngExpression = [40.4168, -3.7038]; // Madrid como posición por defecto

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
                    <Popup>
                        <div className="text-gray-900">
                            <h3 className="font-bold text-lg">{exp.title}</h3>
                            <p className="my-1">{exp.location}</p>
                            <p className="font-semibold">${exp.price}</p>
                            <button 
                                onClick={() => onViewExperience(exp)} 
                                className="mt-2 w-full text-center bg-teal-600 text-white font-semibold py-1 px-3 rounded-lg hover:bg-teal-700 transition-colors duration-200"
                            >
                                Ver Detalles
                            </button>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
};

export default MapComponent;