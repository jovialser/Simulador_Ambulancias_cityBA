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

    if (!origen || !destino) {
      console.warn("⚠️ Coordenadas inválidas. No se puede renderizar el mapa.");
      return;
    }

    const container = L.DomUtil.get("mapa");
    if (container && container._leaflet_id) {
      container.remove(); // elimina el mapa anterior si existe
      const nuevoDiv = document.createElement("div");
      nuevoDiv.setAttribute("id", "mapa");
      nuevoDiv.setAttribute("style", "width: 100%; height: 100%");
      document.querySelector("#mapa-wrapper").appendChild(nuevoDiv);
    }

    let map;
    try {
      map = L.map("mapa").setView(origen, 13);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

      L.marker(origen).addTo(map).bindPopup("🚑 Centro");
      L.marker(destino).addTo(map).bindPopup("⚠️ Emergencia");

      console.log("🗺️ Mapa inicializado correctamente.");
    } catch (error) {
      console.error("❌ Error al inicializar Leaflet:", error);
      return;
    }

    async function trazarRuta() {
      try {
        const resultado = await getRutaConMetricas(origen, destino);

        if (!resultado || !resultado.ruta) {
          console.warn("⚠️ No se obtuvo ruta válida.");
          return;
        }

        const { ruta, distancia, duracion } = resultado;

        L.polyline(ruta, { color: "blue", weight: 4 }).addTo(map);
        console.log(`🛣️ Ruta trazada | Distancia: ${distancia.toFixed(0)} m | Duración: ${(duracion / 60).toFixed(1)} min`);
      } catch (error) {
        console.error("❌ Error en trazarRuta:", error.message);
      }
    }

    trazarRuta();
  }, [origen, destino]);

  return (
    <div style={{ width: "100%", height: "400px", marginTop: "1rem" }} id="mapa-wrapper">
      <h3>🗺️ Mapa Emergencias</h3>
      <div id="mapa" style={{ width: "100%", height: "100%" }}></div>
    </div>
  );
}
