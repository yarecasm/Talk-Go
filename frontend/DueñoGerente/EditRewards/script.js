function EditRewardsWindow() {
    location.assign('../EditRewards/index.html');
}

function InventoryWindow() {
    location.assign('../Inventory/index.html');
}

// URL base de tu API (ajusta según tu configuración)
const API_URL = 'http://localhost:4000/api/recompensas'; // Cambia el puerto si es necesario
const PRODUCTOS_URL = 'http://localhost:4000/api/productos'; // URL para productos

// Función para cargar productos en el select
async function cargarProductos() {
    try {
        const response = await fetch(PRODUCTOS_URL);
        const productos = await response.json();
        
        // Seleccionar específicamente el select de "Associated product"
        const selects = document.querySelectorAll('select.form-select');
        const productoSelect = selects[1]; // El segundo select es "Associated product"
        
        // Limpiar opciones existentes (excepto la primera)
        productoSelect.innerHTML = '<option value="">Select</option>';
        
        // Agregar productos
        productos.forEach(producto => {
            const option = document.createElement('option');
            option.value = producto.id || producto.ID_PRODUCTO; // Ajusta según el nombre de tu campo ID
            option.textContent = producto.nombre || producto.NOMBRE; // Ajusta según el nombre de tu campo
            productoSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar productos:', error);
    }
}

// Función para cargar las recompensas desde el backend
async function cargarRecompensas() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        
        if (data.rewards) {
            mostrarRecompensas(data.rewards);
        }
    } catch (error) {
        console.error('Error al cargar recompensas:', error);
        alert('Error al cargar las recompensas');
    }
}

// Función para mostrar las recompensas en el DOM
function mostrarRecompensas(rewards) {
    const rewardsGrid = document.querySelector('.rewards-grid');
    
    // Limpiar tarjetas existentes (excepto el botón de agregar)
    const existingCards = rewardsGrid.querySelectorAll('.reward-card');
    existingCards.forEach(card => card.remove());
    
    // Crear tarjetas para cada recompensa
    rewards.forEach(reward => {
        const card = crearTarjetaRecompensa(reward);
        // Insertar antes del botón de agregar
        const addButton = rewardsGrid.querySelector('.add-reward-card');
        rewardsGrid.insertBefore(card, addButton);
    });
}

// Función para crear una tarjeta de recompensa
function crearTarjetaRecompensa(reward) {
    const card = document.createElement('div');
    card.className = 'reward-card';
    card.dataset.rewardId = reward.ID_RECOMPENSA;
    console.log('Creando tarjeta para:', reward); // Debug: ver estructura de datos
    let mainText = '';
    switch(reward.TIPO) {
        case '2x1':
        case '3x2':
            mainText = `${reward.TIPO.toUpperCase()}<br><span style="font-size: 30px;">${reward.NOMBRE}</span>`;
            break;
        case 'gratis':
            mainText = `FREE<br><span style="font-size: 30px;">${reward.NOMBRE}</span>`;
            break;
        case 'porcentaje':
            mainText = `${reward.VALOR_DESCUENTO}%<br><span style="font-size: 30px;">Discount</span>`;
            break;
        default:
            mainText = `<span style="font-size: 30px;">${reward.NOMBRE}</span>`;
    }
    
    card.innerHTML = `
        <button class="edit-btn" onclick="editarRecompensa(${reward.ID_RECOMPENSA})">
            <img src="../img/edit.svg" alt="Edit">
        </button>
        <div class="reward-main-text">${mainText}</div>
        ${reward.DESCRIPCION ? `<div class="reward-description">${reward.DESCRIPCION}</div>` : ''}
    `;
    
    return card;
}

// Función para abrir el modal
function openModal() {
    document.getElementById('newValeModal').classList.add('active');
    document.querySelector('.modal-title').textContent = 'New vale'; // Asegurar que diga "New vale"
    document.querySelector('form').reset();
    document.querySelector('form').dataset.editId = '';

    // Ocultar botón de eliminar
    document.getElementById('deleteButton').style.display = 'none';
    
    // Resetear el switch a activo por defecto
    const estadoCheckbox = document.getElementById('estadoReward');
    const estadoLabel = document.getElementById('estadoLabel');
    estadoCheckbox.checked = true;
    estadoLabel.textContent = 'Active';
    estadoLabel.style.color = '#4CAF50';
    
    // Mostrar el campo de producto asociado
    const productoGroup = document.querySelectorAll('.form-group')[4];
    productoGroup.style.display = 'block';
    
    // Cargar productos cada vez que se abre el modal
    cargarProductos();
}

// Función para cerrar el modal
function closeModal() {
    document.getElementById('newValeModal').classList.remove('active');
    document.querySelector('form').reset();
    document.querySelector('form').dataset.editId = '';
}

