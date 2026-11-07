/* ---------- Reglas del negocio ---------- */
const CONFIG = {
  kmDespachoGratis: 3, // "Despacho gratuito a 3 km" (requisito del caso)
  despachoBase: 2000, // costo fijo si la comuna queda sobre los 3 km
  despachoPorKm: 400, // costo por cada km adicional
  telefono: "+56 9 0000 0000",
  correo: "contacto@elasador.example",
};

/* ---------- Comunas con despacho (distancia al local, en km) ---------- */
const COMUNAS = [
  { nombre: "Providencia", km: 1.5 },
  { nombre: "Ñuñoa", km: 2.8 },
  { nombre: "Santiago", km: 3.6 },
  { nombre: "Las Condes", km: 5.2 },
  { nombre: "Macul", km: 6.4 },
  { nombre: "La Reina", km: 7.1 },
  { nombre: "San Miguel", km: 8.9 },
  { nombre: "La Florida", km: 12.3 },
  { nombre: "Maipú", km: 15.8 },
  { nombre: "Puente Alto", km: 18.5 },
];

/* ---------- Categorías de la carta ---------- */
const CATEGORIAS = [
  { id: "todas", nombre: "Toda la carta" },
  { id: "parrilladas", nombre: "Parrilladas" },
  { id: "parrilla", nombre: "A la parrilla" },
  { id: "acompanamientos", nombre: "Acompañamientos" },
  { id: "bebidas", nombre: "Bebidas" },
];

/* ---------- Productos ---------- */
const PRODUCTOS = [
  {
    id: "p01",
    categoria: "parrilladas",
    nombre: "Parrillada para 2",
    precio: 24990,
    disponible: true,
    personas: 2,
    imagen: "img/parrillada-2.svg",
    descripcion: "Lomo vetado, chorizos parrilleros y pollo, con papas rústicas.",
    incluye: ["Lomo vetado 300 g", "2 chorizos parrilleros", "2 presas de pollo", "Papas rústicas"],
  },
  {
    id: "p02",
    categoria: "parrilladas",
    nombre: "Parrillada familiar",
    precio: 44990,
    disponible: true,
    personas: 4,
    imagen: "img/parrillada-familiar.svg",
    descripcion: "Para 4 personas: lomo, costillar, chorizos y pollo, con ensalada y pebre.",
    incluye: ["Lomo vetado 600 g", "Costillar de cerdo", "4 chorizos parrilleros", "4 presas de pollo", "Ensalada chilena", "Pebre de la casa"],
  },
  {
    id: "p03",
    categoria: "parrilladas",
    nombre: "Parrillada XL",
    precio: 64990,
    disponible: true,
    personas: 6,
    imagen: "img/parrillada-xl.svg",
    descripcion: "Para 6 personas: tres cortes, chorizos, pollo y todos los acompañamientos.",
    incluye: ["Lomo vetado 900 g", "Asado de tira 600 g", "Costillar de cerdo", "6 chorizos parrilleros", "6 presas de pollo", "2 ensaladas chilenas", "Papas rústicas", "Pebre de la casa"],
  },
  {
    id: "p04",
    categoria: "parrilla",
    nombre: "Costillar de cerdo BBQ",
    precio: 16990,
    disponible: true,
    imagen: "img/costillar.svg",
    descripcion: "Cocido lento y terminado a la parrilla con salsa BBQ ahumada. Unos 900 g.",
    incluye: ["Costillar de cerdo (900 g aprox.)", "Salsa BBQ ahumada"],
  },
  {
    id: "p05",
    categoria: "parrilla",
    nombre: "Lomo vetado 400 g",
    precio: 13990,
    disponible: true,
    imagen: "img/lomo.svg",
    descripcion: "Corte tierno con su borde de grasa, sellado al carbón y jugoso por dentro.",
    incluye: ["Lomo vetado 400 g", "Sal de parrilla"],
  },
  {
    id: "p06",
    categoria: "parrilla",
    nombre: "Asado de tira 500 g",
    precio: 12990,
    disponible: true,
    imagen: "img/asado-tira.svg",
    descripcion: "Tira ancha con hueso, cocinada a fuego lento sobre las brasas.",
    incluye: ["Asado de tira 500 g", "Sal de parrilla"],
  },
  {
    id: "p07",
    categoria: "parrilla",
    nombre: "Choripán x4",
    precio: 7990,
    disponible: true,
    imagen: "img/choripan.svg",
    descripcion: "Cuatro choripanes con chorizo parrillero y pan de campo.",
    incluye: ["4 chorizos parrilleros", "4 panes de campo", "Pebre de la casa"],
  },
  {
    id: "p08",
    categoria: "parrilla",
    nombre: "Pollo a las brasas",
    precio: 10990,
    disponible: true,
    imagen: "img/pollo.svg",
    descripcion: "Pollo entero marinado toda la noche, dorado a las brasas.",
    incluye: ["Pollo entero (8 presas)", "Marinado de la casa"],
  },
  {
    id: "p09",
    categoria: "acompanamientos",
    nombre: "Ensalada chilena",
    precio: 3990,
    disponible: true,
    imagen: "img/ensalada.svg",
    descripcion: "Tomate y cebolla con cilantro, aliñada al momento.",
    incluye: ["Tomate", "Cebolla", "Cilantro", "Aliño de limón y aceite"],
  },
  {
    id: "p10",
    categoria: "acompanamientos",
    nombre: "Papas rústicas",
    precio: 4490,
    disponible: true,
    imagen: "img/papas.svg",
    descripcion: "Papas con cáscara, doradas al horno con merkén.",
    incluye: ["Papas con cáscara", "Merkén", "Aceite de oliva"],
  },
  {
    id: "p11",
    categoria: "acompanamientos",
    nombre: "Pebre de la casa",
    precio: 2990,
    disponible: true,
    imagen: "img/pebre.svg",
    descripcion: "Tomate, cebolla, cilantro y ají cacho de cabra. Sale picante.",
    incluye: ["Tomate", "Cebolla", "Cilantro", "Ají cacho de cabra"],
  },
  {
    id: "p12",
    categoria: "bebidas",
    nombre: "Bebida 1,5 L",
    precio: 2990,
    disponible: true,
    imagen: "img/bebida.svg",
    descripcion: "Bebida cola bien helada, botella de 1,5 litros.",
    incluye: ["Bebida cola 1,5 L"],
  },
  {
    id: "p13",
    categoria: "bebidas",
    nombre: "Cerveza artesanal 500 ml",
    precio: 3490,
    disponible: true,
    imagen: "img/cerveza.svg",
    descripcion: "Cerveza rubia artesanal. Venta solo a mayores de 18 años.",
    incluye: ["Cerveza artesanal rubia 500 ml"],
  },
];

