function EditRewardsWindow() {
    location.assign('../EditRewards/index.html');
}

function InventoryWindow() {
    location.assign('../Inventory/index.html');
}

// Cargar productos desde la base de datos
async function loadProducts(idCategoria = 1) {
    try {
        const response = await fetch(`http://localhost:4000/api/productos/categoria/${idCategoria}`);
        const products = await response.json();
        
        const grid = document.getElementById('productsGrid');
        grid.innerHTML = '';
        
        // En tu función loadProducts, REEMPLAZA el forEach por este:
products.forEach((product) => {
    const price = product.PRECIO ? `$${parseFloat(product.PRECIO).toFixed(2)}` : '$0.00';
    const imagePath = product.FOTO ? `http://localhost:4000/uploads/categorias/${product.id_categoria}/${product.FOTO}` : '../img/default-bagel.png';
    // 👇 PRUEBA CON DIFERENTES NOMBRES DE COLUMNA
    const estado = product.estado || product.ESTADO || 1;
    const isHidden = estado === 0;
    
    console.log(`Producto ${product.ID_PRODUCTO} - estado:`, estado); // Para verificar
    
    grid.innerHTML += `
        <div class="product-card ${isHidden ? 'hidden-product' : ''}" data-product-id="${product.ID_PRODUCTO}"> 
            <img src="${imagePath}" alt="${product.NOMBRE}" class="product-image" onerror="this.style.background='#e2ddd2'">
            <div class="product-info">
                <span class="product-label">Name</span>
                <div class="product-name">${product.NOMBRE}</div>
                <span class="product-label">Description</span>
                <div class="product-description">${product.DESCRIPCION}</div>
                <span class="product-label">Price</span>
                <div class="product-price">${price}</div>
            </div>
            <div class="product-actions">
                <button class="action-btn" title="${isHidden ? 'Show' : 'Hide'}" onclick="toggleProductVisibility(${product.ID_PRODUCTO}, ${product.estado})">
                    <img src="../img/${isHidden ? 'eye-off' : 'eye'}.svg" alt="${isHidden ? 'Show' : 'Hide'}">
                </button>
                <button class="action-btn" title="Edit" onclick="editProduct(${product.ID_PRODUCTO})">
                    <img src="../img/edit.svg" alt="Edit">
                </button>
                <button class="action-btn" title="Delete" onclick="deleteProduct(${product.ID_PRODUCTO})">
                    <img src="../img/trash.svg" alt="Delete">
                </button>
            </div>
        </div>
    `;
});
    } catch (error) {
        console.error('Error loading products:', error);
    }
}


// Para agregar la tarjeta al hacer click en "Add new product"
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
            <input type="text" class="editable-name" placeholder="Product name" id="newName">
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
    const idCategoria = document.querySelector('.category-btn.active').dataset.category;

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
            
             // Obtener la categoría activa actual
             const currentCategory = document.querySelector('.category-btn.active').dataset.category;

            // Volver a cargar SOLO la categoría activa
            await loadProducts(currentCategory);

        } else {
            console.error('Error completo:', data);
            alert('Error saving product: ' + JSON.stringify(data.error || data));
        }
        } catch (error) {  // 👈 Agregué el catch que faltaba
        console.error('Error:', error);
        alert('Error connecting to server: ' + error.message);
    }
    } 
    
// Manejar clicks en las categorías
document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', function () {

        // Quitar el botón activo actual
        document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));

        // Activar el nuevo
        this.classList.add('active');

        // Obtener ID de categoría
        const idCategoria = this.dataset.category;

        // Cargar productos filtrados
        loadProducts(idCategoria);
    });
});


    // Cargar productos al inicio
        document.addEventListener('DOMContentLoaded', function() {
        loadProducts();
    });

    // ============================================
