function StartWindow() {
    location.assign('../Inicio/index.html');
}
function BagelsWindow() {
    location.assign('../Bagels/index.html');
}
function DrinksWindow() {
    location.assign('../Drinks/index.html');
}
function SnacksWindow() {
    location.assign('../Snacks/index.html');
}
function CombosWindow() {
// location.assign('../Combos/index.html');
}
function AsistenteVirtual(){
    
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
