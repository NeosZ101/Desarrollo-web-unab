function buscarRegion() {
  let nombre = document.getElementById("reg-region").value;
  for (let i = 0; i < UBICACIONES.length; i++) {
    if (UBICACIONES[i].region === nombre) {
      return UBICACIONES[i];
    }
  }
  return null;
}

function cambiarRegion() {
  let region = buscarRegion();
  let provincias = [];
  if (region !== null) {
    for (let i = 0; i < region.provincias.length; i++) {
      provincias.push(region.provincias[i].nombre);
    }
  }
  llenarSelect(document.getElementById("reg-provincia"), provincias, "Elige una provincia");
  llenarSelect(document.getElementById("reg-comuna"), [], "Primero elige una provincia");
}

function cambiarProvincia() {
  let region = buscarRegion();
  let nombre = document.getElementById("reg-provincia").value;
  let comunas = [];
  if (region !== null) {
    for (let i = 0; i < region.provincias.length; i++) {
      if (region.provincias[i].nombre === nombre) {
        comunas = region.provincias[i].comunas;
      }
    }
  }
  llenarSelect(document.getElementById("reg-comuna"), comunas, "Elige una comuna");
}

function registrar(e) {
  e.preventDefault();
  let nombre = document.getElementById("reg-nombre").value.trim();
  let correo = document.getElementById("reg-correo").value.trim().toLowerCase();

  agregarCliente({
    run: document.getElementById("reg-run").value.trim(),
    nombre: nombre,
    nacimiento: document.getElementById("reg-nacimiento").value,
    sexo: document.getElementById("reg-sexo").value,
    correo: correo,
    telefono: document.getElementById("reg-telefono").value.trim(),
    region: document.getElementById("reg-region").value,
    provincia: document.getElementById("reg-provincia").value,
    comuna: document.getElementById("reg-comuna").value,
    direccion: document.getElementById("reg-direccion").value.trim(),
    origen: "Web",
  });
  guardarSesion({ nombre: nombre, correo: correo, rol: "cliente" });
  pintarCuenta();

  document.getElementById("bienvenida-texto").innerText = "Hola, " + nombre.split(" ")[0] + ". Ya iniciaste sesión con " + correo + " y puedes pagar desde el carrito.";
  document.getElementById("form-registro").hidden = true;
  document.getElementById("registro-exito").hidden = false;
}

let regiones = [];
for (let i = 0; i < UBICACIONES.length; i++) {
  regiones.push(UBICACIONES[i].region);
}
llenarSelect(document.getElementById("reg-region"), regiones, "Elige una región");
llenarSelect(document.getElementById("reg-provincia"), [], "Primero elige una región");
llenarSelect(document.getElementById("reg-comuna"), [], "Primero elige una provincia");
document.getElementById("reg-region").addEventListener("change", cambiarRegion);
document.getElementById("reg-provincia").addEventListener("change", cambiarProvincia);
document.getElementById("form-registro").addEventListener("submit", registrar);
