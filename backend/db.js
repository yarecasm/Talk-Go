import mysql from "mysql2";

const db = mysql.createConnection({
    host: "localhost",
    user: "root",       // o tu usuario de MySQL
    password: "",       // si tienes contraseña, ponla aquí
    database: "talkngo"
});

db.connect((err) => {
    if (err) {
        console.error("Error al conectar a MySQL:", err);
    } else {
        console.log("✅ Conectado a la base de datos MySQL");
    }
});

export default db;
