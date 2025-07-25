import { MapContainer, TileLayer, Marker, Polyline, useMap, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Corrige el problema del ícono por defecto de Leaflet con Vite/Astro
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Componente para ajustar la vista del mapa automáticamente
function ChangeView({ bounds }) {
  const map = useMap();
  if (bounds) {
    map.fitBounds(bounds, { padding: [50, 50] });
  }
  return null;
}

export default function MapaEmergencias({ simulacion }) {
  const posicionDefault = [-34.6037, -58.3816]; // Centro de Buenos Aires

  const bounds = simulacion ? L.latLngBounds(simulacion.origen, simulacion.destino) : null;

  return (
    <MapContainer center={posicionDefault} zoom={11} style={{ height: "100%", width: "100%", borderRadius: "8px" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {simulacion && (
        <>
          {/* Marcador para el origen de la emergencia */}
          <Marker position={simulacion.origen}>
            <Popup><b>Emergencia:</b><br/>{simulacion.direccionNormalizada}</Popup>
          </Marker>
          {/* Marcador para el hospital de destino */}
          <Marker position={simulacion.destino}>
            <Popup><b>Destino:</b><br/>{simulacion.centro}</Popup>
          </Marker>
          {/* Línea que dibuja la ruta */}
          <Polyline positions={simulacion.ruta} color="blue" />
          {/* Componente para centrar el mapa en la ruta */}
          <ChangeView bounds={bounds} />

          <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 1000, background: 'white', color: '#333', padding: '10px', borderRadius: '5px', boxShadow: '0 0 10px rgba(0,0,0,0.5)' }}>
            <h4 style={{margin: '0 0 5px 0'}}>Resumen de la Ruta</h4>
            <p style={{margin: '2px 0'}}><strong>Distancia:</strong> {(simulacion.distancia / 1000).toFixed(2)} km</p>
            <p style={{margin: '2px 0'}}><strong>Duración:</strong> {Math.round(simulacion.duracion / 60)} min</p>
          </div>
        </>
      )}
    </MapContainer>
  );
}


