from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import os

app = FastAPI()

# 🔓 Permitir frontend en CORS
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

# 🟢 Endpoint base
@app.get("/")
def inicio():
    return {"mensaje": "Backend del simulador activo"}

# 📌 Modelos
class CoordenadasRuta(BaseModel):
    origen: list  # [lat, lng]
    destino: list  # [lat, lng]

class Direccion(BaseModel):
    texto: str

# 🌍 Geocodificación → coordenadas
@app.post("/geocodificar")
def geocodificar(direccion: Direccion):
    ORS_API_KEY = os.getenv("ORS_API_KEY")
    url = "https://api.openrouteservice.org/geocode/search"
    params = {
        "api_key": ORS_API_KEY,
        "text": direccion.texto,
        "size": 1
    }
    res = requests.get(url, params=params)

    if res.status_code != 200:
        return {
            "error": f"Geocodificación falló ({res.status_code})",
            "detalle": res.text
        }

    data = res.json()
    try:
        coords = data["features"][0]["geometry"]["coordinates"]
        etiqueta = data["features"][0]["properties"]["label"]
        return {
            "lat": coords[1],
            "lng": coords[0],
            "direccion_normalizada": etiqueta
        }
    except:
        return {"error": "No se pudo extraer coordenadas"}

# 🛣️ Ruta entre coordenadas
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
