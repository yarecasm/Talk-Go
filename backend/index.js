import express from "express";
import cors from "cors";
import db from "./db.js";
import usuariosRoutes from "./routes/usuarios.js";

const app = express();
app.use(cors());
app.use(express.json()); // <- muy importante

// Conectar rutas
app.use("/api/usuarios", usuariosRoutes);

// Ruta de prueba
app.get("/", (req, res) => {
    res.send("API funcionando");
});

const PORT = 4000;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
