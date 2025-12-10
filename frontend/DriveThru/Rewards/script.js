
import { obtenerRewards } from "../../services/recompensas.js";
import { obtenerPuntosUsuario } from "../../services/usuarios.js";

let userPoints = 0;
let rewards = "";

async function obtenerRecompensas() {
    rewards = await obtenerRewards();
    console.log(rewards);
    generateRewards();
}

async function obtenerPuntos() {
    const idUsuario = localStorage.getItem('usuarioId');
    userPoints = await obtenerPuntosUsuario(idUsuario);
    userPoints = parseInt(userPoints.PUNTOS_ACUMULADOS);
    console.log(userPoints);
    setUserPoints();
}

function ReadyWindow() {
    location.assign('../Ready/index.html');
}

document.addEventListener("DOMContentLoaded", () => {
    obtenerPuntos();
    setUserPoints();
    obtenerRecompensas();
});


function generateRewards() {

    const grid = document.querySelector(".rewards-grid");
    grid.innerHTML = ""; // Limpia el grid

    rewards.forEach(reward => {
        const card = document.createElement("div");
        card.classList.add("reward-card");

        // Si NO alcanza puntos → desactivar
        if (userPoints < reward.PUNTOS) {
            card.classList.add("disabled");
        }

        let display = "";
        let name = "";
        switch (reward.TIPO) {

            case "gratis":
                display = "FREE";
                name = reward.NOMBRE;
                break;

            case "porcentaje":
                display = reward.VALOR_DESCUENTO + "% discount";
                name = display;
                break;

            default:
                display = reward.TIPO;
                name = reward.NOMBRE;
                break;

        }

        card.innerHTML = `
            <span class="reward-main">${display}</span>
            <span class="reward-desc">${name}</span>
            <span class="reward-points">★ ${reward.PUNTOS} ★</span>
        `;

        if (userPoints >= reward.PUNTOS) {
            card.addEventListener("click", () => {
                claimReward(reward);
            });
        }

        grid.appendChild(card);
    });
}

function setUserPoints() {
    const points = document.querySelector(".points-earned");
    const leftPoints = document.querySelector(".missing-points");
    const progress = document.querySelector(".progress-filled");

    console.log(userPoints);

    // Mostrar puntos actuales
    points.innerHTML = (userPoints ?? 0) + "/";

    // Mostrar puntos faltantes
    leftPoints.innerHTML = userPoints >= 100 ? 0 : 100 - (userPoints ?? 0);

    // Calcular porcentaje del progreso (0 a 100)
    const percent = Math.min((userPoints ?? 0), 100);

    // Aplicar el width dinámicamente
    progress.style.width = percent + "%";
}


function claimReward(reward) {
    alert(`You claimed: ${reward.NOMBRE} - ${reward.TIPO} for ${reward.PUNTOS} points!`);

    // Guardar el objeto reward en localStorage
    localStorage.setItem("reward", JSON.stringify(reward));

    // Redirigir
    location.assign("../Categorias/index.html");
}



