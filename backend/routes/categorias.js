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

// AGREGAR UNA CATEGORÍA
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

// OBTENER TODAS LAS CATEGORÍAS
router.get("/", (req, res) => {
    const sql = "SELECT ID_CATEGORIA, NOMBRE FROM categoria ORDER BY ID_CATEGORIA ASC";

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ error: "Error al obtener las categorías" });
        }

        return res.json({
            categorias: results
        });
    });
});

// ACTUALIZAR EL NOMBRE DE UNA CATEGORÍA
router.put("/:id", (req, res) => {
    const { id } = req.params;
    const { NOMBRE } = req.body;

    if (!id || isNaN(Number(id))) {
        return res.status(400).json({ error: "ID de categoría inválido" });
    }

    if (!NOMBRE || String(NOMBRE).trim() === "") {
        return res.status(400).json({ error: "El nombre de la categoría es requerido" });
    }

    const nombreTrim = String(NOMBRE).trim();

    const sqlUpdate = "UPDATE categoria SET NOMBRE = ? WHERE ID_CATEGORIA = ?";

    db.query(sqlUpdate, [nombreTrim, id], (errUpdate, resultUpdate) => {
        if (errUpdate) {
            return res.status(500).json({ error: "Error al actualizar la categoría" });
        }

        if (resultUpdate.affectedRows === 0) {
            return res.status(404).json({ error: "Categoría no encontrada" });
        }

        return res.json({
            mensaje: "Categoría actualizada correctamente",
            id,
            NOMBRE: nombreTrim
        });
    });
});

export default router;
