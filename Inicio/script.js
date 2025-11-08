
const divPopUpMember = document.getElementById('login-member');

function AbrirPopup() {
    document.getElementById('login-member').style.display = 'flex';
}
function ClosePopup() {
    document.getElementById('login-member').style.display = "none";
}

function OrderWindow() {
    location.assign('../Categorias/index.html');
}