import express from "express";
import db from "../db.js";

const router = express.Router();

// Crear usuario invitado
router.post("/guest", (req, res) => {
  const correoFake = `guest_${Date.now()}@invitado.com`;
  const sql = "INSERT INTO usuarios (NOMBRE, CORREO, PASSWORD, TIPO_USUARIO, PUNTOS_ACUMULADOS) VALUES (?, ?, ?, ?, ?)";

  db.query(sql, ["Invitado", correoFake, "", "cliente", 0], (err, result) => {
  if (err) {
    console.error(err);
    return res.status(500).json({ error: "Error creando usuario invitado" });
  }
  console.log("Usuario invitado creado con ID:", result.insertId);
  res.json({
    ID_USUARIO: result.insertId,
    NOMBRE: "Invitado",
    TIPO_USUARIO: "INVITADO"
  });
});
});


// --- POST para registrar usuario ????
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

// POST registrar usuario con ID aleatorio único
router.post("/registro", (req, res) => {
  const { NOMBRE, CORREO, PASSWORD } = req.body;

  if (!NOMBRE || !CORREO || !PASSWORD) {
    return res.status(400).json({ error: "Faltan datos" });
  }

  // Función para generar ID único (con callback)
  function generarIdUnico(callback) {
    const idUsuario = Math.floor(1000 + Math.random() * 9000);
    db.query("SELECT ID_USUARIO FROM usuarios WHERE ID_USUARIO = ?", [idUsuario], (err, rows) => {
      if (err) return callback(err);
      if (rows.length > 0) {
        // Si ya existe, llamar de nuevo (recursión)
        return generarIdUnico(callback);
      } else {
        callback(null, idUsuario);
      }
    });
  }

  generarIdUnico((err, idUsuario) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Error al generar ID" });
    }

    const sql = `
      INSERT INTO usuarios (ID_USUARIO, NOMBRE, CORREO, PASSWORD, TIPO_USUARIO, PUNTOS_ACUMULADOS)
      VALUES (?, ?, ?, ?, 'cliente', 0)
    `;

    db.query(sql, [idUsuario, NOMBRE, CORREO, PASSWORD], (err2) => {
      if (err2) {
        console.error(err2);
        return res.status(500).json({ error: "Error al registrar usuario" });
      }

      res.json({
        mensaje: "Usuario cliente registrado",
        ID_USUARIO: idUsuario,
        NOMBRE,
        CORREO,
        TIPO_USUARIO: "cliente",
        PUNTOS_ACUMULADOS: 0
      });
    });
  });
});

// GET /usuarios/:id
router.get("/:id", (req, res) => {
  const sql = "SELECT * FROM usuarios WHERE ID_USUARIO = ?";
  db.query(sql, [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: "DB error" });

    if (results.length === 0)
      return res.status(404).json({ error: "Usuario no encontrado" });

    res.json(results[0]);
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
