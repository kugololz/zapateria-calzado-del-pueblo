document.addEventListener('DOMContentLoaded', function () {
    let carrito = [];
    let productoSeleccionado = null;

    // Datos de ejemplo
    /*const LISTA_PRODUCTOS = [
        { id: 1, name: 'Urban Classic Black', price: 89.99, image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=764&q=80', description: 'Zapatillas urbanas clásicas en color negro, perfectas para el día a día.', sizes: [7,8,9,10,11,12] },
        { id: 2, name: 'Sport White', price: 94.99, image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=812&q=80', description: 'Zapatillas deportivas en blanco.', sizes: [6,7,8,9,10,11] },
        { id: 3, name: 'Black Pro', price: 99.99, image: 'https://images.unsplash.com/photo-1605030753481-bb38b08c384a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=749&q=80', description: 'Edición profesional en negro con refuerzos estratégicos.', sizes: [8,9,10,11,12,13] },
        { id: 4, name: 'Red Street', price: 87.99, image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80', description: 'Zapatillas urbanas en rojo vibrante para destacar tu estilo.', sizes: [7,8,9,10,11] }
        ];*/
    // Initialize as empty, will be filled by fetch
    let LISTA_PRODUCTOS = [];
    
    
    
    const LISTA_SERVICIOS = [
        { servicio: 'Cambio de suela', descripcion: 'Reemplazo completo de la suela desgastada', precio: 25.00 },
        { servicio: 'Reparación de costuras', descripcion: 'Arreglo de costuras rotas o desgastadas', precio: 15.00 },
        { servicio: 'Reemplazo de cordones', descripcion: 'Cambio de cordones por unos nuevos', precio: 8.00 },
        { servicio: 'Limpieza profunda', descripcion: 'Limpieza completa y restauración de color', precio: 12.00 },
        { servicio: 'Reparación de cremallera', descripcion: 'Arreglo o reemplazo de cremallera dañada', precio: 18.00 },
        { servicio: 'Refuerzo de talón', descripcion: 'Refuerzo interno para mayor durabilidad', precio: 10.00 }
    ];

    const CLAVE_USUARIOS = 'mz_users_v1';
    const CLAVE_CARRITO_BASE = 'mz_cart_v1';
    const CLAVE_USUARIO_ACTUAL = 'mz_current_user_v1';

    inicializarApp();

    function inicializarApp() {
        // 1. Call the new PHP API
        fetch('get_products.php')
            .then(response => response.json())
            .then(data => {
                // 2. Save the DB data into our list
                LISTA_PRODUCTOS = data;
                
                // 3. Render the UI with the new data
                renderizarListaProductos();
                
                // Check URL for search params (optional)
                const params = new URLSearchParams(window.location.search);
                if (params.has('search')) {
                    buscarProductos(params.get('search'));
                }
            })
            .catch(error => {
                console.error('Error cargando productos:', error);
                document.querySelector('.products-grid').innerHTML = '<p>Error conectando a la base de datos.</p>';
            });

        renderizarListaServicios();
        vincularListeners();
        cargarCarritoDesdeStorage();
        actualizarDetallesPago();
        actualizarCotizacionReparacion();
        // Google Auth Logic REMOVED
    }

    // ---------- Productos y búsqueda ----------
    function renderizarListaProductos() {
        const grid = document.querySelector('.products-grid');
        if (!grid) return;
        grid.innerHTML = '';

        LISTA_PRODUCTOS.forEach(p => {
            const card = document.createElement('div');
            card.className = 'product-card';

            const sinStock = (typeof p.stock !== 'undefined' && p.stock <= 0);

            card.innerHTML = `
                <div class="product-img">
                    <img src="${p.image}" alt="${p.name}">
                    ${sinStock ? '<span class="stock-badge out-of-stock">Sin stock</span>' : ''}
                </div>
                <div class="product-info">
                    <h3 class="product-title">${p.name}</h3>
                    <p class="product-price">$${p.price.toFixed(2)}</p>
                    ${
                        sinStock 
                        ? '<button class="btn" disabled style="opacity:0.6;cursor:not-allowed;">Sin stock</button>'
                        : `<a href="#" class="btn view-product" data-id="${p.id}">Ver Detalles</a>`
                    }
                </div>
            `;
            grid.appendChild(card);
        });
    }



    function buscarProductos(termino) {
        const q = (termino || '').trim().toLowerCase();
        const grid = document.querySelector('.products-grid');
        if (!grid) return;
        grid.innerHTML = '';
        if (!q) {
            renderizarListaProductos();
            return;
        }
        const resultados = LISTA_PRODUCTOS.filter(p =>
            (p.name && p.name.toLowerCase().includes(q)) ||
            (p.description && p.description.toLowerCase().includes(q))
        );
        if (resultados.length === 0) {
            grid.innerHTML = `<div class="no-results"><p>No se encontraron productos para "${escapeHtml(q)}".</p></div>`;
            mostrarPestaña('products');
            return;
        }
        resultados.forEach(p => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <div class="product-img"><img src="${p.image}" alt="${p.name}"></div>
                <div class="product-info">
                    <h3 class="product-title">${p.name}</h3>
                    <p class="product-price">$${p.price.toFixed(2)}</p>
                    <a href="#" class="btn view-product" data-id="${p.id}">Ver Detalles</a>
                </div>
            `;
            grid.appendChild(card);
        });
        mostrarPestaña('products');
    }

    // ---------- Servicios ----------
    function renderizarListaServicios() {
        const cont = document.getElementById('repair-services');
        if (!cont) return;
        cont.innerHTML = '';
        LISTA_SERVICIOS.forEach((s, i) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${s.servicio}</td>
                <td>${s.descripcion}</td>
                <td class="repair-price">$${s.precio.toFixed(2)}</td>
                <td>
                    <div class="repair-option">
                        <input 
                            type="checkbox" 
                            class="repair-checkbox"
                            data-index="${i}" 
                            data-service="${s.servicio}" 
                            data-price="${s.precio}">
                    </div>
                </td>
            `;

            cont.appendChild(row);
        });
    }

    // ---------- Eventos y delegación ----------
    function vincularListeners() {
        document.querySelectorAll('.nav-link').forEach(link =>
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const tab = this.getAttribute('data-tab');
                mostrarPestaña(tab);
            })
        );

        document.addEventListener('click', function(e) {
            if (e.target.classList && e.target.classList.contains('view-product')) {
                e.preventDefault();
                const id = parseInt(e.target.getAttribute('data-id'));
                mostrarDetalleProducto(id);
            }
        });

        document.addEventListener('click', function(e) {
            if (e.target.classList && e.target.classList.contains('size-option')) {
                document.querySelectorAll('.size-option').forEach(o => o.classList.remove('selected'));
                e.target.classList.add('selected');
            }
        });

        document.addEventListener('click', function(e) {
            if (e.target.classList && e.target.classList.contains('quantity-btn')) {
                const input = e.target.parentElement.querySelector('.quantity-input');
                if (!input) return;
                let v = parseInt(input.value) || 1;
                if (e.target.classList.contains('decrease')) {
                    if (v > 1) v--;
                } else if (e.target.classList.contains('increase')) {
                    v++;
                }
                input.value = v;
            }
        });

        document.addEventListener('click', function(e) {
            if (e.target.classList && e.target.classList.contains('add-to-cart-detail')) {
                e.preventDefault();
                agregarProductoAlCarritoDesdeDetalle();
            }
        });

        document.addEventListener('change', function(e) {
        if (e.target && e.target.name === 'payment-method') {
            actualizarDetallesPago();
        }
        });


        const btnCot = document.getElementById('request-quote');
        if (btnCot) btnCot.addEventListener('click', function(e) {
            e.preventDefault();
            enviarSolicitudCotizacion();
        });

        document.addEventListener('click', function(e) {
            if (!e.target.classList) return;
            if (e.target.closest('.remove-item')) { // Use closest to click icon or text
                const btn = e.target.closest('.remove-item');
                const idDetalle = btn.getAttribute('data-db-id');
                eliminarDelCarritoPorId(idDetalle);
            }
            if (e.target.classList.contains('cart-decrease')) {
                const id = e.target.getAttribute('data-cart-id');
                cambiarCantidadCarritoPorId(id, -1);
            }
            if (e.target.classList.contains('cart-increase')) {
                const id = e.target.getAttribute('data-cart-id');
                cambiarCantidadCarritoPorId(id, 1);
            }
        });

        document.addEventListener('input', function(e) {
            if (e.target.classList && e.target.classList.contains('cart-quantity-input')) {
                const id = e.target.getAttribute('data-cart-id');
                const val = Math.max(1, parseInt(e.target.value) || 1);
                establecerCantidadCarritoPorId(id, val);
            }
        });