// TOGGLE VISIBILITY (Eye Button) - AGREGAR
// ============================================
async function toggleProductVisibility(productId, currentState) {
    try {
        const newState = currentState === 1 ? 0 : 1;
        
        // Obtener primero los datos del producto
        const getResponse = await fetch(`http://localhost:4000/api/productos/${productId}`);
        
        if (!getResponse.ok) {
            throw new Error('No se pudo obtener el producto');
        }
        
        const product = await getResponse.json();
        
        // 👇 VER TODOS LOS DATOS DEL PRODUCTO
        console.log('Producto completo:', product);
        console.log('Claves del producto:', Object.keys(product));
        
        // Intentar con diferentes posibles nombres de columna
        const idCategoria = product.id_categoria || product.ID_CATEGORIA || product.idCategoria;
        
        if (!idCategoria) {
            console.error('No se encontró id_categoria. Datos disponibles:', product);
            throw new Error('El producto no tiene id_categoria');
        }
        
        // Crear FormData con todos los datos
        const formData = new FormData();
        formData.append('nombre', product.NOMBRE || product.nombre);
        formData.append('descripcion', product.DESCRIPCION || product.descripcion);
        formData.append('id_categoria', idCategoria);
        formData.append('precio', product.PRECIO || product.precio);
        formData.append('estado', newState);
        
        const response = await fetch(`http://localhost:4000/api/productos/${productId}`, {
            method: 'PUT',
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            alert(newState === 0 ? 'Product hidden successfully' : 'Product shown successfully');
            const currentCategory = document.querySelector('.category-btn.active').dataset.category;
            await loadProducts(currentCategory);
        } else {
            alert('Error: ' + JSON.stringify(data));
        }
    } catch (error) {
        console.error('Error completo:', error);
        alert('Error: ' + error.message);
    }
}

// ============================================
// EDIT PRODUCT (Edit Button) - AGREGAR
// ============================================
async function editProduct(productId) {
    try {
        // Obtener datos del producto
        const response = await fetch(`http://localhost:4000/api/productos/${productId}`);
        const product = await response.json();

        // Encontrar la tarjeta del producto
        const card = document.querySelector(`[data-product-id="${productId}"]`);
        
        const imagePath = product.FOTO ? 
            `http://localhost:4000/uploads/categorias/${product.id_categoria}/${product.FOTO}` : 
            '../img/default-bagel.png';

        // Convertir a modo edición
        card.classList.add('editable');
        card.innerHTML = `
            <div class="upload-image-box" onclick="document.getElementById('imageUpload-${productId}').click()">
                <img class="preview" id="imagePreview-${productId}" src="${imagePath}" style="display: block;">
                <input type="file" id="imageUpload-${productId}" accept="image/*" onchange="previewImageEdit(event, ${productId})">
            </div>
            <div class="product-info">
                <span class="product-label">Name</span>
                <input type="text" class="editable-name" placeholder="Product name" id="editName-${productId}" value="${product.NOMBRE}">
                <span class="product-label">Description</span>
                <textarea class="editable-description" placeholder="Description" id="editDescription-${productId}">${product.DESCRIPCION}</textarea>
                <span class="product-label">Price</span>
                <input type="text" class="editable-price" placeholder="$0.00" id="editPrice-${productId}" value="$${parseFloat(product.PRECIO).toFixed(2)}">
            </div>
            <div class="product-actions">
                <button class="save-product-btn" onclick="saveEditedProduct(${productId})" title="Save">
                    ↑
                </button>
                <button class="cancel-product-btn" onclick="cancelEdit()" title="Cancel">
                    ×
                </button>
            </div>
        `;

        // Formatear precio al salir del campo
        const priceInput = document.getElementById(`editPrice-${productId}`);
        priceInput.addEventListener('blur', function(e) {
            let value = e.target.value.replace(/[^0-9.]/g, '');
            if (value) {
                const number = parseFloat(value);
                if (!isNaN(number)) {
                    e.target.value = '$' + number.toFixed(2);
                }
            }
        });

    } catch (error) {
        console.error('Error:', error);
        alert('Error loading product data');
    }
}

// Preview de imagen en modo edición - AGREGAR
function previewImageEdit(event, productId) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById(`imagePreview-${productId}`);
            preview.src = e.target.result;
            preview.style.display = 'block';
        }
        reader.readAsDataURL(file);
    }
}

// Guardar producto editado - AGREGAR
async function saveEditedProduct(productId) {
    const name = document.getElementById(`editName-${productId}`).value;
    const description = document.getElementById(`editDescription-${productId}`).value;
    const price = document.getElementById(`editPrice-${productId}`).value;
    const imageFile = document.getElementById(`imageUpload-${productId}`).files[0];
    const idCategoria = document.querySelector('.category-btn.active').dataset.category;

    if (!name || !description || !price) {
        alert('Please fill all fields');
        return;
    }

    const formData = new FormData();
    formData.append('nombre', name);
    formData.append('descripcion', description);
    formData.append('id_categoria', idCategoria);
    formData.append('precio', price.replace(/[^0-9.]/g, ''));
    formData.append('estado', 1);
    
    if (imageFile) {
        formData.append('foto', imageFile);
    }

    try {
        const response = await fetch(`http://localhost:4000/api/productos/${productId}`, {
            method: 'PUT',
            body: formData
        });

        if (response.ok) {
            alert('Product updated successfully!');
            const currentCategory = document.querySelector('.category-btn.active').dataset.category;
            await loadProducts(currentCategory);
        } else {
            alert('Error updating product');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error connecting to server');
    }
}

// Cancelar edición - AGREGAR
function cancelEdit() {
    const currentCategory = document.querySelector('.category-btn.active').dataset.category;
    loadProducts(currentCategory);
}

async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
        return;
    }

    try {
        const response = await fetch(`http://localhost:4000/api/productos/${productId}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (response.ok) {
            alert('Product deleted successfully');
            const currentCategory = document.querySelector('.category-btn.active').dataset.category;
            await loadProducts(currentCategory);
        } else {
            console.error('Error:', data);
            alert('Error deleting product: ' + (data.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error connecting to server: ' + error.message);
    }
}