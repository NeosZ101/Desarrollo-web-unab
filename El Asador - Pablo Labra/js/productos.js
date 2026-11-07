function botonAgregar(id, nombre, disponible) {
  if (disponible === false) {
    return '<button type="button" class="btn btn-sm btn-secondary" disabled>Agotado</button>';
  }
  return '<button type="button" class="btn btn-sm btn-primary" aria-label="Agregar ' + escapar(nombre) + ' al carrito" onclick="agregarProducto(\'' + id + '\')">Agregar</button>';
}

function pintarTabla() {
  let categoria = document.getElementById("filtro-categoria").value;
  let textoBuscado = document.getElementById("buscar-carta").value.trim();
  let productos = productosDeCategoria(categoria);
  let html = "";
  let cantidad = 0;

  for (let i = 0; i < productos.length; i++) {
    let p = productos[i];
    let textoDelProducto = (p.nombre + " " + p.descripcion).toLowerCase();
    if (textoDelProducto.indexOf(textoBuscado.toLowerCase()) !== -1) {
      cantidad = cantidad + 1;
      html += '<tr><th scope="row">' + escapar(p.nombre);
      if (p.personas) {
        html += '<br><small class="text-body-secondary">Para ' + p.personas + " personas</small>";
      }
      if (tieneAlcohol(p.id) === true) {
        html += '<br><small class="text-body-secondary">Venta solo a mayores de 18 años</small>';
      }
      html += '<span class="d-block d-md-none small text-body-secondary">' + escapar(p.descripcion) + "</span></th>";
      html += '<td class="d-none d-md-table-cell">' + escapar(p.descripcion) + "</td>";
      html += '<td class="text-end">' + precio(p.precio) + "</td>";
      html += "<td>" + botonAgregar(p.id, p.nombre, p.disponible) + "</td></tr>";
    }
  }
  document.getElementById("lista-productos").innerHTML = html;

  let sinResultados = document.getElementById("carta-vacia");
  if (cantidad === 0) {
    document.getElementById("carta-conteo").innerText = "";
    sinResultados.hidden = false;
    if (textoBuscado === "") {
      sinResultados.innerText = "Por ahora no hay productos en esta categoría.";
    } else {
      sinResultados.innerText = "No encontramos productos con «" + textoBuscado + "». Prueba con otra palabra o elige «Toda la carta».";
    }
  } else {
    sinResultados.hidden = true;
    if (cantidad === 1) {
      document.getElementById("carta-conteo").innerText = "1 producto";
    } else {
      document.getElementById("carta-conteo").innerText = cantidad + " productos";
    }
  }
}

function pintarTablaPromos() {
  let html = "";
  for (let i = 0; i < PROMOS.length; i++) {
    let promo = buscarItem(PROMOS[i].id);
    html += '<tr><th scope="row">' + escapar(promo.titulo) + '<br><small class="text-body-secondary">' + escapar(promo.vigencia) + "</small>";
    html += '<span class="d-block d-md-none small text-body-secondary">' + escapar(promo.incluye.join(", ")) + "</span></th>";
    html += '<td class="d-none d-md-table-cell">' + escapar(promo.incluye.join(", ")) + "</td>";
    html += '<td class="text-end"><s class="text-body-secondary">' + precio(promo.precioNormal) + "</s> " + precio(promo.precio) + " (-" + promo.descuento + "%)</td>";
    html += "<td>" + botonAgregar(promo.id, promo.titulo, promo.disponible) + "</td></tr>";
  }
  document.getElementById("lista-promos").innerHTML = html;
}

let opcionesCategoria = "";
for (let i = 0; i < CATEGORIAS.length; i++) {
  opcionesCategoria += '<option value="' + CATEGORIAS[i].id + '">' + CATEGORIAS[i].nombre + "</option>";
}
document.getElementById("filtro-categoria").innerHTML = opcionesCategoria;
pintarTabla();
pintarTablaPromos();
document.getElementById("filtro-categoria").addEventListener("change", pintarTabla);
document.getElementById("buscar-carta").addEventListener("input", pintarTabla);
