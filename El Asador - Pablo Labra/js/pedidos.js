function tarjetaPedido(pedido) {
  let anulado = pedido.estado === "Anulado";
  let despacho = "Gratis";
  if (pedido.despacho > 0) {
    despacho = precio(pedido.despacho);
  }

  let html = '<article class="card bg-dark p-3 mb-3">';
  html += '<div class="d-flex justify-content-between align-items-center mb-2">';
  html += '<h2 class="h5 mb-0">Pedido ' + pedido.id + "</h2>";
  html += etiquetaEstado(pedido.estado);
  html += "</div>";
  html += "<p>" + formatoFecha(pedido.fecha, true) + ". Pago con " + pedido.pago;
  html += ". Despacho a " + escapar(pedido.cliente.direccion) + ", " + escapar(pedido.cliente.comuna) + ".</p>";

  if (anulado === true) {
    let motivo = "sin motivo registrado";
    if (pedido.motivoAnulacion) {
      motivo = pedido.motivoAnulacion;
    }
    let fechaAnulacion = pedido.fecha;
    if (pedido.fechaAnulacion) {
      fechaAnulacion = pedido.fechaAnulacion;
    }
    html += '<p class="alert alert-secondary" role="status">Anulado el ' + formatoFecha(fechaAnulacion, true) + ". Motivo: " + escapar(motivo) + ".</p>";
  }

  html += '<details class="mb-3"><summary>Ver detalle del pedido</summary>';
  html += '<ul class="list-group list-group-flush mt-2">';
  for (let i = 0; i < pedido.lineas.length; i++) {
    let linea = pedido.lineas[i];
    html += '<li class="list-group-item d-flex justify-content-between"><span>' + linea.cantidad + " × " + escapar(linea.nombre) + "</span>";
    html += "<span>" + precio(linea.precio * linea.cantidad) + "</span></li>";
  }
  html += '<li class="list-group-item d-flex justify-content-between"><span>Despacho</span><span>' + despacho + "</span></li>";
  html += "</ul></details>";

  html += '<div class="d-flex flex-wrap justify-content-between align-items-center gap-2">';
  html += "<strong>Total " + precio(pedido.total) + "</strong>";
  html += '<div class="d-flex gap-2">';
  if (sePuedeAnular(pedido) === true) {
    html += '<button type="button" class="btn btn-sm btn-danger" onclick="abrirAnulacion(\'' + pedido.id + '\')">Anular compra</button>';
  }
  html += "</div></div>";
  html += "</article>";
  return html;
}

function mensajeVacio(titulo, texto, botones) {
  let html = '<div class="card bg-dark p-4 text-center">';
  html += '<h2 class="h5">' + titulo + "</h2>";
  html += "<p>" + texto + "</p>";
  html += '<div class="d-flex gap-2 justify-content-center">' + botones + "</div>";
  html += "</div>";
  return html;
}

function pintarPedidos() {
  let zona = document.getElementById("pedidos-contenido");
  let usuario = leerSesion();

  if (usuario === null) {
    zona.innerHTML = mensajeVacio(
      "Inicia sesión para ver tus pedidos",
      "Aquí aparecen las compras hechas con tu cuenta de cliente.",
      '<button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#modal-acceso">Acceder</button>' +
        '<a href="registro.html" class="btn btn-outline-light">Crear cuenta</a>'
    );
    return;
  }

  if (usuario.rol !== "cliente") {
    zona.innerHTML = mensajeVacio(
      "Esta sección es para clientes",
      "Estás conectado con una cuenta interna. Los pedidos de todos los clientes están en el panel interno.",
      '<a href="admin.html" class="btn btn-primary">Ir al panel interno</a>'
    );
    return;
  }

  let pedidos = pedidosDelCliente(usuario.correo);
  if (pedidos.length === 0) {
    zona.innerHTML = mensajeVacio(
      "Todavía no tienes pedidos",
      "Arma tu primer pedido desde la carta y aquí podrás seguirlo.",
      '<a href="index.html#carta" class="btn btn-primary">Ver la carta</a>'
    );
    return;
  }
  let html = "";
  for (let i = 0; i < pedidos.length; i++) {
    html += tarjetaPedido(pedidos[i]);
  }
  zona.innerHTML = html;
}

function confirmarAnulacionCliente(evento) {
  evento.preventDefault();
  if (validarAnulacion() === false) {
    return;
  }
  guardarAnulacion();
  bootstrap.Modal.getInstance(document.getElementById("modal-anulacion")).hide();
  avisar("Pedido " + pedidoAnulando + " anulado.", "ok");
  pintarPedidos();
}

pintarPedidos();
document.getElementById("form-anulacion").addEventListener("submit", confirmarAnulacionCliente);
