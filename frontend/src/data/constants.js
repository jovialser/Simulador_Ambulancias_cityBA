// 📍 Centros médicos por municipio
export const centrosMedicosData = {
  "Hospital General de Agudos Dr. Cosme Argerich (CABA)": {
    coords: [-34.622, -58.364],
    municipio: "CABA"
  },
  "Hospital Interzonal General de Agudos Evita (Lanús)": {
    coords: [-34.706, -58.398],
    municipio: "Lanús"
  },
  "Hospital Zonal General de Agudos Dr. Isidoro Iriarte (Quilmes)": {
    coords: [-34.720, -58.264],
    municipio: "Quilmes"
  },
  "Hospital Interzonal General de Agudos Eva Perón (San Martín)": {
    coords: [-34.575, -58.552],
    municipio: "San Martín"
  },
  "Hospital Interzonal de Agudos Dr. Alberto Balestrini (La Matanza)": {
    coords: [-34.671, -58.565],
    municipio: "La Matanza"
  }
};

// Exportamos una lista con los nombres de los centros para el menú desplegable.
export const nombresDeCentros = Object.keys(centrosMedicosData);
