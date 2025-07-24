import { useState } from 'react';
import Select from 'react-select';
import MetricasEficiencia from './MetricasEficiencia.jsx';
import { getRutaConMetricas } from '../servicios/ruteo.js';

const municipios = [
  "Ciudad de Buenos Aires",
  "Lanús",
  "Quilmes",
  "San Martín",
  "Tres de Febrero",
  "La Matanza"
];

export default function SimuladorForm({ onCoordenadasSeleccionadas }) {
  const [municipio, setMunicipio] = useState(null);
  const [direccionInput, setDireccionInput] = useState("");
  const [sugerencias, setSugerencias] = useState([]);
  const [resultado, setResultado] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(false);

  const destinoCoords = [-34.607, -58.449]; // Centro médico fijo
  const ORS_API_KEY = "TU_API_KEY_AQUI"; // 🔒 Reemplazar por tu clave

  // 🔍 Buscar sugerencias desde ORS mientras el usuario escribe
  async function buscarSugerencias(texto, partido) {
    if (!texto || !partido) return;

    const query = `${texto}, ${partido}, Buenos Aires, Argentina`;
    const url = `https://api.openrouteservice.org/geocode/autocomplete?api_key=${ORS_API_KEY}&text=${encodeURIComponent(query)}&size=5`;

    try {
      const res = await fetch(url);
      const data = await res.json();

      const opciones = data.features
        .filter(f => f.properties?.confidence >= 0.8)
        .map(f => ({
          label: f.properties.label,
          value: f.geometry.coordinates
        }));

      setSugerencias(opciones);
    } catch (err) {
      console.error("❌ Error en autocompletado:", err.message);
    }
  }

  async function simularEmergencia(coords, label) {
    setLoading(true);
    setResultado(null);

    try {
      const origenCoords = [coords[1], coords[0]]; // [lat, lng]
      const rutaInfo = await getRutaConMetricas(origenCoords, destinoCoords);

      const simulacion = {
        direccion: label,
        distancia_m: rutaInfo.distancia,
        duracion_s: rutaInfo.duracion
      };

      setResultado(simulacion);
      setHistorial(prev => [...prev, simulacion]);

      if (onCoordenadasSeleccionadas) {
        onCoordenadasSeleccionadas({
          origen: origenCoords,
          destino: destinoCoords,
          ruta: rutaInfo.ruta,
          distancia: rutaInfo.distancia,
          duracion: rutaInfo.duracion,
          direccion: label
        });
      }
    } catch (err) {
      console.error("❌ Error en simulación:", err);
      alert("Error al conectar con el backend.");
    }

    setLoading(false);
  }

  return (
    <div>
      {/* 🏙️ Menú desplegable de municipio */}
      <label>Municipio:</label>
      <Select
        options={municipios.map(m => ({ value: m, label: m }))}
        onChange={(opt) => setMunicipio(opt.value)}
        placeholder="Seleccioná municipio"
        styles={{ container: base => ({ ...base, marginBottom: "1rem" }) }}
      />

      {/* ✍️ Campo de dirección + sugerencias */}
      <label>Dirección:</label>
      <input
        type="text"
        value={direccionInput}
        onChange={(e) => {
          setDireccionInput(e.target.value);
          buscarSugerencias(e.target.value, municipio);
        }}
        placeholder="Ej: Av. Córdoba 2350"
        style={{ padding: "0.7rem", width: "100%", marginBottom: "1rem" }}
      />

      <Select
        options={sugerencias}
        onChange={(opt) => simularEmergencia(opt.value, opt.label)}
        placeholder="Seleccioná una dirección sugerida"
        isSearchable={false}
        styles={{ container: base => ({ ...base, marginBottom: "1rem" }) }}
      />

      {loading && <p>🕐 Simulando emergencia...</p>}

      {resultado && (
        <div style={{ marginTop: "1rem", background: "#e3ffe3", padding: "1rem", borderRadius: "8px" }}>
          <h2>🟢 Resultado de simulación</h2>
          <p>Dirección detectada: <strong>{resultado.direccion}</strong></p>
          <p>Distancia estimada: <strong>{(resultado.distancia_m / 1000).toFixed(2)} km</strong></p>
          <p>Duración estimada: <strong>{Math.round(resultado.duracion_s / 60)} minutos</strong></p>
        </div>
      )}

      <MetricasEficiencia historial={historial} />
    </div>
  );
}
