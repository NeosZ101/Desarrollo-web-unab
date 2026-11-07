let htmlValores = "";
for (let i = 0; i < VALORES.length; i++) {
  htmlValores += '<div class="col-md-4"><div class="caja h-100">';
  htmlValores += '<h3 class="h5">' + VALORES[i].titulo + "</h3>";
  htmlValores += '<p class="mb-0">' + VALORES[i].texto + "</p>";
  htmlValores += "</div></div>";
}
document.getElementById("lista-valores").innerHTML = htmlValores;

let htmlEquipo = "";
for (let i = 0; i < EQUIPO.length; i++) {
  htmlEquipo += '<div class="col-sm-6 col-lg-3"><div class="caja h-100">';
  htmlEquipo += '<h3 class="h5 mb-1">' + EQUIPO[i].nombre + "</h3>";
  htmlEquipo += '<p class="text-body-secondary">' + EQUIPO[i].cargo + "</p>";
  htmlEquipo += '<p class="mb-0">' + EQUIPO[i].detalle + "</p>";
  htmlEquipo += "</div></div>";
}
document.getElementById("lista-equipo").innerHTML = htmlEquipo;
