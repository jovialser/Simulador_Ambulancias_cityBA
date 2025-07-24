import { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

L.Marker.prototype.options.icon = L.icon({
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

import { getRutaConMetricas } from "../servicios/ruteo.js";

export default function MapaEmergencias({ origen, destino }) {
  useEffect(() => {
    console.log("🧭 Coordenadas recibidas:", { origen, destino });

    if (
      !Array.isArray(origen) ||
      !Array.isArray(destino) ||
      origen.length !== 2 ||
      destino.length !== 2
    ) {
      console.warn("⚠️ Coordenadas inválidas. No se puede renderizar el mapa.");
      return;
    }

    // ❗ Evitar conflicto con múltiples inicializaciones
    const container = L.DomUtil.get("mapa");
    if (container && container._leaflet_id) {
      container._leaflet_id = null;
    }

    // 🗺️ Inicializar mapa
    const map = L.map("mapa").setView(origen, 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors"
    }).addTo(map);

    L.marker(origen).addTo(map).bindPopup("🚑 Centro");
    L.marker(destino).addTo(map).bindPopup("⚠️ Emergencia");

    // 🛣️ Trazar ruta
    async function trazarRuta() {
      try {
        const resultado = await getRutaConMetricas(origen, destino);

        if (!resultado || !resultado.ruta) {
          console.warn("⚠️ No se obtuvo ruta válida.");
          return;
        }

        const { ruta, distancia, duracion } = resultado;

        L.polyline(ruta, { color: "blue", weight: 4 }).addTo(map);
        console.log(
          `🛣️ Ruta trazada | Distancia: ${distancia.toFixed(0)} m | Duración: ${(duracion / 60).toFixed(1)} min`
        );
      } catch (error) {
        console.error("❌ Error en trazarRuta:", error.message);
      }
    }

    trazarRuta();
  }, [origen, destino]);

  return (
    <div style={{ width: "100%", height: "400px", marginTop: "1rem" }}>
      <h3>🗺️ Mapa Emergencias</h3>
      <div id="mapa" style={{ width: "100%", height: "100%" }}></div>
    </div>
  );
}

