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