/* ---------- Promociones (se calculan a partir de los productos) ---------- */
const PROMOS = [
  {
    id: "promo1",
    nombre: "Combo familiar",
    descripcion: "Parrillada familiar con 2 bebidas de 1,5 L y pebre.",
    vigencia: "Válido de lunes a jueves",
    descuento: 20,
    imagen: "img/promo-familiar.svg",
    componentes: [
      { id: "p02", cantidad: 1 },
      { id: "p12", cantidad: 2 },
      { id: "p11", cantidad: 1 },
    ],
  },
  {
    id: "promo2",
    nombre: "Martes de costillar",
    descripcion: "Costillar BBQ con papas rústicas y una bebida de 1,5 L.",
    vigencia: "Solo los martes",
    descuento: 15,
    imagen: "img/promo-costillar.svg",
    componentes: [
      { id: "p04", cantidad: 1 },
      { id: "p10", cantidad: 1 },
      { id: "p12", cantidad: 1 },
    ],
  },
  {
    id: "promo3",
    nombre: "Combo pareja",
    descripcion: "Parrillada para 2 con dos cervezas artesanales.",
    vigencia: "Viernes y sábado",
    descuento: 10,
    imagen: "img/promo-pareja.svg",
    componentes: [
      { id: "p01", cantidad: 1 },
      { id: "p13", cantidad: 2 },
    ],
  },
];

/* El precio de cada promo se calcula en Catalogo (comun.js) a partir del precio actual de sus productos. */

/* ---------- Página "Empresa" ---------- */
const VALORES = [
  {
    icono: "bi-fire",
    titulo: "Misión",
    texto: "Reunir a las familias alrededor de una buena parrillada, con cortes frescos, cocinados al carbón y entregados a tiempo.",
  },
  {
    icono: "bi-binoculars",
    titulo: "Visión",
    texto: "Ser la parrillería de barrio más querida de Santiago por su sabor, su puntualidad y su trato cercano.",
  },
  {
    icono: "bi-heart",
    titulo: "Valores",
    texto: "Producto fresco, cocina honesta, puntualidad y respeto por la mesa de cada familia.",
  },
];

