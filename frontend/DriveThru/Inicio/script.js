
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
  return;
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


// ACCIONES DE VOZ
window.addEventListener("message", (event) => {
  if (event.data.type !== "VOICE_ACTION") return;

  switch (event.data.action) {

    case "OPEN_MEMBER_LOGIN":
      AbrirPopup();
      break;

    case "OPEN_GUEST_ORDER":
      OrderWindow();
      break;

    case "CLOSE_MEMBER_POPUP":
      ClosePopup();
      break;

    case "SET_MEMBER_CODE":
      const input = document.getElementById("id-member");
      if (input) {
        input.value = event.data.code;

        // validar usuario
      }
      break;
  }
});