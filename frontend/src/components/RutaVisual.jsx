import { useState } from "react";
import SimuladorForm from "./SimuladorForm.jsx";
import MapaEmergencias from "./MapaEmergencias.jsx";
import MetricasEficiencia from "./MetricasEficiencia.jsx";

export default function RutaVisual() {
  const [simulacion, setSimulacion] = useState(null);
  const [historial, setHistorial] = useState([]);

  function handleNuevaSimulacion(nuevaSimulacion) {
    setSimulacion(nuevaSimulacion);
    // Añadimos la nueva simulación al historial
    setHistorial(prev => [nuevaSimulacion, ...prev]);
  }

  function handleClear() {
    setSimulacion(null);
  }

  return (
    <div style={{ display: "flex", gap: "2rem", alignItems: "flex-start", flexWrap: "wrap" }}>
      <div style={{ flex: 1, minWidth: "350px" }}>
        <SimuladorForm
          onSimulacion={handleNuevaSimulacion}
          onClear={handleClear}
        />
        <MetricasEficiencia historial={historial} />
      </div>

      <div style={{ flex: 2, minWidth: "400px", height: "600px" }}>
        <MapaEmergencias simulacion={simulacion} />
      </div>
    </div>
  );
}

