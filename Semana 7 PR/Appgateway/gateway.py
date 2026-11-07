import os

import httpx
from fastapi import FastAPI, HTTPException

# Inicialización de la API
app = FastAPI(
    title="API Gateway - El Asador",
    description="Recibe las solicitudes y las enruta hacia el Backend API"
)

# Dirección del Backend API (se puede cambiar con la variable BACKEND_URL)
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:9000")


# Llama al backend y devuelve su respuesta
async def pedir_al_backend(ruta):
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(f"{BACKEND_URL}{ruta}")
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


# Endpoint de productos (enruta hacia el backend)
@app.get("/api/products")
async def products():
    return await pedir_al_backend("/products")


# Endpoint de órdenes (enruta hacia el backend)
@app.get("/api/orders")
async def orders():
    return await pedir_al_backend("/orders")
