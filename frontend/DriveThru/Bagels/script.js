import { obtenerProductosPorCategoria } from "../../services/productos.js";
import { registrarOrden } from "../../services/orden.js";
/*
const data = [
  { id: "1", img: "../img/Bagels/bacon bagel.png", nombre: "Bacon Bagel", precio: "$7.00" },
  { id: "2", img: "../img/Bagels/salmon bagel.png", nombre: "Salmon Bagel", precio: "$10.00" },
  { id: "3", img: "../img/Bagels/morning bagel.png", nombre: "Morning Bagel", precio: "$6.00" },
  { id: "4", img: "../img/Bagels/bigol bagel.png", nombre: "Bigol Bagel", precio: "$10.00" },
  { id: "5", img: "../img/Bagels/odi bagel.png", nombre: "Odi Bagel", precio: "$7.00" },
  { id: "6", img: "../img/Bagels/xolo bagel.png", nombre: "Xolo Bagel", precio: "$10.00" }
];
*/ 
const gallery = document.querySelector('.product-gallery');
const orderItems = document.getElementById('order-items');
const orderTotal = document.getElementById('order-total');

let cart = JSON.parse(localStorage.getItem('cart')) || {};
let total = 0;

// Ruta base para las fotos
const rutaFotos = "http://localhost:4000/uploads/1";

updateOrderDisplay();


// función para cargar productos desde la BD
async function cargarProductos() {
  try {
    // Trae productos de la categoría 1 (Bagels)
    const productos = await obtenerProductosPorCategoria(1);

    gallery.innerHTML = ""; // limpia la galería

    const rutaFotos = "http://localhost:4000/uploads/";
    productos.forEach(producto => {
      const button = document.createElement('button');
      button.className = 'product-card';
      button.setAttribute('data-name', producto.NOMBRE);
      button.setAttribute('data-price', producto.PRECIO);
      button.setAttribute('data-img', producto.FOTO); // aquí debe venir la URL de la imagen

      button.innerHTML = `
        <div class="div-img"><img src="${rutaFotos + producto.FOTO}" alt="${producto.NOMBRE}" class='product-img'/></div>
        <div class="product-name">${producto.NOMBRE}</div>
        <div class="product-price">$${producto.PRECIO}</div>
      `;

      button.addEventListener('click', () => {
        addToOrder(producto);
      });

      gallery.appendChild(button);
    });
  } catch (err) {
    console.error("Error cargando productos:", err);
  }
}

// Ejecutar al cargar la página
document.addEventListener("DOMContentLoaded", cargarProductos);

/*
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
*/

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

/*
// Función para agregar al carrito
function addToOrder(name, price, img) {
  if (cart[name]) {
    cart[name].quantity += 1;
  } else {
    cart[name] = { price, quantity: 1, img };
  }
  updateOrderDisplay();
}*/

// Función para actualizar el resumen de orden
function updateOrderDisplay() {
  orderItems.innerHTML = '';
  total = 0;

  for (const id in cart) {
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
        <button onclick="decreaseQuantity('${id}')">−</button>
        <span>${item.quantity}</span>
        <button onclick="increaseQuantity('${id}')">+</button>
      </div>
    `;

    orderItems.appendChild(orderItem);
  }

  orderTotal.textContent = `${total.toFixed(2)}`;
  localStorage.setItem('cart', JSON.stringify(cart));
}


/*
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
  */


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


function buildOrderData() {
  const usuarioId = localStorage.getItem("usuarioId");
  if (!usuarioId) throw new Error("Sin usuarioId en localStorage");

  const fecha = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  const detalles = Object.keys(cart).map(id => {
    const item = cart[id];
    return {
      ID_PRODUCTO: parseInt(id),
      PRECIO_UNITARIO: item.price,
      CANTIDAD: item.quantity,
      SUBTOTAL: item.price * item.quantity
    };
  });

  if (detalles.length === 0) throw new Error("El carrito está vacío");

  return {
    ID_USUARIO: parseInt(usuarioId),
    FECHA: fecha,
    TOTAL: total,            
    ESTADO: "activa",        
    ID_RECOMPENSA: null,     
    detalles
  };
}

// Navegación entre categorías
document.querySelector('.backButton').addEventListener('click', () => {
  window.location.href = '../Categorias/index.html';
});

document.querySelector('.drinksButton').addEventListener('click', () => {
  window.location.href = '../Drinks/index.html';
});

document.querySelector('.snacksButton').addEventListener('click', () => {
  window.location.href = '../Snacks/index.html';
});

// Borrar carrito al hacer clic en ORDER
document.querySelector('.order-button').addEventListener('click', async () => {
  try {
    const ordenData = buildOrderData();
    const result = await registrarOrden(ordenData);
    console.log("Orden registrada:", result);

    // Limpia solo después de registrar con éxito
    cart = {};
    localStorage.removeItem('cart');
    updateOrderDisplay();

    // window.location.href = '../Ready/index.html';
  } catch (err) {
    console.error("Error registrando la orden:", err);
    alert("Hubo un problema al registrar tu orden.");
  }
});