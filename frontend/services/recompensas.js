const API_URL = "http://localhost:4000/api";

/* ---------------------------------------------------------
   POST registrar recompensa
--------------------------------------------------------- */
export async function registrarReward(rewardData) {
    const response = await fetch(`${API_URL}/rewards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rewardData),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Error al registrar la recompensa");
    }

    return data; // devuelve reward creado
}

/* ---------------------------------------------------------
   GET obtener todas las recompensas
--------------------------------------------------------- */
export async function obtenerRewards() {
    const response = await fetch(`${API_URL}/recompensas`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Error al obtener las recompensas");
    }

    return data.rewards; // array de recompensas
}

/* ---------------------------------------------------------
   PUT actualizar recompensa
--------------------------------------------------------- */
export async function actualizarReward(idReward, rewardActualizado) {
    const response = await fetch(`${API_URL}/rewards/${idReward}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rewardActualizado),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Error al actualizar la recompensa");
    }

    return data;
}

/* ---------------------------------------------------------
   DELETE eliminar recompensa
--------------------------------------------------------- */
export async function eliminarReward(idReward) {
    const response = await fetch(`${API_URL}/rewards/${idReward}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Error al eliminar la recompensa");
    }

    return data;
}
