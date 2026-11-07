"""
Pruebas de seguridad de la Semana 9 (se ejecutan con: pytest tests -v).

No hace falta levantar nada: las tres APIs y un Vault falso se llaman
entre sí en memoria. Se prueba lo que pidió el profesor:
login incorrecto (401), rol sin permiso (403), introspect y logout
protegidos con el secreto del Gateway, logout que revoca la sesión
y backend que rechaza a quien no viene del Gateway (403).
"""
import importlib.util
import os
from pathlib import Path

import httpx
import pytest
from fastapi import FastAPI, Header, HTTPException
from fastapi.testclient import TestClient

CARPETA = Path(__file__).resolve().parents[1]

# Secretos falsos, solo para las pruebas
SECRETO_AUTH = "secreto-auth-de-prueba"
SECRETO_BACKEND = "secreto-backend-de-prueba"

# Variables que leen los tres servicios al cargarse
os.environ["VAULT_ADDR"] = "http://127.0.0.1:8200"
os.environ["VAULT_TOKEN"] = "token-de-prueba"
os.environ["AUTH_URL"] = "http://localhost:8100"
os.environ["BACKEND_URL"] = "http://localhost:9000"
os.environ["AUTH_INTROSPECTION_SECRET"] = SECRETO_AUTH
os.environ["INTERNAL_GATEWAY_SECRET"] = SECRETO_BACKEND


# Carga un archivo .py por su ruta (las carpetas no son paquetes)
def cargar(nombre, ruta):
    spec = importlib.util.spec_from_file_location(nombre, CARPETA / ruta)
    modulo = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(modulo)
    return modulo


auth = cargar("auth_service", "Auth/auth_service.py")
backend = cargar("backend_api", "Backend/backend_api.py")
gateway = cargar("gateway", "Appgateway/gateway.py")

# Vault falso: devuelve los secretos solo si llega el token correcto
vault = FastAPI()


@vault.get("/v1/secret/data/gateway")
def vault_gateway(x_vault_token: str = Header(default="")):
    if x_vault_token != os.environ["VAULT_TOKEN"]:
        raise HTTPException(status_code=403, detail="permission denied")

    return {"data": {"data": {
        "backend_shared_secret": SECRETO_BACKEND,
        "auth_introspection_secret": SECRETO_AUTH
    }}}


# Puerto de cada servicio -> aplicación que responde
SERVICIOS = {8200: vault, 8100: auth.app, 9000: backend.app}

ClienteReal = httpx.AsyncClient


# Cuando el Gateway llama a otro servicio, la llamada se redirige a su app
class Enrutador(httpx.AsyncBaseTransport):
    async def handle_async_request(self, request):
        app = SERVICIOS[request.url.port]
        return await httpx.ASGITransport(app=app).handle_async_request(request)


class ClienteDePrueba(ClienteReal):
    def __init__(self, *args, **kwargs):
        kwargs["transport"] = Enrutador()
        super().__init__(*args, **kwargs)


@pytest.fixture(autouse=True)
def entorno(monkeypatch):
    monkeypatch.setattr(httpx, "AsyncClient", ClienteDePrueba)
    auth.SESSIONS.clear()
    # La prueba de borrado quita un producto: se restaura la lista
    copia = list(backend.PRODUCTOS)
    yield
    backend.PRODUCTOS[:] = copia


@pytest.fixture
def navegador():
    return TestClient(gateway.app)


def login(navegador, usuario, clave):
    return navegador.post("/auth/login", json={"username": usuario, "password": clave})


# Pregunta al Auth Service si un token sigue activo (con el secreto del Gateway)
def introspect(token, secreto=SECRETO_AUTH):
    cliente = TestClient(auth.app)
    return cliente.post("/introspect", json={"token": token},
                        headers={"X-Gateway-Auth-Secret": secreto})


# ---------- Login ----------

def test_login_incorrecto_da_401(navegador):
    r = login(navegador, "ana", "clave-mala")
    assert r.status_code == 401


def test_login_de_usuario_inexistente_da_401(navegador):
    r = login(navegador, "nadie", "1234")
    assert r.status_code == 401


def test_login_correcto_entrega_cookie_httponly(navegador):
    r = login(navegador, "ana", "1234")
    assert r.status_code == 200

    cookie = r.headers["set-cookie"]
    assert "session_token=" in cookie
    assert "HttpOnly" in cookie
    # El token va solo en la cookie, no en el cuerpo (JavaScript no lo ve)
    assert "access_token" not in r.json()


# ---------- Sesión ----------

