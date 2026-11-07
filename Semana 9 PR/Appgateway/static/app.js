// Panel de la Semana 9: login, productos, pedidos, eliminar (admin) y logout
// El token va en una cookie HttpOnly: el navegador la envía solo

const $ = (id) => document.getElementById(id);

const clp = (n) => "$" + Number(n).toLocaleString("es-CL");

async function api(ruta, opciones = {}) {
  const respuesta = await fetch(ruta, { credentials: "include", ...opciones });
  let cuerpo = null;
  try {
    cuerpo = await respuesta.json();
  } catch (e) {
    // respuesta sin JSON
  }
  return { ok: respuesta.ok, status: respuesta.status, cuerpo };
}

function mostrarMensaje(texto, tipo) {
  const el = $("mensaje");
  el.textContent = texto || "";
  el.className = "mensaje" + (tipo ? " " + tipo : "");
}

function detalle(r) {
  const d = r.cuerpo && r.cuerpo.detail;
  return typeof d === "string" ? d : "Error " + r.status;
}

function celda(fila, texto, clase) {
  const td = document.createElement("td");
  td.textContent = texto;
  if (clase) td.className = clase;
  fila.appendChild(td);
  return td;
}

function mostrarLogin() {
  $("vista-login").hidden = false;
  $("vista-panel").hidden = true;
  $("cuenta").hidden = true;
}

function mostrarPanel(usuario) {
  $("vista-login").hidden = true;
  $("vista-panel").hidden = false;
  $("cuenta").hidden = false;
  $("quien").textContent = usuario.username + " (" + usuario.roles.join(", ") + ")";
}

async function cargarProductos() {
  const r = await api("/api/products");
  if (r.status === 401) return mostrarLogin();
  if (!r.ok) return mostrarMensaje(detalle(r), "error");
  const cuerpo = $("tabla-productos");
  cuerpo.replaceChildren();
  for (const p of r.cuerpo.products) {
    const fila = document.createElement("tr");
    celda(fila, p.id);
    celda(fila, p.nombre);
    celda(fila, p.categoria, "oculta-movil");
    celda(fila, clp(p.precio), "num");
    const accion = document.createElement("td");
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "btn btn-contorno btn-chico";
    boton.textContent = "Eliminar";
    boton.setAttribute("aria-label", "Eliminar " + p.nombre);
    boton.addEventListener("click", () => eliminarProducto(p));
    accion.appendChild(boton);
    fila.appendChild(accion);
    cuerpo.appendChild(fila);
  }
}

async function cargarPedidos() {
  const r = await api("/api/orders");
  if (r.status === 401) return mostrarLogin();
  if (!r.ok) return mostrarMensaje(detalle(r), "error");
  const cuerpo = $("tabla-pedidos");
  cuerpo.replaceChildren();
  for (const o of r.cuerpo.orders) {
    const fila = document.createElement("tr");
    celda(fila, o.id);
    celda(fila, o.cliente);
    celda(fila, o.comuna, "oculta-movil");
    celda(fila, o.estado);
    celda(fila, clp(o.total), "num");
    cuerpo.appendChild(fila);
  }
}

async function eliminarProducto(producto) {
  const r = await api("/api/products/" + encodeURIComponent(producto.id), { method: "DELETE" });
  if (r.ok) {
    mostrarMensaje("Producto " + producto.id + " eliminado (200).", "ok");
    await cargarProductos();
  } else {
    mostrarMensaje(r.status + " · " + detalle(r), "error");
  }
}

async function iniciar() {
  const r = await api("/auth/me");
  if (!r.ok) {
    // 401 = no hay sesión (caso normal); otro código = un servicio no responde
    if (r.status !== 401) mostrarMensaje(detalle(r), "error");
    return mostrarLogin();
  }
  mostrarPanel(r.cuerpo);
  await Promise.all([cargarProductos(), cargarPedidos()]);
}

$("form-login").addEventListener("submit", async (evento) => {
  evento.preventDefault();
  mostrarMensaje("");
  const r = await api("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: $("usuario").value, password: $("clave").value })
  });
  $("clave").value = "";
  if (!r.ok) return mostrarMensaje(detalle(r), "error");
  await iniciar();
  mostrarMensaje("Sesión iniciada.", "ok");
});

$("btn-salir").addEventListener("click", async () => {
  const r = await api("/auth/logout", { method: "POST" });
  if (!r.ok) return mostrarMensaje(detalle(r), "error");
  mostrarLogin();
  mostrarMensaje("Sesión cerrada.", "ok");
});

iniciar();