const checkoutBtn = document.getElementById('checkout-btn');
if (checkoutBtn) checkoutBtn.addEventListener('click', function(e) {
    e.preventDefault();
    const usuario = obtenerUsuarioSesion();
    
    if (!usuario) {
        abrirModalAuth('login');
        return;
    }

    const metodoEl = document.querySelector('input[name="payment-method"]:checked');
    const metodoPago = metodoEl ? metodoEl.value : 'Tarjeta';

    if (!confirm(`¿Confirmar compra con método de pago: ${metodoPago}?`)) return;

    fetch('checkout.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            email: usuario.email,
            metodo_pago: metodoPago
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            let extra = '';
            if (data.reference) {
                extra += `\n\n📦 Tu número de referencia es:\n${data.reference}`;
            }
            if (metodoPago === 'OXXO' && data.reference) {
                extra += `\n\nPresenta esta referencia en caja para realizar el pago.`;
            }
            alert("✅ " + data.message + extra);
            renderizarVistaCarrito();

            // Opcional: recargar productos para reflejar stock
            fetch('get_products.php')
                .then(r => r.json())
                .then(lista => {
                    LISTA_PRODUCTOS = lista;
                    renderizarListaProductos();
                });
        } else {
            alert("❌ Error: " + data.message);
        }
    })
    .catch(err => {
        console.error(err);
        alert("❌ Error de conexión con el servidor");
    });
});


        vincularListenersAuth();
    }

    // ---------- Pestañas ----------
    function mostrarPestaña(idPestaña) {
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        const el = document.getElementById(`${idPestaña}-tab`);
        if (el) el.classList.add('active');

        if (idPestaña === 'cart') {
            renderizarVistaCarrito();
        } else if (idPestaña === 'orders') {
            cargarMisPedidos();
        } else if (idPestaña === 'my-repairs') {
            cargarMisReparaciones();
        }
    }



    // ---------- Detalle de producto ----------
    function mostrarDetalleProducto(productId) {
        productoSeleccionado = LISTA_PRODUCTOS.find(p => p.id === productId);
        const cont = document.getElementById('product-detail-container');
        if (!cont || !productoSeleccionado) return;

        const sinStock = (typeof productoSeleccionado.stock !== 'undefined' && productoSeleccionado.stock <= 0);

        cont.innerHTML = `
            <div class="product-detail-image">
                <img src="${productoSeleccionado.image}" alt="${productoSeleccionado.name}">
                ${sinStock ? '<span class="stock-badge out-of-stock">Sin stock</span>' : ''}
            </div>
            <div class="product-detail-info">
                <h2>${productoSeleccionado.name}</h2>
                <p class="product-detail-price">$${productoSeleccionado.price.toFixed(2)}</p>
                <p class="product-detail-description">${productoSeleccionado.description}</p>
                ${
                    sinStock
                    ? '<p style="color:#d32f2f;font-weight:bold;margin-top:10px;">Este producto está agotado actualmente.</p>'
                    : `
                        <div class="size-selector">
                            <h3>Selecciona tu talla:</h3>
                            <div class="size-options">
                                ${productoSeleccionado.sizes.map(s => `<div class="size-option" data-size="${s}">${s}</div>`).join('')}
                            </div>
                        </div>
                        <div class="quantity-selector">
                            <h3>Cantidad:</h3>
                            <div class="quantity-controls">
                                <button class="quantity-btn decrease">-</button>
                                <input type="number" class="quantity-input" value="1" min="1">
                                <button class="quantity-btn increase">+</button>
                            </div>
                        </div>
                    `
                }
                <button class="btn add-to-cart-detail" ${sinStock ? 'disabled style="opacity:0.6;cursor:not-allowed;"' : ''}>
                    ${sinStock ? 'Sin stock' : 'Añadir al Carrito'}
                </button>
            </div>
        `;
        mostrarPestaña('product-detail');
    }


    // ---------- Carrito ----------
    // ... (Keep existing code above)

    // ---------- Carrito ----------

    function actualizarDetallesPago() {
        const detalles = document.getElementById('payment-details');
        if (!detalles) return;

        const metodo = document.querySelector('input[name="payment-method"]:checked');
        const value = metodo ? metodo.value : 'Tarjeta';

        switch (value) {
            case 'Tarjeta':
                detalles.innerHTML = `
                    <p>Al confirmar la compra, se te pedirá ingresar los datos de tu tarjeta de crédito o débito de forma segura.</p>
                    <ul>
                        <li>Aceptamos Visa, MasterCard y American Express.</li>
                        <li>Tu pago se procesa con encriptación SSL.</li>
                    </ul>
                `;
                break;
            case 'PayPal':
                detalles.innerHTML = `
                    <p>Serás redirigido a PayPal para completar el pago.</p>
                    <ul>
                        <li>Puedes pagar con saldo de PayPal o tarjeta asociada.</li>
                        <li>Tu pedido se procesa en cuanto PayPal confirme el pago.</li>
                    </ul>
                `;
                break;
            case 'SPEI':
                detalles.innerHTML = `
                    <p>Realiza una transferencia SPEI con los siguientes datos:</p>
                    <ul>
                        <li><strong>Banco:</strong> Banco del Pueblo</li>
                        <li><strong>Beneficiario:</strong> Calzado del Pueblo S.A. de C.V.</li>
                        <li><strong>CLABE:</strong> 012 345 6789 0123 4567</li>
                        <li><strong>Referencia:</strong> Tu número de pedido al confirmar la compra.</li>
                    </ul>
                    <p>Tu pedido se liberará una vez que se confirme el pago.</p>
                `;
                break;
            case 'OXXO':
                detalles.innerHTML = `
                    <p>Generaremos una referencia para que puedas pagar en OXXO u otras tiendas.</p>
                    <ul>
                        <li>Presenta el código de barras o referencia en caja.</li>
                        <li>El pago puede tardar hasta 24 horas en reflejarse.</li>
                        <li>Recibirás un correo con las instrucciones detalladas.</li>
                    </ul>
                `;
                break;
            default:
                detalles.innerHTML = `<p>Selecciona un método de pago para ver los detalles.</p>`;
        }
    }


    function agregarProductoAlCarritoDesdeDetalle() {
        const usuario = obtenerUsuarioSesion();
        
        // 1. Force Login if not authenticated
        if (!usuario || !usuario.email) {
            alert("Debes iniciar sesión para agregar productos al carrito.");
            abrirModalAuth('login');
            return;
        }

        const tallaEl = document.querySelector('.size-option.selected');
        const qtyEl = document.querySelector('.quantity-input');
        const cantidad = Math.max(1, parseInt(qtyEl && qtyEl.value) || 1);

        // Note: Your DB currently connects Product ID directly to a specific row.
        // If your UI allows selecting sizes that aren't specific IDs, we just send the ID.
        if (!tallaEl) {
            alert('Por favor, selecciona una talla.');
            return;
        }

        const talla = tallaEl.getAttribute('data-size');
        const btnAgregar = document.querySelector('.add-to-cart-detail');
        const textoOriginal = btnAgregar.textContent;
        btnAgregar.textContent = "Guardando...";
        btnAgregar.disabled = true;

        // 2. Send Data to PHP Backend
        fetch('add_to_cart.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: usuario.email, // Identify the user
                productId: productoSeleccionado.id,
                quantity: cantidad,
                size: talla // Sent for reference, though DB might not store it in 'detalle'
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('✅ Producto guardado en tu carrito de la base de datos.');
                mostrarPestaña('products'); // Or redirect to cart
            } else {
                alert('Error: ' + data.message);
            }
        })
        .catch(err => {
            console.error(err);
            alert('Error de conexión con el servidor');
        })
        .finally(() => {
            btnAgregar.textContent = textoOriginal;
            btnAgregar.disabled = false;
        });
    }

    // ... (Keep the rest of your functions like renderizarVistaCarrito)

    function renderizarVistaCarrito() {
        const cont = document.getElementById('cart-items');
        const summ = document.getElementById('cart-summary');
        const usuario = obtenerUsuarioSesion();

        if (!cont) return;

        // 1. Check if user is logged in
        if (!usuario || !usuario.email) {
            // Write the empty message directly to innerHTML
            cont.innerHTML = '<div class="empty-cart-message"><p>Debes <a href="#" onclick="abrirModalAuth(\'login\'); return false;">iniciar sesión</a> para ver tu carrito.</p></div>';
            if (summ) summ.style.display = 'none';
            return;
        }

        // 2. Show loading state (This wipes previous content, which caused your error)
        cont.innerHTML = '<p style="text-align:center; padding:20px; color:#666;">Cargando tu carrito...</p>';
        if (summ) summ.style.display = 'none';

        // 3. Fetch data from DB
        fetch('get_cart.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: usuario.email })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                carrito = data.items;
                
                // 4. Render items
                if (carrito.length === 0) {
                    // FIX: Re-create the HTML string instead of looking for an ID that was deleted
                    cont.innerHTML = '<div class="empty-cart-message" id="empty-cart-message"><p>Tu carrito está vacío. <a href="#" class="nav-link" data-tab="products">¡Agrega algunos productos!</a></p></div>';
                    if (summ) summ.style.display = 'none';
                } else {
                    if (summ) summ.style.display = 'block';

                    // ... inside renderizarVistaCarrito ...
                    cont.innerHTML = carrito.map((item, i) => `
                        <div class="cart-item">
                            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                            <div class="cart-item-details">
                                <h4>${item.name}</h4>
                                <p>Talla: ${item.size}</p>
                                <p>Precio: $${item.price.toFixed(2)}</p>
                            </div>
                            <div class="cart-item-quantity">
                                <span style="font-weight:bold; margin:0 10px;">Cant: ${item.cantidad}</span>
                            </div>
                            <div class="cart-item-total">$${(item.price * item.cantidad).toFixed(2)}</div>
                            <div class="cart-item-remove remove-item" data-db-id="${item.id_detalle}">
                                <i class="fas fa-trash"></i> Eliminar
                            </div>
                        </div>
                    `).join('');
// ... rest of function ...

                    // Calculate totals
                    const subtotal = carrito.reduce((sum, item) => sum + (item.price * item.cantidad), 0);
                    const envio = subtotal > 100 ? 0 : 10;
                    const total = subtotal + envio;

                    if (document.getElementById('cart-subtotal')) document.getElementById('cart-subtotal').textContent = `$${subtotal.toFixed(2)}`;
                    if (document.getElementById('cart-shipping')) document.getElementById('cart-shipping').textContent = `$${envio.toFixed(2)}`;
                    if (document.getElementById('cart-total')) document.getElementById('cart-total').textContent = `$${total.toFixed(2)}`;
                }
            } else {
                cont.innerHTML = `<p style="color:red; text-align:center;">Error: ${data.message}</p>`;
            }
        })
        .catch(err => {
            console.error(err);
            cont.innerHTML = '<p style="color:red; text-align:center;">Error de conexión con el servidor.</p>';
        });
    }

    function cargarMisPedidos() {
    const cont = document.getElementById('orders-container');
    const usuario = obtenerUsuarioSesion();

    if (!cont) return;

    // Verificar login
    if (!usuario || !usuario.email) {
        cont.innerHTML = `
            <div class="empty-cart-message">
                <p>Debes iniciar sesión para ver tus pedidos.</p>
            </div>
        `;
        return;
    }

    // Estado de carga
    cont.innerHTML = '<p style="text-align:center;padding:20px;color:#666;">Cargando tus pedidos...</p>';

    fetch('get_orders.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: usuario.email })
    })
    .then(res => res.json())
    .then(data => {
        if (!data.success) {
            cont.innerHTML = `<p style="color:red;text-align:center;">Error: ${data.message || 'No se pudieron obtener tus pedidos.'}</p>`;
            return;
        }

        const orders = data.orders || [];
        if (orders.length === 0) {
            cont.innerHTML = `
                <div class="empty-cart-message">
                    <p>Aún no tienes pedidos registrados.</p>
                </div>
            `;
            return;
        }

        // Renderizar lista
        const html = orders.map(o => {
            const fecha = o.fecha || '';
            const total = o.total != null ? o.total.toFixed(2) : '0.00';
            const estado = o.estado || 'Pendiente';
            const metodo = o.metodo || 'N/A';
            const numItems = o.num_items || 0;

            return `
                <div class="order-card">
                    <div class="order-main">
                        <h3>Referencia: <span class="order-ref">${o.codigo}</span></h3>
                        <p><strong>Fecha:</strong> ${fecha}</p>
                        <p><strong>Total:</strong> $${total}</p>
                    </div>
                    <div class="order-meta">
                        <p><strong>Artículos:</strong> ${numItems}</p>
                        <p><strong>Método de pago:</strong> ${metodo}</p>
                        <p><strong>Estado:</strong> 
                            <span class="order-status order-status-${estado.toLowerCase()}">
                                ${estado}
                            </span>
                        </p>
                    </div>
                </div>
            `;
        }).join('');

        cont.innerHTML = html;
    })
    .catch(err => {
        console.error(err);
        cont.innerHTML = '<p style="color:red;text-align:center;">Error de conexión con el servidor.</p>';
    });
}

