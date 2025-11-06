// Data: Example products (could be fetched from API in real app)
const PRODUCTS = [
	{
		id: 'p1',
		name: 'Air Podes',
		category: 'Electronics',
		description: 'Noise-cancelling AirPodes with 30h battery life.',
		price: 1290,
		rating: 4.5,
		reviews: 1432,
		image: './airpod.jpg'
	},
	{
		id: 'p2',
		name: 'Jacket',
		category: 'Fashion',
		description: '',
		price: 1299,
		rating: 4.2,
		reviews: 980,
		image: './jacket.jpg'
	},
	{
		id: 'p3',
		name: 'Cotton Cream T-Shirt',
		category: 'Fashion',
		description: 'Soft breathable cotton tee, classic fit,  colors.',
		price: 579,
		rating: 4.1,
		reviews: 523,
		image: './tshirt.jpg'
	},
	{
		id: 'p4',
		name: 'Running Shoes Pro',
		category: 'Fashion',
		description: 'Lightweight running shoes with responsive cushioning.',
		price: 849,
		rating: 4.6,
		reviews: 2010,
		image: './shoes.jpg'
	},
	{
		id: 'p5',
		name: 'Logitech Mouse',
		category: 'Electronics',
		description: 'Gaming Mouse with multifunctional keys with 6 buttons. 600dpi sensitivity.',
		price: 1295,
		rating: 4.0,
		reviews: 189,
		image: './logitech.jpg'
	},
	{
		id: 'p6',
		name: 'Office Chair Ergonomic',
		category: 'Home & Kitchen',
		description: 'Adjustable lumbar support and breathable mesh back.',
		price: 6400,
		rating: 4.3,
		reviews: 774,
		image: './chair.jpg'
	},
	{
		id: 'p7',
		name: 'Bluetooth Speaker Mini',
		category: 'Electronics',
		description: 'Compact speaker with deep bass and 12h playback.',
		price: 1249,
		rating: 4.4,
		reviews: 1502,
		image: './speaker.jpg'
	},
	{
		id: 'p8',
		name: 'Headphones',
		category: 'Electronics',
		description: 'Noise-cancelling AirPodes with 30h battery life.',
		price: 1249,
		rating: 4.4,
		reviews: 1502,
		image: './headphone.jpg'
	},
];

// State
const state = {
	products: PRODUCTS,
	filtered: PRODUCTS,
	cart: loadCart(),
	user: loadUser(),
	filters: { search: '', category: 'all', minPrice: '', maxPrice: '', sortBy: 'relevance' }
};

// Utilities
function formatCurrency(value) {
	return `₹${value.toFixed(2)}`;
}

function saveCart() {
	localStorage.setItem('cart', JSON.stringify(state.cart));
}

function loadCart() {
	try { return JSON.parse(localStorage.getItem('cart')) || {}; } catch { return {}; }
}

function saveUser(user) {
	if (user) localStorage.setItem('user', JSON.stringify(user));
	else localStorage.removeItem('user');
}

function loadUser() {
	try { return JSON.parse(localStorage.getItem('user')) || null; } catch { return null; }
}

function getCartCount() {
	return Object.values(state.cart).reduce((sum, item) => sum + item.quantity, 0);
}

function getCartTotals() {
    const subtotal = Object.values(state.cart).reduce((sum, item) => sum + item.quantity * item.price, 0);
    const tax = subtotal * 0.08; // 8% dummy tax (applied on base currency before display conversion)
    const total = subtotal + tax;
	return { subtotal, tax, total };
}

