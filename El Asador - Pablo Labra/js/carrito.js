const lineas = () => leerCarrito().map(l => ({ ...l, item: buscarItem(l.id) })).filter(l => l.item).map(l => ({ ...l, incluido: l.incluido && l.item.disponible }));
const totales = comuna => {
  const marcadas = lineas().filter(l => l.incluido), subtotal = marcadas.reduce((s, l) => s + l.item.precio * l.cantidad, 0), despacho = subtotal && comuna ? costoDeComuna(comuna) : 0;
  return { marcadas, unidades: marcadas.reduce((s, l) => s + l.cantidad, 0), subtotal, despacho, total: subtotal + despacho };
};
const mostrarAviso = html => { $("carrito-aviso").innerHTML = html; $("carrito-aviso").hidden = !html; };
const pintarTotales = () => {
  const comuna = leerComunaElegida(), { unidades, subtotal, despacho, total } = totales(comuna);
  $("total-etiqueta-subtotal").textContent = `Subtotal (${unidades} ${unidades === 1 ? "producto" : "productos"})`;
  $("total-subtotal").textContent = precio(subtotal);
  $("total-despacho").textContent = !subtotal ? "$0" : !comuna ? "Elige tu comuna" : despacho ? precio(despacho) : "Gratis";
  $("total-total").textContent = precio(total);
};
const pintarCarrito = () => {
  $("carrito-lista").innerHTML = lineas().map(({ id, cantidad, incluido, item: i }) => `<li class="linea-carrito${i.disponible ? "" : " agotada"}"><input type="checkbox" class="form-check-input" id="incluir-${id}" onchange="cambiarIncluido('${id}')" ${incluido ? "checked" : ""} ${i.disponible ? "" : "disabled"}><img class="linea-miniatura" src="${i.imagen}" alt="" width="56" height="56"><label class="linea-nombre" for="incluir-${id}"><span class="linea-titulo">${escapar(i.nombre)}</span><span class="linea-unitario">${i.disponible ? precio(i.precio) + " c/u" : "Agotado por hoy, no se puede pagar"}</span></label><div class="cantidad" role="group" aria-label="Cantidad de ${escapar(i.nombre)}"><button type="button" id="menos-${id}" aria-label="Quitar una unidad de ${escapar(i.nombre)}" onclick="cambiarCantidad('${id}', -1)" ${cantidad <= 1 ? "disabled" : ""}><i class="bi bi-dash-lg" aria-hidden="true"></i></button><output>${cantidad}</output><button type="button" id="mas-${id}" aria-label="Agregar una unidad de ${escapar(i.nombre)}" onclick="cambiarCantidad('${id}', 1)" ${cantidad >= 20 ? "disabled" : ""}><i class="bi bi-plus-lg" aria-hidden="true"></i></button></div><span class="linea-total">${precio(i.precio * cantidad)}</span><button type="button" class="linea-quitar" aria-label="Quitar ${escapar(i.nombre)} del carrito" onclick="quitarLinea('${id}')"><i class="bi bi-trash3" aria-hidden="true"></i></button></li>`).join("") || `<li class="carrito-vacio"><i class="bi bi-basket3" aria-hidden="true"></i><p>Tu carrito está vacío.</p><p class="carrito-vacio-ayuda">Agrega una parrillada o una promo desde la carta.</p><a href="#carta" class="btn btn-sm btn-brasa">Ver la carta</a></li>`;
  mostrarAviso("");
  pintarTotales();
};
const editar = (id, f) => {
  guardarCarrito(leerCarrito().flatMap(l => l.id === id ? f(l) : [l]));
  pintarContadorCarrito();
  pintarCarrito();
};
const cambiarCantidad = (id, d) => {
  editar(id, l => [{ ...l, cantidad: Math.min(20, Math.max(1, l.cantidad + d)) }]);
  $(`${d > 0 ? "mas" : "menos"}-${id}`)?.focus();
};
const cambiarIncluido = id => {
  const marca = $(`incluir-${id}`).checked;
  editar(id, l => [{ ...l, incluido: marca }]);
  $(`incluir-${id}`).focus();
};
const quitarLinea = id => { editar(id, () => []); avisar("Producto quitado del carrito."); };
const pintarDespacho = () => {
  const nombre = leerComunaElegida(), c = buscarComuna(nombre), r = $("despacho-resultado");
  r.textContent = textoDespacho(nombre);
  r.classList.toggle("despacho-gratis", !!c && c.km <= CONFIG.kmDespachoGratis);
  $("regla-marca").hidden = !c;
  if (c) $("regla-marca").style.left = `${Math.min(100, c.km / 20 * 100)}%`;
};
const cambiarComuna = () => { guardarComunaElegida($("select-comuna").value); pintarDespacho(); pintarTotales(); };
const pintarCartaInicio = c => $("carta-lista").replaceChildren(...productosDeCategoria(c).map(p => filaCarta(p)));
const cambiarCategoria = c => { pintarCartaInicio(c); $("carta-lista").scrollTop = 0; };
const pagar = () => {
  const u = leerSesion(), c = u && buscarCliente(u.correo), comuna = leerComunaElegida() || c?.comuna || "", t = totales(comuna);
  if (!t.marcadas.length) return mostrarAviso(`<p class="mb-0">${leerCarrito().length ? "Marca al menos un producto del carrito para poder pagar." : "Tu carrito está vacío. Agrega productos desde la carta para poder pagar."}</p>`);
  if (!u) return mostrarAviso(`<p class="mb-2">Para pagar necesitas una cuenta de cliente. Puedes armar tu pedido sin cuenta, pero el pago solo está disponible para clientes registrados.</p><div class="d-flex flex-wrap gap-2"><button type="button" class="btn btn-sm btn-brasa" data-bs-toggle="modal" data-bs-target="#modal-acceso">Acceder</button><a href="registro.html" class="btn btn-sm btn-contorno-oscuro">Crear cuenta</a></div>`);
  if (u.rol !== "cliente") return mostrarAviso(`<p class="mb-0">Estás conectado con una cuenta interna. Para comprar, cierra sesión y entra con una cuenta de cliente.</p>`);
  if (t.marcadas.some(l => tieneAlcohol(l.id)) && !confirm("Tu pedido incluye cerveza. ¿Confirmas que eres mayor de 18 años?")) return;
  const pedido = { id: siguienteIdPedido(), fecha: new Date().toISOString(), origen: "web", cliente: { nombre: u.nombre, correo: u.correo, telefono: c?.telefono ?? "", direccion: c?.direccion ?? "", comuna, indicaciones: "" }, lineas: t.marcadas.map(l => ({ nombre: l.item.nombre, cantidad: l.cantidad, precio: l.item.precio })), subtotal: t.subtotal, despacho: t.despacho, total: t.total, pago: "Servipag", estado: "En preparación" };
  agregarPedido(pedido);
  guardarCarrito(leerCarrito().filter(l => !t.marcadas.some(m => m.id === l.id)));
  pintarContadorCarrito();
  pintarCarrito();
  mostrarAviso(`<p class="mb-0"><i class="bi bi-check-circle-fill text-success" aria-hidden="true"></i> <strong>Pedido ${pedido.id} recibido.</strong> Pagaste ${precio(pedido.total)} y ya lo estamos preparando. <a href="pedidos.html">Ver mis pedidos</a></p>`);
};
pintarFiltros($("filtros-carta"), "categoria-inicio");
pintarCartaInicio("todas");
pintarPromos($("promos-lista"), 2);
llenarSelectComunas($("select-comuna"), "Elige tu comuna", true);
$("select-comuna").value = leerComunaElegida();
$("select-comuna").addEventListener("change", cambiarComuna);
$("boton-pagar").addEventListener("click", pagar);
pintarDespacho();
pintarCarrito();
