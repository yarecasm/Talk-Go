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