// Rendering
function renderProducts() {
	const grid = document.getElementById('productsGrid');
	grid.innerHTML = '';
	for (const p of state.filtered) {
		const card = document.createElement('div');
		card.className = 'bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-sm transition';
		card.innerHTML = `
			<button data-id="${p.id}" class="block text-left w-full">
				<img src="${p.image}" alt="${p.name}" class="w-full h-40 object-cover" />
				<div class="p-3">
					<p class="text-xs uppercase tracking-wide text-gray-500">${p.category}</p>
					<h3 class="mt-0.5 text-sm font-semibold line-clamp-2 text-blue-700 hover:text-orange-600">${p.name}</h3>
					<div class="flex items-center gap-2 mt-1">
						<span class="text-xs text-amber-600 font-medium">★ ${p.rating.toFixed(1)}</span>
						<span class="text-xs text-gray-500">(${p.reviews})</span>
					</div>
					<p class="mt-1 font-semibold">${formatCurrency(p.price)}</p>
				</div>
			</button>
			<div class="p-3 pt-0">
				<button data-add="${p.id}" class="w-full h-9 bg-yellow-400 hover:bg-yellow-500 text-gray-900 text-sm font-medium rounded-md">Add to Cart</button>
			</div>
		`;
		grid.appendChild(card);
	}

	// Bind events for detail open and add-to-cart
	grid.querySelectorAll('button[data-id]').forEach(btn => {
		btn.addEventListener('click', () => openProductModal(btn.getAttribute('data-id')));
	});
	grid.querySelectorAll('button[data-add]').forEach(btn => {
		btn.addEventListener('click', (e) => {
			e.stopPropagation();
			addToCart(btn.getAttribute('data-add'), 1);
		});
	});
}

function renderFilters() {
	const categorySelect = document.getElementById('filterCategory');
	const categories = ['all', ...new Set(state.products.map(p => p.category))];
	categorySelect.innerHTML = categories.map(c => `<option value="${c}">${c}</option>`).join('');
	categorySelect.value = state.filters.category;
}

function applyFilters() {
	const { search, category, minPrice, maxPrice, sortBy } = state.filters;
	let list = [...state.products];
	if (search) {
		const q = search.toLowerCase();
		list = list.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
	}
	if (category !== 'all') list = list.filter(p => p.category === category);
	if (minPrice !== '') list = list.filter(p => p.price >= Number(minPrice));
	if (maxPrice !== '') list = list.filter(p => p.price <= Number(maxPrice));
	if (sortBy === 'price-asc') list.sort((a,b) => a.price - b.price);
	if (sortBy === 'price-desc') list.sort((a,b) => b.price - a.price);
	if (sortBy === 'rating-desc') list.sort((a,b) => b.rating - a.rating);
	state.filtered = list;
	renderProducts();
}

function renderCart() {
	const itemsWrap = document.getElementById('cartItems');
	itemsWrap.innerHTML = '';
	for (const item of Object.values(state.cart)) {
		const row = document.createElement('div');
		row.className = 'flex gap-3 border border-gray-200 rounded-lg p-3';
		row.innerHTML = `
			<img src="${item.image}" alt="${item.name}" class="w-20 h-20 object-cover rounded" />
			<div class="flex-1">
				<p class="text-sm font-semibold">${item.name}</p>
				<p class="text-xs text-gray-500">${item.category}</p>
				<div class="flex items-center gap-2 mt-2">
					<button class="qty-dec px-2 h-7 border rounded" data-id="${item.id}">-</button>
					<input class="qty-input w-12 h-7 text-center border rounded" data-id="${item.id}" type="number" min="1" value="${item.quantity}" />
					<button class="qty-inc px-2 h-7 border rounded" data-id="${item.id}">+</button>
					<span class="ml-auto font-medium">${formatCurrency(item.price * item.quantity)}</span>
				</div>
				<button class="remove-item text-xs text-red-600 mt-1" data-id="${item.id}">Remove</button>
			</div>
		`;
		itemsWrap.appendChild(row);
	}

	const { subtotal, tax, total } = getCartTotals();
	document.getElementById('cartSubtotal').textContent = formatCurrency(subtotal);
	document.getElementById('cartTax').textContent = formatCurrency(tax);
	document.getElementById('cartTotal').textContent = formatCurrency(total);
	document.getElementById('cartCount').textContent = String(getCartCount());

	// events
	itemsWrap.querySelectorAll('.qty-dec').forEach(btn => btn.addEventListener('click', () => changeQty(btn.dataset.id, -1)));
	itemsWrap.querySelectorAll('.qty-inc').forEach(btn => btn.addEventListener('click', () => changeQty(btn.dataset.id, +1)));
	itemsWrap.querySelectorAll('.qty-input').forEach(inp => inp.addEventListener('change', () => setQty(inp.dataset.id, Number(inp.value))));
	itemsWrap.querySelectorAll('.remove-item').forEach(btn => btn.addEventListener('click', () => removeFromCart(btn.dataset.id)));
}

