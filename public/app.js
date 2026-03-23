// app.js
console.log("APP.JS CARGADO");

document.addEventListener("DOMContentLoaded", () => {
  /* =============================
     FILTROS DE PRODUCTOS
  ============================== */
  const botonesFiltro = document.querySelectorAll(".btn-filtro");
  const tarjetas = document.querySelectorAll(".tarjeta-producto");

  botonesFiltro.forEach(boton => {
    boton.addEventListener("click", () => {
      botonesFiltro.forEach(b => b.classList.remove("activo"));
      boton.classList.add("activo");

      const filtro = boton.dataset.filtro;

      tarjetas.forEach(card => {
        const categoria = card.dataset.categoria;
        card.style.display =
          filtro === "todos" || categoria === filtro ? "" : "none";
      });
    });
  });
// prueba github
  /* =============================
     CARRITO
  ============================== */
  let carrito = [];

  const botonesAgregar = document.querySelectorAll(".btn-agregar");
  const listaCarrito = document.getElementById("lista-carrito");
  const totalSpan = document.getElementById("total");
  const toggleCarritoBtn = document.getElementById("toggleCarrito");
  const carritoContenido = document.getElementById("carritoContenido");
  const formPedido = document.getElementById("form-pedido");
  const mensajeEstado = document.getElementById("mensaje-estado");

function actualizarCarrito() {
  listaCarrito.innerHTML = "";
  let total = 0;

  carrito.forEach((item) => {
    const li = document.createElement("li");

    const subtotal = item.precio * item.cantidad;
    total += subtotal;

    li.innerHTML = `
      <span class="item-nombre">${item.nombre}</span>

      <div class="controles">
        <button type="button" class="btn-menos" data-id="${item.id}">−</button>
        <span class="item-cantidad">${item.cantidad}</span>
        <button type="button" class="btn-mas" data-id="${item.id}">+</button>
      </div>

      <span class="item-subtotal">$${subtotal}</span>

      <button type="button" class="btn-eliminar" data-id="${item.id}">X</button>
    `;

    listaCarrito.appendChild(li);
  });

  totalSpan.textContent = `$${total}`;
}
listaCarrito.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  const id = btn.dataset.id;
  const prod = carrito.find(p => p.id === id);
  if (!prod) return;

  if (btn.classList.contains("btn-mas")) {
    prod.cantidad++;
    actualizarCarrito();
    return;
  }

  if (btn.classList.contains("btn-menos")) {
    prod.cantidad--;
    if (prod.cantidad <= 0) {
      carrito = carrito.filter(p => p.id !== id);
    }
    actualizarCarrito();
    return;
  }

  if (btn.classList.contains("btn-eliminar")) {
    carrito = carrito.filter(p => p.id !== id);
    actualizarCarrito();
    return;
  }
});


  botonesAgregar.forEach(btn => {
    btn.addEventListener("click", e => {
      const card = e.target.closest(".tarjeta-producto");
      const id = card.dataset.id;
      const nombre = card.dataset.nombre;
      const precio = Number(card.dataset.precio);

      const existe = carrito.find(p => p.id === id);
      existe ? existe.cantidad++ : carrito.push({ id, nombre, precio, cantidad: 1 });

      actualizarCarrito();

      btn.classList.add("agregado");
      setTimeout(() => btn.classList.remove("agregado"), 500);
    });
  });

toggleCarritoBtn.addEventListener("click", () => {
  carritoContenido.classList.toggle("mostrar");

  toggleCarritoBtn.textContent =
    carritoContenido.classList.contains("mostrar")
      ? "Ocultar carrito"
      : "Ver carrito";
});


  /* =============================
     GUARDAR PEDIDO
  ============================== */
  function guardarPedido(pedido) {
    const pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];
    pedidos.push(pedido);
    localStorage.setItem("pedidos", JSON.stringify(pedidos));
  }

  formPedido.addEventListener("submit", e => {
    e.preventDefault();

    if (carrito.length === 0) {
      mensajeEstado.textContent = "El carrito está vacío";
      return;
    }

    const pedido = {
      fecha: new Date().toLocaleString(),
      cliente: {
        nombre: nombre.value,
        email: email.value,
        direccion: direccion.value
      },
      items: carrito
    };

    guardarPedido(pedido);

    mensajeEstado.textContent = "Pedido guardado correctamente 🌿";
    formPedido.reset();
    carrito = [];
    actualizarCarrito();
  });

  actualizarCarrito();

/* =============================
   ADMIN – VER PEDIDOS
============================= */
const btnVerPedidos = document.getElementById("btn-ver-pedidos");
const pedidosAdmin = document.getElementById("pedidos-admin");
const listaPedidos = document.getElementById("lista-pedidos");

btnVerPedidos.addEventListener("click", () => {
  const abierto = listaPedidos.classList.toggle("mostrar");

  btnVerPedidos.textContent = abierto
    ? "Ocultar pedidos"
    : "Ver pedidos guardados";

  if (!abierto) {
    listaPedidos.innerHTML = "";
    return;
  }

  listaPedidos.innerHTML = "";

  const pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];

  if (pedidos.length === 0) {
    listaPedidos.innerHTML = "<li>No hay pedidos guardados</li>";
    return;
  }

  pedidos.forEach((pedido, i) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>Pedido ${i + 1}</strong><br>
      Fecha: ${pedido.fecha}<br>
      Cliente: ${pedido.cliente.nombre}<br>
      Email: ${pedido.cliente.email}<br>
      Dirección: ${pedido.cliente.direccion}<br>
      Productos: ${pedido.items.length}
      <hr>
    `;
    listaPedidos.appendChild(li);
  });
});

});
