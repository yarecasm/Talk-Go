
function ReadyWindow() {
    location.assign('../Ready/index.html');
}

const userPoints = 56;   

const rewards = [
    { id: 1, name: "Bacon Bagel", display: "2x1", cost: 50 },
    { id: 2, name: "Iced Latte", display: "FREE", cost: 40 },
    { id: 3, name: "Bigñets", display: "FREE", cost: 60 },
    { id: 4, name: "50% discount", display: "50% discount", cost: 70 },
    { id: 5, name: "Salmon Bagel", display: "3x2", cost: 40 }
];

document.addEventListener("DOMContentLoaded", () => {
    generateRewards();
    updateProgress();
});


function generateRewards() {
    const grid = document.querySelector(".rewards-grid");
    grid.innerHTML = ""; // Limpia el grid

    rewards.forEach(reward => {
        const card = document.createElement("div");
        card.classList.add("reward-card");

        // Si NO alcanza puntos → desactivar
        if (userPoints < reward.cost) {
            card.classList.add("disabled");
        }

        card.innerHTML = `
            <span class="reward-main">${reward.display}</span>
            <span class="reward-desc">${reward.name}</span>
            <span class="reward-points">${reward.cost} ★</span>
        `;

        if (userPoints >= reward.cost) {
            card.addEventListener("click", () => {
                claimReward(reward);
            });
        }

        grid.appendChild(card);
    });
}

function claimReward(reward) {
    alert(`You claimed: ${reward.name} for ${reward.cost} points!`);
    location.assign("../Ready/index.html");
}



