// 🔍 Buscar sugerencias usando tu backend /autocomplete para evitar CORS
async function buscarSugerencias(texto, partido) {
  if (!texto || !partido) return;

  const query = `${texto}, ${partido}, Buenos Aires, Argentina`;

  try {
    const res = await fetch("https://simulador-backend-fauv.onrender.com/autocomplete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texto: query })
    });

    if (!res.ok) throw new Error(`Error al contactar backend: ${res.status}`);
    
    const data = await res.json();

    const opciones = data.features
      .filter(f => f.properties?.confidence >= 0.8)
      .map(f => ({
        label: f.properties.label,
        value: f.geometry.coordinates
      }));

    setSugerencias(opciones);
  } catch (err) {
    console.error("❌ Error en autocompletado:", err.message);
  }
}
