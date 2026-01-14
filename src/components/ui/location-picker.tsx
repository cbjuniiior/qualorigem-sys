import { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from '@phosphor-icons/react';

// Fix for default marker icons in Leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

interface LocationPickerProps {
  value?: { lat: number; lng: number } | null;
  onChange: (coords: { lat: number; lng: number }) => void;
  primaryColor?: string;
}

export const LocationPicker = ({ value, onChange, primaryColor = '#16a34a' }: LocationPickerProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const defaultCenter: [number, number] = [-23.5505, -46.6333]; // São Paulo

  const hasValidValue = value && !isNaN(Number(value.lat)) && !isNaN(Number(value.lng));
  const center: [number, number] = hasValidValue ? [Number(value!.lat), Number(value!.lng)] : defaultCenter;

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Fix icon issue
    const DefaultIcon = L.icon({
      iconUrl: markerIcon,
      shadowUrl: markerShadow,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
    });
    L.Marker.prototype.options.icon = DefaultIcon;

    const map = L.map(mapContainerRef.current).setView(center, hasValidValue ? 15 : 4);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    map.on('click', (e: L.LeafletMouseEvent) => {
      onChange({ lat: e.latlng.lat, lng: e.latlng.lng });
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update marker and view when value changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (hasValidValue) {
      const pos = L.latLng(value.lat, value.lng);
      
      if (markerRef.current) {
        markerRef.current.setLatLng(pos);
      } else {
        markerRef.current = L.marker(pos).addTo(mapInstanceRef.current);
      }
      
      if (pos && !isNaN(pos.lat) && !isNaN(pos.lng)) {
      mapInstanceRef.current.setView(pos, mapInstanceRef.current.getZoom());
    }
    } else {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
    }
  }, [value, hasValidValue]);

  return (
    <div className="space-y-4">
      <div 
        ref={mapContainerRef} 
        className="h-[300px] w-full rounded-2xl overflow-hidden border border-slate-200 shadow-inner z-0 bg-slate-100"
      />
      
      <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 shadow-sm">
        <div 
          className="p-2 rounded-lg bg-white shadow-sm border border-slate-100"
          style={{ color: primaryColor }}
        >
          <MapPin size={20} weight="fill" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Coordenadas Selecionadas</p>
          <p className="text-xs font-mono font-bold text-slate-700">
            {hasValidValue ? `${value.lat.toFixed(6)}, ${value.lng.toFixed(6)}` : "Clique no mapa para selecionar o local"}
          </p>
        </div>
      </div>
    </div>
  );
};
