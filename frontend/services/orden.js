const API_URL = "http://localhost:4000/api";

/* ---------------------------------------------------------
   POST registrar orden con sus detalles

   {
    ID_USUARIO: 12,
    FECHA: "2025-11-21",
    TOTAL: 450.00,
    ESTADO: "activa",
    ID_RECOMPENSA: 3,
    detalles: [
        {
            ID_PRODUCTO: 101,
            PRECIO_UNITARIO: 150.00,
            CANTIDAD: 2,
            SUBTOTAL: 300.00
        },
        {
            ID_PRODUCTO: 102,
            PRECIO_UNITARIO: 75.00,
            CANTIDAD: 2,
            SUBTOTAL: 150.00
        }
    ]
};
--------------------------------------------------------- */
export async function registrarOrden(ordenData) {
    const response = await fetch(`${API_URL}/ordenes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ordenData),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Error al registrar la orden");
    }

    return data; // devuelve idOrden y detallesRegistrados
}

/* ---------------------------------------------------------
   GET obtener órdenes activas con sus detalles
--------------------------------------------------------- */
export async function obtenerOrdenesActivas() {
    const response = await fetch(`${API_URL}/ordenes/activas`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Error al obtener las órdenes activas");
    }

    return data.ordenes; // array con orden + detalles
}

/* ---------------------------------------------------------
   GET obtener todas las órdenes con sus detalles
--------------------------------------------------------- */
export async function obtenerOrdenesActivas() {
    const response = await fetch(`${API_URL}/ordenes/historial`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Error al obtener las órdenes");
    }

    return data.ordenes; // array con orden + detalles
}


/* ---------------------------------------------------------
   PUT marcar orden como inactiva (terminada)
--------------------------------------------------------- */
export async function inactivarOrden(idOrden) {
    const response = await fetch(`${API_URL}/ordenes/${idOrden}/terminada`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Error al finalizar la orden");
    }

    return data; // devuelve idOrden y mensaje
}