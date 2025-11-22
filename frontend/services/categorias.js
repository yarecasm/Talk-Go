const API_URL = "http://localhost:4000/api";

export async function registrarCategoria(nombreCategoria) {
    const response = await fetch(`${API_URL}/categorias`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ NOMBRE: nombreCategoria }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Error al registrar la categoría");
    }

    return data;
}

export async function obtenerCategorias() {
    const response = await fetch(`${API_URL}/categorias`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Error al obtener las categorías");
    }

    return data.categorias; // devuelve el array de categorías
}

export async function actualizarCategoria(idCategoria, nuevoNombre) {
    const response = await fetch(`${API_URL}/categorias/${idCategoria}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ NOMBRE: nuevoNombre }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Error al actualizar la categoría");
    }

    return data;
}
