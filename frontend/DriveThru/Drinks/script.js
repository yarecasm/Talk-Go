
const data = [
  { id: "1", img: "../img/Pantalla Drinks/cold brew.png", nombre: "Cold Brew", precio: "$3.00" },
  { id: "2", img: "../img/Pantalla Drinks/iced latte.png", nombre: "Iced Latte", precio: "$3.00" },
  { id: "3", img: "../img/Pantalla Drinks/mocha.png", nombre: "Mocha", precio: "$5.00" },
  { id: "4", img: "../img/Pantalla Drinks/matcha frapuccino.png", nombre: "Matcha Frapuccino", precio: "$5.00" },
  { id: "5", img: "../img/Pantalla Drinks/chai frapuccino.png", nombre: "Chai Frapuccino", precio: "$5.00" },
  { id: "6", img: "../img/Pantalla Drinks/oreo frapuccino.png", nombre: "Oreo Frapuccino", precio: "$5.00" }
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

document.querySelector('.bagelsButton').addEventListener('click', () => {
  window.location.href = '../Bagels/index.html';
});

document.querySelector('.snacksButton').addEventListener('click', () => {
  window.location.href = '../Snacks/index.html';
});

// Borrar carrito al hacer clic en ORDER
document.querySelector('.order-button').addEventListener('click', () => {
  window.location.href = '../Ready/index.html';
  cart = {};
  localStorage.removeItem('cart');
  updateOrderDisplay();
});
