function EditRewardsWindow() {
    location.assign('../EditRewards/index.html');
}

function InventoryWindow() {
    location.assign('../Inventory/index.html');
}

// Cargar productos desde la base de datos
async function loadProducts() {
    try {
        const response = await fetch('http://localhost:4000/api/productos');
        const products = await response.json();
        
        const grid = document.getElementById('productsGrid');
        grid.innerHTML = '';
        
        products.forEach((product) => {
            const price = product.precio ? `$${parseFloat(product.precio).toFixed(2)}` : '$0.00';
            const imagePath = product.FOTO ? `http://localhost:4000/uploads/${product.FOTO}` : 'img/default-bagel.png';
            
            grid.innerHTML += `
                <div class="product-card">
                    <img src="${imagePath}" alt="${product.nombre}" class="product-image" onerror="this.style.background='#e2ddd2'">
                    <div class="product-info">
                        <span class="product-label">Name</span>
                        <div class="product-name">${product.nombre}</div>
                        <span class="product-label">Description</span>
                        <div class="product-description">${product.descripcion}</div>
                        <span class="product-label">Price</span>
                        <div class="product-price">${price}</div>
                    </div>
                    <div class="product-actions">
                        <button class="action-btn" title="View">
                            <img src="img/eye.svg" alt="View">
                        </button>
                        <button class="action-btn" title="Edit">
                            <img src="img/edit.svg" alt="Edit">
                        </button>
                        <button class="action-btn" title="Delete" onclick="deleteProduct(${product.ID_PRODUCTO})">
                            <img src="img/trash.svg" alt="Delete">
                        </button>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        console.error('Error loading products:', error);
    }
}


// Para agregar la tarjeta al hacer click en "Add bagel"
function addNewProduct() {

    const grid = document.getElementById('productsGrid');
    const newCard = document.createElement('div');
    newCard.className = 'product-card editable';
    newCard.innerHTML = `
        <div class="upload-image-box" onclick="document.getElementById('imageUpload').click()">
            <span class="upload-placeholder"><img src="../img/upload-image.svg" alt="Subir imagen" width="40" height="40"></span>
            <input type="file" id="imageUpload" accept="image/*" onchange="previewImage(event)">
            <img class="preview" id="imagePreview" style="display: none;">
        </div>
        <div class="product-info">
            <span class="product-label">Name</span>
            <input type="text" class="editable-name" placeholder="Bagel name" id="newName">
            <span class="product-label">Description</span>
            <textarea class="editable-description" placeholder="Description" id="newDescription"></textarea>
            <span class="product-label">Price</span>
            <input type="text" class="editable-price" placeholder="$0.00" id="newPrice">
        </div>
        <div class="product-actions">
            <button class="save-product-btn" onclick="saveNewProduct()" title="Save">
                ↑
            </button>
            <button class="cancel-product-btn" onclick="cancelNewProduct()" title="Cancel">
                ×
            </button>
        </div>
    `;
    // Insertar al principio o al final según prefieras
    if (grid.firstChild) {
        grid.insertBefore(newCard, grid.firstChild);
    } else {
        grid.appendChild(newCard);
    }

    // Formatear cuando el usuario salga del campo
    const priceInput = document.getElementById('newPrice');
    priceInput.addEventListener('blur', function(e) {
        let value = e.target.value.replace(/[^0-9.]/g, '');
        
        if (value) {
            // Convertir a número y formatear con 2 decimales
            const number = parseFloat(value);
            if (!isNaN(number)) {
                e.target.value = '$' + number.toFixed(2);
            }
        }
    });

}

// Preview de la imagen
function previewImage(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('imagePreview');
            const placeholder = document.querySelector('.upload-placeholder');
            preview.src = e.target.result;
            preview.style.display = 'block';
            placeholder.style.display = 'none';
        }
        reader.readAsDataURL(file);
    }
}

// Cancelar y eliminar la tarjeta
function cancelNewProduct() {
    const editableCard = document.querySelector('.product-card.editable');
    if (editableCard) {
        editableCard.remove();
    }
}

// Función para guardar el nuevo producto
async function saveNewProduct() {
    const name = document.getElementById('newName').value;
    const description = document.getElementById('newDescription').value;
    const price = document.getElementById('newPrice').value;
    const imageFile = document.getElementById('imageUpload').files[0];
    const idCategoria = 1; // ID de la categoría "Bagels" - ajustar según la base de datos

    // Validar que todos los campos estén llenos
    if (!name || !description || !price) {
        alert('Please fill all fields');
        return;
    }

    if (!imageFile) {
        alert('Please upload an image');
        return;
    }

    // Crear FormData para enviar archivo
    const formData = new FormData();
    formData.append('nombre', name);
    formData.append('descripcion', description);
    formData.append('id_categoria', idCategoria);
    formData.append('precio', price.replace(/[^0-9.]/g, '')); // 👈 Limpia el $
    formData.append('foto', imageFile);

    try {
        const response = await fetch('http://localhost:4000/api/productos', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            alert('Product saved successfully!');
            
            // Eliminar la tarjeta editable
            cancelNewProduct();
            await loadProducts(); //recarga productos 

        } else {
            console.error('Error completo:', data);
            alert('Error saving product: ' + JSON.stringify(data.error || data));
        }
    } 
    
    // Cargar productos al inicio
        document.addEventListener('DOMContentLoaded', function() {
        loadProducts();
    });
}