function cargarMisReparaciones() {
    const cont = document.getElementById('repairs-container');
    const usuario = obtenerUsuarioSesion();

    if (!cont) return;

    // Verificar login
    if (!usuario || !usuario.email) {
        cont.innerHTML = `
            <div class="empty-cart-message">
                <p>Debes iniciar sesión para ver tus reparaciones.</p>
            </div>
        `;
        return;
    }

    // Estado de carga
    cont.innerHTML = '<p style="text-align:center;padding:20px;color:#666;">Cargando tus reparaciones pendientes...</p>';

    fetch('get_repairs.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: usuario.email })
    })
    .then(res => res.json())
    .then(data => {
        if (!data.success) {
            cont.innerHTML = `<p style="color:red;text-align:center;">Error: ${data.message || 'No se pudieron obtener tus reparaciones.'}</p>`;
            return;
        }

        const repairs = data.repairs || [];
        if (repairs.length === 0) {
            cont.innerHTML = `
                <div class="empty-cart-message">
                    <p>No tienes reparaciones pendientes en este momento.</p>
                </div>
            `;
            return;
        }

        const html = repairs.map(r => {
            const fecha = r.fecha || '';
            const costo = r.costo != null ? r.costo.toFixed(2) : '0.00';
            const estado = r.estado || 'Pendiente';
            const tipo = r.tipo || 'Reparación';
            const desc = r.descripcion ? r.descripcion.replace(/\n/g, '<br>') : '';

            return `
                <div class="order-card">
                    <div class="order-main">
                        <h3>Reparación: <span class="order-ref">${r.codigo || '(sin código)'}</span></h3>
                        <p><strong>Tipo:</strong> ${tipo}</p>
                        <p><strong>Fecha de recepción:</strong> ${fecha}</p>
                        <p><strong>Costo estimado:</strong> $${costo}</p>
                    </div>
                    <div class="order-meta">
                        <p><strong>Estado:</strong>
                            <span class="order-status order-status-${estado.toLowerCase()}">
                                ${estado}
                            </span>
                        </p>
                        ${desc ? `<p><strong>Detalle:</strong><br>${desc}</p>` : ''}
                    </div>
                </div>
            `;
        }).join('');

        cont.innerHTML = html;
    })
    .catch(err => {
        console.error(err);
        cont.innerHTML = '<p style="color:red;text-align:center;">Error de conexión con el servidor.</p>';
    });
}



    function eliminarDelCarritoPorId(idDetalle) {
        if(!confirm("¿Eliminar producto?")) return;

        fetch('remove_from_cart.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_detalle: idDetalle })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                renderizarVistaCarrito(); // Reloads the list from DB
            } else {
                alert("Error eliminando: " + data.message);
            }
        });
    }

    function cambiarCantidadCarritoPorId(id, delta) {
        const idx = parseInt(id);
        if (idx >= 0 && idx < carrito.length) {
            carrito[idx].cantidad = Math.max(1, carrito[idx].cantidad + delta);
            guardarCarritoEnStorage();
            renderizarVistaCarrito();
        }
    }

    function establecerCantidadCarritoPorId(id, nuevaCantidad) {
        const idx = parseInt(id);
        if (idx >= 0 && idx < carrito.length) {
            carrito[idx].cantidad = Math.max(1, nuevaCantidad);
            guardarCarritoEnStorage();
            renderizarVistaCarrito();
        }
    }

    function obtenerClaveCarrito() {
        const cur = obtenerUsuarioSesion();
        if (cur && (cur.username || cur.email)) {
            const id = cur.username || cur.email;
            return `${CLAVE_CARRITO_BASE}_${id}`;
        }
        return `${CLAVE_CARRITO_BASE}_guest`;
    }

    function guardarCarritoEnStorage() {
        try {
            localStorage.setItem(obtenerClaveCarrito(), JSON.stringify(carrito || []));
        } catch(e) {
            console.warn('No se pudo guardar el carrito', e);
        }
    }

    function cargarCarritoDesdeStorage() {
        try {
            carrito = JSON.parse(localStorage.getItem(obtenerClaveCarrito())) || [];
        } catch(e) {
            carrito = [];
        }
    }

    // ---------- Autenticación ----------
    function abrirModalAuth(modo = 'login') {
        const modal = document.getElementById('auth-modal');
        if (!modal) return;
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        const tabLogin = document.getElementById('tab-login');
        const tabRegister = document.getElementById('tab-register');
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        const authError = document.getElementById('auth-error');
        const regError = document.getElementById('reg-error');

        if (tabLogin) tabLogin.classList.toggle('active', modo === 'login');
        if (tabRegister) tabRegister.classList.toggle('active', modo === 'register');
        if (loginForm) loginForm.classList.toggle('active', modo === 'login');
        if (registerForm) registerForm.classList.toggle('active', modo === 'register');
        if (authError) authError.textContent = '';
        if (regError) regError.textContent = '';
    }

    function cerrarModalAuth() {
        const modal = document.getElementById('auth-modal');
        if (!modal) return;
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
    }

    function manejarRegistro(e) {
        e.preventDefault();
        
        // 1. Get only the 3 fields we kept in HTML
        const name = document.getElementById('reg-name').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const password = document.getElementById('reg-password').value;
        const err = document.getElementById('reg-error');

        // 2. Validate
        if (!name || !email || !password) {
            if (err) err.textContent = 'Por favor completa Nombre, Correo y Contraseña.';
            return;
        }

        const btn = document.getElementById('register-btn');
        btn.disabled = true;
        btn.textContent = "Registrando...";

        // 3. Send to PHP
        fetch('register.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                name: name, 
                email: email, 
                password: password
                // Phone is removed
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                establecerUsuarioSesion(data.user);
                cerrarModalAuth();
                mostrarEstadoUsuario();
                alert("¡Registro exitoso!");
                // Clear form
                document.getElementById('reg-name').value = '';
                document.getElementById('reg-email').value = '';
                document.getElementById('reg-password').value = '';
            } else {
                if (err) err.textContent = data.message;
            }
        })
        .catch(error => {
            if (err) err.textContent = 'Error de conexión';
        })
        .finally(() => {
            btn.disabled = false;
            btn.textContent = "Crear cuenta";
        });
    }

    function manejarLogin(e) {
    e.preventDefault();
    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value;
    const err = document.getElementById('auth-error');

    // Call the PHP Backend
    fetch('login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, password: password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Save session and close modal
            establecerUsuarioSesion(data.user);
            cerrarModalAuth();
            mostrarEstadoUsuario();
        } else {
            if (err) err.textContent = data.message;
        }
    })
    .catch(error => {
        console.error('Error:', error);
        if (err) err.textContent = 'Error de conexión';
    });
}

    // ---------- Estado Usuario UI ----------
    function mostrarEstadoUsuario() {
        const botonUsuario = document.getElementById('user-button');
        const actual = obtenerUsuarioSesion();
        if (!botonUsuario) return;
        if (actual && (actual.username || actual.name || actual.email)) {
            const avatarHtml = actual.picture
                ? `<img src="${escapeHtml(actual.picture)}" alt="avatar" class="user-avatar" />`
                : `<i class="fas fa-user-circle" style="font-size:20px;color:var(--primary)"></i>`;
            botonUsuario.innerHTML = `<button class="user-badge" id="user-badge-button" style="border:none;background:transparent;cursor:pointer;display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:20px;">${avatarHtml}<div style="display:flex;flex-direction:column;align-items:flex-start;"><span style="font-weight:600;color:var(--primary);font-size:0.95rem;">${escapeHtml(actual.name || actual.username)}</span><span style="font-size:0.75rem;color:#666;">${escapeHtml(actual.username || '')}</span></div></button>`;
            const badge = document.getElementById('user-badge-button');
            if (badge) badge.addEventListener('click', function(e) {
                e.preventDefault();
                abrirModalPerfil();
            });
        } else {
            botonUsuario.innerHTML = '<i class="fas fa-user"></i>';
        }
    }

    // ---------- Modal perfil ----------
    function abrirModalPerfil() {
        const actual = obtenerUsuarioSesion();
        const cont = document.querySelector('.auth-forms');
        const ORIGINAL = cont ? cont.innerHTML : '';
        if (!cont) return;

        const html = `
            <div style="padding:8px 12px; text-align:center;">
                ${actual && actual.picture ? `<div style="margin-bottom:8px;"><img src="${escapeHtml(actual.picture)}" alt="avatar" style="width:96px;height:96px;border-radius:50%;object-fit:cover;border:3px solid #f0f0f0" /></div>` : ''}
                <h3 style="margin-bottom:6px;text-align:center;">${escapeHtml(actual.name || actual.username || '')}</h3>
                <p style="color:#666;margin-bottom:6px;text-align:center;">Usuario: <b>${escapeHtml(actual.username || '')}</b></p>
                <div class="form-group"><label for="profile-email">Correo</label><input id="profile-email" type="email" class="form-control" style="width:100%;" value="${escapeHtml(actual.email || '')}" /></div>
                <div class="form-group"><label for="profile-phone">Teléfono</label><input id="profile-phone" type="tel" class="form-control" style="width:100%;" value="${escapeHtml(actual.phone || '')}" /></div>
                <fieldset style="border:1px dashed #e0e0e0;padding:8px;margin-top:8px;"><legend style="font-size:0.9em;color:#666;padding:0 6px;">Cambiar contraseña</legend><div class="form-group"><label for="profile-current-password">Contraseña actual</label><input id="profile-current-password" type="password" class="form-control" /></div><div class="form-group"><label for="profile-new-password">Nueva contraseña</label><input id="profile-new-password" type="password" class="form-control" /></div><div class="form-group"><label for="profile-new-password-confirm">Confirmar nueva contraseña</label><input id="profile-new-password-confirm" type="password" class="form-control" /></div></fieldset>
                <div style="margin-top:12px;display:flex;gap:8px;justify-content:center;flex-wrap:wrap;"><button class="btn" id="profile-save-changes">Guardar cambios</button><button class="btn" id="profile-logout">Cerrar sesión</button><button class="btn btn-secondary" id="profile-close">Cerrar</button></div>
                <div id='profile-msg' style='margin-top:8px;color:var(--secondary);font-weight:600;text-align:center;'></div>
            </div>
        `;
        cont.innerHTML = html;
        abrirModalAuth('profile');

        const guardarBtn = document.getElementById('profile-save-changes');
        if (guardarBtn) guardarBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const msg = document.getElementById('profile-msg');
            const nuevoEmail = (document.getElementById('profile-email').value || '').trim();
            const nuevoPhone = (document.getElementById('profile-phone').value || '').trim();
            const curPass = (document.getElementById('profile-current-password').value || '');
            const newPass = (document.getElementById('profile-new-password').value || '');
            const newPassConfirm = (document.getElementById('profile-new-password-confirm').value || '');

            if (!/^\S+@\S+\.\S+$/.test(nuevoEmail)) {
                if (msg) msg.textContent = 'Correo electrónico inválido.';
                return;
            }
            if (nuevoPhone && !/^\d{10}$/.test(nuevoPhone)) {
                if (msg) msg.textContent = 'El teléfono debe tener 10 dígitos.';
                return;
            }

            let usuarios = obtenerUsuarios();
            const idx = usuarios.findIndex(x => x.username === actual.username);
            if (idx === -1) {
                if (msg) msg.textContent = 'Usuario no encontrado.';
                return;
            }

            const other = usuarios.find((u, i) => (u.email === nuevoEmail) && i !== idx);
            if (other) {
                if (msg) msg.textContent = 'El correo ya está en uso por otra cuenta.';
                return;
            }

            if (newPass || newPassConfirm) {
                if (!curPass) {
                    if (msg) msg.textContent = 'Proporciona tu contraseña actual para cambiarla.';
                    return;
                }
                if (usuarios[idx].password !== curPass) {
                    if (msg) msg.textContent = 'Contraseña actual incorrecta.';
                    return;
                }
                if (newPass.length < 6) {
                    if (msg) msg.textContent = 'La nueva contraseña debe tener al menos 6 caracteres.';
                    return;
                }
                if (newPass !== newPassConfirm) {
                    if (msg) msg.textContent = 'Las nuevas contraseñas no coinciden.';
                    return;
                }
                usuarios[idx].password = newPass;
            }

            usuarios[idx].email = nuevoEmail;
            usuarios[idx].phone = nuevoPhone;
            guardarUsuarios(usuarios);
            establecerUsuarioSesion({
                username: usuarios[idx].username,
                name: usuarios[idx].name,
                email: usuarios[idx].email,
                phone: usuarios[idx].phone,
                birth: usuarios[idx].birth,
                country: usuarios[idx].country,
                curp: usuarios[idx].curp
            });
            if (msg) msg.textContent = 'Datos actualizados correctamente.';
            mostrarEstadoUsuario();
        });

        const logoutBtn = document.getElementById('profile-logout');
        const closeBtn = document.getElementById('profile-close');
        if (logoutBtn) logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            limpiarUsuarioSesion();
            cerrarModalAuth();
            if (cont) cont.innerHTML = ORIGINAL;
            vincularListenersAuth();
        });
        if (closeBtn) closeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            cerrarModalAuth();
            if (cont) cont.innerHTML = ORIGINAL;
            vincularListenersAuth();
        });
    }

    window.abrirModalPerfil = abrirModalPerfil;
    window.openProfileModal = abrirModalPerfil;

    function escapeHtml(text) {
        return String(text).replace(/[&<>"]/g, function(s) {
            return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[s];
        });
    }

    // ---------- Listeners auth ----------
    function vincularListenersAuth() {
        const cont = document.querySelector('.auth-forms');
        const ORIGINAL = cont ? cont.innerHTML : '';
        const btnUsuario = document.getElementById('user-button');
        if (btnUsuario) btnUsuario.addEventListener('click', function(e) {
            e.preventDefault();
            const cur = obtenerUsuarioSesion();
            if (cur && cur.username) {
                // ya logueado
            } else {
                abrirModalAuth('login');
            }
        });

        const authClose = document.getElementById('auth-close');
        if (authClose) authClose.addEventListener('click', function(e) {
            e.preventDefault();
            cerrarModalAuth();
        });

        const tabLogin = document.getElementById('tab-login');
        const tabRegister = document.getElementById('tab-register');
        if (tabLogin) tabLogin.addEventListener('click', function() { abrirModalAuth('login'); });
        if (tabRegister) tabRegister.addEventListener('click', function() { abrirModalAuth('register'); });

        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        if (loginForm) loginForm.addEventListener('submit', manejarLogin);
        if (registerForm) registerForm.addEventListener('submit', manejarRegistro);
    }

    // ---------- Usuarios en localStorage ----------
    function obtenerUsuarios() {
        try {
            return JSON.parse(localStorage.getItem(CLAVE_USUARIOS)) || [];
        } catch(e) {
            return [];
        }
    }

    function guardarUsuarios(usuarios) {
        try {
            localStorage.setItem(CLAVE_USUARIOS, JSON.stringify(usuarios));
        } catch(e) {
            console.warn('No se pudo guardar usuarios', e);
        }
    }

    function obtenerUsuarioSesion() {
        try {
            const data = localStorage.getItem(CLAVE_USUARIO_ACTUAL);
            return data ? JSON.parse(data) : null;
        } catch(e) {
            return null;
        }
    }

    function establecerUsuarioSesion(usuario) {
        try {
            localStorage.setItem(CLAVE_USUARIO_ACTUAL, JSON.stringify(usuario));
        } catch(e) {
            console.warn('No se pudo establecer usuario sesión', e);
        }
    }

    function limpiarUsuarioSesion() {
        try {
            localStorage.removeItem(CLAVE_USUARIO_ACTUAL);
        } catch(e) {
            console.warn('No se pudo limpiar sesión', e);
        }
    }

    // ---------- Google Sign-In ----------
    function iniciarGoogleSignIn() {
        console.log('Inicializando Google Sign-In...');

        // Verificar si la librería de Google está disponible
        if (typeof google === 'undefined') {
            console.error('La librería de Google Identity no está disponible');
            mostrarFallbackGoogleButtons();
            return;
        }

        if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID.includes('REPLACE_WITH')) {
            console.error('GOOGLE_CLIENT_ID no configurado correctamente.');
            mostrarFallbackGoogleButtons();
            return;
        }

        google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: manejarCredencialGoogle,
            auto_select: false,
            cancel_on_tap_outside: true,
        });

        const loginContainer = document.getElementById('google-signin-button');
        const registerContainer = document.getElementById('google-register-button');

        if (!loginContainer) {
            console.error('Contenedor de login no encontrado: #google-signin-button');
        } else {
            console.log('Renderizando botón de Google en login...');
            google.accounts.id.renderButton(
                loginContainer,
                {
                    theme: 'outline',
                    size: 'large',
                    text: 'signin_with',
                    logo_alignment: 'left',
                }
            );
        }

        if (!registerContainer) {
            console.error('Contenedor de registro no encontrado: #google-register-button');
        } else {
            console.log('Renderizando botón de Google en registro...');
            google.accounts.id.renderButton(
                registerContainer,
                {
                    theme: 'outline',
                    size: 'large',
                    text: 'signin_with',
                    logo_alignment: 'left',
                }
            );
        }

        // Fallback si los botones no se renderizan después de 2 segundos
        setTimeout(() => {
            if (loginContainer && loginContainer.children.length === 0) {
                console.warn('El botón de Google (login) no se renderizó. Mostrando botón alternativo.');
                const fallbackLoginButton = document.createElement('button');
                fallbackLoginButton.textContent = 'Iniciar sesión con Google';
                fallbackLoginButton.className = 'btn btn-google';
                fallbackLoginButton.onclick = () => {
                    if (typeof google !== 'undefined') google.accounts.id.prompt();
                };
                loginContainer.appendChild(fallbackLoginButton);
            }

            if (registerContainer && registerContainer.children.length === 0) {
                console.warn('El botón de Google (registro) no se renderizó. Mostrando botón alternativo.');
                const fallbackRegisterButton = document.createElement('button');
                fallbackRegisterButton.textContent = 'Registrarse con Google';
                fallbackRegisterButton.className = 'btn btn-google';
                fallbackRegisterButton.onclick = () => {
                    if (typeof google !== 'undefined') google.accounts.id.prompt();
                };
                registerContainer.appendChild(fallbackRegisterButton);
            }
        }, 2000);
    }

    function mostrarFallbackGoogleButtons() {
        const loginContainer = document.getElementById('google-signin-button');
        const registerContainer = document.getElementById('google-register-button');

        if (loginContainer && loginContainer.children.length === 0) {
            const fallbackLoginButton = document.createElement('button');
            fallbackLoginButton.textContent = 'Iniciar sesión con Google';
            fallbackLoginButton.className = 'btn btn-google';
            fallbackLoginButton.onclick = () => alert('La librería de Google Identity no se pudo cargar. Verifica tu conexión a internet.');
            loginContainer.appendChild(fallbackLoginButton);
        }

        if (registerContainer && registerContainer.children.length === 0) {
            const fallbackRegisterButton = document.createElement('button');
            fallbackRegisterButton.textContent = 'Registrarse con Google';
            fallbackRegisterButton.className = 'btn btn-google';
            fallbackRegisterButton.onclick = () => alert('La librería de Google Identity no se pudo cargar. Verifica tu conexión a internet.');
            registerContainer.appendChild(fallbackRegisterButton);
        }
    }

    function manejarCredencialGoogle(response) {
        console.log('Credencial de Google recibida');
        try {
            const payload = JSON.parse(atob(response.credential.split('.')[1]));
            console.log('Datos decodificados:', payload);

            const usuario = {
                username: payload.email.split('@')[0],
                name: payload.name,
                email: payload.email,
                picture: payload.picture,
                phone: '',
                birth: '',
                country: '',
                curp: ''
            };

            let usuarios = obtenerUsuarios();
            const encontrado = usuarios.find(u => u.email === usuario.email);
            if (!encontrado) {
                usuarios.push(usuario);
                guardarUsuarios(usuarios);
                console.log('Usuario Google registrado automáticamente');
            } else {
                usuario.password = encontrado.password;
            }

            establecerUsuarioSesion(usuario);
            cerrarModalAuth();
            mostrarEstadoUsuario();
        } catch(e) {
            console.error('Error procesando credencial Google:', e);
        }
    }

    // ---------- Reparación ----------
