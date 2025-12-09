import { obtenerCategorias } from "../../services/categorias.js";

window.StartWindow = function () {
    location.assign('../Inicio/index.html');
}

async function cargarCategorias() {
    const contenedor = document.getElementById("categories-grid");
    contenedor.innerHTML = ""; // Limpia por si acaso

    const categorias = await obtenerCategorias();

    categorias.forEach(cat => {
        const btn = document.createElement("button");
        btn.classList.add("rectangle");
        btn.innerHTML = `
            <img class="image" src="../../UPLOADS/categorias/${cat.ID_CATEGORIA}/${cat.FOTO}" alt="${cat.NOMBRE}" />
            <div class="text">${cat.NOMBRE}</div>
        `;

        // >>> Cuando le dan click guardar ID y redirigir
        btn.onclick = () => {
            localStorage.setItem("categoriaSeleccionada", cat.ID_CATEGORIA);

            // redirección
            window.location.href = "../Menu/index.html";
        };

        contenedor.appendChild(btn);
    });
}

cargarCategorias();

window.goToRewards = function () {
  window.location.href = "../Rewards/index.html";
};



function openMenu() {
    window.location.href = "../Menu/index.html";
    return;
}


document.addEventListener("DOMContentLoaded", () => {
  const greeting = document.getElementById("userGreeting");
  const reward = document.getElementById("userReward")
  const rewardArrow = document.getElementById("rewardArrow");
  const nombre = localStorage.getItem("usuarioNombre");
  const tipo = localStorage.getItem("usuarioTipo");

  if (nombre === "Invitado") {
    greeting.innerHTML = `Hey,<br>`;
    
  } else {
    greeting.innerHTML = `Hey ${nombre},<br>`;
    reward.innerHTML = `BREW & BAGEL REWARDS`;
    rewardArrow.src = "../img/flecha.png"; 
  }
});

// ACCIONES DE VOZ
window.addEventListener("message", (event) => {
    if (event.data.type !== "VOICE_ACTION") return;
    switch (event.data.action) {
        case "OPEN_CATEGORY":
            localStorage.setItem("categoriaSeleccionada", event.data.id);
            openMenu();
            break;

        default:
            break;
    }
    return;
});
