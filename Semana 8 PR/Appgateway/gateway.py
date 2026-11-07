import os
import secrets

import httpx
from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

# Inicializacion de la API
app = FastAPI(
    title="Secure API Gateway - El Asador",
    description="API Gateway con Vault y Bearer Token"
)

# Lee el token Bearer del encabezado Authorization
security = HTTPBearer(auto_error=False)

# Configuración (variables de entorno)
VAULT_ADDR = os.getenv("VAULT_ADDR", "http://127.0.0.1:8200")
VAULT_TOKEN = os.getenv("VAULT_TOKEN")
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:9000")

if not VAULT_TOKEN:
    raise RuntimeError("VAULT_TOKEN no configurado")


# Lee los secretos del Gateway desde Vault
async def get_gateway_secrets():
    url = f"{VAULT_ADDR}/v1/secret/data/gateway"
    headers = {"X-Vault-Token": VAULT_TOKEN}

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(url, headers=headers)
    except httpx.RequestError:
        raise HTTPException(status_code=503, detail="Vault no disponible")

    if response.status_code != 200:
        raise HTTPException(status_code=500, detail="No fue posible acceder a Vault")

    try:
        vault_secrets = response.json()["data"]["data"]
    except (KeyError, ValueError):
        raise HTTPException(status_code=500, detail="Respuesta invalida de Vault")

    # Revisa que estén los dos secretos
    for nombre in ("client_token", "backend_shared_secret"):
        if not vault_secrets.get(nombre):
            raise HTTPException(status_code=500, detail=f"Falta el secreto '{nombre}' en Vault")

    return vault_secrets


# Valida el token del cliente con el que esta guardado en Vault
async def authenticate_client(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    if credentials is None:
        raise HTTPException(status_code=401, detail="Bearer token requerido")

    vault_secrets = await get_gateway_secrets()

    # Se compara en bytes para que un token con tildes de 401 y no 500
    valid = secrets.compare_digest(
        credentials.credentials.encode(),
        vault_secrets["client_token"].encode()
    )

    if not valid:
        raise HTTPException(status_code=401, detail="Token invalido")

    return {
        "client_id": "cliente-el-asador",
        "backend_secret": vault_secrets["backend_shared_secret"]
    }


# Llama al backend con el secreto interno (el cliente nunca lo ve)
async def pedir_al_backend(ruta, auth):
    gateway_headers = {
        "X-Gateway-Secret": auth["backend_secret"],
        "X-Authenticated-Client": auth["client_id"]
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(f"{BACKEND_URL}{ruta}", headers=gateway_headers)
    except httpx.RequestError:
        raise HTTPException(status_code=502, detail="Backend no disponible")

    if response.status_code != 200:
        raise HTTPException(status_code=502, detail="El backend rechazo la solicitud")

    return response.json()


# Endpoint de estado de salud del servicio
@app.get("/health")
def health():
    return {
        "status": "OK",
        "service": "API Gateway"
    }


# Endpoint de productos (requiere token); solo se publican las rutas declaradas aquí
@app.get("/api/products")
async def products(auth=Depends(authenticate_client)):
    return await pedir_al_backend("/products", auth)


# Endpoint de órdenes (requiere token)
@app.get("/api/orders")
async def orders(auth=Depends(authenticate_client)):
    return await pedir_al_backend("/orders", auth)