const EQUIPO = [
  { nombre: "Luis Contreras", cargo: "Maestro parrillero", detalle: "Veinte años frente a la parrilla. Elige y corta cada pieza." },
  { nombre: "Marcela Rojas", cargo: "Jefa de cocina", detalle: "Prepara los adobos, el pebre y las salsas de la casa." },
  { nombre: "Diego Herrera", cargo: "Encargado de despacho", detalle: "Coordina las rutas para que el pedido llegue caliente." },
  { nombre: "Camila Soto", cargo: "Atención al cliente", detalle: "Responde tus consultas y arma pedidos para eventos." },
];

/* ============================================================
   Datos adicionales del back-end simulado
   (registro, perfiles, pedidos de ejemplo, eventos)
   ============================================================ */

/* ---------- Ubicaciones para el registro: región > provincia > comuna ---------- */
/* Solo se despacha en la Región Metropolitana, por eso es la única región disponible. */
const UBICACIONES = [
  {
    region: "Región Metropolitana de Santiago",
    provincias: [
      {
        nombre: "Santiago",
        comunas: ["Santiago", "Providencia", "Ñuñoa", "Las Condes", "La Reina", "Macul", "San Miguel", "La Florida", "Maipú"],
      },
      { nombre: "Cordillera", comunas: ["Puente Alto"] },
    ],
  },
];

/* ---------- Perfiles internos (autenticación por perfil, CU1) ---------- */
/* Claves en texto plano SOLO porque es una demostración sin back-end.
   En el sistema real se validan en el servidor y se guardan cifradas. */
const USUARIOS_INTERNOS = [
  { correo: "admin@elasador.cl", clave: "admin123", nombre: "Camila Soto", rol: "administrador" },
  { correo: "dueno@elasador.cl", clave: "dueno123", nombre: "Héctor Valdés", rol: "dueno" },
  { correo: "despacho@elasador.cl", clave: "despacho123", nombre: "Diego Herrera", rol: "despacho" },
];

/* Qué secciones del panel interno ve cada perfil. */
const ROLES = {
  administrador: { etiqueta: "Administrador", secciones: ["ventas", "productos", "clientes", "despacho"] },
  dueno: { etiqueta: "Dueño", secciones: ["ventas", "productos"] },
  despacho: { etiqueta: "Encargado de despacho", secciones: ["despacho"] },
  cliente: { etiqueta: "Cliente", secciones: [] },
};

/* ---------- Clientes de ejemplo (el mantenedor de clientes y el "Acceder" los usan) ---------- */
const CLIENTES_EJEMPLO = [
  { run: "12.345.678-5", nombre: "Andrea Molina Fuentes", correo: "andrea.molina@correo.cl", telefono: "+56 9 5555 0101", direccion: "Los Aromos 1234, depto. 51", comuna: "Providencia", origen: "Web" },
  { run: "15.876.543-3", nombre: "Felipe Araya Soto", correo: "felipe.araya@correo.cl", telefono: "+56 9 5555 0102", direccion: "Pasaje Los Olmos 88", comuna: "Las Condes", origen: "Web" },
  { run: "17.222.333-4", nombre: "Catalina Vega Pino", correo: "catalina.vega@correo.cl", telefono: "+56 9 5555 0103", direccion: "Av. Los Alerces 456", comuna: "Ñuñoa", origen: "Local" },
  { run: "9.876.543-3", nombre: "Tomás Núñez Reyes", correo: "tomas.nunez@correo.cl", telefono: "+56 9 5555 0104", direccion: "Calle Las Rosas 2200", comuna: "Maipú", origen: "Web" },
];

/* ---------- Pedidos de ejemplo (para el panel interno y "Mis pedidos") ---------- */
/* Las fechas se calculan respecto de hoy para que siempre se vean recientes. */
function fechaEjemplo(diasAtras, hora, minuto) {
  let fecha = new Date();
  fecha.setDate(fecha.getDate() - diasAtras);
  fecha.setHours(hora, minuto, 0, 0);
  return fecha.toISOString();
}

