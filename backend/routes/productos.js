import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import db from "../db.js";
import { fileURLToPath } from "url";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// -------------------------
// CONFIG MULTER
// -------------------------
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const categoriaId = req.body.id_categoria;

        if (!categoriaId) {
            return cb(new Error("Debes enviar id_categoria"), null);
        }

        const dir = path.join(__dirname, "..", "..", "frontend", "UPLOADS", "categorias", categoriaId.toString());

        // Crear carpeta si no existe
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        cb(null, dir);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, Date.now() + ext);
    }
});

const upload = multer({ storage });

// ---------------------------------------------------------------
// POST crear producto
// ---------------------------------------------------------------
router.post("/", upload.single("foto"), async (req, res) => {
    try {
        const { nombre, descripcion, id_categoria, precio } = req.body;
        const estado = 1;

        const foto = req.file ? req.file.filename : null;

        const sql = `
            INSERT INTO productos (nombre, descripcion, id_categoria, precio, estado, FOTO)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        db.query(
            sql,
            [nombre, descripcion, id_categoria, precio, estado, foto],
            (err, result) => {
                if (err) return res.status(500).json({ error: err });

                res.json({
                    mensaje: "Producto registrado correctamente",
                    id: result.insertId,
                    fotoGuardada: foto
                });
            }
        );

    } catch (error) {
        console.error("Error al crear producto:", error);
        res.status(500).json({ error: error.message });
    }
});


// ---------------------------------------------------------------
// PUT actualizar producto
// ---------------------------------------------------------------
router.put("/:id", upload.single("foto"), async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, id_categoria, precio, estado } = req.body;

    try {
        // 1. Obtener el producto actual
        const sqlSelect = "SELECT FOTO, id_categoria FROM productos WHERE id = ?";
        db.query(sqlSelect, [id], (err, rows) => {
            if (err) return res.status(500).json({ error: err });

            if (rows.length === 0)
                return res.status(404).json({ error: "Producto no encontrado" });

            const productoActual = rows[0];
            let fotoFinal = productoActual.FOTO;

            // 2. Si viene nueva foto, preparar para reemplazar
            if (req.file) {
                fotoFinal = req.file.filename;

                // ruta foto anterior
                const rutaAnterior = path.join(
                    __dirname, "..", "..", "frontend",
                    "UPLOADS",
                    "categorias",
                    productoActual.id_categoria.toString(),
                    productoActual.FOTO
                );

                // borrar foto vieja si existe
                if (fs.existsSync(rutaAnterior)) {
                    fs.unlinkSync(rutaAnterior);
                }
            }

            // 3. SQL actualizar
            const sqlUpdate = `
                UPDATE productos 
                SET nombre = ?, descripcion = ?, id_categoria = ?, precio = ?, estado = ?, FOTO = ?
                WHERE id = ?
            `;

            db.query(
                sqlUpdate,
                [
                    nombre,
                    descripcion,
                    id_categoria,
                    precio,
                    estado,
                    fotoFinal,
                    id
                ],
                (err2, result) => {
                    if (err2) return res.status(500).json({ error: err2 });

                    res.json({
                        mensaje: "Producto actualizado correctamente",
                        producto: {
                            id,
                            nombre,
                            descripcion,
                            id_categoria,
                            precio,
                            estado,
                            FOTO: fotoFinal
                        }
                    });
                }
            );
        });
    } catch (error) {
        console.error("Error al actualizar producto:", error);
        res.status(500).json({ error: error.message });
    }
});

// GET OBTENER TODOS LOS PRODUCTOS 
router.get("/", (req, res) => {
    const sql = "SELECT * FROM productos";

    db.query(sql, (err, rows) => {
        if (err) return res.status(500).json({ error: err });

        res.json(rows);
    });
});

// GET OBTENER UN PRODUCTO POR SU ID
router.get("/:id", (req, res) => {
    const { id } = req.params;

    const sql = "SELECT * FROM productos WHERE ID_PRODUCTO = ?";

    db.query(sql, [id], (err, rows) => {
        if (err) return res.status(500).json({ error: err });

        if (rows.length === 0)
            return res.status(404).json({ error: "Producto no encontrado" });

        res.json(rows[0]);
    });
});


// GET OBTENER TODOS LOS PRODUCTOS DE UNA CATEGORÍA
router.get("/categoria/:id_categoria", (req, res) => {
    const { id_categoria } = req.params;

    const sql = "SELECT * FROM productos WHERE id_categoria = ?";

    db.query(sql, [id_categoria], (err, rows) => {
        if (err) return res.status(500).json({ error: err });

        if (rows.length === 0)
            return res.status(404).json({ error: "Productos no encontrados" });

        res.json(rows); // devolver todos
    });
});


// DELETE BORRAR PRODUCTO POR SU ID
router.delete("/:id", (req, res) => {
    const { id } = req.params;

    // 1. Obtener información del producto
    const sqlSelect = "SELECT FOTO, id_categoria FROM productos WHERE id = ?";

    db.query(sqlSelect, [id], (err, rows) => {
        if (err) return res.status(500).json({ error: err });

        if (rows.length === 0)
            return res.status(404).json({ error: "Producto no encontrado" });

        const producto = rows[0];

        // 2. Eliminar foto física si existe
        if (producto.FOTO) {
            const rutaFoto = path.join(
                __dirname, "..", "..", "frontend",
                "UPLOADS",
                "categorias",
                producto.id_categoria.toString(),
                producto.FOTO
            );

            if (fs.existsSync(rutaFoto)) {
                fs.unlinkSync(rutaFoto);
            }
        }

        // 3. Eliminar registro de BD
        const sqlDelete = "DELETE FROM productos WHERE id = ?";

        db.query(sqlDelete, [id], (err2, result) => {
            if (err2) return res.status(500).json({ error: err2 });

            res.json({ mensaje: "Producto eliminado correctamente" });
        });
    });
});


export default router;
