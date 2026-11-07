import os
import secrets

from fastapi import FastAPI, Header, HTTPException, Depends

# Inicialización de la API
app = FastAPI(title="Protected Backend API - El Asador")

# Secreto que comparte con el Gateway (variable de entorno)
INTERNAL_GATEWAY_SECRET = os.getenv("INTERNAL_GATEWAY_SECRET")

if not INTERNAL_GATEWAY_SECRET:
    raise RuntimeError("INTERNAL_GATEWAY_SECRET no esta configurado")

# Datos simulados: los mismos productos y pedidos del front-end (js/datos.js)
PRODUCTOS = [
    {"id": "p01", "categoria": "parrilladas", "nombre": "Parrillada para 2", "precio": 24990, "disponible": True},
    {"id": "p02", "categoria": "parrilladas", "nombre": "Parrillada familiar", "precio": 44990, "disponible": True},
    {"id": "p03", "categoria": "parrilladas", "nombre": "Parrillada XL", "precio": 64990, "disponible": True},
    {"id": "p04", "categoria": "parrilla", "nombre": "Costillar de cerdo BBQ", "precio": 16990, "disponible": True},
    {"id": "p05", "categoria": "parrilla", "nombre": "Lomo vetado 400 g", "precio": 13990, "disponible": True},
    {"id": "p06", "categoria": "parrilla", "nombre": "Asado de tira 500 g", "precio": 12990, "disponible": True},
    {"id": "p07", "categoria": "parrilla", "nombre": "Choripán x4", "precio": 7990, "disponible": True},
    {"id": "p08", "categoria": "parrilla", "nombre": "Pollo a las brasas", "precio": 10990, "disponible": True},
    {"id": "p09", "categoria": "acompanamientos", "nombre": "Ensalada chilena", "precio": 3990, "disponible": True},
    {"id": "p10", "categoria": "acompanamientos", "nombre": "Papas rústicas", "precio": 4490, "disponible": True},
    {"id": "p11", "categoria": "acompanamientos", "nombre": "Pebre de la casa", "precio": 2990, "disponible": True},
    {"id": "p12", "categoria": "bebidas", "nombre": "Bebida 1,5 L", "precio": 2990, "disponible": True},
    {"id": "p13", "categoria": "bebidas", "nombre": "Cerveza artesanal 500 ml", "precio": 3490, "disponible": True}
]

PEDIDOS = [
    {"id": "A-1041", "cliente": "Tomás Núñez Reyes", "comuna": "Maipú",
     "lineas": [{"nombre": "Parrillada familiar", "cantidad": 1, "precio": 44990}, {"nombre": "Papas rústicas", "cantidad": 2, "precio": 4490}],
     "total": 61170, "pago": "Depósito bancario", "estado": "Pago pendiente"},
    {"id": "A-1040", "cliente": "Catalina Vega Pino", "comuna": "Ñuñoa",
     "lineas": [{"nombre": "Martes de costillar (promo)", "cantidad": 1, "precio": 20800}, {"nombre": "Ensalada chilena", "cantidad": 1, "precio": 3990}],
     "total": 24790, "pago": "Servipag", "estado": "En preparación"},
    {"id": "A-1039", "cliente": "Felipe Araya Soto", "comuna": "Las Condes",
     "lineas": [{"nombre": "Parrillada XL", "cantidad": 1, "precio": 64990}, {"nombre": "Cerveza artesanal 500 ml", "cantidad": 3, "precio": 3490}],
     "total": 78660, "pago": "Transferencia bancaria", "estado": "En camino"},
    {"id": "A-1038", "cliente": "Andrea Molina Fuentes", "comuna": "Providencia",
     "lineas": [{"nombre": "Parrillada familiar", "cantidad": 1, "precio": 44990}, {"nombre": "Bebida 1,5 L", "cantidad": 2, "precio": 2990}],
     "total": 50970, "pago": "Servipag", "estado": "Entregado"}
]


# Revisa que la llamada venga del Gateway
def verify_gateway(x_gateway_secret: str = Header(default="")):
    # Se compara en bytes para que un secreto con tildes dé 403 y no 500
    valid = secrets.compare_digest(
        x_gateway_secret.encode(),
        INTERNAL_GATEWAY_SECRET.encode()
    )

    if not valid:
        raise HTTPException(
            status_code=403,
            detail="Solicitud no autorizada desde Gateway"
        )


# Endpoint de estado de salud del servicio
@app.get("/health")
def health():
    return {"status": "OK"}


# Endpoint de productos (solo desde el Gateway)
@app.get("/products", dependencies=[Depends(verify_gateway)])
def products(x_authenticated_client: str | None = Header(default=None)):
    return {
        "authenticated_client": x_authenticated_client,
        "products": PRODUCTOS
    }


# Endpoint de órdenes (solo desde el Gateway)
@app.get("/orders", dependencies=[Depends(verify_gateway)])
def orders(x_authenticated_client: str | None = Header(default=None)):
    return {
        "authenticated_client": x_authenticated_client,
        "orders": PEDIDOS
    }
