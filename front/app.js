// State
const state = {
    cat_preference: 0, // 0 = leche, 1 = oscuro
    flavor_preference: 0, // 0-5
    items_in_cart: 0, // Number of distinct items
    subtotal: 0.0,
    time_on_catalog_s: 0,
    viewed_detail: 0, // 1 if viewed
    cacao_avg_cart: 0.0,
    
    // Internal state
    cart: [], // Array of product objects
    products: {},
    catalogEnterTime: Date.now(),
    currentDetailProduct: null,
    
    // Flavor mapping to indexes
    flavorMap: {
        'frutos_secos': 0,
        'especias': 1,
        'herbal': 2,
        'tropical': 3,
        'mentolado': 4,
        'cítrico': 5
    }
};

const API_BASE = 'http://127.0.0.1:8000';

// DOM Elements
const views = {
    catalog: document.getElementById('view-catalog'),
    detail: document.getElementById('view-detail'),
    cart: document.getElementById('view-cart')
};

const navCatalog = document.getElementById('nav-catalog');
const navCart = document.getElementById('nav-cart');
const cartCount = document.getElementById('cart-count');
const productsGrid = document.getElementById('products-grid');
const cartItemsContainer = document.getElementById('cart-items');
const cartSubtotalEl = document.getElementById('cart-subtotal');
const cartTotalEl = document.getElementById('cart-total');
const recPanel = document.getElementById('recommendation-panel');

// Init
async function init() {
    await fetchProducts();
    renderCatalog();
    setupEventListeners();
    
    // Start tracking time on catalog
    setInterval(() => {
        if (views.catalog.classList.contains('active')) {
            state.time_on_catalog_s = Math.floor((Date.now() - state.catalogEnterTime) / 1000);
        }
    }, 1000);
}

async function fetchProducts() {
    try {
        const response = await fetch(`${API_BASE}/products`);
        if(response.ok) {
            state.products = await response.json();
        } else {
            console.error("Failed to fetch products");
        }
    } catch(e) {
        console.error("API not running, using fallback data.");
        // Fallback data if backend is not running yet
        state.products = {
            "0": {"name": "55% Leche - Almendra", "category": "leche", "flavor": "frutos_secos", "cacao": 55},
            "1": {"name": "55% Leche - Canela", "category": "leche", "flavor": "especias", "cacao": 55},
            "2": {"name": "55% Leche - Hierba Luisa", "category": "leche", "flavor": "herbal", "cacao": 55},
            "3": {"name": "55% Leche - Maracuyá", "category": "leche", "flavor": "tropical", "cacao": 55},
            "4": {"name": "55% Leche - Menta", "category": "leche", "flavor": "mentolado", "cacao": 55},
            "5": {"name": "55% Leche - Naranja", "category": "leche", "flavor": "cítrico", "cacao": 55},
            "6": {"name": "75% Oscuro - Almendra", "category": "oscuro", "flavor": "frutos_secos", "cacao": 75},
            "7": {"name": "75% Oscuro - Canela", "category": "oscuro", "flavor": "especias", "cacao": 75},
            "8": {"name": "75% Oscuro - Hierba Luisa", "category": "oscuro", "flavor": "herbal", "cacao": 75},
            "9": {"name": "75% Oscuro - Menta", "category": "oscuro", "flavor": "mentolado", "cacao": 75}
        };
    }
}

function renderCatalog() {
    productsGrid.innerHTML = '';
    
    // Get active filters
    const selectedCat = document.querySelector('input[name="cat"]:checked').value;
    const selectedFlavor = document.querySelector('input[name="flavor"]:checked').value;
    
    // Update state preferences based on filters
    state.cat_preference = selectedCat === 'leche' ? 0 : 1;
    state.flavor_preference = state.flavorMap[selectedFlavor] || 0;

    Object.entries(state.products).forEach(([id, prod]) => {
        // Filter visually
        if (prod.category !== selectedCat) return;

        const el = document.createElement('div');
        el.className = 'product-card';
        el.innerHTML = `
            <div class="product-image-mock ${prod.category}"></div>
            <h3 class="product-title">${prod.name}</h3>
            <p class="product-cat">${prod.flavor.replace('_', ' ')}</p>
            <p class="product-price">$2.50</p>
        `;
        
        el.addEventListener('click', () => showDetail(id, prod));
        productsGrid.appendChild(el);
    });
}

function setupEventListeners() {
    // Nav
    navCatalog.addEventListener('click', (e) => { e.preventDefault(); switchView('catalog'); });
    navCart.addEventListener('click', (e) => { e.preventDefault(); switchView('cart'); });
    
    // Filters
    document.querySelectorAll('input[name="cat"], input[name="flavor"]').forEach(radio => {
        radio.addEventListener('change', renderCatalog);
    });
    
    // Detail
    document.getElementById('btn-back-catalog').addEventListener('click', () => switchView('catalog'));
    document.getElementById('btn-add-to-cart').addEventListener('click', () => {
        addToCart(state.currentDetailProduct.id, state.currentDetailProduct);
        switchView('catalog');
    });
}

