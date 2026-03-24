(function () {
  const lista = document.getElementById("lista-pedidos");
  const mensaje = document.getElementById("mensaje-estado");
  const btnActualizar = document.getElementById("btn-actualizar");

  function mostrarMensaje(texto, tipo) {
    if (!texto) {
      mensaje.hidden = true;
      mensaje.textContent = "";
      mensaje.className = "mensaje-admin";
      return;
    }
    mensaje.hidden = false;
    mensaje.textContent = texto;
    mensaje.className = "mensaje-admin " + (tipo || "info");
  }

  function totalPedido(items) {
    if (!Array.isArray(items)) return 0;
    return items.reduce((acc, it) => acc + (Number(it.precio) * Number(it.cantidad) || 0), 0);
  }

  function escapar(s) {
    const d = document.createElement("div");
    d.textContent = s == null ? "" : String(s);
    return d.innerHTML;
  }

  async function cargarPedidos() {
    mostrarMensaje("Cargando…", "info");
    let key = sessionStorage.getItem("adminKey");

    const intentar = async () => {
      const headers = {};
      if (key) headers["X-Admin-Key"] = key;
      const res = await fetch("/api/pedidos", { headers });

      if (res.status === 401) {
        const nuevo = window.prompt(
          "Clave de administrador:\n(Si configuraste ADMIN_SECRET en el servidor, escribila aquí. Si no, dejá vacío y probá de nuevo.)"
        );
        if (nuevo === null) {
          mostrarMensaje("No autorizado. Necesitás la clave configurada en el servidor.", "error");
          return;
        }
        key = nuevo.trim();
        if (key) sessionStorage.setItem("adminKey", key);
        else sessionStorage.removeItem("adminKey");
        return cargarPedidos();
      }

      if (!res.ok) {
        throw new Error("HTTP " + res.status);
      }

      const pedidos = await res.json();
      if (!Array.isArray(pedidos)) {
        throw new Error("Respuesta inválida");
      }

      mostrarMensaje("", "");
      lista.innerHTML = "";

      if (pedidos.length === 0) {
        lista.innerHTML = '<p class="vacio">No hay pedidos todavía.</p>';
        return;
      }

      pedidos.forEach((pedido, i) => {
        const card = document.createElement("article");
        card.className = "pedido-card";

        const cliente = pedido.cliente || {};
        const fecha = pedido.fecha || "—";
        const items = pedido.items || [];
        const t = totalPedido(items);

        const ul = document.createElement("ul");
        ul.className = "pedido-items";
        items.forEach((it) => {
          const li = document.createElement("li");
          li.textContent =
            `${it.nombre || "Producto"} × ${it.cantidad || 0} — $${(Number(it.precio) * Number(it.cantidad)) || 0}`;
          ul.appendChild(li);
        });

        card.innerHTML = `
          <h2>Pedido ${i + 1}</h2>
          <div class="pedido-meta">
            <strong>Fecha:</strong> ${escapar(fecha)}<br />
            <strong>Cliente:</strong> ${escapar(cliente.nombre)}<br />
            <strong>Email:</strong> ${escapar(cliente.email)}<br />
            <strong>Dirección:</strong> ${escapar(cliente.direccion)}
          </div>
        `;

        const meta = card.querySelector(".pedido-meta");
        if (meta) meta.after(ul);
        else card.appendChild(ul);

        const totalP = document.createElement("p");
        totalP.className = "pedido-total-linea";
        totalP.textContent = `Total estimado: $${t}`;
        card.appendChild(totalP);
        lista.appendChild(card);
      });
    };

    try {
      await intentar();
    } catch (e) {
      mostrarMensaje(
        "No se pudieron cargar los pedidos. ¿Está corriendo el servidor (npm start) en el mismo origen?",
        "error"
      );
      lista.innerHTML = "";
    }
  }

  btnActualizar.addEventListener("click", () => cargarPedidos());
  cargarPedidos();
})();
