
const data = [
  { id: "13", img: "../img/Snacks/bigñets.png", nombre: "Bigñets", precio: "$3.00" },
  { id: "14", img: "../img/Snacks/coles.png", nombre: "Coles", precio: "$3.00" },
  { id: "15", img: "../img/Snacks/french fries.png", nombre: "French Fries", precio: "$5.00" },
  { id: "16", img: "../img/Snacks/sweet potato fries.png", nombre: "Sweet Potato Fries", precio: "$5.00" }
];

const gallery = document.querySelector('.product-gallery');
const orderItems = document.getElementById('order-items');
const orderTotal = document.getElementById('order-total');

let cart = JSON.parse(localStorage.getItem('cart')) || {};
let total = 0;
updateOrderDisplay();

// Generar los botones de producto dinámicamente
data.forEach(producto => {
  const button = document.createElement('button');
  button.className = 'product-card';
  button.setAttribute('data-name', producto.nombre);
  button.setAttribute('data-price', producto.precio.replace('$', ''));
  button.setAttribute('data-img', producto.img);

  button.innerHTML = `
    <div class="div-img"><img src="${producto.img}" alt="${producto.nombre}" class='product-img'/></div>
    <div class="product-name">${producto.nombre}</div>
    <div class="product-price">${producto.precio}</div>
  `;

  button.addEventListener('click', () => {
    const name = producto.nombre;
    const price = parseFloat(producto.precio.replace('$', ''));
    const img = producto.img;
    addToOrder(name, price, img);
  });

  gallery.appendChild(button);
});

// Función para agregar al carrito
function addToOrder(name, price, img) {
  if (cart[name]) {
    cart[name].quantity += 1;
  } else {
    cart[name] = { price, quantity: 1, img };
  }
  updateOrderDisplay();
}

// Función para actualizar el resumen de orden
function updateOrderDisplay() {
  orderItems.innerHTML = '';
  total = 0;

  for (const name in cart) {
    const item = cart[name];
    total += item.price * item.quantity;

    const orderItem = document.createElement('div');
    orderItem.className = 'order-item';

    orderItem.innerHTML = `
      <img src="${item.img}" alt="${name}" />
      <div class="order-info">
        <div class="name">${name}</div>
        <div class="price">$${(item.price * item.quantity).toFixed(2)}</div>
      </div>
      <div class="order-controls">
        <button onclick="decreaseQuantity('${name}')">−</button>
        <span>${item.quantity}</span>
        <button onclick="increaseQuantity('${name}')">+</button>
      </div>
    `;

    orderItems.appendChild(orderItem);
  }

  orderTotal.textContent = `${total.toFixed(2)}`;

  localStorage.setItem('cart', JSON.stringify(cart));
}

// Funciones para modificar cantidad
function increaseQuantity(name) {
  cart[name].quantity += 1;
  updateOrderDisplay();
}

function decreaseQuantity(name) {
  cart[name].quantity -= 1;
  if (cart[name].quantity <= 0) {
    delete cart[name];
  }
  updateOrderDisplay();
}

// Navegación entre categorías
document.querySelector('.backButton').addEventListener('click', () => {
  window.location.href = '../Categorias/index.html';
});

document.querySelector('.drinksButton').addEventListener('click', () => {
  window.location.href = '../Drinks/index.html';
});

document.querySelector('.bagelsButton').addEventListener('click', () => {
  window.location.href = '../Bagels/index.html';
});

// Borrar carrito al hacer clic en ORDER
document.querySelector('.order-button').addEventListener('click', () => {
  cart = {};
  localStorage.removeItem('cart');
  updateOrderDisplay();
});
