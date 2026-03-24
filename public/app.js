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
  const carritoFAB = document.getElementById("carritoFAB");
  const carritoFABBadge = document.getElementById("carritoFABBadge");
  const carritoOverlay = document.getElementById("carritoOverlay");
  const carritoPanel = document.getElementById("carritoPanel");
  const cerrarCarritoBtn = document.getElementById("cerrarCarrito");
  const formPedido = document.getElementById("form-pedido");
  const mensajeEstado = document.getElementById("mensaje-estado");
  const inputNombre = document.getElementById("nombre");
  const inputEmail = document.getElementById("email");
  const inputDireccion = document.getElementById("direccion");

  function setCarritoAbierto(abierto) {
    carritoPanel.classList.toggle("carrito-abierto", abierto);
    carritoOverlay.classList.toggle("activo", abierto);
    carritoPanel.setAttribute("aria-hidden", abierto ? "false" : "true");
    carritoOverlay.setAttribute("aria-hidden", abierto ? "false" : "true");
    carritoFAB.setAttribute("aria-expanded", abierto ? "true" : "false");
    document.body.style.overflow = abierto ? "hidden" : "";
  }

  function toggleCarritoPanel() {
    const abierto = !carritoPanel.classList.contains("carrito-abierto");
    setCarritoAbierto(abierto);
  }

  function actualizarCarrito() {
    listaCarrito.innerHTML = "";
    let total = 0;
    let cantidadTotal = 0;

    carrito.forEach((item) => {
      const li = document.createElement("li");

      const subtotal = item.precio * item.cantidad;
      total += subtotal;
      cantidadTotal += item.cantidad;

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

    if (cantidadTotal > 0) {
      carritoFABBadge.hidden = false;
      carritoFABBadge.textContent = String(cantidadTotal);
    } else {
      carritoFABBadge.hidden = true;
    }
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

  carritoFAB.addEventListener("click", () => toggleCarritoPanel());
  cerrarCarritoBtn.addEventListener("click", () => setCarritoAbierto(false));
  carritoOverlay.addEventListener("click", () => setCarritoAbierto(false));

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && carritoPanel.classList.contains("carrito-abierto")) {
      setCarritoAbierto(false);
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

  /* =============================
     GUARDAR PEDIDO (servidor → pedidos.json)
  ============================== */
  formPedido.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (carrito.length === 0) {
      mensajeEstado.textContent = "El carrito está vacío";
      return;
    }

    const pedido = {
      fecha: new Date().toLocaleString(),
      cliente: {
        nombre: inputNombre.value.trim(),
        email: inputEmail.value.trim(),
        direccion: inputDireccion.value.trim()
      },
      items: carrito.map((i) => ({ ...i }))
    };

    mensajeEstado.textContent = "Enviando pedido…";

    try {
      const res = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pedido)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        throw new Error("fetch");
      }

      mensajeEstado.textContent = "¡Pedido recibido! Te contactamos pronto.";
      formPedido.reset();
      carrito = [];
      actualizarCarrito();
      setCarritoAbierto(false);
    } catch {
      mensajeEstado.textContent =
        "No pudimos enviar el pedido ahora. Escribinos por WhatsApp con tu lista y datos de entrega.";
    }
  });

  actualizarCarrito();

});
