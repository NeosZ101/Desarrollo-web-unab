const IMAGENES = ["parrillada-2", "parrillada-familiar", "parrillada-xl", "costillar", "lomo", "asado-tira", "choripan", "pollo", "ensalada", "papas", "pebre", "bebida", "cerveza"];
const ACTIVOS = ["Pago pendiente", "En preparación", "En camino"];
const SIGUIENTE = { "Pago pendiente": ["En preparación", "Confirmar pago"], "En preparación": ["En camino", "Enviar a reparto"], "En camino": ["Entregado", "Marcar entregado"] };
const DIAS = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
const historial = ventasEjemplo();
const secciones = () => { const u = leerSesion(); return u && u.rol !== "cliente" ? ROLES[u.rol].secciones : []; };
const puede = s => secciones().includes(s);
const fechaLarga = f => f.split("-").reverse().join("/");
const ventasDia = c => {
  if (c !== fechaHoy()) return historial.find(v => v.fecha === c) ?? { fecha: c, pedidos: 0, ventas: 0 };
  const hoy = leerPedidos().filter(p => p.estado !== "Anulado" && fechaATexto(new Date(p.fecha)) === c);
  return { fecha: c, pedidos: hoy.length, ventas: hoy.reduce((s, p) => s + p.total, 0) };
};
const diasDelPeriodo = (desde, hasta) => {
  const lista = [], f = new Date(`${desde}T00:00`);
  for (; fechaATexto(f) <= hasta && fechaATexto(f) <= fechaHoy(); f.setDate(f.getDate() + 1)) lista.push(ventasDia(fechaATexto(f)));
  return lista;
};
const pintarVentas = () => {
  const desde = $("vt-desde"), hasta = $("vt-hasta");
  if (!desde.value) [desde.value, hasta.value] = [fechaATexto(new Date(Date.now() - 6 * 864e5)), fechaHoy()];
  desde.max = hasta.max = fechaHoy();
  const mal = desde.value > hasta.value, ds = mal ? [] : diasDelPeriodo(desde.value, hasta.value);
  const total = ds.reduce((s, d) => s + d.ventas, 0), pedidos = ds.reduce((s, d) => s + d.pedidos, 0), mejor = ds.reduce((a, d) => d.ventas > a.ventas ? d : a, { ventas: 0 });
  $("vt-error").hidden = !mal;
  $("vt-error").textContent = "La fecha «Desde» no puede ser posterior a «Hasta». Cámbiala para ver el reporte.";
  $("kpi-ventas").textContent = precio(total);
  $("kpi-pedidos").textContent = pedidos;
  $("kpi-ticket").textContent = precio(pedidos ? Math.round(total / pedidos) : 0);
  $("kpi-mejor").textContent = mejor.ventas ? fechaLarga(mejor.fecha) : "Sin ventas";
  q("#vt-tabla tbody").innerHTML = ds.map(d => `<tr><th scope="row">${DIAS[new Date(`${d.fecha}T00:00`).getDay()]} ${fechaLarga(d.fecha)}</th><td class="text-end">${d.pedidos || "Cerrado"}</td><td class="text-end">${precio(d.ventas)}</td><td class="text-end">${d.pedidos ? precio(Math.round(d.ventas / d.pedidos)) : ""}</td></tr>`).join("") || `<tr><td colspan="4">No hay días para mostrar en este período.</td></tr>`;
};
const pintarProductos = () => q("#pr-tabla tbody").innerHTML = leerProductos().map(p => `<tr><th scope="row">${escapar(p.nombre)}</th><td>${CATEGORIAS.find(c => c.id === p.categoria)?.nombre ?? p.categoria}</td><td class="text-end">${precio(p.precio)}</td><td><div class="form-check form-switch"><input class="form-check-input" type="checkbox" role="switch" id="disp-${p.id}" ${p.disponible ? "checked" : ""} onchange="disponibilidad('${p.id}')"><label class="form-check-label" for="disp-${p.id}">${p.disponible ? "Disponible" : "Agotado"}</label></div></td><td><button type="button" class="btn btn-sm btn-outline-light me-2" aria-label="Editar ${escapar(p.nombre)}" onclick="formProducto('${p.id}')">Editar</button><button type="button" class="btn btn-sm btn-danger" aria-label="Eliminar ${escapar(p.nombre)}" onclick="borrarProducto('${p.id}')">Eliminar</button></td></tr>`).join("");
const disponibilidad = id => {
  const lista = leerProductos(), p = lista.find(x => x.id === id), marca = $(`disp-${id}`);
  p.disponible = marca.checked;
  guardarProductos(lista);
  marca.nextElementSibling.textContent = marca.checked ? "Disponible" : "Agotado";
  avisar(`${p.nombre}: ${marca.checked ? "disponible" : "agotado"}.`);
};
const borrarProducto = id => {
  const p = buscarProducto(id), promo = PROMOS.find(x => x.componentes.some(c => c.id === id));
  if (promo) return avisar(`No se puede eliminar «${p.nombre}» porque forma parte de la promo «${promo.nombre}». Márcalo como agotado en su lugar.`, "error");
  if (!confirm(`¿Eliminar «${p.nombre}» de la carta? Esta acción no se puede deshacer.`)) return;
  guardarProductos(leerProductos().filter(x => x.id !== id));
  pintarProductos();
  avisar(`«${p.nombre}» eliminado de la carta.`);
};
const formProducto = (id = "") => {
  const p = buscarProducto(id);
  $("form-producto").reset();
  $("pa-id").value = id;
  $("titulo-producto-admin").textContent = p ? "Editar producto" : "Nuevo producto";
  if (p) Object.entries({ "pa-nombre": p.nombre, "pa-categoria": p.categoria, "pa-precio": p.precio, "pa-descripcion": p.descripcion, "pa-imagen": p.imagen.replace(/^img\/|\.svg$/g, "") }).forEach(([k, v]) => $(k).value = v);
  bootstrap.Modal.getOrCreateInstance($("modal-producto-admin")).show();
};
const guardarProducto = e => {
  e.preventDefault();
  const id = $("pa-id").value, lista = leerProductos(), datos = { nombre: $("pa-nombre").value.trim(), categoria: $("pa-categoria").value, precio: +$("pa-precio").value, descripcion: $("pa-descripcion").value.trim(), imagen: `img/${$("pa-imagen").value}.svg` };
  if (id) Object.assign(lista.find(p => p.id === id), datos);
  else lista.push({ id: "p" + dos(Math.max(...lista.map(p => +p.id.slice(1))) + 1), ...datos, incluye: [datos.nombre], disponible: true });
  guardarProductos(lista);
  bootstrap.Modal.getInstance($("modal-producto-admin")).hide();
  pintarProductos();
  avisar(id ? "Producto actualizado." : "Producto agregado a la carta.");
};
const pintarClientes = () => {
  const t = $("cl-buscar").value.trim().toLowerCase();
  q("#cl-tabla tbody").innerHTML = leerClientes().filter(c => `${c.run} ${c.nombre} ${c.correo}`.toLowerCase().includes(t)).map(c => `<tr><td>${escapar(c.run)}</td><th scope="row">${escapar(c.nombre)}</th><td>${escapar(c.correo)}</td><td>${escapar(c.telefono)}</td><td>${escapar(c.comuna)}</td><td>${escapar(c.origen)}</td></tr>`).join("") || `<tr><td colspan="6">${t ? "No hay clientes que coincidan con la búsqueda." : "Todavía no hay clientes registrados."}</td></tr>`;
};
const guardarCliente = e => {
  e.preventDefault();
  const [run, nombre, correo, telefono, direccion, comuna] = ["run", "nombre", "correo", "telefono", "direccion", "comuna"].map(k => $(`ca-${k}`).value.trim());
  if (runYaRegistrado(run) || correoYaRegistrado(correo)) return avisar("Ya existe un cliente con ese RUN o correo.", "error");
  agregarCliente({ run, nombre, correo: correo.toLowerCase(), telefono, direccion, comuna, origen: "Local" });
  bootstrap.Modal.getInstance($("modal-cliente-admin")).hide();
  pintarTodo();
  avisar("Cliente registrado en el local.");
};
const pedidosFiltrados = () => {
  const f = $("de-filtro").value, orden = f === "activos" || ACTIVOS.includes(f) ? 1 : -1;
  return leerPedidos().filter(p => f === "todos" || (f === "activos" ? ACTIVOS.includes(p.estado) : p.estado === f)).sort((a, b) => orden * (new Date(a.fecha) - new Date(b.fecha)));
};
const acciones = p => {
  const adm = leerSesion().rol === "administrador", pendiente = p.estado === "Pago pendiente", [, texto] = SIGUIENTE[p.estado] ?? [];
  return `${texto && (!pendiente || adm) ? `<button type="button" class="btn btn-sm btn-primary me-1 mb-1" onclick="avanzar('${p.id}')">${texto}</button>` : pendiente ? `<span class="text-body-secondary">Esperando confirmación de pago</span>` : ""}${p.estado !== "Anulado" && !pendiente ? `<button type="button" class="btn btn-sm btn-outline-light me-1 mb-1" aria-label="Imprimir orden de despacho ${p.id}" onclick="imprimirOrden('${p.id}')">Imprimir orden</button>` : ""}${adm && sePuedeAnular(p) ? `<button type="button" class="btn btn-sm btn-danger mb-1" aria-label="Anular pedido ${p.id}" onclick="abrirAnulacion('${p.id}')">Anular</button>` : ""}`;
};
const pintarPedidos = () => q("#de-tabla tbody").innerHTML = pedidosFiltrados().map(p => `<tr><th scope="row" class="text-nowrap">${p.id}</th><td>${formatoFecha(p.fecha, true)}</td><td>${escapar(p.cliente.nombre)}</td><td>${escapar(p.cliente.direccion)}, ${escapar(p.cliente.comuna)}</td><td class="text-end">${precio(p.total)}</td><td>${p.pago}</td><td>${etiquetaEstado(p.estado)}</td><td>${acciones(p)}</td></tr>`).join("") || `<tr><td colspan="8">No hay pedidos con este filtro.</td></tr>`;
const avanzar = id => {
  const nuevo = SIGUIENTE[buscarPedido(id).estado][0];
  cambiarPedido(id, { estado: nuevo });
  pintarTodo();
  avisar(`Pedido ${id}: ${nuevo.toLowerCase()}.`);
};
const imprimirOrden = id => imprimirHoja(crearHojaPedido(buscarPedido(id)));
const anularAdmin = e => {
  e.preventDefault();
  if (!validarAnulacion()) return;
  guardarAnulacion();
  bootstrap.Modal.getInstance($("modal-anulacion")).hide();
  pintarTodo();
  avisar(`Pedido ${pedidoAnulando} anulado.`);
};
const restablecer = () => {
  if (!confirm("Se borrarán los cambios hechos en productos, clientes y pedidos, y se volverá a los datos de ejemplo. ¿Continuar?")) return;
  ["productos", "clientes", "pedidos", "carrito"].forEach(k => localStorage.removeItem(`asador.${k}`));
  pintarContadorCarrito();
  pintarTodo();
  avisar("Datos de demostración restablecidos.");
};
const pintarTodo = () => {
  if (puede("ventas")) pintarVentas();
  if (puede("productos")) pintarProductos();
  if (puede("clientes")) pintarClientes();
  if (puede("despacho")) pintarPedidos();
  $("admin-conteo").textContent = `${leerPedidos().length} pedidos, ${leerClientes().length} clientes`;
};
const mostrarAcceso = () => {
  const u = leerSesion(), permitidas = secciones(), ok = permitidas.length > 0;
  $("admin-acceso").hidden = ok;
  $("admin-panel").hidden = !ok;
  if (!ok) {
    $("admin-acceso-texto").textContent = u ? "Estás conectado como cliente. El panel interno es solo para el personal: cierra sesión y entra con una cuenta interna." : "Esta sección es solo para el personal de El Asador. Inicia sesión con una cuenta interna para continuar.";
    $("admin-acceso-acciones").hidden = !!u;
    $("admin-salir").hidden = !u;
    return;
  }
  qa("#admin-menu > li").forEach(li => li.hidden = !permitidas.includes(li.dataset.seccion));
  q("#admin-menu > li:not([hidden]) > button").click();
  $("admin-usuario").textContent = `${u.nombre}, ${ROLES[u.rol].etiqueta}`;
  $("admin-restablecer").hidden = u.rol !== "administrador";
  pintarTodo();
};
$("pa-categoria").innerHTML = `<option value="">Elige una categoría</option>${CATEGORIAS.filter(c => c.id !== "todas").map(c => `<option value="${c.id}">${c.nombre}</option>`).join("")}`;
llenarSelect($("pa-imagen"), IMAGENES, "Elige una imagen");
llenarSelectComunas($("ca-comuna"), "Elige una comuna", false);
["vt-desde", "vt-hasta"].forEach(id => $(id).addEventListener("change", pintarVentas));
$("pr-nuevo").addEventListener("click", () => formProducto());
$("form-producto").addEventListener("submit", guardarProducto);
$("cl-buscar").addEventListener("input", pintarClientes);
$("cl-nuevo").addEventListener("click", () => { $("form-cliente").reset(); bootstrap.Modal.getOrCreateInstance($("modal-cliente-admin")).show(); });
$("form-cliente").addEventListener("submit", guardarCliente);
$("de-filtro").addEventListener("change", pintarPedidos);
$("form-anulacion").addEventListener("submit", anularAdmin);
$("admin-restablecer").addEventListener("click", restablecer);
$("admin-salir").addEventListener("click", salir);
mostrarAcceso();
