import { obtenerProductosPorCategoria } from "../../services/productos.js";

const gallery = document.querySelector('.product-gallery');
const orderItems = document.getElementById('order-items');
const orderTotal = document.getElementById('order-total');

let cart = JSON.parse(localStorage.getItem('cart')) || {};
let total = 0;

// Ruta base para las fotos
const rutaFotos = "http://localhost:4000/UPLOADS/2";

updateOrderDisplay();

// función para cargar productos desde la BD
async function cargarProductos() {
  try {
    // Trae productos de la categoría 2 (Drinks)
    const productos = await obtenerProductosPorCategoria(2);

    gallery.innerHTML = ""; // limpia la galería

    productos.forEach(producto => {
      const button = document.createElement('button');
      button.className = 'product-card';

      const fotoUrl = rutaFotos + producto.FOTO;

      /*
      button.setAttribute('data-name', producto.NOMBRE);
      button.setAttribute('data-price', producto.PRECIO);
      button.setAttribute('data-img', producto.FOTO); // aquí debe venir la URL de la imagen
      */

      button.innerHTML = `
        <div class="div-img"><img src="${fotoUrl}" alt="${producto.NOMBRE}" class="product-img"/></div>
        <div class="product-name">${producto.NOMBRE}</div>
        <div class="product-price">$${producto.PRECIO}</div>
      `;

      button.addEventListener('click', () => {
        addToOrder({
          ID_PRODUCTO: producto.ID_PRODUCTO,
          NOMBRE: producto.NOMBRE,
          PRECIO: producto.PRECIO,
          FOTO: fotoUrl // URL completa
        });

      });

      gallery.appendChild(button);
    });
  } catch (err) {
    console.error("Error cargando productos:", err);
  }
}

// Ejecutar al cargar la página
document.addEventListener("DOMContentLoaded", cargarProductos);


// Función para agregar al carrito
function addToOrder(producto) {
  const id = producto.ID_PRODUCTO;

  if (cart[id]) {
    cart[id].quantity += 1;
  } else {
    cart[id] = {
      nombre: producto.NOMBRE,
      price: parseFloat(producto.PRECIO),
      img: producto.FOTO,
      quantity: 1
    };
  }
  updateOrderDisplay();
}

// Función para actualizar el resumen de orden
function updateOrderDisplay() {
  orderItems.innerHTML = '';
  total = 0;

  Object.keys(cart).forEach(id => {
    const item = cart[id];
    total += item.price * item.quantity;

    const orderItem = document.createElement('div');
    orderItem.className = 'order-item';

    orderItem.innerHTML = `
      <img src="${item.img}" alt="${item.nombre}" />
      <div class="order-info">
        <div class="name">${item.nombre}</div>
        <div class="price">$${(item.price * item.quantity).toFixed(2)}</div>
      </div>
      <div class="order-controls">
        <button class="btn-dec">−</button>
        <span>${item.quantity}</span>
        <button class="btn-inc">+</button>
      </div>
    `;

    // Listeners para + y −
    orderItem.querySelector('.btn-inc').addEventListener('click', () => {
      increaseQuantity(id);
    });
    orderItem.querySelector('.btn-dec').addEventListener('click', () => {
      decreaseQuantity(id);
    });

    orderItems.appendChild(orderItem);
  });

  orderTotal.textContent = `${total.toFixed(2)}`;
  localStorage.setItem('cart', JSON.stringify(cart));
}



// Funciones para modificar cantidad
function increaseQuantity(id) {
  if (cart[id]) {
    cart[id].quantity += 1;
    updateOrderDisplay();
  }
}

function decreaseQuantity(id) {
  if (cart[id]) {
    cart[id].quantity -= 1;
    if (cart[id].quantity <= 0) {
      delete cart[id];
    }
    updateOrderDisplay();
  }
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
