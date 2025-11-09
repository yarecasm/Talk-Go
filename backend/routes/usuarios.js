import express from "express";
import db from "../db.js";

const router = express.Router();

// POST para registrar usuario
router.post("/", (req, res) => {
    const { NOMBRE, CORREO, PASSWORD, TIPO_USUARIO } = req.body;

    if (!NOMBRE || !CORREO || !PASSWORD || !TIPO_USUARIO) {
        return res.status(400).json({ error: "Faltan datos" });
    }

    const tiposValidos = ["cliente", "cocina", "admin"];
    if (!tiposValidos.includes(TIPO_USUARIO)) {
        return res.status(400).json({ error: "Tipo de usuario inválido" });
    }

    const PUNTOS_ACUMULADOS = TIPO_USUARIO === "cliente" ? 0 : null;

    const sql = `
    INSERT INTO usuarios (NOMBRE, CORREO, PASSWORD, TIPO_USUARIO, PUNTOS_ACUMULADOS)
    VALUES (?, ?, ?, ?, ?)
  `;

    db.query(sql, [NOMBRE, CORREO, PASSWORD, TIPO_USUARIO, PUNTOS_ACUMULADOS], (err, result) => {
        if (err) return res.status(500).json({ error: err });
        res.json({
            mensaje: `Usuario ${TIPO_USUARIO} registrado`,
            id: result.insertId,
            NOMBRE,
            CORREO,
            TIPO_USUARIO,
            PUNTOS_ACUMULADOS
        });
    });
});

export default router;
