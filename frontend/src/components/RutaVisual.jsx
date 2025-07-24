import { useState } from "react";
import SimuladorForm from "./SimuladorForm.jsx";
import MapaEmergencias from "./MapaEmergencias.jsx";

export default function RutaVisual() {
  const [simulacion, setSimulacion] = useState(null);

  function actualizar(simulacionCompleta) {
    setSimulacion(simulacionCompleta);
  }

  return (
    <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start", flexWrap: "wrap" }}>
      <div style={{ flex: 1, minWidth: "300px" }}>
        <SimuladorForm onCoordenadasSeleccionadas={actualizar} />
      </div>
      <div style={{ flex: 1, minWidth: "300px" }}>
        {simulacion && (
          <>
            <p>📍 Dirección geocodificada: <strong>{simulacion.direccion || "Ubicación ingresada"}</strong></p>
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

