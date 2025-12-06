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