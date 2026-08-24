<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Blog de Videojuegos - Pablo Labra</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css">
  <style>
    /* Estilo oscuro general */
    body { background-color: #121212; color: #e0e0e0; }
    h1, h2, h3, h4, .navbar-brand { font-family: 'Times New Roman', serif; letter-spacing: 1px; }
    
    /* Colores personalizados */
    .bg-souls { background-color: #1a1a1a !important; border-bottom: 1px solid #333; }
    .text-blood { color: #b71c1c; }
    
    .btn-blood { background-color: #8b0000; color: white; border: none; }
    .btn-blood:hover { background-color: #5c0000; color: #ddd; }
    
    /* Tarjetas y Formularios oscuros */
    .card-dark { background-color: #1e1e1e; border: 1px solid #333; color: #bbb; transition: 0.3s; }
    .card-dark:hover { border-color: #b71c1c; }
    
    .form-souls { background-color: #1e1e1e; border: 1px solid #444; color: #ccc; }
    .form-souls:focus { background-color: #242424; color: #fff; border-color: #b71c1c; box-shadow: none; }
  </style>
</head>
<body class="d-flex flex-column min-vh-100">

  <!-- Navbar -->
  <nav class="navbar navbar-expand-sm navbar-dark bg-souls">
    <div class="container-fluid">
      <a class="navbar-brand text-blood fw-bold" href="index.php">Neos Blog</a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#collapsibleNavbar">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="collapsibleNavbar">
        <ul class="navbar-nav me-auto">
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
              <i class="bi bi-info-circle me-1 text-blood"></i>El Proyecto
            </a>
            <ul class="dropdown-menu dropdown-menu-dark">
              <li><a class="dropdown-item" href="empresa.php">Quiénes Somos</a></li>
              <li><a class="dropdown-item" href="empresa.php">Nuestro Equipo</a></li>
              <li><a class="dropdown-item" href="empresa.php">Misión</a></li>
            </ul>
          </li>
          <li class="nav-item"><a class="nav-link" href="productos.php"><i class="bi bi-controller me-1 text-blood"></i>Reseñas y Noticias</a></li>
          <li class="nav-item"><a class="nav-link" href="servicios.php"><i class="bi bi-hdd-network me-1 text-blood"></i>Servicios</a></li>
          <li class="nav-item"><a class="nav-link active" href="contacto.php"><i class="bi bi-envelope me-1 text-blood"></i>Contacto</a></li>
        </ul>
        <button class="btn btn-outline-danger rounded-0" type="button" data-bs-toggle="modal" data-bs-target="#myModal">
          Acceder
        </button>
      </div>
    </div>
  </nav>

  <!-- Contenido Formulario de Contacto -->
  <div class="container my-5 flex-grow-1">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="p-5 border border-secondary shadow-lg rounded-0 bg-souls">
          <h1 class="text-blood mb-3">Contacto Directo</h1>
          <p class="text-light mb-4">¿Tienes sugerencias, quieres colaborar o enviarnos una clave de revisión para tu juego? Escríbenos.</p>

          <form action="empresa.php" method="post">
            <div class="mb-4">
              <label for="contact-email" class="form-label text-light">Correo electrónico:</label>
              <input type="email" class="form-control form-souls rounded-0" id="contact-email" placeholder="pablo.labra101@gmail.com" name="email" required>
            </div>
            <div class="mb-4">
              <label for="comment" class="form-label text-light">Mensaje:</label>
              <textarea class="form-control form-souls rounded-0" rows="5" id="comment" name="comment" placeholder="Escribe tu mensaje..."></textarea>
            </div>
            <button type="submit" class="btn btn-blood px-5 rounded-0">Enviar Mensaje</button>
          </form>
          
          <div class="mt-4 pt-3 border-top border-secondary text-light">
             <p class="mb-1"><small><strong>Email Personal:</strong> pablo.labra101@gmail.com</small></p>
             <p class="mb-0"><small><strong>Email Institucional:</strong> p.labrajabre@uandresbello.edu</small></p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal de Autenticación -->
  <div class="modal fade" id="myModal">
    <div class="modal-dialog">
      <div class="modal-content bg-dark text-light border-secondary">
        <div class="modal-header border-secondary">
          <h4 class="modal-title text-blood">Autenticación - Panel Admin</h4>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <form action="empresa.php" method="post">
            <div class="mb-3">
              <label for="email" class="form-label">Correo electrónico (Admin):</label>
              <input type="email" class="form-control form-souls rounded-0" id="email" placeholder="p.labrajabre@uandresbello.edu" name="email" required>
            </div>
            <div class="mb-3">
              <label for="pwd" class="form-label">Contraseña:</label>
              <input type="password" class="form-control form-souls rounded-0" id="pwd" placeholder="Ingresar contraseña" name="pswd" required>
            </div>
            <button type="submit" class="btn btn-blood w-100 rounded-0 mt-3">Acceder</button>
          </form>
        </div>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <footer class="container-fluid bg-souls text-light p-3 mt-auto border-top border-secondary">
    <div class="row text-center text-md-start">
      <div class="col-md-4"><strong>Desarrollo Web - Sección 3</strong></div>
      <div class="col-md-4"><p class="mb-0">Proyecto: Blog de Videojuegos</p></div>
      <div class="col-md-4"><p class="mb-0">Desarrollado por: Pablo Labra (NeosZ101) &copy; 2026</p></div>
    </div>
  </footer>

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>