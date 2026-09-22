// Crea el <div> con los botones "Ver detalle" y "Agregar" de un producto o promo.
// Los botones llaman a las funciones de más abajo con el atributo onclick.
function crearBotones(id, disponible) {
  let contenedor = document.createElement("div");
  contenedor.setAttribute("class", "acciones");

  let botonDetalle = document.createElement("button");
  botonDetalle.setAttribute("type", "button");
  botonDetalle.setAttribute("class", "btn btn-sm btn-contorno");
  botonDetalle.setAttribute("onclick", "abrirDetalle('" + id + "')");
  botonDetalle.innerText = "Ver detalle";

  let botonAgregar = document.createElement("button");
  botonAgregar.setAttribute("type", "button");
  botonAgregar.setAttribute("class", "btn btn-sm btn-brasa");
  if (disponible === true) {
    botonAgregar.setAttribute("onclick", "agregarProducto('" + id + "')");
    botonAgregar.innerHTML = '<i class="bi bi-cart-plus" aria-hidden="true"></i> Agregar';
  } else {
    botonAgregar.disabled = true;
    botonAgregar.innerText = "Agotado";
  }

  contenedor.appendChild(botonDetalle);
  contenedor.appendChild(botonAgregar);
  return contenedor;
}


// Fila de la carta de la página de inicio: imagen de 150x150 a la izquierda y el texto a la derecha
function filaCarta(producto) {
  let fila = document.createElement("li");
  fila.setAttribute("class", "carta-item");
  if (producto.disponible === false) {
    fila.setAttribute("class", "carta-item agotado");
  }
  fila.setAttribute("data-id", producto.id);

  let imagen = document.createElement("img");
  imagen.setAttribute("src", producto.imagen);
  imagen.setAttribute("alt", "");
  imagen.setAttribute("width", "150");
  imagen.setAttribute("height", "150");
  imagen.setAttribute("loading", "lazy");

  let cuerpo = document.createElement("div");
  cuerpo.setAttribute("class", "carta-cuerpo");

  let nombre = document.createElement("h3");
  nombre.setAttribute("class", "carta-nombre");
  nombre.innerText = producto.nombre;
  cuerpo.appendChild(nombre);

  // Solo las parrilladas tienen el dato "personas"
  if (producto.personas) {
    let personas = document.createElement("p");
    personas.setAttribute("class", "etiqueta-personas");
    personas.innerHTML = '<i class="bi bi-people-fill" aria-hidden="true"></i> Para ' + producto.personas + " personas";
    cuerpo.appendChild(personas);
  }

  let descripcion = document.createElement("p");
  descripcion.setAttribute("class", "carta-desc");
  descripcion.innerText = producto.descripcion;
  cuerpo.appendChild(descripcion);

  let pie = document.createElement("div");
  pie.setAttribute("class", "carta-pie");

  let textoPrecio = document.createElement("span");
  textoPrecio.setAttribute("class", "precio");
  textoPrecio.innerText = precio(producto.precio);
  pie.appendChild(textoPrecio);

  if (producto.disponible === false) {
    let agotado = document.createElement("span");
    agotado.setAttribute("class", "etiqueta-agotado");
    agotado.innerText = "Agotado por hoy";
    pie.appendChild(agotado);
  }

  pie.appendChild(crearBotones(producto.id, producto.disponible));
  cuerpo.appendChild(pie);

  fila.appendChild(imagen);
  fila.appendChild(cuerpo);
  return fila;
}


