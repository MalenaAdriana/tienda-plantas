const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("public"));

const PEDIDOS_FILE = path.join(__dirname, "pedidos.json");

// crear archivo si no existe
if (!fs.existsSync(PEDIDOS_FILE)) {
  fs.writeFileSync(PEDIDOS_FILE, "[]");
}

// guardar pedido
app.post("/api/pedidos", (req, res) => {
  const pedido = req.body;

  const pedidos = JSON.parse(fs.readFileSync(PEDIDOS_FILE));
  pedidos.push({
    ...pedido,
    fecha: new Date().toLocaleString()
  });

  fs.writeFileSync(PEDIDOS_FILE, JSON.stringify(pedidos, null, 2));

  res.json({ ok: true });
});

/** Si definís ADMIN_SECRET (variable de entorno), el listado de pedidos exige el header X-Admin-Key o ?key= */
function requireAdmin(req, res, next) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return next();
  const key = req.headers["x-admin-key"] || req.query.key;
  if (key !== secret) {
    return res.status(401).json({ error: "No autorizado" });
  }
  next();
}

// ver pedidos (panel admin)
app.get("/api/pedidos", requireAdmin, (req, res) => {
  const pedidos = JSON.parse(fs.readFileSync(PEDIDOS_FILE));
  res.json(pedidos);
});

app.listen(PORT, () => {
  console.log(`Tienda: http://localhost:${PORT}`);
  console.log(`Admin pedidos: http://localhost:${PORT}/admin.html`);
});
