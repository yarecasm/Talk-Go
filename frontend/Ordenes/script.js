import { obtenerOrdenesActivas, inactivarOrden } from "../services/orden.js";



function renderOrdenes(ordenes) {
    const container = document.getElementById("ordenesActivas");
    container.innerHTML = ""; // limpiar

    ordenes.forEach(orden => {
        // Crear tarjeta de la orden
        const card = document.createElement("div");
        card.classList.add("order-card");

        let html = `
            <div class="order-header">
                <h2>Order </h2>
                <p>#${orden.ID_ORDEN}</p>
            </div>

            <div class="divider"></div>
            
            <div class="order">
        `;

        orden.detalles.forEach((d, index) => {
            const rutaFotos = `../UPLOADS/categorias/${d.PRODUCTO_CATEGORIA}/${d.PRODUCTO_FOTO}`;
            html += `
                <div class="order-item">
                    <img class="item-image" src="${rutaFotos}" alt="${d.PRODUCTO_NOMBRE}">
                    <div class="item-details">
                        <div class="item-name">${d.PRODUCTO_NOMBRE}</div>
                        <div class="item-quantity">x ${d.CANTIDAD}</div>
                        <div class="item-price">$${d.PRECIO_UNITARIO}</div>
                    </div>
                </div>
                ${index < orden.detalles.length - 1 ? '<div class="divider"></div>' : ""}
            `;
        });

        html += `</div>`; // cerrar order-items

        html += `
            <div class="order-footer">
                <div class="total-section">
                    <span class="total-label">Total</span>
                    <span class="total-amount">$${orden.TOTAL}</span>
                </div>
                <button onclick="finalizarOrden(${orden.ID_ORDEN})" class="finish-button">Finish</button>
            </div>`;
        card.innerHTML = html;
        container.appendChild(card);
    });
}

async function actualizarOrdenes() {
    const ordenes = await obtenerOrdenesActivas();
    renderOrdenes(ordenes);
}

async function finalizarOrden(id) {
    const onSuccess = await inactivarOrden(id);
    console.log(onSuccess.message);

    await actualizarOrdenes();
}

window.finalizarOrden = finalizarOrden;

// primera carga inmediata
actualizarOrdenes();

// cada 60 segundos
setInterval(actualizarOrdenes, 60000);
