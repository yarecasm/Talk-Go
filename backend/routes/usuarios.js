import express from "express";
import db from "../db.js";

const router = express.Router();

// --- POST para registrar usuario
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

// --- DELETE eliminar usuario
router.delete("/:id", (req, res) => {
    const { id } = req.params;

    // Validar que llega el ID
    if (!id) {
        return res.status(400).json({ error: "ID requerido" });
    }

    const sql = "DELETE FROM usuarios WHERE ID_USUARIO = ?";

    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ error: err });

        // Si no borró nada, no existe el usuario
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        res.json({
            mensaje: "Usuario eliminado correctamente",
            idEliminado: id
        });
    });
});

// --- PUT actualizar puntos de un usuario
router.put("/:id/puntos", (req, res) => {
    const { id } = req.params;
    const { puntos } = req.body;

    if (!id) {
        return res.status(400).json({ error: "ID requerido" });
    }

    if (puntos === undefined) {
        return res.status(400).json({ error: "Se requieren los puntos" });
    }

    const sql = "UPDATE usuarios SET PUNTOS_ACUMULADOS = ? WHERE ID_USUARIO = ?";

    db.query(sql, [puntos, id], (err, result) => {
        if (err) return res.status(500).json({ error: err });

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        res.json({
            mensaje: "Puntos actualizados correctamente",
            ID_USUARIO: id,
            nuevosPuntos: puntos
        });
    });
});

// --- PUT actualizar contraseña de un usuario
router.put("/:id/password", (req, res) => {
    const { id } = req.params;
    const { nuevaPassword } = req.body;

    if (!nuevaPassword) {
        return res.status(400).json({ error: "La nueva contraseña es requerida" });
    }

    const sql = `
        UPDATE usuarios 
        SET PASSWORD = ?
        WHERE ID_USUARIO = ?
    `;

    db.query(sql, [nuevaPassword, id], (err, result) => {
        if (err) return res.status(500).json({ error: err });

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        res.json({
            mensaje: "Contraseña actualizada correctamente",
            usuarioActualizado: id
        });
    });
});


export default router;