// Función para editar una recompensa
async function editarRecompensa(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        const reward = await response.json();
        
        console.log('Recompensa a editar:', reward); // Debug
        
        // Abrir modal primero
        document.getElementById('newValeModal').classList.add('active');
        
        // Cargar productos
        await cargarProductos();
        
        // Cambiar título del modal
        document.querySelector('.modal-title').textContent = 'Modify vale';
        
        // Llenar el formulario con los datos
        document.querySelector('input[placeholder="Name of the vale"]').value = reward.NOMBRE || '';
        document.querySelector('textarea[placeholder="Full description of the vale"]').value = reward.DESCRIPCION || '';
        
        // Seleccionar tipo (primer select)
        const selects = document.querySelectorAll('select.form-select');
        const tipoSelect = selects[0];
        
        if (reward.TIPO === 'gratis') {
            tipoSelect.value = 'FREE';
        } else if (reward.TIPO === 'porcentaje') {
            tipoSelect.value = 'Discount';
        } else if (reward.TIPO === '2x1') {
            tipoSelect.value = '2X1';
        } else if (reward.TIPO === '3x2') {
            tipoSelect.value = '3X2';
        }
        
        // Mostrar/ocultar producto asociado según el tipo
        const productoGroup = document.querySelectorAll('.form-group')[4];
        if (tipoSelect.value === 'Discount') {
            productoGroup.style.display = 'none';
        } else {
            productoGroup.style.display = 'block';
        }
        
        document.querySelector('input[type="number"]').value = reward.PUNTOS || 0;
        
        // Seleccionar producto asociado si existe (segundo select)
        if (reward.ID_PRODUCTO_ASOCIADO) {
            const productoSelect = selects[1];
            productoSelect.value = reward.ID_PRODUCTO_ASOCIADO;
        }
        
        // Establecer el estado del switch
        const estadoCheckbox = document.getElementById('estadoReward');
        const estadoLabel = document.getElementById('estadoLabel');
        estadoCheckbox.checked = reward.ESTADO === 1;
        estadoLabel.textContent = reward.ESTADO === 1 ? 'Active' : 'Inactive';
        estadoLabel.style.color = reward.ESTADO === 1 ? '#4CAF50' : '#999';
        
        // Guardar el ID para actualización
        document.querySelector('form').dataset.editId = id;
        
    } catch (error) {
        console.error('Error al cargar recompensa:', error);
        alert('Error al cargar la recompensa');
    }
}

// Función para eliminar una recompensa
async function eliminarRecompensa() {
    const editId = document.querySelector('form').dataset.editId;
    
    if (!editId) {
        alert('No hay ninguna recompensa seleccionada para eliminar');
        return;
    }
    
    // Confirmar eliminación
    if (!confirm('¿Estás seguro de que deseas eliminar esta recompensa? Esta acción no se puede deshacer.')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/${editId}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (response.ok) {
            alert('Recompensa eliminada correctamente');
            closeModal();
            cargarRecompensas(); // Recargar la lista
        } else {
            alert('Error al eliminar: ' + result.error);
            console.error('Error completo:', result);
        }
    } catch (error) {
        console.error('Error al eliminar:', error);
        alert('Error al eliminar la recompensa');
    }
}

// Función para guardar recompensa (crear o actualizar)
async function guardarRecompensa(event) {
    event.preventDefault();
    
    const form = event.target;
    const editId = form.dataset.editId;
    
    const selects = form.querySelectorAll('select.form-select');
    const tipoSelect = selects[0].value; // Primer select: Type of reward
    const productoSelect = selects[1].value; // Segundo select: Associated product
    
    let tipo;
    switch(tipoSelect) {
        case 'FREE':
            tipo = 'gratis';
            break;
        case 'Discount':
            tipo = 'porcentaje';
            break;
        case '2X1':
            tipo = '2x1';
            break;
        case '3X2':
            tipo = '3x2';
            break;
        default:
            tipo = tipoSelect.toLowerCase();
    }
    
    const data = {
        NOMBRE: form.querySelector('input[placeholder="Name of the vale"]').value,
        DESCRIPCION: form.querySelector('textarea').value,
        TIPO: tipo,
        PUNTOS: parseInt(form.querySelector('input[type="number"]').value) || 0,
        VALOR_DESCUENTO: tipo === 'porcentaje' ? 50 : 1, // Ajusta según necesites
        ID_PRODUCTO_ASOCIADO: productoSelect || null,
        ESTADO: document.getElementById('estadoReward').checked ? 1 : 0
    };

    // Debug: ver qué datos se están enviando
    console.log('Datos a enviar:', data);
    
    try {
        const url = editId ? `${API_URL}/${editId}` : API_URL;
        const method = editId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            alert(editId ? 'Recompensa actualizada' : 'Recompensa creada');
            closeModal();
            cargarRecompensas(); // Recargar la lista
        } else {
            alert('Error: ' + result.error);
            console.error('Error completo:', result); // Ver error en consola
        }
    } catch (error) {
        console.error('Error al guardar:', error);
        alert('Error al guardar la recompensa');
    }
}

// Inicializar cuando carga la página
document.addEventListener('DOMContentLoaded', function() {
    // Cargar recompensas y productos
    cargarRecompensas();
    cargarProductos();
    
    // Agregar event listener al formulario
    document.querySelector('form').addEventListener('submit', guardarRecompensa);
    
    // Event listener para el switch de estado
    const estadoCheckbox = document.getElementById('estadoReward');
    const estadoLabel = document.getElementById('estadoLabel');
    
    estadoCheckbox.addEventListener('change', function() {
        if (this.checked) {
            estadoLabel.textContent = 'Active';
            estadoLabel.style.color = '#4CAF50';
        } else {
            estadoLabel.textContent = 'Inactive';
            estadoLabel.style.color = '#999';
        }
    });

    // Event listener para mostrar/ocultar producto asociado según el tipo
    const tipoSelect = document.querySelectorAll('select.form-select')[0];
    const productoGroup = document.querySelectorAll('.form-group')[4]; // El grupo del producto asociado
    
    tipoSelect.addEventListener('change', function() {
        // Ocultar producto asociado si es Discount
        if (this.value === 'Discount') {
            productoGroup.style.display = 'none';
        } else {
            productoGroup.style.display = 'block';
        }
    });
    
    // Close modal when clicking outside
    document.getElementById('newValeModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal();
        }
    });
});