def test_sin_cookie_da_401(navegador):
    assert navegador.get("/api/products").status_code == 401
    assert navegador.get("/auth/me").status_code == 401


def test_cookie_inventada_da_401(navegador):
    navegador.cookies.set("session_token", "token-que-no-existe")
    assert navegador.get("/api/products").status_code == 401


def test_sesion_vencida_da_401(navegador):
    login(navegador, "ana", "1234")
    token = navegador.cookies.get("session_token")
    auth.SESSIONS[token]["expires_at"] = 0

    assert navegador.get("/auth/me").status_code == 401


def test_ana_ve_su_perfil_y_los_productos(navegador):
    login(navegador, "ana", "1234")

    me = navegador.get("/auth/me")
    assert me.status_code == 200
    assert me.json()["roles"] == ["user"]

    assert navegador.get("/api/products").status_code == 200
    assert navegador.get("/api/orders").status_code == 200


# ---------- Roles ----------

def test_ana_user_no_puede_borrar_productos_403(navegador):
    login(navegador, "ana", "1234")
    r = navegador.delete("/api/products/p01")
    assert r.status_code == 403


def test_ernesto_admin_si_puede_borrar_productos_200(navegador):
    login(navegador, "ernesto", "admin123")
    r = navegador.delete("/api/products/p01")
    assert r.status_code == 200
    assert r.json() == {"deleted": "p01"}


def test_ana_no_puede_hacerse_admin_con_cabeceras_propias(navegador):
    login(navegador, "ana", "1234")
    r = navegador.delete(
        "/api/products/p01",
        headers={"X-Authenticated-Roles": "user,admin", "X-Authenticated-User": "USR-003"}
    )
    # El Gateway ignora lo que mande el navegador
    assert r.status_code == 403


# ---------- Introspect y Auth Service protegidos ----------

def test_introspect_con_secreto_dice_si_el_token_esta_activo(navegador):
    login(navegador, "ana", "1234")
    token = navegador.cookies.get("session_token")

    r = introspect(token)
    assert r.status_code == 200
    assert r.json()["active"] is True
    assert r.json()["username"] == "ana"


def test_introspect_sin_secreto_da_403(navegador):
    login(navegador, "ana", "1234")
    token = navegador.cookies.get("session_token")

    sin_cabecera = TestClient(auth.app).post("/introspect", json={"token": token})
    assert sin_cabecera.status_code == 403
    assert introspect(token, secreto="secreto-malo").status_code == 403


def test_logout_directo_sin_secreto_da_403(navegador):
    login(navegador, "ana", "1234")
    token = navegador.cookies.get("session_token")

    r = TestClient(auth.app).post("/logout", json={"token": token})
    assert r.status_code == 403

    # La sesión sigue viva: nadie pudo cerrarla sin el secreto
    assert introspect(token).json()["active"] is True


# ---------- Logout ----------

def test_logout_revoca_la_sesion_y_borra_la_cookie(navegador):
    login(navegador, "ana", "1234")
    token = navegador.cookies.get("session_token")
    assert introspect(token).json()["active"] is True

    r = navegador.post("/auth/logout")
    assert r.status_code == 200
    assert 'session_token=""' in r.headers["set-cookie"] or "Max-Age=0" in r.headers["set-cookie"]

    # Del lado del servidor la sesión ya no existe
    assert introspect(token).json() == {"active": False}

    # Aunque alguien guardara el token, ya no sirve
    otro = TestClient(gateway.app)
    otro.cookies.set("session_token", token)
    assert otro.get("/api/products").status_code == 401


# ---------- Backend ----------

def test_backend_directo_sin_secreto_da_403():
    directo = TestClient(backend.app)
    assert directo.get("/products").status_code == 403
    assert directo.get("/orders").status_code == 403
    assert directo.get("/products", headers={"X-Gateway-Secret": "malo"}).status_code == 403
    assert directo.delete("/products/p01").status_code == 403


def test_backend_con_secreto_pero_sin_usuario_da_401():
    directo = TestClient(backend.app)
    r = directo.get("/products", headers={"X-Gateway-Secret": SECRETO_BACKEND})
    assert r.status_code == 401


def test_backend_solo_deja_borrar_al_admin():
    directo = TestClient(backend.app)
    base = {"X-Gateway-Secret": SECRETO_BACKEND, "X-Authenticated-User": "USR-001"}

    como_user = directo.delete("/products/p01", headers={**base, "X-Authenticated-Roles": "user"})
    assert como_user.status_code == 403

    como_admin = directo.delete("/products/p01", headers={**base, "X-Authenticated-Roles": "user,admin"})
    assert como_admin.status_code == 200
