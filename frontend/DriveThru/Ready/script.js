function RewardsWindow() {
    location.assign('../Rewards/index.html');
}

document.addEventListener("DOMContentLoaded", () => {
  const nombre = localStorage.getItem("usuarioNombre");
  const rewardsButton = document.querySelector(".rewards-bar");
  const mainTexts = document.querySelector(".main-texts");

  if (nombre === "Invitado") {
    rewardsButton.style.display = "none";
    mainTexts.classList.add("shift-down");  // ⬅️ mueve todo hacia abajo
  }
});

// Función para redirigir a "inicio.html" después de 5 segundos
setTimeout(() => {
    localStorage.clear();
    window.location.href = "../Inicio/index.html";
}, 5000); // 5000 milisegundos = 5 segundos

 
   