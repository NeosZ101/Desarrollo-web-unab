import os

import httpx
from fastapi import FastAPI, HTTPException

# Inicialización de la API
app = FastAPI(
    title="API Gateway - El Asador",
    description="Recibe las solicitudes y las enruta hacia los Backend API"
)

# Dirección de cada Backend (se pueden cambiar con variables de entorno)
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:9000")
BACKEND_URL_2 = os.getenv("BACKEND_URL_2", "http://localhost:9100")


# Llama a un backend y devuelve su respuesta
async def pedir_al_backend(base_url, ruta):
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(f"{base_url}{ruta}")
    except httpx.RequestError:
        raise HTTPException(status_code=502, detail="Backend no disponible")

    if response.status_code != 200:
        raise HTTPException(status_code=502, detail="El backend no respondió correctamente")

    return response.json()


# Endpoint de estado de salud del servicio
@app.get("/health")
def health():
    return {
        "status": "OK",
        "service": "API Gateway"
    }


# /api/products se resuelve con el Backend 1 (puerto 9000)
@app.get("/api/products")
async def products():
    return await pedir_al_backend(BACKEND_URL, "/products")


# /api/productos se resuelve con el Backend 2 (puerto 9100)
@app.get("/api/productos")
async def productos():
    return await pedir_al_backend(BACKEND_URL_2, "/productos")


# /api/orders se resuelve con el Backend 1 (puerto 9000)
@app.get("/api/orders")
async def orders():
    return await pedir_al_backend(BACKEND_URL, "/orders")