const PEDIDOS_EJEMPLO = [
  {
    id: "A-1041", fecha: fechaEjemplo(0, 13, 12), origen: "ejemplo",
    cliente: { nombre: "Tomás Núñez Reyes", correo: "tomas.nunez@correo.cl", telefono: "+56 9 5555 0104", direccion: "Calle Las Rosas 2200", comuna: "Maipú", indicaciones: "Tocar el timbre dos veces." },
    lineas: [ { nombre: "Parrillada familiar", cantidad: 1, precio: 44990 }, { nombre: "Papas rústicas", cantidad: 2, precio: 4490 } ],
    subtotal: 53970, despacho: 7200, total: 61170, pago: "Depósito bancario", estado: "Pago pendiente",
  },
  {
    id: "A-1040", fecha: fechaEjemplo(0, 12, 40), origen: "ejemplo",
    cliente: { nombre: "Catalina Vega Pino", correo: "catalina.vega@correo.cl", telefono: "+56 9 5555 0103", direccion: "Av. Los Alerces 456", comuna: "Ñuñoa", indicaciones: "" },
    lineas: [ { nombre: "Martes de costillar (promo)", cantidad: 1, precio: 20800 }, { nombre: "Ensalada chilena", cantidad: 1, precio: 3990 } ],
    subtotal: 24790, despacho: 0, total: 24790, pago: "Servipag", estado: "En preparación",
  },
  {
    id: "A-1039", fecha: fechaEjemplo(1, 20, 5), origen: "ejemplo",
    cliente: { nombre: "Felipe Araya Soto", correo: "felipe.araya@correo.cl", telefono: "+56 9 5555 0102", direccion: "Pasaje Los Olmos 88", comuna: "Las Condes", indicaciones: "Casa con portón negro." },
    lineas: [ { nombre: "Parrillada XL", cantidad: 1, precio: 64990 }, { nombre: "Cerveza artesanal 500 ml", cantidad: 3, precio: 3490 } ],
    subtotal: 75460, despacho: 3200, total: 78660, pago: "Transferencia bancaria", estado: "En camino",
  },
  {
    id: "A-1038", fecha: fechaEjemplo(2, 19, 30), origen: "ejemplo",
    cliente: { nombre: "Andrea Molina Fuentes", correo: "andrea.molina@correo.cl", telefono: "+56 9 5555 0101", direccion: "Los Aromos 1234, depto. 51", comuna: "Providencia", indicaciones: "Conserje recibe el pedido." },
    lineas: [ { nombre: "Parrillada familiar", cantidad: 1, precio: 44990 }, { nombre: "Bebida 1,5 L", cantidad: 2, precio: 2990 } ],
    subtotal: 50970, despacho: 0, total: 50970, pago: "Servipag", estado: "Entregado",
  },
];

/* ---------- Eventos y catering (cotizador de la página Servicios) ---------- */
const EVENTO = { minPersonas: 10, precioParrillero: 60000 };

const MENUS_EVENTO = [
  { id: "clasico", nombre: "Menú clásico", precioPersona: 9990, incluye: "Chorizo parrillero, pollo a las brasas y ensalada chilena." },
  { id: "parrillero", nombre: "Menú parrillero", precioPersona: 13990, incluye: "Lomo vetado, costillar, chorizo y pollo, con ensalada y pebre." },
  { id: "premium", nombre: "Menú premium", precioPersona: 17990, incluye: "Lomo vetado, asado de tira, costillar y pollo, con papas rústicas." },
];

/* ---------- Ventas de ejemplo para el reporte del dueño (últimos 28 días) ---------- */
/* No usa números al azar: el mismo día siempre da el mismo resultado. */
function ventasEjemplo() {
  // Cuánto se vende cada día de la semana: domingo, lunes (cerrado), martes ... sábado
  let factorPorDia = [1.4, 0, 0.7, 0.65, 0.8, 1.25, 1.6];
  let lista = [];
  for (let atras = 28; atras >= 1; atras = atras - 1) {
    let fecha = new Date();
    fecha.setHours(0, 0, 0, 0);
    fecha.setDate(fecha.getDate() - atras);
    let factor = factorPorDia[fecha.getDay()];
    let pedidos = 0;
    if (factor !== 0) {
      pedidos = Math.round(18 * factor) + (fecha.getDate() % 4);
    }
    let ticket = 34000 + ((fecha.getDate() * 731) % 9000);
    let mes = fecha.getMonth() + 1;
    if (mes < 10) {
      mes = "0" + mes;
    }
    let dia = fecha.getDate();
    if (dia < 10) {
      dia = "0" + dia;
    }
    let clave = fecha.getFullYear() + "-" + mes + "-" + dia;
    lista.push({ fecha: clave, pedidos: pedidos, ventas: pedidos * ticket });
  }
  return lista;
}
