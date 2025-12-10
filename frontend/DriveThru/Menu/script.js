import { obtenerProductosPorCategoria, } from "../../services/productos.js";
import { registrarOrden } from "../../services/orden.js";
import { obtenerCategorias } from "../../services/categorias.js";
import { obtenerProductoPorId } from "../../services/productos.js";

const gallery = document.querySelector('.product-gallery');
const orderItems = document.getElementById('order-items');
const orderTotal = document.getElementById('order-total');

let cart = JSON.parse(localStorage.getItem('cart')) || {};
let total = 0;

updateOrderDisplay();

window.back = function () {
  const confirmar = confirm("Se cancelará toda tu orden. ¿Deseas continuar?");

  if (confirmar) {
    localStorage.clear();
    window.location.href = "../Inicio/index.html"; // Ajusta la ruta
  }
};


// Ejecutar al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  cargarProductos();
  addReward();
});


// Función para agregar al carrito
function addToOrder(producto, categoryId) {
  const id = producto.ID_PRODUCTO;
  const rutaFotos = `../../UPLOADS/categorias/${categoryId}/`;
  producto.FOTO = rutaFotos + producto.FOTO;

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

async function addReward() {
  const reward = JSON.parse(localStorage.getItem("reward"));
  if (reward.TIPO != "porcentaje") {

    const productoReward = await obtenerProductoPorId(parseInt(reward.ID_PRODUCTO_ASOCIADO));
    console.log(productoReward);


    const id = productoReward.ID_PRODUCTO;
    const rutaFotos = `../../UPLOADS/categorias/${productoReward.ID_CATEGORIA}/`;
    productoReward.FOTO = rutaFotos + productoReward.FOTO;

    if (reward.TIPO == "gratis") {
      if (cart[id]) {
        cart[id].quantity += 1;
      } else {
        cart[id] = {
          nombre: productoReward.NOMBRE,
          price: 0,
          img: productoReward.FOTO,
          quantity: 1
        };
      }
      updateOrderDisplay();
    }

  // 2x1
  if (reward.TIPO === "2x1") {
    const pagados = 1;
    const gratis = 1;

    // Agregar pagado
    if (cart[id]) {
      cart[id].quantity += pagados;
    } else {
      cart[id] = {
        nombre: productoReward.NOMBRE,
        price: parseFloat(productoReward.PRECIO),
        img: productoReward.FOTO,
        quantity: pagados
      };
    }

    // Agregar gratis
    cart[id + "_free"] = {
      nombre: productoReward.NOMBRE + " (Gratis)",
      price: 0,
      img: productoReward.FOTO,
      quantity: gratis
    };

    updateOrderDisplay();
    return;
  }

  // 3x2
  if (reward.TIPO === "3x2") {
    const pagados = 2;
    const gratis = 1;

    // Agregar pagados
    if (cart[id]) {
      cart[id].quantity += pagados;
    } else {
      cart[id] = {
        nombre: productoReward.NOMBRE,
        price: parseFloat(productoReward.PRECIO),
        img: productoReward.FOTO,
        quantity: pagados
      };
    }

    // Agregar gratis
    cart[id + "_free"] = {
      nombre: productoReward.NOMBRE + " (Gratis)",
      price: 0,
      img: productoReward.FOTO,
      quantity: gratis
    };

    updateOrderDisplay();
    return;
  }
}

  
}

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

// Borrar carrito al hacer clic en ORDER
document.querySelector('.order-button').addEventListener('click', async () => {
  try {
    const ordenData = buildOrderData();
    const result = await registrarOrden(ordenData);
    console.log("Orden registrada:", result);

    // Limpia solo después de registrar con éxito
    cart = {};
    localStorage.removeItem('cart');
    localStorage.clear();
    updateOrderDisplay();

    window.location.href = '../Ready/index.html';
  } catch (err) {
    console.error("Error registrando la orden:", err);
    alert("Hubo un problema al registrar tu orden.");
  }
});

window.increaseQuantity = increaseQuantity;
window.decreaseQuantity = decreaseQuantity;

async function cargarCategorias() {
  const contenedor = document.getElementById("category-nav");
  contenedor.innerHTML = ""; // Limpia por si acaso

  const categorias = await obtenerCategorias();

  categorias.forEach(cat => {
    const btn = document.createElement("button");

    btn.classList.add("category-button");
    btn.textContent = cat.NOMBRE;
    btn.id = "cat-" + cat.ID_CATEGORIA;

    if (cat.ID_CATEGORIA == localStorage.getItem("categoriaSeleccionada")) {
      btn.classList.add("active");
    }

    // >>> Cuando le dan click guardar ID y redirigir
    btn.onclick = () => {
      localStorage.setItem("categoriaSeleccionada", cat.ID_CATEGORIA);

      // activar botón visualmente
      document.querySelectorAll(".category-button").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      // >>> cargar productos de esa categoría
      cargarProductos();
    };

    contenedor.appendChild(btn);
  });
}

// función para cargar productos desde la BD
async function cargarProductos() {
  try {
    let categoryId = localStorage.getItem("categoriaSeleccionada");
    const productos = await obtenerProductosPorCategoria(categoryId);

    gallery.innerHTML = ""; // limpia la galería

    const rutaFotos = `../../UPLOADS/categorias/${categoryId}/`;
    productos.forEach(producto => {
      const button = document.createElement('button');
      button.className = 'product-card';
      button.setAttribute('data-name', producto.NOMBRE);
      button.setAttribute('data-price', producto.PRECIO);
      button.setAttribute('data-img', producto.FOTO); // aquí debe venir la URL de la imagen
      button.id = producto.ID_PRODUCTO;

      button.innerHTML = `
        <div class="div-img"><img src="${rutaFotos + producto.FOTO}" alt="${producto.NOMBRE}" class='product-img'/></div>
        <div class="product-name">${producto.NOMBRE}</div>
        <div class="product-price">$${producto.PRECIO}</div>
      `;

      button.addEventListener('click', () => {
        addToOrder(producto, categoryId);
      });

      gallery.appendChild(button);
    });
  } catch (err) {
    console.error("Error cargando productos:", err);
  }
}

cargarCategorias();

// VOICE FUNCTIONS
window.addEventListener("message", (event) => {
  if (event.data.type !== "VOICE_ACTION") return;
  switch (event.data.action) {

    // -- Cargar prodcutos de la categoría seleccionada --
    case "OPEN_CATEGORY":

      console.log(event.data);
      localStorage.setItem("categoriaSeleccionada", event.data.id);
      document.querySelectorAll(".category-button").forEach(b => b.classList.remove("active"));

      const btn = document.getElementById(`cat-${event.data.id}`);
      if (btn) {
        btn.classList.add("active");
      } else {
        console.warn(`No se encontró el botón de categoría cat-${event.data.id}. ¿Se llamó cargarCategorias()?`);
      }

      cargarProductos();
      break;

    // -- Agregar producto --  
    case "ADDED_PRODUCT":
      const btnProduct = document.getElementById(event.data.id);
      if (btnProduct) {
        btnProduct.click();
      } else {
        console.error("Producto no encontrado:", event.data.id);
      }
      break;

    // -- Borrar producto --  
    case "DELETE_PRODUCT":
      decreaseQuantity(event.data.id);
      console.log("Eliminando producto con id ", event.data.id, "...");
      break;

    case "CANCEL_ALL":
      window.location.href = '../Inicio/index.html';
      localStorage.clear();
      break;

    case "FINISH_ORDER":
      const btnOrdenar = document.querySelector('.order-button');
      btnOrdenar.click();

      setTimeout(() => {
        localStorage.clear();
        window.location.href = "../Inicio/index.html";
      }, 5000);
      break;

    default:
      break;
  }
  return;
});