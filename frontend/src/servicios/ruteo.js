// Lee la URL del backend desde las variables de entorno de Astro.
// Debe empezar con PUBLIC_ para ser accesible en el cliente.
const BACKEND_URL = import.meta.env.PUBLIC_BACKEND_URL;

export async function getRutaConMetricas(direccionTexto, destinoCoords) {
  try {
    // 1. Geocodificar la dirección de texto para obtener las coordenadas de origen
    const geoResponse = await fetch(`${BACKEND_URL}/geocodificar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texto: direccionTexto }),
    });

    if (!geoResponse.ok) {
      const errorData = await geoResponse.json();
      throw new Error(errorData.detail || "Error en la geocodificación");
    }

    const geoData = await geoResponse.json();
    const origenCoords = [geoData.lat, geoData.lng];

    // 2. Obtener la ruta con las coordenadas de origen y destino
    const rutaResponse = await fetch(`${BACKEND_URL}/ruta-ors`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ origen: origenCoords, destino: destinoCoords }),
    });

    if (!rutaResponse.ok) {
      const errorData = await rutaResponse.json();
      throw new Error(errorData.detail || "Error al obtener la ruta");
    }

    const rutaData = await rutaResponse.json();
    const geometry = rutaData.features[0].geometry.coordinates;
    const summary = rutaData.features[0].properties.summary;

    // ORS devuelve [lng, lat], pero Leaflet necesita [lat, lng]. Invertimos cada par.
    const rutaDecodificada = geometry.map(coord => [coord[1], coord[0]]);

    return {
      origen: origenCoords,
      direccionNormalizada: geoData.direccion_normalizada,
      ruta: rutaDecodificada,
      distancia: summary.distance, // en metros
      duracion: summary.duration,  // en segundos
    };
  } catch (err) {
    console.error("🧯 Error en getRutaConMetricas:", err.message);
    throw err;
  }
}