function enviarSolicitudCotizacion() {
    const seleccionadas = document.querySelectorAll('.repair-checkbox:checked');
    const nombre = document.getElementById('customer-name') ? document.getElementById('customer-name').value.trim() : '';
    const correo = document.getElementById('customer-email') ? document.getElementById('customer-email').value.trim() : '';
    const telefono = document.getElementById('customer-phone') ? document.getElementById('customer-phone').value.trim() : '';
    const descripcion = document.getElementById('repair-description') ? document.getElementById('repair-description').value.trim() : '';

    if (seleccionadas.length === 0) {
        alert('Por favor, selecciona al menos un servicio de reparación.');
        return;
    }
    if (!nombre || !correo) {
        alert('Por favor, completa tu nombre y correo electrónico.');
        return;
    }

    let total = 0;
    let lista = '';
    const servicios = [];

    seleccionadas.forEach(cb => {
        const serv = cb.getAttribute('data-service');
        const precio = parseFloat(cb.getAttribute('data-price')) || 0;
        total += precio;
        lista += `- ${serv}: $${precio.toFixed(2)}\n`;
        servicios.push({
            servicio: serv,
            precio: precio
        });
    });

    // Desactivar botón mientras se envía
    const btn = document.getElementById('request-quote');
    if (btn) {
        btn.disabled = true;
        btn.textContent = 'Enviando...';
    }

    fetch('request_repair.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: nombre,
            email: correo,
            phone: telefono,
            description: descripcion,
            services: servicios,
            total: total
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            const ref = data.codigo ? `\n\n📎 Código de reparación: ${data.codigo}` : '';
            alert(
                `✅ Cotización registrada exitosamente en el sistema.\n\n` +
                `📋 Servicios seleccionados:\n${lista}\n` +
                `💰 Total estimado: $${total.toFixed(2)}\n` +
                `📧 Te contactaremos pronto a ${correo} para confirmar los detalles.` +
                ref
            );

            // Limpiar formulario SOLO si se guardó bien
            document.querySelectorAll('.repair-checkbox').forEach(cb => cb.checked = false);
            if (document.getElementById('customer-name')) document.getElementById('customer-name').value = '';
            if (document.getElementById('customer-email')) document.getElementById('customer-email').value = '';
            if (document.getElementById('customer-phone')) document.getElementById('customer-phone').value = '';
            if (document.getElementById('repair-description')) document.getElementById('repair-description').value = '';
            actualizarCotizacionReparacion();
        } else {
            alert('❌ Error al registrar la reparación: ' + (data.message || 'Intenta más tarde.'));
        }
    })
    .catch(err => {
        console.error(err);
        alert('❌ Error de conexión al servidor.');
    })
    .finally(() => {
        if (btn) {
            btn.disabled = false;
            btn.textContent = 'Solicitar Cotización';
        }
    });
}


    function actualizarCotizacionReparacion() {
        const checks = document.querySelectorAll('.repair-checkbox:checked');
        let total = 0;
        const lineas = [];

        checks.forEach(c => {
            const precio = parseFloat(c.getAttribute('data-price')) || 0;
            const nombreServ = c.getAttribute('data-service') || 'Servicio';
            total += precio;
            lineas.push(`${nombreServ} - $${precio.toFixed(2)}`);
        });

        // Actualizar el total
        const totalEl = document.getElementById('repair-quote-total');
        if (totalEl) {
            totalEl.textContent = `$${total.toFixed(2)}`;
        }

        // Actualizar el "preview" de resumen (summary-details)
        const resumenEl = document.getElementById('summary-details');
        if (resumenEl) {
            if (checks.length === 0) {
                resumenEl.innerHTML = '<p>Selecciona servicios para ver el total</p>';
            } else {
                resumenEl.innerHTML = `
                    <p>Servicios seleccionados:</p>
                    <ul>
                        ${lineas.map(l => `<li>${l}</li>`).join('')}
                    </ul>
                `;
            }
        }
    }

});