// Cart operations
function addToCart(productId, qty = 1) {
	const product = state.products.find(p => p.id === productId);
	if (!product) return;
	const existing = state.cart[productId];
	if (existing) existing.quantity += qty;
	else state.cart[productId] = { id: product.id, name: product.name, price: product.price, image: product.image, category: product.category, quantity: qty };
	saveCart();
	renderCart();
}

function changeQty(productId, delta) {
	const item = state.cart[productId];
	if (!item) return;
	item.quantity = Math.max(1, item.quantity + delta);
	saveCart();
	renderCart();
}

function setQty(productId, qty) {
	const item = state.cart[productId];
	if (!item) return;
	item.quantity = Math.max(1, Number.isFinite(qty) ? qty : 1);
	saveCart();
	renderCart();
}

function removeFromCart(productId) {
	delete state.cart[productId];
	saveCart();
	renderCart();
}

// Product modal
let currentModalProduct = null;
function openProductModal(productId) {
	const p = state.products.find(x => x.id === productId);
	if (!p) return;
	currentModalProduct = p;
	document.getElementById('modalTitle').textContent = p.name;
	document.getElementById('modalName').textContent = p.name;
	document.getElementById('modalCategory').textContent = p.category;
	document.getElementById('modalImage').src = p.image;
	document.getElementById('modalPrice').textContent = formatCurrency(p.price);
	document.getElementById('modalRating').textContent = `★ ${p.rating.toFixed(1)}`;
	document.getElementById('modalReviews').textContent = `(${p.reviews} reviews)`;
	document.getElementById('modalDesc').textContent = p.description;
	document.getElementById('productModal').classList.remove('hidden');
	document.getElementById('productModal').classList.add('modal-show');
}

function closeProductModal() {
	currentModalProduct = null;
	document.getElementById('productModal').classList.add('hidden');
	document.getElementById('productModal').classList.remove('modal-show');
}

// Auth
let authMode = 'signin'; // or 'signup'
function openAuthModal(mode = 'signin') {
	authMode = mode;
	document.getElementById('authModalTitle').textContent = mode === 'signin' ? 'Sign In' : 'Create Account';
	document.getElementById('switchToSigninWrap').classList.toggle('hidden', mode === 'signin');
	document.getElementById('authModal').classList.remove('hidden');
	document.getElementById('authModal').classList.add('modal-show');
	const error = document.getElementById('authError');
	error.classList.add('hidden');
	error.textContent = '';
}

function closeAuthModal() {
	document.getElementById('authModal').classList.add('hidden');
	document.getElementById('authModal').classList.remove('modal-show');
}

function updateAuthButton() {
	const btn = document.getElementById('authBtn');
	const helloLine = document.getElementById('authHello');
	if (!btn || !helloLine) return; // Fail gracefully if element not found

	if (state.user) {
		helloLine.textContent = `Hello, ${state.user.email.split('@')[0]}`;
		btn.title = 'Click to Sign out';
	} else {
		helloLine.textContent = 'Hello, Sign in';
		btn.title = 'Sign in or Create account';
	}
}

