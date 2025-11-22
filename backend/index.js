import express from "express";
import cors from "cors";
import db from "./db.js";
import usuariosRoutes from "./routes/usuarios.js";
import categoriasRoutes from "./routes/categorias.js";
import productosRoutes from "./routes/productos.js";
import recompensasRoutes from "./routes/recompensas.js"

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conectar rutas
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/categorias", categoriasRoutes);
app.use("/api/productos", productosRoutes);
app.use("/api/recompensas", recompensasRoutes);

// Ruta de prueba
app.get("/", (req, res) => {
    res.send("API funcionando");
});

const PORT = 4000;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
