// Dibuja la tabla con todas las comunas, su distancia y su costo (se hace una sola vez)
function pintarTablaCobertura() {
  let html = "";
  for (let i = 0; i < COMUNAS.length; i++) {
    let comuna = COMUNAS[i];
    let costo = costoDespacho(comuna.km);
    html += '<tr data-comuna="' + comuna.nombre + '">';
    html += '<th scope="row">' + comuna.nombre + "</th>";
    html += "<td>" + kilometros(comuna.km) + " km</td>";
    if (costo === 0) {
      html += '<td class="text-success-emphasis">Gratis</td>';
    } else {
      html += "<td>" + precio(costo) + "</td>";
    }
    html += "</tr>";
  }
  document.getElementById("tabla-cobertura").innerHTML = html;
}

// Se ejecuta cuando se elige una comuna en la calculadora
function calcularDespacho() {
  let nombre = document.getElementById("calc-comuna").value;
  let comuna = buscarComuna(nombre);
  guardarComunaElegida(nombre);

  let resultado = document.getElementById("calc-resultado");
  resultado.innerText = textoDespacho(nombre);
  resultado.classList.remove("text-success-emphasis");
  if (comuna !== null && comuna.km <= CONFIG.kmDespachoGratis) {
    resultado.classList.add("text-success-emphasis");
  }

  let filas = document.querySelectorAll("#tabla-cobertura tr");
  for (let i = 0; i < filas.length; i++) {
    filas[i].classList.remove("table-active");
    if (filas[i].getAttribute("data-comuna") === nombre) {
      filas[i].classList.add("table-active");
    }
  }
}

// Dibuja los tres menús (botones de radio) con los datos de MENUS_EVENTO
function pintarMenusEvento() {
  let html = "";
  for (let i = 0; i < MENUS_EVENTO.length; i++) {
    let menu = MENUS_EVENTO[i];
    let idRadio = "ev-menu-" + menu.id;
    html += '<div class="form-check">';
    html += '<input class="form-check-input" type="radio" name="menu" id="' + idRadio + '" value="' + menu.id + '">';
    html += '<label class="form-check-label" for="' + idRadio + '">';
    html += "<strong>" + menu.nombre + "</strong>: " + precio(menu.precioPersona) + " por persona. " + menu.incluye;
    html += "</label></div>";
  }
  document.getElementById("ev-menus").innerHTML = html;
}

// Devuelve el menú que está marcado, o null si no hay ninguno
function menuElegido() {
  let marcado = document.querySelector("#form-evento input[name='menu']:checked");
  if (marcado === null) {
    return null;
  }
  for (let i = 0; i < MENUS_EVENTO.length; i++) {
    if (MENUS_EVENTO[i].id === marcado.value) {
      return MENUS_EVENTO[i];
    }
  }
  return null;
}

// Una línea de la cotización, por ejemplo: "Menú parrillero × 20 ........ $279.800"
function lineaCotizacion(texto, valor) {
  let textoValor = "Gratis";
  if (valor > 0) {
    textoValor = precio(valor);
  }
  return '<li class="list-group-item d-flex justify-content-between"><span>' + texto + "</span><span>" + textoValor + "</span></li>";
}

// Calcula el valor estimado con lo que haya en el formulario y lo muestra
function calcularEvento() {
  let personas = Number(document.getElementById("ev-personas").value);
  let menu = menuElegido();
  let detalle = document.getElementById("ev-detalle");
  let total = document.getElementById("ev-total");

  if (personas < EVENTO.minPersonas || menu === null) {
    detalle.innerHTML = '<li class="list-group-item text-body-secondary">Elige la cantidad de personas (desde ' + EVENTO.minPersonas + ") y un menú para ver el valor estimado.</li>";
    total.innerText = "$0";
    return 0;
  }

  let suma = 0;
  let html = "";

  // El menú
  let valorMenu = menu.precioPersona * personas;
  suma = suma + valorMenu;
  html += lineaCotizacion(menu.nombre + " × " + personas, valorMenu);

  // Los extras. Se calcula una bebida y una ensalada cada 4 personas.
  let cadaCuatro = Math.ceil(personas / 4);
  if (document.getElementById("ev-bebidas").checked === true) {
    let valorBebidas = buscarProducto("p12").precio * cadaCuatro;
    suma = suma + valorBebidas;
    html += lineaCotizacion("Bebida 1,5 L × " + cadaCuatro, valorBebidas);
  }
  if (document.getElementById("ev-ensaladas").checked === true) {
    let valorEnsaladas = buscarProducto("p09").precio * cadaCuatro;
    suma = suma + valorEnsaladas;
    html += lineaCotizacion("Ensalada chilena × " + cadaCuatro, valorEnsaladas);
  }
  if (document.getElementById("ev-parrillero").checked === true) {
    suma = suma + EVENTO.precioParrillero;
    html += lineaCotizacion("Parrillero en el lugar (hasta 5 horas)", EVENTO.precioParrillero);
  }

  // El despacho, si se eligió una comuna
  let comuna = document.getElementById("ev-comuna").value;
  if (comuna !== "") {
    let valorDespacho = costoDeComuna(comuna);
    suma = suma + valorDespacho;
    html += lineaCotizacion("Despacho a " + comuna, valorDespacho);
  }

  detalle.innerHTML = html;
  total.innerText = precio(suma);
  return suma;
}

