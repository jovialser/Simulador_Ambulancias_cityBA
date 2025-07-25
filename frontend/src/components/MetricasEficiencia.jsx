import { useState, useEffect } from "react";

export default function MetricasEficiencia({ historial }) {
  const [metricas, setMetricas] = useState({
    totalSimulaciones: 0,
    etaPromedio: 0,
    distanciaPromedio: 0,
    usoPorCentro: {},
  });

  const tarjetaEstilo = {
    background: "#f0f0f0",
    borderRadius: "8px",
    padding: "1rem",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
    flex: "1",
    minWidth: "150px",
    textAlign: "center",
  };

  useEffect(() => {
    if (!historial || historial.length === 0) return;

    const totalSimulaciones = historial.length;
    const totalDuracion = historial.reduce((acc, s) => acc + s.duracion, 0);
    const totalDistancia = historial.reduce((acc, s) => acc + s.distancia, 0);

    const usoPorCentro = historial.reduce((acc, s) => {
      acc[s.centro] = (acc[s.centro] || 0) + 1;
      return acc;
    }, {});

    setMetricas({
      totalSimulaciones,
      etaPromedio: (totalDuracion / totalSimulaciones / 60).toFixed(1), // en minutos
      distanciaPromedio: (totalDistancia / totalSimulaciones / 1000).toFixed(1), // en km
      usoPorCentro,
    });
  }, [historial]);

  return (
    <div style={{ marginTop: "2rem", color: '#333' }}>
      <h3 style={{color: 'white', textAlign: 'left'}}>📈 Métricas de Eficiencia</h3>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginTop: "1rem" }}>
        <div style={tarjetaEstilo}>
          <h4>🚑 Simulaciones</h4>
          <p style={{fontSize: '1.5rem', margin: 0}}>{metricas.totalSimulaciones}</p>
        </div>
        <div style={tarjetaEstilo}>
          <h4>⏱️ ETA Promedio</h4>
          <p style={{fontSize: '1.5rem', margin: 0}}>{metricas.etaPromedio} min</p>
        </div>
        <div style={tarjetaEstilo}>
          <h4>📏 Dist. Promedio</h4>
          <p style={{fontSize: '1.5rem', margin: 0}}>{metricas.distanciaPromedio} km</p>
        </div>
      </div>
      {Object.keys(metricas.usoPorCentro).length > 0 && (
        <div style={{...tarjetaEstilo, flexBasis: '100%', marginTop: '1rem', textAlign: 'left'}}>
          <h4>🏥 Uso por Centro</h4>
          <ul style={{ paddingLeft: "1.5rem", margin: 0 }}>
            {Object.entries(metricas.usoPorCentro).map(([centro, count]) => (
              <li key={centro}>{centro}: {count}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
