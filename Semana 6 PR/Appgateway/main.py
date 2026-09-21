from fastapi import FastAPI

# Inicialización de la API
app = FastAPI(
    title="API Gateway", 
    description="API ubicada en localhost enrutada por APway"
)

# Endpoint de estado de salud del servicio
@app.get("/health")
def health():
    return {"status": "Service 2.0"}

# Endpoint simulado de productos
@app.get("/products")
def get_products():
    return [
        {"id": 1, "name": "Notebook", "price": 900000},
        {"id": 2, "name": "Monitor", "price": 250000}
    ]

# Endpoint simulado de órdenes
@app.get("/orders")
def get_orders():
    return [
        {"id": 6001, "status": "pagado"},
        {"id": 6002, "status": "pending"}
    ]