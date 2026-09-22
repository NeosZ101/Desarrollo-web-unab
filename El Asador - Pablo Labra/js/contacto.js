// Revisa el formulario. Devuelve true si todo está bien.
function validarContacto() {
  let formulario = document.getElementById("form-contacto");
  let nombre = document.getElementById("contacto-nombre");
  let correo = document.getElementById("contacto-correo");
  let asunto = document.getElementById("contacto-asunto");
  let mensaje = document.getElementById("contacto-mensaje");

  limpiarErrores(formulario);

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
  if (asunto.value === "") {
    mostrarError(asunto, "Elige el motivo de tu mensaje.");
    return false;
  }
  if (mensaje.value.trim() === "") {
    mostrarError(mensaje, "Falta tu mensaje. Complétalo para continuar.");
    return false;
  }
  if (mensaje.value.trim().length < 10) {
    mostrarError(mensaje, "Tu mensaje: escribe al menos 10 caracteres (llevas " + mensaje.value.trim().length + ").");
    return false;
  }
  return true;
}

// Se ejecuta al apretar "Enviar mensaje"
function enviarContacto(evento) {
  evento.preventDefault(); // evita que el formulario recargue la página
  if (validarContacto() === false) {
    return;
  }

  let nombre = document.getElementById("contacto-nombre").value.trim();
  let correo = document.getElementById("contacto-correo").value.trim();
  let asunto = document.getElementById("contacto-asunto").value;
  let primerNombre = nombre.split(" ")[0];

  let confirmacion = document.getElementById("contacto-exito");
  confirmacion.innerHTML =
    '<div class="caja-cabecera"><h2 class="caja-titulo" tabindex="-1">Gracias, ' + escapar(primerNombre) + "</h2></div>" +
    '<p class="alert alert-success">Recibimos tu mensaje. Tu consulta sobre «' + escapar(asunto) + "» quedó registrada. Te responderemos a " + escapar(correo) + " durante el día (martes a domingo, de 12:00 a 23:00 h).</p>" +
    '<button type="button" class="btn btn-outline-light" onclick="enviarOtroMensaje()">Enviar otro mensaje</button>';

  let formulario = document.getElementById("form-contacto");
  formulario.reset();
  limpiarErrores(formulario);
  formulario.hidden = true;
  confirmacion.hidden = false;
  confirmacion.querySelector("h2").focus();
}

// Botón "Enviar otro mensaje": vuelve a mostrar el formulario vacío
function enviarOtroMensaje() {
  document.getElementById("contacto-exito").hidden = true;
  document.getElementById("form-contacto").hidden = false;
  document.getElementById("contacto-nombre").focus();
}


// ---------- ARRANQUE ----------
document.getElementById("form-contacto").addEventListener("submit", enviarContacto);
