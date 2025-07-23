from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import os

app = FastAPI()

# 👉 Middleware CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://simulador-ambulancias-city-ba.vercel.app",
        "http://localhost:4321"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 👉 Endpoint base
@app.get("/")
def inicio():
    return {"mensaje": "Backend del simulador activo"}

# 👉 Modelos
class Emergencia(BaseModel):
    zona: str
    tipo_via: str
    distancia_km: float

class CoordenadasRuta(BaseModel):
    origen: list  # [lat, lng]
    destino: list  # [lat, lng]

# 👉 Utilidad ETA
def calcular_eta(distancia_km, tipo_via):
    velocidad = 60 if tipo_via == "avenida" else 40
    eta = (distancia_km / velocidad) * 60
    return round(eta, 2)

# 👉 Endpoint tradicional
@app.post("/asignar")
def asignar_ambulancia(datos: Emergencia):
    eta = calcular_eta(datos.distancia_km, datos.tipo_via)
    ambulancia = f"AMB-{hash(datos.zona) % 100:02d}"
    return {
        "ambulancia": ambulancia,
        "zona": datos.zona,
        "tipo_via": datos.tipo_via,
        "eta_minutos": eta
    }

# 👉 Endpoint IA
@app.post("/asignar-ia")
def asignar_ambulancia_ia(datos: Emergencia):
    eta = calcular_eta(datos.distancia_km, datos.tipo_via) * 0.9
    ambulancia = f"AMB-{(hash(datos.zona) + 42) % 100:02d}"
    centro = "Centro Sur" if datos.zona in ["Barracas", "Caballito"] else "Centro Norte"
    justificacion = "Asignación basada en demanda histórica y reserva estratégica"
    return {
        "ambulancia": ambulancia,
        "zona": datos.zona,
        "tipo_via": datos.tipo_via,
        "eta_minutos": round(eta, 2),
        "centro": centro,
        "justificacion": justificacion
    }

# 🛣️ Nuevo endpoint: ruteo con ORS desde backend
@app.post("/ruta-ors")
def obtener_ruta(datos: CoordenadasRuta):
    ORS_API_KEY = os.getenv("ORS_API_KEY")
    
    if not ORS_API_KEY:
        return {"error": "🚫 ORS_API_KEY no está configurada en entorno"}

    headers = {
        "Authorization": ORS_API_KEY,
        "Content-Type": "application/json"
    }

    body = {
        "coordinates": [
            [datos.origen[1], datos.origen[0]],
            [datos.destino[1], datos.destino[0]]
        ]
    }

    response = requests.post(
        "https://api.openrouteservice.org/v2/directions/driving-car",
        headers=headers,
        json=body
    )

    if response.status_code != 200:
        return {
            "error": f"ORS falló ({response.status_code})",
            "detalle": response.text
        }

    return response.json()
