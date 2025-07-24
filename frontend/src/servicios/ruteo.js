import polyline from "@mapbox/polyline";

export async function getRutaConMetricas(origen, destino) {
  const url = "https://simulador-backend-fauv.onrender.com/ruta-ors";

  const payload = {
    origen,   // [lat, lng]
    destino   // [lat, lng]
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`❌ Error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const geometry = data.routes?.[0]?.geometry;
    const summary = data.routes?.[0]?.summary;

    if (!geometry || !summary) {
      console.warn("⚠️ Respuesta incompleta del backend:", data);
      throw new Error("❌ Geometría o métricas faltantes en la ruta.");
    }

    const rutaDecodificada = polyline.decode(geometry); // Devuelve [lat, lng]
    const distancia = summary.distance;  // en metros
    const duracion = summary.duration;  // en segundos

    return {
      ruta: rutaDecodificada,
      distancia,
      duracion
    };
  } catch (err) {
    console.error("🧯 Error en getRutaConMetricas:", err.message);
    throw err;
  }
}


