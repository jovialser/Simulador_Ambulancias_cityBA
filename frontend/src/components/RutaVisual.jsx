import { useState } from "react";
import SimuladorForm from "./SimuladorForm.jsx";
import MapaEmergencias from "./MapaEmergencias.jsx";

// 📍 Centros médicos por municipio
const centrosMedicos = {
  "Ciudad de Buenos Aires": [-34.607, -58.449],
  "Lanús": [-34.706, -58.398],
  "Quilmes": [-34.720, -58.264],
  "San Martín": [-34.575, -58.552],
  "Tres de Febrero": [-34.605, -58.563],
  "La Matanza": [-34.640, -58.610]
};

export default function RutaVisual() {
  const [simulacion, setSimulacion] = useState(null);
  const [municipioSeleccionado, setMunicipioSeleccionado] = useState(null);

  function actualizar(simulacionCompleta) {
    setSimulacion(simulacionCompleta);
  }

  function actualizarMunicipio(m) {
    setMunicipioSeleccionado(m);
    setSimulacion(null); // reset simulación al cambiar municipio
  }

  const centroMedicoCoords = municipioSeleccionado ? centrosMedicos[municipioSeleccionado] : null;

  return (
    <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start", flexWrap: "wrap" }}>
      <div style={{ flex: 1, minWidth: "300px" }}>
        <SimuladorForm
          onCoordenadasSeleccionadas={actualizar}
          onMunicipioSeleccionado={actualizarMunicipio}
        />
      </div>

      <div style={{ flex: 1, minWidth: "300px" }}>
        {centroMedicoCoords && !simulacion && (
          <>
            <h3>🏥 Centro médico: {municipioSeleccionado}</h3>
            <MapaEmergencias origen={centroMedicoCoords} destino={null} />
          </>
        )}

        {simulacion && (
          <>
            <p>📍 Dirección geocodificada: <strong>{simulacion.direccion}</strong></p>
            <MapaEmergencias
              origen={simulacion.origen}
              destino={simulacion.destino}
              ruta={simulacion.ruta}
              distancia={simulacion.distancia}
              duracion={simulacion.duracion}
            />
          </>
        )}
      </div>
    </div>
  );
}

