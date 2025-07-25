from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import os

app = FastAPI(
    title="API del Simulador de Rutas de Emergencia",
    description="API para geocodificar direcciones y obtener rutas óptimas con OpenRouteService.",
    version="1.0.0"
)

# --- Configuración de CORS ---
# Permite que el frontend (desplegado en Vercel o en localhost) se comunique con este backend.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Origen para desarrollo local con Vite
        "https://simulador-ambulancias-city-ba.vercel.app" # Reemplaza con tu URL de Vercel cuando la tengas
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Modelos de Datos (Pydantic) ---
# Definen la estructura de los datos que la API espera recibir.

class CoordenadasRuta(BaseModel):
    origen: list[float]  # [lat, lng]
    destino: list[float] # [lat, lng]

class Direccion(BaseModel):
    texto: str

# --- Endpoints de la API ---

@app.get("/", summary="Endpoint de Bienvenida")
def inicio():
    """Devuelve un mensaje de bienvenida para verificar que el backend está activo."""
    return {"mensaje": "Backend del simulador de emergencias activo"}

@app.post("/geocodificar", summary="Geocodificar Dirección")
def geocodificar(direccion: Direccion):
    """Convierte una dirección de texto en coordenadas geográficas (latitud, longitud)."""
    ORS_API_KEY = os.getenv("ORS_API_KEY")
    if not ORS_API_KEY:
        raise HTTPException(status_code=500, detail="La clave de API de ORS no está configurada en el servidor.")

    url = "https://api.openrouteservice.org/geocode/search"
    params = {
        "api_key": ORS_API_KEY,
        "text": direccion.texto, # Limita la búsqueda a Argentina para mayor precisión
        "boundary.country": "ARG",
        "size": 1
    }
    
    try:
        # Se añade un timeout para evitar que la petición se quede colgada indefinidamente.
        res = requests.get(url, params=params, timeout=10)
        res.raise_for_status()  # Lanza un error si la respuesta no es 2xx (ej. 401, 403, 500)
        data = res.json()

        if not data.get("features"):
            raise HTTPException(status_code=404, detail="No se encontraron resultados para la dirección proporcionada.")

        coords = data["features"][0]["geometry"]["coordinates"]
        etiqueta = data["features"][0]["properties"]["label"]
        
        return {
            "lat": coords[1], # ORS devuelve [lng, lat]
            "lng": coords[0], 
            "direccion_normalizada": etiqueta
        }
    except requests.exceptions.RequestException as e:
        # Error de red, timeout, o error HTTP del servicio de ORS
        raise HTTPException(status_code=503, detail=f"Error al contactar el servicio de geocodificación: {e}")
    except (KeyError, IndexError):
        # El formato de la respuesta de ORS no fue el esperado
        raise HTTPException(status_code=500, detail="No se pudieron extraer las coordenadas de la respuesta del servicio externo.")


@app.post("/ruta-ors", summary="Obtener Ruta Óptima en formato GeoJSON")
def obtener_ruta(datos: CoordenadasRuta):
    """Calcula la ruta óptima entre un origen y un destino, devolviendo la geometría y métricas."""
    ORS_API_KEY = os.getenv("ORS_API_KEY")
    if not ORS_API_KEY:
        raise HTTPException(status_code=500, detail="La clave de API de ORS no está configurada en el servidor.")

    headers = {
        "Authorization": ORS_API_KEY,
        "Content-Type": "application/json"
    }

    body = {
        "coordinates": [
            [datos.origen[1], datos.origen[0]],   # ORS espera [lng, lat]
            [datos.destino[1], datos.destino[0]] # ORS espera [lng, lat]
        ]
    }

    try:
        # Se solicita el formato geojson para obtener la geometría de la ruta.
        response = requests.post(
            "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
            headers=headers,
            json=body,
            timeout=10
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=503, detail=f"Error al contactar el servicio de rutas de ORS: {e}")

