import polyline from "@mapbox/polyline";

export async function getRutaConMetricas(origen, destino) {
const ORS_API_KEY = process.env.ORS_API_KEY;
  const url = "https://api.openrouteservice.org/v2/directions/driving-car";

  const body = {
    coordinates: [
      [origen[1], origen[0]], // ORS requiere [lng, lat]
      [destino[1], destino[0]]
    ]
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: ORS_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`❌ ORS respondió con error ${res.status}: ${errorText}`);
    }

    const data = await res.json();
    const rutaCodificada = data.routes?.[0]?.geometry;
    const resumen = data.routes?.[0]?.summary;

    if (!rutaCodificada || !resumen) {
      console.warn("⚠️ Respuesta ORS incompleta:", data);
      throw new Error("❌ ORS no devolvió geometría ni métricas válidas.");
    }

    const rutaDecodificada = polyline.decode(rutaCodificada); // Devuelve [lat, lng]
    const distanciaMetros = resumen.distance; // en metros
    const duracionSegundos = resumen.duration; // en segundos

    return {
      ruta: rutaDecodificada,
      distancia: distanciaMetros,
      duracion: duracionSegundos
    };
  } catch (err) {
    console.error("🧯 Error en getRutaConMetricas:", err.message);
    throw err;
  }
}
