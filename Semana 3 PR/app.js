const respuestaAPI = {
    "status": 200,
    "message": "Juegos obtenidos correctamente",
    "data": [
        {
            "id": 1,
            "nombre": "Persona 3 Reloaded",
            "categoria": "RPG",
            "puntaje": 9.7,
            "descripcion": "Persona 3 Reloaded es un juego de rol japonés que combina elementos de simulación social y combate por turnos. Los jugadores asumen el papel de un estudiante que debe equilibrar su vida escolar con la lucha contra criaturas sobrenaturales conocidas como Sombras.",
            "img": "img/85487475426de191c3c100b47ddc61f77c515b513948272e.avif"
        },
        {
            "id": 2,
            "nombre": "Marvel Rivals",
            "categoria": "Hero Shooter",
            "puntaje": 8.0,
            "descripcion": "Marvel Rivals es un juego de disparos heroico donde los jugadores pueden elegir entre una variedad de personajes de Marvel para enfrentarse en batallas intensas.",
            "img": "img/marvel-rivals-wq3mr.png"
        },
        {
            "id": 3,
            "nombre": "Cyberpunk 2077",
            "categoria": "Action RPG",
            "puntaje": 8.5,
            "descripcion": "Cyberpunk 2077 es un juego de rol de acción ambientado en un mundo abierto futurista. Los jugadores asumen el papel de V, un mercenario que busca un implante único que otorga la inmortalidad.",
            "img": "img/images (1).jpg"
        }
    ]
};

function mostrarJuegos() {
    let contenedor = document.getElementById("contenedor-resenas");
    contenedor.innerHTML = "";
    respuestaAPI.data.forEach(juego => {
        let col = document.createElement("div");
        col.setAttribute("class", "col-md-4 mb-4");
        let card = document.createElement("div");
        card.setAttribute("class", "card card-dark h-100 rounded-0 shadow");
        let img = document.createElement("img");
        img.setAttribute("src", juego.img);
        img.setAttribute("class", "card-img-top rounded-0");
        img.setAttribute("alt", juego.titulo);
        img.setAttribute("style", "height: 220px; object-fit: cover;");
        let cardBody = document.createElement("div");
        cardBody.setAttribute("class", "card-body");
        let titulo = document.createElement("h4");
        titulo.setAttribute("class", "card-title text-blood font-weight-bold");
        titulo.innerText = juego.titulo;
        let genero = document.createElement("p");
        genero.setAttribute("class", "card-text text-light small mb-2 border-bottom border-secondary pb-1");
        genero.innerText = `Categoría: ${juego.categoria}`;
        let desc = document.createElement("p");
        desc.setAttribute("class", "card-text text-light");
        desc.innerText = juego.descripcion;
        let puntaje = document.createElement("p");
        puntaje.setAttribute("class", "badge bg-danger rounded-0 mt-2");
        puntaje.innerText = `Puntaje: ${juego.puntaje}`;
        cardBody.appendChild(titulo);
        cardBody.appendChild(genero);
        cardBody.appendChild(desc);
        cardBody.appendChild(puntaje);
        card.appendChild(img);
        card.appendChild(cardBody);
        col.appendChild(card);
        contenedor.appendChild(col);
    });
    document.getElementById("btn-cargar").style.display = "none";
}