import express from "express";
import db from "../db.js";

const router = express.Router();

/* ============================================================
   POST Crear orden con sus detalles
============================================================ */
router.post("/", (req, res) => {
    try {
        const { ID_USUARIO, FECHA, TOTAL, ESTADO, ID_RECOMPENSA, detalles } = req.body;

        // Validación básica
        if (!ID_USUARIO || !FECHA || !TOTAL || !ESTADO || !Array.isArray(detalles) || detalles.length === 0) {
            return res.status(400).json({ error: "Faltan datos obligatorios o detalles vacíos" });
        }

        const sqlOrden = `
            INSERT INTO ordenes (ID_USUARIO, FECHA, TOTAL, ESTADO, ID_RECOMPENSA)
            VALUES (?, ?, ?, ?, ?)
        `;

        db.query(sqlOrden, [ID_USUARIO, FECHA, TOTAL, ESTADO, ID_RECOMPENSA], (errOrden, resultOrden) => {
            if (errOrden) return res.status(500).json({ error: "Error al registrar la orden", detalle: errOrden });

            const idOrden = resultOrden.insertId;

            // Preparar detalles
            const sqlDetalle = `
                INSERT INTO detalle_orden (ID_ORDEN, ID_PRODUCTO, PRECIO_UNITARIO, CANTIDAD, SUBTOTAL)
                VALUES ?
            `;

            const valores = detalles.map(item => [
                idOrden,
                item.ID_PRODUCTO,
                item.PRECIO_UNITARIO,
                item.CANTIDAD,
                item.SUBTOTAL
            ]);

            db.query(sqlDetalle, [valores], (errDetalle, resultDetalle) => {
                if (errDetalle) {
                    return res.status(500).json({
                        error: "Orden creada pero ocurrió un error al registrar los detalles",
                        idOrden,
                        detalle: errDetalle
                    });
                }

                res.json({
                    mensaje: "Orden registrada con sus detalles",
                    idOrden,
                    detallesRegistrados: resultDetalle.affectedRows
                });
            });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

import express from "express";
import db from "../db.js";

const router = express.Router();

/* ============================================================
   GET Obtener órdenes activas con sus detalles
============================================================ */
router.get("/activas", (req, res) => {
    const sqlOrdenes = `
        SELECT * FROM ordenes
        WHERE ESTADO = 'activa'
        ORDER BY FECHA DESC
    `;

    db.query(sqlOrdenes, (errOrdenes, ordenes) => {
        if (errOrdenes) {
            return res.status(500).json({ error: "Error al obtener las órdenes activas", detalle: errOrdenes });
        }

        if (ordenes.length === 0) {
            return res.json({ ordenes: [] }); // sin órdenes activas
        }

        const ids = ordenes.map(o => o.ID_ORDEN);
        const sqlDetalles = `
            SELECT * FROM detalle_orden
            WHERE ID_ORDEN IN (?)
        `;

        db.query(sqlDetalles, [ids], (errDetalles, detalles) => {
            if (errDetalles) {
                return res.status(500).json({ error: "Error al obtener los detalles de orden", detalle: errDetalles });
            }

            // Agrupar detalles por ID_ORDEN
            const detallesPorOrden = {};
            detalles.forEach(d => {
                if (!detallesPorOrden[d.ID_ORDEN]) {
                    detallesPorOrden[d.ID_ORDEN] = [];
                }
                detallesPorOrden[d.ID_ORDEN].push(d);
            });

            // Combinar orden + detalles
            const resultado = ordenes.map(o => ({
                ...o,
                detalles: detallesPorOrden[o.ID_ORDEN] || []
            }));

            res.json({ ordenes: resultado });
        });
    });
});

/* ============================================================
   GET Obtener todas las órdenes  con sus detalles
============================================================ */
router.get("/historial", (req, res) => {
    const sqlOrdenes = `
        SELECT * FROM ordenes
        ORDER BY FECHA DESC
    `;

    db.query(sqlOrdenes, (errOrdenes, ordenes) => {
        if (errOrdenes) {
            return res.status(500).json({ error: "Error al obtener las órdenes activas", detalle: errOrdenes });
        }

        if (ordenes.length === 0) {
            return res.json({ ordenes: [] }); // sin órdenes activas
        }

        const ids = ordenes.map(o => o.ID_ORDEN);
        const sqlDetalles = `
            SELECT * FROM detalle_orden
            WHERE ID_ORDEN IN (?)
        `;

        db.query(sqlDetalles, [ids], (errDetalles, detalles) => {
            if (errDetalles) {
                return res.status(500).json({ error: "Error al obtener los detalles de orden", detalle: errDetalles });
            }

            // Agrupar detalles por ID_ORDEN
            const detallesPorOrden = {};
            detalles.forEach(d => {
                if (!detallesPorOrden[d.ID_ORDEN]) {
                    detallesPorOrden[d.ID_ORDEN] = [];
                }
                detallesPorOrden[d.ID_ORDEN].push(d);
            });

            // Combinar orden + detalles
            const resultado = ordenes.map(o => ({
                ...o,
                detalles: detallesPorOrden[o.ID_ORDEN] || []
            }));

            res.json({ ordenes: resultado });
        });
    });
});

/* ============================================================
   PUT Cambiar estado de orden terminada
============================================================ */
router.put("/:id/terminada", (req, res) => {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
        return res.status(400).json({ error: "ID de orden inválido" });
    }

    const sqlUpdate = `
        UPDATE ordenes
        SET ESTADO = 'terminada'
        WHERE ID_ORDEN = ?
    `;

    db.query(sqlUpdate, [id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: "Error al actualizar la orden", detalle: err });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Orden no encontrada" });
        }

        res.json({
            mensaje: "Orden marcada como terminada",
            idOrden: id
        });
    });
});

export default router;