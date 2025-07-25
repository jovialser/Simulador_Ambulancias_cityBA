import { useState } from 'react';
import Select from 'react-select';
import { getRutaConMetricas } from '../servicios/ruteo.js';
import { centrosMedicosData, nombresDeCentros } from '../data/constants.js';

export default function SimuladorForm({ onSimulacion, onClear }) {
  const [centroSeleccionado, setCentroSeleccionado] = useState(null);
  const [direccionInput, setDireccionInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function simularEmergencia() {
    if (!centroSeleccionado || !direccionInput) {
      setError("⚠️ Por favor, selecciona un centro médico y completa la dirección.");
      return;
    }

    setLoading(true);
    setError("");
    onClear(); // Limpia la simulación anterior en el componente padre

    try {
      // Accedemos a los datos del centro de forma segura
      const centroData = centrosMedicosData[centroSeleccionado];
      const destinoCoords = centroData.coords;
      const municipio = centroData.municipio;
      const direccionCompleta = `${direccionInput}, ${municipio}, Buenos Aires, Argentina`;

      const rutaInfo = await getRutaConMetricas(direccionCompleta, destinoCoords);

      const simulacion = {
        id: new Date().getTime(),
        origen: rutaInfo.origen,
        destino: destinoCoords,
        ruta: rutaInfo.ruta,
        distancia: rutaInfo.distancia,
        duracion: rutaInfo.duracion,
        direccionNormalizada: rutaInfo.direccionNormalizada,
        centro: centroSeleccionado,
      };

      onSimulacion(simulacion);
    } catch (err) {
      console.error("❌ Error en simulación:", err.message);
      setError(`Error en la simulación: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h3 style={{ marginTop: 0 }}>Configurar Simulación</h3>
      <label>Centro Médico de Origen:</label>
      <Select
        options={nombresDeCentros.map(nombre => ({ value: nombre, label: nombre }))}
        onChange={(opt) => setCentroSeleccionado(opt.value)}
        placeholder="Seleccioná un hospital..."
        styles={{ container: base => ({ ...base, marginBottom: "1rem" }) }}
      />

      <label>Dirección de la Emergencia:</label>
      <input
        type="text"
        value={direccionInput}
        onChange={(e) => setDireccionInput(e.target.value)}
        placeholder="Ej: Av. Santa Fe 883"
        style={{ padding: "0.7rem", width: "calc(100% - 1.4rem)", marginBottom: "1rem", borderRadius: '4px', border: '1px solid #ccc', color: '#333' }}
      />

      <button onClick={simularEmergencia} disabled={loading} style={{width: '100%', padding: '0.8rem', fontSize: '1rem'}}>
        {loading ? "🕐 Simulando..." : "🚑 Simular emergencia"}
      </button>

      {error && (
        <p style={{ color: '#ff6b6b', marginTop: '1rem' }}>{error}</p>
      )}
    </div>
  );
}


