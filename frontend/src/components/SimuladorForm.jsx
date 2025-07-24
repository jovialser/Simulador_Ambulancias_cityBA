import { useState } from 'react';
import MetricasEficiencia from './MetricasEficiencia.jsx';
import { getRutaConMetricas } from '../servicios/ruteo.js';
export default function SimuladorForm({ onCoordenadasSeleccionadas }) { 
  const [direccion, setDireccion] = useState(""); 
  const [resultado, setResultado] = useState(null); 
  const [historial, setHistorial] = useState([]); 
  const [loading, setLoading] = useState(false); // 🏥 Centro médico fijo (podés hacerlo dinámico en el futuro) 
  const destinoCoords = [-34.607, -58.449]; 
  const enviar = async (e) => { e.preventDefault(); setLoading(true); setResultado(null); 
        try { // 🔍 Paso 1: geocodificar dirección ingresada 
        const geoRes = await fetch("https://simulador-backend-fauv.onrender.com/geocodificar",
                                   { method: "POST", headers: { "Content-Type": "application/json" }, 
                                    body: JSON.stringify({ texto: direccion }) }); 
        const geoData = await geoRes.json(); 
          if (!geoData.lat || !geoData.lng) { alert("⚠️ Dirección inválida o no encontrada."); 
                                             setLoading(false); 
                                             return; } 
          const origenCoords = [geoData.lat, geoData.lng]; // 🛣️ Paso 2: obtener ruta entre origen y centro 
          const rutaInfo = await getRutaConMetricas(origenCoords, destinoCoords); 
          const simulacion = { direccion: geoData.direccion_normalizada, distancia_m: rutaInfo.distancia, duracion_s: rutaInfo.duracion }; 
          setResultado(simulacion); setHistorial(prev => [...prev, simulacion]); 
          if (onCoordenadasSeleccionadas) { 
            onCoordenadasSeleccionadas({ origen: origenCoords, destino: destinoCoords, ruta: rutaInfo.ruta, distancia: rutaInfo.distancia, duracion: rutaInfo.duracion }); } } 
        catch (err) { console.error("❌ Error al simular:", err); 
                     alert("Error al conectar con el backend."); } 
                               setLoading(false); }; 
  return ( <div> <form onSubmit={enviar}> 
    <label> Dirección de la emergencia:<br /> 
      <input type="text" value={direccion} onChange={(e) => setDireccion(e.target.value)} placeholder="Ej: Av. Córdoba 2350, CABA" required style={{ padding: "0.7rem", width: "100%", marginBottom: "1rem" }} /> 
    </label><br /> <button type="submit" disabled={loading}> {loading ? "🕐 Simulando..." : "🚑 Simular emergencia"} 
    </button> </form> {resultado && ( <div style={{ marginTop: "1rem", background: "#e3ffe3", padding: "1rem", borderRadius: "8px" }}> 
      <h2>🟢 Resultado de simulación</h2> <p>Dirección: <strong>{resultado.direccion}</strong></p> <p>Distancia estimada: <strong>{(resultado.distancia_m / 1000).toFixed(2)} km</strong></p> <p>Duración estimada: <strong>{Math.round(resultado.duracion_s / 60)} minutos</strong></p> </div> )} <MetricasEficiencia historial={historial} /> </div> ); }

