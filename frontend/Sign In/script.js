function togglePassword(inputId) {
        const input = document.getElementById(inputId);
        if (input.type === 'password') {
          input.type = 'text';
        } else {
          input.type = 'password';
        }
      }

      function showWelcomeScreen() {
  // Generar ID aleatorio de 4 dígitos
  const randomId = Math.floor(1000 + Math.random() * 9000);
  
  // Obtener el nombre del usuario
  const nameInput = document.querySelector('.input-configurator-2 .input-field');
  const userName = nameInput.value || 'User';
  
  // Cambiar el contenido del sign-in
  const signInDiv = document.querySelector('.sign-in');
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
}