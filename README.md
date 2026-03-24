Tienda de Plantas

Aplicación web full stack con carrito de compras y gestión de pedidos.

Tecnologías
- HTML
- CSS
- JavaScript
- Node.js
- Express

Funcionalidades
- Carrito dinámico
- Gestión de pedidos
- API REST
- Persistencia de datos

Cómo ejecutar
1. Instalar dependencias:
npm install

2. Ejecutar servidor:
node server.js

3. Abrir en el navegador:
   - Tienda: http://localhost:3000
   - **Panel de pedidos (admin):** http://localhost:3000/admin.html

Los pedidos confirmados desde la tienda se guardan en `pedidos.json` en la raíz del proyecto.

### Proteger el listado de pedidos (recomendado en producción)

Definí la variable de entorno `ADMIN_SECRET` con una clave larga. En ese caso, al abrir el admin el navegador pedirá esa clave (o podés enviarla en el header `X-Admin-Key`).

Ejemplo en PowerShell antes de `npm start`:

```powershell
$env:ADMIN_SECRET="tu-clave-secreta"
npm start
```

Si **no** definís `ADMIN_SECRET`, `GET /api/pedidos` sigue abierto (solo para desarrollo local).
