import express from "express";
import db from "../db.js";

const router = express.Router();

/* ============================================================
   POST Crear recompensa
============================================================ */
router.post("/", (req, res) => {
    try {
        const {
            NOMBRE,
            DESCRIPCION,
            TIPO,
            PUNTOS,
            VALOR_DESCUENTO,
            ID_PRODUCTO_ASOCIADO,
            ESTADO
        } = req.body;

        // Validación básica
        if (!NOMBRE || !DESCRIPCION || !TIPO || PUNTOS===undefined || VALOR_DESCUENTO===undefined) {
            return res.status(400).json({ error: "Faltan datos obligatorios" });
        }

        const tiposValidos = ["ganancia", "gratis", "porcentaje", "2x1", "3x2"];

        if (!tiposValidos.includes(TIPO)) {
            return res.status(400).json({ error: "El tipo de recompensa no es válido" });
        }

         // Solo requiere producto asociado para 2x1, 3x2 y gratis
        if ((TIPO === "2x1" || TIPO === "3x2" || TIPO === "gratis") && !ID_PRODUCTO_ASOCIADO) {
            return res.status(400).json({ error: "Este tipo de recompensa requiere un producto asociado" });
        }

        const estadoFinal = ESTADO ?? 1;

        const sql = `
            INSERT INTO recompensas
            (NOMBRE, DESCRIPCION, TIPO, PUNTOS, VALOR_DESCUENTO, ID_PRODUCTO_ASOCIADO, ESTADO)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(
            sql,
            [NOMBRE, DESCRIPCION, TIPO, PUNTOS, VALOR_DESCUENTO, ID_PRODUCTO_ASOCIADO, estadoFinal],
            (err, result) => {
                if (err) return res.status(500).json({ error: err });

                res.json({
                    mensaje: "Recompensa registrada correctamente",
                    id: result.insertId,
                    reward: {
                        NOMBRE,
                        DESCRIPCION,
                        TIPO,
                        PUNTOS,
                        VALOR_DESCUENTO,
                        ID_PRODUCTO_ASOCIADO,
                        ESTADO: estadoFinal
                    }
                });
            }
        );
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/* ============================================================
   GET Obtener todas las recompensas excepto las de puntos por compra
============================================================ */
router.get("/", (req, res) => {
    const sql = "SELECT * FROM recompensas WHERE TIPO != 'ganancia'";

    db.query(sql, (err, rows) => {
        if (err) return res.status(500).json({ error: err });

        res.json({ rewards: rows });
    });
});

/* ============================================================
   GET Obtener recompensa por ID
============================================================ */
router.get("/:id", (req, res) => {
    const { id } = req.params;

    const sql = "SELECT * FROM recompensas WHERE ID_RECOMPENSA = ?";

    db.query(sql, [id], (err, rows) => {
        if (err) return res.status(500).json({ error: err });

        if (rows.length === 0) {
            return res.status(404).json({ error: "Recompensa no encontrada" });
        }

        res.json(rows[0]);
    });
});

/* ============================================================
   PUT Actualizar recompensa
============================================================ */
router.put("/:id", (req, res) => {
    const { id } = req.params;

    const {
        NOMBRE,
        DESCRIPCION,
        TIPO,
        PUNTOS,
        VALOR_DESCUENTO,
        ID_PRODUCTO_ASOCIADO,
        ESTADO
    } = req.body;

    const sql = `
        UPDATE recompensas
        SET NOMBRE = ?, DESCRIPCION = ?, TIPO = ?, PUNTOS = ?, VALOR_DESCUENTO = ?, ID_PRODUCTO_ASOCIADO = ?, ESTADO = ?
        WHERE ID_RECOMPENSA = ?
    `;

    db.query(
        sql,
        [NOMBRE, DESCRIPCION, TIPO, PUNTOS, VALOR_DESCUENTO, ID_PRODUCTO_ASOCIADO, ESTADO, id],
        (err, result) => {
            if (err) return res.status(500).json({ error: err });

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: "Recompensa no encontrada" });
            }

            res.json({
                mensaje: "Recompensa actualizada correctamente",
                reward: {
                    id,
                    NOMBRE,
                    DESCRIPCION,
                    TIPO,
                    PUNTOS,
                    VALOR_DESCUENTO,
                    ID_PRODUCTO_ASOCIADO,
                    ESTADO
                }
            });
        }
    );
});

/* ============================================================
   DELETE Eliminar recompensa
============================================================ */
router.delete("/:id", (req, res) => {
    const { id } = req.params;

    const sql = "DELETE FROM recompensas WHERE ID_RECOMPENSA = ?";

    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ error: err });

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Recompensa no encontrada" });
        }

        res.json({ mensaje: "Recompensa eliminada correctamente" });
    });
});

export default router;