// Se ejecuta cada vez que la persona cambia algo del formulario
function alCambiarEvento() {
  document.getElementById("ev-exito").hidden = true; // si empieza otra cotización, se oculta la confirmación anterior
  if (menuElegido() !== null) {
    document.getElementById("ev-error-menu").hidden = true;
  }
  calcularEvento();
}

// Revisa el formulario campo por campo. Devuelve true si todo está bien.
function validarEvento() {
  let formulario = document.getElementById("form-evento");
  let nombre = document.getElementById("ev-nombre");
  let correo = document.getElementById("ev-correo");
  let fecha = document.getElementById("ev-fecha");
  let personas = document.getElementById("ev-personas");
  let errorMenu = document.getElementById("ev-error-menu");

  limpiarErrores(formulario);
  errorMenu.hidden = true;

  if (nombre.value.trim() === "") {
    mostrarError(nombre, "Falta tu nombre. Complétalo para continuar.");
    return false;
  }
  if (nombre.value.trim().length < 3) {
    mostrarError(nombre, "Tu nombre: escribe al menos 3 caracteres (llevas " + nombre.value.trim().length + ").");
    return false;
  }
  if (correo.value.trim() === "") {
    mostrarError(correo, "Falta tu correo. Complétalo para continuar.");
    return false;
  }
  if (correoValido(correo.value.trim()) === false) {
    mostrarError(correo, "El correo no parece válido. Debe tener la forma nombre@correo.cl");
    return false;
  }
  if (fecha.value === "") {
    mostrarError(fecha, "Falta la fecha del evento. Complétala para continuar.");
    return false;
  }
  if (fecha.value < fechaHoy()) {
    mostrarError(fecha, "Elige una fecha desde hoy en adelante.");
    return false;
  }
  if (personas.value === "") {
    mostrarError(personas, "Falta la cantidad de personas. Complétala para continuar.");
    return false;
  }
  if (Number(personas.value) < EVENTO.minPersonas) {
    mostrarError(personas, "Para eventos atendemos desde " + EVENTO.minPersonas + " personas. Para grupos más chicos, pide una parrillada desde la carta.");
    return false;
  }
  if (Number(personas.value) > 300) {
    mostrarError(personas, "Para más de 300 personas escríbenos desde Contacto y lo coordinamos.");
    return false;
  }
  if (menuElegido() === null) {
    errorMenu.hidden = false;
    document.getElementById("ev-menu-" + MENUS_EVENTO[0].id).focus();
    return false;
  }
  return true;
}

// Se ejecuta al apretar "Solicitar cotización"
function enviarEvento(evento) {
  evento.preventDefault();
  if (validarEvento() === false) {
    return;
  }

  let valor = calcularEvento();
  let personas = document.getElementById("ev-personas").value;
  let nombre = document.getElementById("ev-nombre").value.trim().split(" ")[0];
  let correo = document.getElementById("ev-correo").value.trim();
  let folio = "COT-" + String(Date.now()).slice(-5);

  let formulario = document.getElementById("form-evento");
  formulario.reset();
  limpiarErrores(formulario);
  calcularEvento();

  let exito = document.getElementById("ev-exito");
  exito.innerHTML =
    '<h3 class="h5" tabindex="-1">Solicitud ' + folio + " recibida</h3>" +
    '<p class="mb-0">Gracias, ' + escapar(nombre) + ". Estimamos " + precio(valor) + " para " + personas + " personas. Te enviaremos la cotización formal a " + escapar(correo) + " en un máximo de 24 horas.</p>";
  exito.hidden = false;
  exito.querySelector("h3").focus();
}


// ---------- ARRANQUE ----------

// Despacho
pintarTablaCobertura();
let selectCalculadora = document.getElementById("calc-comuna");
llenarSelectComunas(selectCalculadora, "Elige tu comuna", true);
selectCalculadora.value = leerComunaElegida();
calcularDespacho();
selectCalculadora.addEventListener("change", calcularDespacho);

// Cotizador
document.getElementById("ev-fecha").setAttribute("min", fechaHoy());
llenarSelectComunas(document.getElementById("ev-comuna"), "Retiro en el local (sin despacho)", false);
pintarMenusEvento();
calcularEvento();
let formularioEvento = document.getElementById("form-evento");
formularioEvento.addEventListener("input", alCambiarEvento);
formularioEvento.addEventListener("change", alCambiarEvento);
formularioEvento.addEventListener("submit", enviarEvento);
