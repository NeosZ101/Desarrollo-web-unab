import os

import httpx
from fastapi import FastAPI, HTTPException, Path, Request, Response
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

# Inicialización de la API
app = FastAPI(
    title="API Gateway - El Asador",
    description="Valida la sesión, autoriza y enruta hacia el Backend API"
)

# Configuración (variables de entorno)
VAULT_ADDR = os.getenv("VAULT_ADDR", "http://127.0.0.1:8200")
VAULT_TOKEN = os.getenv("VAULT_TOKEN")
AUTH_URL = os.getenv("AUTH_URL", "http://localhost:8100")
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:9000")

# Nombre de la cookie de sesión
COOKIE = "session_token"

if not VAULT_TOKEN:
    raise RuntimeError("VAULT_TOKEN no configurado")


class LoginRequest(BaseModel):
    username: str
    password: str


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
    for nombre in ("backend_shared_secret", "auth_introspection_secret"):
        if not vault_secrets.get(nombre):
            raise HTTPException(status_code=500, detail=f"Falta el secreto '{nombre}' en Vault")

    return vault_secrets


# Llama al Auth Service
async def llamar_auth(ruta, cuerpo, headers=None):
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            return await client.post(f"{AUTH_URL}{ruta}", json=cuerpo, headers=headers)
    except httpx.RequestError:
        raise HTTPException(status_code=503, detail="Servicio de autenticacion no disponible")


# Lee la cookie y pregunta al Auth Service si la sesión sigue activa
async def get_session(request: Request):
    token = request.cookies.get(COOKIE)

    if not token:
        raise HTTPException(status_code=401, detail="Sesion requerida")

    vault_secrets = await get_gateway_secrets()

    response = await llamar_auth(
        "/introspect",
        {"token": token},
        {"X-Introspection-Secret": vault_secrets["auth_introspection_secret"]}
    )

    if response.status_code != 200:
        raise HTTPException(status_code=503, detail="Servicio de autenticacion no disponible")

    identity = response.json()

    if not identity.get("active"):
        raise HTTPException(status_code=401, detail="Sesion invalida o expirada")

    return {
        "identity": identity,
        "backend_secret": vault_secrets["backend_shared_secret"]
    }


# Revisa que el usuario tenga el rol pedido
def require_role(session, role):
    if role not in session["identity"]["roles"]:
        raise HTTPException(status_code=403, detail=f"Se requiere rol {role}")


# Llama al backend con el secreto interno y la identidad del usuario
async def pedir_al_backend(metodo, ruta, session):
    identity = session["identity"]

    # La identidad la agrega el Gateway, lo que mande el navegador se ignora
    gateway_headers = {
        "X-Gateway-Secret": session["backend_secret"],
        "X-Authenticated-User": identity["user_id"],
        "X-Authenticated-Username": identity["username"],
        "X-Authenticated-Roles": ",".join(identity["roles"])
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.request(metodo, f"{BACKEND_URL}{ruta}", headers=gateway_headers)
    except httpx.RequestError:
        raise HTTPException(status_code=502, detail="Backend no disponible")

    if response.status_code == 404:
        raise HTTPException(status_code=404, detail="No encontrado")

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


# Endpoint de login: guarda el token en una cookie
@app.post("/auth/login")
async def login(datos: LoginRequest, response: Response):
    auth_response = await llamar_auth(
        "/login",
        {"username": datos.username, "password": datos.password}
    )

    if auth_response.status_code == 401:
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")

    if auth_response.status_code != 200:
        raise HTTPException(status_code=503, detail="Servicio de autenticacion no disponible")

    token = auth_response.json()["access_token"]
    expires_in = auth_response.json()["expires_in"]

    # Cookie HttpOnly: JavaScript no puede leerla (con HTTPS se agregaría secure=True)
    response.set_cookie(
        COOKIE, token,
        httponly=True,
        samesite="lax",
        max_age=expires_in
    )

    return {"message": "Login correcto", "expires_in": expires_in}


# Endpoint del usuario actual
@app.get("/auth/me")
async def me(request: Request):
    session = await get_session(request)
    identity = session["identity"]

    return {
        "user_id": identity["user_id"],
        "username": identity["username"],
        "roles": identity["roles"]
    }


# Endpoint de logout: revoca la sesión y borra la cookie
@app.post("/auth/logout")
async def logout(request: Request, response: Response):
    token = request.cookies.get(COOKIE)

    if token:
        auth_response = await llamar_auth("/logout", {"token": token})

        if auth_response.status_code != 200:
            raise HTTPException(status_code=503, detail="No se pudo cerrar la sesion")

    response.delete_cookie(COOKIE)

    return {"message": "Sesion finalizada"}


# Endpoint de productos (requiere sesión); solo se publican las rutas declaradas aquí
@app.get("/api/products")
async def products(request: Request):
    session = await get_session(request)
    return await pedir_al_backend("GET", "/products", session)


# Endpoint de órdenes (requiere sesión)
@app.get("/api/orders")
async def orders(request: Request):
    session = await get_session(request)
    return await pedir_al_backend("GET", "/orders", session)


# Endpoint para borrar un producto (solo admin)
@app.delete("/api/products/{product_id}")
async def delete_product(request: Request, product_id: str = Path(pattern=r"^p\d{2}$")):
    # El id debe ser como p01, p02... (otro formato da 422)
    session = await get_session(request)

    # ana => 403, ernesto => 200
    require_role(session, "admin")

    return await pedir_al_backend("DELETE", f"/products/{product_id}", session)


# Página del panel (carpeta static), se sirve desde el mismo Gateway así no hace falta CORS
# Si se borra la carpeta static, el Gateway sigue funcionando igual
STATIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static")

if os.path.isdir(STATIC_DIR):
    app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="frontend")
