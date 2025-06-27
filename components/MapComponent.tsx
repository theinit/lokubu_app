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

const LocationMarker: React.FC<{ setPosition: (pos: L.LatLng) => void }> = ({ setPosition }) => {
    const map = useMap();
    useEffect(() => {
        map.locate().on("locationfound", function (e) {
            setPosition(e.latlng);
            map.flyTo(e.latlng, 13);
        });
    }, [map, setPosition]);
    return null;
};

const MapComponent: React.FC<MapComponentProps> = ({ experiences, onViewExperience }) => {
    const [position, setPosition] = useState<L.LatLng | null>(null);
    const initialPosition: L.LatLngExpression = [51.505, -0.09]; // Default position

    return (
        <MapContainer center={position || initialPosition} zoom={position ? 13 : 5} style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }} scrollWheelZoom={true}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
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