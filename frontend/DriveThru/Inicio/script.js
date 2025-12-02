
const divPopUpMember = document.getElementById('login-member');

import { crearUsuarioInvitado } from "../../services/usuarios.js";

async function OrderWindow() {
  console.log("Intentando crear invitado...");
  console.log("OrderWindow ejecutado");
  try {
    const guestUser = await crearUsuarioInvitado();
    localStorage.setItem("usuarioId", guestUser.ID_USUARIO);
    location.assign("../Categorias/index.html");
  } catch (err) {
    console.error("Error creando usuario invitado:", err);
  }
}

// Navegación entre pantallas
function AbrirPopup() {
    document.getElementById('login-member').style.display = 'flex';
}
function ClosePopup() {
    document.getElementById('login-member').style.display = "none";
}

window.OrderWindow = OrderWindow;
window.AbrirPopup = AbrirPopup;
window.ClosePopup = ClosePopup;