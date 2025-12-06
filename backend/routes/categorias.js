import express from "express";
import db from "../db.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";

const router = express.Router();

// Necesario para obtener __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Función para construir la ruta donde se guardará la carpeta
function buildFolderPath(idCategoria) {
    const safeId = String(idCategoria).trim();
    return path.join(__dirname, "..", "..", "frontend", "UPLOADS", "categorias", safeId);
}

// AGREGAR UNA CATEGORÍA
router.post("/", upload.single("foto"), (req, res) => {
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

        const sqlInsert = `
            INSERT INTO categoria (NOMBRE)
            VALUES (?)
        `;

        db.query(sqlInsert, [nombreTrim], (errInsert, resultInsert) => {
            if (errInsert) {
                return res.status(500).json({ error: "Error al registrar la categoría" });
            }

            const idCategoria = resultInsert.insertId;
            const carpetaCategoria = buildFolderPath(idCategoria);

            try {
                // Crear carpeta si no existe
                if (!fs.existsSync(carpetaCategoria)) {
                    fs.mkdirSync(carpetaCategoria, { recursive: true });
                }

                // Procesar imagen si existe
                let nombreFinalImagen = null;

                if (req.file) {
                    nombreFinalImagen = `IMGCATEGORIA${idCategoria}.png`;
                    const rutaFinal = path.join(carpetaCategoria, nombreFinalImagen);

                    fs.writeFileSync(rutaFinal, req.file.buffer);
                }

                // Guardar la foto en la base de datos
                const sqlUpdate = "UPDATE categoria SET FOTO = ? WHERE ID_CATEGORIA = ?";
                db.query(sqlUpdate, [nombreFinalImagen, idCategoria]);

                return res.json({
                    mensaje: "Categoría registrada con imagen",
                    id: idCategoria,
                    NOMBRE: nombreTrim,
                    foto: nombreFinalImagen
                });

            } catch (fsErr) {
                return res.status(500).json({
                    error: "Hubo un error al guardar la imagen",
                    detalle: String(fsErr)
                });
            }
        });
    });
});

// OBTENER TODAS LAS CATEGORÍAS
router.get("/", (req, res) => {
    const sql = "SELECT * FROM categoria ORDER BY ID_CATEGORIA ASC";

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

// Exportar el router y también upload si lo necesitas en otros módulos
export { upload };
export default router;