// Event bindings & init
document.addEventListener('DOMContentLoaded', () => {
	// Filters
	renderFilters();
	applyFilters();

	// Search (desktop+mobile)
	const linkInputs = [document.getElementById('searchInput'), document.getElementById('searchInputMobile')].filter(Boolean);
	linkInputs.forEach(inp => inp.addEventListener('input', () => {
		state.filters.search = inp.value.trim();
		applyFilters();
		linkInputs.forEach(o => { if (o !== inp) o.value = inp.value; });
	}));

	// Filter controls
	document.getElementById('filterCategory').addEventListener('change', (e) => { state.filters.category = e.target.value; });
	document.getElementById('minPrice').addEventListener('input', (e) => { state.filters.minPrice = e.target.value; });
	document.getElementById('maxPrice').addEventListener('input', (e) => { state.filters.maxPrice = e.target.value; });
	document.getElementById('sortBy').addEventListener('change', (e) => { state.filters.sortBy = e.target.value; });
	document.getElementById('applyFiltersBtn').addEventListener('click', applyFilters);
	document.getElementById('clearFiltersBtn').addEventListener('click', () => {
		state.filters = { search: '', category: 'all', minPrice: '', maxPrice: '', sortBy: 'relevance' };
		document.getElementById('searchInput') && (document.getElementById('searchInput').value = '');
		document.getElementById('searchInputMobile') && (document.getElementById('searchInputMobile').value = '');
		renderFilters();
		applyFilters();
	});

	// Product modal events
	document.getElementById('closeProductModal').addEventListener('click', closeProductModal);
	document.getElementById('productModal').addEventListener('click', (e) => { if (e.target.id === 'productModal') closeProductModal(); });
	document.getElementById('modalAddToCart').addEventListener('click', () => { if (currentModalProduct) addToCart(currentModalProduct.id, 1); });
	document.getElementById('modalBuyNow').addEventListener('click', () => {
		if (currentModalProduct) addToCart(currentModalProduct.id, 1);
		openCart();
		closeProductModal();
	});

	// Cart drawer
	document.getElementById('cartBtn').addEventListener('click', openCart);
	document.getElementById('closeCart').addEventListener('click', closeCart);
	function openCart() { document.getElementById('cartDrawer').classList.add('drawer-open'); }
	function closeCart() { document.getElementById('cartDrawer').classList.remove('drawer-open'); }
	// Export for modal buy now
	window.openCart = openCart;

	// Auth modal
	const authBtn = document.getElementById('authBtn');
	authBtn.addEventListener('click', () => {
		if (state.user) {
			// sign out
			state.user = null;
			saveUser(null);
			updateAuthButton();
		} else {
			openAuthModal('signin');
		}
	});
	document.getElementById('closeAuthModal').addEventListener('click', closeAuthModal);
	document.getElementById('switchToSignup').addEventListener('click', () => openAuthModal('signup'));
	document.getElementById('switchToSignin')?.addEventListener('click', () => openAuthModal('signin'));

	// Auth form handling
	document.getElementById('authForm').addEventListener('submit', (e) => {
		e.preventDefault();
		const email = document.getElementById('email').value.trim().toLowerCase();
		const password = document.getElementById('password').value;
		const error = document.getElementById('authError');
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			error.textContent = 'Please enter a valid email address.';
			error.classList.remove('hidden');
			return;
		}
		if (password.length < 6) {
			error.textContent = 'Password must be at least 6 characters.';
			error.classList.remove('hidden');
			return;
		}
		const users = JSON.parse(localStorage.getItem('users') || '{}');
		if (authMode === 'signup') {
			if (users[email]) {
				error.textContent = 'Account already exists. Please sign in.';
				error.classList.remove('hidden');
				return;
			}
			users[email] = { email, passwordHash: simpleHash(password) };
			localStorage.setItem('users', JSON.stringify(users));
			state.user = { email };
			saveUser(state.user);
			closeAuthModal();
			updateAuthButton();
			return;
		}
		// signin
		if (!users[email] || users[email].passwordHash !== simpleHash(password)) {
			error.textContent = 'Invalid email or password.';
			error.classList.remove('hidden');
			return;
		}
		state.user = { email };
		saveUser(state.user);
		closeAuthModal();
		updateAuthButton();
	});

	updateAuthButton();
	renderCart();
});

// Simple non-cryptographic hash for demo only
function simpleHash(str) {
	let h = 0;
	for (let i = 0; i < str.length; i++) {
		h = (h << 5) - h + str.charCodeAt(i);
		h |= 0;
	}
	return String(h);
}