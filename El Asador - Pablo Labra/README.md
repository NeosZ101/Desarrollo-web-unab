# El Asador 

**Caso 20:** Parrilladas "El Asador"
**Asignatura:** Diseño Web y Móvil, Universidad Andrés Bello
**Desarrollador:** Pablo Labra (NeosZ101)

**Demo en vivo:** [https://neosz101.github.io/el-asador-frontend/](https://neosz101.github.io/el-asador-frontend/)

Este repositorio contiene el código fuente y la documentación técnica de la Entrega C2. Este documento explica las decisiones de arquitectura, cómo está construido el JavaScript y cómo se simularon los flujos solicitados en la pauta.

## 1. Descripción general

El proyecto es una solución **100% Front-End**: todo el catálogo, el carrito, el cálculo de despacho, el registro y el panel interno corren en el navegador, sin necesidad de un backend real ni conexión a una base de datos.

Está construido puramente con **HTML5, CSS3 y JavaScript**. Además, utiliza **Bootstrap 5** de forma local (sin depender de un CDN externo), lo que garantiza que la página sea completamente autónoma y pueda ejecutarse con un alto rendimiento directamente desde un servidor de archivos estáticos como GitHub Pages.

## 2. Desarrollo en JavaScript (Vanilla JS)

No usé frameworks pesados como React ni librerías como jQuery. Todo está construido con Vanilla JS moderno, enfocado en no escribir código de más y mantener el proyecto ligero.

* **Sintaxis ES6:** En los archivos principales (`comun.js`, `carrito.js`, `admin.js`) usé funciones flecha y métodos nativos de arreglos como `.map()`, `.filter()` y `.reduce()` para hacer cálculos rápidos (por ejemplo, sumar el total del carrito o filtrar pedidos). Para la lógica específica de cada vista (como los formularios), usé funciones tradicionales para mantener el código fácil de leer y depurar.
* **Manipulación del DOM:** Para el carrito y la carta usé manipulación pura con `document.createElement`, `setAttribute` y `appendChild`. Para listas más simples o tablas de administración, usé plantillas de texto (Template Literals) con `innerHTML`.
* **Base de datos simulada:** `datos.js` contiene constantes con todo el catálogo, zonas de despacho y cuentas de ejemplo. El sistema no realiza llamadas a ninguna API externa.
* **Persistencia (LocalStorage):** Para que el sitio no pierda los datos al recargar la página, utilizo `localStorage`. Al ser una página alojada de forma pública, cada persona que entra ve solo la información guardada en su propio navegador (su cuenta, su carrito y sus pedidos). Para propósitos de evaluación, el administrador cuenta con un botón de "Restablecer datos de ejemplo" en el panel interno que limpia el storage.

## 3. Decisiones de diseño y Bootstrap

La página está construida con un enfoque **Mobile-First** usando el sistema de grillas nativo de Bootstrap. El diseño asegura que no haya desborde de contenido en resoluciones que van desde 320px (celulares) hasta 1440px (escritorio).

Para no sobrecargar `css/estilos.css` (el cual se mantiene en aproximadamente 220 líneas), establecí la siguiente regla de diseño:
* **Vistas públicas (Inicio, Carta, Empresa, Contacto):** Tienen una identidad visual fuerte, utilizando clases propias (`.caja`, `.caja-titulo`) para darles el aspecto rojo y oscuro de la marca.
* **Vistas de gestión (Panel Interno y Mis Pedidos):** Son puramente funcionales. Están armadas estrictamente con componentes nativos de Bootstrap (`card`, `table-dark`, `nav-tabs`), sin adornos innecesarios, para que la información se lea rápido.

## 4. Flujos de usuario simulados

Al no contar con un servidor, los flujos críticos se resuelven por completo en el navegador del cliente:

1. **Registro de usuarios:** El formulario en `registro.html` valida los campos mediante atributos de HTML5 nativo (`required`, `type="email"`, `pattern` para el RUN). Al enviar los datos, JavaScript atrapa el evento con `e.preventDefault()`, guarda al cliente en `localStorage` e inicia la sesión automáticamente, habilitando el proceso de pago al instante.
2. **Carrito y pago:** Al presionar "Pagar", el sistema suma el valor de los productos y el costo de despacho según la comuna elegida. Si la sesión está iniciada, procesa el pago de inmediato, descuenta los productos del carrito y envía la orden directamente a la vista de "Mis pedidos" y al panel del administrador.
3. **Orden de despacho:** El personal, ingresando desde el panel interno, puede imprimir la orden de un pedido. Se arma el documento de despacho utilizando JavaScript y se abre directamente la ventana de impresión nativa del navegador.

## 5. Dónde está cada punto de la pauta

| Requisito de la rúbrica | Implementación en el proyecto |
| :--- | :--- |
| **HTML5, viewport, UTF-8 y Bootstrap 5** | En el `<head>` de cada archivo `.html`. Bootstrap cargado localmente desde `css/vendor/`. |
| **Navbar responsivo con dropdown** | Implementado en todas las vistas con menú colapsable tipo "hamburger" para móviles. |
| **Footer con grilla de Bootstrap** | Estructurado de forma estandarizada al final de las 8 páginas. |
| **Carrusel de imágenes** | En `index.html`, utilizando recursos SVG locales en la carpeta `img/`. |
| **Ventanas modales** | Interfaz de "Acceder" en el navbar, detalle individual de productos y mantenedores del panel interno. |
| **Formulario de contacto** | Maquetado en `contacto.html` y validado lógicamente a través de `js/contacto.js`. |
| **DOM dinámico (JS puro)** | Uso intensivo de `createElement` y `appendChild` en `js/tienda.js`. Inyección de nodos con `innerHTML` en el carrito y panel de administrador. |
| **Sintaxis ES6** | Funciones flecha y métodos `.map`/`.reduce` en `js/comun.js` y `js/carrito.js`. |
| **Select dinámico (Despacho)** | El select de comunas recalcula automáticamente el valor del envío en `js/carrito.js` y `js/servicios.js`. |
| **Carrito y LocalStorage** | Lógica completa estructurada en `js/carrito.js`, guardando el estado a través de métodos de lectura/escritura en `js/comun.js`. |
| **Panel interno (acceso por rol)** | Lógica de permisos de vista en `js/admin.js`, validando los accesos según los roles de `js/datos.js`. |
| **CSS optimizado sin !important** | Archivo `css/estilos.css` limpio. Uso de selectores jerárquicos (hermanos `+`, `~` e hijos `>`) para la UI del carrito interactivo. |
| **Ayuda en línea** | Acordeón de preguntas frecuentes incrustado en el footer de todas las páginas. |

***

### Cuentas de prueba para revisión

Si deseas probar los flujos internos sin necesidad de registrar una cuenta nueva en la plataforma, puedes utilizar las siguientes credenciales de prueba (la validación requiere un mínimo de 6 caracteres en la clave):

* **Administrador:** `admin@elasador.cl` / Clave: `admin123` (Acceso total al panel)
* **Dueño:** `dueno@elasador.cl` / Clave: `dueno123` (Acceso exclusivo a ventas y productos)
* **Despacho:** `despacho@elasador.cl` / Clave: `despacho123` (Acceso exclusivo a órdenes en curso)
* **Cliente base:** `andrea.molina@correo.cl` (Ideal para probar la vista "Mis pedidos")