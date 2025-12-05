import { registrarUsuarioCliente } from "../services/usuarios.js";

function togglePassword(inputId) {
        const input = document.getElementById(inputId);
        if (input.type === 'password') {
          input.type = 'text';
        } else {
          input.type = 'password';
        }
      }

function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function isValidPhone(phone) {
  const regex = /^[0-9\s\-]{10,15}$/;  // 10-15 dígitos con espacios o guiones
  return regex.test(phone);
}

document.getElementById("signInButton").addEventListener("click", showWelcomeScreen);
function showWelcomeScreen() {
  const errorBox = document.getElementById("errorMessage");
  
  // Obtener inputs
  const emailInput = document.querySelector(".input-configurator .input-field");
  const nameInput = document.querySelector(".input-configurator-2 .input-field");
  const passInput = document.getElementById("password");
  const confirmInput = document.getElementById("confirmPassword");

  // Reset estilos
  [emailInput, nameInput, passInput, confirmInput].forEach(input => {
    input.classList.remove("input-error");
  });

  // Validación: campos vacíos
  if (
    emailInput.value.trim() === "" ||
    nameInput.value.trim() === "" ||
    passInput.value.trim() === "" ||
    confirmInput.value.trim() === ""
  ) {
    errorBox.style.display = "block";
    errorBox.innerText = "Please fill out all fields.";
    
    [emailInput, nameInput, passInput, confirmInput].forEach(input => {
      if (input.value.trim() === "") input.classList.add("input-error");
    });
    
    return;
  }

  // Validación: debe ser email o teléfono válido
  const emailOrPhone = emailInput.value.trim();

  if (!isValidEmail(emailOrPhone) && !isValidPhone(emailOrPhone)) {
    errorBox.style.display = "block";
    errorBox.innerText = "Please enter a valid email or phone number.";
    emailInput.classList.add("input-error");
    return;
  }

  // Validación: contraseñas coinciden
  if (passInput.value !== confirmInput.value) {
    errorBox.style.display = "block";
    errorBox.innerText = "Passwords do not match.";
    passInput.classList.add("input-error");
    confirmInput.classList.add("input-error");
    return;
  }

  // Si todo pasa → ocultar error
  errorBox.style.display = "none";

  // Datos del usuario
const usuarioData = {
  NOMBRE: nameInput.value.trim(),
  CORREO: emailInput.value.trim(),
  PASSWORD: passInput.value.trim()
};

registrarUsuarioCliente(usuarioData)
  .then(result => {
    const userName = result.NOMBRE;
    const randomId = result.ID_USUARIO;

    const signInDiv = document.querySelector(".sign-in");
    signInDiv.innerHTML = `
      <img class="sin-ttulo" src="logo.png" alt="Brew&Bagel Logo" />
      
      <div class="welcome-message">Hey ${userName}, welcome to<br>Brew & Bagel Rewards</div>
      
      <div class="id-section">
        <p class="id-label">This is your ID</p>
        <p class="id-number">${randomId}</p>
      </div>
      
      <div class="bottom-panel">
        <p class="head">© Talk &amp; Go 2025</p>
      </div>
    `;
  })
  .catch(err => {
    errorBox.style.display = "block";
    errorBox.innerText = "Error al registrar usuario: " + err.message;
  });


  // Obtener nombre para el mensaje
  const userName = nameInput.value || "User";

  /*
  // Cambiar pantalla
  const signInDiv = document.querySelector(".sign-in");
  signInDiv.innerHTML = `
    <img class="sin-ttulo" src="logo.png" alt="Brew&Bagel Logo" />
    
    <div class="welcome-message">Hey ${userName}, welcome to<br>Brew & Bagel Rewards</div>
    
    <div class="id-section">
      <p class="id-label">This is your ID</p>
      <!-- <p class="id-number">${randomId}</p> --> 
    </div>
    
    <div class="bottom-panel">
      <p class="head">© Talk &amp; Go 2025</p>
    </div>
  `;
  */
}