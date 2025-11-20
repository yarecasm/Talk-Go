const API_URL = "http://localhost:4000/api";

export async function crearProducto(data) {
    /**
     * PASAR LOS DATOS EN TIPO FORM DATA DE ESTA MANERA:
      crearProducto({
            nombre,
            descripcion,
            id_categoria,
            precio,
            foto: inputFile.files[0]
        });
     */

    const formData = new FormData();

    formData.append("nombre", data.nombre);
    formData.append("descripcion", data.descripcion);
    formData.append("id_categoria", data.id_categoria);
    formData.append("precio", data.precio);
    formData.append("foto", data.foto); // aquí va el file input

    const response = await fetch(`${API_URL}/productos`, {
        method: "POST",
        body: formData, // sin headers
    });

    return await response.json();
}


export async function actualizarProducto(id, data) {
    const formData = new FormData();

    formData.append("nombre", data.nombre);
    formData.append("descripcion", data.descripcion);
    formData.append("id_categoria", data.id_categoria);
    formData.append("precio", data.precio);
    formData.append("estado", data.estado);

    if (data.foto) {
        formData.append("foto", data.foto); // solo si hay nueva foto
    }

    const response = await fetch(`${API_URL}/productos/${id}`, {
        method: "PUT",
        body: formData,
    });

    return await response.json();
}

export async function obtenerProductos() {
    const response = await fetch(`${API_URL}/productos`);
    return response.json();
}


export async function obtenerProductoPorId(id) {
    const response = await fetch(`${API_URL}/productos/${id}`);
    return response.json();
}


export async function obtenerProductosPorCategoria(idCategoria) {
    const response = await fetch(`${API_URL}/productos/categoria/${idCategoria}`);
    return response.json();
}


export async function eliminarProducto(id) {
    const response = await fetch(`${API_URL}/productos/${id}`, {
        method: "DELETE",
    });

    return response.json();
}


