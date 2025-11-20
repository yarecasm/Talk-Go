import express from "express";
import db from "../db.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();

// Necesario para obtener __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Función para construir la ruta donde se guardará la carpeta
function buildFolderPath(idCategoria) {
    const safeId = String(idCategoria).trim();
    return path.join(__dirname, "..", "..", "frontend", "UPLOADS", "categorias", safeId);
}

router.post("/", (req, res) => {
    const { NOMBRE } = req.body;

    if (!NOMBRE || String(NOMBRE).trim() === "") {
        return res.status(400).json({ error: "El nombre de la categoría es requerido" });
    }

    const nombreTrim = String(NOMBRE).trim();

    const sqlCheck = "SELECT ID_CATEGORIA FROM categoria WHERE LOWER(NOMBRE) = LOWER(?)";

    db.query(sqlCheck, [nombreTrim], (errCheck, results) => {
        if (errCheck) {
            return res.status(500).json({ error: "Error al verificar la categoría" });
        }

        if (results.length > 0) {
            return res.status(400).json({ error: "La categoría ya existe" });
        }

        const sqlInsert = "INSERT INTO categoria (NOMBRE) VALUES (?)";

        db.query(sqlInsert, [nombreTrim], (errInsert, resultInsert) => {
            if (errInsert) {
                return res.status(500).json({ error: "Error al registrar la categoría" });
            }

            try {
                const folderPath = buildFolderPath(resultInsert.insertId);

                if (!fs.existsSync(folderPath)) {
                    fs.mkdirSync(folderPath, { recursive: true });
                }

                return res.json({
                    mensaje: "Categoría registrada y carpeta creada",
                    id: resultInsert.insertId,
                    NOMBRE: nombreTrim
                });

            } catch (fsErr) {
                return res.status(500).json({
                    error: "Categoría creada en BD pero ocurrió un error al crear la carpeta",
                    detalle: String(fsErr)
                });
            }
        });
    });
});

export default router;
