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

// --- POST para iniciar sesión
router.post("/login", (req, res) => {
    const { CORREO, PASSWORD } = req.body;

    // Validación de campos vacíos
    if (!CORREO || !PASSWORD) {
        return res.status(400).json({ error: "Correo y contraseña son requeridos" });
    }

    // Buscar usuario por correo
    const sql = "SELECT ID_USUARIO, NOMBRE, CORREO, PASSWORD, TIPO_USUARIO, PUNTOS_ACUMULADOS FROM usuarios WHERE CORREO = ?";

    db.query(sql, [CORREO], (err, results) => {
        if (err) return res.status(500).json({ error: err });

        if (results.length === 0) {
            return res.status(401).json({ error: "Usuario no encontrado" });
        }

        const usuario = results[0];

        // Comparar contraseña (sin hash, porque tu código no usa bcrypt aún)
        if (usuario.PASSWORD !== PASSWORD) {
            return res.status(401).json({ error: "Contraseña incorrecta" });
        }

        // Usuario correcto
        res.json({
            mensaje: "Inicio de sesión exitoso",
            usuario: {
                ID_USUARIO: usuario.ID_USUARIO,
                NOMBRE: usuario.NOMBRE,
                CORREO: usuario.CORREO,
                TIPO_USUARIO: usuario.TIPO_USUARIO,
                PUNTOS_ACUMULADOS: usuario.PUNTOS_ACUMULADOS
            }
        });
    });
});

// --- GET todos los usuarios
router.get("/", (req, res) => {
    const sql = "SELECT ID_USUARIO, NOMBRE, CORREO, TIPO_USUARIO FROM usuarios";

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
});

// --- GET solo clientes
router.get("/clientes", (req, res) => {
    const sql = "SELECT ID_USUARIO, NOMBRE, CORREO, PUNTOS_ACUMULADOS FROM usuarios WHERE TIPO_USUARIO = 'cliente'";

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
});

export default router;
