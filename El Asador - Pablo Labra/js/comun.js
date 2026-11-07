const $ = id => document.getElementById(id);
const q = s => document.querySelector(s);
const qa = s => [...document.querySelectorAll(s)];
const precio = v => "$" + v.toLocaleString("es-CL");
const kilometros = v => v.toFixed(1).replace(".", ",");
const escapar = t => String(t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const dos = n => String(n).padStart(2, "0");
const fechaATexto = (d = new Date()) => new Date(+d - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
const fechaHoy = () => fechaATexto();
const formatoFecha = (t, hora) => {
  const d = new Date(t);
  return `${dos(d.getDate())}/${dos(d.getMonth() + 1)}/${d.getFullYear()}${hora ? ` ${dos(d.getHours())}:${dos(d.getMinutes())}` : ""}`;
};
const leer = (k, d) => JSON.parse(localStorage.getItem(k)) ?? JSON.parse(JSON.stringify(d));
const guardar = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const leerProductos = () => leer("asador.productos", PRODUCTOS);
const guardarProductos = l => guardar("asador.productos", l);
const buscarProducto = id => leerProductos().find(p => p.id === id);
const buscarPromo = id => PROMOS.find(p => p.id === id);
const precioNormalPromo = p => p.componentes.reduce((s, c) => s + buscarProducto(c.id).precio * c.cantidad, 0);
const precioPromo = p => Math.round(precioNormalPromo(p) * (1 - p.descuento / 100) / 10) * 10;
const promoDisponible = p => p.componentes.every(c => buscarProducto(c.id)?.disponible);
const tieneAlcohol = id => (buscarPromo(id)?.componentes.map(c => c.id) ?? [id]).includes("p13");
const buscarItem = id => {
  const promo = buscarPromo(id), p = buscarProducto(id);
  if (promo) return { ...promo, tipo: "promo", nombre: `${promo.nombre} (promo)`, titulo: promo.nombre, precio: precioPromo(promo), precioNormal: precioNormalPromo(promo), disponible: promoDisponible(promo), personas: 0, incluye: promo.componentes.map(c => `${c.cantidad} × ${buscarProducto(c.id).nombre}`) };
  return p ? { ...p, tipo: "producto", titulo: p.nombre, vigencia: "", descuento: 0, precioNormal: p.precio } : null;
};
const leerCarrito = () => leer("asador.carrito", []);
const guardarCarrito = l => guardar("asador.carrito", l);
const contarUnidades = () => leerCarrito().reduce((s, l) => s + l.cantidad, 0);
const agregarAlCarrito = id => {
  const l = leerCarrito(), x = l.find(i => i.id === id);
  if (x) Object.assign(x, { cantidad: Math.min(x.cantidad + 1, 20), incluido: true });
  else l.push({ id, cantidad: 1, incluido: true });
  guardarCarrito(l);
};
const buscarComuna = n => COMUNAS.find(c => c.nombre === n) ?? null;
const costoDespacho = km => km <= CONFIG.kmDespachoGratis ? 0 : CONFIG.despachoBase + Math.ceil(km - CONFIG.kmDespachoGratis) * CONFIG.despachoPorKm;
const costoDeComuna = n => costoDespacho(buscarComuna(n)?.km ?? 0);
const leerComunaElegida = () => leer("asador.comuna", "");
const guardarComunaElegida = n => guardar("asador.comuna", n);
const textoDespacho = n => {
  const c = buscarComuna(n);
  if (!c) return "Elige tu comuna para ver el costo de despacho.";
  const base = `${c.nombre} está a ${kilometros(c.km)} km`;
  return c.km <= CONFIG.kmDespachoGratis ? `Despacho gratis: ${base} del local.` : `Despacho ${precio(costoDespacho(c.km))}: ${base} y los primeros ${CONFIG.kmDespachoGratis} km son gratis.`;
};
const leerSesion = () => leer("asador.sesion", null);
const guardarSesion = u => guardar("asador.sesion", u);
const salir = () => { localStorage.removeItem("asador.sesion"); location.reload(); };
const leerClientes = () => leer("asador.clientes", CLIENTES_EJEMPLO);
const buscarCliente = correo => leerClientes().find(c => c.correo.toLowerCase() === correo.trim().toLowerCase()) ?? null;
const agregarCliente = c => guardar("asador.clientes", [...leerClientes(), c]);
const leerPedidos = () => leer("asador.pedidos", PEDIDOS_EJEMPLO);
const guardarPedidos = l => guardar("asador.pedidos", l);
const buscarPedido = id => leerPedidos().find(p => p.id === id) ?? null;
const agregarPedido = p => guardarPedidos([p, ...leerPedidos()]);
const cambiarPedido = (id, cambios) => guardarPedidos(leerPedidos().map(p => p.id === id ? { ...p, ...cambios } : p));
const siguienteIdPedido = () => "A-" + (Math.max(1000, ...leerPedidos().map(p => +p.id.split("-")[1])) + 1);
const pedidosDelCliente = correo => leerPedidos().filter(p => p.cliente.correo.toLowerCase() === correo.trim().toLowerCase());
const sePuedeAnular = p => ["Pago pendiente", "En preparación"].includes(p.estado);
const etiquetaEstado = e => `<span class="badge text-bg-${{ "Pago pendiente": "warning", "En preparación": "info", "En camino": "primary", Entregado: "success" }[e] ?? "secondary"}">${e}</span>`;
const llenarSelect = (s, lista, ini) => s.innerHTML = `<option value="">${ini}</option>${lista.map(t => `<option>${t}</option>`).join("")}`;
const llenarSelectComunas = (s, ini, km) => s.innerHTML = `<option value="">${ini}</option>${COMUNAS.map(c => `<option value="${c.nombre}">${c.nombre}${km ? ` (${kilometros(c.km)} km)` : ""}</option>`).join("")}`;
const avisar = (m, tipo = "ok") => {
  const err = tipo === "error";
  $("avisos").innerHTML = `<div class="toast aviso aviso-${tipo}" role="${err ? "alert" : "status"}" aria-atomic="true"><div class="d-flex align-items-center"><div class="toast-body"><i class="bi bi-${err ? "exclamation-triangle-fill" : "check-circle-fill"}"></i> ${escapar(m)}</div><button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Cerrar aviso"></button></div></div>`;
  new bootstrap.Toast($("avisos").firstChild, { delay: 4000 }).show();
};
const imprimirHoja = html => {
  $("hoja-impresion").innerHTML = html;
  document.body.classList.add("imprimiendo");
  print();
  document.body.classList.remove("imprimiendo");
};
const crearHojaPedido = p => {
  const c = p.cliente, fila = ([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`;
  const datos = [["Pedido", p.id], ["Fecha", formatoFecha(p.fecha, true)], ["Cliente", escapar(c.nombre)], ["Teléfono", escapar(c.telefono || "Sin teléfono")], ["Dirección", `${escapar(c.direccion)}, ${escapar(c.comuna)}`], ["Indicaciones", escapar(c.indicaciones || "Sin indicaciones")], ["Medio de pago", p.pago], ["Estado", p.estado]];
  const filas = p.lineas.map(l => `<tr><td>${l.cantidad}</td><td>${escapar(l.nombre)}</td><td class="num">${precio(l.precio)}</td><td class="num">${precio(l.precio * l.cantidad)}</td></tr>`).join("");
  return `<article class="hoja"><header class="hoja-cabecera"><h1>El Asador</h1><p>Parrilladas familiares. ${CONFIG.telefono}, ${CONFIG.correo}</p></header><h2>Orden de despacho ${p.id}</h2><dl class="hoja-datos">${datos.map(fila).join("")}</dl><table class="hoja-tabla"><thead><tr><th>Cant.</th><th>Producto</th><th class="num">Precio</th><th class="num">Total</th></tr></thead><tbody>${filas}</tbody></table><dl class="hoja-totales">${[["Subtotal", precio(p.subtotal)], ["Despacho", p.despacho ? precio(p.despacho) : "Gratis"], ["Total", precio(p.total)]].map(fila).join("")}</dl><p class="hoja-control">Preparado [   ]    Despachado [   ]    Entregado [   ]</p><p class="hoja-firma">Nombre y firma de quien recibe: ______________________________</p></article>`;
};
const mostrarError = (campo, m) => { campo.classList.add("is-invalid"); campo.parentNode.querySelector(".invalid-feedback").textContent = m; campo.focus(); };
const limpiarErrores = f => { f.querySelectorAll(".is-invalid").forEach(c => c.classList.remove("is-invalid")); f.querySelectorAll(".invalid-feedback").forEach(m => m.textContent = ""); };
const limpiarRun = t => t.replace(/[^0-9kK]/g, "").toUpperCase();
const correoValido = t => /^\S+@\S+\.\S+$/.test(t);
const runYaRegistrado = t => leerClientes().some(c => limpiarRun(c.run) === limpiarRun(t));
const correoYaRegistrado = t => !!buscarCliente(t) || USUARIOS_INTERNOS.some(u => u.correo === t.trim().toLowerCase());
const pintarContadorCarrito = () => {
  const n = contarUnidades();
  $("contador-carrito").textContent = n;
  $("contador-carrito").hidden = !n;
  $("enlace-carrito").setAttribute("aria-label", `Ir al carrito: ${n} ${n === 1 ? "producto" : "productos"}`);
};
const pintarCuenta = () => {
  const u = leerSesion(), cli = u?.rol === "cliente";
  $("zona-cuenta").innerHTML = u
    ? `<button type="button" class="btn btn-contorno dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false"><i class="bi bi-person-circle" aria-hidden="true"></i> ${escapar(u.nombre.split(" ")[0])}</button><ul class="dropdown-menu dropdown-menu-end"><li><span class="dropdown-item-text cuenta-rol">${ROLES[u.rol].etiqueta}: ${escapar(u.correo)}</span></li><li><a class="dropdown-item" href="${cli ? "pedidos.html" : "admin.html"}"><i class="bi bi-${cli ? "receipt" : "speedometer2"}" aria-hidden="true"></i> ${cli ? "Mis pedidos" : "Panel interno"}</a></li><li><hr class="dropdown-divider"></li><li><button type="button" class="dropdown-item" id="boton-salir"><i class="bi bi-box-arrow-right" aria-hidden="true"></i> Cerrar sesión</button></li></ul>`
    : `<button type="button" class="btn btn-contorno" data-bs-toggle="modal" data-bs-target="#modal-acceso"><i class="bi bi-person-circle" aria-hidden="true"></i> Acceder</button>`;
  $("boton-salir")?.addEventListener("click", salir);
};
const enviarAcceso = e => {
  e.preventDefault();
  const correo = $("acceso-correo").value.trim().toLowerCase(), err = $("acceso-error");
  const interno = USUARIOS_INTERNOS.find(u => u.correo === correo), u = interno ?? buscarCliente(correo);
  const fallo = !u ? `No encontramos una cuenta con ese correo. Revisa que esté bien escrito o crea una cuenta nueva. <a href="registro.html" class="alert-link">Crear cuenta</a>` : interno && interno.clave !== $("acceso-clave").value ? "La clave no coincide con la de esta cuenta interna. Revisa mayúsculas y minúsculas." : "";
  err.hidden = !fallo;
  err.innerHTML = fallo;
  if (!fallo) { guardarSesion({ nombre: u.nombre, correo: u.correo, rol: u.rol ?? "cliente" }); location.reload(); }
};
let pedidoAnulando = "";
const abrirAnulacion = id => {
  const p = buscarPedido(id);
  if (!p) return;
  if (!sePuedeAnular(p)) return avisar(`El pedido ${p.id} ya está «${p.estado}» y no se puede anular. Escríbenos desde Contacto si necesitas ayuda.`, "error");
  pedidoAnulando = id;
  $("form-anulacion").reset();
  limpiarErrores($("form-anulacion"));
  $("anulacion-texto").textContent = `Vas a anular el pedido ${p.id} por ${precio(p.total)}.`;
  bootstrap.Modal.getOrCreateInstance($("modal-anulacion")).show();
};
const validarAnulacion = () => {
  const detalle = $("anulacion-detalle");
  limpiarErrores($("form-anulacion"));
  if ($("anulacion-motivo").value !== "Otro motivo" || detalle.value.trim()) return true;
  mostrarError(detalle, "Cuéntanos cuál es el motivo para poder anular la compra.");
  return false;
};
const guardarAnulacion = () => {
  const motivo = $("anulacion-motivo").value, detalle = $("anulacion-detalle").value.trim(), u = leerSesion();
  cambiarPedido(pedidoAnulando, { estado: "Anulado", motivoAnulacion: detalle ? `${motivo}: ${detalle}` : motivo, anuladoPor: u ? ROLES[u.rol].etiqueta : "Cliente", fechaAnulacion: new Date().toISOString() });
};
qa("form").forEach(f => f.noValidate = false);
$("form-acceso").addEventListener("submit", enviarAcceso);
$("modal-acceso").addEventListener("show.bs.modal", () => { $("form-acceso").reset(); $("acceso-error").hidden = true; });
$("modal-acceso").addEventListener("shown.bs.modal", () => $("acceso-correo").focus());
pintarContadorCarrito();
pintarCuenta();