function showDetail(id, prod) {
    state.viewed_detail = 1; // Track feature
    state.currentDetailProduct = { id, ...prod };
    
    document.getElementById('detail-title').innerText = prod.name;
    document.getElementById('detail-category').innerText = `${prod.category} (${prod.cacao}%)`;
    document.getElementById('detail-flavor').innerText = prod.flavor.replace('_', ' ');
    
    const imgMock = document.querySelector('.detail-image .chocolate-bar-mock');
    imgMock.className = `chocolate-bar-mock ${prod.category}`;
    
    switchView('detail');
}

function addToCart(id, prod) {
    // Check if already in cart
    const existing = state.cart.find(item => item.id === id);
    if (!existing) {
        state.cart.push({ id, ...prod, qty: 1 });
    } else {
        existing.qty += 1;
    }
    updateCartCalculations();
}

function updateCartCalculations() {
    // Unique items
    state.items_in_cart = state.cart.length;
    
    // Subtotal
    state.subtotal = state.cart.reduce((sum, item) => sum + (item.qty * 2.50), 0);
    
    // Avg Cacao
    if (state.cart.length > 0) {
        const sumCacao = state.cart.reduce((sum, item) => sum + item.cacao, 0);
        state.cacao_avg_cart = sumCacao / state.cart.length;
    } else {
        state.cacao_avg_cart = 0;
    }
    
    // Update UI
    cartCount.innerText = state.cart.reduce((sum, item) => sum + item.qty, 0);
}

function renderCart() {
    cartItemsContainer.innerHTML = '';
    
    if (state.cart.length === 0) {
        cartItemsContainer.innerHTML = '<p>Tu carrito está vacío.</p>';
    } else {
        state.cart.forEach(item => {
            const el = document.createElement('div');
            el.className = 'cart-item';
            el.innerHTML = `
                <div class="cart-item-img ${item.category}"></div>
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>Cant: ${item.qty}</p>
                </div>
                <div class="cart-item-price">$${(item.qty * 2.50).toFixed(2)}</div>
            `;
            cartItemsContainer.appendChild(el);
        });
    }
    
    const formattedSub = `$${state.subtotal.toFixed(2)}`;
    cartSubtotalEl.innerText = formattedSub;
    cartTotalEl.innerText = formattedSub; // Free shipping
    
    // Request Recommendation
    if (state.cart.length > 0) {
        fetchRecommendation();
    } else {
        recPanel.classList.add('hidden');
    }
}

async function fetchRecommendation() {
    recPanel.classList.add('hidden'); // hide while loading
    
    const payload = {
        cat_preference: state.cat_preference,
        flavor_preference: state.flavor_preference,
        items_in_cart: state.items_in_cart,
        subtotal: state.subtotal,
        time_on_catalog_s: state.time_on_catalog_s,
        viewed_detail: state.viewed_detail,
        cacao_avg_cart: state.cacao_avg_cart
    };
    
    console.log("Sending features to backend:", payload);
    
    try {
        const response = await fetch(`${API_BASE}/predict`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log("Recommendation received:", data);
            
            // Find the best recommendation that is NOT already in the cart
            let recId = null;
            for (let id of data.top_3_ids) {
                if (!state.cart.find(item => item.id == id)) {
                    recId = id;
                    break;
                }
            }
            
            // If all top 3 are in the cart, just default to the first one
            if (recId === null) {
                recId = data.top_3_ids[0];
            }
            
            // Reconstruct the data object using the catalog data
            const prod = state.products[recId];
            if (prod) {
                const recData = {
                    product_id: recId,
                    name: prod.name,
                    category: prod.category,
                    flavor: prod.flavor,
                    cacao_percent: prod.cacao
                };
                showRecommendation(recData);
            }
        }
    } catch(e) {
        console.error("Failed to fetch recommendation", e);
    }
}

function showRecommendation(data) {
    document.getElementById('rec-title').innerText = data.name;
    document.getElementById('rec-desc').innerText = `Una exquisita combinación de cacao al ${data.cacao_percent}% con notas de ${data.flavor.replace('_', ' ')}.`;
    
    const imgMock = document.querySelector('.rec-image .chocolate-bar-mock');
    imgMock.className = `chocolate-bar-mock small ${data.category}`;
    
    const btn = document.getElementById('btn-add-rec');
    // Remove old listeners by cloning
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    
    newBtn.addEventListener('click', () => {
        addToCart(data.product_id.toString(), {
            name: data.name,
            category: data.category,
            flavor: data.flavor,
            cacao: data.cacao_percent
        });
        recPanel.classList.add('hidden'); // hide after adding
        renderCart(); // Re-render cart
    });
    
    recPanel.classList.remove('hidden');
}

function switchView(viewName) {
    // Hide all
    Object.values(views).forEach(el => el.classList.remove('active'));
    
    // Show target
    views[viewName].classList.add('active');
    
    // Logic per view
    if (viewName === 'cart') {
        renderCart();
    } else if (viewName === 'catalog') {
        state.catalogEnterTime = Date.now();
    }
}

// Start app
window.addEventListener('DOMContentLoaded', init);
