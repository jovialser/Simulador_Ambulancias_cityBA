import { useState } from 'react';
import Select from 'react-select';
import MetricasEficiencia from './MetricasEficiencia.jsx';
import { getRutaConMetricas } from '../servicios/ruteo.js';

// 📍 Centros médicos por municipio
const centrosMedicos = {
  "Ciudad de Buenos Aires": [-34.607, -58.449],
  "Lanús": [-34.706, -58.398],
  "Quilmes": [-34.720, -58.264],
  "San Martín": [-34.575, -58.552],
  "Tres de Febrero": [-34.605, -58.563],
  "La Matanza": [-34.640, -58.610]
};

const municipios = Object.keys(centrosMedicos);

export default function SimuladorForm({ onCoordenadasSeleccionadas }) {
  const [municipio, setMunicipio] = useState(null);
  const [direccionInput, setDireccionInput] = useState("");
  const [resultado, setResultado] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(false);

  async function simularEmergencia() {
    setLoading(true);
    setResultado(null);

    if (!municipio || !direccionInput) {
      alert("⚠️ Seleccioná municipio y completá la dirección.");
      setLoading(false);
      return;
    }

    const destinoCoords = centrosMedicos[municipio];
    const direccionCompleta = `${direccionInput}, ${municipio}, Buenos Aires, Argentina`;

    try {
      const res = await fetch("https://simulador-backend-fauv.onrender.com/geocodificar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto: direccionCompleta })
      });

      const data = await res.json();

      if (!data.lat || !data.lng) {
        alert("❌ No se pudo obtener la ubicación.");
        setLoading(false);
        return;
      }

      const origenCoords = [data.lat, data.lng];
      const rutaInfo = await getRutaConMetricas(origenCoords, destinoCoords);

      const simulacion = {
        direccion: data.direccion_normalizada,
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
          direccion: data.direccion_normalizada
        });
      }
    } catch (err) {
      console.error("❌ Error en simulación:", err.message);
      alert("Error al conectar con el backend.");
    }

    setLoading(false);
  }

  return (
    <div>
      <label>Municipio:</label>
      <Select
        options={municipios.map(m => ({ value: m, label: m }))}
        onChange={(opt) => setMunicipio(opt.value)}
        placeholder="Seleccioná municipio"
        styles={{ container: base => ({ ...base, marginBottom: "1rem" }) }}
      />

      <label>Dirección completa:</label>
      <input
        type="text"
        value={direccionInput}
        onChange={(e) => setDireccionInput(e.target.value)}
        placeholder="Ej: Av. Santa Fe 883"
        style={{ padding: "0.7rem", width: "100%", marginBottom: "1rem" }}
      />

      <button onClick={simularEmergencia} disabled={loading}>
        {loading ? "🕐 Simulando..." : "🚑 Simular emergencia"}
      </button>

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


