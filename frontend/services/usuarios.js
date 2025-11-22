const API_URL = "http://localhost:4000/api";

export async function registrarUsuario(usuario) {
    const response = await fetch(`${API_URL}/usuarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(usuario),
    });

    return await response.json();
}

export async function iniciarSesion(credenciales) {
    const response = await fetch(`${API_URL}/usuarios/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credenciales),
    });

    return await response.json();
}

export async function obtenerUsuarios() {
    const response = await fetch(`${API_URL}/usuarios`);
    return await response.json();
}

export async function obtenerClientes() {
    const response = await fetch(`${API_URL}/usuarios/clientes`);
    return await response.json();
}

export async function eliminarUsuario(id) {
    const response = await fetch(`${API_URL}/usuarios/${id}`, {
        method: "DELETE",
    });

    return await response.json();
}

export async function actualizarPuntosUsuario(idUsuario, nuevosPuntos) {
    const response = await fetch(`${API_URL}/usuarios/${idUsuario}/puntos`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ puntos: nuevosPuntos }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Error al actualizar los puntos del usuario");
    }

    return data;
}

export async function actualizarPassword(idUsuario, nuevaPassword) {
    const response = await fetch(`${API_URL}/usuarios/${idUsuario}/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nuevaPassword }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Error al actualizar la contraseña");
    }

    return data;
}

