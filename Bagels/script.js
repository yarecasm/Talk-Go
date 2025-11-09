const orderItems = document.getElementById('order-items');
const orderTotal = document.getElementById('order-total');
let total = 0;
const cart = {};

function addToOrder(name, price, img) {
  if (cart[name]) {
    cart[name].quantity += 1;
  } else {
    cart[name] = { price, quantity: 1, img };
  }
  updateOrderDisplay();
}

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
        <div class="price">$${item.price.toFixed(2)}</div>
      </div>
      <div class="order-controls">
        <button onclick="decreaseQuantity('${name}')">−</button>
        <span>${item.quantity}</span>
        <button onclick="increaseQuantity('${name}')">+</button>
      </div>
    `;

    orderItems.appendChild(orderItem);
  }

  orderTotal.textContent = total.toFixed(2);
}

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

// Activar los botones de producto
document.querySelectorAll('.product-card').forEach(button => {
  button.addEventListener('click', () => {
    const name = button.getAttribute('data-name');
    const price = parseFloat(button.getAttribute('data-price'));
    const img = button.getAttribute('data-img');
    addToOrder(name, price, img);
  });
});