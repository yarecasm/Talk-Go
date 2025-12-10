import { crearUsuarioInvitado, verificarUsuario } from "../../services/usuarios.js";

const divPopUpMember = document.getElementById('login-member');

async function OrderWindow() {
  console.log("Intentando crear invitado...");

  try {
    const guestUser = await crearUsuarioInvitado();
    localStorage.setItem("usuarioId", guestUser.ID_USUARIO);
    localStorage.setItem("usuarioNombre", guestUser.NOMBRE);
    console.log("OrderWindow ejecutado");
    location.assign("../Categorias/index.html");
  } catch (err) {
    console.error("Error creando usuario invitado:", err);
  }
  return;
}


// Mostrar palomita cuando el ID sea válido
const idInput = document.getElementById("id-member");
const checkIcon = document.getElementById("checkIcon");

idInput.addEventListener("input", () => {
  if (idInput.value.trim().length == 4) {
    // ejemplo: válido si tiene 4 caracteres
    checkIcon.style.display = "block";
  } else {
    checkIcon.style.display = "none";
  }
});

// Navegación entre pantallas
function AbrirPopup() {
  document.getElementById('login-member').style.display = 'flex';
}
function ClosePopup() {
  document.getElementById('login-member').style.display = "none";
}


let signinWindow = null;

function SignIn() {
  if (signinWindow == null || signinWindow.closed) {
    signinWindow = window.open("../../SignIn/index.html", "_blank");
  } else {
    signinWindow.focus();
  }
}



checkIcon.addEventListener("click", async () => {
  const id = idInput.value.trim();

  console.log("Verificando ID:", id);

  const usuario = await verificarUsuario(id);

  if (!usuario) {
    alert("⚠️ Ese ID no existe.");
    return;
  }

  // Si existe → guardarlo y mandar a categorías
  localStorage.setItem("usuarioId", usuario.ID_USUARIO);
  localStorage.setItem("usuarioTipo", usuario.TIPO_USUARIO);
  localStorage.setItem("usuarioNombre", usuario.NOMBRE);

  console.log("ID válido, entrando como miembro:", usuario.ID_USUARIO);

  location.assign("../Categorias/index.html");
});

window.SignIn = SignIn;
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
      if (idInput) {
        idInput.value = event.data.code;
        idInput.textContent = event.data.code;

        if (idInput.value.trim().length == 4) {
          // ejemplo: válido si tiene 4 caracteres
          checkIcon.style.display = "block";
        } else {
          checkIcon.style.display = "none";
        }
      }
      if (event.data.isValid) {
        location.assign("../Categorias/index.html");
      }
      else {
        idInput.textContent = "";
        idInput.value = "";
        checkIcon.style.display = "none";
      }
      break;
  }
});
