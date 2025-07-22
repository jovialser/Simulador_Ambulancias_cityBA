import { useEffect, useState } from "react";

export default function ComparadorEstrategias({ zona, tipo_via, distancia_km }) {
  const [tradicional, setTradicional] = useState(null);
  const [inteligente, setInteligente] = useState(null);

  useEffect(() => {
    async function comparar() {
      const payload = { zona, tipo_via, distancia_km };

      try {
        console.log("📤 Enviando datos a /asignar:", payload);
        const resTrad = await fetch("https://simulador-backend-fauv.onrender.com/asignar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (!resTrad.ok) throw new Error(`Solicitud tradicional falló (${resTrad.status})`);
        const datosTrad = await resTrad.json();
        console.log("✅ Respuesta tradicional:", datosTrad);
        setTradicional(datosTrad);
      } catch (err) {
        console.error("❌ Error en solicitud tradicional:", err.message);
        setTradicional(null);
      }

      try {
        console.log("📤 Enviando datos a /asignar-ia:", payload);
        const resIA = await fetch("https://simulador-backend-fauv.onrender.com/asignar-ia", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (!resIA.ok) throw new Error(`Solicitud IA falló (${resIA.status})`);
        const datosIA = await resIA.json();
        console.log("✅ Respuesta IA:", datosIA);
        setInteligente(datosIA);
      } catch (err) {
        console.error("❌ Error en solicitud IA:", err.message);
        setInteligente(null);
      }
    }

    comparar();
  }, [zona, tipo_via, distancia_km]);

  const tarjetaEstilo = {
    background: "#f9f9f9",
    borderRadius: "8px",
    padding: "1rem",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    flex: "1",
    minWidth: "250px"
  };

  return (
    <div style={{ marginTop: "2rem" }}>
      <h2>🧠 Comparador de Estrategias</h2>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        {tradicional && (
          <div style={tarjetaEstilo}>