// Tarjeta de la página Carta: imagen arriba y el texto abajo
function tarjetaProducto(producto) {
  let columna = document.createElement("div");
  columna.setAttribute("class", "col-sm-6 col-lg-4 col-xl-3");

  let tarjeta = document.createElement("article");
  tarjeta.setAttribute("class", "tarjeta-producto");
  if (producto.disponible === false) {
    tarjeta.setAttribute("class", "tarjeta-producto agotado");
  }
  tarjeta.setAttribute("data-id", producto.id);

  let imagen = document.createElement("img");
  imagen.setAttribute("class", "tarjeta-imagen");
  imagen.setAttribute("src", producto.imagen);
  imagen.setAttribute("alt", "");
  imagen.setAttribute("width", "300");
  imagen.setAttribute("height", "300");
  imagen.setAttribute("loading", "lazy");

  let cuerpo = document.createElement("div");
  cuerpo.setAttribute("class", "tarjeta-cuerpo");

  let nombre = document.createElement("h3");
  nombre.setAttribute("class", "carta-nombre");
  nombre.innerText = producto.nombre;
  cuerpo.appendChild(nombre);

  if (producto.personas) {
    let personas = document.createElement("p");
    personas.setAttribute("class", "etiqueta-personas");
    personas.innerHTML = '<i class="bi bi-people-fill" aria-hidden="true"></i> Para ' + producto.personas + " personas";
    cuerpo.appendChild(personas);
  }

  let descripcion = document.createElement("p");
  descripcion.setAttribute("class", "carta-desc");
  descripcion.innerText = producto.descripcion;
  cuerpo.appendChild(descripcion);

  let pie = document.createElement("div");
  pie.setAttribute("class", "carta-pie");
  let textoPrecio = document.createElement("span");
  textoPrecio.setAttribute("class", "precio");
  textoPrecio.innerText = precio(producto.precio);
  pie.appendChild(textoPrecio);
  if (producto.disponible === false) {
    let agotado = document.createElement("span");
    agotado.setAttribute("class", "etiqueta-agotado");
    agotado.innerText = "Agotado por hoy";
    pie.appendChild(agotado);
  }
  cuerpo.appendChild(pie);

  cuerpo.appendChild(crearBotones(producto.id, producto.disponible));

  tarjeta.appendChild(imagen);
  tarjeta.appendChild(cuerpo);
  columna.appendChild(tarjeta);
  return columna;
}


// Tarjeta de una promo: imagen de 400x250 con la etiqueta de descuento en la esquina
function tarjetaPromo(promo) {
  let item = buscarItem(promo.id);

  let tarjeta = document.createElement("article");
  tarjeta.setAttribute("class", "promo");
  tarjeta.setAttribute("data-id", promo.id);

  let imagen = document.createElement("img");
  imagen.setAttribute("class", "promo-imagen");
  imagen.setAttribute("src", promo.imagen);
  imagen.setAttribute("alt", "");
  imagen.setAttribute("width", "400");
  imagen.setAttribute("height", "250");
  imagen.setAttribute("loading", "lazy");

  let etiqueta = document.createElement("span");
  etiqueta.setAttribute("class", "promo-etiqueta");
  let textoDescuento = document.createElement("span");
  textoDescuento.innerText = "-" + promo.descuento + "%";
  etiqueta.appendChild(textoDescuento);

  let cuerpo = document.createElement("div");
  cuerpo.setAttribute("class", "promo-cuerpo");

  let textos = document.createElement("div");
  textos.setAttribute("class", "promo-texto");
  let nombre = document.createElement("h3");
  nombre.setAttribute("class", "promo-nombre");
  nombre.innerText = promo.nombre;
  let vigencia = document.createElement("p");
  vigencia.setAttribute("class", "promo-vigencia");
  vigencia.innerText = promo.vigencia;
  textos.appendChild(nombre);
  textos.appendChild(vigencia);

  let precios = document.createElement("p");
  precios.setAttribute("class", "promo-precios");
  let precioAntes = document.createElement("s");
  precioAntes.setAttribute("class", "precio-antes");
  precioAntes.innerHTML = '<span class="visually-hidden">Precio normal </span>' + precio(item.precioNormal);
  let precioFinal = document.createElement("span");
  precioFinal.setAttribute("class", "precio");
  precioFinal.innerText = precio(item.precio);
  precios.appendChild(precioAntes);
  precios.appendChild(precioFinal);

  cuerpo.appendChild(textos);
  cuerpo.appendChild(precios);
  cuerpo.appendChild(crearBotones(promo.id, item.disponible));

  tarjeta.appendChild(imagen);
  tarjeta.appendChild(etiqueta);
  tarjeta.appendChild(cuerpo);
  return tarjeta;
}


// Dibuja los botones de categoría (Toda la carta, Parrilladas...).
// Al elegir uno se llama a cambiarCategoria(), que está en el archivo de cada página.
function pintarFiltros(contenedor, grupo) {
  contenedor.innerHTML = "";
  for (let i = 0; i < CATEGORIAS.length; i++) {
    let categoria = CATEGORIAS[i];
    let idRadio = grupo + "-" + categoria.id;

    let radio = document.createElement("input");
    radio.setAttribute("type", "radio");
    radio.setAttribute("name", grupo);
    radio.setAttribute("id", idRadio);
    radio.setAttribute("value", categoria.id);
    radio.setAttribute("onchange", "cambiarCategoria('" + categoria.id + "')");
    if (i === 0) {
      radio.checked = true;
    }

    let etiqueta = document.createElement("label");
    etiqueta.setAttribute("for", idRadio);
    etiqueta.innerText = categoria.nombre;

    contenedor.appendChild(radio);
    contenedor.appendChild(etiqueta);
  }
}

