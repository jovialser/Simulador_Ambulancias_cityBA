import polyline from "@mapbox/polyline";

export async function getRutaConMetricas(origen, destino) {
  const url = "https://simulador-backend-fauv.onrender.com/ruta-ors";

  const body = {
    origen,   // [lat, lng]
    destino   // [lat, lng]
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`❌ Backend respondió con error ${res.status}: ${errorText}`);
    }

    const data = await res.json();
    const rutaCodificada = data.routes?.[0]?.geometry;
    const resumen = data.routes?.[0]?.summary;

    if (!rutaCodificada || !resumen) {
      console.warn("⚠️ Respuesta del backend incompleta:", data);
      throw new Error("❌ El backend no devolvió geometría ni métricas válidas.");
    }

    const rutaDecodificada = polyline.decode(rutaCodificada); // [lat, lng]
    const distanciaMetros = resumen.distance;
    const duracionSegundos = resumen.duration;

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

