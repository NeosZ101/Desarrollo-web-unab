import hashlib
import hmac
import os
import secrets
import time

from fastapi import Depends, FastAPI, Header, HTTPException
from pydantic import BaseModel

# Inicialización de la API
app = FastAPI(
    title="Auth Service - El Asador",
    description="Servicio de autenticación: login, introspección y logout"
)

# Secreto que debe presentar el Gateway para usar /introspect y /logout
AUTH_INTROSPECTION_SECRET = os.getenv("AUTH_INTROSPECTION_SECRET")

if not AUTH_INTROSPECTION_SECRET:
    raise RuntimeError("AUTH_INTROSPECTION_SECRET no esta configurado")

# Duración de la sesión: 15 minutos
TOKEN_LIFETIME_SECONDS = int(os.getenv("TOKEN_LIFETIME_SECONDS", "900"))


# Las contraseñas se guardan con hash (PBKDF2), no en texto plano
def hash_password(password, salt):
    return hashlib.pbkdf2_hmac(
        "sha256", password.encode(), bytes.fromhex(salt), 100_000
    ).hex()


# Usuarios simulados (los de la guía): ana/1234, pedro/5678, ernesto/admin123
USERS = {
    "ana": {
        "user_id": "USR-001",
        "salt": "bbfd2355c45fe9da",
        "password_hash": "c2a82a0c5c3f94db143247baec8324f2a20344b007637d9f6af79cd11399e2e1",
        "roles": ["user"]
    },
    "pedro": {
        "user_id": "USR-002",
        "salt": "c113eb422399d8f0",
        "password_hash": "71a85c19966fb9ace8bfdb949b86bf8b8f7bb9a630593c3f84ed53419d5ba09d",
        "roles": ["user"]
    },
    "ernesto": {
        "user_id": "USR-003",
        "salt": "e269dc1a9e4aae14",
        "password_hash": "437f4c11026a6015c460311188810fc3dab7d1b5c1b8ac3420c5646c60c8e1ca",
        "roles": ["user", "admin"]
    }
}

# Sesiones activas en memoria (token -> usuario)
SESSIONS = {}


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenRequest(BaseModel):
    token: str


# Revisa que la llamada venga del Gateway (cabecera X-Gateway-Auth-Secret)
def verify_gateway(x_gateway_auth_secret: str = Header(default="")):
    valid = secrets.compare_digest(
        x_gateway_auth_secret.encode(),
        AUTH_INTROSPECTION_SECRET.encode()
    )

    if not valid:
        raise HTTPException(status_code=403, detail="Gateway no autorizado")


# Endpoint de estado de salud del servicio
@app.get("/health")
def health():
    return {
        "status": "OK",
        "service": "Auth Service"
    }


# Endpoint de login: entrega un token si las credenciales son correctas
@app.post("/login")
def login(request: LoginRequest):
    user = USERS.get(request.username)

    # Se calcula el hash aunque el usuario no exista, así no se sabe qué usuarios hay
    salt = user["salt"] if user else "00" * 8
    password_hash = hash_password(request.password, salt)
    esperado = user["password_hash"] if user else "0" * 64

    if user is None or not hmac.compare_digest(password_hash, esperado):
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")

    access_token = secrets.token_urlsafe(32)

    SESSIONS[access_token] = {
        "user_id": user["user_id"],
        "username": request.username,
        "roles": user["roles"],
        "expires_at": time.time() + TOKEN_LIFETIME_SECONDS
    }

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": TOKEN_LIFETIME_SECONDS
    }


# Endpoint de introspección: dice si un token sigue activo (solo el Gateway)
@app.post("/introspect", dependencies=[Depends(verify_gateway)])
def introspect(request: TokenRequest):
    session = SESSIONS.get(request.token)

    if session is None:
        return {"active": False}

    # Si venció, se elimina
    if time.time() > session["expires_at"]:
        SESSIONS.pop(request.token, None)
        return {"active": False}

    return {
        "active": True,
        "user_id": session["user_id"],
        "username": session["username"],
        "roles": session["roles"]
    }


# Endpoint de logout: cierra la sesión (solo el Gateway)
@app.post("/logout", dependencies=[Depends(verify_gateway)])
def logout(request: TokenRequest):
    # Se elimina la sesión en el servidor, el token deja de servir
    existia = SESSIONS.pop(request.token, None) is not None
    return {"message": "Sesión finalizada", "revoked": existia}