// Devuelve los productos de una categoría ("todas" devuelve todos)
function productosDeCategoria(categoria) {
  let productos = leerProductos();
  if (categoria === "todas") {
    return productos;
  }
  let resultado = [];
  for (let i = 0; i < productos.length; i++) {
    if (productos[i].categoria === categoria) {
      resultado.push(productos[i]);
    }
  }
  return resultado;
}

// Dibuja las promos ordenadas de mayor a menor descuento. "limite" es cuántas mostrar.
function pintarPromos(contenedor, limite) {
  contenedor.innerHTML = "";
  let promos = PROMOS.slice(); // copia del arreglo, para no cambiar el orden del original
  promos.sort(function (a, b) {
    return b.descuento - a.descuento;
  });
  if (limite === undefined) {
    limite = promos.length;
  }
  for (let i = 0; i < promos.length && i < limite; i++) {
    contenedor.appendChild(tarjetaPromo(promos[i]));
  }
}


// Abre la ventana con el detalle de un producto o promo
function abrirDetalle(id) {
  let item = buscarItem(id);
  if (item === null) {
    return;
  }
  document.getElementById("modal-producto-titulo").innerText = item.titulo;

  let listaIncluye = "";
  for (let i = 0; i < item.incluye.length; i++) {
    listaIncluye += '<li><i class="bi bi-check2" aria-hidden="true"></i> ' + escapar(item.incluye[i]) + "</li>";
  }

  let html = '<div class="row g-4 align-items-start">';
  html += '<div class="col-md-5"><img class="detalle-imagen" src="' + item.imagen + '" alt=""></div>';
  html += '<div class="col-md-7">';
  html += '<p class="detalle-desc">' + escapar(item.descripcion) + "</p>";
  if (item.personas) {
    html += '<p class="detalle-dato"><i class="bi bi-people-fill" aria-hidden="true"></i> Alcanza para ' + item.personas + " personas</p>";
  }
  if (item.vigencia !== "") {
    html += '<p class="detalle-dato"><i class="bi bi-calendar-event" aria-hidden="true"></i> ' + item.vigencia + "</p>";
  }
  if (tieneAlcohol(id) === true) {
    html += '<p class="detalle-dato"><i class="bi bi-exclamation-circle" aria-hidden="true"></i> Incluye cerveza: venta solo a mayores de 18 años.</p>';
  }
  html += '<h3 class="detalle-subtitulo">Incluye</h3>';
  html += '<ul class="detalle-lista">' + listaIncluye + "</ul>";
  html += '<p class="detalle-precio"><span class="precio">' + precio(item.precio) + "</span>";
  if (item.tipo === "promo") {
    html += '<s class="precio-antes">' + precio(item.precioNormal) + "</s>";
    html += '<span class="detalle-ahorro">Ahorras ' + precio(item.precioNormal - item.precio) + "</span>";
  }
  html += "</p>";
  if (item.disponible === false) {
    html += '<p class="alert alert-warning" role="status">Este producto está agotado por hoy. Elige otro de la carta o vuelve a revisar más tarde.</p>';
  }
  html += "</div></div>";
  document.getElementById("modal-producto-cuerpo").innerHTML = html;

  let pie = '<button type="button" class="btn btn-contorno" data-bs-dismiss="modal">Cerrar</button>';
  if (item.disponible === true) {
    pie += '<button type="button" class="btn btn-brasa" data-bs-dismiss="modal" onclick="agregarProducto(\'' + id + '\')">';
    pie += '<i class="bi bi-cart-plus" aria-hidden="true"></i> Agregar al carrito</button>';
  } else {
    pie += '<button type="button" class="btn btn-brasa" disabled>Agregar al carrito</button>';
  }
  document.getElementById("modal-producto-pie").innerHTML = pie;

  bootstrap.Modal.getOrCreateInstance(document.getElementById("modal-producto")).show();
}


// Agrega un producto o promo al carrito y actualiza lo que se ve en pantalla
function agregarProducto(id) {
  let item = buscarItem(id);
  if (item === null || item.disponible === false) {
    return;
  }
  agregarAlCarrito(id);
  pintarContadorCarrito();
  // El carrito solo existe en la página de inicio. Si está en pantalla, se dibuja de nuevo.
  if (document.getElementById("carrito-lista") !== null) {
    pintarCarrito();
  }
  avisar(item.nombre + " agregado al carrito.", "ok");
}
